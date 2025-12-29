import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models/User';
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
        const user = await User.findById(session.user.id).select('-passwordHash');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { profile: user.profile, email: user.email }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name, education } = await req.json();

        await connectDB();
        const user = await User.findByIdAndUpdate(
            session.user.id,
            {
                $set: {
                    'profile.name': name,
                    'profile.education': education,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            data: { profile: user.profile },
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
