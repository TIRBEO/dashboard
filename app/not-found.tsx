"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] items-center px-6 py-8 sm:px-10 lg:px-16">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">

          {/* IMAGE — first on mobile */}
          <section className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <img
              src="https://api.tirbeo.app/404.png"
              alt="Page not found"
              className="w-full max-w-[520px] select-none object-contain sm:max-w-[580px] lg:max-w-[620px]"
            />
          </section>

          {/* CONTENT */}
          <section className="order-2 max-w-[620px] lg:order-1">
            <p className="mb-5 text-sm font-medium text-white/40">
              Page not found
            </p>

            <h1 className="text-[clamp(8rem,18vw,15rem)] font-black leading-[0.7] tracking-[-0.12em]">
              404
            </h1>

            <h2 className="mt-10 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              This page doesn&apos;t exist.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/45 sm:text-base">
              The link may be incorrect or the page may have been moved.
            </p>

            {/* URL */}
            <div className="mt-7">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                Requested URL
              </p>

              <div className="max-w-full overflow-x-auto rounded-lg border border-white/10 bg-white/[0.04]">
                <code className="block w-max px-3.5 py-3 font-mono text-xs text-white/70 sm:text-sm">
                  {currentUrl || "Loading..."}
                </code>
              </div>
            </div>

            {/* HOME */}
            <Link
              href="/home"
              className="group mt-7 inline-flex items-center gap-3 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Return home
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>

            {/* SUPPORT */}
            <div className="mt-10 flex flex-col gap-1 border-t border-white/10 pt-5 text-xs sm:flex-row sm:items-center sm:gap-5">
              <span className="text-white/35">Need help?</span>

              <a
                href="mailto:support@tirbeo.app"
                className="text-white/65 transition hover:text-white"
              >
                support@tirbeo.app
              </a>

              <a
                href="https://support.tirbeo.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/65 transition hover:text-white"
              >
                support.tirbeo.app
              </a>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
