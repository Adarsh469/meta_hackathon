"use client";
import { useState, useRef, useEffect } from "react";
import { QuestionTopic } from "@/lib/types";
import { SendIcon, StethoscopeIcon } from "lucide-react";

interface Message {
    role: "user" | "doc";
    text: string;
    topic?: QuestionTopic;
    timestamp: number;
}

interface Props {
    budget: number;
    onAskQuestion: (topic: QuestionTopic) => Promise<string>;
    disabled?: boolean;
}

const TOPICS: { key: QuestionTopic; label: string; emoji: string }[] = [
    { key: "medications", label: "Medications", emoji: "💊" },
    { key: "allergies", label: "Allergies", emoji: "⚠️" },
    { key: "past_medical_history", label: "Medical History", emoji: "📋" },
    { key: "current_symptoms", label: "Current Symptoms", emoji: "🩺" },
];

export function DoctorChat({ budget, onAskQuestion, disabled }: Props) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "doc",
            text: "Hello, I'm the attending physician. You can ask me about the patient's medications, allergies, medical history, or current symptoms. What would you like to know?",
            timestamp: Date.now(),
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [usedTopics, setUsedTopics] = useState<Set<QuestionTopic>>(new Set());
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleAsk = async (topic: QuestionTopic) => {
        if (loading || disabled || budget <= 0 || usedTopics.has(topic)) return;

        const topicMeta = TOPICS.find((t) => t.key === topic)!;
        setMessages((prev) => [
            ...prev,
            { role: "user", text: `Tell me about the patient's ${topicMeta.label.toLowerCase()}.`, topic, timestamp: Date.now() },
        ]);
        setLoading(true);
        setUsedTopics((prev) => new Set([...prev, topic]));

        try {
            const reply = await onAskQuestion(topic);
            setMessages((prev) => [
                ...prev,
                { role: "doc", text: reply, timestamp: Date.now() },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "doc", text: "I'm sorry, I couldn't retrieve that information right now.", timestamp: Date.now() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass flex flex-col h-full min-h-[420px]">
            {/* header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/6">
                <div className="p-2 rounded-xl bg-[#bf5af2]/15 text-[#bf5af2]">
                    <StethoscopeIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-sm">Doctor Consultation</div>
                    <div className="text-xs text-white/35">
                        {budget > 0 ? `${budget} question${budget !== 1 ? "s" : ""} remaining` : "No more questions"}
                    </div>
                </div>
                <div
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                        background: budget > 0 ? "rgba(48,209,88,0.15)" : "rgba(255,45,85,0.15)",
                        color: budget > 0 ? "#30d158" : "#ff2d55",
                    }}
                >
                    {budget}/{3}
                </div>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "chat-bubble-user text-[#0a84ff]" : "chat-bubble-doc text-white/80"
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start animate-fade-up">
                        <div className="chat-bubble-doc px-4 py-3 flex items-center gap-2">
                            <span className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <span
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }}
                                    />
                                ))}
                            </span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* topic buttons */}
            <div className="px-4 py-4 border-t border-white/6">
                <div className="text-xs text-white/30 mb-2.5">Ask about:</div>
                <div className="grid grid-cols-2 gap-2">
                    {TOPICS.map(({ key, label, emoji }) => {
                        const used = usedTopics.has(key);
                        const inactive = disabled || budget <= 0 || used;
                        return (
                            <button
                                key={key}
                                onClick={() => handleAsk(key)}
                                disabled={inactive}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all
                  ${inactive
                                        ? "opacity-35 cursor-not-allowed border-white/5 bg-transparent text-white/40"
                                        : "border-[#bf5af2]/30 bg-[#bf5af2]/8 text-[#bf5af2] hover:bg-[#bf5af2]/15 hover:scale-[1.02] active:scale-95"
                                    }
                `}
                            >
                                <span>{emoji}</span>
                                {label}
                                {used && <span className="ml-auto text-white/25">✓</span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
