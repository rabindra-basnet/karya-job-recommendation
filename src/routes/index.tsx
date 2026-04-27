import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Sparkles,
  Zap,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
  component: App,
});

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const PAGE_CONTENT = {
  hero: {
    kicker: "AI Career Guidance for Nepal",
    title: {
      pre: "From ",
      highlight1: "degree",
      mid: " to ",
      highlight2: "career",
      post: ", clearly.",
    },
    description:
      "Karya helps Nepali graduates discover realistic roles, identify skill gaps, and follow a focused 3–6 month roadmap to land interviews faster.",
    buttons: {
      primary: { text: "Get Free Roadmap", href: "/portal/create" },
      secondary: { text: "See How It Works", href: "#how-it-works" },
    },
  },
  valueStrip: [
    { title: "Nepal-first", desc: "Real jobs from local market demand" },
    { title: "Actionable", desc: "No fluff — only steps you can execute" },
    { title: "Fast", desc: "Roadmap in minutes, not weeks" },
  ],
  howItWorks: {
    kicker: "How it works",
    title: "Three steps. One clear path.",
    steps: [
      {
        title: "Your profile",
        desc: "Tell us your degree, skills, and interests.",
        icon: "GraduationCap",
      },
      {
        title: "AI matching",
        desc: "We map you to real Nepali job opportunities.",
        icon: "Zap",
      },
      {
        title: "Roadmap",
        desc: "Get a 3–6 month step-by-step action plan.",
        icon: "MapPin",
      },
    ],
  },
  features: {
    kicker: "Why Karya",
    title: "Built for real constraints",
    list: [
      {
        icon: "MapPin",
        title: "Localized Jobs",
        desc: "Focus on real opportunities in Nepal, not global noise. Salary ranges, employers, and job boards are all tailored to the Nepali market.",
      },
      {
        icon: "Sparkles",
        title: "Skill Gap Clarity",
        desc: "Know exactly what to learn next to become job-ready. Prioritized by what matters most for your target role.",
      },
      {
        icon: "Briefcase",
        title: "Interview Focused",
        desc: "Every roadmap is designed to get you interview-ready fast. Real resources, real timelines, no filler.",
      },
    ],
  },
  finalCTA: {
    kicker: "Start today",
    title: "Your roadmap is one click away",
    description: "Stop guessing. Start building a clear path to your first job.",
    buttons: {
      primary: { text: "Build My Roadmap", href: "/portal/create" },
      secondary: { text: "View Portal", href: "/portal" },
    },
  },
  footer: {
    brand: "Karya AI",
    tagline: "Empowering Nepali graduates with data-driven career guidance.",
    copyrightText: "Karya Job Recommendation System.",
    builtWith: "Built for maximum local relevance.",
  },
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  Zap,
  MapPin,
  Briefcase,
  CheckCircle2,
  Sparkles,
};

// ─────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────

function Header() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  async function handleSignOut() {
    await authClient.signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-xl">
      <nav className="page-wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 sm:py-4">
        {/* Brand */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-2 text-sm text-[var(--sea-ink)] no-underline shadow-sm hover:shadow-md transition"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
          <span className="font-serif text-base font-bold">Karya AI</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-x-6 text-sm font-medium">
          <a href="#how-it-works" className="nav-link hidden sm:inline-block">
            How it works
          </a>
          <a href="#features" className="nav-link hidden sm:inline-block">
            Features
          </a>
          <Link to="/portal" className="nav-link hidden sm:inline-block">
            Portal
          </Link>
        </div>

        {/* Auth controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {isPending ? (
            <div className="h-8 w-24 rounded-full bg-[var(--chip-bg)] animate-pulse" />
          ) : isLoggedIn ? (
            <>
              <span className="hidden sm:block text-[12px] text-[var(--sea-ink-soft)]">
                Hi, {session.user.name?.split(" ")[0]}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center gap-1.5 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] rounded-full"
                asChild
              >
                <Link to="/portal">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  My Portal
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="rounded-full border-[var(--line)] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-[var(--sand)] flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] rounded-full"
                asChild
              >
                <Link to="/login">Log in</Link>
              </Button>
              <Button
                size="sm"
                className="bg-[var(--cta-bg)] hover:bg-[var(--cta-hover)] text-white rounded-full"
                asChild
              >
                <Link to="/signup">Sign up free</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  const { footer } = PAGE_CONTENT;

  return (
    <footer className="mt-20 border-t border-[var(--line)] px-4 pb-14 pt-10 text-[var(--sea-ink-soft)] bg-[var(--surface)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <p className="font-serif text-lg font-bold text-[var(--sea-ink)] mb-1">
            {footer.brand}
          </p>
          <p className="text-sm">{footer.tagline}</p>
        </div>
        <div className="text-sm">
          <p>
            © {year} {footer.copyrightText}
          </p>
          <p className="text-xs mt-1 text-[var(--sea-ink-soft)] opacity-70">{footer.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

function App() {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  return (
    <>
      <Header />

      <main className="min-h-screen">
        {/* ── HERO ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-[var(--line)] py-24 sm:py-32">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,184,178,0.18),transparent_60%),radial-gradient(circle_at_80%_10%,rgba(47,106,74,0.12),transparent_55%)]" />

          <div className="page-wrap relative z-10 px-4 text-center">
            <div className="mx-auto max-w-3xl rise-in">
              <div className="island-kicker mb-4">{PAGE_CONTENT.hero.kicker}</div>

              <h1 className="display-title text-4xl sm:text-6xl font-bold text-[var(--sea-ink)] leading-tight">
                {PAGE_CONTENT.hero.title.pre}
                <span className="text-[var(--lagoon-deep)]">
                  {PAGE_CONTENT.hero.title.highlight1}
                </span>
                {PAGE_CONTENT.hero.title.mid}
                <span className="text-[var(--palm)]">
                  {PAGE_CONTENT.hero.title.highlight2}
                </span>
                {PAGE_CONTENT.hero.title.post}
              </h1>

              <p className="mt-6 text-[var(--sea-ink-soft)] text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
                {PAGE_CONTENT.hero.description}
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  className="rounded-full font-bold bg-[var(--cta-bg)] hover:bg-[var(--cta-hover)] text-white shadow-md"
                  asChild
                >
                  <Link to={PAGE_CONTENT.hero.buttons.primary.href}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {PAGE_CONTENT.hero.buttons.primary.text}
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full font-bold border-[var(--line)] text-[var(--sea-ink)] hover:bg-[var(--surface)]"
                  asChild
                >
                  <a href={PAGE_CONTENT.hero.buttons.secondary.href}>
                    {PAGE_CONTENT.hero.buttons.secondary.text}
                  </a>
                </Button>
              </div>

              {!isLoggedIn && (
                <p className="mt-4 text-[11.5px] text-[var(--sea-ink-soft)]">
                  Free to try — no account needed.{" "}
                  <Link to="/signup" className="text-[var(--lagoon-deep)] font-medium hover:underline">
                    Sign up
                  </Link>{" "}
                  to save your roadmaps.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── VALUE STRIP ────────────────────────────────────── */}
        <section className="py-12 border-b border-[var(--line)]">
          <div className="page-wrap px-4 grid gap-8 sm:grid-cols-3 text-center">
            {PAGE_CONTENT.valueStrip.map((item) => (
              <div key={item.title}>
                <div className="text-xl font-bold text-[var(--sea-ink)]">{item.title}</div>
                <p className="text-sm text-[var(--sea-ink-soft)] mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────── */}
        <section id="how-it-works" className="py-20 page-wrap px-4">
          <div className="text-center mb-14">
            <div className="island-kicker mb-3">{PAGE_CONTENT.howItWorks.kicker}</div>
            <h2 className="display-title text-3xl sm:text-4xl font-bold text-[var(--sea-ink)]">
              {PAGE_CONTENT.howItWorks.title}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-6 md:gap-4 text-center">
            {PAGE_CONTENT.howItWorks.steps.map((step, i) => {
              const Icon = iconMap[step.icon] || Sparkles;
              return (
                <div key={i} className="flex flex-col items-center w-full md:w-1/3 relative">
                  <div className="w-12 h-12 rounded-full bg-[var(--sand)] border border-[var(--chip-line)] flex items-center justify-center mb-4 text-[var(--lagoon-deep)]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-[var(--lagoon-deep)] mb-1 island-kicker">
                    Step {i + 1}
                  </div>
                  <div className="text-lg font-bold text-[var(--sea-ink)] mb-2">{step.title}</div>
                  <p className="text-sm text-[var(--sea-ink-soft)] max-w-xs">{step.desc}</p>

                  {i < PAGE_CONTENT.howItWorks.steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 -right-4 translate-x-1/2">
                      <ArrowRight className="w-5 h-5 text-[var(--line)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              className="rounded-full bg-[var(--cta-bg)] hover:bg-[var(--cta-hover)] text-white font-bold"
              asChild
            >
              <Link to="/portal/create">
                Try it now <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── FEATURES ───────────────────────────────────────── */}
        <section id="features" className="py-20 border-y border-[var(--line)]">
          <div className="page-wrap px-4">
            <div className="text-center mb-12">
              <div className="island-kicker mb-3">{PAGE_CONTENT.features.kicker}</div>
              <h2 className="display-title text-3xl sm:text-4xl font-bold text-[var(--sea-ink)]">
                {PAGE_CONTENT.features.title}
              </h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {PAGE_CONTENT.features.list.map((item) => {
                const Icon = iconMap[item.icon] || Sparkles;
                return (
                  <div
                    key={item.title}
                    className="feature-card p-6 rounded-2xl border border-[var(--line)] transition-all duration-300 cursor-default"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--sand)] border border-[var(--chip-line)] flex items-center justify-center mb-4 text-[var(--lagoon-deep)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg text-[var(--sea-ink)] mb-2">{item.title}</h3>
                    <p className="text-sm text-[var(--sea-ink-soft)] leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────────────────────── */}
        <section className="py-24 border-t border-[var(--line)]">
          <div className="page-wrap px-4 text-center">
            <div className="mx-auto max-w-2xl island-shell rounded-3xl p-10 sm:p-14">
              <div className="island-kicker mb-3">{PAGE_CONTENT.finalCTA.kicker}</div>

              <h3 className="display-title text-3xl sm:text-4xl font-bold text-[var(--sea-ink)] mb-4">
                {PAGE_CONTENT.finalCTA.title}
              </h3>

              <p className="text-[var(--sea-ink-soft)] mb-8 text-base">
                {PAGE_CONTENT.finalCTA.description}
              </p>

              <div className="flex justify-center gap-3 flex-wrap">
                <Button
                  size="lg"
                  className="rounded-full font-bold bg-[var(--cta-bg)] hover:bg-[var(--cta-hover)] text-white shadow-md"
                  asChild
                >
                  <Link to={PAGE_CONTENT.finalCTA.buttons.primary.href}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {PAGE_CONTENT.finalCTA.buttons.primary.text}
                  </Link>
                </Button>

                {!isLoggedIn && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full font-bold border-[var(--line)] text-[var(--sea-ink)] hover:bg-[var(--sand)]"
                    asChild
                  >
                    <Link to="/signup">Create free account</Link>
                  </Button>
                )}
              </div>

              {!isLoggedIn && (
                <p className="mt-5 text-[12px] text-[var(--sea-ink-soft)]">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[var(--lagoon-deep)] font-medium hover:underline">
                    Log in
                  </Link>
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
