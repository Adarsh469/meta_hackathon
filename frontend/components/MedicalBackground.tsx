// Ambient background: an ECG pulse line doubling as the road for a
// repeating ambulance silhouette — the shared "Pulse AI" + emergency-care
// motif, kept faint enough to sit behind every page without competing
// with foreground content.
export function MedicalBackground() {
    return (
        <svg
            className="fixed inset-0 -z-10 h-full w-full text-slate-400"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <pattern
                    id="pulse-ambulance"
                    width={560}
                    height={220}
                    patternUnits="userSpaceOnUse"
                    patternTransform="translate(0 10)"
                >
                    <g fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.4}>
                        {/* pulse line / road */}
                        <path d="M0 150 H210 L222 108 L234 176 L246 150 H560" />

                        {/* ambulance body */}
                        <rect x="30" y="104" width="120" height="46" rx="5" />
                        <path d="M150 150 V118 H176 L190 150" />
                        <rect x="158" y="124" width="17" height="14" rx="1.5" />

                        {/* roof light bar */}
                        <rect x="62" y="94" width="26" height="8" rx="2" />

                        {/* wheels */}
                        <circle cx="58" cy="152" r="12" />
                        <circle cx="150" cy="152" r="12" />

                        {/* side cross */}
                        <path d="M78 118 H98" />
                        <path d="M88 108 V128" />
                    </g>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pulse-ambulance)" />
        </svg>
    );
}
