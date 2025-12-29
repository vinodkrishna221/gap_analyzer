import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Skill } from '@/lib/db/models/Skill';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || '';

        await connectDB();
        const skills = await Skill.find({
            name: { $regex: query, $options: 'i' }
        })
            .sort({ demandScore: -1 })
            .limit(20)
            .select('_id name category subcategory');

        return NextResponse.json({
            success: true,
            data: { skills }
        });

    } catch (error) {
        console.error('Skills search error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
