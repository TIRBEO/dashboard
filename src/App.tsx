import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { getSession, clearSession, type Session } from "@/lib/session";
import { LogOut, ArrowUpRight } from "lucide-react";
import { ACCOUNTS_URL } from "@/lib/config";

export default function DashboardLayout() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  const loginUrl = `${ACCOUNTS_URL}/login?redirect_to=${encodeURIComponent(window.location.origin + "/auth/callback")}`;

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-8">
        <div className="mx-auto max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-6">
            <svg className="h-8 w-8 text-ink-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Sign in to continue
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            You need to sign in to access the dashboard.
          </p>
          <a
            href={loginUrl}
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:bg-foreground/90 active:scale-95"
          >
            Sign In
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
            <img src="/logo.png" alt="Tirbeo" className="h-8 w-8 object-contain brightness-0 invert" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1.5 text-sm text-ink-soft">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold text-foreground">
              {session.user.displayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline">{session.user.displayName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-secondary hover:text-destructive"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
}
