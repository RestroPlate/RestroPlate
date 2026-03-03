import { useState } from 'react';
import { useReveal } from './hooks/useReveal';
import React from 'react';

const STEPS = [
    { n: '01', icon: '🍽️', title: 'List Surplus Food', desc: 'Restaurants and homes log surplus meals or produce in under 60 seconds.' },
    { n: '02', icon: '🔗', title: 'Get Matched', desc: 'Our algorithm instantly pairs donors with nearby community partners.' },
    { n: '03', icon: '🚲', title: 'Pick Up & Deliver', desc: 'Verified volunteers or recipients collect food at the scheduled window.' },
    { n: '04', icon: '📊', title: 'Track Impact', desc: 'Both sides receive live updates, receipts, and impact certificates.' },
];

export function HowItWorks() {
    const [ref, visible] = useReveal(0.1);
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);

    return (
        <section
            ref={ref as React.RefObject<HTMLElement>}
            id="how-it-works"
            aria-label="How it works"
            className="bg-[#111A0F] py-[100px] px-[5vw]"
        >
            {/* Header */}
            <div className="text-center mb-16">
                <span className="text-[0.75rem] font-semibold tracking-[0.22em] text-[#7DC542] mb-4 uppercase block">
                    THE PROCESS
                </span>
                <h2
                    className="font-extrabold tracking-[-0.02em] leading-[1.08] text-[#F0EBE1]"
                    style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)' }}
                >
                    How RestroPlate Works
                </h2>
            </div>

            {/* Steps grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px] mx-auto">
                {STEPS.map((step, i) => (
                    <div
                        key={step.n}
                        className="relative rounded-xl overflow-hidden cursor-pointer transition-[border-color,background,box-shadow] duration-[350ms]"
                        onMouseEnter={() => setHoveredStep(i)}
                        onMouseLeave={() => setHoveredStep(null)}
                        onTouchStart={() => setHoveredStep(i)}
                        onTouchEnd={() => setHoveredStep(null)}
                        style={{
                            background: hoveredStep === i ? 'rgba(125,197,66,0.06)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${hoveredStep === i ? 'rgba(125,197,66,0.35)' : 'rgba(125,197,66,0.13)'}`,
                            padding: '40px 28px 36px',
                            opacity: visible ? 1 : 0,
                            transform: visible
                                ? (hoveredStep === i ? 'translateY(-6px)' : 'translateY(0)')
                                : 'translateY(32px)',
                            boxShadow: hoveredStep === i ? '0 20px 50px rgba(0,0,0,0.3)' : '0 0 0 rgba(0,0,0,0)',
                            transition: `opacity 0.7s ease ${i * 0.12}s, transform 0.35s ease, background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease`,
                        }}
                    >
                        {/* Watermark number */}
                        <span
                            aria-hidden="true"
                            className="absolute top-3 right-5 text-[4rem] font-black text-[#7DC542] opacity-5 leading-none select-none"
                        >
                            {step.n}
                        </span>

                        <span
                            role="img"
                            aria-label={step.title}
                            className="text-[2rem] mb-5 block transition-transform duration-[350ms]"
                            style={{
                                transform: hoveredStep === i ? 'scale(1.25) rotate(-5deg)' : 'scale(1) rotate(0deg)',
                            }}
                        >
                            {step.icon}
                        </span>
                        <h3 className="text-[1.2rem] font-extrabold text-[#F0EBE1] mb-3">
                            {step.title}
                        </h3>
                        <p className="text-[0.92rem] leading-[1.65] text-[rgba(240,235,225,0.55)]">
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
