// ─── Patient / Observation ────────────────────────────────────────────────

export interface PatientSummary {
    case_id: string;
    age: number;
    gender: string;
    symptoms: string[];
    symptom_count: number;
    duration: string;
    onset: string;
    context: string;
}

export interface TriageObservation {
    task_id: string;
    step: number;
    patient: PatientSummary | null;
    queue: PatientSummary[] | null;
    message: string;
    clarification_budget: number | null;
    awaiting_final_esi: boolean | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────

export type ActionType = "assign_esi" | "reorder_queue" | "ask_question";
export type QuestionTopic =
    | "medications"
    | "allergies"
    | "past_medical_history"
    | "current_symptoms";

export interface TriageAction {
    action_type: ActionType;
    esi_level?: number;
    queue_order?: string[];
    question_topic?: QuestionTopic;
    session_id?: string;
}

// ─── Reward / Step result ─────────────────────────────────────────────────

export interface RewardInfo {
    value: number;
    exact_match: boolean;
    partial_credit: boolean;
    contraindication_bonus: boolean;
    kendall_tau: number | null;
    details: string;
}

export interface StepResult {
    observation: TriageObservation;
    reward: number;
    done: boolean;
    info: RewardInfo & Record<string, unknown>;
}

export interface ResetResult {
    observation: TriageObservation;
}

// ─── Task meta ────────────────────────────────────────────────────────────

export interface TaskMeta {
    id: string;
    name: string;
    difficulty: "easy" | "medium" | "hard";
    description: string;
}

export type TaskId =
    | "task1_esi_assignment"
    | "task2_queue_priority"
    | "task3_ambiguous_triage";

// ─── ESI ─────────────────────────────────────────────────────────────────

export const ESI_LABELS: Record<number, { label: string; color: string; bg: string; description: string }> = {
    1: { label: "Immediate", color: "#ff2d55", bg: "rgba(255,45,85,0.15)", description: "Resuscitation — life threat" },
    2: { label: "Emergent", color: "#ff6b00", bg: "rgba(255,107,0,0.15)", description: "High risk, should not wait" },
    3: { label: "Urgent", color: "#ffd60a", bg: "rgba(255,214,10,0.15)", description: "Stable, multiple resources" },
    4: { label: "Less Urgent", color: "#30d158", bg: "rgba(48,209,88,0.15)", description: "Stable, one resource" },
    5: { label: "Non-Urgent", color: "#636366", bg: "rgba(99,99,102,0.15)", description: "Routine, no resources" },
};

// ─── Step log ─────────────────────────────────────────────────────────────

export interface StepLog {
    step: number;
    action: string;
    reward: number;
    done: boolean;
    message: string;
    timestamp: number;
}
