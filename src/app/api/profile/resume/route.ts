import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/lib/db/models/User';
import { analyzeResume } from '@/lib/openrouter';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// POST: Upload and analyze resume
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('resume') as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { success: false, error: 'Only PDF files are allowed' },
                { status: 400 }
            );
        }

        // Convert File to ArrayBuffer for pdfjs
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Extract text from PDF using pdfjs-dist
        let textContent = '';
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pdf = await (pdfjsLib as any).getDocument({ data: uint8Array }).promise;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const pageText = content.items
                    .filter((item: { str?: string }) => 'str' in item)
                    .map((item: { str: string }) => item.str)
                    .join(' ');
                textContent += pageText + '\n';
            }
        } catch (pdfError) {
            console.error('PDF parsing error:', pdfError);
            return NextResponse.json(
                { success: false, error: 'Failed to parse PDF. Please ensure it contains readable text.' },
                { status: 400 }
            );
        }

        if (!textContent || textContent.trim().length < 50) {
            return NextResponse.json(
                { success: false, error: 'Could not extract sufficient text from PDF. Please upload a text-based PDF.' },
                { status: 400 }
            );
        }

        // Analyze resume with AI
        const aiAnalysis = await analyzeResume(textContent);

        // Save to database
        await connectDB();
        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                $set: {
                    'profile.resume': {
                        fileName: file.name,
                        uploadedAt: new Date(),
                        textContent: textContent.slice(0, 10000), // Limit stored text
                        aiAnalysis: aiAnalysis
                    },
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            data: {
                fileName: file.name,
                analysis: aiAnalysis
            },
            message: 'Resume uploaded and analyzed successfully'
        });

    } catch (error) {
        console.error('Resume upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET: Get current resume analysis
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email }).select('profile.resume');

        if (!user?.profile?.resume) {
            return NextResponse.json({
                success: true,
                data: null,
                message: 'No resume uploaded yet'
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                fileName: user.profile.resume.fileName,
                uploadedAt: user.profile.resume.uploadedAt,
                analysis: user.profile.resume.aiAnalysis
            }
        });

    } catch (error) {
        console.error('Resume fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
