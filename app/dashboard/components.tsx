"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   Tirbeo Dashboard — Shared UI Component Library
   Raycast-style dark glass design system
   ═══════════════════════════════════════════════════════════════ */

// ─── Page Layout ───────────────────────────────────────────────

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between">
      <div className="section-header" style={{ marginBottom: 0 }}>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={"max-w-4xl mx-auto space-y-6 " + className}>{children}</div>;
}

// ─── Card ──────────────────────────────────────────────────────

export function Card({ children, title, subtitle, action, className = "" }: {
  children: React.ReactNode; title?: string; subtitle?: string; action?: React.ReactNode; className?: string;
}) {
  return (
    <div className={"glass card-section " + className}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Setting Row ───────────────────────────────────────────────

export function SettingRow({ label, description, children, border = true }: {
  label: string; description?: string; children: React.ReactNode; border?: boolean;
}) {
  return (
    <div className="table-row" style={border ? {} : { borderBottom: "none" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{description}</p>}
      </div>
      <div style={{ flexShrink: 0, marginLeft: 16 }}>{children}</div>
    </div>
  );
}

// ─── Toggle ────────────────────────────────────────────────────

export function Toggle({ checked, onChange, disabled = false }: {
  checked: boolean; onChange: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={"toggle" + (checked ? " active" : "")}
      style={disabled ? { opacity: 0.4, cursor: "not-allowed" } : {}}
      role="switch"
      aria-checked={checked}
    />
  );
}

// ─── Input ─────────────────────────────────────────────────────

export function Input({ label, value, onChange, placeholder, type = "text", disabled, helpText, error }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; disabled?: boolean; helpText?: string; error?: string;
}) {
  return (
    <div>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="input-field"
        style={error ? { borderColor: "var(--danger)" } : {}}
      />
      {helpText && !error && <p style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 4 }}>{helpText}</p>}
      {error && <p style={{ fontSize: 11, color: "var(--danger)", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// ─── Textarea ──────────────────────────────────────────────────

export function Textarea({ label, value, onChange, placeholder, rows = 4 }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="input-field"
        style={{ height: "auto", minHeight: rows * 24 + "px" }}
      />
    </div>
  );
}

// ─── Select ────────────────────────────────────────────────────

export function Select({ label, value, onChange, options, disabled }: {
  label?: string; value: string; onChange: (v: string) => void;
  options: { label: string; value: string }[]; disabled?: boolean;
}) {
  return (
    <div>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>{label}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="input-field">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Button ────────────────────────────────────────────────────

export function Button({ children, variant = "primary", size = "default", onClick, disabled, className = "", type = "button", ...props }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "default" | "lg"; onClick?: () => void; disabled?: boolean;
  className?: string; type?: "button" | "submit"; [key: string]: any;
}) {
  const cls = "btn btn-" + variant + (size === "sm" ? " text-xs" : size === "lg" ? " text-base" : "") + " " + className;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} {...props}>
      {children}
    </button>
  );
}

// ─── Badge ─────────────────────────────────────────────────────

export function Badge({ children, variant = "default", className = "" }: {
  children: React.ReactNode; variant?: "default" | "success" | "danger" | "warning" | "gold" | "info"; className?: string;
}) {
  return <span className={"badge badge-" + variant + " " + className}>{children}</span>;
}

// ─── Empty State ───────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <Icon size={48} style={{ color: "var(--text-ash)", marginBottom: 12 }} />
      <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>{title}</p>
      {description && <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, maxWidth: 320 }}>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────

export function Toast({ message, type = "success", onClose }: {
  message: string; type?: "success" | "error"; onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={"toast toast-" + type}>
      {message}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────

export function Skeleton({ count = 1, height = 80 }: { count?: number; height?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height }} />
      ))}
    </div>
  );
}

// ─── Filter Tabs ───────────────────────────────────────────────

export function FilterTabs({ tabs, active, onChange }: {
  tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void;
}) {
  return (
    <div className="filter-tabs">
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          className={"filter-tab" + (active === tab.id ? " active" : "")}>
          {tab.label}{tab.count !== undefined ? " (" + tab.count + ")" : ""}
        </button>
      ))}
    </div>
  );
}

// ─── Toggle Group ──────────────────────────────────────────────

export function ToggleGroup({ options, value, onChange }: {
  options: { label: string; value: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="toggle-group">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={"toggle-group-item" + (value === opt.value ? " active" : "")}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────

export function StatCard({ label, value, change, icon: Icon, color }: {
  label: string; value: string | number; change?: string; icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color?: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{label}</p>
        {Icon && <Icon size={14} style={{ color: color || "var(--text-ash)" }} />}
      </div>
      <p className="stat-value">{value}</p>
      {change && (
        <p style={{ fontSize: 11, marginTop: 4, color: change.startsWith("+") ? "var(--success)" : change.startsWith("-") ? "var(--danger)" : "var(--text-muted)" }}>
          {change}
        </p>
      )}
    </div>
  );
}

// ─── Color Swatch ──────────────────────────────────────────────

export function ColorSwatch({ color, selected, onClick }: {
  color: string; selected?: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick}
      className={"color-swatch" + (selected ? " selected" : "")}
      style={{ background: color }}
      title={color}
    />
  );
}

// ─── Progress Bar ──────────────────────────────────────────────

export function ProgressBar({ value, max = 100, color }: {
  value: number; max?: number; color?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress-bar">
      <div className="progress-bar-fill" style={{ width: pct + "%", background: color || undefined }} />
    </div>
  );
}

// ─── Ring Progress ─────────────────────────────────────────────

export function RingProgress({ value, size = 80, strokeWidth = 6, color = "#ffffff" }: {
  value: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="ring-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }} />
      </svg>
      <div className="ring-progress-label">{value}%</div>
    </div>
  );
}

// ─── Modal / Dialog ────────────────────────────────────────────

export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, padding: 24 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Dropdown ──────────────────────────────────────────────────

export function Dropdown({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", right: 0, marginTop: 4, minWidth: 180,
          background: "rgba(8,8,10,0.95)", backdropFilter: "blur(40px)",
          border: "1px solid var(--border)", borderRadius: 10, padding: 4,
          zIndex: 50, animation: "fadeIn 0.12s ease",
        }} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ onClick, children, danger }: {
  onClick: () => void; children: React.ReactNode; danger?: boolean;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px",
      border: "none", background: "none", borderRadius: 6, fontSize: 13, cursor: "pointer",
      color: danger ? "var(--danger)" : "var(--text-secondary)", fontFamily: "inherit",
      transition: "background 0.1s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      {children}
    </button>
  );
}

// ─── Avatar ────────────────────────────────────────────────────

export function Avatar({ src, name, size = 44 }: { src?: string; name?: string; size?: number }) {
  const initials = name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {src ? <img src={src} alt={name || ""} /> : initials}
    </div>
  );
}

// ─── Divider ───────────────────────────────────────────────────

export function Divider() {
  return <div className="divider" />;
}

// ─── Data Table ────────────────────────────────────────────────

export function DataTable({ columns, rows, emptyText = "No data" }: {
  columns: { key: string; label: string; render?: (val: any, row: any) => React.ReactNode }[];
  rows: any[]; emptyText?: string;
}) {
  if (rows.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "32px 0" }}>{emptyText}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
              {columns.map((col) => (
                <td key={col.key} style={{ padding: "10px 12px", fontSize: 13, color: "var(--text-secondary)" }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Code Block ────────────────────────────────────────────────

export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ position: "relative" }}>
      <pre style={{
        padding: "14px 16px", background: "rgba(0,0,0,0.4)", borderRadius: 10, fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace", color: "var(--success)", overflowX: "auto",
        border: "1px solid var(--border)", lineHeight: 1.6,
      }}>
        {code}
      </pre>
      <button onClick={copy} style={{
        position: "absolute", top: 8, right: 8, padding: "4px 8px", fontSize: 11,
        background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", borderRadius: 6,
        color: copied ? "var(--success)" : "var(--text-muted)", cursor: "pointer", fontFamily: "inherit",
      }}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

// ─── Loading Spinner ───────────────────────────────────────────

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ animation: "spin 0.6s linear infinite" }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ─── useToast hook ─────────────────────────────────────────────

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const show = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  }, []);
  const hide = useCallback(() => setToast(null), []);
  return { toast, show, hide };
}

// ─── useFetch hook ─────────────────────────────────────────────

export function useFetch<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(url, { credentials: "include", ...options })
      .then((r) => {
        if (!r.ok) throw new Error("Request failed");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error, refetch: () => { fetched.current = false; setLoading(true); } };
}
