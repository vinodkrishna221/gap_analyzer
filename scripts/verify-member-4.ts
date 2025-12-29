import { existsSync } from 'fs';
import { resolve } from 'path';

const filesToCheck = [
    'src/lib/db/models/Career.ts',
    'src/lib/db/models/LearningResource.ts',
    'src/lib/db/seeds/careers.ts',
    'src/lib/db/seeds/resources.ts',
    'src/app/api/careers/route.ts',
    'src/app/api/recommendations/careers/route.ts',
    'src/app/api/recommendations/learning-paths/route.ts',
    'src/lib/openrouter.ts',
    'src/app/recommendations/page.tsx',
    'src/components/ui/button.tsx',
    'src/components/ui/card.tsx',
    'src/components/ui/badge.tsx',
    'src/components/ui/progress.tsx',
    'src/lib/utils.ts'
];

console.log('Verifying Member 4 Components...');

let allExists = true;

for (const file of filesToCheck) {
    const path = resolve(process.cwd(), file);
    if (existsSync(path)) {
        console.log(`✅ Found: ${file}`);
    } else {
        console.error(`❌ Missing: ${file}`);
        allExists = false;
    }
}

if (allExists) {
    console.log('\nAll required files for Member 4 are present.');
    console.log('Verification Passed!');
    process.exit(0);
} else {
    console.error('\nVerification Failed: Missing files.');
    process.exit(1);
}
