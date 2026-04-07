"use client";
import { ESI_LABELS } from "@/lib/types";

interface Props {
    onSelect: (esi: number) => void;
    selected: number | null;
    disabled?: boolean;
}

export function ESISelector({ onSelect, selected, disabled }: Props) {
    return (
        <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((level) => {
                const meta = ESI_LABELS[level];
                const isSelected = selected === level;
                return (
                    <button
                        key={level}
                        disabled={disabled}
                        onClick={() => onSelect(level)}
                        className={`
              relative group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200
              ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"}
            `}
                        style={{
                            background: isSelected ? meta.bg : "rgba(255,255,255,0.03)",
                            borderColor: isSelected ? meta.color + "88" : "rgba(255,255,255,0.07)",
                            boxShadow: isSelected ? `0 0 20px ${meta.color}30` : "none",
                        }}
                    >
                        {/* pulse ring when selected + critical */}
                        {isSelected && level <= 2 && (
                            <span
                                className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                                style={{ background: meta.color }}
                            />
                        )}

                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold relative z-10"
                            style={{
                                background: isSelected ? meta.color + "30" : "rgba(255,255,255,0.05)",
                                color: isSelected ? meta.color : "rgba(255,255,255,0.4)",
                                border: `2px solid ${isSelected ? meta.color : "transparent"}`,
                            }}
                        >
                            {level}
                        </div>
                        <div className="text-center relative z-10">
                            <div
                                className="text-xs font-semibold leading-tight"
                                style={{ color: isSelected ? meta.color : "rgba(255,255,255,0.5)" }}
                            >
                                {meta.label}
                            </div>
                            <div className="text-[10px] text-white/25 mt-0.5 leading-tight hidden md:block">
                                {meta.description}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
