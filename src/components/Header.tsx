import { Link, useNavigate } from "@tanstack/react-router";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { LayoutDashboard, LogOut } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  async function handleSignOut() {
    await authClient.signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 sm:py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-2 text-sm text-[var(--sea-ink)] no-underline shadow-sm hover:shadow-md transition"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
          <span className="font-serif text-base font-bold">Karya AI</span>
        </Link>

        <div className="flex items-center gap-x-6 text-sm font-medium">
          <Link to="/" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
            Home
          </Link>
          <Link
            to="/portal"
            className="nav-link hidden sm:inline-block"
            activeProps={{ className: "nav-link is-active" }}
          >
            Portal
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {isPending ? (
            <div className="h-8 w-24 rounded-full bg-[var(--chip-bg)] animate-pulse" />
          ) : isLoggedIn ? (
            <>
              <span className="hidden sm:block text-[12px] text-[var(--sea-ink-soft)]">
                {session.user.name?.split(" ")[0]}
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
