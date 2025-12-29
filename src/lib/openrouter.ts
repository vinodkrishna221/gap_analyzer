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
    primary: "openai/gpt-4-turbo",
    fallback: "anthropic/claude-3-sonnet"
};

export async function analyzeSkillGap(
    userSkills: any[],
    requiredSkills: any[],
    careerName: string
): Promise<string> {
    const prompt = `
You are a career guidance AI analyzing skill gaps.

STUDENT SKILLS:
${userSkills.map(s => `- ${s.skillName} (${s.proficiencyLevel})`).join('\n')}

REQUIRED SKILLS FOR ${careerName}:
${requiredSkills.map(s => `- ${s.skillName} (${s.importance}, need ${s.minimumProficiency})`).join('\n')}

Provide a brief analysis (3-4 sentences) covering:
1. Overall readiness for this career
2. Top 2-3 strengths
3. Most critical gaps to address
4. Estimated time to become job-ready

Be encouraging but realistic.
`;

    try {
        const response = await openrouter.chat.completions.create({
            model: AI_MODELS.primary,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 300
        });

        return response.choices[0].message.content || "Analysis unavailable";
    } catch (error) {
        console.error('AI analysis error:', error);
        return "Unable to generate AI insights at this time.";
    }
}
