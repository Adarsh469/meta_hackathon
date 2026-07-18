"use client";

// ─── AgentChat: read-only doctor chat log for AI agent mode (Task 3) ──────────

export interface ChatMessage {
    from: "agent" | "doctor";
    topic?: string;
    text: string;
    timestamp?: number;
}

interface Props {
    messages: ChatMessage[];
    isRunning?: boolean;
}

const TOPIC_LABELS: Record<string, string> = {
    medications: "Medications",
    allergies: "Allergies",
    past_medical_history: "Past History",
    current_symptoms: "Current Symptoms",
};

export function AgentChat({ messages, isRunning }: Props) {
    if (messages.length === 0 && !isRunning) return null;

    return (
        <div className="glass p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Agent · Doctor Consultation
                {isRunning && (
                    <span className="ml-auto flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <span key={i} className="w-1 h-1 rounded-full bg-[#bf5af2] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                    </span>
                )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 animate-fade-up ${msg.from === "agent" ? "justify-end" : "justify-start"}`}>
                        {msg.from === "doctor" && (
                            <div className="w-6 h-6 rounded-full bg-[#0369a1]/15 flex items-center justify-center text-xs flex-shrink-0">🩺</div>
                        )}
                        <div
                            className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.from === "agent"
                                    ? "bg-[#bf5af2]/12 border border-[#bf5af2]/25 text-[#bf5af2]"
                                    : "bg-slate-900/4 border border-slate-900/8 text-slate-600"
                                }`}
                        >
                            {msg.from === "agent" && msg.topic && (
                                <div className="text-[10px] text-[#bf5af2]/70 font-medium mb-0.5">
                                    Asking about: {TOPIC_LABELS[msg.topic] ?? msg.topic}
                                </div>
                            )}
                            {msg.text}
                        </div>
                        {msg.from === "agent" && (
                            <div className="w-6 h-6 rounded-full bg-[#bf5af2]/18 flex items-center justify-center text-xs flex-shrink-0">🤖</div>
                        )}
                    </div>
                ))}

                {isRunning && messages.length === 0 && (
                    <div className="text-xs text-slate-400 text-center py-2">Agent is preparing questions…</div>
                )}
            </div>
        </div>
    );
}
