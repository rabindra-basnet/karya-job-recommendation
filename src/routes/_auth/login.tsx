import { authClient } from "@/lib/auth-client";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

const LEFT_PANEL = {
  kicker: "Karya AI · Nepal",
  title: { pre: "Welcome", highlight: " back.", post: "" },
  description:
    "Your career roadmap is waiting. Log in to access your personalized recommendations and track your progress.",
  benefits: [
    { title: "Your saved roadmaps", desc: "Pick up exactly where you left off" },
    { title: "Unlimited generations", desc: "Build as many roadmaps as you need" },
    { title: "Nepal-first guidance", desc: "Real jobs, real salaries, real paths" },
  ],
};

function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    const { error } = await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/portal",
        rememberMe: true,
      },
      {
        onError: (ctx) => setServerError(ctx.error.message ?? "Login failed"),
      },
    );
    if (error) {
      setServerError(error.message ?? "Login failed");
      return;
    }
    navigate({ to: "/portal" });
  }

  const inputBase =
    "w-full rounded-lg border border-[var(--line)] bg-[var(--sand)] px-3 py-2.5 text-[13px] text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] opacity-60 focus:opacity-100 focus:outline-none focus:border-[var(--lagoon-deep)] focus:bg-[var(--surface-strong)] focus:shadow-sm transition-all duration-200";
  const inputError =
    "w-full rounded-lg border border-destructive/60 bg-[var(--sand)] px-3 py-2.5 text-[13px] text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:outline-none focus:border-destructive focus:shadow-sm transition-all duration-200";

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden island-shell min-h-[520px]">
        {/* Left panel */}
        <div className="hidden md:flex w-[42%] flex-col p-8 bg-[linear-gradient(145deg,var(--hero-a),var(--hero-b))] border-r border-[var(--line)]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-widest uppercase text-[var(--lagoon)] bg-[var(--chip-bg)] border border-[var(--chip-line)] rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--lagoon)]" />
              {LEFT_PANEL.kicker}
            </div>

            <h1 className="display-title text-[2.1rem] font-normal leading-tight mb-3 text-[var(--sea-ink)]">
              {LEFT_PANEL.title.pre}
              <em className="italic text-[var(--lagoon)]">{LEFT_PANEL.title.highlight}</em>
              {LEFT_PANEL.title.post}
            </h1>

            <p className="text-[13px] text-[var(--sea-ink-soft)] leading-relaxed mb-8 border-l border-[var(--lagoon-deep)] pl-3">
              {LEFT_PANEL.description}
            </p>

            <div className="space-y-4">
              {LEFT_PANEL.benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-[var(--lagoon)]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[var(--sea-ink)] leading-tight">
                      {b.title}
                    </p>
                    <p className="text-[12px] text-[var(--sea-ink-soft)] mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-[var(--line)]">
            <p className="text-[12px] text-[var(--sea-ink-soft)]">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-[var(--lagoon-deep)] hover:underline"
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-[var(--surface)] flex flex-col justify-center px-8 py-10">
          <div className="max-w-sm mx-auto w-full">
            {/* Mobile brand */}
            <div className="mb-6 md:hidden">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-widest uppercase text-[var(--lagoon)] bg-[var(--chip-bg)] border border-[var(--chip-line)] rounded-full px-3 py-1 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--lagoon)]" />
                Karya AI
              </div>
            </div>

            <p className="text-[10.5px] font-medium tracking-widest uppercase text-muted-foreground mb-1">
              Welcome back
            </p>
            <h2 className="text-[22px] font-semibold text-[var(--sea-ink)] mb-6">
              Log in to your account
            </h2>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--sea-ink)]">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={form.formState.errors.email ? inputError : inputBase}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <span className="flex items-center gap-1 text-[10.5px] text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    {form.formState.errors.email.message}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--sea-ink)]">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`${form.formState.errors.password ? inputError : inputBase} pr-10`}
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <span className="flex items-center gap-1 text-[10.5px] text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    {form.formState.errors.password.message}
                  </span>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-[12px] text-destructive">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {serverError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[var(--cta-bg)] hover:bg-[var(--cta-hover)] text-white font-medium text-[13px] py-2.5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Logging in…
                  </>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[12px] text-[var(--sea-ink-soft)] md:hidden">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-[var(--lagoon-deep)] hover:underline"
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
