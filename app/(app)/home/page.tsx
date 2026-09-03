"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, type Profile } from "@/lib/api";
import { Search, ArrowRight, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

/* ── All searchable pages with real paths ────────────────── */
const ALL_PAGES = [
  { title: "Home", path: "/home", keywords: "home dashboard welcome start" },
  { title: "Profile", path: "/account/profile", keywords: "profile name avatar photo bio user info" },
  { title: "Security", path: "/account/security", keywords: "security 2fa two-factor password passkey login recovery" },
  { title: "Preferences", path: "/account/preferences", keywords: "preferences settings language theme notification email" },
  { title: "Notifications", path: "/account/notifications", keywords: "notifications email push alerts settings" },
  { title: "Connected Apps", path: "/account/apps", keywords: "apps connected oauth integrations third-party" },
  { title: "Privacy", path: "/account/privacy", keywords: "privacy data consent delete account gdpr" },
  { title: "Sessions", path: "/account/sessions", keywords: "sessions devices active login history" },
  { title: "Inbox", path: "/account/inbox", keywords: "inbox messages mail notifications read" },
  { title: "Activity History", path: "/activity/history", keywords: "activity history timeline logs audit" },
  { title: "Support Tickets", path: "/support/tickets", keywords: "support tickets help contact" },
  { title: "New Ticket", path: "/support/tickets/new", keywords: "new ticket create support help" },
];

function searchPages(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  return ALL_PAGES.filter((page) => {
    const haystack = `${page.title} ${page.path} ${page.keywords}`.toLowerCase();
    return tokens.every((tok) => haystack.includes(tok));
  });
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const results = searchPages(search);
  const showResults = search.trim().length > 0 && results.length > 0;

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIdx(-1);
  }, [search]);

  // Close results on outside click
  useEffect(() => {
    if (!showResults) return;
    const handler = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showResults]);

  const navigateTo = (path: string) => {
    setSearch("");
    router.push(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) {
      if (e.key === "Enter" && search.trim()) {
        // Navigate to first result
        if (results.length > 0) navigateTo(results[0].path);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIdx >= 0 && selectedIdx < results.length) {
        navigateTo(results[selectedIdx].path);
      } else if (results.length > 0) {
        navigateTo(results[0].path);
      }
    } else if (e.key === "Escape") {
      setSearch("");
      inputRef.current?.blur();
    }
  };

  return (
    <main className="min-h-screen bg-tb-bg text-tb-text-primary">
      <div className="mx-auto flex min-h-screen w-full max-w-[900px] flex-col px-6 sm:px-10">

        {/* ================= MAIN ================= */}
        <div className="flex flex-1 flex-col">

          {/* Profile / Welcome */}
          <section className="pt-16 sm:pt-24">
            {loading ? (
              <div className="flex flex-col items-center">
                <Skeleton width={88} height={88} borderRadius="50%" />
                <div className="mt-6">
                  <Skeleton width={220} height={32} />
                </div>
                <div className="mt-2">
                  <Skeleton width={200} height={16} />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={() => router.push("/account/profile")}
                  aria-label="Open profile"
                  className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-tb-border bg-tb-surface-2 transition hover:opacity-90"
                >
                  {user?.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-3xl font-medium text-tb-text-muted">
                      {user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  )}
                </button>

                <h1 className="mt-6 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                  {user?.name || "Welcome"}
                </h1>

                <p className="mt-2 text-sm text-tb-text-muted">
                  {user?.email}
                </p>
              </div>
            )}
          </section>

          {/* Search */}
          <section className="mx-auto w-full max-w-[650px] pt-12 sm:pt-14 relative">
            <div
              className="group flex h-[58px] items-center gap-3 rounded-full border border-tb-border bg-tb-surface-1 px-5 shadow-sm transition-all duration-200 focus-within:border-tb-brand focus-within:shadow-md"
            >
              <Search
                size={20}
                strokeWidth={1.9}
                className="shrink-0 text-tb-text-muted transition group-focus-within:text-tb-brand"
              />

              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, settings…"
                className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-tb-text-muted"
                autoComplete="off"
              />

              {search.trim() && (
                <button
                  onClick={() => {
                    if (results.length > 0) navigateTo(results[0].path);
                  }}
                  aria-label="Search"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tb-brand text-white transition hover:opacity-90"
                >
                  <ArrowRight size={15} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
              <div
                ref={resultsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-tb-surface-1 border border-tb-border rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.2)] z-50 animate-dropdown-in"
              >
                <div className="px-4 py-2.5 border-b border-tb-border">
                  <span className="text-[11px] font-semibold text-tb-text-muted uppercase tracking-wider">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {results.map((page, idx) => (
                    <button
                      key={page.path}
                      onClick={() => navigateTo(page.path)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer border-none transition-colors duration-100 ${
                        idx === selectedIdx
                          ? "bg-tb-surface-2"
                          : "bg-transparent hover:bg-tb-surface-2"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium text-tb-text-primary font-mono truncate">
                          {page.path}
                        </div>
                      </div>
                      <ArrowUpRight size={14} className="text-tb-text-muted shrink-0" />
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-tb-border flex items-center gap-4 text-[11px] text-tb-text-muted">
                  <span>↑↓ navigate</span>
                  <span>↵ open</span>
                  <span>esc close</span>
                </div>
              </div>
            )}

            {/* No results */}
            {search.trim().length > 0 && results.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-tb-surface-1 border border-tb-border rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.2)] z-50 animate-dropdown-in">
                <div className="px-5 py-8 text-center">
                  <p className="text-[14px] text-tb-text-muted">
                    No results for "<span className="text-tb-text-primary font-medium">{search}</span>"
                  </p>
                  <p className="text-[12px] text-tb-text-muted mt-1">
                    Try searching for security, inbox, tickets, or profile
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Small account action */}
          <div className="flex justify-center pt-5">
            <button
              onClick={() => router.push("/account/profile")}
              className="text-sm text-tb-text-muted transition hover:text-tb-text-primary hover:underline"
            >
              Manage your account
            </button>
          </div>

          {/* ================= BOTTOM ================= */}
          <section className="mt-auto border-t border-tb-border py-8 sm:py-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              {/* Privacy */}
              <div className="flex max-w-[520px] gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tb-surface-2 text-tb-text-muted">
                  <ShieldCheck size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-medium">Your information is private</p>
                  <p className="mt-1.5 text-sm leading-6 text-tb-text-muted">
                    Only you can see your account settings.
                    TIRBEO keeps your information private and secure.
                  </p>
                  <button
                    onClick={() => router.push("/account/privacy")}
                    className="mt-2 text-sm font-medium text-tb-brand hover:underline"
                  >
                    Learn more
                  </button>
                </div>
              </div>

              {/* Footer links */}
              <div className="flex shrink-0 flex-col gap-2 text-sm sm:items-end">
                <button
                  onClick={() => router.push("/account/notifications")}
                  className="text-tb-text-muted transition hover:text-tb-text-primary"
                >
                  Account settings
                </button>
                <a
                  href="mailto:support@tirbeo.app"
                  className="text-tb-text-muted transition hover:text-tb-text-primary"
                >
                  Get help
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
