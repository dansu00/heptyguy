/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useMemo, useState } from "react";

const demoCAs = [
  { ca:"7xKX...m4Qp", postAge:12, creator:"strong", risk:12, trend:91, signal:94, liquidity:"$82.4K", marketCap:"$164K" },
  { ca:"9bR2...Kq8L", postAge:21, creator:"medium", risk:27, trend:83, signal:86, liquidity:"$41.8K", marketCap:"$96K" },
  { ca:"4mFz...P2tN", postAge:7, creator:"strong", risk:19, trend:79, signal:82, liquidity:"$29.7K", marketCap:"$73K" }
];

const demoKols = [
  { handle:"@ExampleKOL", followers:"125K", engagement:"4.8%", posts:"18", cas:"14", launch:"3", activity:"HIGH", age:"18s" },
  { handle:"@SolAlpha", followers:"82K", engagement:"6.1%", posts:"11", cas:"9", launch:"2", activity:"HIGH", age:"31s" },
  { handle:"@MemeRadar", followers:"47K", engagement:"3.7%", posts:"24", cas:"17", launch:"5", activity:"MEDIUM", age:"46s" },
  { handle:"@OnchainScout", followers:"31K", engagement:"8.2%", posts:"8", cas:"6", launch:"1", activity:"MEDIUM", age:"1m" }
];

export default function Home() {
  const [tab, setTab] = useState("ca");
  const [rows, setRows] = useState([]);
  const [kols, setKols] = useState([]);
  const [status, setStatus] = useState("Ready");
  const [lastScan, setLastScan] = useState("—");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const stats = useMemo(() => ({
    fresh: rows.length,
    high: rows.filter(x => x.signal >= 80).length,
    risk: rows.filter(x => x.risk >= 30).length,
    kols: kols.length
  }), [rows, kols]);

  async function scan() {
    setLoading(true);
    setError("");
    setStatus("Scanning");
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setRows(data.results || []);
      setKols(data.kols || []);
      setLastScan(new Date().toLocaleTimeString());
      setStatus("Ready");
      setTab("ca");
    } catch (e) {
      setStatus("Ready");
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function loadDemo() {
    setRows(demoCAs);
    setKols(demoKols);
    setLastScan(new Date().toLocaleTimeString());
    setError("");
  }

  function clearAll() {
    setRows([]);
    setKols([]);
    setLastScan("—");
    setError("");
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <div className="logo">CA</div>
          <div className="brand-name">CA Screener</div>
        </div>
        <div className="ready"><span /> {status} <b>{status.toUpperCase()}</b></div>
      </header>

      <section className="hero">
        <div className="eyebrow">0–30 SECOND HUNTER</div>
        <h1>Find fresh CAs. Track the KOLs.</h1>
        <p>
          Monitor recent X posts, extract Solana-style contract addresses,
          separate KOL activity from CA discovery, and inspect transparent
          market and social signals.
        </p>

        <div className="notice">
          <strong>Important:</strong> post age is the age of the X post, not proof
          that the token was created exactly that many seconds ago.
        </div>

        <div className="actions">
          <button className="primary" onClick={scan} disabled={loading}>
            {loading ? "Scanning…" : "⚡ Scan X"}
          </button>
          <button onClick={loadDemo}>Load demo</button>
          <button onClick={clearAll}>Clear</button>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="stats">
          <Stat label="Fresh CAs" value={stats.fresh} />
          <Stat label="High signal ≥80" value={stats.high} />
          <Stat label="Risk flags ≥30" value={stats.risk} />
          <Stat label="KOLs detected" value={stats.kols} />
        </div>
      </section>

      <nav className="tabs">
        <button className={tab === "ca" ? "active" : ""} onClick={() => setTab("ca")}>🔥 CA Scanner</button>
        <button className={tab === "kol" ? "active" : ""} onClick={() => setTab("kol")}>👤 KOL Radar</button>
      </nav>

      {tab === "ca" ? (
        <section className="results">
          <div className="section-head">
            <div><div className="eyebrow small">LIVE RESULTS</div><h2>Contract signals</h2></div>
            <div className="pill">{rows.length} results</div>
          </div>

          {rows.length === 0 ? <Empty title="No fresh CAs yet" text="Press Scan X or load demo data." /> :
            <div className="table-wrap"><table><thead><tr>
              <th>Contract</th><th>Post age</th><th>Creator</th><th>Risk</th><th>Trend</th><th>Signal</th><th>Liquidity</th><th>Market cap</th>
            </tr></thead><tbody>
              {rows.map((r,i)=><tr key={r.ca+i}>
                <td><code>{r.ca}</code></td><td>{r.postAge}s</td>
                <td><span className={`tag ${r.creator}`}>{r.creator}</span></td>
                <td>{r.risk}</td><td>{r.trend}</td><td><strong className="signal">{r.signal}</strong></td>
                <td>{r.liquidity}</td><td>{r.marketCap}</td>
              </tr>)}
            </tbody></table></div>}
        </section>
      ) : (
        <section className="results">
          <div className="section-head">
            <div><div className="eyebrow small">SEPARATE KOL MONITOR</div><h2>KOL Radar</h2></div>
            <div className="pill">{kols.length} accounts</div>
          </div>

          <div className="kol-grid">
            {kols.length === 0 ? <Empty title="No KOL activity yet" text="Scan X or load demo data." /> :
              kols.map((k,i)=><article className="kol-card" key={k.handle+i}>
                <div className="kol-top">
                  <div className="avatar">{k.handle.replace("@","").slice(0,1).toUpperCase()}</div>
                  <div><h3>{k.handle}</h3><span>{k.followers} followers</span></div>
                  <span className={`activity ${k.activity.toLowerCase()}`}>{k.activity}</span>
                </div>
                <div className="kol-grid-stats">
                  <Metric label="Engagement" value={k.engagement}/>
                  <Metric label="Recent posts" value={k.posts}/>
                  <Metric label="CA mentions" value={k.cas}/>
                  <Metric label="Launch signals" value={k.launch}/>
                </div>
                <div className="kol-bottom">
                  <span>Latest activity <strong>{k.age}</strong> ago</span>
                  <button onClick={() => window.open(`https://x.com/${k.handle.replace("@","")}`, "_blank")}>View X ↗</button>
                </div>
              </article>)}
          </div>

          <div className="launch-watch">
            <div><div className="eyebrow small">LAUNCH WATCH</div><h3>Watch KOL launch language</h3></div>
            <p>Monitors phrases such as “CA soon”, “launching”, “mint”, “fair launch”, “dropping” and “pump.fun”.</p>
          </div>
        </section>
      )}

      <footer>CA Screener • Signals are informational, not financial advice.</footer>
    </main>
  );
}

function Stat({label,value}){ return <div className="stat"><span>{label}</span><strong>{value}</strong></div>; }
function Metric({label,value}){ return <div><span>{label}</span><strong>{value}</strong></div>; }
function Empty({title,text}){ return <div className="empty"><div className="empty-icon">CA</div><h3>{title}</h3><p>{text}</p></div>; }