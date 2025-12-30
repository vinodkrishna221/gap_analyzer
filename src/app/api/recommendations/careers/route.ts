import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { Career } from '@/lib/db/models/Career';
import { CareerSkill } from '@/lib/db/models/CareerSkill';
import { generateBatchCareerReasoning } from '@/lib/openrouter';
import { getOrSet, generateCacheKey } from '@/lib/cache';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // OPTIMIZATION: Parallel DB queries instead of sequential
        const [userSkillsDoc, allCareers, careerSkills] = await Promise.all([
            UserSkill.findOne({ userId: session.user.id }),
            Career.find().limit(50).lean(), // .lean() for faster read-only queries
            CareerSkill.find().lean()
        ]);

        if (!userSkillsDoc) {
            return NextResponse.json({
                success: false,
                error: 'No skills found. Please add skills first.'
            }, { status: 400 });
        }

        const userSkills = userSkillsDoc.skills.map((s: any) => s.skillName);
        const interests = userSkillsDoc.interests || [];

        // Calculate match scores for all careers
        const careerMatches = allCareers.map(career => {
            const skillsDoc = careerSkills.find(cs => cs.careerId.toString() === career._id.toString());
            if (!skillsDoc) return null;

            const requiredSkills = skillsDoc.requiredSkills.map((s: any) => s.skillName);
            const matchingSkills = userSkills.filter((s: string) => requiredSkills.includes(s));
            const matchScore = requiredSkills.length > 0
                ? (matchingSkills.length / requiredSkills.length) * 100
                : 0;

            return {
                career,
                matchScore: Math.round(matchScore),
                matchingSkills,
                missingSkills: requiredSkills.filter((s: string) => !userSkills.includes(s))
            };
        }).filter(Boolean);

        // Sort by match score and get top 5
        const topMatches = careerMatches
            .sort((a: any, b: any) => b.matchScore - a.matchScore)
            .slice(0, 5);

        // OPTIMIZATION: Use cache for AI reasoning
        const cacheKey = generateCacheKey('career-reasoning', session.user.id,
            topMatches.map((m: any) => m.career.title).join(','));

        const reasoningMap = await getOrSet(cacheKey, async () => {
            // OPTIMIZATION: Single batched AI call instead of 5 sequential calls
            return await generateBatchCareerReasoning(
                topMatches.map((m: any) => ({
                    careerName: m.career.title,
                    matchScore: m.matchScore,
                    matchingSkills: m.matchingSkills,
                    missingSkills: m.missingSkills
                })),
                userSkills,
                interests
            );
        }, 'medium');

        // Build recommendations with cached/batched reasoning
        const recommendations = topMatches.map((match: any) => ({
            careerId: match.career._id,
            careerName: match.career.title,
            description: match.career.description,
            matchScore: match.matchScore,
            salaryRange: match.career.salaryData?.entryLevel || null,
            growthOutlook: match.career.growthOutlook,
            matchingSkills: match.matchingSkills.slice(0, 3),
            missingSkills: match.missingSkills.slice(0, 3),
            reasoning: reasoningMap.get(match.career.title) || "Great career match!"
        }));

        return NextResponse.json({
            success: true,
            data: { recommendations }
        });

    } catch (error) {
        console.error('Career recommendation error:', error);
        return NextResponse.json({ success: false, error: 'Recommendation failed' }, { status: 500 });
    }
}
