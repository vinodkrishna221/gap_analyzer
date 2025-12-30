import { NextRequest, NextResponse } from 'next/server';
import { generateCareers } from '@/lib/openrouter';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const keyword = searchParams.get('keyword');

        if (!keyword || keyword.trim().length < 2) {
            return NextResponse.json(
                { success: false, error: 'Please provide a search keyword (industry or job type)' },
                { status: 400 }
            );
        }

        // Generate careers using AI based on the industry/keyword
        const careers = await generateCareers(keyword);

        if (careers.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Could not generate careers. Please try a different search term.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                keyword,
                careers
            }
        });

    } catch (error) {
        console.error('Career search error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
