"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
    ShieldPlusIcon, PlayIcon, UserIcon, BotIcon,
    RefreshCwIcon, ChevronRightIcon, TrophyIcon, AlertCircleIcon,
} from "lucide-react";
import { triageApi } from "@/lib/api";
import {
    TaskId, PatientSummary, TriageObservation, StepLog, QuestionTopic, ESI_LABELS,
} from "@/lib/types";
import { PatientCard, ESIBadge } from "@/components/PatientCard";
import { ESISelector } from "@/components/ESISelector";
import { QueueReorder } from "@/components/QueueReorder";
import { DoctorChat } from "@/components/DoctorChat";
import { StepLogPanel } from "@/components/StepLog";

// ─── task meta ───────────────────────────────────────────────────────────────

const TASKS: { id: TaskId; label: string; badge: string; color: string }[] = [
    { id: "task1_esi_assignment", label: "ESI Assignment", badge: "Easy", color: "#30d158" },
    { id: "task2_queue_priority", label: "Queue Priority", badge: "Medium", color: "#ffd60a" },
    { id: "task3_ambiguous_triage", label: "Ambiguous Triage", badge: "Hard", color: "#ff6b00" },
];

const SESSION = "frontend-user";

// ─── AI agent runner (simulated in-browser) ──────────────────────────────────

async function runAIAgent(
    taskId: TaskId,
    onLog: (log: StepLog) => void,
    onDone: (score: number) => void
) {
    await triageApi.reset(taskId, SESSION + "-ai");
    const obs = await triageApi.reset(taskId, SESSION + "-ai");
    let currentObs: TriageObservation = obs.observation;
    let totalReward = 0;

    onLog({ step: 0, action: `[START] task=${taskId} env=clinical-triage-env model=AI-Agent`, reward: 0, done: false, message: "", timestamp: Date.now() });

    for (let step = 1; step <= 10; step++) {
        await new Promise((r) => setTimeout(r, 900)); // dramatic pause

        let action: Parameters<typeof triageApi.step>[0];

        if (taskId === "task1_esi_assignment") {
            // Simple heuristic: chest pain / breathing → ESI 1 or 2
            const symptoms = currentObs.patient?.symptoms ?? [];
            const critical = symptoms.some((s) =>
                ["chest pain", "shortness of breath", "blurred vision"].includes(s)
            );
            const esiLevel = critical ? (symptoms.length >= 3 ? 1 : 2) : symptoms.length >= 3 ? 3 : 4;
            action = { action_type: "assign_esi", esi_level: esiLevel, session_id: SESSION + "-ai" };
        } else if (taskId === "task2_queue_priority") {
            // Heuristic: score by symptom count + critical flags
            const queue = (currentObs.queue ?? []).slice();
            const criticalFlags = new Set(["chest pain", "shortness of breath", "blurred vision"]);
            const score = (p: PatientSummary) =>
                p.symptoms.filter((s) => criticalFlags.has(s)).length * 10 + p.symptom_count;
            queue.sort((a, b) => score(b) - score(a));
            action = { action_type: "reorder_queue", queue_order: queue.map((p) => p.case_id), session_id: SESSION + "-ai" };
        } else {
            // Task 3: ask medications first (contraindication), then assign
            const budget = currentObs.clarification_budget ?? 0;
            if (budget > 0 && !currentObs.awaiting_final_esi) {
                const topics: QuestionTopic[] = ["medications", "allergies", "current_symptoms"];
                const topic = topics[Math.min(3 - budget, topics.length - 1)];
                action = { action_type: "ask_question", question_topic: topic, session_id: SESSION + "-ai" };
            } else {
                const symptoms = currentObs.patient?.symptoms ?? [];
                const critical = symptoms.some((s) =>
                    ["chest pain", "shortness of breath", "blurred vision"].includes(s)
                );
                action = { action_type: "assign_esi", esi_level: critical ? 1 : 2, session_id: SESSION + "-ai" };
            }
        }

        try {
            const result = await triageApi.step(action);
            totalReward = result.reward;
            currentObs = result.observation;

            const actionStr =
                action.action_type === "assign_esi" ? `assign_esi(esi_level=${action.esi_level})` :
                    action.action_type === "reorder_queue" ? `reorder_queue(...)` :
                        `ask_question(topic=${action.question_topic})`;

            onLog({
                step,
                action: actionStr,
                reward: result.reward,
                done: result.done,
                message: result.observation.message,
                timestamp: Date.now(),
            });

            if (result.done) break;
        } catch (err: unknown) {
            onLog({ step, action: "ERROR", reward: 0, done: false, message: String(err), timestamp: Date.now() });
            break;
        }
    }

    onLog({ step: 99, action: `[END] success=${totalReward >= 0.5} score=${totalReward.toFixed(3)}`, reward: totalReward, done: true, message: "", timestamp: Date.now() });
    onDone(totalReward);
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const [taskId, setTaskId] = useState<TaskId>("task1_esi_assignment");
    const [mode, setMode] = useState<"human" | "ai">("human");
    const [obs, setObs] = useState<TriageObservation | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedESI, setSelectedESI] = useState<number | null>(null);
    const [orderedQueue, setOrderedQueue] = useState<PatientSummary[]>([]);
    const [done, setDone] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string>("");
    const [logs, setLogs] = useState<StepLog[]>([]);
    const [agentRunning, setAgentRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addLog = useCallback((log: StepLog) => setLogs((prev) => [...prev, log]), []);

    // ── Reset / start new episode ─────────────────────────────────────────────
    const handleReset = async () => {
        setLoading(true);
        setError(null);
        setDone(false);
        setScore(null);
        setFeedback("");
        setSelectedESI(null);
        setLogs([]);
        setAgentRunning(false);
        try {
            const res = await triageApi.reset(taskId, SESSION);
            setObs(res.observation);
            if (res.observation.queue) setOrderedQueue(res.observation.queue);
        } catch (e: unknown) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    };

    // ── Human submit action ───────────────────────────────────────────────────
    const handleHumanSubmit = async () => {
        if (!obs) return;
        setLoading(true);
        setError(null);
        try {
            let action: Parameters<typeof triageApi.step>[0];
            if (taskId === "task1_esi_assignment" && selectedESI) {
                action = { action_type: "assign_esi", esi_level: selectedESI, session_id: SESSION };
            } else if (taskId === "task2_queue_priority") {
                action = { action_type: "reorder_queue", queue_order: orderedQueue.map((p) => p.case_id), session_id: SESSION };
            } else {
                if (!selectedESI) { setLoading(false); return; }
                action = { action_type: "assign_esi", esi_level: selectedESI, session_id: SESSION };
            }
            const res = await triageApi.step(action);
            setObs(res.observation);
            if (res.done) {
                setDone(true);
                setScore(res.reward);
                setFeedback(res.observation.message);
            }
        } catch (e: unknown) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    };

    // ── Doctor ask_question ───────────────────────────────────────────────────
    const handleAskQuestion = async (topic: QuestionTopic): Promise<string> => {
        const res = await triageApi.step({ action_type: "ask_question", question_topic: topic, session_id: SESSION });
        setObs(res.observation);
        return res.observation.message;
    };

    // ── Run AI agent ──────────────────────────────────────────────────────────
    const handleRunAgent = async () => {
        setAgentRunning(true);
        setDone(false);
        setScore(null);
        setFeedback("");
        setLogs([]);
        setError(null);
        try {
            await runAIAgent(taskId, addLog, (s) => { setScore(s); setDone(true); });
        } catch (e: unknown) {
            setError(String(e));
        } finally {
            setAgentRunning(false);
        }
    };

    const currentTask = TASKS.find((t) => t.id === taskId)!;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex flex-col">
            {/* ── top bar ─────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 border-b border-white/6 bg-[#080c14]/90 backdrop-blur-xl">
                <div className="mx-auto max-w-[1400px] flex items-center gap-4 px-6 h-14">
                    <Link href="/" className="flex items-center gap-2 text-sm font-semibold mr-2">
                        <ShieldPlusIcon className="w-4 h-4 text-[#0a84ff]" />
                        ClinicalTriage
                        <ChevronRightIcon className="w-3 h-3 text-white/25" />
                        <span className="text-white/40">Dashboard</span>
                    </Link>

                    {/* task tabs */}
                    <div className="flex items-center gap-1 flex-1">
                        {TASKS.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { setTaskId(t.id); setObs(null); setDone(false); setScore(null); setLogs([]); setError(null); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${taskId === t.id
                                        ? "bg-white/8 text-white border border-white/10"
                                        : "text-white/40 hover:text-white/70 hover:bg-white/4"
                                    }`}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: t.color }}
                                />
                                {t.label}
                                <span
                                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                                    style={{ background: t.color + "22", color: t.color }}
                                >
                                    {t.badge}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* mode toggle */}
                    <div className="flex items-center gap-1 bg-white/4 rounded-xl p-1 border border-white/6">
                        {(["human", "ai"] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${mode === m ? "bg-[#0a84ff] text-white shadow-md" : "text-white/40 hover:text-white/70"}`}
                            >
                                {m === "human" ? <UserIcon className="w-3.5 h-3.5" /> : <BotIcon className="w-3.5 h-3.5" />}
                                {m === "human" ? "Human Mode" : "AI Agent"}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* ── main content ───────────────────────────────────────────── */}
            <div className="flex-1 mx-auto max-w-[1400px] w-full px-6 py-6">

                {/* ─ not started state ─────────────────────────────────────── */}
                {!obs && !agentRunning && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                        <div
                            className="p-5 rounded-3xl"
                            style={{ background: currentTask.color + "18", color: currentTask.color }}
                        >
                            <ShieldPlusIcon className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{currentTask.label}</h2>
                            <p className="text-white/40 text-sm max-w-md">
                                {taskId === "task1_esi_assignment" && "Evaluate a patient presentation and assign the correct ESI level (1–5)."}
                                {taskId === "task2_queue_priority" && "Five patients arrive at once. Drag to rank them from most to least urgent."}
                                {taskId === "task3_ambiguous_triage" && "Hidden medical history. Ask the doctor up to 3 questions, then assign ESI."}
                            </p>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-[#ff2d55] bg-[#ff2d55]/10 border border-[#ff2d55]/20 rounded-xl px-4 py-3 text-sm">
                                <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                        <button
                            onClick={mode === "ai" ? handleRunAgent : handleReset}
                            disabled={loading || agentRunning}
                            className="btn-glow flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-base"
                            style={{ background: currentTask.color, boxShadow: `0 0 32px ${currentTask.color}44` }}
                        >
                            {mode === "ai" ? <BotIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                            {mode === "ai" ? "Run AI Agent" : "Start Triage"}
                        </button>
                    </div>
                )}

                {/* ─ active episode ─────────────────────────────────────────── */}
                {(obs || agentRunning) && (
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
                        {/* LEFT: patient + actions */}
                        <div className="flex flex-col gap-5">

                            {/* episode header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-white/40">
                                        {mode === "ai" ? "AI Agent run" : "Your turn"}
                                    </div>
                                    <span
                                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                                        style={{ background: currentTask.color + "22", color: currentTask.color }}
                                    >
                                        {currentTask.badge}
                                    </span>
                                    {obs?.step !== undefined && (
                                        <span className="text-xs text-white/25">Step {obs.step}</span>
                                    )}
                                </div>
                                <button
                                    onClick={mode === "ai" ? handleRunAgent : handleReset}
                                    disabled={loading || agentRunning}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border border-white/8 text-white/40 hover:text-white hover:border-white/20 transition-all"
                                >
                                    <RefreshCwIcon className={`w-3.5 h-3.5 ${loading || agentRunning ? "animate-spin" : ""}`} />
                                    Restart
                                </button>
                            </div>

                            {/* patient / queue */}
                            {obs?.patient && <PatientCard patient={obs.patient} />}

                            {obs?.queue && (
                                <div className="glass p-5">
                                    <h3 className="text-sm font-semibold mb-4 text-white/70">
                                        Patient Queue — order from most to least urgent
                                    </h3>
                                    <QueueReorder
                                        patients={orderedQueue.length ? orderedQueue : obs.queue}
                                        onChange={setOrderedQueue}
                                        disabled={done || mode === "ai"}
                                    />
                                </div>
                            )}

                            {/* message / clarification */}
                            {obs?.message && obs.step > 0 && (
                                <div className="glass p-4 text-sm text-white/60 border-l-2 border-[#0a84ff]/50 rounded-l-none animate-fade-up">
                                    {obs.message}
                                </div>
                            )}

                            {/* ─ result card ──────────────────────────────────── */}
                            {done && score !== null && (
                                <div
                                    className="glass p-6 animate-fade-up border"
                                    style={{ borderColor: score >= 0.8 ? "#30d158" : score >= 0.4 ? "#ffd60a" : "#ff2d55" }}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <TrophyIcon
                                            className="w-8 h-8"
                                            style={{ color: score >= 0.8 ? "#30d158" : score >= 0.4 ? "#ffd60a" : "#ff2d55" }}
                                        />
                                        <div>
                                            <div className="text-2xl font-bold" style={{ color: score >= 0.8 ? "#30d158" : score >= 0.4 ? "#ffd60a" : "#ff2d55" }}>
                                                Score: {(score * 100).toFixed(0)}%
                                            </div>
                                            <div className="text-xs text-white/40 mt-0.5">
                                                {score === 1 ? "Perfect — exact ESI match!" : score >= 0.4 ? "Partial credit — ±1 ESI level" : "Incorrect — try again"}
                                            </div>
                                        </div>
                                    </div>
                                    {feedback && <p className="text-sm text-white/55 leading-relaxed">{feedback}</p>}
                                    <button
                                        onClick={mode === "ai" ? handleRunAgent : handleReset}
                                        className="btn-glow mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#0a84ff]"
                                    >
                                        <RefreshCwIcon className="w-4 h-4" />
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {/* ─ ESI selector (Task 1 & 3 human mode) ────────── */}
                            {mode === "human" && !done && obs && (taskId === "task1_esi_assignment" || (taskId === "task3_ambiguous_triage" && (obs.awaiting_final_esi || (obs.clarification_budget ?? 3) === 0 || selectedESI !== null))) && (
                                <div className="glass p-5">
                                    <h3 className="text-sm font-semibold mb-4 text-white/70">Assign ESI Level</h3>
                                    {selectedESI && (
                                        <div className="mb-4">
                                            <ESIBadge level={selectedESI} />
                                        </div>
                                    )}
                                    <ESISelector
                                        selected={selectedESI}
                                        onSelect={setSelectedESI}
                                        disabled={done}
                                    />
                                    <button
                                        onClick={handleHumanSubmit}
                                        disabled={!selectedESI || loading}
                                        className="btn-glow mt-4 w-full py-3 rounded-xl font-semibold text-sm bg-[#0a84ff] disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Submitting…" : "Submit Triage Decision →"}
                                    </button>
                                </div>
                            )}

                            {/* Task 2 submit button */}
                            {mode === "human" && !done && obs && taskId === "task2_queue_priority" && (
                                <button
                                    onClick={handleHumanSubmit}
                                    disabled={loading}
                                    className="btn-glow w-full py-3.5 rounded-2xl font-semibold text-sm bg-[#ffd60a] text-black disabled:opacity-40"
                                >
                                    {loading ? "Submitting…" : "Submit Queue Order →"}
                                </button>
                            )}

                            {/* ESI selector for task3 when ready */}
                            {mode === "human" && !done && obs && taskId === "task3_ambiguous_triage" && !obs.awaiting_final_esi && (obs.clarification_budget ?? 3) > 0 && (
                                <div className="glass p-4 flex items-center justify-between text-sm text-white/40">
                                    <span>Ask the doctor questions first, then assign ESI when you're ready.</span>
                                    <button
                                        onClick={() => setObs((prev) => prev ? { ...prev, awaiting_final_esi: true } : prev)}
                                        className="text-[#0a84ff] hover:underline text-xs ml-4 flex-shrink-0"
                                    >
                                        Skip to ESI →
                                    </button>
                                </div>
                            )}

                        </div>

                        {/* RIGHT: doctor chat (Task 3) + step log */}
                        <div className="flex flex-col gap-5">
                            {taskId === "task3_ambiguous_triage" && mode === "human" && obs && (
                                <DoctorChat
                                    budget={obs.clarification_budget ?? 3}
                                    onAskQuestion={handleAskQuestion}
                                    disabled={done}
                                />
                            )}

                            {/* step log */}
                            <div className={taskId === "task3_ambiguous_triage" && mode === "human" ? "" : "xl:col-span-2"}>
                                <StepLogPanel logs={logs} taskId={taskId} />
                            </div>

                            {/* AI mode: run button */}
                            {mode === "ai" && !agentRunning && (
                                <button
                                    onClick={handleRunAgent}
                                    className="btn-glow flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm bg-[#bf5af2]"
                                >
                                    <BotIcon className="w-4 h-4" />
                                    Run Agent Again
                                </button>
                            )}

                            {agentRunning && (
                                <div className="glass p-4 flex items-center gap-3 text-sm text-white/50">
                                    <span className="flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <span
                                                key={i}
                                                className="w-1.5 h-1.5 rounded-full bg-[#bf5af2] animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }}
                                            />
                                        ))}
                                    </span>
                                    AI agent is running…
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
