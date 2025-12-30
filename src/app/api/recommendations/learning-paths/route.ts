import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { LearningResource } from '@/lib/db/models/LearningResource';
import { generateBatchLearningStrategies } from '@/lib/openrouter';
import { getOrSet, generateCacheKey } from '@/lib/cache';
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

        // OPTIMIZATION: Parallel DB queries for all skills at once
        const resourceQueries = missingSkills.map((skill: string) =>
            LearningResource.find({ skillName: skill })
                .sort({ rating: -1, reviewCount: -1 })
                .limit(5)
                .lean() // Faster read-only queries
        );

        const allResources = await Promise.all(resourceQueries);

        // OPTIMIZATION: Cache AI strategies
        const cacheKey = generateCacheKey('learning-strategies', session.user.id,
            missingSkills.sort().join(','));

        const strategyMap = await getOrSet(cacheKey, async () => {
            // OPTIMIZATION: Single batched AI call instead of N sequential calls
            return await generateBatchLearningStrategies(missingSkills);
        }, 'medium');

        // Build learning paths
        const learningPaths = missingSkills.map((skill: string, index: number) => {
            const resources = allResources[index] || [];

            return {
                skill,
                strategy: strategyMap.get(skill) || `Focus on building strong fundamentals in ${skill}.`,
                resources: resources.map((r: any) => ({
                    title: r.title,
                    provider: r.provider,
                    url: r.url,
                    type: r.type,
                    difficulty: r.difficulty,
                    duration: r.duration,
                    isFree: r.cost?.isFree ?? true,
                    rating: r.rating
                }))
            };
        });

        return NextResponse.json({
            success: true,
            data: { learningPaths }
        });

    } catch (error) {
        console.error('Learning path error:', error);
        return NextResponse.json({ success: false, error: 'Failed to generate learning paths' }, { status: 500 });
    }
}
