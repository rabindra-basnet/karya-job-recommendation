import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const profileSchema = z.object({
  model: z.string().optional(),
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

const SYSTEM_PROMPT = `You are Karya, an AI-powered career guidance assistant for Nepali university graduates.

Your job is to provide practical, realistic, and localized career recommendations.

RULES:
1. Always prioritize Nepal's job market first
2. Provide realistic entry-level and growth career paths
3. Include:
   - Top career paths (3)
   - Skill gaps (4)
   - Learning plan (4 steps)
4. Prefer affordable or free learning options
5. Avoid generic advice
6. Do NOT invent salaries, companies, or certifications
7. Be specific and actionable
8. If data is incomplete, make safe assumptions

CRITICAL:
- Think step-by-step internally but DO NOT show reasoning
- Return ONLY valid JSON
- DO NOT include markdown
- DO NOT include explanations
- DO NOT include code blocks

JSON FORMAT:
{
  "summary": "string",
  "topCareerPaths": [
    {
      "title": "string",
      "whyFit": "string",
      "localRelevance": "string",
      "starterSteps": ["string"]
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "reason": "string",
      "priority": "High | Medium | Low",
      "howToLearn": "string"
    }
  ],
  "learningPlan": [
    {
      "milestone": "string",
      "action": "string",
      "timeline": "string"
    }
  ],
  "notes": ["string"]
}`;

export const Route = createFileRoute("/api/recommendation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const data = profileSchema.parse(body);

          const userPrompt = `
            Profile:
            Name: ${data.fullName}
            Degree: ${data.degree} in ${data.major}
            Graduation Year: ${data.graduationYear}
            Location: ${data.location}
            Preferred Language: ${data.preferredLanguage}
            Skills: ${data.skills}
            Interests: ${data.interests}
            Experience: ${data.experience}
            Goals: ${data.goals}
          `.trim();

          const res = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Karya Test",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                response_format: { type: "json_object" },
                temperature: 0.4,
                max_tokens: 782,
                messages: [
                  { role: "system", content: SYSTEM_PROMPT },
                  { role: "user", content: userPrompt },
                ],
              }),
            },
          );

          if (!res.ok) {
            return Response.json(
              {
                success: false,
                error: await res.text(),
              },
              { status: res.status },
            );
          }

          const aiData = await res.json();

          let rawContent =
            aiData.choices?.[0]?.message?.content || "{}";

          rawContent = rawContent
            .replace(/^```json\s*/, "")
            .replace(/\s*```$/, "")
            .trim();

          let parsed;
          try {
            parsed = JSON.parse(rawContent);
          } catch (err) {
            return Response.json(
              {
                success: false,
                error: "JSON parse failed",
                rawContent,
                aiData,
              },
              { status: 500 },
            );
          }

          // ✅ RETURN ONLY (NO DB)
          return Response.json({
            success: true,
            data: parsed,
            raw: rawContent, // optional debug
          });

        } catch (err) {
          if (err instanceof z.ZodError) {
            return Response.json(
              {
                success: false,
                error: "Validation failed",
                issues: err.flatten(),
              },
              { status: 400 },
            );
          }

          return Response.json(
            {
              success: false,
              error: err instanceof Error ? err.message : "Unknown error",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});