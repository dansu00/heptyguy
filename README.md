# CA Screener

A Vercel-ready Next.js CA screener inspired by the supplied mobile screenshot.

## What it does

- Dark CA Screener dashboard UI
- 0–30 second post-age display
- Demo data for testing the interface
- Server-side X recent-search integration
- Solana-style contract-address extraction
- DexScreener market-data enrichment
- Transparent risk/trend/signal fields
- Responsive mobile layout

## Deploy to Vercel

1. Upload this project to a GitHub repository.
2. Import the repository into Vercel.
3. Vercel detects Next.js automatically.
4. In Vercel, open **Settings → Environment Variables**.
5. Add `X_BEARER_TOKEN` with your X API bearer token.
6. Redeploy.
7. Open the deployed URL and press **Scan now**.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Important

The X bearer token stays server-side in `/api/scan`. Do not put it in a `NEXT_PUBLIC_` variable or browser JavaScript.

“Post age” is the age of the X post. It is not proof that a token was created exactly that many seconds ago.

The signal calculation in this starter is a transparent heuristic, not a guarantee of token performance or safety.


## KOL Radar

The dashboard now has a separate **KOL Radar** tab. It is designed to keep KOL/launch activity separate from CA discovery. The starter API groups recent matching posts by author ID and counts CA mentions and launch-language posts.

For production-quality KOL profiles, the next step is to add X user lookups so the API can retrieve usernames, follower counts and public profile metrics instead of displaying an ID-derived placeholder.
