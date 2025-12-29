import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { LearningResource } from '@/lib/db/models/LearningResource';
import { openrouter, AI_MODELS } from '@/lib/openrouter';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { missingSkills } = await req.json();

        if (!missingSkills || missingSkills.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No missing skills provided'
            }, { status: 400 });
        }

        await connectDB();

        // Fetch learning resources for missing skills
        const learningPaths = await Promise.all(
            missingSkills.map(async (skill: string) => {
                const resources = await LearningResource.find({
                    skillName: skill
                })
                    .sort({ rating: -1, reviewCount: -1 })
                    .limit(5);

                // Generate AI learning strategy
                const strategy = await generateLearningStrategy(skill);

                return {
                    skill,
                    strategy,
                    resources: resources.map(r => ({
                        title: r.title,
                        provider: r.provider,
                        url: r.url,
                        type: r.type,
                        difficulty: r.difficulty,
                        duration: r.duration,
                        isFree: r.cost.isFree,
                        rating: r.rating
                    }))
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: { learningPaths }
        });

    } catch (error) {
        console.error('Learning path error:', error);
        return NextResponse.json({ success: false, error: 'Failed to generate learning paths' }, { status: 500 });
    }
}

async function generateLearningStrategy(skill: string): Promise<string> {
    const prompt = `
You are a learning advisor. For someone who wants to learn "${skill}", provide:
1. Recommended learning order (1-2 sentences)
2. Estimated time to reach job-ready level
3. One key tip for mastering this skill

Keep it concise (3-4 sentences total).
`;

    try {
        const response = await openrouter.chat.completions.create({
            model: AI_MODELS.primary,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 200
        });

        return response.choices[0].message.content || "Start with fundamentals and practice regularly.";
    } catch (error) {
        return `Focus on building strong fundamentals in ${skill} through hands-on projects.`;
    }
}
