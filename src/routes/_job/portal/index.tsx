import { getAllRecommendations } from "@/server-fn/recommendations";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/_job/portal/")({
  component: RouteComponent,
});

const LIMIT = 10;

type Recommendation = {
  id: string;
  title: string;
  createdAt?: string;
  careerPaths: { id: string; title: string }[];
  skillGaps: { id: string; skill: string }[];
  learningSteps: { id: string; step: string }[];
};

function RouteComponent() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const offset = (page - 1) * LIMIT;

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["recommendations", page],
    queryFn: () => getAllRecommendations({ data: { limit: LIMIT, offset } }),
  });

  const goToDetails = (id: string) => {
    navigate({ to: "/portal/$id", params: { id } });
  };

  const goToCreate = () => {
    navigate({ to: "/portal/create" });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] p-6 flex justify-center text-[var(--sea-ink)]">
      <div className="w-full max-w-7xl">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold display-title">
              Career Recommendations
            </h1>
            <p className="text-[var(--sea-ink-soft)] text-base mt-1">
              Manage and explore generated recommendations
            </p>
          </div>
          <button
            onClick={goToCreate}
            className="px-5 py-2.5 text-base rounded-xl bg-[var(--lagoon)] text-white hover:bg-[var(--lagoon-deep)] transition"
          >
            + Create New
          </button>
        </div>

        {/* TABLE */}
        <div className="island-shell rounded-2xl overflow-hidden">
          <table className="w-full text-[15px] font-medium">
            <thead className="bg-[var(--header-bg)] text-[var(--sea-ink)]">
              <tr>
                <th className="p-4 text-left font-semibold">Title</th>
                <th className="p-4 text-left font-semibold">Career Paths</th>
                <th className="p-4 text-left font-semibold">Skill Gaps</th>
                <th className="p-4 text-left font-semibold">Learning Steps</th>
                <th className="p-4 text-left font-semibold">Date</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* Loading skeleton */}
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-[var(--line)]">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 rounded bg-[var(--chip-line)] animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))}

              {/* Error state */}
              {isError && (
                <tr>
                  <td colSpan={6} className="p-6 text-center">
                    <p className="text-destructive mb-2">
                      Failed to load recommendations.
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="text-sm text-[var(--lagoon)] underline"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!isLoading &&
                !isError &&
                (data as Recommendation[]).map((rec) => (
                  <tr
                    key={rec.id}
                    className="border-t border-[var(--line)] hover:bg-[var(--link-bg-hover)] transition"
                  >
                    <td className="p-4 font-semibold text-[var(--sea-ink)]">
                      {rec.title || "Recommendation"}
                    </td>
                    <td className="p-4 text-[var(--sea-ink-soft)]">
                      {rec.careerPaths
                        .slice(0, 2)
                        .map((p) => p.title)
                        .join(", ")}
                    </td>
                    <td className="p-4 text-[var(--sea-ink-soft)]">
                      {rec.skillGaps
                        .slice(0, 3)
                        .map((g) => g.skill)
                        .join(", ")}
                    </td>
                    <td className="p-4 text-[var(--sea-ink-soft)]">
                      {rec.learningSteps
                        .slice(0, 2)
                        .map((s) => s.step)
                        .join(", ")}
                    </td>
                    <td className="p-4 text-[var(--sea-ink-soft)]">
                      {rec.createdAt
                        ? new Date(rec.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => goToDetails(rec.id)}
                        className="px-3 py-1 rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] hover:bg-white transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}

              {/* Empty state */}
              {!isLoading && !isError && data.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <p className="text-[var(--sea-ink-soft)] mb-3">
                      No recommendations yet.
                    </p>
                    <button
                      onClick={goToCreate}
                      className="px-4 py-2 rounded-lg bg-[var(--lagoon)] text-white text-sm hover:bg-[var(--lagoon-deep)] transition"
                    >
                      Create your first roadmap
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="mt-6 flex items-center justify-center gap-5 text-[var(--sea-ink)]">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="px-5 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:bg-white transition disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="text-[var(--sea-ink-soft)]">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={data.length < LIMIT || isLoading}
            className="px-5 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:bg-white transition disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
