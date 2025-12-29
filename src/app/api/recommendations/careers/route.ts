import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { Career } from '@/lib/db/models/Career';
import { CareerSkill } from '@/lib/db/models/CareerSkill';
import { openrouter, AI_MODELS } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Fetch user data
        const userSkillsDoc = await UserSkill.findOne({ userId: session.user.id });
        if (!userSkillsDoc) {
            return NextResponse.json({
                success: false,
                error: 'No skills found. Please add skills first.'
            }, { status: 400 });
        }

        const userSkills = userSkillsDoc.skills.map((s: any) => s.skillName);
        const interests = userSkillsDoc.interests;

        // Fetch all careers with their required skills
        const allCareers = await Career.find().limit(50);
        const careerSkills = await CareerSkill.find();

        // Calculate match scores for all careers
        const careerMatches = allCareers.map(career => {
            const skillsDoc = careerSkills.find(cs => cs.careerId.toString() === career._id.toString());
            if (!skillsDoc) return null;

            const requiredSkills = skillsDoc.requiredSkills.map((s: any) => s.skillName);
            const matchingSkills = userSkills.filter((s: string) => requiredSkills.includes(s));
            const matchScore = (matchingSkills.length / requiredSkills.length) * 100;

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

        // Generate AI reasoning for top matches
        const recommendations = await Promise.all(
            topMatches.map(async (match: any) => {
                const reasoning = await generateCareerReasoning(
                    match.career.title,
                    userSkills,
                    interests,
                    match.matchScore
                );

                return {
                    careerId: match.career._id,
                    careerName: match.career.title,
                    description: match.career.description,
                    matchScore: match.matchScore,
                    salaryRange: match.career.salaryData?.entryLevel || null,
                    growthOutlook: match.career.growthOutlook,
                    matchingSkills: match.matchingSkills.slice(0, 3),
                    missingSkills: match.missingSkills.slice(0, 3),
                    reasoning
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: { recommendations }
        });

    } catch (error) {
        console.error('Career recommendation error:', error);
        return NextResponse.json({ success: false, error: 'Recommendation failed' }, { status: 500 });
    }
}

async function generateCareerReasoning(
    careerName: string,
    userSkills: string[],
    interests: string[],
    matchScore: number
): Promise<string> {
    const prompt = `
You are a career advisor. Explain in 2-3 sentences why "${careerName}" is a good match for someone with:
- Skills: ${userSkills.join(', ')}
- Interests: ${interests.join(', ')}
- Match Score: ${matchScore}%

Be encouraging and specific about skill alignment.
`;

    try {
        const response = await openrouter.chat.completions.create({
            model: AI_MODELS.primary,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 150
        });

        return response.choices[0].message.content || "Great career match based on your skills!";
    } catch (error) {
        return "This career aligns well with your current skill set.";
    }
}
