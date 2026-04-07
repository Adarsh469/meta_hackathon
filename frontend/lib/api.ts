import {
    ResetResult,
    StepResult,
    TriageAction,
    TaskMeta,
} from "./types";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:7860";

async function api<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? "API error");
    }
    return res.json() as Promise<T>;
}

export const triageApi = {
    health: () => api<{ status: string; version: string }>("/health"),

    tasks: () => api<{ tasks: TaskMeta[] }>("/tasks"),

    reset: (taskId: string, sessionId = "default", seed?: number) =>
        api<ResetResult>("/reset", {
            method: "POST",
            body: JSON.stringify({ task_id: taskId, session_id: sessionId, seed }),
        }),

    step: (action: TriageAction) =>
        api<StepResult>("/step", {
            method: "POST",
            body: JSON.stringify(action),
        }),

    state: (sessionId = "default") =>
        api<Record<string, unknown>>(`/state?session_id=${sessionId}`),
};
