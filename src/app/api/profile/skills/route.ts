import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { User } from '@/lib/db/models/User';

// GET: Fetch user skills
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        // Resolve UserId from email
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        let userSkills = await UserSkill.findOne({ userId: user._id });

        if (!userSkills) {
            // Create empty skills document if doesn't exist
            userSkills = await UserSkill.create({
                userId: user._id,
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

// POST: Add or update skills
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { skills, interests } = await req.json();

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Convert proficiency level to score
        const proficiencyMap: Record<string, number> = {
            'Beginner': 25,
            'Intermediate': 50,
            'Advanced': 75,
            'Expert': 100
        };

        const processedSkills = skills.map((skill: any) => ({
            skillId: skill.skillId,
            skillName: skill.skillName,
            proficiencyLevel: skill.proficiencyLevel,
            proficiencyScore: proficiencyMap[skill.proficiencyLevel as string] || 0,
            addedDate: new Date()
        }));

        const userSkills = await UserSkill.findOneAndUpdate(
            { userId: user._id },
            {
                $set: {
                    skills: processedSkills,
                    interests: interests,
                    updatedAt: new Date()
                }
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({
            success: true,
            data: {
                skills: userSkills.skills,
                interests: userSkills.interests
            },
            message: 'Skills updated successfully'
        });

    } catch (error) {
        console.error('Skills update error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
