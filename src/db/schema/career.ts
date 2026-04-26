// import { sql } from "drizzle-orm";
// import {
//   integer,
//   pgEnum,
//   pgTable,
//   text,
//   timestamp,
//   uuid,
// } from "drizzle-orm/pg-core";

// // --- Enums ---
// export const workStyleEnum = pgEnum("work_style", [
//   "remote",
//   "onsite",
//   "hybrid",
//   "any",
// ]);

// export const learningBudgetEnum = pgEnum("learning_budget", [
//   "free-only",
//   "low",
//   "medium",
//   "any",
// ]);

// export const demandLevelEnum = pgEnum("demand_level", [
//   "high",
//   "medium",
//   "low",
// ]);

// const NG = "not generated";

// // --- MAIN TABLE ---
// export const careerRecommendations = pgTable("career_recommendations", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   // userId: uuid("user_id").notNull(),
//   // --- Basic Info ---
//   fullName: text("full_name").default(NG),
//   degree: text("degree").default(NG),
//   major: text("major").default(NG),
//   graduationYear: text("graduation_year").default(NG),
//   location: text("location").default(NG),
//   preferredLanguage: text("preferred_language").default(NG),

//   // --- Skills ---
//   technicalSkills: text("technical_skills").default(NG),
//   skillLevels: text("skill_levels").default(NG),
//   softSkills: text("soft_skills").default(NG),

//   // --- Experience ---
//   experience: text("experience").default(NG),
//   projects: text("projects").default(NG),

//   // --- Interests ---
//   interests: text("interests").default(NG),
//   goals: text("goals").default(NG),
//   timeline: text("timeline").default(NG),

//   // --- Preferences ---
//   preferredWorkStyle: workStyleEnum("preferred_work_style").default("any"),
//   learningBudget: learningBudgetEnum("learning_budget").default("free-only"),

//   // --- AI Meta ---
//   assumptions: text("assumptions")
//     .array()
//     .default(sql`ARRAY[]::text[]`),

//   // --- Market ---
//   marketTrend: text("market_trend").default(NG),
//   marketDemandLevel: demandLevelEnum("market_demand_level").default("medium"),

//   localOpportunities: text("local_opportunities")
//     .array()
//     .default(sql`ARRAY[]::text[]`),

//   jobBoards: text("job_boards")
//     .array()
//     .default(sql`ARRAY[]::text[]`),

//   // --- Final Advice ---
//   finalAdvice: text("final_advice").default(NG),

//   createdAt: timestamp("created_at").defaultNow(),
// });

// // --- CAREER PATHS ---
// export const careerPaths = pgTable("career_paths", {
//   id: uuid("id").primaryKey().defaultRandom(),

//   recommendationId: uuid("recommendation_id")
//     .notNull()
//     .references(() => careerRecommendations.id, { onDelete: "cascade" }),

//   title: text("title").default(NG),
//   whyItFits: text("why_it_fits").default(NG),

//   keySkillsRequired: text("key_skills_required")
//     .array()
//     .default(sql`ARRAY[]::text[]`),

//   salaryRangeNpr: text("salary_range_npr").default(NG),

//   topEmployersInNepal: text("top_employers_in_nepal")
//     .array()
//     .default(sql`ARRAY[]::text[]`),

//   growthPath: text("growth_path").default(NG),

//   workStyleAvailability: text("work_style_availability").default("any"),

//   sortOrder: integer("sort_order").default(0),
// });

// // --- SKILL GAPS ---
// export const skillGaps = pgTable("skill_gaps", {
//   id: uuid("id").primaryKey().defaultRandom(),

//   recommendationId: uuid("recommendation_id")
//     .notNull()
//     .references(() => careerRecommendations.id, { onDelete: "cascade" }),

//   skill: text("skill").default(NG),
//   whyImportant: text("why_important").default(NG),
//   currentLevel: text("current_level").default("none"),
//   priority: text("priority").default("low"),

//   sortOrder: integer("sort_order").default(0),
// });

// // --- LEARNING STEPS ---
// export const learningSteps = pgTable("learning_steps", {
//   id: uuid("id").primaryKey().defaultRandom(),

//   recommendationId: uuid("recommendation_id")
//     .notNull()
//     .references(() => careerRecommendations.id, { onDelete: "cascade" }),

//   step: integer("step").default(0),
//   focus: text("focus").default(NG),
//   action: text("action").default(NG),
//   resource: text("resource").default(NG),
//   duration: text("duration").default(NG),
//   cost: text("cost").default("free"),
// });


import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// --- Enums ---
export const workStyleEnum = pgEnum("work_style", [
  "remote",
  "onsite",
  "hybrid",
  "any",
]);

export const learningBudgetEnum = pgEnum("learning_budget", [
  "free-only",
  "low",
  "medium",
  "any",
]);

export const demandLevelEnum = pgEnum("demand_level", [
  "high",
  "medium",
  "low",
]);

const NG = "not generated";

// --- MAIN TABLE ---
export const careerRecommendations = pgTable("career_recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),

  // --- Basic Info ---
  fullName: text("full_name").default(NG),
  degree: text("degree").default(NG),
  major: text("major").default(NG),
  graduationYear: text("graduation_year").default(NG),
  location: text("location").default(NG),
  preferredLanguage: text("preferred_language").default(NG),

  // --- Skills ---
  technicalSkills: text("technical_skills").default(NG),
  skillLevels: text("skill_levels").default(NG),
  softSkills: text("soft_skills").default(NG),

  // --- Experience ---
  experience: text("experience").default(NG),
  projects: text("projects").default(NG),

  // --- Interests ---
  interests: text("interests").default(NG),
  goals: text("goals").default(NG),
  timeline: text("timeline").default(NG),

  // --- Preferences ---
  preferredWorkStyle: workStyleEnum("preferred_work_style").default("any"),
  learningBudget: learningBudgetEnum("learning_budget").default("free-only"),

  // --- AI Meta ---
  assumptions: text("assumptions")
    .array()
    .default(sql`ARRAY[]::text[]`),

  // --- Market ---
  marketTrend: text("market_trend").default(NG),
  marketDemandLevel: demandLevelEnum("market_demand_level").default("medium"),
  localOpportunities: text("local_opportunities")
    .array()
    .default(sql`ARRAY[]::text[]`),
  jobBoards: text("job_boards")
    .array()
    .default(sql`ARRAY[]::text[]`),

  // --- Final Advice ---
  finalAdvice: text("final_advice").default(NG),

  createdAt: timestamp("created_at").defaultNow(),
});

// --- CAREER PATHS ---
export const careerPaths = pgTable(
  "career_paths",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recommendationId: uuid("recommendation_id")
      .notNull()
      .references(() => careerRecommendations.id, { onDelete: "cascade" }),
    title: text("title").default(NG),
    whyItFits: text("why_it_fits").default(NG),
    keySkillsRequired: text("key_skills_required")
      .array()
      .default(sql`ARRAY[]::text[]`),
    salaryRangeNpr: text("salary_range_npr").default(NG),
    topEmployersInNepal: text("top_employers_in_nepal")
      .array()
      .default(sql`ARRAY[]::text[]`),
    growthPath: text("growth_path").default(NG),
    workStyleAvailability: text("work_style_availability").default("any"),
    sortOrder: integer("sort_order").default(0),
  },
  (t) => [
    index("idx_career_paths_recommendation_id").on(t.recommendationId),
  ],
);

// --- SKILL GAPS ---
export const skillGaps = pgTable(
  "skill_gaps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recommendationId: uuid("recommendation_id")
      .notNull()
      .references(() => careerRecommendations.id, { onDelete: "cascade" }),
    skill: text("skill").default(NG),
    whyImportant: text("why_important").default(NG),
    currentLevel: text("current_level").default("none"),
    priority: text("priority").default("low"),
    sortOrder: integer("sort_order").default(0),
  },
  (t) => [
    index("idx_skill_gaps_recommendation_id").on(t.recommendationId),
  ],
);

// --- LEARNING STEPS ---
export const learningSteps = pgTable(
  "learning_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recommendationId: uuid("recommendation_id")
      .notNull()
      .references(() => careerRecommendations.id, { onDelete: "cascade" }),
    step: integer("step").default(0),
    focus: text("focus").default(NG),
    action: text("action").default(NG),
    resource: text("resource").default(NG),
    duration: text("duration").default(NG),
    cost: text("cost").default("free"),
  },
  (t) => [
    index("idx_learning_steps_recommendation_id").on(t.recommendationId),
  ],
);

// --- RELATIONS ---
export const careerRecommendationsRelations = relations(
  careerRecommendations,
  ({ many }) => ({
    careerPaths: many(careerPaths),
    skillGaps: many(skillGaps),
    learningSteps: many(learningSteps),
  }),
);

export const careerPathsRelations = relations(careerPaths, ({ one }) => ({
  recommendation: one(careerRecommendations, {
    fields: [careerPaths.recommendationId],
    references: [careerRecommendations.id],
  }),
}));

export const skillGapsRelations = relations(skillGaps, ({ one }) => ({
  recommendation: one(careerRecommendations, {
    fields: [skillGaps.recommendationId],
    references: [careerRecommendations.id],
  }),
}));

export const learningStepsRelations = relations(learningSteps, ({ one }) => ({
  recommendation: one(careerRecommendations, {
    fields: [learningSteps.recommendationId],
    references: [careerRecommendations.id],
  }),
}));