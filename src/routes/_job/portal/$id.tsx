import { createFileRoute, Link } from "@tanstack/react-router";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getRecommendationById,
} from "@/server-fn/recommendations";
import { ArrowLeft, BookOpen, Target, Lightbulb, MapPin } from "lucide-react";

export const Route = createFileRoute("/_job/portal/$id")({
  loader: async ({ params }) => {
    const data = await getRecommendationById({ data: params.id });

    return data;
  },
  component: RecommendationView,
});
function RecommendationView() {
  const data = Route.useLoaderData();

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div>
        <Link
          to="/portal"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>

        <h1 className="text-3xl font-bold">
          Career Roadmap for {data.fullName}
        </h1>

        <p className="text-muted-foreground flex items-center gap-2 mt-2">
          {data.degree} in {data.major}
          <MapPin className="w-4 h-4" />
          {data.location}
        </p>
      </div>

      {/* Final Advice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Final Advice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.finalAdvice}
          </p>
        </CardContent>
      </Card>

      {/* Career Paths */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Career Paths
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {data.careerPaths.map((path: any, i: number) => (
            <Card key={path.id}>
              <CardHeader>
                <CardTitle className="text-lg">{path.title}</CardTitle>
                <Badge variant="outline">#{i + 1}</Badge>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                <p>{path.whyItFits}</p>

                <div>
                  <strong>Skills:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {path.keySkillsRequired.map((s: string, i: number) => (
                      <Badge key={i} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <p>
                  <strong>Salary:</strong> {path.salaryRangeNpr}
                </p>

                <p>
                  <strong>Growth:</strong> {path.growthPath}
                </p>

                <p>
                  <strong>Work Style:</strong> {path.workStyleAvailability}
                </p>

                <div>
                  <strong>Top Companies:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    {path.topEmployersInNepal.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Skill Gaps */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Skill Gaps</h2>

        <div className="space-y-4">
          {data.skillGaps.map((gap: any) => (
            <Card key={gap.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{gap.skill}</h3>
                  <Badge
                    variant="outline"
                    className={getPriorityColor(gap.priority)}
                  >
                    {gap.priority}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {gap.whyImportant}
                </p>

                <p className="text-xs text-muted-foreground">
                  Current Level: {gap.currentLevel}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Learning Path */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Learning Plan
        </h2>

        <Card>
          <CardContent className="divide-y">
            {data.learningSteps.map((step: any, i: number) => (
              <div key={step.id} className="py-4 flex gap-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white text-sm">
                  {step.step}
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-medium">{step.focus}</p>
                  <p className="text-muted-foreground">{step.action}</p>

                  <p className="text-xs text-muted-foreground">
                    {step.resource} • {step.duration} • {step.cost}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
