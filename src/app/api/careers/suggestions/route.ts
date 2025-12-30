import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { suggestCareersForUser } from '@/lib/openrouter';
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
        const userSkillsDoc = await UserSkill.findOne({ userId: session.user.id });

        if (!userSkillsDoc || userSkillsDoc.skills.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No skills found. Please add your skills in your profile first.',
                needsSkills: true
            }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const interests = searchParams.get('interests') || undefined;

        // Generate personalized career suggestions
        const careers = await suggestCareersForUser(userSkillsDoc.skills, interests);

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
