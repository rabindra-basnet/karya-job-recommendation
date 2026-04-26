import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(1),
  degree: z.string().min(1),
  major: z.string().min(1),
  graduationYear: z.string().min(4),
  location: z.string().min(1),
  preferredLanguage: z.string().min(1),
  skills: z.string().min(1),
  interests: z.string().min(1),
  experience: z.string().optional().default(""),
  goals: z.string().optional().default(""),
});

const SYSTEM_PROMPT = `You are Karya, an AI-powered Career Guidance Assistant for students and graduates, specialized in Nepal's job market.

## OBJECTIVE
Analyze the user's education, skills, interests, location, and goals to generate personalized, practical, and structured career guidance.

## INPUT UNDERSTANDING
You will receive:
- Degree / academic qualification
- Technical and soft skills
- Interests and preferences
- Location (prioritize Nepal if mentioned)
- Career goals (optional)

If input is incomplete, make reasonable assumptions and note them in the "assumptions" field.

## RULES
- Do NOT give vague or generic advice
- Do NOT suggest unrealistic careers without explanation
- Avoid overly technical jargon
- Keep responses clear, structured, and practical
- If location is Nepal, suggest real Nepali companies and realistic NPR salary ranges
- Only suggest real courses, platforms, and certifications
- Never invent companies, salaries, or resources

## OUTPUT
You MUST respond with ONLY valid JSON matching this exact structure. No markdown, no extra text:

{
  "assumptions": ["string"] or [],
  "careerRecommendations": [
    {
      "title": "string",
      "whyItFits": "string (specific to user's skills and interests)",
      "keySkillsRequired": ["string"],
      "salaryRangeNPR": "string (e.g. '45,000–90,000/month')",
      "topEmployersInNepal": ["string"],
      "growthPath": "string (e.g. Junior → Mid → Senior)"
    }
  ],
  "skillGapAnalysis": [
    {
      "skill": "string",
      "whyImportant": "string (tied to their career goal)",
      "currentLevel": "none | beginner | intermediate"
    }
  ],
  "learningPath": [
    {
      "step": 1,
      "focus": "string",
      "action": "string (specific task)",
      "resource": "string (real platform or course name)",
      "duration": "string (e.g. '3–4 weeks')"
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
- skillGapAnalysis: EXACTLY 3 to 5 items
- learningPath: EXACTLY 4 to 6 steps
- salaryRangeNPR must reflect REAL Nepal 2024-2025 market rates
- topEmployersInNepal must be REAL companies operating in Nepal`;


export const Route = createFileRoute("/api/test")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const data = profileSchema.parse(body);

          const userPrompt = `
              Analyze this profile and generate a career guidance report:

              Name: ${data.fullName}
              Degree: ${data.degree} in ${data.major}
              Graduation Year: ${data.graduationYear}
              Location: ${data.location}, Nepal
              Preferred Language: ${data.preferredLanguage}
              Technical Skills: ${data.skills}
              Interests: ${data.interests}
              Work Experience: ${data.experience || "None (Fresher)"}
              Career Goal: ${data.goals || "Not specified"}

              Requirements:
              - Tailor ALL recommendations specifically to ${data.location}, Nepal
              - Salary ranges must be realistic for a ${data.graduationYear} graduate in Nepal
              - Suggest only free or affordable learning resources
              - Employers must be real companies actively hiring in Nepal
              `.trim();

          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile", // ✅ Best Groq model for structured JSON
              temperature: 0.2,                 // ✅ Low = consistent, factual
              max_tokens: 2000,                 // ✅ Enough for full structured response
              response_format: { type: "json_object" }, // ✅ Forces valid JSON
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

          const rawContent =
            aiData?.choices?.[0]?.message?.content || "{}";

          let parsed;

          try {
            parsed = JSON.parse(rawContent);
          } catch (err) {
            return Response.json({
              success: false,
              error: "JSON parse failed",
              rawContent,
            }, { status: 500 });
          }

          return Response.json({
            success: true,
            data: parsed,
          });

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