import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        let userSkills = await UserSkill.findOne({ userId: session.user.id });

        if (!userSkills) {
            // Create empty skills document if doesn't exist
            userSkills = await UserSkill.create({
                userId: session.user.id,
                skills: [],
                interests: []
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                skills: userSkills.skills,
                interests: userSkills.interests
            }
        });

    } catch (error) {
        console.error('Skills fetch error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { skills, interests } = await req.json();

        await connectDB();

        const proficiencyMap = {
            'Beginner': 25,
            'Intermediate': 50,
            'Advanced': 75,
            'Expert': 100
        };

        const processedSkills = skills.map((skill: any) => ({
            skillId: skill.skillId,
            skillName: skill.skillName,
            proficiencyLevel: skill.proficiencyLevel,
            proficiencyScore: proficiencyMap[skill.proficiencyLevel as keyof typeof proficiencyMap],
            addedDate: skill.addedDate || new Date()
        }));

        const userSkills = await UserSkill.findOneAndUpdate(
            { userId: session.user.id },
            {
                $set: {
                    skills: processedSkills,
                    interests: interests || [],
                    updatedAt: new Date()
                }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            data: { skills: userSkills.skills, interests: userSkills.interests },
            message: 'Skills updated successfully'
        });

    } catch (error) {
        console.error('Skills update error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
