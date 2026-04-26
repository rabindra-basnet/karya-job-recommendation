import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import {
  careerPaths,
  careerRecommendations,
  learningSteps,
  skillGaps,
} from "../db/schema/career";
import { eq, inArray } from "drizzle-orm";
import { SYSTEM_PROMPT } from "./system-prompt";

const ensureArray = (val: any): string[] => {
  if (!val) return [];

  if (Array.isArray(val)) {
    return val.map((v) => String(v).trim()).filter(Boolean);
  }

  if (typeof val === "string") {
    return val
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
};

const ensureEnum = <T extends string>(
  val: any,
  allowed: T[],
  fallback: T,
): T => {
  return allowed.includes(val) ? val : fallback;
};

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
  skillLevels: z.string().optional(),
  softSkills: z.string().optional(),

  // --- Experience & Projects ---
  experience: z.string().optional(),
  projects: z.string().optional(),

  // --- Interests & Goals ---
  interests: z.string().min(1),
  goals: z.string().optional(),
  timeline: z.string().optional(),

  // --- Preferences ---
  preferredWorkStyle: z
    .enum(["remote", "onsite", "hybrid", "any"])
    .optional()
    .default("any"),
  learningBudget: z
    .enum(["free-only", "low", "medium", "any"])
    .optional()
    .default("free-only"),
});

import { z } from "zod";

// --- ENUMS ---
const WorkStyleEnum = z.enum(["remote", "onsite", "hybrid", "all"]);
const DemandLevelEnum = z.enum(["high", "medium", "low"]);
const SkillLevelEnum = z.enum(["none", "beginner", "intermediate"]);
const PriorityEnum = z.enum(["high", "medium", "low"]);
const CostEnum = z.enum(["free", "paid"]);

// --- MAIN SCHEMA ---
export const aiResponseSchema = z.object({
  assumptions: z.array(z.string()).default([]),

  careerRecommendations: z
    .array(
      z.object({
        title: z.string().min(1),
        whyItFits: z.string().min(1),
        keySkillsRequired: z.array(z.string()).default([]),

        salaryRangeNPR: z
          .string()
          .min(1)
          .regex(
            /^\d{1,3}(,\d{3})*(–|-)\d{1,3}(,\d{3})*\/month$/,
            "Invalid NPR salary format",
          ),

        topEmployersInNepal: z.array(z.string()).default([]),

        growthPath: z.string().min(1),

        workStyleAvailability: WorkStyleEnum,
      }),
    )
    .min(3)
    .max(5),

  skillGapAnalysis: z
    .array(
      z.object({
        skill: z.string().min(1),
        whyImportant: z.string().min(1),
        currentLevel: SkillLevelEnum,
        priority: PriorityEnum,
      }),
    )
    .min(3)
    .max(5),

  learningPath: z
    .array(
      z.object({
        step: z.number().int().min(1),

        focus: z.string().min(1),
        action: z.string().min(1),

        resource: z.string().min(1),

        duration: z.string().min(1),

        cost: CostEnum,
      }),
    )
    .min(4)
    .max(6),

  marketRelevance: z.object({
    trend: z.string().min(1),
    demandLevel: DemandLevelEnum,

    localOpportunities: z.array(z.string()).default([]),

    jobBoards: z.array(z.string()).default(["MeroJob", "Froxjob", "JobsNepal"]),
  }),

  finalAdvice: z.string().min(1),
});

export const createRecommendation = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof profileSchema>) =>
    profileSchema.parse(data),
  )
  .handler(async ({ data }) => {
    console.log("Provided", data);
    // --- Build user prompt ---
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

    // --- Call Groq ---
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
      const errText = await res.text();
      throw new Error(`Groq API error: ${errText}`);
    }

    const aiData = await res.json();
    const rawContent = (aiData.choices?.[0]?.message?.content ?? "{}")
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    // return rawContent
    // --- Parse AI response ---
    const parsed = aiResponseSchema.parse(JSON.parse(rawContent));
    // ---------------- CLEAN ARRAYS ----------------
    const cleanArray = (arr: string[]) =>
      arr.map((i) => i.trim()).filter(Boolean);

    const skillsArray = ensureArray([
      ...data.technicalSkills.split(","),
      ...(data.softSkills ? data.softSkills.split(",") : []),
    ]);

    const demandLevel = ensureEnum(
      parsed.marketRelevance?.demandLevel,
      ["high", "medium", "low"],
      "medium",
    );

    const interestsArray = ensureArray(data.interests);
    // ---------------- TRANSACTION ----------------
    const result = await db.transaction(async (tx) => {
      // MAIN
      const [main] = await tx
        .insert(careerRecommendations)
        .values({
          fullName: data.fullName,
          degree: data.degree,
          major: data.major,
          graduationYear: data.graduationYear,
          location: data.location,
          preferredLanguage: data.preferredLanguage,

          technicalSkills: data.technicalSkills,
          skillLevels: data.skillLevels ?? "",
          softSkills: data.softSkills ?? "",

          experience: data.experience ?? "",
          projects: data.projects ?? "",

          interests: data.interests ?? "",

          goals: data.goals ?? "",
          timeline: data.timeline ?? "",

          preferredWorkStyle: data.preferredWorkStyle ?? "any",
          learningBudget: data.learningBudget ?? "free-only",

          // ✅ CRITICAL FIXES BELOW

          assumptions: ensureArray(parsed.assumptions || []),

          marketTrend: parsed.marketRelevance?.trend || "No trend available",

          marketDemandLevel: ensureEnum(
            parsed.marketRelevance?.demandLevel,
            ["high", "medium", "low"],
            "medium",
          ),

          localOpportunities: ensureArray(
            parsed.marketRelevance?.localOpportunities || [],
          ),

          jobBoards: ensureArray(parsed.marketRelevance?.jobBoards || []),

          finalAdvice: parsed.finalAdvice || "No advice generated",
        })
        .returning();

      const recommendationId = main.id;

      // CAREER PATHS
      if (parsed.careerRecommendations?.length) {
        await tx.insert(careerPaths).values(
          parsed.careerRecommendations.map((c: any, i: number) => ({
            recommendationId,
            title: c.title || "Unknown Role",
            whyItFits: c.whyItFits || "",
            keySkillsRequired: ensureArray(c.keySkillsRequired || []),
            salaryRangeNpr: c.salaryRangeNPR || "N/A",
            topEmployersInNepal: ensureArray(c.topEmployersInNepal || []),
            growthPath: c.growthPath || "",
            workStyleAvailability: c.workStyleAvailability || "any",
            sortOrder: i,
          })),
        );
      }

      // SKILL GAPS
      if (parsed.skillGapAnalysis?.length) {
        await tx.insert(skillGaps).values(
          parsed.skillGapAnalysis.map((s: any, i: number) => ({
            recommendationId,
            skill: s.skill || "Unknown",
            whyImportant: s.whyImportant || "",
            currentLevel: s.currentLevel || "none",
            priority: s.priority || "low",
            sortOrder: i,
          })),
        );
      }

      // LEARNING STEPS
      if (parsed.learningPath?.length) {
        await tx.insert(learningSteps).values(
          parsed.learningPath.map((l: any) => ({
            recommendationId,
            step: l.step || 0,
            focus: l.focus || "",
            action: l.action || "",
            resource: l.resource || "",
            duration: l.duration || "",
            cost: l.cost || "free",
          })),
        );
      }

      return { id: recommendationId };
    });

    return result;
  });

export const getRecommendationById = createServerFn({ method: "GET" })
  .inputValidator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ data: id }) => {
    const result = await db.query.careerRecommendations.findFirst({
      where: eq(careerRecommendations.id, id),
      with: {
        careerPaths: true,
        skillGaps: true,
        learningSteps: true,
      },
    });

    if (!result) throw new Error("Recommendation not found");

    return result;
  });


export const getAllRecommendations = createServerFn({ method: "GET" })
  .inputValidator((input?: { limit?: number; offset?: number }) => input ?? {})
  .handler(async ({ data }: { data: { limit: number, offset: number } }) => {
    const { limit = 20, offset = 0 } = data || {};

    const results = await db.query.careerRecommendations.findMany({
      limit,
      offset,
      columns: {
        id: true,
        fullName: true,
        location: true,
        degree: true,
        createdAt: true,
      },
      with: {
        careerPaths: {
          columns: { id: true, title: true },
        },
        skillGaps: {
          columns: { id: true, skill: true },
        },
        learningSteps: {
          columns: { id: true, step: true },
        },
      },
    });

    return results;
  });