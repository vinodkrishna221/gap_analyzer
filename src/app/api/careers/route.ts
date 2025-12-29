import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Career } from '@/lib/db/models/Career';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const industry = searchParams.get('industry');

        const query = industry ? { industryId: industry } : {};

        const careers = await Career.find(query)
            .sort({ demandScore: -1 })
            .limit(50);

        return NextResponse.json({
            success: true,
            data: { careers }
        });

    } catch (error) {
        console.error('Careers fetch error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
