import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { suggestCareersForUser } from '@/lib/openrouter';
import { getOrSet, generateCacheKey } from '@/lib/cache';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        // Fetch user's skills
        const userSkillsDoc = await UserSkill.findOne({ userId: session.user.id }).lean();

        if (!userSkillsDoc || userSkillsDoc.skills.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No skills found. Please add your skills in your profile first.',
                needsSkills: true
            }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const interests = searchParams.get('interests') || undefined;

        // OPTIMIZATION: Cache career suggestions for 30 minutes
        const skillsHash = userSkillsDoc.skills.map((s: any) => s.skillName).sort().join(',');
        const cacheKey = generateCacheKey('career-suggestions', session.user.id,
            skillsHash + (interests || ''));

        const careers = await getOrSet(cacheKey, async () => {
            return await suggestCareersForUser(userSkillsDoc.skills, interests);
        }, 'medium'); // 30 min cache

        if (careers.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Could not generate suggestions. Please try again.'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: {
                careers,
                basedOnSkills: userSkillsDoc.skills.map((s: any) => s.skillName)
            }
        });

    } catch (error) {
        console.error('Career suggestions error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
