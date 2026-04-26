import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import { Button } from './ui/button'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-2 text-sm text-[var(--sea-ink)] no-underline shadow-sm transition hover:shadow-md"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
            <span className="font-serif text-lg font-bold">Karya AI</span>
          </Link>
        </h2>

        <div className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-1 pb-1 text-sm font-medium sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link to="/" className="nav-link" activeProps={{ className: 'nav-link is-active' }}>
            Home
          </Link>
          <a href="#features" className="nav-link hidden sm:inline-block">Features</a>
          <a href="#portal" className="nav-link hidden sm:inline-block">Free Portal</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button variant="ghost" className="hidden sm:flex text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] rounded-full">
            Log In
          </Button>
          <Button className="bg-[var(--lagoon-deep)] hover:bg-[var(--palm)] text-white rounded-full">
            Sign Up
          </Button>
        </div>
      </nav>
    </header>
  )
}
