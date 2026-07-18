"use client";
import { useState, useEffect } from "react";
import { Reorder } from "framer-motion";
import { PatientSummary } from "@/lib/types";
import { GripVerticalIcon, ActivityIcon } from "lucide-react";
import { getPatientName } from "@/lib/names";

interface Props {
    patients: PatientSummary[];
    onChange: (ordered: PatientSummary[]) => void;
    disabled?: boolean;
}

export function QueueReorder({ patients, onChange, disabled }: Props) {
    const [items, setItems] = useState<PatientSummary[]>(patients);

    // Sync items whenever the patients prop changes (new episode / reset)
    useEffect(() => {
        setItems(patients);
    }, [patients]);

    const handleReorder = (next: PatientSummary[]) => {
        setItems(next);
        onChange(next);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Drag to reorder · Most urgent first</span>
                <span className="text-xs text-slate-300">Position 1 = ESI 1 (Immediate)</span>
            </div>
            <Reorder.Group as="div" axis="y" values={items} onReorder={handleReorder} className="flex flex-col gap-2">
                {items.map((p, i) => (
                    <Reorder.Item
                        as="div"
                        key={p.case_id}
                        value={p}
                        drag={!disabled}
                        whileDrag={{ scale: 1.02, boxShadow: "0 12px 32px rgba(16,24,43,0.18)" }}
                        transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.9 }}
                        className={`queue-item glass flex items-center gap-3 px-4 py-3 select-none
                            ${!disabled ? "cursor-grab active:cursor-grabbing" : "opacity-50 cursor-not-allowed"}`}
                    >
                        {/* position badge */}
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900/6 flex items-center justify-center text-xs font-bold text-slate-400">
                            {i + 1}
                        </div>

                        {/* drag handle */}
                        <GripVerticalIcon className="w-4 h-4 text-slate-300 flex-shrink-0" />

                        {/* patient info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900">{getPatientName(p.case_id, p.gender)}</span>
                                <span className="text-[10px] font-mono text-slate-300">{p.case_id}</span>
                                <span className="text-xs text-slate-400">{p.age}y · {p.gender}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {p.symptoms.slice(0, 3).map((s) => (
                                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900/4 text-slate-600 border border-slate-900/8">
                                        {s}
                                    </span>
                                ))}
                                {p.symptoms.length > 3 && (
                                    <span className="text-[11px] text-slate-300">+{p.symptoms.length - 3} more</span>
                                )}
                            </div>
                        </div>

                        {/* onset indicator */}
                        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
                            <ActivityIcon className="w-3 h-3" />
                            {p.onset}
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        </div>
    );
}
