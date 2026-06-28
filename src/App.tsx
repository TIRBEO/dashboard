import { useState, useEffect, useRef } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { getSession, setSession as storeSession, clearSession, decodeSession, type Session } from "@/lib/session";
import { LogOut } from "lucide-react";
import { ACCOUNTS_URL } from "@/lib/config";

export default function DashboardLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [searchParams] = useSearchParams();
  const redirected = useRef(false);

  useEffect(() => {
    const encoded = searchParams.get("session");
    if (encoded) {
      const appSession = decodeSession(encoded);
      if (appSession) {
        storeSession(appSession);
        setSession(appSession);
        window.history.replaceState({}, "", "/");
        return;
      }
    }

    const stored = getSession();
    setSession(stored);
  }, [searchParams]);

  useEffect(() => {
    if (session !== null || redirected.current) return;
    redirected.current = true;
    const loginUrl = `${ACCOUNTS_URL}/login?redirect_to=${encodeURIComponent(window.location.origin + "/auth/callback")}`;
    window.location.href = loginUrl;
  }, [session]);

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
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
