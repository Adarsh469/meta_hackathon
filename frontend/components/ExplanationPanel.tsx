"use client";

import { ESI_LABELS } from "@/lib/types";
import { getPatientName } from "@/lib/names";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExplainData {
    task_id: string;
    // Task 1 & 3
    true_esi?: number;
    esi_label?: string;
    esi_color?: string;
    reasoning?: string[];
    red_flags?: string[];
    // Task 2
    correct_order?: {
        rank: number;
        case_id: string;
        age: number;
        gender: string;
        symptoms: string[];
        true_esi: number;
        esi_label: string;
        esi_color: string;
        reasoning: string;
    }[];
    // Task 3
    contraindication_identified?: boolean;
    hidden_medications?: string[];
    hidden_allergies?: string[];
    contraindication?: string;
    contraindication_summary?: string;
    revealed_topics?: string[];
}

interface Props {
    data: ExplainData;
    humanESI?: number | null;
    humanQueueOrder?: string[];
    mode: "human" | "ai";
}

// ─── ESI colour dot ───────────────────────────────────────────────────────────

const ESI_COLORS: Record<number, string> = {
    1: "#ff2d55", 2: "#ff6b00", 3: "#b45309", 4: "#1f9254", 5: "#636366",
};

function ESIDot({ level }: { level: number }) {
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: ESI_COLORS[level] + "16", color: ESI_COLORS[level], border: `1px solid ${ESI_COLORS[level]}44` }}
        >
            ESI {level}
        </span>
    );
}

// ─── Main ExplanationPanel ────────────────────────────────────────────────────

export function ExplanationPanel({ data, humanESI, humanQueueOrder, mode }: Props) {
    const isTask1 = data.task_id === "task1_esi_assignment";
    const isTask2 = data.task_id === "task2_queue_priority";
    const isTask3 = data.task_id === "task3_ambiguous_triage";

    return (
        <div className="glass p-5 space-y-5 animate-fade-up border border-[#0369a1]/15">
            {/* ── Header ── */}
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#0369a1]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#0369a1]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Clinical Explanation</h3>
                    <p className="text-xs text-slate-400">{mode === "ai" ? "AI agent reasoning" : "Where you went right or wrong"}</p>
                </div>
                {data.true_esi && <div className="ml-auto"><ESIDot level={data.true_esi} /></div>}
            </div>

            {/* ── Task 1 & 3 correct answer ── */}
            {(isTask1 || isTask3) && data.true_esi && (
                <div
                    className="rounded-xl p-4 border"
                    style={{ background: (data.esi_color ?? "#0369a1") + "0c", borderColor: (data.esi_color ?? "#0369a1") + "30" }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Correct Answer</span>
                    </div>
                    <div className="text-lg font-bold" style={{ color: data.esi_color }}>
                        ESI {data.true_esi} — {data.esi_label}
                    </div>
                    {humanESI && humanESI !== data.true_esi && mode === "human" && (
                        <div className="mt-2 text-xs text-[#dc2626] font-medium">
                            You chose ESI {humanESI} — {Math.abs(humanESI - data.true_esi) === 1 ? "partial credit (±1 off)" : "incorrect (more than 1 level off)"}
                        </div>
                    )}
                    {humanESI && humanESI === data.true_esi && mode === "human" && (
                        <div className="mt-2 text-xs text-[#1f9254] font-medium">✓ You got it exactly right!</div>
                    )}
                </div>
            )}

            {/* ── Reasoning ── */}
            {data.reasoning && data.reasoning.filter(Boolean).length > 0 && (() => {
                // Build case_id → name map from correct_order (Task 2) or fall back to empty
                const caseToName: Record<string, string> = {};
                (data.correct_order ?? []).forEach((p) => {
                    caseToName[p.case_id] = getPatientName(p.case_id, p.gender);
                });
                const replaceCaseIds = (text: string) =>
                    text.replace(/MTG-\d+/g, (id) => caseToName[id] ?? id);

                const lines = data.reasoning.filter(Boolean);

                return (
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-[#0369a1]/10 flex items-center justify-center">
                                <svg className="w-3 h-3 text-[#0369a1]" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Clinical Reasoning</h4>
                        </div>
                        <div className="rounded-xl border border-slate-900/8 bg-slate-900/[0.015] divide-y divide-slate-900/6 overflow-hidden">
                            {lines.map((line, i) => (
                                <div key={i} className="flex items-start gap-3 px-4 py-3">
                                    <span className="mt-0.5 w-5 h-5 rounded-full bg-white border border-slate-900/10 text-[10px] font-semibold text-slate-400 flex items-center justify-center flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <span
                                        className="text-sm text-slate-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html: replaceCaseIds(line)
                                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900">$1</strong>')
                                                .replace(/⚠/g, '<span class="text-[#b45309]">⚠</span>')
                                                .replace(/✓/g, '<span class="text-[#1f9254]">✓</span>')
                                                .replace(/✗/g, '<span class="text-[#dc2626]">✗</span>')
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}

            {/* ── Task 2: correct queue ── */}
            {isTask2 && data.correct_order && (
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Correct Priority Order</h4>
                    <div className="space-y-2">
                        {data.correct_order.map((p) => {
                            const humanRank = humanQueueOrder ? humanQueueOrder.indexOf(p.case_id) + 1 : null;
                            const rankMismatch = humanRank && humanRank !== p.rank;
                            return (
                                <div
                                    key={p.case_id}
                                    className="flex items-start gap-3 rounded-xl p-3 border"
                                    style={{ background: p.esi_color + "08", borderColor: p.esi_color + "25" }}
                                >
                                    <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                                        style={{ background: p.esi_color + "1e", color: p.esi_color }}
                                    >
                                        {p.rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-slate-900">{getPatientName(p.case_id, p.gender)}</span>
                                            <span className="text-[10px] font-mono text-slate-300">{p.case_id}</span>
                                            <ESIDot level={p.true_esi} />
                                            {humanRank && mode === "human" && (
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${rankMismatch ? "text-[#b45309] bg-[#b45309]/10" : "text-[#1f9254] bg-[#1f9254]/10"}`}>
                                                    {rankMismatch ? `You ranked #${humanRank}` : "✓ Correct rank"}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{p.reasoning}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Task 3: hidden history reveal ── */}
            {isTask3 && data.hidden_medications && (
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hidden History Revealed</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl p-3 bg-slate-900/[0.02] border border-slate-900/8">
                            <div className="text-xs text-slate-400 mb-1">Medications</div>
                            <div className="text-sm font-medium text-slate-900">{data.hidden_medications.join(", ")}</div>
                        </div>
                        {data.hidden_allergies && data.hidden_allergies.length > 0 && (
                            <div className="rounded-xl p-3 bg-slate-900/[0.02] border border-slate-900/8">
                                <div className="text-xs text-slate-400 mb-1">Allergies</div>
                                <div className="text-sm font-medium text-slate-900">{data.hidden_allergies.join(", ")}</div>
                            </div>
                        )}
                    </div>
                    {data.contraindication && (
                        <div className={`rounded-xl p-4 border ${data.contraindication_identified ? "border-[#1f9254]/25 bg-[#1f9254]/6" : "border-[#dc2626]/25 bg-[#dc2626]/6"}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm">{data.contraindication_identified ? "✓" : "✗"}</span>
                                <span className="text-xs font-semibold" style={{ color: data.contraindication_identified ? "#1f9254" : "#dc2626" }}>
                                    {data.contraindication_identified ? "Contraindication correctly identified" : "Contraindication missed"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{data.contraindication_summary}</p>
                            {!data.contraindication_identified && (
                                <p className="text-xs text-[#b45309] mt-2">💡 Always ask about medications first — it reveals the key drug interaction.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Red flags (Task 1) ── */}
            {isTask1 && data.red_flags && data.red_flags.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Red Flags Present</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.red_flags.map((rf) => (
                            <span key={rf} className="text-xs px-2.5 py-1 rounded-full bg-[#dc2626]/8 text-[#dc2626] border border-[#dc2626]/20">
                                ⚠ {rf}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
