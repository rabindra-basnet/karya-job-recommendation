import { getAllRecommendations } from "@/server-fn/recommendations";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  GraduationCap,
  Home,
  MapPin,
  Plus,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/_job/portal/")({
  component: PortalIndex,
});

const LIMIT = 9;

type Rec = {
  id: string;
  fullName?: string;
  degree?: string;
  location?: string;
  createdAt?: string | Date | null;
  careerPaths: { id: string; title: string }[];
  skillGaps: { id: string; skill: string }[];
  learningSteps: { id: string; step: string | number }[];
};

// ── Skeleton card ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="island-shell rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="h-5 w-40 rounded-lg bg-[var(--chip-line)]" />
        <div className="h-4 w-20 rounded-full bg-[var(--chip-line)]" />
      </div>
      <div className="flex gap-2">
        <div className="h-4 w-24 rounded-full bg-[var(--chip-line)]" />
        <div className="h-4 w-20 rounded-full bg-[var(--chip-line)]" />
      </div>
      <div className="flex gap-1.5 flex-wrap mt-1">
        <div className="h-6 w-28 rounded-full bg-[var(--chip-line)]" />
        <div className="h-6 w-20 rounded-full bg-[var(--chip-line)]" />
        <div className="h-6 w-24 rounded-full bg-[var(--chip-line)]" />
      </div>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--line)]">
        <div className="h-3 w-24 rounded-full bg-[var(--chip-line)]" />
        <div className="h-8 w-20 rounded-lg bg-[var(--chip-line)]" />
      </div>
    </div>
  );
}

// ── Recommendation card ───────────────────────────────────────
function RecCard({ rec, onClick }: { rec: Rec; onClick: () => void }) {
  const date = rec.createdAt
    ? new Date(rec.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="island-shell rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_28px_52px_rgba(30,90,72,0.14),0_8px_22px_rgba(23,58,64,0.1)] transition-all duration-200 group"
    >
      {/* Name + date */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="display-title text-[16px] font-bold text-[var(--sea-ink)] leading-snug group-hover:text-[var(--cta-bg)] transition-colors">
          {rec.fullName || "Unnamed"}
        </h3>
        {date && (
          <span className="shrink-0 inline-flex items-center gap-1 text-[10.5px] text-[var(--sea-ink-soft)] mt-0.5">
            <Calendar className="w-3 h-3" />
            {date}
          </span>
        )}
      </div>

      {/* Degree + location */}
      <div className="flex flex-wrap gap-1.5">
        {rec.degree && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--sand)] border border-[var(--chip-line)] px-2.5 py-0.5 text-[11px] text-[var(--sea-ink-soft)]">
            <GraduationCap className="w-3 h-3" />
            {rec.degree}
          </span>
        )}
        {rec.location && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--sand)] border border-[var(--chip-line)] px-2.5 py-0.5 text-[11px] text-[var(--sea-ink-soft)]">
            <MapPin className="w-3 h-3" />
            {rec.location}
          </span>
        )}
      </div>

      {/* Career path pills */}
      {rec.careerPaths.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {rec.careerPaths.slice(0, 3).map((p) => (
            <span
              key={p.id}
              className="rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--lagoon-deep)]"
            >
              {p.title}
            </span>
          ))}
          {rec.careerPaths.length > 3 && (
            <span className="rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] px-2.5 py-0.5 text-[11px] text-[var(--sea-ink-soft)]">
              +{rec.careerPaths.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[11px] text-[var(--sea-ink-soft)]">
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3 text-[var(--lagoon)]" />
          {rec.careerPaths.length} paths
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-[var(--lagoon)]" />
          {rec.skillGaps.length} gaps
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-[var(--lagoon)]" />
          {rec.learningSteps.length} steps
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--line)] mt-auto">
        <span className="text-[11px] text-[var(--sea-ink-soft)]">
          {rec.skillGaps[0]?.skill && `Top gap: ${rec.skillGaps[0].skill}`}
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--cta-bg)] group-hover:gap-2 transition-all">
          View <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="island-shell rounded-3xl p-12 text-center flex flex-col items-center gap-5">
      <div className="w-16 h-16 rounded-2xl bg-[var(--sand)] border border-[var(--chip-line)] flex items-center justify-center">
        <Sparkles className="w-7 h-7 text-[var(--lagoon)]" />
      </div>
      <div>
        <h3 className="display-title text-xl font-bold text-[var(--sea-ink)] mb-2">
          No roadmaps yet
        </h3>
        <p className="text-[13px] text-[var(--sea-ink-soft)] max-w-xs mx-auto leading-relaxed">
          Generate your first AI-powered career roadmap tailored to Nepal's job
          market.
        </p>
      </div>
      <button
        onClick={onCreate}
        className="btn-cta btn-cta-lg rounded-full"
      >
        <Sparkles className="w-4 h-4" />
        Build my roadmap
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
function PortalIndex() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const offset = (page - 1) * LIMIT;

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["recommendations", page],
    queryFn: () => getAllRecommendations({ data: { limit: LIMIT, offset } }),
    refetchOnMount: "always",
    staleTime: 0,
  });

  const recs = data as Rec[];

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">

      {/* ── PAGE HERO ─────────────────────────────────────── */}
      <div className="border-b border-[var(--line)] bg-[linear-gradient(165deg,var(--hero-a),var(--hero-b))] px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back to home */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[12px] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition mb-5 no-underline"
          >
            <Home className="w-3.5 h-3.5" /> Home
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="island-kicker mb-2">Your portal</div>
              <h1 className="display-title text-3xl sm:text-4xl font-bold text-[var(--sea-ink)]">
                Career Recommendations
              </h1>
              <p className="mt-2 text-[13px] text-[var(--sea-ink-soft)]">
                AI-generated roadmaps tailored to Nepal's job market
              </p>
            </div>

            <button
              onClick={() => navigate({ to: "/portal/create" })}
              className="btn-cta btn-cta-lg rounded-full self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              New roadmap
            </button>
          </div>

          {/* Stat chips */}
          {!isLoading && recs.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {[
                { icon: Target, label: `${recs.length} roadmap${recs.length !== 1 ? "s" : ""}` },
                {
                  icon: Zap,
                  label: `${recs.reduce((s, r) => s + r.skillGaps.length, 0)} skill gaps tracked`,
                },
                {
                  icon: BookOpen,
                  label: `${recs.reduce((s, r) => s + r.learningSteps.length, 0)} learning steps`,
                },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] px-3 py-1 text-[11.5px] font-medium text-[var(--sea-ink-soft)]"
                >
                  <Icon className="w-3 h-3 text-[var(--lagoon)]" />
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Error */}
        {isError && (
          <div className="island-shell rounded-2xl p-8 text-center">
            <p className="text-destructive mb-3 text-[14px]">
              Failed to load recommendations.
            </p>
            <button
              onClick={() => refetch()}
              className="text-[13px] text-[var(--cta-bg)] underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && recs.length === 0 && (
          <EmptyState onCreate={() => navigate({ to: "/portal/create" })} />
        )}

        {/* Cards grid */}
        {!isLoading && !isError && recs.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recs.map((rec) => (
              <RecCard
                key={rec.id}
                rec={rec}
                onClick={() => navigate({ to: "/portal/$id", params: { id: rec.id } })}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && recs.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[13px] font-medium text-[var(--sea-ink-soft)] hover:bg-[var(--surface-strong)] hover:text-[var(--sea-ink)] transition disabled:opacity-40 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <span className="px-3 py-1 rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] text-[12px] font-medium text-[var(--sea-ink-soft)]">
              Page {page}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={recs.length < LIMIT}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[13px] font-medium text-[var(--sea-ink-soft)] hover:bg-[var(--surface-strong)] hover:text-[var(--sea-ink)] transition disabled:opacity-40 disabled:pointer-events-none"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
