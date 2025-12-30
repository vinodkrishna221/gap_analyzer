import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { Career } from '@/lib/db/models/Career';
import { CareerSkill } from '@/lib/db/models/CareerSkill';
import { Analysis } from '@/lib/db/models/Analysis';
import { batchAnalyzeSkillGaps } from '@/lib/openrouter';
import { getOrSet, generateCacheKey } from '@/lib/cache';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { careerIds, aiCareers } = body;

        await connectDB();

        // Fetch user skills
        const userSkillsDoc = await UserSkill.findOne({ userId: session.user.id }).lean();
        if (!userSkillsDoc || userSkillsDoc.skills.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No skills found. Please add skills in your profile first.'
            }, { status: 400 });
        }

        const userSkills = userSkillsDoc.skills;
        const analyses: any[] = [];
        const careersToAnalyze: { name: string; requiredSkills: any[] }[] = [];

        // Handle AI-generated careers
        if (aiCareers && Array.isArray(aiCareers) && aiCareers.length > 0) {
            for (const career of aiCareers.slice(0, 5)) {
                const requiredSkills = career.requiredSkills || [];
                const analysis = calculateSkillMatch(userSkills, requiredSkills);

                careersToAnalyze.push({ name: career.title, requiredSkills });

                analyses.push({
                    careerId: career.id,
                    careerName: career.title,
                    matchScore: analysis.matchScore,
                    matchingSkills: analysis.matchingSkills,
                    missingSkills: analysis.missingSkills,
                    partialSkills: analysis.partialSkills,
                    aiInsights: '', // Will be filled after batch call
                    salaryRange: career.salaryRange,
                    growthOutlook: career.growthOutlook,
                    isAiCareer: true
                });
            }
        }

        // Handle database careers
        if (careerIds && Array.isArray(careerIds) && careerIds.length > 0) {
            // OPTIMIZATION: Parallel DB queries
            const [careers, careerSkillsDocs] = await Promise.all([
                Career.find({ _id: { $in: careerIds.slice(0, 5) } }).lean(),
                CareerSkill.find({ careerId: { $in: careerIds.slice(0, 5) } }).lean()
            ]);

            for (const career of careers) {
                const careerSkillsDoc = careerSkillsDocs.find(
                    (cs: any) => cs.careerId.toString() === career._id.toString()
                );
                if (!careerSkillsDoc) continue;

                const requiredSkills = careerSkillsDoc.requiredSkills;
                const analysis = calculateSkillMatch(userSkills, requiredSkills);

                careersToAnalyze.push({ name: career.title, requiredSkills });

                analyses.push({
                    careerId: career._id,
                    careerName: career.title,
                    matchScore: analysis.matchScore,
                    matchingSkills: analysis.matchingSkills,
                    missingSkills: analysis.missingSkills,
                    partialSkills: analysis.partialSkills,
                    aiInsights: '',
                    isDbCareer: true
                });
            }
        }

        if (analyses.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No careers provided for analysis'
            }, { status: 400 });
        }

        // OPTIMIZATION: Single batched AI call for all careers
        const cacheKey = generateCacheKey('skill-gap-analysis', session.user.id,
            careersToAnalyze.map(c => c.name).join(','));

        const insightsMap = await getOrSet(cacheKey, async () => {
            return await batchAnalyzeSkillGaps(userSkills, careersToAnalyze);
        }, 'medium');

        // Apply insights to analyses
        for (const analysis of analyses) {
            analysis.aiInsights = insightsMap.get(analysis.careerName) ||
                "Analysis based on your current skill profile.";

            // Save to database for DB careers only
            if (analysis.isDbCareer) {
                await Analysis.create({
                    userId: session.user.id,
                    targetCareerId: analysis.careerId,
                    targetCareerName: analysis.careerName,
                    results: {
                        matchScore: analysis.matchScore,
                        matchingSkills: analysis.matchingSkills,
                        missingSkills: analysis.missingSkills,
                        partialSkills: analysis.partialSkills
                    },
                    aiInsights: analysis.aiInsights
                });
            }

            // Clean up internal flags
            delete analysis.isAiCareer;
            delete analysis.isDbCareer;
        }

        return NextResponse.json({
            success: true,
            data: { analyses }
        });

    } catch (error) {
        console.error('Skill gap analysis error:', error);
        return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 });
    }
}

// Helper function to calculate skill match
function calculateSkillMatch(userSkills: any[], requiredSkills: any[]) {
    const proficiencyScores: { [key: string]: number } = {
        'Beginner': 25,
        'Intermediate': 50,
        'Advanced': 75,
        'Expert': 100
    };

    const matchingSkills: any[] = [];
    const missingSkills: any[] = [];
    const partialSkills: any[] = [];

    let totalWeight = 0;
    let achievedWeight = 0;

    requiredSkills.forEach((required) => {
        const userSkill = userSkills.find((s: any) => s.skillName === required.skillName);
        const weight = required.weight || 5;
        totalWeight += weight;

        if (!userSkill) {
            missingSkills.push({
                skillName: required.skillName,
                importance: required.importance,
                requiredProficiency: required.minimumProficiency
            });
        } else {
            const userLevel = proficiencyScores[userSkill.proficiencyLevel] || 0;
            const requiredLevel = proficiencyScores[required.minimumProficiency] || 50;

            if (userLevel >= requiredLevel) {
                matchingSkills.push({
                    skillName: required.skillName,
                    userProficiency: userSkill.proficiencyLevel,
                    requiredProficiency: required.minimumProficiency
                });
                achievedWeight += weight;
            } else {
                partialSkills.push({
                    skillName: required.skillName,
                    userProficiency: userSkill.proficiencyLevel,
                    requiredProficiency: required.minimumProficiency,
                    gap: `Need to improve from ${userSkill.proficiencyLevel} to ${required.minimumProficiency}`
                });
                achievedWeight += (userLevel / requiredLevel) * weight;
            }
        }
    });

    const matchScore = totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 0;

    return {
        matchScore,
        matchingSkills,
        missingSkills,
        partialSkills
    };
}
