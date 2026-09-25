const SOLANA_CA = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
const KOL_TERMS = /\\b(launching|launch|ca soon|contract soon|mint|fair launch|dropping|pump\\.fun|presale)\\b/i;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const bearer = process.env.X_BEARER_TOKEN;
  if (!bearer) {
    return res.status(400).json({
      error: "X_BEARER_TOKEN is not configured. Add it in Vercel → Settings → Environment Variables, or use Load demo."
    });
  }

  try {
    const query = encodeURIComponent('(solana OR pump.fun OR "CA soon" OR "contract soon") -is:retweet lang:en');
    const url = `https://api.x.com/2/tweets/search/recent?query=${query}&max_results=100&tweet.fields=created_at,author_id,text`;

    const x = await fetch(url, {
      headers: {
        Authorization: `Bearer ${bearer}`,
        accept: "application/json"
      },
      cache: "no-store"
    });

    const body = await x.text();
    let data = {};
    try { data = JSON.parse(body); } catch {}

    if (!x.ok) {
      return res.status(x.status).json({
        error: `X API request failed (${x.status}). ${body.slice(0, 500)}`
      });
    }

    const tweets = Array.isArray(data.data) ? data.data : [];
    const now = Date.now();
    const caMap = new Map();
    const kolMap = new Map();

    for (const tweet of tweets) {
      const created = tweet.created_at ? new Date(tweet.created_at).getTime() : now;
      const age = Math.max(0, Math.floor((now - created) / 1000));
      const addresses = tweet.text?.match(SOLANA_CA) || [];

      for (const ca of addresses) {
        if (!caMap.has(ca)) {
          caMap.set(ca, {
            ca,
            postAge: age,
            creator: "medium",
            risk: 25,
            trend: 60,
            signal: 65,
            liquidity: "—",
            marketCap: "—"
          });
        }
      }

      if (KOL_TERMS.test(tweet.text || "") && tweet.author_id) {
        const key = tweet.author_id;
        const existing = kolMap.get(key) || {
          handle: `user_${key.slice(-6)}`,
          followers: "—",
          engagement: "—",
          posts: 0,
          cas: 0,
          launch: 0,
          activity: "MEDIUM",
          age
        };
        existing.posts += 1;
        existing.cas += addresses.length;
        existing.launch += 1;
        existing.age = Math.min(existing.age, age);
        existing.activity = existing.posts >= 5 ? "HIGH" : "MEDIUM";
        kolMap.set(key, existing);
      }
    }

    return res.status(200).json({
      results: [...caMap.values()].sort((a,b) => a.postAge - b.postAge).slice(0, 50),
      kols: [...kolMap.values()].sort((a,b) => b.launch - a.launch).slice(0, 50),
      scanned: tweets.length
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected server error"
    });
  }
}
