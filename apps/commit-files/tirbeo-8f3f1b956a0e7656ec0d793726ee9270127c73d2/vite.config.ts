import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadEnv } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Supabase config endpoint ───────────────────────────────────────────
async function fetchSiteConfigFromDB(supabaseUrl: string, supabaseKey: string) {
  if (!supabaseUrl || !supabaseKey) return null
  const res = await fetch(`${supabaseUrl}/rest/v1/site_config?select=section,data`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  })
  if (!res.ok) return null
  const rows = (await res.json()) as { section: string; data: Record<string, unknown> }[]
  if (!rows.length) return null
  // Merge all section rows into one config object
  const merged: Record<string, unknown> = {}
  for (const row of rows) {
    merged[row.section] = row.data
  }
  return merged
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'dev-api',
        configureServer(server) {
          // Frames middleware
          server.middlewares.use('/frames', (req, res, next) => {
            if (req.url) {
              const filePath = path.resolve(__dirname, '../ezgif-4f16e559bf505f13-jpg', req.url.slice(1));
              if (fs.existsSync(filePath)) {
                res.setHeader('Content-Type', 'image/jpeg');
                res.end(fs.readFileSync(filePath));
                return;
              }
            }
            next();
          });

          // Site config endpoint — DB first, local fallback
          server.middlewares.use('/api/site-config', async (_req, res) => {
            try {
              const dbConfig = await fetchSiteConfigFromDB(env.VITE_SUPABASE_URL || '', env.VITE_SUPABASE_ANON_KEY || '')
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'public, max-age=60')
              res.end(JSON.stringify(dbConfig ?? {}))
            } catch {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({}))
            }
          });

          // OpenRouter proxy — key stays server-side
          server.middlewares.use('/api/chat', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method Not Allowed');
              return;
            }
            try {
              const key = env.OPENROUTER_API_KEY;
              if (!key) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY not set' }));
                return;
              }
              const chunks: Buffer[] = [];
              for await (const chunk of req) chunks.push(chunk as Buffer);
              const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');

              const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${key}`,
                  'Content-Type': 'application/json',
                  'HTTP-Referer': 'https://tirbeo.app',
                  'X-Title': 'Tirbeo',
                },
                body: JSON.stringify({
                  model: body.model || 'tencent/hy3:free',
                  messages: body.messages,
                  temperature: 0.7,
                }),
              });
              const data = await upstream.text();
              res.statusCode = upstream.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
            } catch (e: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e?.message || 'proxy error' }));
            }
          });
        }
      }
    ],
  };
})
