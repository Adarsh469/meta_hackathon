"use client";

import Link from "next/link";
import { ActivityIcon, BrainCircuitIcon, ShieldPlusIcon, ZapIcon } from "lucide-react";

const ESI_LEVELS = [
  { level: 1, label: "Immediate", color: "#ff2d55", desc: "Life-threatening" },
  { level: 2, label: "Emergent", color: "#ff6b00", desc: "High risk" },
  { level: 3, label: "Urgent", color: "#ffd60a", desc: "Stable, multiple resources" },
  { level: 4, label: "Less Urgent", color: "#30d158", desc: "One resource needed" },
  { level: 5, label: "Non-Urgent", color: "#636366", desc: "Routine care" },
];

const FEATURES = [
  {
    icon: <ActivityIcon className="w-6 h-6" />,
    title: "Task 1 – ESI Assignment",
    badge: "Easy",
    badgeColor: "#30d158",
    desc: "Evaluate a single patient presentation and assign the correct Emergency Severity Index (1–5). Partial credit for ±1 errors.",
  },
  {
    icon: <ZapIcon className="w-6 h-6" />,
    title: "Task 2 – Queue Priority",
    badge: "Medium",
    badgeColor: "#ffd60a",
    desc: "Five patients arrive simultaneously. Order them most-to-least urgent. Scored with normalized Kendall Tau rank correlation.",
  },
  {
    icon: <BrainCircuitIcon className="w-6 h-6" />,
    title: "Task 3 – Ambiguous Triage",
    badge: "Hard",
    badgeColor: "#ff6b00",
    desc: "Hidden medication history. Ask up to 3 targeted questions to uncover contraindications, then assign ESI. +0.3 bonus for finding the risk.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* ── nav ──────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#080c14]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <ShieldPlusIcon className="text-[#0a84ff] w-5 h-5" />
            <span className="font-semibold tracking-tight">ClinicalTriage-Env</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#tasks" className="text-sm text-white/50 hover:text-white transition-colors">Tasks</a>
            <a href="#esi" className="text-sm text-white/50 hover:text-white transition-colors">ESI Scale</a>
            <Link
              href="/dashboard"
              className="btn-glow px-4 py-2 rounded-xl text-sm font-medium bg-[#0a84ff] hover:bg-[#0a84ff]/90 transition-colors"
            >
              Open Dashboard →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── hero ─────────────────────────── */}
      <section className="dot-grid relative pt-40 pb-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a84ff]/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-4xl text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0a84ff]/30 bg-[#0a84ff]/10 text-[#0a84ff] text-xs font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0a84ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0a84ff]"></span>
            </span>
            OpenEnv Competition · Meta Hackathon
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            Emergency Department<br />
            <span className="gradient-text">Triage Simulator</span>
          </h1>

          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            An AI agent acts as a trained triage nurse — assigning ESI levels, prioritizing
            patient queues, and uncovering hidden clinical histories in real time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="btn-glow px-8 py-3.5 rounded-2xl bg-[#0a84ff] font-semibold text-base shadow-[0_0_32px_rgba(10,132,255,0.4)] hover:shadow-[0_0_48px_rgba(10,132,255,0.55)] transition-all"
            >
              Launch Triage Dashboard
            </Link>
            <a
              href="https://github.com/Adarsh469/meta_hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-2xl border border-white/10 text-white/70 hover:text-white hover:border-white/25 font-medium text-base transition-all"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* floating stat cards */}
        <div className="mt-20 mx-auto max-w-3xl grid grid-cols-3 gap-4">
          {[
            { value: "500", label: "Synthetic Cases", sub: "medical_triage_500.jsonl" },
            { value: "3", label: "Distinct Tasks", sub: "Easy → Medium → Hard" },
            { value: "0.57", label: "Baseline Score", sub: "Qwen2.5-72B" },
          ].map((stat) => (
            <div key={stat.value} className="glass p-5 text-center">
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm font-medium mt-1">{stat.label}</div>
              <div className="text-xs text-white/35 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── tasks section ─────────────────── */}
      <section id="tasks" className="py-28 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3">Three Triage Challenges</h2>
            <p className="text-white/45 max-w-xl mx-auto">
              Each task tests a different clinical reasoning skill, from rapid ESI assignment to navigating hidden patient histories.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass p-7 flex flex-col gap-4 group hover:border-white/15 transition-colors">
                <div className="flex items-start justify-between">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{ background: f.badgeColor + "22", color: f.badgeColor }}
                  >
                    {f.icon}
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: f.badgeColor + "22", color: f.badgeColor }}
                  >
                    {f.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1.5">{f.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="mt-auto text-sm font-medium text-[#0a84ff] hover:underline"
                  style={{ color: f.badgeColor }}
                >
                  Try this task →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── ESI scale ─────────────────────── */}
      <section id="esi" className="py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3">Emergency Severity Index</h2>
            <p className="text-white/45 max-w-lg mx-auto">
              The ESI is a five-level triage algorithm used in over 90% of US emergency departments.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {ESI_LEVELS.map((e) => (
              <div
                key={e.level}
                className="glass flex items-center gap-5 px-6 py-4 hover:border-white/15 transition-colors"
              >
                <div
                  className="relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ background: e.color + "25", color: e.color, border: `2px solid ${e.color}44` }}
                >
                  {e.level}
                </div>
                <div className="flex-1">
                  <div className="font-semibold" style={{ color: e.color }}>{e.label}</div>
                  <div className="text-sm text-white/45">{e.desc}</div>
                </div>
                <div className="hidden md:block">
                  {e.level === 1 && <span className="text-xs text-white/30">Immediate intervention</span>}
                  {e.level === 2 && <span className="text-xs text-white/30">&lt; 15 minutes</span>}
                  {e.level === 3 && <span className="text-xs text-white/30">30–60 minutes</span>}
                  {e.level === 4 && <span className="text-xs text-white/30">1–2 hours</span>}
                  {e.level === 5 && <span className="text-xs text-white/30">2–4 hours</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── CTA ───────────────────────────── */}
      <section className="py-28 px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to triage?</h2>
          <p className="text-white/45 mb-8">
            Play as the triage nurse, watch the AI agent work through all three tasks, or consult the doctor panel for clinical guidance.
          </p>
          <Link
            href="/dashboard"
            className="btn-glow inline-block px-10 py-4 rounded-2xl bg-[#0a84ff] font-semibold text-lg shadow-[0_0_40px_rgba(10,132,255,0.4)]"
          >
            Launch Triage Dashboard →
          </Link>
        </div>
      </section>

      {/* ── footer ───────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/25 text-sm">
        ClinicalTriage-Env · OpenEnv Competition · Synthetic data only — not for clinical use
      </footer>
    </main>
  );
}
