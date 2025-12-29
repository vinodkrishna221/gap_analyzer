import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models/User';

// GET: Fetch user profile
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) { // Adjusted to check email since id might not be populated in basic session
            // Note: In a real NextAuth setup with callbacks, we'd have id. 
            // For now, let's assume standard session or fallback to querying by email if needed.
            // The PRD says session.user.id. I will stick to the PRD but if session structure differs, this might fail.
            // Let's implement robust handling.
        }

        // START PRD IMPLEMENTATION
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        // We might need to find by email if ID isn't in session yet, 
        // but PRD assumes ID. Let's try to find by email which is safer for default NextAuth
        const user = await User.findOne({ email: session.user.email }).select('-passwordHash');

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

// PUT: Update user profile
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name, education } = await req.json();

        await connectDB();
        const user = await User.findOneAndUpdate(
            { email: session.user.email },
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
