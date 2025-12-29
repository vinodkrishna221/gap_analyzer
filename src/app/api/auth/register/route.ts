import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models/User';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { email, password, name, education } = await req.json();

        // Validation
        if (!email || !password || !name) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            email,
            passwordHash,
            profile: { name, education }
        });

        return NextResponse.json({
            success: true,
            data: { userId: user._id, email: user.email },
            message: 'Registration successful'
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
