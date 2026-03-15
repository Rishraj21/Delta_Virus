import { useState, useEffect, useRef } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

/* ─────────────────────────────────────────────────────────────
   CONFIG & API
───────────────────────────────────────────────────────────── */
const GEMINI_KEY = "AIzaSyBD3MdhjqRz7CdxWERzUHFmD7N0kjQfA1Y";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

async function gemini(prompt) {
  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 2048 }
      })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } catch (e) { console.error("Gemini error:", e); return ""; }
}

function parseJSON(raw) {
  const clean = raw.replace(/```json\n?|```/g, "").trim();
  try { return JSON.parse(clean); } catch {
    const m = clean.match(/[\[{][\s\S]*[\]}]/);
    try { return m ? JSON.parse(m[0]) : null; } catch { return null; }
  }
}

/* ─────────────────────────────────────────────────────────────
   SPEECH
───────────────────────────────────────────────────────────── */
function speak(text, onStart, onEnd) {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const go = () => {
    const vs = window.speechSynthesis.getVoices();
    const v = vs.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Samantha")))
      || vs.find(v => v.lang === "en-US") || vs[0];
    if (v) u.voice = v;
    u.rate = 0.9; u.pitch = 1.0; u.volume = 1.0;
    u.onstart = () => onStart?.();
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  };
  window.speechSynthesis.getVoices().length === 0
    ? window.speechSynthesis.addEventListener("voiceschanged", go, { once: true })
    : setTimeout(go, 80);
}



/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────── */
function GlobalStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.id = "intellihire-styles";
    style.textContent = `
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{background:#060B18;color:#E2E8F0;font-family:'DM Sans',sans-serif;overflow-x:hidden}
      ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:rgba(99,102,241,.35);border-radius:2px}

      @keyframes pulse-ring{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.08);opacity:1}}
      @keyframes ripple-out{0%{transform:scale(.8);opacity:.7}100%{transform:scale(2.5);opacity:0}}
      @keyframes float-y{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
      @keyframes spin-cw{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes slide-up{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
      @keyframes fade-in{from{opacity:0}to{opacity:1}}
      @keyframes bar-dance{0%,100%{height:4px}50%{height:28px}}
      @keyframes glow-rec{0%,100%{box-shadow:0 0 20px rgba(239,68,68,.35)}50%{box-shadow:0 0 52px rgba(239,68,68,.7)}}
      @keyframes orb-pulse{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.07);filter:brightness(1.2)}}
      @keyframes rec-blink{0%,100%{opacity:1}50%{opacity:.25}}
      @keyframes diagonal-drift{0%{background-position:0 0}100%{background-position:80px 80px}}
      @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
      @keyframes hex-rotate{0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(180deg) scale(1.04)}100%{transform:rotate(360deg) scale(1)}}
      @keyframes particle-drift{0%{transform:translate(0,0);opacity:0}10%{opacity:1}90%{opacity:.6}100%{transform:translate(var(--dx),var(--dy));opacity:0}}
      @keyframes count-up{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
      @keyframes aurora-shift{0%{transform:translate(0,0) scale(1) rotate(0deg)}33%{transform:translate(60px,-40px) scale(1.08) rotate(8deg)}66%{transform:translate(-40px,50px) scale(.96) rotate(-5deg)}100%{transform:translate(0,0) scale(1) rotate(0deg)}}
      @keyframes aurora-shift2{0%{transform:translate(0,0) scale(1)}50%{transform:translate(-80px,30px) scale(1.12)}100%{transform:translate(0,0) scale(1)}}
      @keyframes line-slide{0%{transform:translateX(-110%);opacity:0}15%{opacity:.7}85%{opacity:.7}100%{transform:translateX(110%);opacity:0}}
      @keyframes hero-reveal{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:translateY(0)}}
      @keyframes badge-in{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
      .outfit{font-family:'Outfit',sans-serif!important}

      .su{animation:slide-up .5s cubic-bezier(.16,1,.3,1) both}
      .fi{animation:fade-in .4s ease both}
      .float{animation:float-y 5s ease-in-out infinite}

      .glass{
        background:rgba(10,16,32,.9);
        backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
        border:1px solid rgba(255,255,255,.07)
      }
      .glass-blue{border-color:rgba(99,102,241,.22)!important}
      .glass-green{border-color:rgba(16,185,129,.22)!important}
      .glass-red{border-color:rgba(239,68,68,.22)!important}
      .glass-amber{border-color:rgba(245,158,11,.22)!important}

      .btn-primary{
        background:linear-gradient(135deg,#6366F1,#4F46E5);
        color:#fff;border:none;cursor:pointer;
        font-family:'DM Sans',sans-serif;font-weight:600;
        transition:all .22s ease;
      }
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(99,102,241,.42)}
      .btn-primary:active{transform:translateY(0)}
      .btn-primary:disabled{opacity:.38;cursor:not-allowed;transform:none!important;box-shadow:none!important}

      .btn-success{
        background:linear-gradient(135deg,#10B981,#047857);
        color:#fff;border:none;cursor:pointer;
        font-family:'DM Sans',sans-serif;font-weight:600;
        transition:all .22s ease;
      }
      .btn-success:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(16,185,129,.42)}
      .btn-success:active{transform:translateY(0)}
      .btn-success:disabled{opacity:.38;cursor:not-allowed;transform:none!important}

      .btn-danger{
        background:linear-gradient(135deg,#EF4444,#B91C1C);
        color:#fff;border:none;cursor:pointer;
        font-family:'DM Sans',sans-serif;font-weight:600;
        transition:all .22s ease;
      }
      .btn-danger:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(239,68,68,.35)}

      .btn-ghost{
        background:transparent;color:#94A3B8;
        border:1px solid rgba(255,255,255,.1);cursor:pointer;
        font-family:'DM Sans',sans-serif;font-weight:500;
        transition:all .2s ease;
      }
      .btn-ghost:hover{background:rgba(255,255,255,.05);color:#E2E8F0}

      input,select,textarea{
        background:rgba(10,16,32,.95);
        border:1px solid rgba(255,255,255,.1);
        color:#E2E8F0;font-family:'DM Sans',sans-serif;
        outline:none;transition:border-color .2s,box-shadow .2s;
      }
      input:focus,select:focus,textarea:focus{
        border-color:rgba(99,102,241,.55);
        box-shadow:0 0 0 3px rgba(99,102,241,.1);
      }
      input::placeholder,textarea::placeholder{color:#263548}
      select option{background:#0A1020;color:#E2E8F0}

      .tag{
        display:inline-flex;align-items:center;gap:5px;
        padding:3px 11px;border-radius:20px;
        font-size:.72rem;font-weight:500;
      }
      .submit-btn-enter{animation:slide-up .4s cubic-bezier(.16,1,.3,1) both}

      /* Hexagonal grid overlay */
      .hex-bg::before{
        content:'';position:fixed;inset:0;
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zM28 100L0 84V66l28 16 28-16v18L28 100z' fill='none' stroke='rgba(99,102,241,0.04)' stroke-width='1'/%3E%3C/svg%3E");
        background-size:56px 100px;
        pointer-events:none;z-index:0;
      }
    `;
    document.head.appendChild(style);
    return () => {
      try { document.head.removeChild(style); } catch {}
    };
  }, []);
  return null;
}

/* ─────────────────────────────────────────────────────────────
   SHARED COMPONENTS
───────────────────────────────────────────────────────────── */
function Waveform({ active, color = "#6366F1", bars = 16 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"3px", height:"32px" }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width:"3px", borderRadius:"2px", background:color,
          height: active ? "100%" : "4px",
          animation: active ? `bar-dance ${.5+(i%5)*.1}s ease-in-out ${i*.05}s infinite` : "none",
          opacity: active ? .6+(i%4)*.1 : .18,
          transition:"height .2s ease"
        }} />
      ))}
    </div>
  );
}

function Orb({ phase }) {
  const configs = {
    asking:     { bg:"radial-gradient(circle at 38% 32%, #A5B4FC, #4338CA)", shadow:"rgba(99,102,241,.6)",  anim:"orb-pulse 2.5s ease-in-out infinite",  icon:"◎" },
    waiting:    { bg:"radial-gradient(circle at 38% 32%, #6EE7B7, #047857)", shadow:"rgba(16,185,129,.5)",  anim:"float-y 4s ease-in-out infinite",       icon:"◉" },
    recorded:   { bg:"radial-gradient(circle at 38% 32%, #FDE68A, #B45309)", shadow:"rgba(245,158,11,.5)",  anim:"orb-pulse 2s ease-in-out infinite",     icon:"◈" },
    recording:  { bg:"radial-gradient(circle at 38% 32%, #FCA5A5, #991B1B)", shadow:"rgba(239,68,68,.6)",   anim:"glow-rec 1.4s ease-in-out infinite",   icon:"●" },
    submitted:  { bg:"radial-gradient(circle at 38% 32%, #86EFAC, #15803D)", shadow:"rgba(34,197,94,.55)",  anim:"orb-pulse 1.2s ease-in-out infinite",  icon:"✓" },
    skipped:    { bg:"radial-gradient(circle at 38% 32%, #CBD5E1, #475569)", shadow:"rgba(148,163,184,.4)", anim:"float-y 3s ease-in-out infinite",       icon:"⟩" },
    processing: { bg:"radial-gradient(circle at 38% 32%, #FDE68A, #D97706)", shadow:"rgba(245,158,11,.5)",  anim:"orb-pulse .9s ease-in-out infinite",   icon:"⬡" },
    feedback:   { bg:"radial-gradient(circle at 38% 32%, #C4B5FD, #6D28D9)", shadow:"rgba(139,92,246,.5)",  anim:"float-y 3s ease-in-out infinite",       icon:"✦" },
    loading:    { bg:"radial-gradient(circle at 38% 32%, #7DD3FC, #0369A1)", shadow:"rgba(14,165,233,.45)", anim:"orb-pulse 1.4s ease-in-out infinite",  icon:"◌" },
  };
  const c = configs[phase] || configs.waiting;
  return (
    <div style={{ position:"relative", width:"120px", height:"120px", display:"flex", alignItems:"center", justifyContent:"center" }}>
      {["asking","recording"].includes(phase) && [1,2,3].map(i => (
        <div key={i} style={{
          position:"absolute", inset:0, borderRadius:"50%",
          border:`1px solid ${c.shadow.replace(/[\d.]+\)$/, String(Math.max(.05,.28-i*.07))+")")}`,
          animation:`ripple-out ${1.6+i*.35}s ease-out ${i*.22}s infinite`
        }}/>
      ))}
      <div style={{
        width:"106px", height:"106px", borderRadius:"50%",
        background:c.bg, boxShadow:`0 0 42px ${c.shadow}`,
        animation:c.anim,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"2rem", userSelect:"none", zIndex:2, position:"relative"
      }}>{c.icon}</div>
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button className="btn-ghost" onClick={onClick}
      style={{ padding:"8px 18px", borderRadius:"9px", fontSize:".82rem", marginBottom:"36px", display:"inline-flex", alignItems:"center", gap:"6px" }}>
      ← Back
    </button>
  );
}

function Tag({ children, color = "#6366F1" }) {
  return (
    <span className="tag" style={{ background:`${color}18`, color, border:`1px solid ${color}28` }}>
      {children}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>
      <span style={{ fontSize:".68rem", color:"#263548", fontWeight:600, letterSpacing:".1em", whiteSpace:"nowrap" }}>{children}</span>
      <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg, rgba(99,102,241,.2) 0%, transparent 100%)" }}/>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LANDING SCREEN  —  aurora / editorial redesign
───────────────────────────────────────────────────────────── */
function LandingScreen({ onStart }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div style={{ minHeight:"100vh", position:"relative", overflow:"hidden",
      display:"flex", flexDirection:"column",
      background:"#03050E",
      fontFamily:"'Outfit', sans-serif"
    }}>

      {/* ── AURORA BACKGROUND BLOBS ── */}
      {/* Primary aurora — top-left violet */}
      <div style={{ position:"fixed", top:"-18%", left:"-12%",
        width:"70vw", height:"70vw", maxWidth:"720px", maxHeight:"720px",
        borderRadius:"50%",
        background:"radial-gradient(circle at 40% 40%, rgba(99,102,241,.22) 0%, rgba(139,92,246,.14) 35%, transparent 70%)",
        filter:"blur(80px)", zIndex:0,
        animation:"aurora-shift 18s ease-in-out infinite"
      }}/>
      {/* Secondary aurora — bottom-right teal */}
      <div style={{ position:"fixed", bottom:"-20%", right:"-10%",
        width:"65vw", height:"65vw", maxWidth:"680px", maxHeight:"680px",
        borderRadius:"50%",
        background:"radial-gradient(circle at 60% 60%, rgba(6,182,212,.16) 0%, rgba(16,185,129,.12) 40%, transparent 70%)",
        filter:"blur(90px)", zIndex:0,
        animation:"aurora-shift2 22s ease-in-out infinite"
      }}/>
      {/* Accent aurora — center magenta */}
      <div style={{ position:"fixed", top:"35%", left:"38%",
        width:"40vw", height:"40vw", maxWidth:"440px", maxHeight:"440px",
        borderRadius:"50%",
        background:"radial-gradient(circle, rgba(236,72,153,.07) 0%, transparent 65%)",
        filter:"blur(70px)", zIndex:0,
        animation:"aurora-shift 28s ease-in-out 6s infinite reverse"
      }}/>

      {/* ── NOISE TEXTURE OVERLAY ── */}
      <div style={{ position:"fixed", inset:0, zIndex:1, opacity:.032,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize:"200px 200px"
      }}/>

      {/* ── HORIZONTAL ACCENT LINES ── */}
      {[15, 55, 80].map((top, i) => (
        <div key={i} style={{ position:"fixed", left:0, right:0, top:`${top}%`,
          height:"1px", zIndex:1,
          background:`linear-gradient(90deg, transparent 0%, ${["rgba(99,102,241,.12)","rgba(6,182,212,.1)","rgba(139,92,246,.08)"][i]} 30%, ${["rgba(16,185,129,.1)","rgba(99,102,241,.1)","rgba(6,182,212,.07)"][i]} 70%, transparent 100%)`,
          animation:`line-slide ${14+i*5}s linear ${i*4}s infinite`
        }}/>
      ))}

      {/* ── SUBTLE DOT GRID ── */}
      <div style={{ position:"fixed", inset:0, zIndex:0,
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,.045) 1px, transparent 1px)",
        backgroundSize:"44px 44px"
      }}/>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"relative", zIndex:20, padding:"18px 36px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        borderBottom:"1px solid rgba(255,255,255,.05)",
        backdropFilter:"blur(12px)"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"11px" }}>
          <div style={{ width:38, height:38, borderRadius:"11px",
            background:"linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#4F46E5 100%)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"20px", boxShadow:"0 0 20px rgba(99,102,241,.4), 0 4px 12px rgba(0,0,0,.4)"
          }}>🧠</div>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800,
            fontSize:"1.22rem", color:"#F8FAFC", letterSpacing:"-.03em" }}>
            IntelliHire
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <span className="tag" style={{ background:"rgba(16,185,129,.1)",
            color:"#34D399", border:"1px solid rgba(16,185,129,.2)",
            fontFamily:"'Outfit',sans-serif", fontWeight:500, fontSize:".74rem" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#10B981",
              display:"inline-block", animation:"pulse-ring 2s infinite" }}/>
            Live
          </span>
          <span className="tag" style={{ background:"rgba(99,102,241,.1)",
            color:"#A5B4FC", border:"1px solid rgba(99,102,241,.2)",
            fontFamily:"'Outfit',sans-serif", fontWeight:500, fontSize:".74rem" }}>
            Gemini AI
          </span>
          <span className="tag" style={{ background:"rgba(139,92,246,.1)",
            color:"#C4B5FD", border:"1px solid rgba(139,92,246,.18)",
            fontFamily:"'Outfit',sans-serif", fontWeight:500, fontSize:".74rem" }}>
            v2.0
          </span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <main style={{ flex:1, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"64px 24px 48px", position:"relative", zIndex:10, textAlign:"center" }}>

        {/* Badge */}
        <div style={{
          display:"inline-flex", alignItems:"center", gap:"9px",
          padding:"7px 20px", borderRadius:"100px", marginBottom:"28px",
          background:"rgba(99,102,241,.08)", border:"1px solid rgba(99,102,241,.2)",
          animation: mounted ? "badge-in .6s cubic-bezier(.16,1,.3,1) both" : "none",
          animationDelay:".05s"
        }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#6366F1",
            display:"inline-block", animation:"pulse-ring 1.8s infinite" }}/>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:500,
            fontSize:".82rem", color:"#A5B4FC", letterSpacing:".01em" }}>
            AI-Powered Enterprise Interview Platform
          </span>
        </div>

        {/* Headline */}
        <div style={{
          animation: mounted ? "hero-reveal .8s cubic-bezier(.16,1,.3,1) .1s both" : "none",
          marginBottom:"28px"
        }}>
          <h1 style={{
            fontFamily:"'Outfit',sans-serif", fontWeight:900,
            fontSize:"clamp(3rem, 7.5vw, 6rem)",
            lineHeight:.98, letterSpacing:"-.045em", marginBottom:0
          }}>
            {/* Line 1 */}
            <span style={{ display:"block", color:"#F8FAFC",
              textShadow:"0 0 80px rgba(99,102,241,.15)" }}>
              Ace Every
            </span>
            {/* Line 2 — gradient */}
            <span style={{ display:"block",
              background:"linear-gradient(100deg, #818CF8 0%, #A78BFA 30%, #38BDF8 62%, #34D399 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              backgroundClip:"text", backgroundSize:"200%",
              filter:"drop-shadow(0 0 40px rgba(99,102,241,.25))"
            }}>
              Interview.
            </span>
            {/* Line 3 */}
            <span style={{ display:"block", color:"rgba(248,250,252,.55)",
              fontWeight:300, fontSize:"clamp(1.6rem, 3.5vw, 3rem)",
              letterSpacing:"-.02em", marginTop:"6px"
            }}>
              with IntelliHire AI
            </span>
          </h1>
        </div>

        {/* Sub */}
        <p style={{
          fontFamily:"'Outfit',sans-serif", fontWeight:400,
          color:"rgba(148,163,184,.7)", fontSize:"clamp(.95rem,1.8vw,1.12rem)",
          maxWidth:"520px", lineHeight:1.72, marginBottom:"50px",
          animation: mounted ? "hero-reveal .8s cubic-bezier(.16,1,.3,1) .2s both" : "none"
        }}>
          Hyper-personalised AI interviews tailored to your domain, role, and level.
          Voice-powered conversations, real-time evaluation, and deep analytics —
          so you walk in truly prepared.
        </p>

        {/* CTA */}
        <div style={{ animation: mounted ? "hero-reveal .7s cubic-bezier(.16,1,.3,1) .3s both" : "none",
          marginBottom:"72px" }}>
          <button onClick={onStart} style={{
            fontFamily:"'Outfit',sans-serif", fontWeight:700,
            padding:"18px 52px", borderRadius:"100px", border:"none",
            fontSize:"1.1rem", cursor:"pointer",
            background:"linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #4F46E5 100%)",
            color:"#fff", letterSpacing:"-.01em",
            boxShadow:"0 0 0 1px rgba(99,102,241,.3), 0 8px 32px rgba(99,102,241,.38), 0 20px 60px rgba(99,102,241,.22)",
            display:"inline-flex", alignItems:"center", gap:"12px",
            transition:"all .25s cubic-bezier(.16,1,.3,1)"
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px) scale(1.02)";e.currentTarget.style.boxShadow="0 0 0 1px rgba(99,102,241,.4), 0 16px 48px rgba(99,102,241,.5), 0 28px 80px rgba(99,102,241,.3)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0) scale(1)";e.currentTarget.style.boxShadow="0 0 0 1px rgba(99,102,241,.3), 0 8px 32px rgba(99,102,241,.38), 0 20px 60px rgba(99,102,241,.22)";}}
          >
            <span style={{ fontSize:"1.2rem" }}>🚀</span>
            Begin Interview
            <span style={{ fontWeight:300, opacity:.8 }}>→</span>
          </button>
        </div>

        {/* Stats — removed "Interviews Done", kept 3 */}
        <div style={{ display:"flex", gap:"60px", flexWrap:"wrap", justifyContent:"center",
          animation: mounted ? "hero-reveal .7s cubic-bezier(.16,1,.3,1) .42s both" : "none" }}>
          {[
            ["76.3%",  "Success Rate",  "#34D399"],
            ["60+",    "Job Domains",   "#818CF8"],
            ["Live",   "AI Scoring",    "#38BDF8"],
          ].map(([v, l, col]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800,
                fontSize:"2.1rem", letterSpacing:"-.04em", lineHeight:1,
                color:col, textShadow:`0 0 30px ${col}44` }}>{v}</div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:400,
                color:"rgba(100,120,150,.65)", fontSize:".76rem",
                marginTop:"5px", letterSpacing:".04em", textTransform:"uppercase" }}>{l}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Feature strip */}
      <div style={{ position:"relative", zIndex:10,
        borderTop:"1px solid rgba(255,255,255,.05)", padding:"16px 36px",
        display:"flex", gap:"26px", flexWrap:"wrap", justifyContent:"center",
        backdropFilter:"blur(8px)", background:"rgba(3,5,14,.6)"
      }}>
        {[["🎙️","Voice-Powered"],["🧠","Gemini Evaluated"],["📊","Deep Analytics"],
          ["🎯","Domain-Tailored"],["📄","PDF Export"]].map(([icon,label]) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:"7px",
            fontFamily:"'Outfit',sans-serif", fontWeight:400,
            color:"rgba(100,116,139,.6)", fontSize:".8rem" }}>
            <span style={{ fontSize:"1rem" }}>{icon}</span>{label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MODE SELECTION
───────────────────────────────────────────────────────────── */
function ModeScreen({ onSelect, onBack }) {
  const [hovered, setHovered] = useState(null);
  const modes = [
    {
      id:"mock", icon:"🎯", title:"Mock Interview",
      sub:"Full Simulation — No Feedback Mid-Session",
      desc:"Experience a genuine enterprise interview. AI asks questions sequentially, you answer by voice. No hints until the very end — just like the real thing.",
      features:["Sequential questions","Zero mid-session hints","Comprehensive final report","Real hiring suitability score"],
      color:"#6366F1", glow:"rgba(99,102,241,.2)"
    },
    {
      id:"practice", icon:"🏋️", title:"Practice Mode",
      sub:"Learn Fast — Instant Per-Question Feedback",
      desc:"Improve with every answer. IntelliHire evaluates each response immediately and tells you exactly what to fix before moving on.",
      features:["Immediate AI feedback","Per-question score breakdown","Gap analysis & suggestions","Running improvement tracker"],
      color:"#10B981", glow:"rgba(16,185,129,.2)"
    }
  ];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#060B18,#0A0F22,#060B18)",
      display:"flex", flexDirection:"column", padding:"36px 24px" }}>
      <BackBtn onClick={onBack}/>

      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center", marginBottom:"48px" }}>
          <h2 className="su" style={{ fontFamily:"Syne", fontWeight:800, fontSize:"2rem",
            color:"#F1F5F9", marginBottom:"8px", letterSpacing:"-.025em" }}>
            Choose Your Mode
          </h2>
          <p style={{ color:"#2E4460", fontSize:".88rem" }}>
            How would you like to prepare with IntelliHire?
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",
          gap:"22px", maxWidth:"760px", width:"100%" }}>
          {modes.map((m, idx) => (
            <div key={m.id} className="glass su" style={{
              borderRadius:"22px", padding:"32px", cursor:"pointer",
              animationDelay:`${.1+idx*.1}s`,
              transition:"all .3s cubic-bezier(.16,1,.3,1)",
              transform: hovered===m.id ? "translateY(-8px) scale(1.01)" : "translateY(0)",
              boxShadow: hovered===m.id ? `0 32px 64px ${m.glow}` : "none",
              borderColor: hovered===m.id ? `${m.color}35` : "rgba(255,255,255,.07)"
            }}
              onMouseEnter={()=>setHovered(m.id)}
              onMouseLeave={()=>setHovered(null)}
            >
              <div style={{ fontSize:"2.6rem", marginBottom:"18px" }}>{m.icon}</div>
              <div style={{ fontFamily:"Syne", fontSize:"1.25rem", fontWeight:700,
                color:"#F1F5F9", marginBottom:"5px" }}>{m.title}</div>
              <div style={{ color:m.color, fontSize:".72rem", fontWeight:600, marginBottom:"15px",
                letterSpacing:".06em", textTransform:"uppercase" }}>{m.sub}</div>
              <p style={{ color:"#3D5470", fontSize:".86rem", lineHeight:1.68, marginBottom:"22px" }}>{m.desc}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"7px", marginBottom:"26px" }}>
                {m.features.map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:"9px",
                    fontSize:".83rem", color:"#627A96" }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:m.color, flexShrink:0 }}/>
                    {f}
                  </div>
                ))}
              </div>
              <button className={m.id==="mock"?"btn-primary":"btn-success"} onClick={()=>onSelect(m.id)}
                style={{ width:"100%", padding:"12px", borderRadius:"12px", fontSize:".9rem" }}>
                Start {m.title} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INPUT MODE SELECTION  —  Voice vs Text
───────────────────────────────────────────────────────────── */
function InputModeScreen({ interviewMode, onSelect, onBack }) {
  const [hovered, setHovered] = useState(null);
  const modeColor = interviewMode === "mock" ? "#6366F1" : "#10B981";

  const options = [
    {
      id: "voice",
      icon: "🎙️",
      title: "Voice Interview",
      sub: "Speak Your Answers",
      desc: "Answer questions by speaking into your microphone. AI reads each question aloud and transcribes your spoken response in real time.",
      features: [
        "AI reads questions aloud",
        "Real-time speech transcription",
        "Natural conversation feel",
        "Review before submitting",
      ],
      color: "#6366F1",
      glow: "rgba(99,102,241,.22)",
      badge: "Most Realistic",
      badgeColor: "#6366F1",
    },
    {
      id: "text",
      icon: "⌨️",
      title: "Text Interview",
      sub: "Type Your Answers",
      desc: "Answer every question by typing directly. No microphone required — perfect for quiet environments or when you prefer written expression.",
      features: [
        "No microphone needed",
        "Type at your own pace",
        "Auto-expanding text area",
        "Works in any environment",
      ],
      color: "#06B6D4",
      glow: "rgba(6,182,212,.22)",
      badge: "Works Everywhere",
      badgeColor: "#06B6D4",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#060B18,#0A0F22,#060B18)",
      display: "flex", flexDirection: "column", padding: "36px 24px",
    }}>
      <BackBtn onClick={onBack} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <div style={{ marginBottom: "14px" }}>
            <Tag color={modeColor}>
              {interviewMode === "mock" ? "🎯 Mock Interview" : "🏋️ Practice Mode"}
            </Tag>
          </div>
          <h2 className="su" style={{ fontFamily: "Syne", fontWeight: 800,
            fontSize: "2rem", color: "#F1F5F9", marginBottom: "8px",
            letterSpacing: "-.025em" }}>
            Choose Your Input Method
          </h2>
          <p style={{ color: "#2E4460", fontSize: ".88rem", maxWidth: "440px" }}>
            Both methods use the same AI evaluation and all the same features.
            Pick whichever feels most comfortable.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "22px", maxWidth: "760px", width: "100%" }}>

          {options.map((opt, idx) => (
            <div key={opt.id} className="glass su" style={{
              borderRadius: "22px", padding: "30px", cursor: "pointer",
              animationDelay: `${.08 + idx * .1}s`,
              transition: "all .3s cubic-bezier(.16,1,.3,1)",
              transform: hovered === opt.id ? "translateY(-8px) scale(1.015)" : "translateY(0)",
              boxShadow: hovered === opt.id ? `0 32px 64px ${opt.glow}` : "none",
              borderColor: hovered === opt.id ? `${opt.color}38` : "rgba(255,255,255,.07)",
              position: "relative", overflow: "hidden",
            }}
              onMouseEnter={() => setHovered(opt.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Badge */}
              <div style={{
                position: "absolute", top: "18px", right: "18px",
                padding: "3px 10px", borderRadius: "20px", fontSize: ".65rem",
                fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase",
                background: `${opt.badgeColor}18`, color: opt.badgeColor,
                border: `1px solid ${opt.badgeColor}28`,
              }}>
                {opt.badge}
              </div>

              <div style={{ fontSize: "2.6rem", marginBottom: "18px" }}>{opt.icon}</div>

              <div style={{ fontFamily: "Syne", fontSize: "1.25rem", fontWeight: 700,
                color: "#F1F5F9", marginBottom: "5px" }}>{opt.title}</div>

              <div style={{ color: opt.color, fontSize: ".72rem", fontWeight: 600,
                marginBottom: "14px", letterSpacing: ".06em",
                textTransform: "uppercase" }}>{opt.sub}</div>

              <p style={{ color: "#3D5470", fontSize: ".86rem", lineHeight: 1.68,
                marginBottom: "22px" }}>{opt.desc}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "7px",
                marginBottom: "26px" }}>
                {opt.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center",
                    gap: "9px", fontSize: ".83rem", color: "#627A96" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%",
                      background: opt.color, flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>

              <button onClick={() => onSelect(opt.id)} style={{
                width: "100%", padding: "13px", borderRadius: "12px", border: "none",
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
                fontSize: ".92rem", color: "#fff",
                background: `linear-gradient(135deg, ${opt.color}, ${opt.color}cc)`,
                boxShadow: `0 4px 20px ${opt.color}30`,
                transition: "all .22s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${opt.color}55`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 20px ${opt.color}30`; }}
              >
                Use {opt.title} →
              </button>
            </div>
          ))}
        </div>

        {/* Comparison note */}
        <p style={{ marginTop: "32px", fontSize: ".78rem", color: "#1E3048",
          textAlign: "center", maxWidth: "420px", lineHeight: 1.6 }}>
          ✦ Same AI scoring, same skip/retry features, same final report in both modes.
          You can always start a new session with a different input method.
        </p>
      </div>
    </div>
  );
}
const DOMAINS = [
  "Software Engineering","Frontend Development","Backend Development","Full Stack Development",
  "Data Science & ML","Artificial Intelligence","DevOps & Cloud","Cybersecurity",
  "Product Management","UI/UX Design","Mobile Development","Blockchain & Web3",
  "Embedded Systems","Database Administration","QA & Testing","Business Analysis",
  "System Architecture","Site Reliability Engineering"
];
const ROLES_BY_DOMAIN = {
  "Software Engineering":["Software Engineer","Senior Software Engineer","Staff Engineer","Principal Engineer"],
  "Frontend Development":["Frontend Engineer","React Developer","Vue Developer","Angular Developer","UI Engineer"],
  "Backend Development":["Backend Engineer","Node.js Developer","Python Developer","Java Developer","Go Developer"],
  "Full Stack Development":["Full Stack Engineer","MERN Stack Developer","MEAN Stack Developer","Full Stack Architect"],
  "Data Science & ML":["Data Scientist","ML Engineer","Data Analyst","Research Scientist","NLP Engineer"],
  "Artificial Intelligence":["AI Engineer","ML Research Engineer","Computer Vision Engineer","AI Product Engineer"],
  "DevOps & Cloud":["DevOps Engineer","Cloud Architect","SRE","Platform Engineer","Infrastructure Engineer"],
  "Cybersecurity":["Security Engineer","Penetration Tester","Security Analyst","AppSec Engineer","CISO"],
  "Product Management":["Product Manager","Senior PM","Group PM","Technical Product Manager","CPO"],
  "UI/UX Design":["UX Designer","UI Designer","Product Designer","Interaction Designer","Design Lead"],
  "Mobile Development":["iOS Developer","Android Developer","React Native Developer","Flutter Developer"],
  "Blockchain & Web3":["Smart Contract Developer","Solidity Engineer","Web3 Developer","Blockchain Architect"],
  "Embedded Systems":["Embedded Systems Engineer","Firmware Engineer","RTOS Developer","IoT Engineer"],
  "Database Administration":["Database Administrator","Database Engineer","Data Engineer","SQL Developer"],
  "QA & Testing":["QA Engineer","SDET","Test Automation Engineer","Quality Assurance Lead"],
  "Business Analysis":["Business Analyst","Functional Consultant","Systems Analyst","Requirements Engineer"],
  "System Architecture":["Solutions Architect","Enterprise Architect","Cloud Solutions Architect","CTO"],
  "Site Reliability Engineering":["SRE","Infrastructure Engineer","Platform Reliability Engineer"],
};

/* Suggested skills per domain — for chip selector */
const SKILLS_BY_DOMAIN = {
  "Software Engineering":["Data Structures","Algorithms","OOP","Design Patterns","REST APIs","Git","SQL","Testing","CI/CD","Docker"],
  "Frontend Development":["React","Vue","Angular","TypeScript","HTML/CSS","Tailwind","Webpack","Next.js","GraphQL","Testing Library"],
  "Backend Development":["Node.js","Python","Java","Go","Express","FastAPI","Spring","PostgreSQL","Redis","Microservices"],
  "Full Stack Development":["React","Node.js","PostgreSQL","MongoDB","Docker","REST APIs","TypeScript","Next.js","GraphQL","AWS"],
  "Data Science & ML":["Python","Pandas","NumPy","scikit-learn","TensorFlow","PyTorch","SQL","Statistics","Jupyter","Matplotlib"],
  "Artificial Intelligence":["PyTorch","TensorFlow","LLMs","Transformers","NLP","Computer Vision","MLOps","CUDA","Hugging Face","RAG"],
  "DevOps & Cloud":["AWS","Azure","GCP","Kubernetes","Docker","Terraform","Jenkins","GitHub Actions","Linux","Ansible"],
  "Cybersecurity":["Penetration Testing","OWASP","Network Security","SIEM","Cryptography","Burp Suite","Nmap","Python","Incident Response","IAM"],
  "Product Management":["Product Strategy","Roadmapping","Agile","User Research","SQL","A/B Testing","Stakeholder Mgmt","JIRA","OKRs","Figma"],
  "UI/UX Design":["Figma","User Research","Wireframing","Prototyping","Usability Testing","Design Systems","Adobe XD","Accessibility","Information Architecture","Sketch"],
  "Mobile Development":["React Native","Flutter","Swift","Kotlin","Xcode","Android Studio","Firebase","REST APIs","App Store","Push Notifications"],
  "Blockchain & Web3":["Solidity","Ethereum","Smart Contracts","Web3.js","ethers.js","Hardhat","IPFS","DeFi","NFTs","Rust"],
  "Embedded Systems":["C","C++","RTOS","ARM","Microcontrollers","UART","SPI","I2C","Debugging","Linux Kernel"],
  "Database Administration":["SQL","PostgreSQL","MySQL","MongoDB","Redis","Query Optimisation","Indexing","Replication","Backups","Performance Tuning"],
  "QA & Testing":["Selenium","Cypress","Jest","Postman","Test Planning","BDD","CI/CD","Load Testing","Bug Tracking","Automation"],
  "Business Analysis":["Requirements Gathering","UML","SQL","JIRA","Stakeholder Mgmt","Process Mapping","Agile","Excel","Documentation","Gap Analysis"],
  "System Architecture":["Microservices","System Design","Cloud Architecture","Scalability","High Availability","API Design","Event-Driven","Caching","Message Queues","Security"],
  "Site Reliability Engineering":["Kubernetes","Prometheus","Grafana","Incident Management","SLOs/SLAs","Terraform","Python","Go","Distributed Systems","Chaos Engineering"],
};

function ProfileScreen({ mode, onSubmit, onBack }) {
  const [form, setForm] = useState({
    name:"", domain:"Software Engineering", role:"Software Engineer",
    experience:"1-3", selectedSkills:[], customSkill:"", jobDesc:"",
    numQuestions:"5", intensity:"Standard"
  });
  const set = (k,v) => setForm(p => ({ ...p, [k]:v }));

  const roles = ROLES_BY_DOMAIN[form.domain] || ["Software Engineer"];
  const suggestedSkills = SKILLS_BY_DOMAIN[form.domain] || [];

  // Reset skills when domain changes
  useEffect(() => {
    if (!roles.includes(form.role)) set("role", roles[0]);
    set("selectedSkills", []);
  }, [form.domain]);

  const modeColor = mode==="mock" ? "#6366F1" : "#10B981";
  const fieldStyle = { width:"100%", padding:"11px 15px", borderRadius:"10px", fontSize:".88rem" };
  const valid = form.name.trim().length > 0;
  // Build final skills string for AI prompt
  const finalSkills = [...form.selectedSkills, ...(form.customSkill.trim() ? form.customSkill.split(",").map(s=>s.trim()).filter(Boolean) : [])].join(", ");

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#060B18,#0A0F22,#060B18)",
      display:"flex", flexDirection:"column", alignItems:"center", padding:"36px 20px 60px" }}>
      <div style={{ width:"100%", maxWidth:"720px" }}>
        <BackBtn onClick={onBack}/>

        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"26px" }}>
          <Tag color={modeColor}>{mode==="mock"?"🎯 Mock Interview":"🏋️ Practice Mode"}</Tag>
          <Tag color="#818CF8">🧠 IntelliHire</Tag>
        </div>

        <h2 className="su" style={{ fontFamily:"Syne", fontWeight:800, fontSize:"1.9rem",
          color:"#F1F5F9", marginBottom:"6px", letterSpacing:"-.025em", animationDelay:".06s" }}>
          Set Up Your Interview
        </h2>
        <p className="su" style={{ color:"#2E4460", fontSize:".86rem", marginBottom:"32px", animationDelay:".12s" }}>
          Personalise every detail — domain, role, intensity, and question count
        </p>

        <div className="glass su" style={{ borderRadius:"22px", padding:"32px", animationDelay:".18s" }}>

          {/* ── CANDIDATE PROFILE ── */}
          <SectionLabel>CANDIDATE PROFILE</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"18px" }}>
            <div>
              <label style={{ fontSize:".72rem", color:"#263548", marginBottom:"7px",
                display:"block", fontWeight:600, letterSpacing:".06em" }}>CANDIDATE NAME *</label>
              <input style={fieldStyle} placeholder="e.g. Rahul Sharma"
                value={form.name} onChange={e=>set("name",e.target.value)}/>
            </div>
            <div>
              <label style={{ fontSize:".72rem", color:"#263548", marginBottom:"7px",
                display:"block", fontWeight:600, letterSpacing:".06em" }}>EXPERIENCE LEVEL</label>
              <select style={{ ...fieldStyle, cursor:"pointer" }}
                value={form.experience} onChange={e=>set("experience",e.target.value)}>
                {[["0-1","Fresher (0–1 year)"],["1-3","Junior (1–3 years)"],
                  ["3-5","Mid-Level (3–5 years)"],["5-8","Senior (5–8 years)"],
                  ["8+","Lead / Principal (8+ years)"]].map(([v,l])=>(
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Domain */}
          <div style={{ marginBottom:"18px" }}>
            <label style={{ fontSize:".72rem", color:"#263548", marginBottom:"7px",
              display:"block", fontWeight:600, letterSpacing:".06em" }}>
              DOMAIN / FIELD OF INTEREST
            </label>
            <select style={{ ...fieldStyle, cursor:"pointer" }}
              value={form.domain} onChange={e=>set("domain",e.target.value)}>
              {DOMAINS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <p style={{ color:"#1E3048", fontSize:".72rem", marginTop:"5px" }}>
              Interview questions will be tailored specifically to this domain
            </p>
          </div>

          {/* Role */}
          <div style={{ marginBottom:"18px" }}>
            <label style={{ fontSize:".72rem", color:"#263548", marginBottom:"7px",
              display:"block", fontWeight:600, letterSpacing:".06em" }}>ROLE APPLYING FOR</label>
            <select style={{ ...fieldStyle, cursor:"pointer" }}
              value={form.role} onChange={e=>set("role",e.target.value)}>
              {roles.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* ── SKILLS CHIP SELECTOR ── */}
          <div style={{ marginBottom:"18px" }}>
            <label style={{ fontSize:".72rem", color:"#263548", marginBottom:"7px",
              display:"flex", justifyContent:"space-between", alignItems:"center",
              fontWeight:600, letterSpacing:".06em" }}>
              <span>KEY SKILLS / TECHNOLOGIES</span>
              {form.selectedSkills.length > 0 && (
                <span style={{ fontSize:".68rem", color:"#6366F1", fontWeight:500,
                  letterSpacing:"normal" }}>
                  {form.selectedSkills.length} selected
                </span>
              )}
            </label>
            {/* Suggestion chips */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"7px", marginBottom:"10px" }}>
              {suggestedSkills.map(skill => {
                const selected = form.selectedSkills.includes(skill);
                return (
                  <button key={skill} onClick={() => {
                    set("selectedSkills", selected
                      ? form.selectedSkills.filter(s=>s!==skill)
                      : [...form.selectedSkills, skill]);
                  }} style={{
                    padding:"5px 12px", borderRadius:"20px", border:"none", cursor:"pointer",
                    fontSize:".78rem", fontFamily:"'DM Sans',sans-serif", fontWeight:500,
                    transition:"all .18s ease",
                    background: selected ? "rgba(99,102,241,.22)" : "rgba(255,255,255,.05)",
                    color: selected ? "#A5B4FC" : "#4E6A8A",
                    boxShadow: selected ? "0 0 0 1px rgba(99,102,241,.4)" : "0 0 0 1px rgba(255,255,255,.08)",
                    transform: selected ? "scale(1.02)" : "scale(1)"
                  }}>
                    {selected && <span style={{ marginRight:"4px", fontSize:".7rem" }}>✓</span>}
                    {skill}
                  </button>
                );
              })}
            </div>
            {/* Custom skill input */}
            <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
              <input style={{ ...fieldStyle, flex:1 }}
                placeholder="Add your own skill (e.g. Kafka, gRPC, LangChain…)"
                value={form.customSkill}
                onChange={e=>set("customSkill",e.target.value)}
                onKeyDown={e=>{
                  if (e.key==="Enter" && e.target.value.trim()) {
                    const newSkill = e.target.value.trim();
                    if (!form.selectedSkills.includes(newSkill))
                      set("selectedSkills",[...form.selectedSkills, newSkill]);
                    set("customSkill","");
                  }
                }}
              />
              <button className="btn-ghost" onClick={()=>{
                const newSkill = form.customSkill.trim();
                if (newSkill && !form.selectedSkills.includes(newSkill)) {
                  set("selectedSkills",[...form.selectedSkills, newSkill]);
                  set("customSkill","");
                }
              }} style={{ padding:"11px 16px", borderRadius:"10px", fontSize:".82rem",
                whiteSpace:"nowrap", flexShrink:0 }}>
                + Add
              </button>
            </div>
            <p style={{ color:"#1E3048", fontSize:".7rem", marginTop:"6px" }}>
              Tap chips to select · Type custom skills and press Enter or + Add
            </p>
          </div>

          {/* Job Desc */}
          <div style={{ marginBottom:"28px" }}>
            <label style={{ fontSize:".72rem", color:"#263548", marginBottom:"7px",
              display:"block", fontWeight:600, letterSpacing:".06em" }}>
              JOB DESCRIPTION <span style={{ color:"#1A2D40", fontWeight:400 }}>(optional)</span>
            </label>
            <textarea style={{ ...fieldStyle, resize:"vertical", minHeight:"90px", lineHeight:1.6 }}
              placeholder={`Paste or summarise the job description here. E.g: We are looking for a ${form.role} to design scalable systems, work with distributed databases, and lead architecture decisions.`}
              value={form.jobDesc} onChange={e=>set("jobDesc",e.target.value)}/>
          </div>

          {/* ── INTERVIEW CONFIGURATION ── */}
          <SectionLabel>INTERVIEW CONFIGURATION</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"28px" }}>
            <div>
              <label style={{ fontSize:".72rem", color:"#263548", marginBottom:"7px",
                display:"block", fontWeight:600, letterSpacing:".06em" }}>TOTAL QUESTIONS</label>
              <select style={{ ...fieldStyle, cursor:"pointer" }}
                value={form.numQuestions} onChange={e=>set("numQuestions",e.target.value)}>
                {[["3","3 Questions (Quick)"],["5","5 Questions (Standard)"],
                  ["7","7 Questions (Thorough)"],["10","10 Questions (Deep Dive)"]].map(([v,l])=>(
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize:".72rem", color:"#263548", marginBottom:"7px",
                display:"block", fontWeight:600, letterSpacing:".06em" }}>INTERVIEW INTENSITY</label>
              <select style={{ ...fieldStyle, cursor:"pointer" }}
                value={form.intensity} onChange={e=>set("intensity",e.target.value)}>
                {[["Beginner","Beginner (Friendly)"],["Standard","Standard (Industry)"],
                  ["Tough","Tough (FAANG-style)"],["Extreme","Extreme (Staff+)"]].map(([v,l])=>(
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Intensity explainer */}
          <div style={{ padding:"12px 16px", borderRadius:"12px", marginBottom:"28px",
            background:"rgba(99,102,241,.05)", border:"1px solid rgba(99,102,241,.12)" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
              {[
                ["Beginner","Introductory & conceptual questions","#10B981"],
                ["Standard","Mix of conceptual + technical","#6366F1"],
                ["Tough","Deep technical + system design","#F59E0B"],
                ["Extreme","Architecture + edge cases + trade-offs","#EF4444"]
              ].map(([name,desc,col])=>(
                <div key={name} style={{ display:"flex", gap:"8px", alignItems:"flex-start",
                  opacity: form.intensity===name ? 1 : .35, transition:"opacity .2s" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:col,
                    flexShrink:0, marginTop:"5px" }}/>
                  <div>
                    <div style={{ fontSize:".72rem", color:col, fontWeight:600 }}>{name}</div>
                    <div style={{ fontSize:".69rem", color:"#2E4460", lineHeight:1.4 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className={mode==="mock"?"btn-primary":"btn-success"}
            disabled={!valid} onClick={()=>onSubmit({...form, skills: finalSkills})}
            style={{ width:"100%", padding:"14px", borderRadius:"13px", fontSize:"1rem",
              display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}>
            <span>▷</span> Begin Interview Session
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RECORDING WAVEFORM  —  pure CSS animation, no getUserMedia needed
───────────────────────────────────────────────────────────── */
function RecordingWaveform() {
  const BARS   = 24;
  // Pre-set varying heights for a natural waveform silhouette
  const peaks  = [20,35,55,80,95,75,60,85,100,70,50,90,80,45,65,95,75,55,85,65,40,70,50,25];
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      gap:"3px", height:"48px", width:"100%", maxWidth:"340px" }}>
      {Array.from({ length: BARS }).map((_, i) => (
        <div key={i} style={{
          width:"4px", borderRadius:"3px",
          background: i % 4 === 0 ? "#EF4444"
                    : i % 4 === 1 ? "#F87171"
                    : i % 4 === 2 ? "#FCA5A5"
                    : "#EF4444",
          height:`${peaks[i]}%`,
          animation:`bar-dance ${0.45 + (i % 6) * 0.09}s ease-in-out ${i * 0.045}s infinite`,
          opacity: 0.65 + (i % 4) * 0.09,
        }}/>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INTERVIEW SCREEN
───────────────────────────────────────────────────────────── */
function InterviewScreen({ mode, inputMode, profile, onComplete, onExit }) {
  const [phase, setPhase] = useState("loading");
  const phaseRef = useRef(phase);
  const [loadMsg, setLoadMsg] = useState("Generating your personalised interview with Gemini AI…");
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);       // { questionId, question, answer }[]
  const [evaluations, setEvaluations] = useState([]); // ev[]  — indexed by question
  const [pendingEvals, setPendingEvals] = useState({}); // {qIdx: ev}  for out-of-order questions
  const [liveText, setLiveText] = useState("");
  const [draftText, setDraftText] = useState("");   // text confirmed after stop, before submit
  const [currentEval, setCurrentEval] = useState(null);
  const [caption, setCaption] = useState("");
  const [timer, setTimer] = useState(0);
  const [skippable, setSkippable] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [skippedQuestions, setSkippedQuestions] = useState(new Set());

  const recogRef     = useRef(null);
  const timerRef     = useRef(null);
  const accumRef     = useRef("");
  const captionRef   = useRef(null);
  const allAnswersRef = useRef([]);
  const allEvalsRef  = useRef([]);

  /* ─────────────────────────────────────────────────────────────
     SPEECH RECOGNITION  — fully independent of getUserMedia
  ───────────────────────────────────────────────────────────── */
  function createRecognition(onInterim, onFinal) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const r         = new SR();
    r.continuous     = true;
    r.interimResults = true;
    r.lang           = "en-US";

    // Accumulate finalised segments — never overwrite
    let built = "";

    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const seg = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          built += (built ? " " : "") + seg.trim();
        } else {
          interim += seg;
        }
      }
      const display = (built + (interim ? " " + interim : "")).trim();
      onInterim(display);
      if (built) onFinal(built);
    };

    r.onerror = (ev) => {
      if (ev.error === "no-speech") return; // normal pause, ignore
      if (ev.error === "aborted")   return; // we called stop(), ignore
      console.warn("[STT error]", ev.error);
    };

    // Keep alive — restart if still supposed to be recording
    r.onend = () => {
      if (phaseRef.current === "recording") {
        try { r.start(); } catch (_) {}
      }
    };

    return r;
  }

  /* ─────────────────────────────────────────────────────────────
     RECORDING LIFECYCLE
  ───────────────────────────────────────────────────────────── */
  function startRecording() {
    if (phaseRef.current === "recording") return;

    // Reset all state first
    accumRef.current = "";
    setDraftText(""); setLiveText("");
    setTimer(0);
    setPhase("recording");

    // Start countdown timer
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);

    // 3. Start SpeechRecognition — independent of step 1
    const recog = createRecognition(
      (display)   => setLiveText(display),
      (finalised) => { accumRef.current = finalised; }
    );

    if (recog) {
      recogRef.current = recog;
      try { recog.start(); }
      catch (e) { console.warn("[STT start]", e.message); }
    } else {
      // SpeechRecognition not available — switch to typed-answer mode
      setPhase("typing");
    }
  }

  function stopRecording() {
    const r = recogRef.current;
    recogRef.current = null;
    try { r?.stop(); } catch (_) {}
    clearInterval(timerRef.current);
    const captured = (accumRef.current || liveText).trim();
    setDraftText(captured);
    setLiveText("");
    setPhase("recorded");
  }

  function reRecord() {
    const r = recogRef.current;
    recogRef.current = null;
    try { r?.stop(); } catch (_) {}
    clearInterval(timerRef.current);
    setDraftText(""); setLiveText(""); setCurrentEval(null);
    accumRef.current = "";
    setTimeout(startRecording, 300);
  }

  function cleanup() {
    window.speechSynthesis?.cancel();
    const r = recogRef.current;
    recogRef.current = null;
    try { r?.stop(); } catch (_) {}
    clearInterval(timerRef.current);
  }

  useEffect(() => { loadQuestions(); return cleanup; }, []);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => {
    if (captionRef.current)
      captionRef.current.scrollTop = captionRef.current.scrollHeight;
  }, [liveText, draftText]);

  async function loadQuestions() {
    const n = parseInt(profile.numQuestions) || 5;
    const intensity = profile.intensity || "Standard";
    const domain = profile.domain || profile.role;
    const jd = profile.jobDesc ? `\nJob Description context: "${profile.jobDesc.slice(0,400)}"` : "";

    const intensityDesc = {
      Beginner:"basic conceptual and introductory",
      Standard:"mix of conceptual, technical and situational",
      Tough:"deep technical, system design, and FAANG-level",
      Extreme:"staff-level architecture, trade-offs, edge cases"
    }[intensity] || "standard";

    const prompt = `You are an expert ${domain} interviewer at a top tech company.
Generate exactly ${n} interview questions for a ${profile.role} candidate.
Experience: ${profile.experience} years. Domain: ${domain}.
Intensity: ${intensity} — questions should be ${intensityDesc}.
Skills to incorporate: ${profile.skills||"general domain skills"}.${jd}

Progression: start with intro/background, build to technical depth, end with ${n>4?"system design or advanced scenario":"technical problem"}.

Return ONLY a valid JSON array:
[
  {"id":1,"question":"<question text>","type":"intro"},
  {"id":2,"question":"<question text>","type":"conceptual"},
  ...
]
Types to use (in order): intro, conceptual, technical, problem-solving, architecture, behavioral, system-design
No markdown fences, just the JSON array.`;

    const raw = await gemini(prompt);
    let qs = parseJSON(raw);
    if (!qs || !Array.isArray(qs) || qs.length < 2) {
      qs = Array.from({length:n},(_,i)=>({
        id:i+1,
        question:[
          `Tell me about yourself and your background as a ${profile.role}.`,
          `What are the core principles you follow when working in ${domain}?`,
          `Describe a complex technical challenge you solved in your domain.`,
          `How would you design a scalable system for a high-traffic application?`,
          `What emerging trends in ${domain} excite you the most, and why?`,
          `Walk me through your approach to debugging a production incident.`,
          `How do you balance technical debt with feature delivery?`,
          `Describe your experience with system architecture decisions.`,
          `What does good code review look like to you?`,
          `How do you handle disagreements with senior engineers?`,
        ][i] || `Question ${i+1} about ${domain}.`,
        type:["intro","conceptual","technical","problem-solving","architecture","behavioral","system-design","technical","conceptual","behavioral"][i]
      }));
    }
    setQuestions(qs);
    startQuestion(qs, 0, [], []);
  }

  function startQuestion(qs, idx, prevAnswers, prevEvals) {
    if (idx >= qs.length) { finishInterview(prevEvals, prevAnswers, qs); return; }
    const q = qs[idx];
    setQIdx(idx);
    setPhase("asking");
    setCaption(q.question);
    setLiveText(""); setDraftText("");
    accumRef.current = "";
    setCurrentEval(null);
    setSkippable(false);
    setVisitedQuestions(prev => new Set([...prev, idx]));

    const intro = idx===0
      ? `Welcome ${profile.name}. I'm your IntelliHire AI interviewer. Let's begin your ${profile.role} interview. `
      : idx===qs.length-1
      ? "Excellent work. This is your final question. "
      : "Good. Let's continue. ";

    speak(intro + q.question,
      () => setTimeout(() => setSkippable(true), 1500),
      () => {
        // Text mode → go straight to typing; Voice mode → wait for mic tap
        setPhase(inputMode === "text" ? "typing" : "waiting");
        setSkippable(false);
      }
    );
  }

  function jumpToQuestion(idx) {
    if (idx === qIdx) return;

    // Mock: block if not yet visited OR permanently skipped
    if (mode === "mock" && (!visitedQuestions.has(idx) || skippedQuestions.has(idx))) return;

    // Practice: all questions freely accessible — answered, skipped, or untouched
    window.speechSynthesis?.cancel();
    recogRef.current?.stop();
    clearInterval(timerRef.current);

    const q = questions[idx];
    setQIdx(idx);
    setPhase(inputMode === "text" ? "typing" : "waiting");
    setCaption(q.question);
    setLiveText(""); setDraftText("");
    accumRef.current = "";
    setCurrentEval(null);
    setSkippable(false);
    setVisitedQuestions(prev => new Set([...prev, idx]));
  }

  function skipSpeech() {
    window.speechSynthesis.cancel();
    setPhase(inputMode === "text" ? "typing" : "waiting");
    setSkippable(false);
  }

  /* Skip the current question entirely — available at any active phase */
  function skipQuestion() {
    window.speechSynthesis?.cancel();
    const r = recogRef.current;
    recogRef.current = null;
    try { r?.stop(); } catch (_) {}
    clearInterval(timerRef.current);
    setShowSkipConfirm(false);

    const skippedIdx = qIdx;
    setSkippedQuestions(prev => new Set([...prev, skippedIdx]));
    setLiveText(""); setDraftText("");
    accumRef.current = "";

    const nextIdx = skippedIdx + 1;
    if (nextIdx >= questions.length) {
      // All questions done (last one skipped) → go to report
      finishInterview(allEvalsRef.current, allAnswersRef.current, questions);
    } else {
      startQuestion(questions, nextIdx, allAnswersRef.current, allEvalsRef.current);
    }
  }

  function submitAnswer() {
    const answer = draftText.trim();
    if (!answer) {
      // Nothing — go back to appropriate input phase
      setPhase(inputMode === "text" ? "typing" : "waiting");
      return;
    }
    if (mode === "mock") {
      setPhase("submitted");
      setTimeout(() => processAnswer(answer), 1200);
    } else {
      processAnswer(answer);
    }
  }

  async function processAnswer(answer) {
    setPhase("processing");
    const q = questions[qIdx];
    const capturedQIdx = qIdx; // capture before async state change
    const newAnswers = [...allAnswersRef.current,
      { questionId:q.id, question:q.question, answer, qIdx:capturedQIdx }];
    allAnswersRef.current = newAnswers;
    setAnswers(newAnswers);
    setAnsweredQuestions(prev => new Set([...prev, capturedQIdx]));

    const evalPrompt = `You are a ${profile.intensity||"Standard"}-level technical interviewer for a ${profile.role} role in ${profile.domain||"Software Engineering"}.
Candidate experience: ${profile.experience} years.

Question: "${q.question}"
Candidate answer: "${answer}"

Rate objectively at the ${profile.intensity} level. Return ONLY valid JSON:
{
  "scores":{"technical":<0-10>,"relevance":<0-10>,"depth":<0-10>,"clarity":<0-10>,"problemSolving":<0-10>},
  "total":<sum 0-50>,
  "correct":["strength 1","strength 2"],
  "missing":["gap 1","gap 2"],
  "suggestions":["tip 1","tip 2"],
  "feedback":"2-3 sentence honest evaluation"
}`;

    const raw = await gemini(evalPrompt);
    const ev = parseJSON(raw) || {
      scores:{technical:6,relevance:7,depth:6,clarity:7,problemSolving:6},
      total:32,
      correct:["Addressed the question","Showed relevant knowledge"],
      missing:["More technical depth needed","Concrete examples would help"],
      suggestions:["Use STAR format","Add measurable outcomes"],
      feedback:"Solid response covering the basics. More specific technical details would strengthen this answer significantly."
    };
    if (!ev.total) ev.total = Object.values(ev.scores||{}).reduce((a,b)=>a+b,0);

    // Store eval indexed by question index
    const newPending = { ...pendingEvals, [capturedQIdx]: ev };
    setPendingEvals(newPending);
    const newEvals = [...allEvalsRef.current, ev];
    allEvalsRef.current = newEvals;
    setEvaluations(newEvals);

    if (mode === "practice") {
      // PRACTICE: show immediate per-question answer report
      setCurrentEval(ev);
      setPhase("feedback");
      speak(`Score: ${ev.total} out of 50. ${ev.feedback}`, ()=>{}, ()=>{});
    } else {
      // MOCK: silently advance to next question — no feedback shown mid-session
      const nextIdx = capturedQIdx + 1;
      if (nextIdx >= questions.length) {
        finishInterview(newEvals, newAnswers, questions);
      } else {
        startQuestion(questions, nextIdx, newAnswers, newEvals);
      }
    }
  }

  function nextQuestion() {
    const next = qIdx + 1;
    if (next >= questions.length) {
      finishInterview(allEvalsRef.current, allAnswersRef.current, questions);
    } else {
      startQuestion(questions, next, allAnswersRef.current, allEvalsRef.current);
    }
  }

  async function finishInterview(evals, ans, qs) {
    setPhase("loading");
    setLoadMsg("Analysing your answers in depth with Gemini AI…");
    const avgScore = evals.length
      ? Math.round(evals.reduce((a,e) => a+(e.total||0), 0) / evals.length) : 30;
    const skippedCount = skippedQuestions.size;

    // Build a rich answer digest so Gemini can reference actual content
    const answerDigest = qs.map((q, i) => {
      const ev   = evals[i];
      const ans_ = ans.find(a => a.qIdx === i);
      if (!ev) return `Q${i+1} [${q.type}] — SKIPPED`;
      return `Q${i+1} [${q.type}] Score:${ev.total}/50
  Question: "${q.question}"
  Answer: "${(ans_?.answer || "").slice(0, 400)}"
  What was good: ${(ev.correct||[]).join("; ")}
  What was missing: ${(ev.missing||[]).join("; ")}
  AI feedback: ${ev.feedback||""}`;
    }).join("\n\n");

    const reportPrompt = `You are a senior technical interviewer and career coach conducting a thorough post-interview analysis.

CANDIDATE: ${profile.name}
ROLE: ${profile.role} | DOMAIN: ${profile.domain}
EXPERIENCE: ${profile.experience} years | INTENSITY: ${profile.intensity}
INTERVIEW MODE: ${mode==="mock" ? "Mock Interview (no mid-session feedback)" : "Practice Mode (instant feedback per question)"}
INPUT METHOD: ${inputMode==="text" ? "Text (typed answers)" : "Voice (spoken answers)"}
TOTAL QUESTIONS: ${qs.length} | ANSWERED: ${evals.length} | SKIPPED: ${skippedCount}
AVERAGE SCORE: ${avgScore}/50

DETAILED ANSWER ANALYSIS:
${answerDigest}

Generate a COMPREHENSIVE, PERSONALISED interview report. Reference the candidate's ACTUAL ANSWERS throughout. Be honest but constructive. Vary your tone based on performance.

Return ONLY valid JSON (no markdown):
{
  "overallScore": <0-100>,
  "technicalScore": <0-100>,
  "communicationScore": <0-100>,
  "analyticalScore": <0-100>,
  "confidenceScore": <0-100>,
  "problemSolvingScore": <0-100>,
  "suitabilityScore": <0-100>,
  "recommendation": "Highly Recommended|Recommended|Needs Improvement|Not Recommended",
  "performanceTier": "Exceptional|Strong|Developing|Needs Foundation",
  "conclusion": "5-6 sentence personalised conclusion that references their ACTUAL answers and performance. Be specific — mention what they said well, what gaps appeared, and give an honest overall verdict on their readiness for the ${profile.role} role.",
  "motivation": "3-4 sentence warm, honest motivational message addressed directly to ${profile.name}. Acknowledge what they showed, name their biggest gap plainly, and end with a genuine, specific action they should take next.",
  "hirabilityVerdict": "2-3 sentence blunt but respectful assessment of their real-world hire-ability for this specific role right now.",
  "strengths": ["specific strength referencing their actual answer 1", "strength 2", "strength 3"],
  "weaknesses": ["specific weakness observed in their answers 1", "weakness 2"],
  "mistakePatterns": [
    {"pattern": "short pattern name", "description": "what they kept doing wrong across questions", "fix": "concrete fix"},
    {"pattern": "...", "description": "...", "fix": "..."}
  ],
  "questionAnalysis": [
    {"qNum": 1, "verdict": "Strong|Acceptable|Weak|Skipped", "highlight": "what they did well in this answer specifically", "mistake": "the key mistake or gap in this answer", "betterApproach": "how they should have answered this"},
    ...one object per question...
  ],
  "learningPath": [
    {"step": 1, "topic": "topic name", "why": "why this matters for their specific gap", "action": "specific resource or exercise to do"},
    {"step": 2, "topic": "...", "why": "...", "action": "..."},
    {"step": 3, "topic": "...", "why": "...", "action": "..."},
    {"step": 4, "topic": "...", "why": "...", "action": "..."}
  ],
  "suggestions": ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
}`;

    const raw    = await gemini(reportPrompt);
    const report = parseJSON(raw) || {
      overallScore: Math.min(90, Math.round(avgScore * 1.85)),
      technicalScore: Math.min(90, Math.round(avgScore * 1.78)),
      communicationScore: Math.min(90, Math.round(avgScore * 1.92)),
      analyticalScore: Math.min(90, Math.round(avgScore * 1.8)),
      confidenceScore: Math.min(90, Math.round(avgScore * 1.9)),
      problemSolvingScore: Math.min(90, Math.round(avgScore * 1.78)),
      suitabilityScore: Math.min(90, Math.round(avgScore * 1.85)),
      recommendation: avgScore>=40 ? "Recommended" : avgScore>=28 ? "Needs Improvement" : "Not Recommended",
      performanceTier: avgScore>=40 ? "Strong" : avgScore>=28 ? "Developing" : "Needs Foundation",
      conclusion: `${profile.name} demonstrated a working familiarity with ${profile.domain} concepts throughout the interview. Some answers showed clear understanding, while others lacked the depth and specificity expected at the ${profile.experience}-year experience level. The candidate should focus on grounding theoretical knowledge with concrete examples from real projects.`,
      motivation: `${profile.name}, you engaged genuinely with every question and that matters more than a perfect score. Your biggest gap right now is depth — your answers identified the right concepts but stopped short of showing how you'd apply them under real constraints. Pick one topic from the learning path below and go deep on it this week.`,
      hirabilityVerdict: `At this point, ${profile.name} would be a borderline hire for a ${profile.role} position. With 4-6 weeks of focused preparation on the flagged areas, the profile would be significantly stronger.`,
      strengths: ["Showed awareness of core domain concepts", "Communicated ideas clearly", "Engaged thoughtfully with each question"],
      weaknesses: ["Answers lacked technical depth and concrete examples", "System design thinking needs development"],
      mistakePatterns: [
        { pattern: "Surface-level answers", description: "Identified concepts correctly but didn't explain the why or trade-offs", fix: "Practice answering with the format: What → Why → Trade-offs → Example" },
        { pattern: "Missing metrics", description: "Descriptions had no numbers, scale, or measurable outcomes", fix: "Always quantify: 'reduced load time by 40%', 'handled 10k req/s'" }
      ],
      questionAnalysis: qs.map((q, i) => ({
        qNum: i+1,
        verdict: evals[i] ? (evals[i].total>=40 ? "Strong" : evals[i].total>=25 ? "Acceptable" : "Weak") : "Skipped",
        highlight: evals[i]?.correct?.[0] || "N/A",
        mistake: evals[i]?.missing?.[0] || "Question was skipped",
        betterApproach: evals[i]?.suggestions?.[0] || "Answer this question with a structured example"
      })),
      learningPath: [
        { step:1, topic:"System Design Fundamentals", why:"Most technical gaps traced back to missing system thinking", action:"Study 'Designing Data-Intensive Applications' chapters 1-3 and build a diagram for one past project" },
        { step:2, topic:"STAR Method for Behavioral Questions", why:"Answers lacked structured storytelling with outcomes", action:"Write out 5 STAR stories from your experience, each under 2 minutes spoken" },
        { step:3, topic:"Technical Depth in Your Domain", why:"Concepts were named but mechanisms weren't explained", action:"Pick 3 core concepts from your skills list and write a blog-post-level explanation of each" },
        { step:4, topic:"Mock Interviews with Peers", why:"Real-time pressure improves answer structure and confidence", action:"Book 3 peer mock interviews on Pramp or Interviewing.io this week" }
      ],
      suggestions: ["Practice answering with concrete examples from past projects", "Time your answers — aim for 90-120 seconds per question", "Record yourself answering out loud and review for clarity"]
    };

    onComplete({ profile, mode, inputMode, questions:qs, answers:ans, evaluations:evals, report });
  }

  /* ── Render ── */
  const q = questions[qIdx];
  const progress = questions.length>0 ? (qIdx/questions.length)*100 : 0;
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const modeColor = mode==="mock" ? "#6366F1" : "#10B981";
  const btnClass = mode==="mock" ? "btn-primary" : "btn-success";

  if (phase==="loading") return (
    <div style={{ minHeight:"100vh", background:"#060B18",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"18px" }}>
      <div style={{ width:52, height:52, borderRadius:"50%",
        border:"2.5px solid rgba(99,102,241,.15)", borderTopColor:"#6366F1",
        animation:"spin-cw 1s linear infinite" }}/>
      <p style={{ color:"#2A3B55", fontSize:".85rem", maxWidth:"300px",
        textAlign:"center", lineHeight:1.65 }}>{loadMsg}</p>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",
      background:"linear-gradient(135deg,#060B18 0%,#0A0F22 50%,#060B18 100%)",
      display:"flex", flexDirection:"column" }}>

      {/* Progress */}
      <div style={{ height:"2px", background:"rgba(255,255,255,.04)" }}>
        <div style={{ height:"100%", width:`${progress}%`,
          background:`linear-gradient(90deg,${modeColor},#06B6D4)`,
          transition:"width .8s cubic-bezier(.16,1,.3,1)", borderRadius:"0 2px 2px 0" }}/>
      </div>

      {/* Header */}
      <div style={{ padding:"13px 22px", display:"flex", justifyContent:"space-between",
        alignItems:"center", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ fontFamily:"Syne", fontWeight:800, color:"#F1F5F9", fontSize:".95rem" }}>IntelliHire</span>
          <Tag color={modeColor}>{mode==="mock"?"Mock Interview":"Practice Mode"}</Tag>
          <Tag color="#818CF8">{profile.domain}</Tag>
          <Tag color={inputMode==="text" ? "#06B6D4" : "#6366F1"}>
            {inputMode==="text" ? "⌨️ Text" : "🎙️ Voice"}
          </Tag>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          {phase==="recording" && (
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#EF4444",
                animation:"rec-blink 1.1s ease-in-out infinite" }}/>
              <span style={{ fontFamily:"JetBrains Mono", fontSize:".78rem", color:"#EF4444" }}>
                {fmt(timer)}
              </span>
            </div>
          )}
          <span style={{ fontFamily:"JetBrains Mono", fontSize:".75rem", color:"#263548" }}>
            {qIdx+1} / {questions.length||"…"}
          </span>
          <button className="btn-ghost" onClick={()=>setShowExitConfirm(true)}
            style={{ padding:"6px 14px", borderRadius:"8px", fontSize:".75rem",
              color:"#EF4444", borderColor:"rgba(239,68,68,.2)", display:"flex", alignItems:"center", gap:"5px" }}>
            ✕ Exit
          </button>
        </div>
      </div>

      {/* Exit Confirm Modal */}
      {showExitConfirm && (
        <div style={{ position:"fixed", inset:0, zIndex:100,
          background:"rgba(0,0,0,.7)", backdropFilter:"blur(6px)",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div className="glass" style={{ borderRadius:"20px", padding:"28px 32px", maxWidth:"380px",
            width:"90%", textAlign:"center", borderColor:"rgba(239,68,68,.22)" }}>
            <div style={{ fontSize:"2rem", marginBottom:"14px" }}>⚠️</div>
            <h3 style={{ fontFamily:"Syne", fontWeight:700, color:"#F1F5F9",
              fontSize:"1.1rem", marginBottom:"10px" }}>Exit Interview?</h3>
            <p style={{ color:"#3D5470", fontSize:".85rem", lineHeight:1.65, marginBottom:"24px" }}>
              Your progress will be lost and you'll return to the home screen.
              {evaluations.length>0 && " Answered questions will still be processed."}
            </p>
            <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
              <button className="btn-ghost" onClick={()=>setShowExitConfirm(false)}
                style={{ padding:"10px 22px", borderRadius:"10px", fontSize:".88rem" }}>
                Keep Going
              </button>
              <button className="btn-danger" onClick={()=>{ setShowExitConfirm(false); onExit(); }}
                style={{ padding:"10px 22px", borderRadius:"10px", fontSize:".88rem" }}>
                Exit Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Question Confirm Modal */}
      {showSkipConfirm && (
        <div style={{ position:"fixed", inset:0, zIndex:100,
          background:"rgba(0,0,0,.65)", backdropFilter:"blur(8px)",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div className="glass su" style={{
            borderRadius:"22px", padding:"30px 34px", maxWidth:"400px",
            width:"90%", textAlign:"center",
            border:"1px solid rgba(148,163,184,.18)"
          }}>
            {/* Icon */}
            <div style={{
              width:56, height:56, borderRadius:"50%", margin:"0 auto 18px",
              background:"rgba(148,163,184,.1)", border:"1px solid rgba(148,163,184,.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"1.6rem"
            }}>⟩</div>

            <h3 style={{ fontFamily:"Syne", fontWeight:700, color:"#F1F5F9",
              fontSize:"1.1rem", marginBottom:"10px" }}>
              Skip This Question?
            </h3>

            <p style={{ color:"#3D5470", fontSize:".85rem", lineHeight:1.65, marginBottom:"8px" }}>
              You'll move to{" "}
              <strong style={{ color:"#94A3B8" }}>
                {qIdx + 1 < questions.length ? `Question ${qIdx + 2}` : "the final report"}
              </strong>{" "}
              without answering this one.
            </p>

            {/* Mode-specific note */}
            <div style={{ padding:"10px 14px", borderRadius:"10px", marginBottom:"24px",
              background: mode==="mock" ? "rgba(239,68,68,.06)" : "rgba(245,158,11,.06)",
              border:`1px solid ${mode==="mock" ? "rgba(239,68,68,.18)" : "rgba(245,158,11,.15)"}` }}>
              <p style={{ fontSize:".78rem", lineHeight:1.6,
                color: mode==="mock" ? "#FCA5A5" : "#F59E0B" }}>
                {mode==="mock"
                  ? "🔒 Mock Interview: Skipped questions are permanently locked. You cannot return to answer them later. This will also impact your final score."
                  : "↩ Practice Mode: You can return to this question at any time using the question navigator on the right."}
              </p>
            </div>

            <div style={{ display:"flex", gap:"11px", justifyContent:"center" }}>
              <button onClick={()=>setShowSkipConfirm(false)} style={{
                flex:1, padding:"11px 0", borderRadius:"11px", cursor:"pointer",
                background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)",
                color:"#94A3B8", fontFamily:"'DM Sans',sans-serif", fontWeight:600,
                fontSize:".88rem", transition:"all .2s ease"
              }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.09)";e.currentTarget.style.color="#E2E8F0";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.05)";e.currentTarget.style.color="#94A3B8";}}
              >
                Cancel
              </button>
              <button onClick={skipQuestion} style={{
                flex:1, padding:"11px 0", borderRadius:"11px", cursor:"pointer",
                background:"linear-gradient(135deg,#475569,#334155)",
                border:"1px solid rgba(148,163,184,.2)",
                color:"#E2E8F0", fontFamily:"'DM Sans',sans-serif", fontWeight:700,
                fontSize:".88rem", display:"flex", alignItems:"center",
                justifyContent:"center", gap:"7px",
                transition:"all .22s ease",
                boxShadow:"0 4px 16px rgba(0,0,0,.3)"
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.4)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.3)";}}
              >
                <span>⟩⟩</span> Skip Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ flex:1, display:"flex", maxWidth:"1100px", margin:"0 auto",
        width:"100%", padding:"24px 18px", gap:"20px" }}>

        {/* Main column */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"20px" }}>

          {/* Orb */}
          <div style={{ marginTop:"8px" }}>
            <Orb phase={phase}/>
          </div>

          {/* Question bubble */}
          {q && (
            <div className="glass su" style={{ borderRadius:"18px", padding:"18px 22px",
              maxWidth:"640px", width:"100%", animationDelay:".05s" }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:"10px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
                  <span style={{ fontSize:".66rem", color:"#263548", fontWeight:600,
                    letterSpacing:".07em" }}>AI INTERVIEWER</span>
                  {phase==="asking" && <Waveform active bars={10} color="#6366F1"/>}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <Tag color="#334D6B">{q.type}</Tag>
                  {skippable && phase==="asking" && (
                    <button className="btn-ghost" onClick={skipSpeech}
                      style={{ padding:"3px 9px", borderRadius:"6px", fontSize:".7rem" }}>
                      Skip ›
                    </button>
                  )}
                </div>
              </div>
              <p style={{ color:"#CDD9EA", lineHeight:1.72, fontSize:".93rem" }}>
                {caption || q.question}
              </p>
            </div>
          )}

          {/* ── SKIP QUESTION STRIP ── */}
          {(["waiting","recording","recorded","asking"].includes(phase) ||
            (phase==="typing" && inputMode==="text")) && (
            <div style={{ maxWidth:"640px", width:"100%",
              display:"flex", justifyContent:"flex-end" }}>
              <button onClick={()=>setShowSkipConfirm(true)} style={{
                display:"inline-flex", alignItems:"center", gap:"6px",
                padding:"6px 14px", borderRadius:"20px", border:"none", cursor:"pointer",
                background:"rgba(255,255,255,.04)",
                border:"1px solid rgba(255,255,255,.08)",
                color:"#3D5470", fontFamily:"'DM Sans',sans-serif",
                fontSize:".75rem", fontWeight:500,
                transition:"all .2s ease"
              }}
                onMouseEnter={e=>{
                  e.currentTarget.style.background="rgba(148,163,184,.1)";
                  e.currentTarget.style.color="#94A3B8";
                  e.currentTarget.style.borderColor="rgba(148,163,184,.22)";
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.background="rgba(255,255,255,.04)";
                  e.currentTarget.style.color="#3D5470";
                  e.currentTarget.style.borderColor="rgba(255,255,255,.08)";
                }}
              >
                <span style={{ fontSize:".8rem" }}>⟩⟩</span>
                Skip Question
              </button>
            </div>
          )}

          {/* Transcript / answer area */}
          <div className="glass" ref={captionRef}
            style={{ borderRadius:"16px", padding:"15px 18px",
              maxWidth:"640px", width:"100%", minHeight:"100px", maxHeight:"170px", overflowY:"auto" }}>
            <div style={{ fontSize:".66rem", color:"#243347", marginBottom:"6px",
              fontWeight:600, letterSpacing:".06em", display:"flex", alignItems:"center", gap:"6px" }}>
              {phase==="recording"   ? <><span style={{color:"#EF4444"}}>●</span> LIVE TRANSCRIPT</>
               :phase==="typing" && inputMode==="text"
                                     ? <><span style={{color:"#06B6D4"}}>✎</span> TYPE YOUR ANSWER</>
               :phase==="typing"     ? <><span style={{color:"#818CF8"}}>✎</span> TYPE YOUR ANSWER</>
               :phase==="recorded"   ? <><span style={{color:"#F59E0B"}}>◈</span> {mode==="mock" ? "REVIEW & SUBMIT — NO FEEDBACK IN MOCK MODE" : "REVIEW YOUR ANSWER BEFORE SUBMITTING"}</>
               :phase==="submitted"  ? <><span style={{color:"#22C55E"}}>✓</span> ANSWER SUBMITTED</>
               :phase==="processing" ? <><span style={{color:"#F59E0B"}}>⬡</span> AI IS EVALUATING YOUR RESPONSE</>
               :phase==="feedback"   ? <><span style={{color:"#10B981"}}>✦</span> ANSWER SUMMARY</>
               :inputMode==="text"   ? <><span style={{color:"#06B6D4"}}>⌨️</span> TEXT INTERVIEW MODE</>
               :"📝 YOUR ANSWER"}
            </div>
            <p style={{
              color: phase==="recording"  ? "#D4E0EF"
                   : phase==="recorded"   ? "#E2E8F0"
                   : phase==="submitted"  ? "#4ADE80"
                   : "#3D5470",
              fontSize:".87rem", lineHeight:1.7, whiteSpace:"pre-wrap",
              display: phase==="typing" ? "none" : "block"
            }}>
              {phase==="recording"   ? liveText || "Listening… speak clearly into your mic"
               :phase==="recorded"   ? (draftText || (inputMode==="text" ? "Nothing typed yet — please type your answer." : "No speech detected — please re-record or type your answer."))
               :phase==="submitted"  ? draftText
               :phase==="processing" ? "Gemini AI is evaluating your response…"
               :phase==="waiting"    ? "Press the microphone button below to start answering…"
               :phase==="asking"     ? (inputMode==="text" ? "Read the question above, then type your answer when ready…" : "Listen to the question carefully…")
               :phase==="feedback"   ? draftText
               : ""}
            </p>
            {/* Inline textarea — shown in typing phase for both text mode and voice fallback */}
            {phase==="typing" && (
              <textarea
                autoFocus
                placeholder={inputMode==="text"
                  ? "Type your full answer here… Take your time."
                  : "Type your answer here…"}
                value={draftText}
                onChange={e => setDraftText(e.target.value)}
                onKeyDown={e => {
                  // Ctrl/Cmd+Enter submits in text mode
                  if (inputMode==="text" && (e.ctrlKey||e.metaKey) && e.key==="Enter") {
                    e.preventDefault();
                    if (draftText.trim()) submitAnswer();
                  }
                }}
                style={{ width:"100%", minHeight: inputMode==="text" ? "110px" : "80px",
                  resize:"none", background:"transparent",
                  border:"none", outline:"none", color:"#E2E8F0", fontSize:".87rem",
                  lineHeight:1.7, fontFamily:"'DM Sans',sans-serif", padding:0 }}
              />
            )}
            {/* Ctrl+Enter hint for text mode */}
            {phase==="typing" && inputMode==="text" && (
              <div style={{ fontSize:".68rem", color:"#1E3048", marginTop:"6px",
                display:"flex", alignItems:"center", gap:"5px" }}>
                <kbd style={{ padding:"1px 6px", borderRadius:"4px",
                  background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)",
                  fontFamily:"JetBrains Mono", fontSize:".65rem", color:"#2E4460" }}>
                  Ctrl+Enter
                </kbd>
                <span style={{ color:"#1E3048" }}>to submit quickly</span>
              </div>
            )}
          </div>

          {/* ── CONTROLS — input-mode-aware ── */}

          {/* TEXT MODE: typing panel (primary, always shown when phase=typing) */}
          {phase==="typing" && inputMode==="text" && (
            <div className="submit-btn-enter" style={{
              maxWidth:"640px", width:"100%",
              display:"flex", flexDirection:"column", gap:"12px", paddingBottom:"24px"
            }}>
              {/* Info banner */}
              <div style={{
                padding:"12px 16px", borderRadius:"12px",
                background:"rgba(6,182,212,.06)", border:"1px solid rgba(6,182,212,.18)",
                display:"flex", alignItems:"center", gap:"10px"
              }}>
                <span style={{ fontSize:"1rem", flexShrink:0 }}>⌨️</span>
                <p style={{ fontSize:".8rem", color:"#06B6D4", lineHeight:1.5 }}>
                  <strong>Text Mode</strong> — Type your answer below. Take your time; submit when ready.
                </p>
              </div>

              {/* Char count + submit */}
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", paddingRight:"2px" }}>
                <span style={{ fontSize:".7rem", color:"#1E3048", fontFamily:"JetBrains Mono" }}>
                  {draftText.length} chars
                </span>
                {draftText.trim().length > 10 && (
                  <span style={{ fontSize:".7rem", color:"#10B981" }}>✓ Ready to submit</span>
                )}
              </div>

              {/* Submit button for text mode */}
              <button onClick={() => {
                if (!draftText.trim()) return;
                submitAnswer();
              }} disabled={!draftText.trim()} style={{
                width:"100%", padding:"14px", borderRadius:"12px", border:"none",
                cursor: draftText.trim() ? "pointer" : "not-allowed",
                fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:".95rem",
                background: mode==="mock"
                  ? "linear-gradient(135deg,#6366F1,#4338CA)"
                  : "linear-gradient(135deg,#10B981,#047857)",
                color:"#fff",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"9px",
                opacity: draftText.trim() ? 1 : 0.38,
                boxShadow: draftText.trim()
                  ? (mode==="mock" ? "0 4px 20px rgba(99,102,241,.3)" : "0 4px 20px rgba(16,185,129,.3)")
                  : "none",
                transition:"all .22s ease"
              }}
                onMouseEnter={e=>{if(draftText.trim()){e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=mode==="mock"?"0 8px 28px rgba(99,102,241,.45)":"0 8px 28px rgba(16,185,129,.45)";}}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=mode==="mock"?"0 4px 20px rgba(99,102,241,.3)":"0 4px 20px rgba(16,185,129,.3)";}}
              >
                <span>✓</span>
                {mode==="mock" ? "Submit & Next Question" : "Submit & Get Summary"}
              </button>
            </div>
          )}

          {/* TEXT MODE: typing fallback when voice mode but STT unavailable */}
          {phase==="typing" && inputMode==="voice" && (
            <div className="submit-btn-enter" style={{
              maxWidth:"640px", width:"100%", display:"flex",
              flexDirection:"column", gap:"10px", paddingBottom:"24px"
            }}>
              <div style={{ display:"flex", gap:"10px" }}>
                <button onClick={() => setPhase("waiting")} style={{
                  flex:"0 0 auto", padding:"13px 18px", borderRadius:"12px",
                  border:"1px solid rgba(255,255,255,.12)", background:"rgba(255,255,255,.04)",
                  color:"#94A3B8", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                  fontWeight:600, fontSize:".85rem", display:"flex", alignItems:"center", gap:"7px",
                  transition:"all .2s ease"
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.08)";e.currentTarget.style.color="#E2E8F0";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.color="#94A3B8";}}
                >
                  🎙️ Try mic again
                </button>
                <button onClick={() => { if (!draftText.trim()) return; setPhase("recorded"); }} style={{
                  flex:1, padding:"13px", borderRadius:"12px", border:"none", cursor:"pointer",
                  background: mode==="mock"
                    ? "linear-gradient(135deg,#6366F1,#4338CA)"
                    : "linear-gradient(135deg,#10B981,#047857)",
                  color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:700,
                  fontSize:".92rem", display:"flex", alignItems:"center",
                  justifyContent:"center", gap:"8px",
                  opacity: draftText.trim() ? 1 : 0.4,
                  transition:"all .2s ease"
                }}>
                  ✓ Done — Review Answer
                </button>
              </div>
            </div>
          )}

          {/* VOICE MODE: waiting — mic button */}
          {phase==="waiting" && inputMode==="voice" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
              gap:"14px", paddingBottom:"28px" }}>
              <button onClick={startRecording} style={{
                width:76, height:76, borderRadius:"50%", border:"none", cursor:"pointer",
                background:"linear-gradient(135deg,#6366F1,#4338CA)", fontSize:"1.5rem",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 0 0 12px rgba(99,102,241,.08), 0 0 36px rgba(99,102,241,.3)",
                transition:"all .22s ease"
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.07)";e.currentTarget.style.boxShadow="0 0 0 16px rgba(99,102,241,.12), 0 0 52px rgba(99,102,241,.45)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 0 0 12px rgba(99,102,241,.08), 0 0 36px rgba(99,102,241,.3)";}}
              >🎙️</button>
              <span style={{ fontSize:".74rem", color:"#2A3B55", letterSpacing:".04em" }}>
                TAP TO START RECORDING
              </span>
              <button onClick={() => { setDraftText(""); setPhase("typing"); }} style={{
                background:"none", border:"none", cursor:"pointer",
                color:"#263548", fontSize:".74rem", fontFamily:"'DM Sans',sans-serif",
                textDecoration:"underline", textUnderlineOffset:"3px", padding:0
              }}>
                Mic not working? Type instead ✎
              </button>
            </div>
          )}

          {/* VOICE MODE: recording — waveform + stop */}
          {phase==="recording" && inputMode==="voice" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
              gap:"18px", paddingBottom:"24px", width:"100%", maxWidth:"640px" }}>
              <RecordingWaveform />
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#EF4444",
                  animation:"rec-blink 1.1s ease-in-out infinite" }}/>
                <span style={{ fontFamily:"JetBrains Mono", fontSize:".75rem",
                  color:"#EF4444", letterSpacing:".04em" }}>
                  RECORDING — {String(Math.floor(timer/60)).padStart(2,"0")}:{String(timer%60).padStart(2,"0")}
                </span>
              </div>
              <button onClick={stopRecording} style={{
                width:76, height:76, borderRadius:"50%", border:"none", cursor:"pointer",
                background:"linear-gradient(135deg,#EF4444,#B91C1C)", fontSize:"1.5rem",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 0 0 10px rgba(239,68,68,.1), 0 0 32px rgba(239,68,68,.4)",
                animation:"glow-rec 1.5s ease-in-out infinite",
                transition:"transform .15s ease"
              }}
                onMouseEnter={e=>e.currentTarget.style.transform="scale(1.06)"}
                onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
              >⏹</button>
              <span style={{ fontSize:".73rem", color:"#7E1A1A", letterSpacing:".06em",
                fontWeight:500 }}>TAP TO STOP</span>
            </div>
          )}

          {/* VOICE MODE: recorded — review + re-record + submit */}
          {phase==="recorded" && inputMode==="voice" && (
            <div className="submit-btn-enter" style={{
              maxWidth:"640px", width:"100%", display:"flex",
              flexDirection:"column", gap:"10px", paddingBottom:"24px"
            }}>
              <div style={{
                padding:"13px 16px", borderRadius:"13px",
                background: mode==="mock" ? "rgba(99,102,241,.06)" : "rgba(245,158,11,.06)",
                border:`1px solid ${mode==="mock" ? "rgba(99,102,241,.2)" : "rgba(245,158,11,.2)"}`,
                display:"flex", alignItems:"flex-start", gap:"11px"
              }}>
                <span style={{ fontSize:"1.1rem", flexShrink:0, marginTop:"1px" }}>
                  {mode==="mock" ? "🎯" : "👁"}
                </span>
                <div>
                  <p style={{ fontSize:".82rem", fontWeight:600,
                    color: mode==="mock" ? "#818CF8" : "#F59E0B", marginBottom:"3px" }}>
                    {mode==="mock" ? "Mock Interview — Submit to proceed" : "Practice Mode — Get instant feedback"}
                  </p>
                  <p style={{ fontSize:".78rem", lineHeight:1.55,
                    color: mode==="mock" ? "#3D5470" : "#78543A" }}>
                    {mode==="mock"
                      ? "No feedback given during mock. Submit to move to the next question."
                      : "Submit to see a full breakdown — score, gaps, and suggestions."}
                  </p>
                </div>
              </div>
              <div style={{ display:"flex", gap:"10px" }}>
                <button onClick={reRecord} style={{
                  flex:"0 0 auto", padding:"13px 20px", borderRadius:"12px",
                  border:"1px solid rgba(255,255,255,.12)", background:"rgba(255,255,255,.04)",
                  color:"#94A3B8", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                  fontWeight:600, fontSize:".88rem",
                  display:"flex", alignItems:"center", gap:"8px", transition:"all .2s ease"
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.08)";e.currentTarget.style.color="#E2E8F0";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.color="#94A3B8";}}
                >
                  <span>🔄</span> Re-record
                </button>
                <button onClick={submitAnswer} style={{
                  flex:1, padding:"13px", borderRadius:"12px", border:"none", cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:".95rem",
                  background: mode==="mock"
                    ? "linear-gradient(135deg,#6366F1,#4338CA)"
                    : "linear-gradient(135deg,#10B981,#047857)",
                  color:"#fff",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"9px",
                  boxShadow: mode==="mock" ? "0 4px 20px rgba(99,102,241,.3)" : "0 4px 20px rgba(16,185,129,.3)",
                  transition:"all .22s ease"
                }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=mode==="mock"?"0 8px 28px rgba(99,102,241,.45)":"0 8px 28px rgba(16,185,129,.45)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=mode==="mock"?"0 4px 20px rgba(99,102,241,.3)":"0 4px 20px rgba(16,185,129,.3)";}}
                >
                  <span>✓</span>
                  {mode==="mock" ? "Submit & Next Question" : "Submit & Get Summary"}
                </button>
              </div>
            </div>
          )}

          {/* TEXT MODE: recorded — review typed answer + re-type + submit */}
          {phase==="recorded" && inputMode==="text" && (
            <div className="submit-btn-enter" style={{
              maxWidth:"640px", width:"100%", display:"flex",
              flexDirection:"column", gap:"10px", paddingBottom:"24px"
            }}>
              <div style={{
                padding:"13px 16px", borderRadius:"13px",
                background: mode==="mock" ? "rgba(99,102,241,.06)" : "rgba(245,158,11,.06)",
                border:`1px solid ${mode==="mock" ? "rgba(99,102,241,.2)" : "rgba(245,158,11,.2)"}`,
                display:"flex", alignItems:"flex-start", gap:"11px"
              }}>
                <span style={{ fontSize:"1.1rem", flexShrink:0, marginTop:"1px" }}>
                  {mode==="mock" ? "🎯" : "👁"}
                </span>
                <div>
                  <p style={{ fontSize:".82rem", fontWeight:600,
                    color: mode==="mock" ? "#818CF8" : "#F59E0B", marginBottom:"3px" }}>
                    {mode==="mock" ? "Mock Interview — Submit to proceed" : "Practice Mode — Get instant feedback"}
                  </p>
                  <p style={{ fontSize:".78rem", lineHeight:1.55,
                    color: mode==="mock" ? "#3D5470" : "#78543A" }}>
                    Review your typed answer above.{" "}
                    {mode==="mock"
                      ? "Submit to move to the next question."
                      : "Submit for a full AI breakdown of your answer."}
                  </p>
                </div>
              </div>
              <div style={{ display:"flex", gap:"10px" }}>
                {/* Re-type — go back to typing */}
                <button onClick={() => setPhase("typing")} style={{
                  flex:"0 0 auto", padding:"13px 20px", borderRadius:"12px",
                  border:"1px solid rgba(255,255,255,.12)", background:"rgba(255,255,255,.04)",
                  color:"#94A3B8", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                  fontWeight:600, fontSize:".88rem",
                  display:"flex", alignItems:"center", gap:"8px", transition:"all .2s ease"
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.08)";e.currentTarget.style.color="#E2E8F0";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.color="#94A3B8";}}
                >
                  <span>✎</span> Re-type
                </button>
                <button onClick={submitAnswer} style={{
                  flex:1, padding:"13px", borderRadius:"12px", border:"none", cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:".95rem",
                  background: mode==="mock"
                    ? "linear-gradient(135deg,#6366F1,#4338CA)"
                    : "linear-gradient(135deg,#10B981,#047857)",
                  color:"#fff",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"9px",
                  boxShadow: mode==="mock" ? "0 4px 20px rgba(99,102,241,.3)" : "0 4px 20px rgba(16,185,129,.3)",
                  transition:"all .22s ease"
                }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=mode==="mock"?"0 8px 28px rgba(99,102,241,.45)":"0 8px 28px rgba(16,185,129,.45)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=mode==="mock"?"0 4px 20px rgba(99,102,241,.3)":"0 4px 20px rgba(16,185,129,.3)";}}
                >
                  <span>✓</span>
                  {mode==="mock" ? "Submit & Next Question" : "Submit & Get Summary"}
                </button>
              </div>
            </div>
          )}

          {/* Mock: brief submitted flash before advancing */}
          {phase==="submitted" && (
            <div className="su" style={{
              maxWidth:"640px", width:"100%", paddingBottom:"24px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:"16px"
            }}>
              <div style={{
                width:"100%", padding:"20px 24px", borderRadius:"16px",
                background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.2)",
                display:"flex", alignItems:"center", gap:"16px"
              }}>
                <div style={{
                  width:44, height:44, borderRadius:"50%", flexShrink:0,
                  background:"rgba(34,197,94,.15)", border:"1px solid rgba(34,197,94,.3)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"1.3rem"
                }}>✓</div>
                <div>
                  <p style={{ color:"#4ADE80", fontWeight:600, fontSize:".9rem", marginBottom:"3px" }}>
                    Answer Submitted
                  </p>
                  <p style={{ color:"#2E5240", fontSize:".8rem", lineHeight:1.5 }}>
                    Moving to the next question…
                  </p>
                </div>
                <div style={{ marginLeft:"auto", flexShrink:0 }}>
                  <div style={{ width:22, height:22, borderRadius:"50%",
                    border:"2px solid rgba(34,197,94,.3)", borderTopColor:"#22C55E",
                    animation:"spin-cw .8s linear infinite" }}/>
                </div>
              </div>
            </div>
          )}

          {/* Processing spinner */}
          {phase==="processing" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
              gap:"12px", paddingBottom:"28px" }}>
              <div style={{ width:38, height:38, borderRadius:"50%",
                border:"2.5px solid rgba(99,102,241,.12)", borderTopColor:"#6366F1",
                animation:"spin-cw 1s linear infinite" }}/>
              <span style={{ fontSize:".78rem", color:"#243347", letterSpacing:".04em" }}>
                GEMINI AI EVALUATING…
              </span>
            </div>
          )}

          {/* Practice: Answer Summary Report */}
          {phase==="feedback" && currentEval && (
            <div className="glass glass-green su" style={{
              borderRadius:"20px", padding:"24px", maxWidth:"640px", width:"100%",
              animationDelay:".05s"
            }}>
              {/* ── HEADER ── */}
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"flex-start", marginBottom:"6px" }}>
                <div>
                  <div style={{ fontFamily:"Syne", fontWeight:700, color:"#10B981",
                    fontSize:"1rem", marginBottom:"3px" }}>
                    📋 Answer Summary
                  </div>
                  <div style={{ fontSize:".7rem", color:"#1B5E40", letterSpacing:".04em" }}>
                    Q{qIdx+1} of {questions.length} · <span style={{textTransform:"capitalize"}}>{questions[qIdx]?.type}</span>
                  </div>
                </div>
                {/* Score badge */}
                <div style={{ textAlign:"right" }}>
                  <div style={{
                    fontFamily:"JetBrains Mono", fontWeight:600, lineHeight:1,
                    fontSize:"2rem",
                    color: currentEval.total>=40 ? "#4ADE80"
                         : currentEval.total>=25 ? "#818CF8" : "#F87171"
                  }}>
                    {currentEval.total}
                    <span style={{ fontSize:".9rem", color:"#1B5E40", fontWeight:400 }}>/50</span>
                  </div>
                  <div style={{ fontSize:".68rem", color:"#1B5E40", marginTop:"2px" }}>
                    {currentEval.total>=40 ? "Excellent" : currentEval.total>=30 ? "Good" : currentEval.total>=20 ? "Fair" : "Needs Work"}
                  </div>
                </div>
              </div>

              {/* ── SCORE PROGRESS BAR ── */}
              <div style={{ height:"5px", background:"rgba(255,255,255,.06)",
                borderRadius:"3px", margin:"14px 0 18px", overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:"3px",
                  width:`${(currentEval.total/50)*100}%`,
                  background: currentEval.total>=40 ? "linear-gradient(90deg,#10B981,#4ADE80)"
                             : currentEval.total>=25 ? "linear-gradient(90deg,#6366F1,#818CF8)"
                             : "linear-gradient(90deg,#F59E0B,#FBBF24)",
                  transition:"width 1.2s cubic-bezier(.16,1,.3,1)",
                  boxShadow: `0 0 10px ${currentEval.total>=40 ? "rgba(16,185,129,.5)" : currentEval.total>=25 ? "rgba(99,102,241,.5)" : "rgba(245,158,11,.5)"}`
                }}/>
              </div>

              {/* ── 5-DIMENSION SCORE GRID ── */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                gap:"7px", marginBottom:"18px" }}>
                {Object.entries(currentEval.scores||{}).map(([k,v])=>(
                  <div key={k} style={{
                    padding:"9px 12px", borderRadius:"10px",
                    background:"rgba(255,255,255,.03)",
                    border:"1px solid rgba(255,255,255,.05)",
                    display:"flex", justifyContent:"space-between", alignItems:"center"
                  }}>
                    <span style={{ fontSize:".74rem", color:"#3D5470", textTransform:"capitalize" }}>
                      {k.replace(/([A-Z])/g," $1").trim()}
                    </span>
                    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      {/* Mini bar */}
                      <div style={{ width:36, height:3, borderRadius:"2px",
                        background:"rgba(255,255,255,.06)" }}>
                        <div style={{ height:"100%", borderRadius:"2px",
                          width:`${v*10}%`,
                          background: v>=8?"#4ADE80":v>=6?"#818CF8":"#FBBF24",
                          transition:"width .8s ease"
                        }}/>
                      </div>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:".76rem",
                        color:v>=8?"#4ADE80":v>=6?"#818CF8":"#FBBF24",
                        minWidth:"28px", textAlign:"right"
                      }}>{v}/10</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── FEEDBACK SECTIONS ── */}
              {[
                { label:"✓ WHAT YOU DID WELL",  items:currentEval.correct,     color:"#10B981", bg:"rgba(16,185,129,.05)",  border:"rgba(16,185,129,.15)" },
                { label:"⚠ WHAT WAS MISSING",   items:currentEval.missing,     color:"#F59E0B", bg:"rgba(245,158,11,.05)",  border:"rgba(245,158,11,.15)" },
                { label:"💡 HOW TO IMPROVE",     items:currentEval.suggestions, color:"#818CF8", bg:"rgba(99,102,241,.05)",  border:"rgba(99,102,241,.15)" },
              ].map(({ label, items, color, bg, border }) => items?.length > 0 && (
                <div key={label} style={{ marginBottom:"10px", padding:"11px 14px",
                  borderRadius:"12px", background:bg, border:`1px solid ${border}` }}>
                  <p style={{ fontSize:".67rem", color, marginBottom:"8px",
                    fontWeight:700, letterSpacing:".07em" }}>{label}</p>
                  {items.map((it, i) => (
                    <div key={i} style={{ display:"flex", gap:"8px", alignItems:"flex-start",
                      marginBottom: i < items.length-1 ? "5px" : 0 }}>
                      <div style={{ width:4, height:4, borderRadius:"50%", background:color,
                        flexShrink:0, marginTop:"7px" }}/>
                      <p style={{ fontSize:".83rem", color:"#7E9AB5", lineHeight:1.55 }}>{it}</p>
                    </div>
                  ))}
                </div>
              ))}

              {/* ── AI OVERALL FEEDBACK ── */}
              <div style={{ padding:"13px 15px", borderRadius:"12px", marginBottom:"18px",
                background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.06)" }}>
                <p style={{ fontSize:".67rem", color:"#263548", marginBottom:"7px",
                  fontWeight:700, letterSpacing:".07em" }}>🤖 AI VERDICT</p>
                <p style={{ fontSize:".84rem", color:"#4E6A8A", lineHeight:1.68, fontStyle:"italic" }}>
                  "{currentEval.feedback}"
                </p>
              </div>

              {/* ── CTA ── */}
              <button className="btn-success" onClick={nextQuestion}
                style={{ width:"100%", padding:"14px", borderRadius:"13px", fontSize:".95rem",
                  fontWeight:700, display:"flex", alignItems:"center",
                  justifyContent:"center", gap:"10px",
                  boxShadow:"0 6px 24px rgba(16,185,129,.3)"
                }}>
                {qIdx+1 >= questions.length
                  ? <><span>📊</span> View Final Report</>
                  : <><span>→</span> Next Question</>}
              </button>
            </div>
          )}
        </div>

        {/* ── SIDE PANEL ── */}
        <div style={{ width:"218px", display:"flex", flexDirection:"column", gap:"14px", flexShrink:0 }}>

          {/* Question navigator */}
          <div className="glass" style={{ borderRadius:"16px", padding:"16px" }}>
            {/* Header row */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              marginBottom:"12px" }}>
              <div style={{ fontSize:".66rem", color:"#1E3048",
                fontWeight:600, letterSpacing:".07em" }}>QUESTIONS</div>
              {mode==="practice" && skippedQuestions.size > 0 && (
                <span style={{ fontSize:".62rem", color:"#F59E0B",
                  background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.18)",
                  padding:"2px 7px", borderRadius:"8px", fontWeight:500 }}>
                  {skippedQuestions.size} skippable
                </span>
              )}
            </div>

            {questions.map((_,i) => {
              const isAnswered = answeredQuestions.has(i);
              const isSkipped  = skippedQuestions.has(i);
              const isCurrent  = i === qIdx;
              const isVisited  = visitedQuestions.has(i);

              // Mock: locked if not yet reached OR permanently skipped
              // Practice: only locked if not yet reached (skipped = always open)
              const isLocked = mode === "mock"
                ? (!isVisited && !isCurrent) || isSkipped
                : !isVisited && !isCurrent && !isAnswered && !isSkipped;

              // Practice skipped items are "retryable" — clickable amber style
              const isPracticeRetry = mode === "practice" && isSkipped && !isAnswered;

              const dotBg = isAnswered    ? "rgba(16,185,129,.15)"
                          : isPracticeRetry ? "rgba(245,158,11,.14)"
                          : isSkipped     ? "rgba(100,116,139,.1)"
                          : isCurrent     ? "rgba(99,102,241,.18)"
                          : "rgba(255,255,255,.04)";

              const dotBorder = isAnswered    ? "rgba(16,185,129,.28)"
                              : isPracticeRetry ? "rgba(245,158,11,.35)"
                              : isSkipped     ? "rgba(100,116,139,.2)"
                              : isCurrent     ? "rgba(99,102,241,.3)"
                              : "rgba(255,255,255,.06)";

              const dotColor  = isAnswered    ? "#10B981"
                              : isPracticeRetry ? "#F59E0B"
                              : isSkipped     ? "#475569"
                              : isCurrent     ? "#6366F1"
                              : "#263548";

              const labelColor = isCurrent      ? "#A5B4FC"
                               : isAnswered     ? "#34D399"
                               : isPracticeRetry ? "#F59E0B"
                               : isSkipped      ? "#475569"
                               : "#263548";

              return (
                <div key={i}
                  onClick={() => !isLocked && jumpToQuestion(i)}
                  title={
                    isPracticeRetry ? "Click to retry this question"
                    : isLocked && mode==="mock" && isSkipped ? "Permanently skipped — cannot return in Mock mode"
                    : isLocked ? "Not yet unlocked"
                    : ""
                  }
                  style={{
                    display:"flex", alignItems:"center", gap:"9px", marginBottom:"8px",
                    padding:"4px 6px", borderRadius:"9px",
                    cursor: isLocked ? "not-allowed" : "pointer",
                    opacity: isLocked && !isSkipped ? .28
                           : isLocked && isSkipped  ? .38 : 1,
                    transition:"all .2s ease",
                    background: isPracticeRetry && !isCurrent
                      ? "rgba(245,158,11,.04)" : "transparent",
                    border: isPracticeRetry && !isCurrent
                      ? "1px solid rgba(245,158,11,.1)" : "1px solid transparent"
                  }}
                  onMouseEnter={e => {
                    if (!isLocked)
                      e.currentTarget.style.background = isPracticeRetry
                        ? "rgba(245,158,11,.09)"
                        : "rgba(255,255,255,.04)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isPracticeRetry && !isCurrent
                      ? "rgba(245,158,11,.04)" : "transparent";
                  }}
                >
                  {/* Number / status bubble */}
                  <div style={{
                    width:24, height:24, borderRadius:"50%", flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize: isPracticeRetry ? ".75rem" : isSkipped ? ".8rem" : ".65rem",
                    fontFamily:"JetBrains Mono",
                    background: dotBg, color: dotColor,
                    border:`1px solid ${dotBorder}`,
                    transition:"all .25s ease"
                  }}>
                    {isAnswered     ? "✓"
                   : isPracticeRetry ? "↩"
                   : isSkipped      ? "✕"
                   : i+1}
                  </div>

                  {/* Label + sub-label */}
                  <div style={{ overflow:"hidden", flex:1 }}>
                    <div style={{
                      fontSize:".72rem", color:labelColor,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                      maxWidth:"130px", transition:"color .2s",
                      textDecoration: isSkipped && !isPracticeRetry ? "line-through" : "none",
                      fontWeight: isPracticeRetry ? 600 : 400
                    }}>
                      {questions[i]?.type || `Q${i+1}`}
                    </div>
                    {/* Sub-label — mode-aware */}
                    {isPracticeRetry && (
                      <div style={{ fontSize:".6rem", color:"#B45309", fontWeight:500 }}>
                        tap to retry ↩
                      </div>
                    )}
                    {isSkipped && mode==="mock" && (
                      <div style={{ fontSize:".6rem", color:"#374151",
                        display:"flex", alignItems:"center", gap:"3px" }}>
                        <span>🔒</span> locked forever
                      </div>
                    )}
                    {isLocked && !isSkipped && !isCurrent && (
                      <div style={{ fontSize:".6rem", color:"#1A2D40" }}>
                        {mode==="mock" ? "🔒 not yet unlocked" : "not yet reached"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Mode legend */}
            <div style={{ borderTop:"1px solid rgba(255,255,255,.04)", paddingTop:"10px",
              marginTop:"6px" }}>
              {mode === "mock" ? (
                <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                  {[
                    ["✓","#10B981","Answered"],
                    ["✕","#475569","Skipped — permanent"],
                    ["n","#6366F1","Current"],
                  ].map(([icon,col,label]) => (
                    <div key={label} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:".65rem",
                        color:col, width:"12px", textAlign:"center" }}>{icon}</span>
                      <span style={{ fontSize:".63rem", color:"#1A2D40" }}>{label}</span>
                    </div>
                  ))}
                  <div style={{ fontSize:".61rem", color:"#1A2D40", marginTop:"3px",
                    lineHeight:1.45, paddingTop:"4px",
                    borderTop:"1px solid rgba(255,255,255,.03)" }}>
                    Skipped questions cannot be retried in Mock mode
                  </div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                  {[
                    ["✓","#10B981","Answered"],
                    ["↩","#F59E0B","Skipped — tap to retry"],
                    ["n","#6366F1","Current"],
                  ].map(([icon,col,label]) => (
                    <div key={label} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:".65rem",
                        color:col, width:"12px", textAlign:"center" }}>{icon}</span>
                      <span style={{ fontSize:".63rem", color:"#1A2D40" }}>{label}</span>
                    </div>
                  ))}
                  <div style={{ fontSize:".61rem", color:"#F59E0B", marginTop:"3px",
                    lineHeight:1.45, paddingTop:"4px",
                    borderTop:"1px solid rgba(255,255,255,.03)" }}>
                    All skipped questions can be retried anytime ↩
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Candidate info */}
          <div className="glass" style={{ borderRadius:"16px", padding:"16px" }}>
            <div style={{ fontSize:".66rem", color:"#1E3048", marginBottom:"10px",
              fontWeight:600, letterSpacing:".07em" }}>CANDIDATE</div>
            <p style={{ color:"#D4E0EF", fontWeight:600, fontSize:".85rem", marginBottom:"3px" }}>
              {profile.name}
            </p>
            <p style={{ color:"#3D5470", fontSize:".76rem", marginBottom:"2px" }}>{profile.role}</p>
            <p style={{ color:"#263548", fontSize:".72rem", marginBottom:"6px" }}>
              {profile.experience} yrs · {profile.domain}
            </p>
            <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
              <Tag color="#6366F1">{profile.intensity}</Tag>
              <Tag color="#818CF8">{profile.numQuestions}Q</Tag>
              {skippedQuestions.size > 0 && (
                <Tag color="#64748B">{skippedQuestions.size} skipped</Tag>
              )}
            </div>
          </div>

          {/* Live scores (practice mode) */}
          {mode==="practice" && Object.keys(pendingEvals).length>0 && (
            <div className="glass" style={{ borderRadius:"16px", padding:"16px" }}>
              <div style={{ fontSize:".66rem", color:"#1E3048", marginBottom:"12px",
                fontWeight:600, letterSpacing:".07em" }}>SCORES SO FAR</div>
              {Object.entries(pendingEvals).map(([idx,ev])=>{
                const pct = Math.round((ev.total/50)*100);
                const col = ev.total>=40?"#10B981":ev.total>=25?"#6366F1":"#F59E0B";
                return (
                  <div key={idx} style={{ marginBottom:"9px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
                      <span style={{ fontSize:".7rem", color:"#3D5470" }}>Q{parseInt(idx)+1}</span>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:".7rem", color:col }}>
                        {ev.total}/50
                      </span>
                    </div>
                    <div style={{ height:"3px", background:"rgba(255,255,255,.06)", borderRadius:"2px" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:col,
                        borderRadius:"2px", transition:"width .6s ease" }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   REPORT SCREEN
───────────────────────────────────────────────────────────── */
function ReportScreen({ data, onRestart }) {
  const { profile, mode, questions, evaluations, report } = data;
  const [expandedQ, setExpandedQ] = useState(null);

  const sScore    = report.suitabilityScore || report.overallScore || 70;
  const recColor  = { "Highly Recommended":"#10B981","Recommended":"#6366F1",
    "Needs Improvement":"#F59E0B","Not Recommended":"#EF4444" }[report.recommendation] || "#6366F1";

  const tierConfig = {
    "Exceptional":      { color:"#10B981", bg:"rgba(16,185,129,.1)",  border:"rgba(16,185,129,.25)", emoji:"🏆" },
    "Strong":           { color:"#6366F1", bg:"rgba(99,102,241,.1)",  border:"rgba(99,102,241,.25)", emoji:"⭐" },
    "Developing":       { color:"#F59E0B", bg:"rgba(245,158,11,.1)",  border:"rgba(245,158,11,.25)", emoji:"📈" },
    "Needs Foundation": { color:"#EF4444", bg:"rgba(239,68,68,.08)",  border:"rgba(239,68,68,.2)",   emoji:"🔧" },
  }[report.performanceTier] || { color:"#6366F1", bg:"rgba(99,102,241,.1)", border:"rgba(99,102,241,.25)", emoji:"📊" };

  const verdictConfig = {
    "Strong":    { color:"#10B981", bg:"rgba(16,185,129,.08)", icon:"✓" },
    "Acceptable":{ color:"#6366F1", bg:"rgba(99,102,241,.08)", icon:"◎" },
    "Weak":      { color:"#F59E0B", bg:"rgba(245,158,11,.08)", icon:"△" },
    "Skipped":   { color:"#475569", bg:"rgba(71,85,105,.08)",  icon:"—" },
  };

  const radarData = [
    { skill:"Technical",      value: report.technicalScore||70 },
    { skill:"Communication",  value: report.communicationScore||70 },
    { skill:"Analytical",     value: report.analyticalScore||68 },
    { skill:"Problem Solving",value: report.problemSolvingScore||70 },
    { skill:"Confidence",     value: report.confidenceScore||74 },
  ];
  const barData = questions.map((q,i) => ({
    name:`Q${i+1}`, score: evaluations[i]?.total||0, type: q.type
  }));

  function ScoreCard({ label, value, icon }) {
    const col = value>=80?"#10B981":value>=60?"#6366F1":value>=40?"#F59E0B":"#EF4444";
    return (
      <div className="glass" style={{ borderRadius:"14px", padding:"16px 14px", textAlign:"center" }}>
        <div style={{ fontSize:"1.2rem", marginBottom:"7px" }}>{icon}</div>
        <div style={{ fontFamily:"JetBrains Mono", fontWeight:600, fontSize:"1.5rem",
          color:col, marginBottom:"3px", lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:".68rem", color:"#1E3048", marginBottom:"8px" }}>{label}</div>
        <div style={{ height:"3px", background:"rgba(255,255,255,.06)", borderRadius:"2px" }}>
          <div style={{ height:"100%", width:`${value}%`, background:col,
            borderRadius:"2px", transition:"width 1.2s ease" }}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh",
      background:"linear-gradient(135deg,#060B18 0%,#07101F 50%,#060B18 100%)",
      padding:"36px 22px 60px" }}>
      <div style={{ maxWidth:"1020px", margin:"0 auto" }}>

        {/* ══════════ HERO CONCLUSION ══════════ */}
        <div className="su" style={{ borderRadius:"24px", overflow:"hidden", marginBottom:"28px",
          background:"rgba(10,16,32,.95)", border:"1px solid rgba(255,255,255,.07)" }}>
          <div style={{ height:"4px",
            background:`linear-gradient(90deg, ${recColor}, ${tierConfig.color}, #06B6D4)` }}/>
          <div style={{ padding:"28px 30px" }}>

            {/* Header row */}
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"flex-start", flexWrap:"wrap", gap:"16px", marginBottom:"22px" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:"9px", marginBottom:"10px" }}>
                  <Tag color="#6366F1">✦ IntelliHire Analysis</Tag>
                  <Tag color={data.inputMode==="text" ? "#06B6D4" : "#818CF8"}>
                    {data.inputMode==="text" ? "⌨️ Text Mode" : "🎙️ Voice Mode"}
                  </Tag>
                </div>
                <h2 style={{ fontFamily:"Syne", fontWeight:800, fontSize:"1.85rem",
                  color:"#F1F5F9", letterSpacing:"-.025em", marginBottom:"4px" }}>
                  Interview Report
                </h2>
                <p style={{ color:"#243347", fontSize:".8rem" }}>
                  {profile.name} · {profile.role} · {profile.domain} · {profile.intensity}
                </p>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"JetBrains Mono", fontSize:"3.2rem",
                  fontWeight:700, color:recColor, lineHeight:1 }}>{sScore}</div>
                <div style={{ color:"#1E3048", fontSize:".66rem", marginBottom:"8px",
                  letterSpacing:".06em" }}>SUITABILITY SCORE</div>
                <div style={{ display:"flex", gap:"7px", justifyContent:"flex-end",
                  flexWrap:"wrap" }}>
                  <span style={{ padding:"4px 13px", borderRadius:"20px",
                    background:`${recColor}18`, color:recColor,
                    fontSize:".72rem", fontWeight:600 }}>{report.recommendation}</span>
                  <span style={{ padding:"4px 13px", borderRadius:"20px",
                    background:tierConfig.bg, color:tierConfig.color,
                    border:`1px solid ${tierConfig.border}`,
                    fontSize:".72rem", fontWeight:600 }}>
                    {tierConfig.emoji} {report.performanceTier}
                  </span>
                </div>
              </div>
            </div>

            {/* Personalised Conclusion */}
            <div style={{ padding:"20px 22px", borderRadius:"16px", marginBottom:"16px",
              background:"rgba(99,102,241,.05)", border:"1px solid rgba(99,102,241,.14)" }}>
              <div style={{ fontSize:".68rem", color:"#4338CA", fontWeight:700,
                letterSpacing:".08em", marginBottom:"10px" }}>📋 PERSONALISED CONCLUSION</div>
              <p style={{ color:"#CDD9EA", lineHeight:1.82, fontSize:".92rem" }}>
                {report.conclusion}
              </p>
            </div>

            {/* Motivation message */}
            <div style={{ padding:"18px 22px", borderRadius:"16px",
              background: sScore>=65 ? "rgba(16,185,129,.05)"
                        : sScore>=45 ? "rgba(245,158,11,.05)" : "rgba(239,68,68,.04)",
              border:`1px solid ${sScore>=65 ? "rgba(16,185,129,.18)"
                : sScore>=45 ? "rgba(245,158,11,.18)" : "rgba(239,68,68,.14)"}`,
              display:"flex", gap:"14px", alignItems:"flex-start" }}>
              <div style={{ fontSize:"1.6rem", flexShrink:0, marginTop:"2px" }}>
                {sScore>=65 ? "🌟" : sScore>=45 ? "💡" : "🔥"}
              </div>
              <div>
                <div style={{ fontSize:".68rem", fontWeight:700, letterSpacing:".08em",
                  marginBottom:"7px",
                  color: sScore>=65 ? "#10B981" : sScore>=45 ? "#F59E0B" : "#EF4444" }}>
                  MESSAGE FOR {profile.name.toUpperCase()}
                </div>
                <p style={{ color:"#94A3B8", lineHeight:1.78, fontSize:".88rem" }}>
                  {report.motivation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ HIRE-READINESS ══════════ */}
        <div className="glass su" style={{ borderRadius:"18px", padding:"20px 24px",
          marginBottom:"26px", animationDelay:".06s" }}>
          <div style={{ display:"flex", gap:"14px", alignItems:"flex-start" }}>
            <div style={{ width:40, height:40, borderRadius:"10px", flexShrink:0,
              background:`${recColor}15`, border:`1px solid ${recColor}30`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem" }}>
              {recColor==="#10B981"?"✅":recColor==="#6366F1"?"🎯":recColor==="#F59E0B"?"⚠️":"❌"}
            </div>
            <div>
              <div style={{ fontSize:".7rem", color:"#263548", fontWeight:700,
                letterSpacing:".08em", marginBottom:"7px" }}>HIRE-READINESS ASSESSMENT</div>
              <p style={{ color:"#7E98B5", lineHeight:1.72, fontSize:".88rem" }}>
                {report.hirabilityVerdict}
              </p>
            </div>
          </div>
        </div>

        {/* ══════════ SCORE CARDS ══════════ */}
        <div className="su" style={{ display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",
          gap:"12px", marginBottom:"26px", animationDelay:".1s" }}>
          <ScoreCard label="Overall"       value={report.overallScore||72}       icon="📊"/>
          <ScoreCard label="Technical"     value={report.technicalScore||74}     icon="⚙️"/>
          <ScoreCard label="Communication" value={report.communicationScore||70} icon="💬"/>
          <ScoreCard label="Analytical"    value={report.analyticalScore||68}    icon="🧠"/>
          <ScoreCard label="Confidence"    value={report.confidenceScore||75}    icon="💪"/>
        </div>

        {/* ══════════ CHARTS ══════════ */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
          gap:"20px", marginBottom:"26px" }}>
          <div className="glass su" style={{ borderRadius:"18px", padding:"22px", animationDelay:".14s" }}>
            <h3 style={{ fontFamily:"Syne", fontSize:".86rem", fontWeight:600,
              color:"#CDD9EA", marginBottom:"16px" }}>Skill Radar</h3>
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,.05)"/>
                <PolarAngleAxis dataKey="skill"
                  tick={{ fill:"#2E4460", fontSize:11, fontFamily:"DM Sans" }}/>
                <PolarRadiusAxis angle={30} domain={[0,100]} tick={false} axisLine={false}/>
                <Radar dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={.15}
                  strokeWidth={2} dot={{ fill:"#6366F1", r:3 }}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass su" style={{ borderRadius:"18px", padding:"22px", animationDelay:".18s" }}>
            <h3 style={{ fontFamily:"Syne", fontSize:".86rem", fontWeight:600,
              color:"#CDD9EA", marginBottom:"16px" }}>Per-Question Scores</h3>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={barData} barSize={26}>
                <XAxis dataKey="name" tick={{ fill:"#2E4460", fontSize:11 }}
                  axisLine={false} tickLine={false}/>
                <YAxis domain={[0,50]} tick={{ fill:"#1E3048", fontSize:10 }}
                  axisLine={false} tickLine={false}/>
                <Tooltip cursor={{ fill:"rgba(255,255,255,.025)" }}
                  contentStyle={{ background:"#0A1020", border:"1px solid rgba(255,255,255,.07)",
                    borderRadius:"10px", color:"#E2E8F0", fontSize:".78rem" }}
                  formatter={(v)=>[`${v}/50`,"Score"]}/>
                <Bar dataKey="score" radius={[5,5,0,0]}>
                  {barData.map((d,i)=>(
                    <Cell key={i} fill={d.score>=40?"#10B981":d.score>=25?"#6366F1":"#F59E0B"}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ══════════ MISTAKE PATTERNS ══════════ */}
        {report.mistakePatterns?.length > 0 && (
          <div className="glass su" style={{ borderRadius:"20px", padding:"22px 24px",
            marginBottom:"24px", animationDelay:".22s" }}>
            <h3 style={{ fontFamily:"Syne", fontSize:".9rem", fontWeight:700,
              color:"#F87171", marginBottom:"4px" }}>⚡ Recurring Mistake Patterns</h3>
            <p style={{ color:"#2E4460", fontSize:".78rem", marginBottom:"18px" }}>
              These patterns appeared consistently across your answers
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {report.mistakePatterns.map((mp,i) => (
                <div key={i} style={{ padding:"16px 18px", borderRadius:"14px",
                  background:"rgba(239,68,68,.04)", border:"1px solid rgba(239,68,68,.12)",
                  display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:".68rem",
                        color:"#EF4444", fontWeight:700 }}>PATTERN {i+1}</span>
                      <span style={{ fontWeight:700, color:"#F1F5F9", fontSize:".85rem" }}>
                        {mp.pattern}
                      </span>
                    </div>
                    <p style={{ color:"#4E6A8A", fontSize:".82rem", lineHeight:1.62 }}>
                      {mp.description}
                    </p>
                  </div>
                  <div style={{ padding:"12px 14px", borderRadius:"11px",
                    background:"rgba(16,185,129,.05)", border:"1px solid rgba(16,185,129,.15)" }}>
                    <div style={{ fontSize:".66rem", color:"#10B981", fontWeight:700,
                      letterSpacing:".06em", marginBottom:"6px" }}>✓ HOW TO FIX</div>
                    <p style={{ color:"#627A96", fontSize:".82rem", lineHeight:1.62 }}>
                      {mp.fix}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ STRENGTHS / WEAKNESSES ══════════ */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
          gap:"20px", marginBottom:"24px" }}>
          <div className="glass su" style={{ borderRadius:"18px", padding:"22px", animationDelay:".26s" }}>
            <h3 style={{ fontFamily:"Syne", fontSize:".88rem", fontWeight:700,
              color:"#10B981", marginBottom:"14px" }}>💪 What You Did Well</h3>
            {report.strengths?.map((s,i) => (
              <div key={i} style={{ display:"flex", gap:"10px", marginBottom:"9px",
                padding:"10px 13px", borderRadius:"11px",
                background:"rgba(16,185,129,.04)", border:"1px solid rgba(16,185,129,.1)" }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#10B981",
                  marginTop:"7px", flexShrink:0 }}/>
                <span style={{ color:"#627A96", fontSize:".84rem", lineHeight:1.6 }}>{s}</span>
              </div>
            ))}
          </div>
          <div className="glass su" style={{ borderRadius:"18px", padding:"22px", animationDelay:".3s" }}>
            <h3 style={{ fontFamily:"Syne", fontSize:".88rem", fontWeight:700,
              color:"#F59E0B", marginBottom:"14px" }}>🔍 Where You Fell Short</h3>
            {report.weaknesses?.map((w,i) => (
              <div key={i} style={{ display:"flex", gap:"10px", marginBottom:"9px",
                padding:"10px 13px", borderRadius:"11px",
                background:"rgba(245,158,11,.04)", border:"1px solid rgba(245,158,11,.1)" }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#F59E0B",
                  marginTop:"7px", flexShrink:0 }}/>
                <span style={{ color:"#627A96", fontSize:".84rem", lineHeight:1.6 }}>{w}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════ PER-QUESTION DEEP ANALYSIS ══════════ */}
        <div className="glass su" style={{ borderRadius:"20px", padding:"22px 24px",
          marginBottom:"24px", animationDelay:".34s" }}>
          <h3 style={{ fontFamily:"Syne", fontSize:".9rem", fontWeight:700,
            color:"#CDD9EA", marginBottom:"4px" }}>🔬 Question-by-Question Analysis</h3>
          <p style={{ color:"#2E4460", fontSize:".78rem", marginBottom:"20px" }}>
            Click any question to expand the full verdict
          </p>
          {questions.map((q, i) => {
            const ev   = evaluations[i];
            const qa   = report.questionAnalysis?.find(x => x.qNum === i+1) || {};
            const vc   = verdictConfig[qa.verdict] || verdictConfig["Acceptable"];
            const isOpen = expandedQ === i;
            return (
              <div key={i} style={{ marginBottom:"10px" }}>
                <div onClick={() => setExpandedQ(isOpen ? null : i)}
                  style={{ display:"flex", alignItems:"center", gap:"12px",
                    padding:"13px 16px",
                    borderRadius: isOpen ? "14px 14px 0 0" : "14px",
                    cursor:"pointer", transition:"all .2s ease",
                    background: isOpen ? "rgba(99,102,241,.07)" : "rgba(255,255,255,.02)",
                    border:`1px solid ${isOpen ? "rgba(99,102,241,.22)" : "rgba(255,255,255,.05)"}`,
                    borderBottom: isOpen ? "none" : undefined }}
                  onMouseEnter={e=>{ if(!isOpen) e.currentTarget.style.background="rgba(255,255,255,.04)"; }}
                  onMouseLeave={e=>{ if(!isOpen) e.currentTarget.style.background="rgba(255,255,255,.02)"; }}
                >
                  <div style={{ width:32, height:32, borderRadius:"50%", flexShrink:0,
                    background:vc.bg, display:"flex", alignItems:"center",
                    justifyContent:"center", color:vc.color,
                    fontFamily:"JetBrains Mono", fontWeight:700, fontSize:".82rem",
                    border:`1px solid ${vc.color}28` }}>{vc.icon}</div>
                  <div style={{ flex:1, overflow:"hidden" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"2px" }}>
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:".65rem",
                        color:"#263548" }}>Q{i+1}</span>
                      <span style={{ fontSize:".7rem", color:vc.color, fontWeight:600 }}>
                        {qa.verdict || (ev ? "Answered" : "Skipped")}
                      </span>
                      <span style={{ fontSize:".68rem", color:"#263548",
                        background:"rgba(255,255,255,.04)", padding:"1px 7px",
                        borderRadius:"6px" }}>{q.type}</span>
                    </div>
                    <p style={{ fontSize:".82rem", color:"#7E98B5", lineHeight:1.4,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                      maxWidth:"560px" }}>{q.question}</p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
                    {ev && (
                      <span style={{ fontFamily:"JetBrains Mono", fontSize:".9rem", fontWeight:600,
                        color: ev.total>=40?"#10B981":ev.total>=25?"#6366F1":"#F59E0B" }}>
                        {ev.total}<span style={{ color:"#1E3048", fontSize:".7rem" }}>/50</span>
                      </span>
                    )}
                    <span style={{ color:"#263548", fontSize:".85rem",
                      display:"inline-block", transition:"transform .2s ease",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding:"18px 18px 20px",
                    borderRadius:"0 0 14px 14px",
                    background:"rgba(99,102,241,.04)",
                    border:"1px solid rgba(99,102,241,.22)", borderTop:"none" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
                      gap:"12px", marginBottom: ev?.scores ? "12px" : 0 }}>
                      <div style={{ padding:"13px 14px", borderRadius:"11px",
                        background:"rgba(16,185,129,.05)", border:"1px solid rgba(16,185,129,.12)" }}>
                        <div style={{ fontSize:".66rem", color:"#10B981", fontWeight:700,
                          letterSpacing:".07em", marginBottom:"7px" }}>✓ WHAT YOU DID WELL</div>
                        <p style={{ color:"#627A96", fontSize:".82rem", lineHeight:1.62 }}>
                          {qa.highlight || ev?.correct?.[0] || "—"}
                        </p>
                      </div>
                      <div style={{ padding:"13px 14px", borderRadius:"11px",
                        background:"rgba(239,68,68,.05)", border:"1px solid rgba(239,68,68,.12)" }}>
                        <div style={{ fontSize:".66rem", color:"#F87171", fontWeight:700,
                          letterSpacing:".07em", marginBottom:"7px" }}>⚡ KEY MISTAKE</div>
                        <p style={{ color:"#627A96", fontSize:".82rem", lineHeight:1.62 }}>
                          {qa.mistake || ev?.missing?.[0] || "—"}
                        </p>
                      </div>
                      <div style={{ padding:"13px 14px", borderRadius:"11px",
                        background:"rgba(99,102,241,.05)", border:"1px solid rgba(99,102,241,.12)" }}>
                        <div style={{ fontSize:".66rem", color:"#818CF8", fontWeight:700,
                          letterSpacing:".07em", marginBottom:"7px" }}>💡 BETTER APPROACH</div>
                        <p style={{ color:"#627A96", fontSize:".82rem", lineHeight:1.62 }}>
                          {qa.betterApproach || ev?.suggestions?.[0] || "—"}
                        </p>
                      </div>
                    </div>
                    {ev?.scores && (
                      <div style={{ display:"flex", gap:"7px", flexWrap:"wrap",
                        paddingTop:"10px", borderTop:"1px solid rgba(255,255,255,.04)" }}>
                        {Object.entries(ev.scores).map(([k,v]) => (
                          <span key={k} style={{ padding:"3px 10px", borderRadius:"7px",
                            background:"rgba(255,255,255,.04)", fontSize:".7rem",
                            color: v>=8?"#10B981":v>=6?"#818CF8":"#F59E0B" }}>
                            {k.replace(/([A-Z])/g," $1").trim()}: {v}/10
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ══════════ GUIDED LEARNING PATH ══════════ */}
        {report.learningPath?.length > 0 && (
          <div className="glass su" style={{ borderRadius:"20px", padding:"22px 24px",
            marginBottom:"24px", animationDelay:".38s" }}>
            <h3 style={{ fontFamily:"Syne", fontSize:".9rem", fontWeight:700,
              color:"#818CF8", marginBottom:"4px" }}>🗺️ Your Personalised Learning Path</h3>
            <p style={{ color:"#2E4460", fontSize:".78rem", marginBottom:"20px" }}>
              Follow this sequence to close your specific gaps
            </p>
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute", left:"19px", top:"24px", bottom:"24px", width:"2px",
                background:"linear-gradient(180deg,#6366F1,#06B6D4,#10B981)",
                borderRadius:"2px", opacity:.28 }}/>
              <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                {report.learningPath.map((step, i) => {
                  const stepColors = ["#818CF8","#06B6D4","#10B981","#F59E0B"];
                  const stepRgba   = ["99,102,241","6,182,212","16,185,129","245,158,11"];
                  const c = stepColors[i] || "#818CF8";
                  const r = stepRgba[i]   || "99,102,241";
                  return (
                    <div key={i} style={{ display:"flex", gap:"16px", alignItems:"flex-start" }}>
                      <div style={{ width:38, height:38, borderRadius:"50%", flexShrink:0,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontFamily:"JetBrains Mono", fontWeight:700, fontSize:".85rem",
                        background:`rgba(${r},.15)`, border:`1px solid rgba(${r},.35)`,
                        color:c, position:"relative", zIndex:1 }}>
                        {step.step||i+1}
                      </div>
                      <div style={{ flex:1, padding:"14px 16px", borderRadius:"13px",
                        background:"rgba(255,255,255,.025)",
                        border:"1px solid rgba(255,255,255,.06)" }}>
                        <div style={{ fontFamily:"Syne", fontWeight:700, color:"#D4E0EF",
                          fontSize:".9rem", marginBottom:"5px" }}>{step.topic}</div>
                        <p style={{ color:"#3D5470", fontSize:".8rem", lineHeight:1.62,
                          marginBottom:"9px" }}>{step.why}</p>
                        <div style={{ display:"flex", gap:"8px", alignItems:"flex-start",
                          padding:"9px 12px", borderRadius:"9px",
                          background:"rgba(99,102,241,.06)",
                          border:"1px solid rgba(99,102,241,.1)" }}>
                          <span style={{ fontSize:".78rem", flexShrink:0, marginTop:"1px",
                            color:"#818CF8" }}>▶</span>
                          <p style={{ color:"#818CF8", fontSize:".8rem", lineHeight:1.55 }}>
                            {step.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ QUICK WINS ══════════ */}
        <div className="glass su" style={{ borderRadius:"18px", padding:"20px 22px",
          marginBottom:"32px", animationDelay:".42s" }}>
          <h3 style={{ fontFamily:"Syne", fontSize:".88rem", fontWeight:700,
            color:"#06B6D4", marginBottom:"14px" }}>⚡ Quick Wins — Do These First</h3>
          <div style={{ display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"10px" }}>
            {report.suggestions?.map((s,i) => (
              <div key={i} style={{ padding:"13px 15px", borderRadius:"11px",
                background:"rgba(6,182,212,.04)", border:"1px solid rgba(6,182,212,.12)",
                display:"flex", gap:"10px", alignItems:"flex-start" }}>
                <span style={{ fontFamily:"JetBrains Mono", color:"#0891B2",
                  fontSize:".7rem", marginTop:"2px", flexShrink:0,
                  background:"rgba(6,182,212,.1)", padding:"1px 6px",
                  borderRadius:"5px" }}>0{i+1}</span>
                <span style={{ color:"#627A96", fontSize:".83rem", lineHeight:1.55 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
          <button className="btn-primary" onClick={onRestart}
            style={{ padding:"14px 32px", borderRadius:"12px", fontSize:".92rem",
              display:"flex", alignItems:"center", gap:"8px" }}>
            🔄 New Interview
          </button>
          <button className="btn-ghost" onClick={() => window.print()}
            style={{ padding:"14px 28px", borderRadius:"12px", fontSize:".92rem" }}>
            📄 Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────────────────────── */
export default function App() {
  const [screen,    setScreen]    = useState("landing");
  const [mode,      setMode]      = useState(null);      // "mock" | "practice"
  const [inputMode, setInputMode] = useState(null);      // "voice" | "text"
  const [profile,   setProfile]   = useState(null);
  const [reportData,setReportData]= useState(null);

  function restart() {
    setScreen("landing");
    setMode(null); setInputMode(null); setProfile(null); setReportData(null);
  }

  return (
    <>
      <GlobalStyles/>

      {screen==="landing" && (
        <LandingScreen onStart={() => setScreen("mode")}/>
      )}

      {screen==="mode" && (
        <ModeScreen
          onSelect={m => { setMode(m); setScreen("inputmode"); }}
          onBack={() => setScreen("landing")}
        />
      )}

      {screen==="inputmode" && (
        <InputModeScreen
          interviewMode={mode}
          onSelect={im => { setInputMode(im); setScreen("profile"); }}
          onBack={() => setScreen("mode")}
        />
      )}

      {screen==="profile" && (
        <ProfileScreen
          mode={mode}
          onSubmit={p => { setProfile(p); setScreen("interview"); }}
          onBack={() => setScreen("inputmode")}
        />
      )}

      {screen==="interview" && profile && (
        <InterviewScreen
          mode={mode}
          inputMode={inputMode}
          profile={profile}
          onComplete={d => { setReportData(d); setScreen("report"); }}
          onExit={restart}
        />
      )}

      {screen==="report" && reportData && (
        <ReportScreen data={reportData} onRestart={restart}/>
      )}
    </>
  );
}
