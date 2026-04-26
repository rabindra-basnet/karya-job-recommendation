import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Sparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import ThemeToggle from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  component: App,
});

// ─────────────────────────────────────────────────────────────
// 1. JSON DATA SOURCE: Update this object to change the UI content
// ─────────────────────────────────────────────────────────────

const PAGE_CONTENT = {
  header: {
    brand: "Karya AI",
    navLinks: [
      { label: "Home", href: "/" },
      { label: "Features", href: "#features", hiddenOnMobile: true },
      { label: "Free Portal", href: "/portal", hiddenOnMobile: true },
    ],
    loginText: { label: "Log In", href: "/login" },
    signupText: { label: "Sign Up", href: "/" },
  },
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
      primary: { text: "Get Free Roadmap", href: "/portal" },
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
        title: "Localized Jobs",
        desc: "Focus on real opportunities in Nepal, not global noise.",
      },
      {
        title: "Skill Gap Clarity",
        desc: "Know exactly what to learn next to become job-ready.",
      },
      {
        title: "Interview Focused",
        desc: "Every roadmap is designed to get you interview-ready fast.",
      },
    ],
  },
  portalCTA: {
    kicker: "Try it now",
    title: "Career Recommendation Portal",
    description:
      "Get a personalized career roadmap powered by AI in under 2 minutes.",
    buttonText: "Open Free Portal",
    buttonHint: "No signup required to try",
    buttonLink: "/portal",
  },
  finalCTA: {
    kicker: "Start today",
    title: "Your roadmap is one click away",
    description:
      "Stop guessing. Start building a clear path to your first job.",
    buttons: {
      primary: { text: "Get Started", href: "/portal" },
      secondary: { text: "Learn More", href: "/about" },
    },
  },
  footer: {
    brand: "Karya AI",
    tagline: "Empowering Nepali graduates with data-driven career guidance.",
    copyrightPrefix: "©",
    copyrightText: "Karya Job Recommendation System.",
    builtWith: "Built for maximum local relevance.",
  },
};

// ─────────────────────────────────────────────────────────────
// 2. ICON MAPPING HELPER
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
// 3. COMPONENTS
// ─────────────────────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear();
  const { footer } = PAGE_CONTENT;

  return (
    <footer className="mt-20 border-t border-[var(--line)] px-4 pb-14 pt-10 text-[var(--sea-ink-soft)] bg-[var(--surface)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <p className="island-kicker m-0 text-lg font-bold font-serif text-[var(--sea-ink)] mb-1">
            {footer.brand}
          </p>
          <p className="m-0 text-sm">{footer.tagline}</p>
        </div>

        <div className="text-sm">
          <p className="m-0">
            {footer.copyrightPrefix} {year} {footer.copyrightText}
          </p>
          <p className="m-0 text-xs mt-1 text-[var(--sea-ink-soft)] opacity-70">
            {footer.builtWith}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Header() {
  const { header } = PAGE_CONTENT;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-xl">
      <nav className="page-wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-2 text-sm text-[var(--sea-ink)] no-underline shadow-sm transition hover:shadow-md"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
            <span className="font-serif text-lg font-bold">{header.brand}</span>
          </Link>
        </h2>

        <div className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-1 pb-1 text-sm font-medium sm:w-auto sm:flex-nowrap sm:pb-0">
          {header.navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`nav-link ${
                link.hiddenOnMobile ? "hidden sm:inline-block" : ""
              }`}
              activeProps={{ className: "nav-link is-active" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            className="hidden sm:flex text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] rounded-full"
          >
            <Link to={header.loginText.href}>{header.loginText.label}</Link>
          </Button>
          <Button
            variant={"default"}
            className="bg-[var(--lagoon-deep)] hover:bg-[var(--palm)] text-white rounded-full"
          >
            <Link to={header.signupText.href}>{header.signupText.label}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

function App() {
  return (
    <>
      <Header />

      <main className="min-h-screen">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-[var(--line)] py-20 sm:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,184,178,0.18),transparent_60%),radial-gradient(circle_at_80%_10%,rgba(47,106,74,0.12),transparent_55%)]" />

          <div className="page-wrap relative z-10 px-4 text-center">
            <div className="mx-auto max-w-3xl">
              <div className="island-kicker mb-4">
                {PAGE_CONTENT.hero.kicker}
              </div>

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

              <p className="mt-6 text-[var(--sea-ink-soft)] text-base sm:text-lg leading-relaxed">
                {PAGE_CONTENT.hero.description}
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  className="rounded-full font-bold bg-[var(--palm)] hover:bg-[var(--lagoon-deep)] text-white"
                  asChild
                >
                  <Link to={PAGE_CONTENT.hero.buttons.primary.href}>
                    {PAGE_CONTENT.hero.buttons.primary.text}
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full font-bold border-(--line) text-(--sea-ink) hover:bg-(--surface)"
                  asChild
                >
                  <Link to={PAGE_CONTENT.hero.buttons.secondary.href}>
                    {PAGE_CONTENT.hero.buttons.secondary.text}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE STRIP */}
        <section className="py-12 border-b border-[var(--line)]">
          <div className="page-wrap px-4 grid gap-8 sm:grid-cols-3 text-center">
            {PAGE_CONTENT.valueStrip.map((item) => (
              <div key={item.title}>
                <div className="text-xl font-bold text-[var(--sea-ink)]">
                  {item.title}
                </div>
                <p className="text-sm text-[var(--sea-ink-soft)] mt-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-20 page-wrap px-4">
          <div className="text-center mb-12">
            <div className="island-kicker mb-3">
              {PAGE_CONTENT.howItWorks.kicker}
            </div>
            <h2 className="display-title text-3xl sm:text-4xl font-bold text-[var(--sea-ink)]">
              {PAGE_CONTENT.howItWorks.title}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-6 md:gap-4 text-center">
            {PAGE_CONTENT.howItWorks.steps.map((step, i) => {
              const IconComponent = iconMap[step.icon] || Sparkles;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center w-full md:w-1/3 relative"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--sand)] border border-[var(--line)] flex items-center justify-center mb-4 text-[var(--lagoon-deep)]">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-[var(--lagoon-deep)] font-bold mb-1">
                    Step {i + 1}
                  </div>
                  <div className="text-lg font-bold text-[var(--sea-ink)] mb-2">
                    {step.title}
                  </div>
                  <p className="text-sm text-[var(--sea-ink-soft)] max-w-xs">
                    {step.desc}
                  </p>

                  {i < PAGE_CONTENT.howItWorks.steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 -right-4 transform translate-x-1/2">
                      <ArrowRight className="w-5 h-5 text-[var(--line)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-20 border-y border-[var(--line)]">
          <div className="page-wrap px-4">
            <div className="text-center mb-10">
              <div className="island-kicker mb-3">
                {PAGE_CONTENT.features.kicker}
              </div>
              <h2 className="display-title text-3xl sm:text-4xl font-bold text-[var(--sea-ink)]">
                {PAGE_CONTENT.features.title}
              </h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {PAGE_CONTENT.features.list.map((item) => (
                <div
                  key={item.title}
                  className="p-6 rounded-xl border border-transparent hover:border-[var(--line)] hover:bg-[var(--surface)] transition-all duration-300"
                >
                  <h3 className="font-bold text-lg text-[var(--sea-ink)]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--sea-ink-soft)] mt-2">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PORTAL CTA */}
        <section id="portal" className="py-20 page-wrap px-4">
          <div className="text-center mb-8">
            <div className="island-kicker mb-3">
              {PAGE_CONTENT.portalCTA.kicker}
            </div>
            <h2 className="display-title text-3xl sm:text-4xl font-bold text-[var(--sea-ink)]">
              {PAGE_CONTENT.portalCTA.title}
            </h2>
            <p className="mt-4 text-[var(--sea-ink-soft)] max-w-2xl mx-auto">
              {PAGE_CONTENT.portalCTA.description}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              className="text-lg px-10 py-6 rounded-full font-bold bg-[var(--sea-ink)] hover:bg-[var(--palm)] text-white shadow-lg"
              asChild
            >
              <Link to={PAGE_CONTENT.portalCTA.buttonLink}>
                {PAGE_CONTENT.portalCTA.buttonText}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              {PAGE_CONTENT.portalCTA.buttonHint}
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 border-t border-[var(--line)] bg-[var(--surface)]">
          <div className="page-wrap px-4 text-center">
            <div className="island-kicker mb-3">
              {PAGE_CONTENT.finalCTA.kicker}
            </div>

            <h3 className="display-title text-3xl sm:text-4xl font-bold text-[var(--sea-ink)]">
              {PAGE_CONTENT.finalCTA.title}
            </h3>

            <p className="mt-4 text-[var(--sea-ink-soft)] max-w-2xl mx-auto">
              {PAGE_CONTENT.finalCTA.description}
            </p>

            <div className="mt-8 flex justify-center gap-3 flex-wrap">
              <Button
                size="lg"
                className="rounded-full font-bold bg-[var(--palm)] text-white"
                asChild
              >
                <Link to={PAGE_CONTENT.finalCTA.buttons.primary.href}>
                  {PAGE_CONTENT.finalCTA.buttons.primary.text}
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="rounded-full font-bold border-[var(--line)] text-[var(--sea-ink)]"
                asChild
              >
                <Link to={PAGE_CONTENT.finalCTA.buttons.secondary.href}>
                  {PAGE_CONTENT.finalCTA.buttons.secondary.text}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
