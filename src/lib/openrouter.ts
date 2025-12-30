import OpenAI from 'openai';

export const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "SkillGap Analyzer",
    }
});

export const AI_MODELS = {
    primary: "mistralai/devstral-2512:free",
    fallback: "anthropic/claude-3-sonnet"
};

// ============================================
// OPTIMIZED: Batched AI Functions
// ============================================

interface CareerMatch {
    careerName: string;
    matchScore: number;
    matchingSkills: string[];
    missingSkills: string[];
}

/**
 * Generate reasoning for multiple careers in a SINGLE AI call
 * Instead of 5 sequential calls (10+ seconds), this does 1 call (~2 seconds)
 */
export async function generateBatchCareerReasoning(
    careers: CareerMatch[],
    userSkills: string[],
    interests: string[]
): Promise<Map<string, string>> {
    const prompt = `
You are a career advisor. For each career below, provide a brief 1-2 sentence explanation of why it matches someone with these skills: ${userSkills.join(', ')}
${interests.length > 0 ? `And interests: ${interests.join(', ')}` : ''}

CAREERS TO ANALYZE:
${careers.map((c, i) => `${i + 1}. ${c.careerName} (${c.matchScore}% match)`).join('\n')}

Respond in JSON format ONLY (no markdown):
{
    "reasoning": {
        "Career Name 1": "Why this career matches...",
        "Career Name 2": "Why this career matches..."
    }
}
`;

    try {
        const response = await openrouter.chat.completions.create({
            model: AI_MODELS.primary,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 400 // Reduced from 150 per career
        });

        const content = response.choices[0].message.content || '{}';
        const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        const reasoningMap = new Map<string, string>();
        if (parsed.reasoning) {
            Object.entries(parsed.reasoning).forEach(([career, reason]) => {
                reasoningMap.set(career, reason as string);
            });
        }

        // Add fallback for any missing careers
        careers.forEach(c => {
            if (!reasoningMap.has(c.careerName)) {
                reasoningMap.set(c.careerName, "Great career match based on your skills!");
            }
        });

        return reasoningMap;
    } catch (error) {
        console.error('Batch reasoning error:', error);
        const fallbackMap = new Map<string, string>();
        careers.forEach(c => {
            fallbackMap.set(c.careerName, "This career aligns well with your skill set.");
        });
        return fallbackMap;
    }
}

/**
 * Generate learning strategies for multiple skills in a SINGLE AI call
 */
export async function generateBatchLearningStrategies(
    skills: string[]
): Promise<Map<string, string>> {
    const prompt = `
You are a learning advisor. For each skill below, provide a brief 2-3 sentence learning strategy including estimated time to job-ready level.

SKILLS:
${skills.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Respond in JSON format ONLY (no markdown):
{
    "strategies": {
        "Skill Name 1": "Learning strategy...",
        "Skill Name 2": "Learning strategy..."
    }
}
`;

    try {
        const response = await openrouter.chat.completions.create({
            model: AI_MODELS.primary,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 500 // Reduced from 200 per skill
        });

        const content = response.choices[0].message.content || '{}';
        const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        const strategyMap = new Map<string, string>();
        if (parsed.strategies) {
            Object.entries(parsed.strategies).forEach(([skill, strategy]) => {
                strategyMap.set(skill, strategy as string);
            });
        }

        // Add fallback for any missing skills
        skills.forEach(s => {
            if (!strategyMap.has(s)) {
                strategyMap.set(s, `Focus on building strong fundamentals in ${s} through hands-on projects.`);
            }
        });

        return strategyMap;
    } catch (error) {
        console.error('Batch learning strategies error:', error);
        const fallbackMap = new Map<string, string>();
        skills.forEach(s => {
            fallbackMap.set(s, `Start with fundamentals and practice ${s} regularly.`);
        });
        return fallbackMap;
    }
}

/**
 * Batch analyze skill gaps for multiple careers
 */
export async function batchAnalyzeSkillGaps(
    userSkills: any[],
    careers: { name: string; requiredSkills: any[] }[]
): Promise<Map<string, string>> {
    const userSkillsSummary = userSkills.map(s => `${s.skillName} (${s.proficiencyLevel})`).join(', ');

    const careerSummaries = careers.map((c, i) =>
        `${i + 1}. ${c.name}: Needs ${c.requiredSkills.map(s => s.skillName).join(', ')}`
    ).join('\n');

    const prompt = `
You are a career guidance AI. Briefly analyze skill gaps for each career.

USER SKILLS: ${userSkillsSummary}

CAREERS:
${careerSummaries}

For each career, provide a 2-3 sentence analysis covering readiness level and key gaps.

Respond in JSON format ONLY (no markdown):
{
    "analyses": {
        "Career Name 1": "Analysis...",
        "Career Name 2": "Analysis..."
    }
}
`;

    try {
        const response = await openrouter.chat.completions.create({
            model: AI_MODELS.primary,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 600 // Reduced from 300 per career
        });

        const content = response.choices[0].message.content || '{}';
        const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        const analysisMap = new Map<string, string>();
        if (parsed.analyses) {
            Object.entries(parsed.analyses).forEach(([career, analysis]) => {
                analysisMap.set(career, analysis as string);
            });
        }

        return analysisMap;
    } catch (error) {
        console.error('Batch skill gap analysis error:', error);
        return new Map();
    }
}

// ============================================
// ORIGINAL FUNCTIONS (Optimized)
// ============================================

export async function analyzeSkillGap(
    userSkills: any[],
    requiredSkills: any[],
    careerName: string
): Promise<string> {
    const prompt = `
Career advisor: Briefly analyze skill gap for "${careerName}".

USER: ${userSkills.map(s => `${s.skillName}(${s.proficiencyLevel})`).join(', ')}
NEEDS: ${requiredSkills.map(s => `${s.skillName}(${s.minimumProficiency})`).join(', ')}

In 2-3 sentences: readiness level, top strength, critical gap, time estimate.
`;

    try {
        const response = await openrouter.chat.completions.create({
            model: AI_MODELS.primary,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 150 // Reduced from 300
        });

        return response.choices[0].message.content || "Analysis unavailable";
    } catch (error) {
        console.error('AI analysis error:', error);
        return "Unable to generate AI insights at this time.";
    }
}

export interface ResumeAnalysis {
    skills: string[];
    experience: string;
    summary: string;
    recommendations: string[];
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    const prompt = `
Extract from this resume (JSON only, no markdown):

${resumeText.slice(0, 4000)}

{
    "skills": ["skill1", "skill2"],
    "experience": "Brief 1-2 sentences",
    "summary": "1-2 sentences",
    "recommendations": ["rec1", "rec2", "rec3"]
}
`;

    try {
        const response = await openrouter.chat.completions.create({
            model: AI_MODELS.primary,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 500 // Reduced from 1000
        });

        const content = response.choices[0].message.content || '{}';
        const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
            skills: parsed.skills || [],
            experience: parsed.experience || "Unable to extract experience",
            summary: parsed.summary || "Unable to generate summary",
            recommendations: parsed.recommendations || []
        };
    } catch (error) {
        console.error('Resume analysis error:', error);
        return {
            skills: [],
            experience: "Analysis failed",
            summary: "Unable to analyze resume at this time",
            recommendations: ["Please try uploading again"]
        };
    }
}

export interface GeneratedCareer {
    id: string;
    title: string;
    description: string;
    requiredSkills: {
        skillName: string;
        importance: 'Essential' | 'Important' | 'Nice to have';
        minimumProficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    }[];
    salaryRange: string;
    growthOutlook: string;
}

export async function generateCareers(industry: string): Promise<GeneratedCareer[]> {
    const prompt = `
Generate 6 jobs in "${industry}" industry. JSON only, no markdown:

{
    "careers": [{
        "title": "Job Title",
        "description": "1 sentence",
        "requiredSkills": [{"skillName": "X", "importance": "Essential", "minimumProficiency": "Intermediate"}],
        "salaryRange": "$XX,XXX - $XX,XXX",
        "growthOutlook": "High demand"
    }]
}
`;

    try {
        const response = await openrouter.chat.completions.create({
            model: AI_MODELS.primary,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 800 // Reduced from 2000
        });

        const content = response.choices[0].message.content || '{"careers":[]}';
        const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return (parsed.careers || []).map((career: any, index: number) => ({
            id: `ai-${industry.toLowerCase().replace(/\s+/g, '-')}-${index}`,
            title: career.title || "Unknown Role",
            description: career.description || "",
            requiredSkills: (career.requiredSkills || []).map((skill: any) => ({
                skillName: skill.skillName || skill.name || "Unknown Skill",
                importance: skill.importance || "Important",
                minimumProficiency: skill.minimumProficiency || skill.proficiency || "Intermediate"
            })),
            salaryRange: career.salaryRange || "Varies",
            growthOutlook: career.growthOutlook || "Stable"
        }));
    } catch (error) {
        console.error('Career generation error:', error);
        return [];
    }
}

export async function suggestCareersForUser(
    userSkills: { skillName: string; proficiencyLevel: string }[],
    interests?: string
): Promise<GeneratedCareer[]> {
    const skillsList = userSkills.map(s => `${s.skillName}(${s.proficiencyLevel})`).join(', ');

    const prompt = `
Suggest 6 careers for someone with: ${skillsList || 'No skills yet'}
${interests ? `Interests: ${interests}` : ''}

JSON only, no markdown:
{
    "careers": [{
        "title": "Job Title",
        "description": "Why this matches (1 sentence)",
        "matchReason": "Skill alignment",
        "requiredSkills": [{"skillName": "X", "importance": "Essential", "minimumProficiency": "Intermediate"}],
        "salaryRange": "$XX,XXX - $XX,XXX",
        "growthOutlook": "High demand"
    }]
}
`;

    try {
        const response = await openrouter.chat.completions.create({
            model: AI_MODELS.primary,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 800 // Reduced from 2500
        });

        const content = response.choices[0].message.content || '{"careers":[]}';
        const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return (parsed.careers || []).map((career: any, index: number) => ({
            id: `suggested-${index}`,
            title: career.title || "Unknown Role",
            description: career.description || "",
            matchReason: career.matchReason || "",
            requiredSkills: (career.requiredSkills || []).map((skill: any) => ({
                skillName: skill.skillName || skill.name || "Unknown Skill",
                importance: skill.importance || "Important",
                minimumProficiency: skill.minimumProficiency || skill.proficiency || "Intermediate"
            })),
            salaryRange: career.salaryRange || "Varies",
            growthOutlook: career.growthOutlook || "Stable"
        }));
    } catch (error) {
        console.error('Career suggestion error:', error);
        return [];
    }
}
