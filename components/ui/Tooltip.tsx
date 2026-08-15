"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type Side = "top" | "bottom" | "left" | "right";

const SIDES: Record<Side, CSSProperties> = {
  top: { bottom: "calc(100% + 7px)", left: "50%", transform: "translateX(-50%) translateY(3px)" },
  bottom: { top: "calc(100% + 7px)", left: "50%", transform: "translateX(-50%) translateY(-3px)" },
  left: { right: "calc(100% + 7px)", top: "50%", transform: "translateY(-50%) translateX(3px)" },
  right: { left: "calc(100% + 7px)", top: "50%", transform: "translateY(-50%) translateX(-3px)" },
};

const SHOWN: Record<Side, CSSProperties> = {
  top: { transform: "translateX(-50%) translateY(0)" },
  bottom: { transform: "translateX(-50%) translateY(0)" },
  left: { transform: "translateY(-50%) translateX(0)" },
  right: { transform: "translateY(-50%) translateX(0)" },
};

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: Side;
  delay?: number;
  className?: string;
}

export function Tooltip({
  label,
  children,
  side = "top",
  delay = 200,
  className,
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(true), delay);
  };
  const leave = () => {
    if (timer.current) clearTimeout(timer.current);
    setShow(false);
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!label) return <>{children}</>;

  return (
    <span
      className={className}
      style={{ position: "relative", display: "grid" }}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
    >
      {children}
      <span
        role="tooltip"
        style={{
          position: "absolute",
          ...SIDES[side],
          padding: "5px 10px",
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 600,
          lineHeight: 1.4,
          whiteSpace: "nowrap",
          background: "var(--tb-text-primary)",
          color: "var(--tb-bg)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          zIndex: 300,
          pointerEvents: "none",
          opacity: show ? 1 : 0,
          transition: "opacity 120ms ease, transform 120ms ease",
          ...(show ? SHOWN[side] : {}),
        }}
      >
        {label}
      </span>
    </span>
  );
}
