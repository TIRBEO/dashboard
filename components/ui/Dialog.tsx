'use client';

import { type ReactNode } from 'react';
import { X, ShieldAlert } from 'lucide-react';

/* ═══ Shared Premium Dialog ═══ */
export function Dialog({
  open,
  onClose,
  children,
  maxWidth = 440,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-[100]"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        style={{
          maxWidth,
          maxHeight: 'calc(100vh - 32px)',
          borderRadius: 18,
          border: '1px solid tb-border',
          background: 'var(--tb-surface-1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.02)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ═══ Dialog Header ═══ */
export function DialogHeader({
  title,
  description,
  onClose,
}: {
  title: string;
  description?: string;
  onClose?: () => void;
}) {
  return (
    <div style={{ padding: '22px 22px 16px', borderBottom: '1px solid tb-border', borderRadius: '18px 18px 0 0' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold text-tb-text-primary tracking-tight" style={{ margin: 0, lineHeight: 1.3 }}>{title}</h3>
          {description && <p className="text-[13.5px] text-tb-text-muted" style={{ marginTop: 6, lineHeight: 1.55 }}>{description}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150 hover:bg-tb-surface-3 text-tb-text-muted hover:text-tb-text-primary cursor-pointer"
            style={{ border: '1px solid transparent', background: 'transparent' }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══ Dialog Body ═══ */
export function DialogBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-[22px] py-[16px] ${className}`}>{children}</div>;
}

/* ═══ Warning Block — destructive confirmation ═══ */
export function WarningBlock({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 mb-4"
      style={{
        background: 'var(--tb-red-soft)',
        border: '1px solid rgba(232,93,106,0.2)',
      }}
    >
      <ShieldAlert size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--tb-red)' }} />
      <div className="text-[13.5px] leading-relaxed" style={{ color: 'var(--tb-text-secondary)' }}>
        {children}
      </div>
    </div>
  );
}

/* ═══ Upgrade Info Card (what will be affected) ═══ */
export function InfoCard({
  icon,
  iconBg,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  iconBg: string;
  title: string;
  subtitle: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3.5 py-3 mb-4"
      style={{
        background: 'var(--tb-surface-2)',
        border: '1px solid tb-border',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, color: 'var(--tb-text-primary)', border: '1px solid tb-border' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-[13.5px] font-semibold text-tb-text-primary">{title}</div>
        <div className="truncate text-[12.5px] text-tb-text-muted mt-0.5">{subtitle}</div>
      </div>
      {action}
    </div>
  );
}

/* ═══ Confirmation Input ═══ */
export function ConfirmInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-[12.5px] font-semibold text-tb-text-muted mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tb-text-muted pointer-events-none">{icon}</span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 outline-none transition-all duration-150 text-[13.5px]"
          style={{
            padding: icon ? '0 12px 0 36px' : '0 12px',
            borderRadius: 10,
            background: 'var(--tb-input)',
            border: '1px solid tb-border',
            color: 'var(--tb-text-primary)',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--tb-text-muted)'; e.currentTarget.style.boxShadow = '0 0 0 3px tb-border'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--tb-border)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>
    </div>
  );
}

/* ═══ Dialog Footer ═══ */
export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex items-center justify-end gap-2.5"
      style={{ padding: '14px 22px', borderTop: '1px solid tb-border', borderRadius: '0 0 18px 18px' }}
    >
      {children}
    </div>
  );
}

/* ═══ Button: Cancel (neutral) ═══ */
export function BtnCancel({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center px-4 h-9 rounded-lg text-[13px] font-medium transition-all duration-150 hover:bg-tb-surface-3 active:scale-[0.98] cursor-pointer"
      style={{ color: 'var(--tb-text-secondary)', background: 'transparent', border: '1px solid tb-border' }}
    >
      {children}
    </button>
  );
}

/* ═══ Button: Destructive (red) ═══ */
export function BtnDanger({ onClick, disabled, loading, children }: { onClick: () => void; disabled?: boolean; loading?: boolean; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-[13px] font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
      style={{
        background: 'var(--tb-red)',
        color: '#fff',
        border: 'none',
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      }}
    >
      {loading && <span className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}

/* ═══ Button: Primary (brand) ═══ */
export function BtnPrimary({ onClick, disabled, loading, children }: { onClick: () => void; disabled?: boolean; loading?: boolean; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-[13px] font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
      style={{
        background: 'var(--tb-brand)',
        color: 'var(--tb-brand-text)',
        border: '1px solid tb-border',
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
      }}
    >
      {loading && <span className="w-3 h-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}
