import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";
import {
  createRecommendation,
  profileSchema,
} from "@/server-fn/recommendations";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as z from "zod";

type PortalLoaderData = {
  isLoggedIn: boolean;
  hasUsedFreeTier: boolean;
};

export const Route = createFileRoute("/_job/portal/create")({
  loader: async (): Promise<PortalLoaderData> => {
    const isLoggedIn = true;
    const hasUsedFreeTier =
      typeof window !== "undefined"
        ? localStorage.getItem("karya_free_used") === "true"
        : false;
    return { isLoggedIn, hasUsedFreeTier };
  },
  component: PortalPage,
});

const STEPS = [
  { label: "Basic profile", id: "profile" },
  { label: "Experience", id: "experience" },
  { label: "Interests & goals", id: "goals" },
];

const LEFT_PANEL_DATA = {
  badge: { label: "Karya AI · Nepal", dot: true },
  hero: {
    title: "Your career,",
    highlight: "mapped here.",
    description:
      "Answer 5 quick steps and get a personalized career roadmap built for Nepal's job market.",
  },
  steps: ["profile", "skills", "experience", "goals", "prefs"],
  features: [
    {
      title: "3–5 career paths",
      desc: "Matched to your skills and Nepal's job market",
    },
    {
      title: "Real skill gap analysis",
      desc: "Know exactly what to learn next",
    },
    {
      title: "Step-by-step learning",
      desc: "Free resources, local opportunities",
    },
    { title: "Nepali salary ranges", desc: "Realistic NPR data for 2024–25" },
  ],
  testimonial: {
    text: "Karya gave me a clear path when I had no idea where to start after graduation.",
    author: "— Test",
  },
};

// Loading overlay shown while AI generates the roadmap
function GeneratingOverlay() {
  const messages = [
    "Analysing your profile…",
    "Mapping Nepal's job market…",
    "Building your career paths…",
    "Calculating skill gaps…",
    "Finalising your roadmap…",
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  // Rotate messages every 2s
  useState(() => {
    const id = setInterval(
      () => setMsgIndex((i) => (i + 1) % messages.length),
      2000,
    );
    return () => clearInterval(id);
  });

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-(--surface)/90 backdrop-blur-sm rounded-2xl gap-5">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-(--palm)/20 animate-ping" />
        <div className="absolute inset-0 rounded-full border-2 border-t-(--palm) border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full bg-(--chip-bg) flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-(--lagoon)" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-(--sea-ink) transition-all duration-500">
          {messages[msgIndex]}
        </p>
        <p className="text-[11px] text-muted-foreground">
          This takes about 15–30 seconds
        </p>
      </div>
      <div className="flex gap-1.5">
        {messages.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === msgIndex ? "w-4 bg-(--lagoon)" : "w-1 bg-(--chip-line)"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function PillGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
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
              ? "bg-(--palm) border-(--palm) text-white"
              : "bg-(--sand) border-(--line) text-(--sea-ink-soft) hover:bg-(--foam)"
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
      <label className="text-xs font-medium text-(--sea-ink)">
        {label}{" "}
        {optional && (
          <span className="font-normal text-muted-foreground text-[10.5px]">
            (optional)
          </span>
        )}
      </label>
      {children}
      {error && (
        <span className="text-[10.5px] text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </span>
      )}
      {hint && !error && (
        <span className="text-[10.5px] text-muted-foreground">{hint}</span>
      )}
    </div>
  );
}

const inputBaseClass =
  "bg-[var(--sand)] border border-[var(--line)] rounded-lg px-3 py-2 text-[13px] text-[var(--sea-ink)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--lagoon-deep)] focus:bg-[var(--surface-strong)] focus:shadow-sm transition-all duration-200 w-full";

const inputErrorClass =
  "bg-[var(--sand)] border border-destructive/60 rounded-lg px-3 py-2 text-[13px] text-[var(--sea-ink)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-destructive focus:shadow-sm transition-all duration-200 w-full";

// Validate required fields per step before advancing
function validateStep(
  step: number,
  values: Record<string, string>,
): string | null {
  if (step === 0) {
    if (!values.fullName?.trim()) return "Full name is required";
    if (!values.location?.trim()) return "Location is required";
    if (!values.technicalSkills?.trim())
      return "Please enter at least one technical skill";
  }
  if (step === 1) {
    if (!values.experience?.trim())
      return "Please describe your work experience (enter 'None' if you have none)";
  }
  if (step === 2) {
    if (!values.interests?.trim()) return "Please enter your core interests";
    if (!values.goals?.trim()) return "Please describe your career aspirations";
  }
  return null;
}

function FreeTierBanner({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) return null;
  return (
    <div className="mx-8 mt-4 flex items-start gap-2.5 bg-(--chip-bg) border border-(--chip-line) rounded-lg px-3.5 py-2.5">
      <Lock className="w-3.5 h-3.5 text-(--lagoon) shrink-0 mt-0.5" />
      <p className="text-[11.5px] text-(--sea-ink-soft) leading-relaxed">
        You have{" "}
        <span className="font-semibold text-(--sea-ink)">1 free roadmap</span>{" "}
        without signing in.{" "}
        <Link
          to="/login"
          className="text-(--lagoon) underline underline-offset-2"
        >
          Sign in
        </Link>{" "}
        to save and unlock unlimited generations.
      </p>
    </div>
  );
}
type ProfileFormValues = z.infer<typeof profileSchema>;

function PortalPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const { isLoggedIn, hasUsedFreeTier: initialFreeTierUsed } =
    Route.useLoaderData();
  const [hasUsedFreeTier] = useState(initialFreeTierUsed);

  const isBlocked = hasUsedFreeTier && !isLoggedIn;

  const form = useForm({
    defaultValues: {
      fullName: "Rabindra Basnet",
      location: "Kathmandu",
      degree: "Bachelors",
      major: "Computer Science",
      graduationYear: "2026",
      preferredLanguage: "English",
      technicalSkills: "React",
      softSkills: "Communication",
      skillLevels: "",
      experience: "None",
      projects: "",
      interests: "",
      goals: "",
      timeline: "1 year",
      preferredWorkStyle: "hybrid",
      learningBudget: "free-only",
    },
    validators: {
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("initial Value", value);
      if (isBlocked) {
        toast.error(
          "You've used your free generation. Please sign in to continue.",
        );
        return;
      }

      setIsGenerating(true);
      try {
        const res = await createRecommendation({
          data: value as ProfileFormValues,
        });

        if (!isLoggedIn) {
          localStorage.setItem("karya_free_used", "true");
        }
        console.log(res);
        router.invalidate();
        navigate({ to: "/portal/$id", params: { id: res.id as string } });
      } catch (err: any) {
        console.error(err);
        setIsGenerating(false);
        toast.error(err.message || "Something went wrong. Please try again.");
      } finally {
        setIsGenerating(false);
      }
      // Note: don't set isGenerating(false) on success — we navigate away
    },
  });

  const handleNext = useCallback(() => {
    const error = validateStep(
      step,
      form.state.values as Record<string, string>,
    );
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setStep((s) => s + 1);
  }, [step, form.state.values]);

  const handleBack = useCallback(() => {
    setStepError(null);
    setStep((s) => s - 1);
  }, []);

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4 font-sans">
      <div className="absolute top-5 left-5 z-10">
        <Button
          asChild
          variant="link"
          className="text-(--sea-ink-soft) hover:text-(--sea-ink)"
        >
          <Link to="/">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Home
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-5xl flex rounded-2xl overflow-hidden island-shell min-h-150 relative">
        {/* Generating overlay covers the whole card */}
        {isGenerating && <GeneratingOverlay />}

        {/* Left Panel */}
        <div className="w-[40%] flex flex-col p-8 relative text-[var(--sea-ink)] bg-[linear-gradient(145deg,var(--hero-a),var(--hero-b))] backdrop-blur-md border-r border-[var(--line)]">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-widest uppercase text-[var(--lagoon)] bg-[var(--chip-bg)] border border-[var(--chip-line)] rounded-full px-3 py-1 mb-6">
              {LEFT_PANEL_DATA.badge.dot && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--lagoon)]" />
              )}
              {LEFT_PANEL_DATA.badge.label}
            </div>
            <h1 className="text-[2rem] font-normal leading-tight mb-3 font-heading">
              {LEFT_PANEL_DATA.hero.title}
              <br />
              <em className="italic text-[var(--lagoon)]">
                {LEFT_PANEL_DATA.hero.highlight}
              </em>
            </h1>
            <p className="text-[13px] text-[var(--sea-ink-soft)] leading-relaxed mb-8 border-l border-[var(--lagoon-deep)] pl-3">
              {LEFT_PANEL_DATA.hero.description}
            </p>
            <div className="flex items-center gap-1.5 mb-8">
              {LEFT_PANEL_DATA.steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-5 bg-[var(--lagoon)]"
                      : "w-1.5 bg-[var(--chip-line)]"
                  }`}
                />
              ))}
            </div>
            <div className="space-y-4">
              {LEFT_PANEL_DATA.features.map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-[var(--lagoon)]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[var(--sea-ink)] leading-tight">
                      {f.title}
                    </p>
                    <p className="text-[12px] text-[var(--sea-ink-soft)] mt-0.5">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-[var(--line)] pt-5 mt-6">
            <p className="text-[12px] text-[var(--sea-ink-soft)] italic leading-relaxed">
              "{LEFT_PANEL_DATA.testimonial.text}"
            </p>
            <p className="text-[11.5px] text-[var(--lagoon)] font-medium mt-2 not-italic">
              {LEFT_PANEL_DATA.testimonial.author}
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-(--surface) flex flex-col">
          {/* Free-tier nudge banner */}
          <FreeTierBanner isLoggedIn={isLoggedIn} />

          <div className="px-8 pt-6 pb-0">
            <p className="text-[10.5px] font-medium tracking-widest uppercase text-muted-foreground mb-0.5">
              Step {step + 1} of {STEPS.length}
            </p>
            <p className="text-[17px] font-medium text-(--sea-ink) mb-4">
              {STEPS[step].label}
            </p>
            <div className="h-0.5 bg-(--line) rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-(--palm) rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex flex-col flex-1 relative"
          >
            <div className="flex-1 px-8 overflow-y-auto pb-4 relative z-0">
              {/* Step 1 — Basic Profile */}
              {step === 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Full name">
                      <form.Field name="fullName">
                        {(field) => (
                          <input
                            className={inputBaseClass}
                            placeholder="Aarav Sharma"
                            value={field.state.value}
                            onChange={(e) => {
                              field.handleChange(e.target.value);
                              setStepError(null);
                            }}
                          />
                        )}
                      </form.Field>
                    </Field>
                    <Field label="City, Nepal">
                      <form.Field name="location">
                        {(field) => (
                          <input
                            className={inputBaseClass}
                            placeholder="Kathmandu"
                            value={field.state.value}
                            onChange={(e) => {
                              field.handleChange(e.target.value);
                              setStepError(null);
                            }}
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
                            className={inputBaseClass}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          >
                            <option value="">Select</option>
                            {[
                              "Bachelors",
                              "Masters",
                              "PhD",
                              "Diploma",
                              "Other",
                            ].map((d) => (
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
                            className={inputBaseClass}
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
                            className={inputBaseClass}
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
                            { label: "English", value: "English" },
                            { label: "Nepali", value: "Nepali" },
                            { label: "Mixed", value: "Nepali/English Mixed" },
                          ]}
                          value={field.state.value}
                          onChange={(v) => field.handleChange(v)}
                        />
                      )}
                    </form.Field>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Technical skills" hint="Separate with commas">
                      <form.Field name="technicalSkills">
                        {(field) => (
                          <textarea
                            className={inputBaseClass}
                            placeholder="React, Node.js, Python, AutoCAD..."
                            value={field.state.value}
                            onChange={(e) => {
                              field.handleChange(e.target.value);
                              setStepError(null);
                            }}
                          />
                        )}
                      </form.Field>
                    </Field>
                    <Field label="Soft skills" optional>
                      <form.Field name="softSkills">
                        {(field) => (
                          <textarea
                            className={inputBaseClass}
                            placeholder="Communication, leadership, teamwork..."
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        )}
                      </form.Field>
                    </Field>
                  </div>
                  <Field
                    label="Skill levels"
                    optional
                    hint="Format: skill:level"
                  >
                    <form.Field name="skillLevels">
                      {(field) => (
                        <textarea
                          className={inputBaseClass}
                          placeholder="React:intermediate, Node.js:beginner..."
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    </form.Field>
                  </Field>
                </>
              )}

              {/* Step 2 — Experience */}
              {step === 1 && (
                <>
                  <Field
                    label="Work experience"
                    hint="Company · duration · what you built"
                  >
                    <form.Field name="experience">
                      {(field) => (
                        <textarea
                          className={inputBaseClass}
                          rows={4}
                          placeholder="3-month intern at Leapfrog Technology — built REST APIs..."
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                            setStepError(null);
                          }}
                        />
                      )}
                    </form.Field>
                  </Field>
                  <Field
                    label="Personal projects"
                    optional
                    hint="Even small projects signal real-world ability"
                  >
                    <form.Field name="projects">
                      {(field) => (
                        <textarea
                          className={inputBaseClass}
                          rows={4}
                          placeholder="Built a chatbot using OpenAI API..."
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      )}
                    </form.Field>
                  </Field>
                </>
              )}

              {/* Step 3 — Interests & Goals */}
              {step === 2 && (
                <>
                  <Field
                    label="Core interests"
                    hint={`"AI chatbots" beats just "AI"`}
                  >
                    <form.Field name="interests">
                      {(field) => (
                        <input
                          className={inputBaseClass}
                          placeholder="AI — specifically NLP and chatbots..."
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                            setStepError(null);
                          }}
                        />
                      )}
                    </form.Field>
                  </Field>
                  <Field label="Career aspirations">
                    <form.Field name="goals">
                      {(field) => (
                        <textarea
                          className={inputBaseClass}
                          rows={4}
                          placeholder="Senior Full Stack Developer..."
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                            setStepError(null);
                          }}
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
                            { label: "1 year", value: "1 year" },
                            { label: "2 years", value: "2 years" },
                            { label: "3+ years", value: "3+ years" },
                          ]}
                          value={field.state.value}
                          onChange={(v) => field.handleChange(v)}
                        />
                      )}
                    </form.Field>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Work style">
                      <form.Field name="preferredWorkStyle">
                        {(field) => (
                          <PillGroup
                            options={[
                              { label: "Remote", value: "remote" },
                              { label: "Hybrid", value: "hybrid" },
                              { label: "Onsite", value: "onsite" },
                              { label: "No preference", value: "any" },
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
                              { label: "Free only", value: "free-only" },
                              { label: "Under NPR 5,000", value: "low" },
                              { label: "NPR 5–20k", value: "medium" },
                              { label: "Any budget", value: "any" },
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

              {/* Inline step validation error */}
              {stepError && (
                <div className="flex items-center gap-2 text-[12px] text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {stepError}
                </div>
              )}

              {/* Blocked state — free tier exhausted */}
              {isBlocked && step === STEPS.length - 1 && (
                <div className="flex items-start gap-2.5 text-[12px] bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2.5 mt-2">
                  <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    Free generation used.{" "}
                    <Link to="/login" className="underline font-medium">
                      Sign in
                    </Link>{" "}
                    to generate your roadmap.
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-(--line) flex items-center justify-between bg-(--surface-strong) relative z-10">
              <span className="text-[11px] text-muted-foreground">
                {step + 1} / {STEPS.length} complete
              </span>
              <div className="flex gap-2">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isGenerating}
                    className="border-(--line) text-(--sea-ink-soft) hover:bg-(--sand) hover:text-(--sea-ink)"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" /> Back
                  </Button>
                )}
                {step < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-(--palm) hover:bg-(--lagoon-deep) text-white"
                  >
                    Next <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={
                      form.state.isSubmitting || isGenerating || isBlocked
                    }
                    className="bg-(--palm) hover:bg-(--lagoon-deep) text-white font-serif italic disabled:opacity-50 min-w-[160px]"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-2" />
                        Build my roadmap
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
