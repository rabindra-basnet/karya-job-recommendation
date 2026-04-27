import { createFileRoute, Link } from "@tanstack/react-router";
import { getRecommendationById } from "@/server-fn/recommendations";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  GraduationCap,
  Lightbulb,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/_job/portal/$id")({
  loader: async ({ params }) => getRecommendationById({ data: params.id }),
  component: RecommendationView,
});

// ── helpers ──────────────────────────────────────────────────

type Priority = "high" | "medium" | "low" | string;
type DemandLevel = "high" | "medium" | "low" | string;
type Cost = "free" | "paid" | string;
type Level = "none" | "beginner" | "intermediate" | string;

function priorityStyle(p: Priority) {
  if (p === "high") return { chip: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800", dot: "bg-red-500" };
  if (p === "medium") return { chip: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800", dot: "bg-amber-500" };
  return { chip: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800", dot: "bg-emerald-500" };
}

function demandStyle(d: DemandLevel) {
  if (d === "high") return { label: "High demand", color: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", width: "w-full" };
  if (d === "medium") return { label: "Medium demand", color: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500", width: "w-2/3" };
  return { label: "Low demand", color: "text-red-500 dark:text-red-400", bar: "bg-red-500", width: "w-1/3" };
}

function levelLabel(l: Level) {
  if (l === "none") return { text: "No experience", pct: 5 };
  if (l === "beginner") return { text: "Beginner", pct: 35 };
  if (l === "intermediate") return { text: "Intermediate", pct: 65 };
  return { text: l, pct: 50 };
}

function costBadge(c: Cost) {
  return c === "free"
    ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
    : "bg-[var(--chip-bg)] text-[var(--lagoon-deep)] border-[var(--chip-line)]";
}

function parseGrowthSteps(path: string) {
  return path.split(/→|->|>/).map((s) => s.trim()).filter(Boolean);
}

// accent colors cycling per career path card
const CARD_ACCENTS = [
  "border-l-[var(--lagoon)]",
  "border-l-[var(--palm)]",
  "border-l-amber-400",
  "border-l-violet-400",
  "border-l-rose-400",
];

// ── component ────────────────────────────────────────────────

function RecommendationView() {
  const data = Route.useLoaderData();
  const demand = demandStyle(data.marketDemandLevel ?? "medium");
  const createdAt = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* ── PAGE HERO ───────────────────────────────────────── */}
      <div className="border-b border-[var(--line)] bg-[linear-gradient(165deg,var(--hero-a),var(--hero-b))] px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/portal"
            className="inline-flex items-center gap-1.5 text-[12px] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition mb-6 no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to portal
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="island-kicker mb-2">Career Roadmap</div>
              <h1 className="display-title text-3xl sm:text-4xl font-bold text-[var(--sea-ink)] leading-tight">
                {data.fullName}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] px-3 py-1 text-[12px] text-[var(--sea-ink-soft)]">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {data.degree} in {data.major}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] px-3 py-1 text-[12px] text-[var(--sea-ink-soft)]">
                  <MapPin className="w-3.5 h-3.5" />
                  {data.location}, Nepal
                </span>
                {data.graduationYear && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] px-3 py-1 text-[12px] text-[var(--sea-ink-soft)]">
                    <Calendar className="w-3.5 h-3.5" />
                    Class of {data.graduationYear}
                  </span>
                )}
                {createdAt && (
                  <span className="text-[11px] text-[var(--sea-ink-soft)] opacity-70">
                    Generated {createdAt}
                  </span>
                )}
              </div>
            </div>

            {/* Stat pills */}
            <div className="flex gap-3 flex-shrink-0">
              {[
                { value: data.careerPaths.length, label: "Career paths", icon: Target },
                { value: data.skillGaps.length, label: "Skill gaps", icon: Zap },
                { value: data.learningSteps.length, label: "Learning steps", icon: BookOpen },
              ].map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="island-shell rounded-2xl px-4 py-3 text-center min-w-[72px]"
                >
                  <Icon className="w-4 h-4 text-[var(--lagoon)] mx-auto mb-1" />
                  <div className="text-xl font-bold text-[var(--sea-ink)]">{value}</div>
                  <div className="text-[10px] text-[var(--sea-ink-soft)] leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">

        {/* ── FINAL ADVICE ────────────────────────────────── */}
        {data.finalAdvice && data.finalAdvice !== "not generated" && (
          <section>
            <div className="island-shell rounded-2xl p-6 border-l-4 border-l-[var(--lagoon)] flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-[var(--sand)] border border-[var(--chip-line)] flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4.5 h-4.5 text-[var(--lagoon-deep)]" />
              </div>
              <div>
                <p className="text-[10.5px] font-medium tracking-widest uppercase text-[var(--lagoon-deep)] mb-1">
                  Karya's Advice
                </p>
                <p className="text-[14px] text-[var(--sea-ink)] leading-relaxed italic">
                  "{data.finalAdvice}"
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── CAREER PATHS ────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-[var(--sand)] border border-[var(--chip-line)] flex items-center justify-center text-[var(--lagoon-deep)]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="island-kicker">Recommended paths</p>
              <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)]">Career Paths</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {data.careerPaths.map((path: any, i: number) => {
              const growthSteps = parseGrowthSteps(path.growthPath ?? "");
              return (
                <div
                  key={path.id}
                  className={`island-shell rounded-2xl border-l-4 ${CARD_ACCENTS[i % CARD_ACCENTS.length]} p-6 flex flex-col gap-5`}
                >
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold tracking-widest uppercase text-[var(--sea-ink-soft)] mb-1">
                        Path {i + 1}
                      </div>
                      <h3 className="display-title text-[17px] font-bold text-[var(--sea-ink)] leading-snug">
                        {path.title}
                      </h3>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                        path.workStyleAvailability === "remote"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                          : path.workStyleAvailability === "hybrid"
                          ? "bg-[var(--chip-bg)] text-[var(--lagoon-deep)] border-[var(--chip-line)]"
                          : "bg-[var(--sand)] text-[var(--sea-ink-soft)] border-[var(--line)]"
                      }`}
                    >
                      {path.workStyleAvailability}
                    </span>
                  </div>

                  {/* Why it fits */}
                  <p className="text-[13px] text-[var(--sea-ink-soft)] leading-relaxed">
                    {path.whyItFits}
                  </p>

                  {/* Salary */}
                  <div className="flex items-center gap-2 bg-[var(--sand)] rounded-xl px-4 py-2.5 border border-[var(--chip-line)]">
                    <DollarSign className="w-4 h-4 text-[var(--palm)] shrink-0" />
                    <div>
                      <div className="text-[10px] font-medium text-[var(--sea-ink-soft)] uppercase tracking-wider">
                        Salary range
                      </div>
                      <div className="text-[14px] font-bold text-[var(--palm)]">
                        NPR {path.salaryRangeNpr}
                      </div>
                    </div>
                  </div>

                  {/* Key skills */}
                  {path.keySkillsRequired?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium text-[var(--sea-ink-soft)] uppercase tracking-wider mb-2">
                        Key skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {path.keySkillsRequired.map((s: string, j: number) => (
                          <span
                            key={j}
                            className="rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] px-2.5 py-0.5 text-[11px] text-[var(--sea-ink)]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Growth path */}
                  {growthSteps.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium text-[var(--sea-ink-soft)] uppercase tracking-wider mb-2">
                        Growth path
                      </p>
                      <div className="flex flex-wrap items-center gap-1">
                        {growthSteps.map((step, j) => (
                          <span key={j} className="flex items-center gap-1">
                            <span className="text-[11px] font-medium text-[var(--sea-ink)] bg-[var(--sand)] border border-[var(--line)] rounded-lg px-2 py-0.5">
                              {step}
                            </span>
                            {j < growthSteps.length - 1 && (
                              <ChevronRight className="w-3 h-3 text-[var(--sea-ink-soft)] shrink-0" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top employers */}
                  {path.topEmployersInNepal?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium text-[var(--sea-ink-soft)] uppercase tracking-wider mb-2">
                        Top employers in Nepal
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {path.topEmployersInNepal.map((c: string, j: number) => (
                          <div key={j} className="flex items-center gap-2 text-[12px] text-[var(--sea-ink)]">
                            <Building2 className="w-3 h-3 text-[var(--lagoon)] shrink-0" />
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SKILL GAPS + MARKET RELEVANCE ───────────────── */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Skill Gaps — 3/5 */}
          <section className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-[var(--sand)] border border-[var(--chip-line)] flex items-center justify-center text-[var(--lagoon-deep)]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="island-kicker">What to work on</p>
                <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)]">Skill Gap Analysis</h2>
              </div>
            </div>

            <div className="space-y-4">
              {data.skillGaps.map((gap: any) => {
                const ps = priorityStyle(gap.priority);
                const lv = levelLabel(gap.currentLevel);
                return (
                  <div key={gap.id} className="island-shell rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-[15px] text-[var(--sea-ink)]">{gap.skill}</h3>
                      <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${ps.chip}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ps.dot}`} />
                        {gap.priority} priority
                      </span>
                    </div>

                    <p className="text-[12.5px] text-[var(--sea-ink-soft)] leading-relaxed">
                      {gap.whyImportant}
                    </p>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium text-[var(--sea-ink-soft)]">
                          Current level
                        </span>
                        <span className="text-[11px] font-semibold text-[var(--sea-ink)]">
                          {lv.text}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--sand)] rounded-full overflow-hidden border border-[var(--line)]">
                        <div
                          className="h-full bg-[var(--lagoon)] rounded-full transition-all duration-700"
                          style={{ width: `${lv.pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Market Relevance — 2/5 */}
          <section className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-[var(--sand)] border border-[var(--chip-line)] flex items-center justify-center text-[var(--lagoon-deep)]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="island-kicker">Nepal market</p>
                <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)]">Market Pulse</h2>
              </div>
            </div>

            {/* Demand card */}
            <div className="island-shell rounded-2xl p-5">
              <p className="text-[11px] font-medium text-[var(--sea-ink-soft)] uppercase tracking-wider mb-3">
                Market demand
              </p>
              <div className={`text-[15px] font-bold mb-2 ${demand.color}`}>
                {demand.label}
              </div>
              <div className="h-2 w-full bg-[var(--sand)] rounded-full overflow-hidden border border-[var(--line)]">
                <div className={`h-full ${demand.bar} ${demand.width} rounded-full transition-all duration-700`} />
              </div>

              {data.marketTrend && data.marketTrend !== "not generated" && (
                <p className="mt-3 text-[12px] text-[var(--sea-ink-soft)] leading-relaxed border-t border-[var(--line)] pt-3">
                  {data.marketTrend}
                </p>
              )}
            </div>

            {/* Local opportunities */}
            {data.localOpportunities?.length > 0 && (
              <div className="island-shell rounded-2xl p-5">
                <p className="text-[11px] font-medium text-[var(--sea-ink-soft)] uppercase tracking-wider mb-3">
                  Local opportunities
                </p>
                <div className="flex flex-col gap-2">
                  {data.localOpportunities.map((opp: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-[12.5px] text-[var(--sea-ink)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--lagoon)] shrink-0 mt-0.5" />
                      {opp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job boards */}
            {data.jobBoards?.length > 0 && (
              <div className="island-shell rounded-2xl p-5">
                <p className="text-[11px] font-medium text-[var(--sea-ink-soft)] uppercase tracking-wider mb-3">
                  Where to apply
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.jobBoards.map((board: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] px-3 py-1 text-[12px] font-medium text-[var(--lagoon-deep)]"
                    >
                      <Briefcase className="w-3 h-3" />
                      {board}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences recap */}
            <div className="island-shell rounded-2xl p-5">
              <p className="text-[11px] font-medium text-[var(--sea-ink-soft)] uppercase tracking-wider mb-3">
                Your preferences
              </p>
              <div className="space-y-2">
                {[
                  { icon: Wallet, label: "Learning budget", value: data.learningBudget },
                  { icon: MapPin, label: "Work style", value: data.preferredWorkStyle },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-1.5 text-[var(--sea-ink-soft)]">
                      <Icon className="w-3 h-3" />
                      {label}
                    </span>
                    <span className="font-medium text-[var(--sea-ink)] capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── LEARNING ROADMAP ────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-xl bg-[var(--sand)] border border-[var(--chip-line)] flex items-center justify-center text-[var(--lagoon-deep)]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="island-kicker">Step-by-step plan</p>
              <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)]">Learning Roadmap</h2>
            </div>
          </div>

          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[19px] top-10 bottom-10 w-px bg-[var(--line)] hidden sm:block" />

            <div className="space-y-4">
              {data.learningSteps
                .slice()
                .sort((a: any, b: any) => (a.step ?? 0) - (b.step ?? 0))
                .map((step: any, i: number) => (
                  <div key={step.id} className="relative flex gap-5">
                    {/* Step bubble */}
                    <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--lagoon)] text-white text-[13px] font-bold flex items-center justify-center shadow-sm z-10 ring-4 ring-[var(--bg-base)]">
                      {step.step ?? i + 1}
                    </div>

                    {/* Card */}
                    <div className="flex-1 island-shell rounded-2xl p-5 mb-1">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-[15px] text-[var(--sea-ink)] leading-snug">
                          {step.focus}
                        </h3>
                        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${costBadge(step.cost)}`}>
                          {step.cost}
                        </span>
                      </div>

                      <p className="text-[13px] text-[var(--sea-ink-soft)] leading-relaxed mb-3">
                        {step.action}
                      </p>

                      <div className="flex flex-wrap gap-3 text-[12px] text-[var(--sea-ink-soft)]">
                        <span className="inline-flex items-center gap-1.5 bg-[var(--sand)] border border-[var(--line)] rounded-lg px-2.5 py-1">
                          <Sparkles className="w-3 h-3 text-[var(--lagoon)]" />
                          {step.resource}
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-[var(--sand)] border border-[var(--line)] rounded-lg px-2.5 py-1">
                          <Clock className="w-3 h-3 text-[var(--lagoon)]" />
                          {step.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* ── ASSUMPTIONS ─────────────────────────────────── */}
        {data.assumptions?.length > 0 && (
          <section>
            <div className="island-shell rounded-2xl p-5 border border-[var(--chip-line)] bg-[var(--chip-bg)]">
              <p className="text-[11px] font-medium text-[var(--sea-ink-soft)] uppercase tracking-wider mb-3">
                AI Assumptions
              </p>
              <div className="flex flex-col gap-1.5">
                {data.assumptions.map((a: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-[12px] text-[var(--sea-ink-soft)]">
                    <ArrowRight className="w-3 h-3 shrink-0 mt-0.5 text-[var(--lagoon)]" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── FOOTER ACTIONS ──────────────────────────────── */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--line)]">
          <Link
            to="/portal"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2.5 text-[13px] font-medium text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-[var(--surface-strong)] transition no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All recommendations
          </Link>
          <Link
            to="/portal/create"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--cta-bg)] hover:bg-[var(--cta-hover)] text-white px-5 py-2.5 text-[13px] font-medium transition no-underline"
          >
            <Sparkles className="w-3.5 h-3.5" /> Generate new roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}
