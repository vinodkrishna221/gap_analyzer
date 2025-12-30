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
You are a career expert. Generate 6 realistic job roles/occupations in the "${industry}" industry or field.

For each career, provide:
- title: Job title
- description: Brief 1-2 sentence description
- requiredSkills: Array of 5-7 key skills with importance and proficiency level
- salaryRange: Typical salary range (e.g., "$60,000 - $90,000")
- growthOutlook: Job market outlook (e.g., "High demand", "Growing", "Stable")

Respond in VALID JSON format only (no markdown, no extra text):
{
    "careers": [
        {
            "title": "Job Title",
            "description": "Brief description",
            "requiredSkills": [
                {"skillName": "Skill 1", "importance": "Essential", "minimumProficiency": "Intermediate"},
                {"skillName": "Skill 2", "importance": "Important", "minimumProficiency": "Beginner"}
            ],
            "salaryRange": "$XX,XXX - $XX,XXX",
            "growthOutlook": "High demand"
        }
    ]
}

Make the careers diverse within the industry, from entry-level to senior positions.
`;

    try {
        const response = await openrouter.chat.completions.create({
            model: AI_MODELS.primary,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 2000
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
