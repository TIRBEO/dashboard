"use client";

const letters = "TIRBEO".split("");

export default function AppLoading() {
  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-tb-bg text-tb-text-primary overflow-hidden">
      <div className="flex flex-col items-center">

        {/* Animated logo */}
        <div className="flex items-center">
          {letters.map((letter, i) => (
            <span
              key={letter}
              className="animate-letter"
              style={{
                animationDelay: `${i * 80}ms`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Progress */}
        <div className="mt-7 w-44 h-[2px] overflow-hidden rounded-full bg-tb-border">
          <div className="animate-progress h-full w-1/3 rounded-full bg-tb-accent" />
        </div>

        {/* Status */}
        <p className="mt-4 text-xs font-medium tracking-wide text-tb-text-muted">
          Preparing your dashboard
          <span className="dots">...</span>
        </p>
      </div>

      <style jsx>{`
        .animate-letter {
          display: inline-block;
          font-size: clamp(3rem, 7vw, 5rem);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.08em;
          opacity: 0;
          transform: translateY(20px) scale(0.9);
          filter: blur(6px);
          animation: reveal 650ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-progress {
          animation: progress 1.6s ease-in-out infinite;
        }

        .dots {
          display: inline-block;
          width: 18px;
          overflow: hidden;
          animation: dots 1.2s steps(4, end) infinite;
        }

        @keyframes reveal {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
            filter: blur(6px);
          }

          70% {
            opacity: 1;
            transform: translateY(-3px) scale(1.02);
            filter: blur(0);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes progress {
          0% {
            transform: translateX(-140%);
          }

          50% {
            transform: translateX(160%);
          }

          100% {
            transform: translateX(420%);
          }
        }

        @keyframes dots {
          0% {
            width: 4px;
          }

          33% {
            width: 9px;
          }

          66% {
            width: 14px;
          }

          100% {
            width: 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-letter,
          .animate-progress,
          .dots {
            animation: none;
            opacity: 1;
            transform: none;
            filter: none;
          }
        }
      `}</style>
    </main>
  );
}