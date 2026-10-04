import { Link } from "@tanstack/react-router";
import { History, Home, Sparkles } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          Sketch<span className="text-primary">→</span>AI
        </Link>
        <nav className="flex gap-1">
          <Link to="/" className="nav-icon" activeOptions={{ exact: true }} activeProps={{ className: "nav-icon-active" }} aria-label="Home">
            <Home className="h-5 w-5" /> <span className="hidden sm:inline">Home</span>
          </Link>
          <Link to="/history" className="nav-icon" activeProps={{ className: "nav-icon-active" }} aria-label="History">
            <History className="h-5 w-5" /> <span className="hidden sm:inline">History</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
