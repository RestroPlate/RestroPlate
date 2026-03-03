import { useState } from 'react';
import { useReveal } from './hooks/useReveal';
import React from 'react';

const TESTIMONIALS = [
    {
        name: 'Chef Amara Silva',
        role: 'Executive Chef, The Garden Table',
        initials: 'AS',
        quote: 'We used to discard 15 kg every evening. RestroPlate turned that guilt into pride — our kitchen waste is nearly zero now.',
    },
    {
        name: 'David Mensah',
        role: 'Food Bank Coordinator',
        initials: 'DM',
        quote: 'The real-time notifications mean we can plan pickups efficiently. RestroPlate has doubled the volume we distribute each week.',
    },
    {
        name: 'Priya Nair',
        role: 'Community Volunteer',
        initials: 'PN',
        quote: 'Signing up took two minutes. Within a day I was delivering hot meals to families three blocks from my apartment.',
    },
];

export function Testimonials() {
    const [ref, visible] = useReveal(0.1);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    return (
        <section
            ref={ref as React.RefObject<HTMLElement>}
            id="stories"
            aria-label="Testimonials"
            className="bg-[#111A0F] py-[100px] px-[5vw]"
        >
            {/* Header */}
            <div className="text-center mb-[60px]">
                <span className="text-[0.75rem] font-semibold tracking-[0.22em] text-[#7DC542] uppercase block mb-4">
                    SUCCESS STORIES
                </span>
                <h2
                    className="font-extrabold tracking-[-0.02em] leading-[1.08] text-[#F0EBE1]"
                    style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)' }}
                >
                    Voices from Our Community
                </h2>
            </div>

            {/* Cards grid */}
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TESTIMONIALS.map((t, i) => (
                    <div
                        key={t.name}
                        className="rounded-xl flex flex-col gap-6 cursor-default transition-[background,border-color,box-shadow,transform] duration-[350ms]"
                        onMouseEnter={() => setHoveredCard(i)}
                        onMouseLeave={() => setHoveredCard(null)}
                        onTouchStart={() => setHoveredCard(i)}
                        onTouchEnd={() => setHoveredCard(null)}
                        style={{
                            background: hoveredCard === i ? 'rgba(125,197,66,0.06)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${hoveredCard === i ? 'rgba(125,197,66,0.35)' : 'rgba(125,197,66,0.13)'}`,
                            padding: '36px 32px',
                            opacity: visible ? 1 : 0,
                            transform: visible
                                ? (hoveredCard === i ? 'translateY(-5px)' : 'translateY(0)')
                                : 'translateY(32px)',
                            boxShadow: hoveredCard === i ? '0 20px 50px rgba(0,0,0,0.25)' : '0 0 0 rgba(0,0,0,0)',
                            transition: `opacity 0.7s ease ${i * 0.12}s, transform 0.35s ease, background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease`,
                        }}
                    >
                        {/* Quote mark */}
                        <span
                            aria-hidden="true"
                            className="text-[3rem] font-black leading-none block -mb-4 transition-colors duration-[350ms]"
                            style={{ color: hoveredCard === i ? 'rgba(125,197,66,0.9)' : '#7DC542' }}
                        >
                            "
                        </span>
                        <p className="text-[0.97rem] leading-[1.75] text-[rgba(240,235,225,0.55)] italic flex-grow">
                            {t.quote}
                        </p>

                        {/* Author row */}
                        <div className="flex items-center gap-3.5 mt-auto">
                            <div
                                className="w-11 h-11 rounded-full bg-[#7DC542] text-[#0B1A08] flex items-center justify-center text-[0.85rem] font-extrabold flex-shrink-0 transition-transform duration-300"
                                aria-hidden="true"
                                style={{ transform: hoveredCard === i ? 'scale(1.1)' : 'scale(1)' }}
                            >
                                {t.initials}
                            </div>
                            <div>
                                <span className="text-[0.92rem] font-bold text-[#F0EBE1] block">
                                    {t.name}
                                </span>
                                <span className="text-[0.78rem] text-[rgba(240,235,225,0.55)] block mt-0.5">
                                    {t.role}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
