# CA Screener — Vercel-ready

This version preserves the CA Scanner + KOL Radar interface from the supplied project, but uses the **Next.js Pages Router** (`pages/index.js`) so Vercel has an unambiguous page entry point.

## Vercel
- Framework: Next.js
- Root Directory: `./`
- Build Command: `npm run build`
- Add `X_BEARER_TOKEN` under Settings → Environment Variables for Production and Preview.

The X Bearer Token is server-side only. An X app/Premium subscription is separate from X API access/usage.

Use **Load demo** to test the UI without an X token.
