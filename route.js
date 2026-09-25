const SOLANA_CA = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
const KOL_TERMS = /\b(launching|launch|ca soon|contract soon|mint|fair launch|dropping|pump\.fun|presale)\b/i;

export async function POST() {
  const bearer = process.env.X_BEARER_TOKEN;
  if (!bearer) return Response.json({
    error: "X_BEARER_TOKEN is not configured. Add it in Vercel → Settings → Environment Variables, or use Load demo."
  }, { status: 400 });

  const query = encodeURIComponent('(solana OR pump.fun OR "CA soon" OR "contract soon") -is:retweet lang:en');
  const x = await fetch(
    `https://api.x.com/2/tweets/search/recent?query=${query}&max_results=100&tweet.fields=created_at,author_id,text`,
    { headers:{ Authorization:`Bearer ${bearer}`, accept:"application/json" }, cache:"no-store" }
  );
  if (!x.ok) {
    const body = await x.text();
    return Response.json({error:`X API request failed (${x.status}). ${body.slice(0,300)}`},{status:x.status});
  }

  const data = await x.json();
  const tweets = data.data || [];
  const now = Date.now();
  const caMap = new Map();
  const kolMap = new Map();

  for (const tweet of tweets) {
    const age = Math.max(0, Math.floor((now - new Date(tweet.created_at).getTime()) / 1000));
    const addresses = tweet.text?.match(SOLANA_CA) || [];

    for (const ca of addresses) {
      if (!caMap.has(ca)) caMap.set(ca, {
        ca, postAge:age, creator:"medium", risk:25, trend:60, signal:65,
        liquidity:"—", marketCap:"—"
      });
    }

    if (KOL_TERMS.test(tweet.text || "") && tweet.author_id) {
      const key = tweet.author_id;
      const existing = kolMap.get(key) || {
        handle:`user_${key.slice(-6)}`, followers:"—", engagement:"—",
        posts:0, cas:0, launch:0, activity:"MEDIUM", age
      };
      existing.posts += 1;
      existing.cas += addresses.length;
      if (KOL_TERMS.test(tweet.text || "")) existing.launch += 1;
      existing.age = Math.min(existing.age, age);
      existing.activity = existing.posts >= 5 ? "HIGH" : "MEDIUM";
      kolMap.set(key, existing);
    }
  }

  return Response.json({
    results: [...caMap.values()].sort((a,b)=>a.postAge-b.postAge).slice(0,50),
    kols: [...kolMap.values()].sort((a,b)=>b.launch-a.launch).slice(0,50),
    scanned: tweets.length
  });
}