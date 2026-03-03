import { useState } from 'react';
import { useReveal } from './hooks/useReveal';
import React from 'react';

const STATS: { value: string; label: string }[] = [
    { value: '120K+', label: 'Meals Rescued' },
    { value: '840+', label: 'Partner Restaurants' },
    { value: '12T', label: 'CO₂ Avoided (kg)' },
    { value: '98%', label: 'Satisfaction Rate' },
];

export function StatsBar() {
    const [ref, visible] = useReveal(0.2);
    const [hoveredStat, setHoveredStat] = useState<number | null>(null);

    return (
        <section
            ref={ref as React.RefObject<HTMLElement>}
            id="impact"
            aria-label="Impact statistics"
            className="bg-[#7DC542]"
        >
            <div className="grid grid-cols-2 md:grid-cols-4 max-w-[1280px] mx-auto">
                {STATS.map((stat, i) => (
                    <div
                        key={stat.label}
                        onMouseEnter={() => setHoveredStat(i)}
                        onMouseLeave={() => setHoveredStat(null)}
                        className="text-center py-11 px-8 cursor-default transition-[opacity,transform,background] duration-300"
                        style={{
                            borderRight: i < 3 ? '1px solid rgba(11,26,8,0.18)' : 'none',
                            opacity: visible ? 1 : 0,
                            background: hoveredStat === i ? 'rgba(0,0,0,0.08)' : 'transparent',
                            transform: visible
                                ? (hoveredStat === i ? 'translateY(-4px)' : 'translateY(0)')
                                : 'translateY(24px)',
                            transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.3s ease, background 0.3s ease`,
                        }}
                    >
                        <span
                            className="font-black text-[#0B1A08] leading-none mb-2 block"
                            style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)' }}
                        >
                            {stat.value}
                        </span>
                        <span className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[rgba(11,26,8,0.62)] block">
                            {stat.label}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
