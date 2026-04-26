import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });
  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="page-wrap px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <div className="island-kicker mb-3">Welcome back</div>
          <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
            Log in to Karya
          </h1>
          <p className="mt-3 text-sm text-[var(--sea-ink-soft)] sm:text-base">
            Continue your career roadmap and recommendations.
          </p>
        </div>

        <div className="island-shell rounded-[2rem] p-6 sm:p-8">
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              setError(null);
              try {
                const { error } = await authClient.signIn.email(
                  {
                    email: values.email,
                    password: values.password,
                    callbackURL: "/",
                    rememberMe: true,
                  },
                  {
                    onError: (ctx) => setError(ctx.error.message ?? null),
                  },
                );

                if (error) setError(error.message ?? null);

                await router.invalidate();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Login failed");
              }
            })}
          >
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--sea-ink)]">
                Email
              </label>
              <Input
                type="email"
                {...form.register("email")}
                required
                placeholder="you@example.com"
                className="h-11 rounded-xl border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink)] placeholder:text-[color-mix(in_oklab,var(--sea-ink-soft)_82%,transparent)] focus-visible:border-[var(--lagoon-deep)] focus-visible:ring-[3px] focus-visible:ring-[rgba(79,184,178,0.25)]"
              />
              {form.formState.errors.email?.message ? (
                <div className="text-sm text-[rgba(154,103,67,0.95)]">
                  {form.formState.errors.email.message}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--sea-ink)]">
                Password
              </label>
              <Input
                type="password"
                {...form.register("password")}
                required
                placeholder="••••••••"
                className="h-11 rounded-xl border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink)] placeholder:text-[color-mix(in_oklab,var(--sea-ink-soft)_82%,transparent)] focus-visible:border-[var(--lagoon-deep)] focus-visible:ring-[3px] focus-visible:ring-[rgba(79,184,178,0.25)]"
              />
              {form.formState.errors.password?.message ? (
                <div className="text-sm text-[rgba(154,103,67,0.95)]">
                  {form.formState.errors.password.message}
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-xl border border-[rgba(154,103,67,0.35)] bg-[rgba(154,103,67,0.10)] px-4 py-3 text-sm text-[var(--sea-ink)]">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full rounded-xl font-bold bg-[var(--sea-ink)] text-white hover:bg-[var(--sea-ink-soft)] dark:bg-[var(--lagoon-deep)] dark:text-[var(--sea-ink)] dark:hover:bg-[var(--lagoon)]"
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--sea-ink-soft)]">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[var(--lagoon-deep)] hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

