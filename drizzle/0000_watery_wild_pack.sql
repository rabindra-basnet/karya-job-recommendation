CREATE TYPE "public"."demand_level" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."learning_budget" AS ENUM('free-only', 'low', 'medium', 'any');--> statement-breakpoint
CREATE TYPE "public"."work_style" AS ENUM('remote', 'onsite', 'hybrid', 'any');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "career_paths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recommendation_id" uuid NOT NULL,
	"title" text DEFAULT 'not generated',
	"why_it_fits" text DEFAULT 'not generated',
	"key_skills_required" text[] DEFAULT ARRAY[]::text[],
	"salary_range_npr" text DEFAULT 'not generated',
	"top_employers_in_nepal" text[] DEFAULT ARRAY[]::text[],
	"growth_path" text DEFAULT 'not generated',
	"work_style_availability" text DEFAULT 'any',
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "career_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text DEFAULT 'not generated',
	"degree" text DEFAULT 'not generated',
	"major" text DEFAULT 'not generated',
	"graduation_year" text DEFAULT 'not generated',
	"location" text DEFAULT 'not generated',
	"preferred_language" text DEFAULT 'not generated',
	"technical_skills" text DEFAULT 'not generated',
	"skill_levels" text DEFAULT 'not generated',
	"soft_skills" text DEFAULT 'not generated',
	"experience" text DEFAULT 'not generated',
	"projects" text DEFAULT 'not generated',
	"interests" text DEFAULT 'not generated',
	"goals" text DEFAULT 'not generated',
	"timeline" text DEFAULT 'not generated',
	"preferred_work_style" "work_style" DEFAULT 'any',
	"learning_budget" "learning_budget" DEFAULT 'free-only',
	"assumptions" text[] DEFAULT ARRAY[]::text[],
	"market_trend" text DEFAULT 'not generated',
	"market_demand_level" "demand_level" DEFAULT 'medium',
	"local_opportunities" text[] DEFAULT ARRAY[]::text[],
	"job_boards" text[] DEFAULT ARRAY[]::text[],
	"final_advice" text DEFAULT 'not generated',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "learning_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recommendation_id" uuid NOT NULL,
	"step" integer DEFAULT 0,
	"focus" text DEFAULT 'not generated',
	"action" text DEFAULT 'not generated',
	"resource" text DEFAULT 'not generated',
	"duration" text DEFAULT 'not generated',
	"cost" text DEFAULT 'free'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skill_gaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recommendation_id" uuid NOT NULL,
	"skill" text DEFAULT 'not generated',
	"why_important" text DEFAULT 'not generated',
	"current_level" text DEFAULT 'none',
	"priority" text DEFAULT 'low',
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "career_paths" ADD CONSTRAINT "career_paths_recommendation_id_career_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."career_recommendations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "learning_steps" ADD CONSTRAINT "learning_steps_recommendation_id_career_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."career_recommendations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "skill_gaps" ADD CONSTRAINT "skill_gaps_recommendation_id_career_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."career_recommendations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_career_paths_recommendation_id" ON "career_paths" USING btree ("recommendation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_learning_steps_recommendation_id" ON "learning_steps" USING btree ("recommendation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_skill_gaps_recommendation_id" ON "skill_gaps" USING btree ("recommendation_id");