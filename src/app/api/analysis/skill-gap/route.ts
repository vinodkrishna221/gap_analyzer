import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { Career } from '@/lib/db/models/Career';
import { CareerSkill } from '@/lib/db/models/CareerSkill';
import { Analysis } from '@/lib/db/models/Analysis';
import { analyzeSkillGap } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { careerIds } = await req.json(); // Array of career IDs to analyze

        await connectDB();

        // Fetch user skills
        const userSkillsDoc = await UserSkill.findOne({ userId: session.user.id });
        if (!userSkillsDoc || userSkillsDoc.skills.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No skills found. Please add skills in your profile first.'
            }, { status: 400 });
        }

        const userSkills = userSkillsDoc.skills;

        // Analyze each career
        const analyses = [];

        for (const careerId of careerIds.slice(0, 5)) { // Limit to 5 careers
            const career = await Career.findById(careerId);
            if (!career) continue;

            const careerSkillsDoc = await CareerSkill.findOne({ careerId });
            if (!careerSkillsDoc) continue;

            const requiredSkills = careerSkillsDoc.requiredSkills;

            // Calculate match
            const analysis = calculateSkillMatch(userSkills, requiredSkills);

            // Get AI insights
            const aiInsights = await analyzeSkillGap(userSkills, requiredSkills, career.title);

            // Save analysis
            const savedAnalysis = await Analysis.create({
                userId: session.user.id,
                targetCareerId: careerId,
                targetCareerName: career.title,
                results: analysis,
                aiInsights
            });

            analyses.push({
                careerId: career._id,
                careerName: career.title,
                matchScore: analysis.matchScore,
                matchingSkills: analysis.matchingSkills,
                missingSkills: analysis.missingSkills,
                partialSkills: analysis.partialSkills,
                aiInsights
            });
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
            // Missing skill
            missingSkills.push({
                skillName: required.skillName,
                importance: required.importance,
                requiredProficiency: required.minimumProficiency
            });
        } else {
            const userLevel = proficiencyScores[userSkill.proficiencyLevel];
            const requiredLevel = proficiencyScores[required.minimumProficiency];

            if (userLevel >= requiredLevel) {
                // Matching skill
                matchingSkills.push({
                    skillName: required.skillName,
                    userProficiency: userSkill.proficiencyLevel,
                    requiredProficiency: required.minimumProficiency
                });
                achievedWeight += weight;
            } else {
                // Partial skill
                partialSkills.push({
                    skillName: required.skillName,
                    userProficiency: userSkill.proficiencyLevel,
                    requiredProficiency: required.minimumProficiency,
                    gap: `Need to improve from ${userSkill.proficiencyLevel} to ${required.minimumProficiency}`
                });
                achievedWeight += (userLevel / requiredLevel) * weight; // Partial credit
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
