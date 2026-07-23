import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://api.tirbeo.app';

function getApp(req: NextRequest) {
  return req.nextUrl.searchParams.get('app') || 'landing';
}

function getProxyHeaders(req: NextRequest, extra: Record<string, string> = {}) {
  const cookie = req.headers.get('cookie');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (cookie) headers.Cookie = cookie;
  return headers;
}

async function readConfigFromApi(req: NextRequest, app: string) {
  const res = await fetch(`${API_BASE}/api/admin/site-config?app=${encodeURIComponent(app)}`, {
    headers: getProxyHeaders(req),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upstream request failed with ${res.status}`);
  }

  const payload = await res.json();
  const config = payload?.config && typeof payload.config === 'object' ? payload.config : {};
  return config;
}

export async function GET(req: NextRequest) {
  try {
    const app = getApp(req);
    const config = await readConfigFromApi(req, app);
    return NextResponse.json(config, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const app = getApp(req);
    const body = await req.json();
    const { section, data } = body || {};

    if (!section || !data) {
      return NextResponse.json({ error: 'section and data required' }, { status: 400 });
    }

    const existingConfig = await readConfigFromApi(req, app);
    const mergedConfig = {
      ...(existingConfig && typeof existingConfig === 'object' ? existingConfig : {}),
      [section]: data,
    };

    const res = await fetch(`${API_BASE}/api/admin/site-config?app=${encodeURIComponent(app)}`, {
      method: 'PUT',
      headers: getProxyHeaders(req),
      body: JSON.stringify({ config: mergedConfig }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
