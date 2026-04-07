"use client";
import { useState, useRef } from "react";
import { PatientSummary, ESI_LABELS } from "@/lib/types";
import { GripVerticalIcon, ActivityIcon } from "lucide-react";

interface Props {
    patients: PatientSummary[];
    onChange: (ordered: PatientSummary[]) => void;
    disabled?: boolean;
}

export function QueueReorder({ patients, onChange, disabled }: Props) {
    const [items, setItems] = useState<PatientSummary[]>(patients);
    const dragIdx = useRef<number | null>(null);
    const [overIdx, setOverIdx] = useState<number | null>(null);

    const onDragStart = (i: number) => { dragIdx.current = i; };
    const onDragOver = (e: React.DragEvent, i: number) => {
        e.preventDefault();
        setOverIdx(i);
    };
    const onDrop = (e: React.DragEvent, i: number) => {
        e.preventDefault();
        if (dragIdx.current === null || dragIdx.current === i) return;
        const next = [...items];
        const [moved] = next.splice(dragIdx.current, 1);
        next.splice(i, 0, moved);
        setItems(next);
        onChange(next);
        dragIdx.current = null;
        setOverIdx(null);
    };
    const onDragEnd = () => { dragIdx.current = null; setOverIdx(null); };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/40">Drag to reorder · Most urgent first</span>
                <span className="text-xs text-white/30">Position 1 = ESI 1 (Immediate)</span>
            </div>
            {items.map((p, i) => (
                <div
                    key={p.case_id}
                    draggable={!disabled}
                    onDragStart={() => onDragStart(i)}
                    onDragOver={(e) => onDragOver(e, i)}
                    onDrop={(e) => onDrop(e, i)}
                    onDragEnd={onDragEnd}
                    className={`queue-item glass flex items-center gap-3 px-4 py-3 cursor-grab active:cursor-grabbing
            ${overIdx === i ? "drag-over" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
                >
                    {/* position badge */}
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/6 flex items-center justify-center text-xs font-bold text-white/40">
                        {i + 1}
                    </div>

                    {/* drag handle */}
                    <GripVerticalIcon className="w-4 h-4 text-white/20 flex-shrink-0" />

                    {/* patient info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#0a84ff]">{p.case_id}</span>
                            <span className="text-xs text-white/35">{p.age}y · {p.gender}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {p.symptoms.slice(0, 3).map((s) => (
                                <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-white/45 border border-white/8">
                                    {s}
                                </span>
                            ))}
                            {p.symptoms.length > 3 && (
                                <span className="text-[11px] text-white/25">+{p.symptoms.length - 3} more</span>
                            )}
                        </div>
                    </div>

                    {/* onset indicator */}
                    <div className="hidden md:flex items-center gap-1.5 text-xs text-white/30 flex-shrink-0">
                        <ActivityIcon className="w-3 h-3" />
                        {p.onset}
                    </div>
                </div>
            ))}
        </div>
    );
}
