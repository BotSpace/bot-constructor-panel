"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles, ArrowRight, Bot, Database, Puzzle, Zap,
  Code2, BarChart3, Users, CheckCircle, ChevronRight,
  Play, Globe, Lock, Cpu,
} from "lucide-react";

// ── Example prompts ────────────────────────────────────────────────────────

const EXAMPLES = [
  "Onlayn do'kon boti — mahsulot katalogi, savat va to'lov",
  "Restoran boti — menyu, buyurtma va yetkazib berish",
  "Uchrashuv bron qilish boti — vaqt tanlash va eslatmalar",
  "FAQ boti — savollar va smart qidirish",
  "Kurs boti — darslar, testlar va sertifikat",
];

// ── Feature data ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Sparkles,
    color: "#0da2e7",
    glow: "rgba(13,162,231,0.15)",
    title: "AI Agent",
    desc: "Telegram botingizni tavsiflab bering — AI bir necha soniyada to'liq flow yaratadi. CMS, plugin va mantiqiy tugunlar bilan.",
  },
  {
    icon: Zap,
    color: "#a855f7",
    glow: "rgba(168,85,247,0.15)",
    title: "Visual Builder",
    desc: "50+ tugunli drag-and-drop muharrir. Trigger, xabar, shart, loop va boshqa tugunlarni vizual tarzda ulang.",
  },
  {
    icon: Database,
    color: "#22c55e",
    glow: "rgba(34,197,94,0.15)",
    title: "O'rnatilgan CMS",
    desc: "Bot uchun ma'lumotlar bazasi. Kolleksiyalar yarating, CRUD operatsiyalar qiling — hech qanday tashqi DB siz.",
  },
  {
    icon: Puzzle,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.15)",
    title: "Plugin bozori",
    desc: "To'lov tizimi, xarita, ob-havo, tarjima va boshqa tayyor pluginlarni bir klik bilan botingizga qo'shing.",
  },
  {
    icon: Code2,
    color: "#ef4444",
    glow: "rgba(239,68,68,0.15)",
    title: "Custom Kod",
    desc: "JavaScript tugunlari orqali istalgan logikani yozing. HTTP so'rovlar, DB va kontekst boshqaruvi bilan.",
  },
  {
    icon: BarChart3,
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.15)",
    title: "Monitoring",
    desc: "Real-time loglar, foydalanuvchi statistikasi, release boshqaruvi va debug muhiti bir joyda.",
  },
];

// ── Steps ─────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    title: "Botingizni tasvirlab bering",
    desc: "AI agentga oddiy so'z bilan botingiz nima qilishi kerakligini ayting. Qanchalik batafsil — shunchalik yaxshi natija.",
  },
  {
    num: "02",
    title: "AI flow yaratadi",
    desc: "Agent avtomatik CMS, plugin va tugunlarni tanlaydi, ularni to'g'ri ulab visual flow hosil qiladi.",
  },
  {
    num: "03",
    title: "Ishga tushiring",
    desc: "Debug muhitida sinab ko'ring, keyin bir klik bilan production relizini chiqaring. Bot tayyor!",
  },
];

// ── Stats ─────────────────────────────────────────────────────────────────

const STATS = [
  { value: "50+", label: "Tugun turi" },
  { value: "∞", label: "Flow murakkabligi" },
  { value: "10x", label: "Tezroq ishlab chiqish" },
  { value: "0", label: "Kod yozish" },
];

// ── Main component ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const [prompt, setPrompt] = useState("");
  const [focused, setFocused] = useState(false);
  const [exampleIdx, setExampleIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();

  // Rotate example placeholder
  useEffect(() => {
    const t = setInterval(() => setExampleIdx(i => (i + 1) % EXAMPLES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const handleStart = () => {
    if (prompt.trim()) sessionStorage.setItem("ai_prompt", prompt.trim());
    router.push(`/${lang}/auth`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleStart(); }
  };

  const pickExample = (ex: string) => {
    setPrompt(ex);
    textareaRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-[#06060f] text-white overflow-x-hidden font-[family-name:var(--font-geist-sans)]">

      {/* ── Background glows ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #0da2e7 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #a855f7 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #0da2e7 0%, transparent 70%)" }} />
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]">
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <Image src="/logo/logo.png" alt="BotMother" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-bold tracking-tight">BotMother</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/${lang}/auth`}
            className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5">
            Kirish
          </Link>
          <Link href={`/${lang}/auth`}
            className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-all"
            style={{ background: "linear-gradient(135deg, #0da2e7, #0077b6)" }}>
            Bepul boshlash
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-4 pt-20 pb-24 max-w-5xl mx-auto">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 border"
          style={{ borderColor: "rgba(13,162,231,0.3)", background: "rgba(13,162,231,0.08)", color: "#0da2e7" }}>
          <Sparkles className="h-3 w-3" />
          AI bilan Telegram bot yarating
          <ChevronRight className="h-3 w-3 opacity-60" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          Telegram botingizni{" "}
          <span className="relative inline-block">
            <span style={{ background: "linear-gradient(135deg, #0da2e7, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              bir daqiqada
            </span>
          </span>
          {" "}qurang
        </h1>

        <p className="text-lg text-white/50 max-w-2xl mb-12 leading-relaxed">
          Kod yozmay professional Telegram bot yarating. AI agentga nima xohlashingizni ayting —
          u sizga to'liq bot logikasini vizual flow sifatida qurib beradi.
        </p>

        {/* AI Prompt Box */}
        <div className="w-full max-w-2xl">
          <div className="relative rounded-2xl p-[1px] transition-all duration-300"
            style={{
              background: focused
                ? "linear-gradient(135deg, #0da2e7, #a855f7)"
                : "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
            }}>
            <div className="rounded-2xl overflow-hidden" style={{ background: "#0d0d1a" }}>
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder={EXAMPLES[exampleIdx]}
                className="w-full bg-transparent resize-none px-5 pt-4 pb-2 text-base text-white placeholder:text-white/25 outline-none leading-relaxed"
              />
              {/* Bottom bar */}
              <div className="flex items-center justify-between px-4 pb-3 pt-1">
                <span className="text-xs text-white/25 select-none">⏎ yuborish · ⇧⏎ yangi qator</span>
                <button
                  onClick={handleStart}
                  disabled={!prompt.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #0da2e7, #0077b6)", boxShadow: prompt.trim() ? "0 0 20px rgba(13,162,231,0.4)" : "none" }}>
                  <Sparkles className="h-4 w-4" />
                  Yaratish
                </button>
              </div>
            </div>
          </div>

          {/* Example chips */}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {EXAMPLES.slice(0, 4).map(ex => (
              <button key={ex} onClick={() => pickExample(ex)}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all bg-white/[0.03] hover:bg-white/[0.06] text-left">
                {ex.split(" — ")[0]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 mb-28">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}>
          {STATS.map(s => (
            <div key={s.label} className="flex flex-col items-center py-8 px-4"
              style={{ background: "#06060f" }}>
              <span className="text-4xl font-bold mb-1"
                style={{ background: "linear-gradient(135deg, #0da2e7, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {s.value}
              </span>
              <span className="text-sm text-white/40">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 mb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Hamma narsa bir joyda</h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Professional Telegram bot yaratish uchun kerak bo'lgan barcha vositalar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 mb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Qanday ishlaydi?</h2>
          <p className="text-white/40">Uch qadam — tayyor bot</p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-[39px] top-10 bottom-10 w-px hidden sm:block"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(13,162,231,0.4), transparent)" }} />

          <div className="flex flex-col gap-10">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center border text-xs font-mono font-bold"
                  style={{
                    borderColor: "rgba(13,162,231,0.3)",
                    background: "rgba(13,162,231,0.06)",
                    color: "#0da2e7",
                    boxShadow: "0 0 20px rgba(13,162,231,0.1)",
                  }}>
                  <span className="text-white/30 text-[10px] mb-0.5">QADAM</span>
                  {step.num}
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-white/40 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Visual showcase ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 mb-32">
        <div className="rounded-3xl overflow-hidden border border-white/[0.08] relative"
          style={{ background: "rgba(255,255,255,0.02)" }}>

          {/* Top bar mockup */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 mx-4 h-6 rounded-md bg-white/[0.04] flex items-center px-3">
              <Globe className="h-3 w-3 text-white/20 mr-2" />
              <span className="text-xs text-white/20">botmother.uz/uz/project</span>
            </div>
          </div>

          {/* Fake canvas */}
          <div className="relative h-80 sm:h-96 overflow-hidden"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(13,162,231,0.04) 0%, transparent 70%)" }}>

            {/* Dot grid inside */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>

            {/* Mock nodes */}
            <MockNode x="8%" y="18%" color="#0da2e7" label="Buyruq" icon="⚡" />
            <MockNode x="32%" y="12%" color="#a855f7" label="Xabar yuborish" icon="💬" />
            <MockNode x="32%" y="52%" color="#22c55e" label="Ma'lumotlar" icon="🗄️" />
            <MockNode x="57%" y="28%" color="#f59e0b" label="Shart tekshirish" icon="🔀" />
            <MockNode x="57%" y="65%" color="#ef4444" label="To'lov" icon="💳" />
            <MockNode x="78%" y="18%" color="#06b6d4" label="Javob yuborish" icon="✅" />
            <MockNode x="78%" y="60%" color="#a855f7" label="Xabar tahrirlash" icon="✏️" />

            {/* SVG edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <Edge x1="18%" y1="30%" x2="32%" y2="25%" />
              <Edge x1="18%" y1="38%" x2="32%" y2="65%" />
              <Edge x1="49%" y1="25%" x2="57%" y2="35%" />
              <Edge x1="49%" y1="65%" x2="57%" y2="72%" />
              <Edge x1="70%" y1="38%" x2="78%" y2="28%" />
              <Edge x1="70%" y1="72%" x2="78%" y2="70%" />
            </svg>

            {/* AI building badge */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: "rgba(13,162,231,0.3)", background: "rgba(13,162,231,0.1)", color: "#0da2e7" }}>
              <Sparkles className="h-4 w-4 animate-pulse" />
              AI flow yaratmoqda...
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust signals ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 mb-32">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Lock, title: "Xavfsiz", desc: "JWT autentifikatsiya, shifrlangan token va izolatsiyalangan muhit." },
            { icon: Cpu, title: "Tez", desc: "Debug konteyner bir necha soniyada ishga tushadi. Real-time WebSocket stream." },
            { icon: Users, title: "Ko'p foydalanuvchi", desc: "Har bir loyiha uchun alohida muhit. Jamoa bilan ishlashga tayyor." },
          ].map(t => (
            <div key={t.title} className="flex flex-col gap-3 p-6 rounded-2xl border border-white/[0.07]"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <t.icon className="h-5 w-5 text-white/40" />
              <h3 className="font-semibold">{t.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 mb-32 text-center">
        <div className="relative rounded-3xl overflow-hidden p-12 border border-white/[0.08]"
          style={{ background: "linear-gradient(135deg, rgba(13,162,231,0.08) 0%, rgba(168,85,247,0.08) 100%)" }}>
          {/* Glow */}
          <div className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(13,162,231,0.3) 0%, transparent 60%)" }} />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Bugun birinchi botingizni{" "}
              <span style={{ background: "linear-gradient(135deg, #0da2e7, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                yarating
              </span>
            </h2>
            <p className="text-white/40 mb-10 text-lg">
              Hech qanday kredit karta talab etilmaydi. Darhol boshlang.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <Link href={`/${lang}/auth`}
                className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #0da2e7, #0077b6)", boxShadow: "0 0 30px rgba(13,162,231,0.35)" }}>
                <Sparkles className="h-4 w-4" />
                Bepul boshlash
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/${lang}/auth`}
                className="flex items-center gap-2 px-6 py-4 rounded-xl text-sm text-white/50 hover:text-white transition-colors border border-white/10 hover:border-white/20">
                <Play className="h-4 w-4" />
                Demo ko'rish
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo/logo.png" alt="BotMother" width={24} height={24} className="rounded-md opacity-80" />
            <span className="text-sm text-white/40">BotMother © 2025</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link href={`/${lang}/auth`} className="hover:text-white/60 transition-colors">Kirish</Link>
            <Link href={`/${lang}/plugins`} className="hover:text-white/60 transition-colors">Pluginlar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function FeatureCard({ icon: Icon, color, glow, title, desc }: {
  icon: React.ElementType; color: string; glow: string; title: string; desc: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl border border-white/[0.07] hover:border-white/[0.14] transition-all duration-300 overflow-hidden cursor-default"
      style={{ background: "rgba(255,255,255,0.02)" }}>
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 20% 20%, ${glow} 0%, transparent 70%)` }} />

      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl mb-5"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <h3 className="font-semibold text-base mb-2">{title}</h3>
        <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function MockNode({ x, y, color, label, icon }: {
  x: string; y: string; color: string; label: string; icon: string;
}) {
  return (
    <div className="absolute flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border shadow-lg"
      style={{
        left: x, top: y,
        borderColor: `${color}40`,
        background: `${color}12`,
        color: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        boxShadow: `0 0 16px ${color}20`,
        transform: "translateY(-50%)",
      }}>
      <span>{icon}</span>
      {label}
    </div>
  );
}

function Edge({ x1, y1, x2, y2 }: { x1: string; y1: string; x2: string; y2: string }) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="rgba(13,162,231,0.25)" strokeWidth="1.5"
      strokeDasharray="5 4"
    />
  );
}
