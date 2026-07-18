"use client";
import { PatientSummary, ESI_LABELS } from "@/lib/types";
import { UserIcon, ClockIcon, ActivityIcon, MapPinIcon } from "lucide-react";
import { getPatientName } from "@/lib/names";

interface Props {
    patient: PatientSummary;
    index?: number;
    compact?: boolean;
}

export function PatientCard({ patient, index, compact }: Props) {
    return (
        <div className={`glass animate-fade-up p-5 ${compact ? "p-4" : "p-6"}`}>
            {/* header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {index !== undefined && (
                        <div className="w-7 h-7 rounded-full bg-slate-900/6 flex items-center justify-center text-xs font-bold text-slate-500">
                            {index + 1}
                        </div>
                    )}
                    <div>
                        <div className="font-semibold text-sm text-slate-900">{getPatientName(patient.case_id, patient.gender)}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <UserIcon className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500">{patient.age}y · {patient.gender}</span>
                            <span className="text-[10px] font-mono text-slate-300">{patient.case_id}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                    <div className="flex items-center gap-1 justify-end">
                        <ClockIcon className="w-3 h-3" />
                        {patient.duration}
                    </div>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                        <ActivityIcon className="w-3 h-3" />
                        {patient.onset} onset
                    </div>
                </div>
            </div>

            {/* symptoms */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {patient.symptoms.map((s) => (
                    <span
                        key={s}
                        className="text-xs px-2.5 py-0.5 rounded-full border border-slate-900/8 bg-slate-900/4 text-slate-600"
                    >
                        {s}
                    </span>
                ))}
            </div>

            {/* context */}
            {!compact && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPinIcon className="w-3 h-3" />
                    {patient.context}
                </div>
            )}
        </div>
    );
}

export function ESIBadge({ level }: { level: number }) {
    const meta = ESI_LABELS[level];
    if (!meta) return null;
    return (
        <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}44` }}
        >
            <span
                className="relative flex h-2 w-2 flex-shrink-0"
                style={{ color: meta.color }}
            >
                {level <= 2 && (
                    <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ background: meta.color }}
                    />
                )}
                <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ background: meta.color }}
                />
            </span>
            ESI {level} — {meta.label}
        </div>
    );
}
