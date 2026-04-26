import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const profileSchema = z.object({
    // --- Basic Info ---
    fullName: z.string().min(1),
    degree: z.string().min(1),
    major: z.string().min(1),
    graduationYear: z.string().min(4),
    location: z.string().min(1),
    preferredLanguage: z.string().min(1),

    // --- Skills ---
    technicalSkills: z.string().min(1),
    skillLevels: z.string().optional().default(""),        // "React:intermediate, Node.js:beginner"
    softSkills: z.string().optional().default(""),          // "communication, teamwork"

    // --- Experience & Projects ---
    experience: z.string().optional().default(""),          // "3-month intern at Leapfrog, built REST APIs"
    projects: z.string().optional().default(""),            // "Built chatbot with OpenAI API + React"

    // --- Interests & Goals ---
    interests: z.string().min(1),
    goals: z.string().optional().default(""),
    timeline: z.string().optional().default(""),            // "1 year", "2 years"

    // --- Preferences ---
    preferredWorkStyle: z.enum(["remote", "onsite", "hybrid", "any"]).optional().default("any"),
    learningBudget: z.enum(["free-only", "low", "medium", "any"]).optional().default("free-only"),
});

const SYSTEM_PROMPT = `You are Karya, an AI-powered Career Guidance Assistant for students and graduates, specialized in Nepal's job market.

## OBJECTIVE
Analyze the user's education, skills, interests, location, and goals to generate personalized, practical, and structured career guidance.

## INPUT UNDERSTANDING
You will receive:
- Degree / academic qualification
- Technical and soft skills with proficiency levels
- Interests and preferences
- Location (prioritize Nepal if mentioned)
- Work experience and projects
- Career goals, timeline, work style preference, and learning budget

If input is incomplete, make reasonable assumptions and note them in the "assumptions" field.

## RULES
- Do NOT give vague or generic advice
- Do NOT suggest unrealistic careers without explanation
- Avoid overly technical jargon
- Keep responses clear, structured, and practical
- If location is Nepal, suggest real Nepali companies and realistic NPR salary ranges
- Only suggest real courses, platforms, and certifications
- Never invent companies, salaries, or resources
- Match learning resources to the user's learning budget (free-only = YouTube, freeCodeCamp, etc.)
- Match job suggestions to the user's preferred work style (remote/onsite/hybrid)

## OUTPUT
You MUST respond with ONLY valid JSON matching this exact structure. No markdown, no extra text:

{
  "assumptions": ["string"] or [],
  "careerRecommendations": [
    {
      "title": "string",
      "whyItFits": "string (specific to user's skills, projects, and interests)",
      "keySkillsRequired": ["string"],
      "salaryRangeNPR": "string (e.g. '45,000–90,000/month')",
      "topEmployersInNepal": ["string"],
      "growthPath": "string (e.g. Junior → Mid → Senior → Lead)",
      "workStyleAvailability": "remote | onsite | hybrid | all"
    }
  ],
  "skillGapAnalysis": [
    {
      "skill": "string",
      "whyImportant": "string (tied to their specific career goal)",
      "currentLevel": "none | beginner | intermediate",
      "priority": "high | medium | low"
    }
  ],
  "learningPath": [
    {
      "step": 1,
      "focus": "string",
      "action": "string (specific task)",
      "resource": "string (real platform or course name)",
      "duration": "string (e.g. '3–4 weeks')",
      "cost": "free | paid"
    }
  ],
  "marketRelevance": {
    "trend": "string (current market context for Nepal)",
    "demandLevel": "high | medium | low",
    "localOpportunities": ["string"],
    "jobBoards": ["MeroJob", "Froxjob", "JobsNepal"]
  },
  "finalAdvice": "string (2-3 lines of practical, specific guidance)"
}

## STRICT CONSTRAINTS
- careerRecommendations: EXACTLY 3 to 5 items
- skillGapAnalysis: EXACTLY 3 to 5 items, ordered by priority (high first)
- learningPath: EXACTLY 4 to 6 steps, ordered by what to learn first
- salaryRangeNPR must reflect REAL Nepal 2024-2025 market rates
- topEmployersInNepal must be REAL companies operating in Nepal
- If learningBudget is "free-only", ALL resources must be free`;

export const Route = createFileRoute("/api/second")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                try {
                    const body = await request.json();
                    const data = profileSchema.parse(body);

                    const userPrompt = `
                    Analyze this profile and generate a career guidance report:

                    --- BASIC INFO ---
                    Name: ${data.fullName}
                    Degree: ${data.degree} in ${data.major}
                    Graduation Year: ${data.graduationYear}
                    Location: ${data.location}, Nepal
                    Preferred Language: ${data.preferredLanguage}

                    --- SKILLS ---
                    Technical Skills: ${data.technicalSkills}
                    Skill Levels: ${data.skillLevels || "Not specified"}
                    Soft Skills: ${data.softSkills || "Not specified"}

                    --- EXPERIENCE ---
                    Work Experience: ${data.experience || "None (Fresher)"}
                    Projects: ${data.projects || "None"}

                    --- GOALS ---
                    Interests: ${data.interests}
                    Career Goal: ${data.goals || "Not specified"}
                    Goal Timeline: ${data.timeline || "Not specified"}

                    --- PREFERENCES ---
                    Work Style: ${data.preferredWorkStyle}
                    Learning Budget: ${data.learningBudget}

                    --- REQUIREMENTS ---
                    - Tailor ALL recommendations to ${data.location}, Nepal
                    - Salary ranges must be realistic for a ${data.graduationYear} graduate in Nepal
                    - All learning resources must match budget: ${data.learningBudget}
                    - Job/employer suggestions must support: ${data.preferredWorkStyle} work
                    - Use skill levels to accurately assess gaps (don't assume zero for stated skills)
                    - Use projects and experience as evidence of real-world capability
                            `.trim();

                    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            model: "llama-3.3-70b-versatile",
                            temperature: 0.2,
                            max_tokens: 2000,
                            response_format: { type: "json_object" },
                            messages: [
                                { role: "system", content: SYSTEM_PROMPT },
                                { role: "user", content: userPrompt },
                            ],
                        }),
                    });

                    if (!res.ok) {
                        return Response.json(
                            { success: false, error: await res.text() },
                            { status: res.status }
                        );
                    }

                    const aiData = await res.json();
                    const rawContent = aiData?.choices?.[0]?.message?.content || "{}";

                    let parsed;
                    try {
                        parsed = JSON.parse(rawContent);
                    } catch {
                        return Response.json(
                            { success: false, error: "JSON parse failed", rawContent },
                            { status: 500 }
                        );
                    }

                    return Response.json({ success: true, data: parsed });

                } catch (err) {
                    if (err instanceof z.ZodError) {
                        return Response.json(
                            {
                                success: false,
                                error: "Validation failed",
                                issues: z.treeifyError(err),
                            },
                            { status: 400 }
                        );
                    }

                    return Response.json(
                        {
                            success: false,
                            error: err instanceof Error ? err.message : "Unknown error",
                        },
                        { status: 500 }
                    );
                }
            },
        },
    },
});