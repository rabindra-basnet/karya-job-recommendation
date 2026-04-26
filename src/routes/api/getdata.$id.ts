import { createFileRoute } from '@tanstack/react-router'
import { db } from "@/db";
import {
  careerPaths,
  careerRecommendations,
  learningSteps,
  skillGaps,
} from "@/db/schema/career";
import { eq } from "drizzle-orm";
import { json } from '@tanstack/react-start';

export const Route = createFileRoute('/api/getdata/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { id } = params
        if (!id) throw new Error("ID is required");

        const [main] = await db
          .select()
          .from(careerRecommendations)
          .where(eq(careerRecommendations.id, id));

        if (!main) throw new Error("Recommendation not found");

        const paths = await db
          .select()
          .from(careerPaths)
          .where(eq(careerPaths.recommendationId, id));

        const gaps = await db
          .select()
          .from(skillGaps)
          .where(eq(skillGaps.recommendationId, id));

        const steps = await db
          .select()
          .from(learningSteps)
          .where(eq(learningSteps.recommendationId, id));

        return Response.json({
          ...main,
          careerPaths: paths,
          skillGaps: gaps,
          learningSteps: steps,
        });
      }
    }
  }
})

