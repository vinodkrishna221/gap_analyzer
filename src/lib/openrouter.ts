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

export interface ResumeAnalysis {
    skills: string[];
    experience: string;
    summary: string;
    recommendations: string[];
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    const prompt = `
You are an expert career advisor analyzing a resume. Extract and analyze the following from this resume text:

RESUME TEXT:
${resumeText.slice(0, 6000)} 

Respond in VALID JSON format only (no markdown, no extra text):
{
    "skills": ["skill1", "skill2", ...],  // List of technical and soft skills mentioned
    "experience": "Brief summary of work experience (2-3 sentences)",
    "summary": "Professional profile summary (2-3 sentences)",
    "recommendations": ["recommendation1", "recommendation2", ...]  // 3-5 career improvement suggestions
}
`;

    try {
        const response = await openrouter.chat.completions.create({
            model: AI_MODELS.primary,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 1000
        });

        const content = response.choices[0].message.content || '{}';
        // Clean any markdown code blocks if present
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

