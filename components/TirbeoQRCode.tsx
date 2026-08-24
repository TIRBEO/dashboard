'use client';

import { useMemo } from 'react';
import QRCode from 'qrcode';
import { useThemeToggle } from '@tirbeo/theme';

interface TirbeoQRCodeProps {
  value: string;
  size?: number;
  platform?: string;
  email?: string;
  secret?: string;
}

/**
 * Tirbeo QR code — logo embedded in the QR pattern.
 * Light mode: mix-blend-mode makes white logo bg transparent.
 * Dark mode: logo renders normally on dark card.
 */
export default function TirbeoQRCode({ value, size = 220, email }: TirbeoQRCodeProps) {
  const { isDark } = useThemeToggle();
  const fgColor = isDark ? '#e4e4e7' : '#18181b';
  const bgColor = isDark ? '#000000' : '#ffffff';

  const { modules, moduleCount } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: 'H' } as any);
    const count = qr.modules.size;
    const mods: number[][] = [];
    for (let r = 0; r < count; r++) {
      const row: number[] = [];
      for (let c = 0; c < count; c++) {
        row.push(qr.modules.get(r, c));
      }
      mods.push(row);
    }
    return { modules: mods, moduleCount: count };
  }, [value]);

  const moduleSize = size / moduleCount;
  const pad = 12;
  const total = size + pad * 2;
  const cx = total / 2;
  const cy = total / 2;
  const logoR = size * 0.11;

  // Build SVG modules — skip those inside the logo circle
  const paths: string[] = [];
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!modules[row][col]) continue;
      const x = pad + col * moduleSize;
      const y = pad + row * moduleSize;
      const modCx = x + moduleSize / 2;
      const modCy = y + moduleSize / 2;
      const dist = Math.sqrt((modCx - cx) ** 2 + (modCy - cy) ** 2);
      if (dist < logoR + moduleSize * 0.3) continue;
      const r = moduleSize * 0.18;
      const w = moduleSize - 0.2;
      paths.push(
        `M${x + r},${y}h${w - 2 * r}a${r},${r},0,0,1,${r},${r}v${w - 2 * r}a${r},${r},0,0,1,-${r},${r}h-${w - 2 * r}a${r},${r},0,0,1,-${r},-${r}v-${w - 2 * r}a${r},${r},0,0,1,${r},-${r}z`
      );
    }
  }

  const logoD = logoR * 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg
        width={total}
        height={total}
        viewBox={`0 0 ${total} ${total}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ borderRadius: 10, overflow: 'hidden', display: 'block' }}
      >
        <rect width={total} height={total} rx="10" fill={bgColor} />
        <g fill={fgColor}>
          {paths.map((d, i) => <path key={i} d={d} />)}
        </g>
        {/* Logo — multiply in light mode to hide white bg, normal in dark mode */}
        <image
          href="/logo.png"
          x={cx - logoR}
          y={cy - logoR}
          width={logoD}
          height={logoD}
          preserveAspectRatio="xMidYMid slice"
          style={isDark ? {} : { mixBlendMode: 'multiply' as const }}
        />
      </svg>

      {email && (
        <div style={{ fontSize: 13, color: isDark ? '#a1a1aa' : '#71717a' }}>
          <span style={{ fontWeight: 600, color: isDark ? '#e5e7eb' : '#374151' }}>Tirbeo</span>
          <span style={{ margin: '0 5px', color: isDark ? '#52525b' : '#d1d5db' }}>·</span>
          <span>{email}</span>
        </div>
      )}
    </div>
  );
}
