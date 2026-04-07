"use client";
import { StepLog } from "@/lib/types";
import { TerminalIcon } from "lucide-react";

interface Props {
    logs: StepLog[];
    taskId?: string;
    model?: string;
}

function formatLog(log: StepLog) {
    const ts = new Date(log.timestamp).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    const reward = log.reward.toFixed(2);
    const done = log.done ? "true" : "false";

    if (log.action.startsWith("START")) {
        return { cls: "log-start", text: log.action };
    }
    if (log.action.startsWith("END")) {
        return { cls: "log-end", text: log.action };
    }
    const cls = log.reward > 0 ? "log-step" : "log-step-fail";
    return {
        cls,
        text: `[STEP] step=${log.step} action=${log.action} reward=${reward} done=${done}`,
    };
}

export function StepLogPanel({ logs, taskId, model }: Props) {
    return (
        <div className="glass flex flex-col h-full min-h-[280px]">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/6">
                <TerminalIcon className="w-4 h-4 text-white/40" />
                <span className="text-sm font-medium text-white/60">Agent Log</span>
                {taskId && (
                    <span className="ml-auto text-[11px] text-white/25 font-mono">{taskId}</span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs space-y-0.5 min-h-[200px]">
                {logs.length === 0 ? (
                    <div className="text-white/20 py-8 text-center">
                        Log output will appear here when the agent runs.
                    </div>
                ) : (
                    logs.map((log, i) => {
                        const { cls, text } = formatLog(log);
                        return (
                            <div key={i} className={`log-line ${cls} animate-fade-up`}>
                                {text}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
