
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { connectDB } from '../lib/db/connection';
import { Career } from '../lib/db/models/Career';
import { Skill } from '../lib/db/models/Skill';
import { LearningResource } from '../lib/db/models/LearningResource';
import { careers } from '../lib/db/seeds/careers';
import { initialSkills } from '../lib/db/seeds/skills';
import { resources } from '../lib/db/seeds/resources';
import { CareerSkill } from '../lib/db/models/CareerSkill';

// Load env vars
dotenv.config({ path: '.env.local' });

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('Connected!');

        console.log('Clearing existing data...');
        await Promise.all([
            Career.deleteMany({}),
            Skill.deleteMany({}),
            LearningResource.deleteMany({}),
            CareerSkill.deleteMany({})
        ]);

        console.log('Seeding Skills...');
        const createdSkills = await Skill.create(initialSkills);
        console.log(`Created ${createdSkills.length} skills`);

        console.log('Seeding Careers...');
        const createdCareers = await Career.create(careers);
        console.log(`Created ${createdCareers.length} careers`);

        console.log('Seeding Learning Resources...');
        await LearningResource.create(resources);
        console.log(`Created ${resources.length} learning resources`);

        // Create CareerSkills (linking careers to skills)
        // This logic mimics what might be needed for the relationship
        // For now we will create some dummy relationships based on the seed data
        console.log('Linking Careers and Skills...');

        for (const career of createdCareers) {
            // Find relevant skills for this career based on title or description keywords?
            // Or just random for now?
            // Actually, the recommendation logic depends on this. 
            // Let's assign some relevant skills manually or semi-intelligently.

            // For simplicity in this seed, let's assign a subset of skills to each career
            // In a real app, this mapping should be in the seeds/careers.ts or a separate file.

            let relevantSkills = [];
            if (career.title.includes('Full Stack')) {
                relevantSkills = createdSkills.filter(s => ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'].includes(s.name));
            } else if (career.title.includes('Data')) {
                relevantSkills = createdSkills.filter(s => ['Python', 'SQL', 'Machine Learning', 'Problem Solving'].includes(s.name));
            } else if (career.title.includes('DevOps')) {
                relevantSkills = createdSkills.filter(s => ['Docker', 'Git', 'Python', 'Communication'].includes(s.name));
            } else if (career.title.includes('Designer')) {
                relevantSkills = createdSkills.filter(s => ['Communication', 'Problem Solving'].includes(s.name));
                // We might need design skills in seeds/skills.ts
            } else {
                relevantSkills = createdSkills.slice(0, 5); // Fallback
            }

            if (relevantSkills.length > 0) {
                await CareerSkill.create({
                    careerId: career._id,
                    requiredSkills: relevantSkills.map(s => ({
                        skillId: s._id,
                        skillName: s.name,
                        importance: 'Critical',
                        minimumProficiency: 'Intermediate',
                        weight: 5
                    }))
                });
            }
        }
        console.log('Linked Careers and Skills');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
