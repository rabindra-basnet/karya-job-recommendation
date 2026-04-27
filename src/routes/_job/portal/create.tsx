import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  createRecommendation,
  profileSchema,
} from "@/server-fn/recommendations";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";

// ── route ────────────────────────────────────────────────────

type PortalLoaderData = { hasUsedFreeTier: boolean };

export const Route = createFileRoute("/_job/portal/create")({
  loader: async (): Promise<PortalLoaderData> => {
    const hasUsedFreeTier =
      typeof window !== "undefined"
        ? localStorage.getItem("karya_free_used") === "true"
        : false;
    return { hasUsedFreeTier };
  },
  component: PortalPage,
});

// ── constants ────────────────────────────────────────────────

const STEPS = [
  { label: "Basic profile",      id: "profile"    },
  { label: "Experience",         id: "experience"  },
  { label: "Interests & goals",  id: "goals"       },
] as const;

const FEATURES = [
  { title: "3–5 career paths",       desc: "Matched to your skills and Nepal's job market" },
  { title: "Real skill gap analysis", desc: "Know exactly what to learn next"               },
  { title: "Step-by-step learning",   desc: "Free resources and local opportunities"        },
  { title: "Nepali salary ranges",    desc: "Realistic NPR data for 2024–25"               },
] as const;

const GENERATING_MESSAGES = [
  "Analysing your profile…",
  "Mapping Nepal's job market…",
  "Building your career paths…",
  "Calculating skill gaps…",
  "Finalising your roadmap…",
] as const;

// ── sample profiles ───────────────────────────────────────────

const SAMPLE_PROFILES = [
  {
    label: "CS Graduate",
    name: "Aarav Sharma",
    tag: "Full-stack · Kathmandu",
    color: "text-[var(--cta-bg)]",
    dot: "bg-[var(--cta-bg)]",
    values: {
      fullName:          "Aarav Sharma",
      location:          "Kathmandu",
      degree:            "Bachelors",
      major:             "Computer Science",
      graduationYear:    "2024",
      preferredLanguage: "English",
      technicalSkills:   "React, Node.js, Python, PostgreSQL, Git",
      softSkills:        "Communication, Problem Solving, Teamwork",
      skillLevels:       "React:intermediate, Node.js:beginner, Python:beginner",
      experience:        "6-month intern at Cotiviti Nepal — built React dashboards and REST APIs with Express.js. Wrote unit tests with Jest.",
      projects:          "Job board web app using React and Supabase with real-time notifications. Personal portfolio site with Next.js and Tailwind CSS.",
      interests:         "Full-stack web development, specifically SaaS products and developer tools",
      goals:             "Become a mid-level full-stack developer at a product company in Nepal within a year, then aim for a senior role",
      timeline:          "1 year",
      preferredWorkStyle:"hybrid",
      learningBudget:    "free-only",
    },
  },
  {
    label: "BBA Graduate",
    name: "Priya Thapa",
    tag: "Digital Marketing · Pokhara",
    color: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    values: {
      fullName:          "Priya Thapa",
      location:          "Pokhara",
      degree:            "Bachelors",
      major:             "Business Administration",
      graduationYear:    "2024",
      preferredLanguage: "Nepali/English Mixed",
      technicalSkills:   "MS Excel, Google Analytics, Meta Ads Manager, Canva, WordPress",
      softSkills:        "Communication, Creativity, Leadership, Content Writing",
      skillLevels:       "Excel:intermediate, Canva:intermediate, Google Analytics:beginner",
      experience:        "None (Fresher) — completed a 2-month digital marketing certificate at Broadway Infosys, Kathmandu",
      projects:          "Managed Instagram and Facebook for a local restaurant in Pokhara — grew followers from 200 to 2,400 in 3 months and increased footfall by 18%. Created all visual content using Canva.",
      interests:         "Digital marketing, brand storytelling, e-commerce growth, and social media strategy for Nepali SMEs",
      goals:             "Land a digital marketing role at a growing Nepali startup or agency and specialise in performance marketing",
      timeline:          "6 months",
      preferredWorkStyle:"onsite",
      learningBudget:    "low",
    },
  },
  {
    label: "Civil Engineer",
    name: "Bikash Rai",
    tag: "Structural · Biratnagar",
    color: "text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
    values: {
      fullName:          "Bikash Rai",
      location:          "Biratnagar",
      degree:            "Bachelors",
      major:             "Civil Engineering",
      graduationYear:    "2023",
      preferredLanguage: "English",
      technicalSkills:   "AutoCAD, ETABS, SAP2000, MS Project, SketchUp, Primavera",
      softSkills:        "Leadership, Project Management, Attention to Detail, Site Coordination",
      skillLevels:       "AutoCAD:intermediate, ETABS:beginner, SAP2000:beginner",
      experience:        "1 year at Himalayan Construction Pvt. Ltd., Biratnagar — site supervision and quantity surveying for a G+4 residential building. Coordinated with sub-contractors and managed daily progress reports.",
      projects:          "Final year project: Structural analysis and design of a 5-storey RC frame building using ETABS and AutoCAD, following NBC 105 seismic codes.",
      interests:         "Structural engineering, earthquake-resistant design, and infrastructure development in Nepal's hilly regions",
      goals:             "Grow into a structural design engineer at a reputable consultancy in Nepal and contribute to resilient infrastructure projects",
      timeline:          "1 year",
      preferredWorkStyle:"onsite",
      learningBudget:    "medium",
    },
  },
] as const;

// ── input styles ─────────────────────────────────────────────

const inputBase =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--sand)] px-3 py-2 text-[13px] text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] placeholder:opacity-50 focus:outline-none focus:border-[var(--cta-bg)] focus:bg-[var(--surface-strong)] focus:shadow-sm transition-all duration-200";

const inputErr =
  "w-full rounded-lg border border-destructive/60 bg-[var(--sand)] px-3 py-2 text-[13px] text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] placeholder:opacity-50 focus:outline-none focus:border-destructive focus:shadow-sm transition-all duration-200";

// ── sub-components ───────────────────────────────────────────

function GeneratingOverlay() {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setMsgIdx((i) => (i + 1) % GENERATING_MESSAGES.length),
      2200,
    );
    return () => clearInterval(id);
  }, []);

  return (
    /* Backdrop — uses the page's own bg token so it's tinted in both light & dark */
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 rounded-3xl"
      style={{
        background: "color-mix(in oklab, var(--bg-base) 88%, transparent)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Floating card */}
      <div className="island-shell rounded-2xl px-10 py-8 flex flex-col items-center gap-5 mx-4">
        {/* Spinner */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--cta-bg)]/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-t-[var(--cta-bg)] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[var(--lagoon)]" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-1">
          <p className="text-[13.5px] font-semibold text-[var(--sea-ink)]">
            {GENERATING_MESSAGES[msgIdx]}
          </p>
          <p className="text-[11px] text-[var(--sea-ink-soft)]">
            This takes about 15–30 seconds
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {GENERATING_MESSAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === msgIdx
                  ? "w-5 bg-[var(--cta-bg)]"
                  : "w-1.5 bg-[var(--chip-line)]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PillGroup({
  options,
  value,
  onChange,
}: {
  options: readonly { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
            value === o.value
              ? "bg-[var(--cta-bg)] border-[var(--cta-bg)] text-white"
              : "bg-[var(--sand)] border-[var(--line)] text-[var(--sea-ink-soft)] hover:bg-[var(--foam)] hover:border-[var(--cta-bg)]/40"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  hint,
  optional,
  error,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-[11.5px] font-semibold text-[var(--sea-ink)]">
        {label}{" "}
        {optional && (
          <span className="font-normal text-[var(--sea-ink-soft)] text-[10.5px]">
            (optional)
          </span>
        )}
      </label>
      {children}
      {error && (
        <span className="text-[10.5px] text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" /> {error}
        </span>
      )}
      {hint && !error && (
        <span className="text-[10.5px] text-[var(--sea-ink-soft)]">{hint}</span>
      )}
    </div>
  );
}

function validateStep(step: number, values: Record<string, string>): string | null {
  if (step === 0) {
    if (!values.fullName?.trim()) return "Full name is required";
    if (!values.location?.trim()) return "City / location is required";
    if (!values.technicalSkills?.trim()) return "Please enter at least one technical skill";
  }
  if (step === 1) {
    if (!values.experience?.trim())
      return "Describe your work experience (enter 'None' if fresher)";
  }
  if (step === 2) {
    if (!values.interests?.trim()) return "Please enter your core interests";
    if (!values.goals?.trim()) return "Please describe your career aspirations";
  }
  return null;
}

// ── step tracker (left panel) ─────────────────────────────────

function StepTracker({ current }: { current: number }) {
  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((s, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <div key={s.id} className="flex gap-3">
            {/* connector column */}
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                  done
                    ? "bg-[var(--cta-bg)] border-[var(--cta-bg)]"
                    : active
                    ? "bg-[var(--chip-bg)] border-[var(--cta-bg)]"
                    : "bg-[var(--chip-bg)] border-[var(--line)]"
                }`}
              >
                {done ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <span
                    className={`text-[10px] font-bold ${
                      active ? "text-[var(--cta-bg)]" : "text-[var(--sea-ink-soft)]"
                    }`}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-px flex-1 my-1 transition-all duration-500 ${
                    done ? "bg-[var(--cta-bg)]/40" : "bg-[var(--line)]"
                  }`}
                  style={{ minHeight: "28px" }}
                />
              )}
            </div>
            {/* label */}
            <div className="pb-7">
              <p
                className={`text-[12.5px] font-semibold leading-snug transition-colors ${
                  active
                    ? "text-[var(--sea-ink)]"
                    : done
                    ? "text-[var(--cta-bg)]"
                    : "text-[var(--sea-ink-soft)]"
                }`}
              >
                {s.label}
              </p>
              {active && (
                <p className="text-[11px] text-[var(--sea-ink-soft)] mt-0.5">
                  Current step
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────

type ProfileFormValues = z.infer<typeof profileSchema>;

function PortalPage() {
  const navigate     = useNavigate();
  const router       = useRouter();
  const queryClient  = useQueryClient();
  const [step, setStep]             = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepError, setStepError]   = useState<string | null>(null);

  const { hasUsedFreeTier: initFree } = Route.useLoaderData();
  const [hasUsedFreeTier] = useState(initFree);
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const isLoggedIn = !!session?.user;
  const isBlocked  = hasUsedFreeTier && !isLoggedIn;

  const progress = ((step + 1) / STEPS.length) * 100;

  const form = useForm({
    defaultValues: {
      fullName:          "",
      location:          "",
      degree:            "Bachelors",
      major:             "",
      graduationYear:    "",
      preferredLanguage: "English",
      technicalSkills:   "",
      softSkills:        "",
      skillLevels:       "",
      experience:        "",
      projects:          "",
      interests:         "",
      goals:             "",
      timeline:          "1 year",
      preferredWorkStyle:"hybrid",
      learningBudget:    "free-only",
    },
    validators: { onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      if (isBlocked) {
        toast.error("You've used your free generation. Please sign in to continue.");
        return;
      }
      setIsGenerating(true);
      try {
        const res = await createRecommendation({ data: value as ProfileFormValues });
        if (!isLoggedIn) localStorage.setItem("karya_free_used", "true");
        // Bust the portal list cache so navigating back shows the new entry immediately
        await queryClient.invalidateQueries({ queryKey: ["recommendations"] });
        router.invalidate();
        navigate({ to: "/portal/$id", params: { id: res.id as string } });
      } catch (err: any) {
        setIsGenerating(false);
        toast.error(err.message || "Something went wrong. Please try again.");
      }
    },
  });

  const handleNext = useCallback(() => {
    const err = validateStep(step, form.state.values as Record<string, string>);
    if (err) { setStepError(err); return; }
    setStepError(null);
    setStep((s) => s + 1);
  }, [step, form.state.values]);

  const handleBack = useCallback(() => {
    setStepError(null);
    setStep((s) => s - 1);
  }, []);

  const fillProfile = useCallback(
    (profile: (typeof SAMPLE_PROFILES)[number]["values"]) => {
      (Object.keys(profile) as (keyof typeof profile)[]).forEach((key) => {
        form.setFieldValue(key, profile[key] as any);
      });
      setStepError(null);
      setStep(0);
    },
    [form],
  );

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4 relative">

      {/* Floating back button — same pattern as login/signup */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/portal"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] no-underline transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Portal
        </Link>
      </div>

      {/* Card — capped to viewport height so only inner panel scrolls */}
      <div
        className="w-full max-w-5xl island-shell rounded-3xl overflow-hidden flex relative"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >

          {isGenerating && <GeneratingOverlay />}

          {/* ── LEFT PANEL ────────────────────────────── */}
          <div className="hidden md:flex w-[36%] flex-col p-8 bg-[linear-gradient(160deg,var(--hero-a),var(--hero-b))] border-r border-[var(--line)] overflow-hidden">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-[var(--lagoon)] bg-[var(--chip-bg)] border border-[var(--chip-line)] rounded-full px-3 py-1 mb-6 self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--lagoon)]" />
              Karya AI · Nepal
            </div>

            {/* Heading */}
            <h1 className="display-title text-[1.85rem] font-bold leading-snug text-[var(--sea-ink)] mb-2">
              Your career,
              <br />
              <em className="italic text-[var(--cta-bg)]">mapped here.</em>
            </h1>
            <p className="text-[12.5px] text-[var(--sea-ink-soft)] leading-relaxed mb-7 border-l-2 border-[var(--cta-bg)]/40 pl-3">
              Answer 3 quick steps and get a personalized AI career roadmap
              built for Nepal's job market.
            </p>

            {/* Step tracker */}
            <div className="mb-6">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--sea-ink-soft)] mb-3">
                Your progress
              </p>
              <StepTracker current={step} />
            </div>

            {/* Features */}
            <div className="space-y-3 mt-auto">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-[var(--cta-bg)]" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold text-[var(--sea-ink)] leading-tight">
                      {f.title}
                    </p>
                    <p className="text-[11px] text-[var(--sea-ink-soft)] mt-0.5">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL ───────────────────────────── */}
          <div className="flex-1 flex flex-col bg-[var(--surface)] min-w-0 overflow-hidden">

            {/* Free-tier banner — hidden while session is still loading to avoid flicker */}
            {!sessionPending && !isLoggedIn && (
              <div className="mx-6 mt-5 flex items-start gap-2.5 bg-[var(--chip-bg)] border border-[var(--chip-line)] rounded-xl px-3.5 py-2.5">
                <Lock className="w-3.5 h-3.5 text-[var(--lagoon)] shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-[var(--sea-ink-soft)] leading-relaxed">
                  You have{" "}
                  <span className="font-semibold text-[var(--sea-ink)]">1 free roadmap</span>{" "}
                  without signing in.{" "}
                  <Link to="/login" className="text-[var(--cta-bg)] underline underline-offset-2 font-medium">
                    Sign in
                  </Link>{" "}
                  to save and unlock unlimited generations.
                </p>
              </div>
            )}

            {/* Step header */}
            <div className="px-7 pt-6 pb-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--sea-ink-soft)]">
                  Step {step + 1} of {STEPS.length}
                </p>
                {/* Mobile step dots */}
                <div className="flex items-center gap-1 md:hidden">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === step
                          ? "w-4 bg-[var(--cta-bg)]"
                          : i < step
                          ? "w-1.5 bg-[var(--cta-bg)]/40"
                          : "w-1.5 bg-[var(--chip-line)]"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[18px] font-bold text-[var(--sea-ink)] mb-4">
                {STEPS[step].label}
              </p>
              {/* Progress bar */}
              <div className="h-1 bg-[var(--line)] rounded-full overflow-hidden mb-5">
                <div
                  className="h-full bg-[var(--cta-bg)] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 px-7 overflow-y-auto pb-4">

                {/* ── STEP 1: Basic Profile ──────────── */}
                {step === 0 && (
                  <>
                    {/* Sample profile picker */}
                    <div className="mb-5">
                      <p className="text-[10.5px] font-semibold tracking-widest uppercase text-[var(--sea-ink-soft)] mb-2">
                        Quick start — try a sample
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {SAMPLE_PROFILES.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => fillProfile(p.values)}
                            className="group flex flex-col gap-1 rounded-xl border border-[var(--line)] bg-[var(--sand)] px-3 py-2.5 text-left transition hover:border-[var(--cta-bg)]/50 hover:bg-[var(--surface-strong)] hover:shadow-sm"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.dot}`} />
                              <span className={`text-[11.5px] font-semibold ${p.color}`}>
                                {p.label}
                              </span>
                            </span>
                            <span className="text-[10.5px] text-[var(--sea-ink-soft)] leading-snug">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-[var(--sea-ink-soft)] opacity-70">
                              {p.tag}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 h-px bg-[var(--line)]" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Full name">
                        <form.Field name="fullName">
                          {(field) => (
                            <input
                              className={inputBase}
                              placeholder="Aarav Sharma"
                              value={field.state.value}
                              onChange={(e) => { field.handleChange(e.target.value); setStepError(null); }}
                            />
                          )}
                        </form.Field>
                      </Field>
                      <Field label="City, Nepal">
                        <form.Field name="location">
                          {(field) => (
                            <input
                              className={inputBase}
                              placeholder="Kathmandu"
                              value={field.state.value}
                              onChange={(e) => { field.handleChange(e.target.value); setStepError(null); }}
                            />
                          )}
                        </form.Field>
                      </Field>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Degree">
                        <form.Field name="degree">
                          {(field) => (
                            <select
                              className={inputBase}
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                            >
                              {["Bachelors", "Masters", "PhD", "Diploma", "Other"].map((d) => (
                                <option key={d}>{d}</option>
                              ))}
                            </select>
                          )}
                        </form.Field>
                      </Field>
                      <Field label="Major">
                        <form.Field name="major">
                          {(field) => (
                            <input
                              className={inputBase}
                              placeholder="Computer Science"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                            />
                          )}
                        </form.Field>
                      </Field>
                      <Field label="Grad. year">
                        <form.Field name="graduationYear">
                          {(field) => (
                            <input
                              className={inputBase}
                              placeholder="2025"
                              type="number"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                            />
                          )}
                        </form.Field>
                      </Field>
                    </div>

                    <Field label="Preferred language">
                      <form.Field name="preferredLanguage">
                        {(field) => (
                          <PillGroup
                            options={[
                              { label: "English",    value: "English"               },
                              { label: "Nepali",     value: "Nepali"                },
                              { label: "Mixed",      value: "Nepali/English Mixed"  },
                            ]}
                            value={field.state.value}
                            onChange={(v) => field.handleChange(v)}
                          />
                        )}
                      </form.Field>
                    </Field>

                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <Field label="Technical skills" hint="Separate with commas">
                        <form.Field name="technicalSkills">
                          {(field) => (
                            <textarea
                              rows={3}
                              className={inputBase}
                              placeholder="React, Node.js, Python…"
                              value={field.state.value}
                              onChange={(e) => { field.handleChange(e.target.value); setStepError(null); }}
                            />
                          )}
                        </form.Field>
                      </Field>
                      <Field label="Soft skills" optional>
                        <form.Field name="softSkills">
                          {(field) => (
                            <textarea
                              rows={3}
                              className={inputBase}
                              placeholder="Communication, leadership…"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                            />
                          )}
                        </form.Field>
                      </Field>
                    </div>

                    <Field label="Skill levels" optional hint="Format: React:intermediate, Python:beginner">
                      <form.Field name="skillLevels">
                        {(field) => (
                          <input
                            className={inputBase}
                            placeholder="React:intermediate, Node.js:beginner…"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        )}
                      </form.Field>
                    </Field>
                  </>
                )}

                {/* ── STEP 2: Experience ────────────── */}
                {step === 1 && (
                  <>
                    <Field label="Work experience" hint="Company · duration · what you built">
                      <form.Field name="experience">
                        {(field) => (
                          <textarea
                            rows={5}
                            className={inputBase}
                            placeholder="3-month intern at Leapfrog Technology — built REST APIs with Node.js and deployed on AWS..."
                            value={field.state.value}
                            onChange={(e) => { field.handleChange(e.target.value); setStepError(null); }}
                          />
                        )}
                      </form.Field>
                    </Field>

                    <Field label="Personal projects" optional hint="Even small projects signal real-world ability">
                      <form.Field name="projects">
                        {(field) => (
                          <textarea
                            rows={5}
                            className={inputBase}
                            placeholder="Built a job board with React + Supabase. Created a Nepali news summariser using GPT-4…"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        )}
                      </form.Field>
                    </Field>
                  </>
                )}

                {/* ── STEP 3: Goals & Preferences ───── */}
                {step === 2 && (
                  <>
                    <Field label="Core interests" hint={`Be specific — "NLP chatbots" beats just "AI"`}>
                      <form.Field name="interests">
                        {(field) => (
                          <input
                            className={inputBase}
                            placeholder="AI — specifically NLP and chatbots…"
                            value={field.state.value}
                            onChange={(e) => { field.handleChange(e.target.value); setStepError(null); }}
                          />
                        )}
                      </form.Field>
                    </Field>

                    <Field label="Career aspirations">
                      <form.Field name="goals">
                        {(field) => (
                          <textarea
                            rows={3}
                            className={inputBase}
                            placeholder="Become a senior full-stack developer at a product company…"
                            value={field.state.value}
                            onChange={(e) => { field.handleChange(e.target.value); setStepError(null); }}
                          />
                        )}
                      </form.Field>
                    </Field>

                    <Field label="Goal timeline">
                      <form.Field name="timeline">
                        {(field) => (
                          <PillGroup
                            options={[
                              { label: "6 months", value: "6 months" },
                              { label: "1 year",   value: "1 year"   },
                              { label: "2 years",  value: "2 years"  },
                              { label: "3+ years", value: "3+ years" },
                            ]}
                            value={field.state.value}
                            onChange={(v) => field.handleChange(v)}
                          />
                        )}
                      </form.Field>
                    </Field>

                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <Field label="Work style">
                        <form.Field name="preferredWorkStyle">
                          {(field) => (
                            <PillGroup
                              options={[
                                { label: "Remote",        value: "remote"  },
                                { label: "Hybrid",        value: "hybrid"  },
                                { label: "Onsite",        value: "onsite"  },
                                { label: "No preference", value: "any"     },
                              ]}
                              value={field.state.value}
                              onChange={(v) => field.handleChange(v)}
                            />
                          )}
                        </form.Field>
                      </Field>
                      <Field label="Learning budget">
                        <form.Field name="learningBudget">
                          {(field) => (
                            <PillGroup
                              options={[
                                { label: "Free only",      value: "free-only" },
                                { label: "Under NPR 5k",   value: "low"       },
                                { label: "NPR 5–20k",      value: "medium"    },
                                { label: "Any budget",     value: "any"       },
                              ]}
                              value={field.state.value}
                              onChange={(v) => field.handleChange(v)}
                            />
                          )}
                        </form.Field>
                      </Field>
                    </div>
                  </>
                )}

                {/* Step error */}
                {stepError && (
                  <div className="flex items-center gap-2 text-[12px] text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-3.5 py-2.5 mt-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {stepError}
                  </div>
                )}

                {/* Blocked state */}
                {isBlocked && step === STEPS.length - 1 && (
                  <div className="flex items-start gap-2.5 text-[12px] bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300 rounded-xl px-3.5 py-2.5 mt-2">
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      Free generation used.{" "}
                      <Link to="/login" className="underline font-semibold">Sign in</Link>{" "}
                      to generate your roadmap.
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-7 py-4 border-t border-[var(--line)] flex items-center justify-between bg-[var(--surface-strong)] shrink-0">
                <span className="text-[11px] text-[var(--sea-ink-soft)]">
                  {step + 1} / {STEPS.length} — {STEPS[step].label}
                </span>

                <div className="flex gap-2">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[12.5px] font-medium text-[var(--sea-ink-soft)] hover:bg-[var(--sand)] hover:text-[var(--sea-ink)] transition disabled:opacity-50"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  )}

                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-cta rounded-lg"
                    >
                      Next <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => form.handleSubmit()}
                      disabled={form.state.isSubmitting || isGenerating || isBlocked}
                      className="btn-cta btn-cta-lg rounded-xl min-w-[160px] justify-center disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating…
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Build my roadmap
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
    </div>
  );
}
