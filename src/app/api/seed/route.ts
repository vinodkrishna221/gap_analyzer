import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Skill } from '@/lib/db/models/Skill';
import { initialSkills } from '@/lib/db/seeds/skills';
import { Career } from '@/lib/db/models/Career';
import { CareerSkill } from '@/lib/db/models/CareerSkill';
import { initialCareers } from '@/lib/db/seeds/careers';

export async function GET() {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    try {
        await connectDB();

        // Clear existing data
        await Promise.all([
            Skill.deleteMany({}),
            Career.deleteMany({}),
            CareerSkill.deleteMany({})
        ]);

        // Insert Skills
        await Skill.insertMany(initialSkills);

        // Insert Careers and CareerSkills
        for (const careerData of initialCareers) {
            const career = await Career.create({
                title: careerData.title,
                description: careerData.description,
                salaryRange: careerData.salaryRange,
                outlook: careerData.outlook
            });

            await CareerSkill.create({
                careerId: career._id,
                requiredSkills: careerData.skills
            });
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${initialSkills.length} skills and ${initialCareers.length} careers successfully`
        });
    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({ success: false, error: 'Seeding failed' }, { status: 500 });
    }
}
