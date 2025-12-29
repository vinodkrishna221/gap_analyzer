import { connectDB } from '../src/lib/db/connection';
import { User } from '../src/lib/db/models/User';
import { Skill } from '../src/lib/db/models/Skill';
import { UserSkill } from '../src/lib/db/models/UserSkill';
import mongoose from 'mongoose';

async function verifyDB() {
    console.log('Connecting to DB...');
    try {
        // Override URI for testing if needed, or rely on .env (loaded by Next.js usually, but here we might need dotenv)
        // For this script, we'll check if we can import logic. 
        // Usually ts-node needs dotenv setup.
        if (!process.env.MONGODB_URI) {
            console.warn('MONGODB_URI not set. Please ensure .env.local is loaded or set env var.');
            // Minimal fallback for local test
            process.env.MONGODB_URI = 'mongodb://localhost:27017/gap_analyzer_test';
        }

        await connectDB();
        console.log('Connected to DB successfully.');

        // 1. Create a Test User
        const testUserEmail = `test_${Date.now()}@example.com`;
        console.log(`Creating test user: ${testUserEmail}`);
        const user = await User.create({
            email: testUserEmail,
            passwordHash: 'hashedpassword123',
            profile: {
                name: 'Test User',
                education: {
                    level: "Bachelor's",
                    institution: 'Test University',
                    fieldOfStudy: 'Computer Science',
                    graduationYear: 2024
                }
            }
        });
        console.log('User created:', user._id);

        // 2. Create a Test Skill
        console.log('Creating test skill...');
        const skillName = `TS-Skill-${Date.now()}`;
        const skill = await Skill.create({
            name: skillName,
            category: 'Technical',
            subcategory: 'Testing',
            demandScore: 50
        });
        console.log('Skill created:', skill._id);

        // 3. Link Skill to User
        console.log('Linking skill to user...');
        const userSkill = await UserSkill.create({
            userId: user._id,
            skills: [{
                skillId: skill._id,
                skillName: skill.name,
                proficiencyLevel: 'Intermediate',
                proficiencyScore: 50
            }],
            interests: ['Testing']
        });
        console.log('UserSkill created:', userSkill._id);

        // Cleanup
        console.log('Cleaning up...');
        await UserSkill.findByIdAndDelete(userSkill._id);
        await Skill.findByIdAndDelete(skill._id);
        await User.findByIdAndDelete(user._id);
        console.log('Cleanup done.');

        console.log('VERIFICATION SUCCESSFUL');
        process.exit(0);
    } catch (error) {
        console.error('VERIFICATION FAILED:', error);
        process.exit(1);
    }
}

verifyDB();
