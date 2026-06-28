import { useState, useEffect, useRef } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { getSession, setSession as storeSession, clearSession, decodeSession, type Session } from "@/lib/session";
import { Sidebar } from "@/components/Sidebar";
import { ACCOUNTS_URL } from "@/lib/config";

export default function DashboardLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
        displayName={session.user.displayName}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet context={session} />
        </main>
      </div>
    </div>
  );
}
