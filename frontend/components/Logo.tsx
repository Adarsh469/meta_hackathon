"use client";

import Link from "next/link";

interface Props {
    className?: string;
}

export function Logo({ className = "" }: Props) {
    return (
        <Link
            href="/"
            className={`group flex items-center gap-2 shrink-0 ${className}`}
            aria-label="Pulse AI — go to home"
        >
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#0369a1]/10 text-[#0369a1] transition-colors group-hover:bg-[#0369a1]/15">
                <svg viewBox="0 0 32 20" className="w-5 h-4" fill="none" aria-hidden="true">
                    <path
                        d="M1 10h6l2.5-7 4 15L17 5l2 5h12"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            <span className="font-semibold tracking-tight text-[15px] text-slate-900">
                Pulse<span className="text-[#0369a1]">AI</span>
            </span>
        </Link>
    );
}
