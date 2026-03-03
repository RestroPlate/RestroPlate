import { useState } from 'react';
import { useReveal } from './hooks/useReveal';
import React from 'react';

const IMG = {
    mission: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=80',
} as const;

const TAGS: string[] = [
    'Zero Food Waste',
    'Community Impact',
    'Climate Positive',
    'Real-Time Matching',
    'Verified Donors',
];

export function Mission() {
    const [ref, visible] = useReveal(0.1);
    const [imgHovered, setImgHovered] = useState(false);
    const [badgeHovered, setBadgeHovered] = useState(false);

    return (
        <section
            ref={ref as React.RefObject<HTMLElement>}
            id="partners"
            aria-label="Our mission"
            className="bg-[#0B1A08] py-[100px] px-[5vw]"
        >
            {/* Reveal wrapper */}
            <div
                className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[6vw] items-center transition-[opacity,transform] duration-[800ms]"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(36px)',
                }}
            >
                {/* Image column */}
                <div className="relative block order-first">
                    <div
                        className="relative block overflow-hidden rounded-2xl"
                        onMouseEnter={() => setImgHovered(true)}
                        onMouseLeave={() => setImgHovered(false)}
                    >
                        <img
                            src={IMG.mission}
                            alt="Community sharing food"
                            className="w-full h-[420px] md:h-[300px] rounded-2xl object-cover block transition-transform duration-[600ms]"
                            style={{ transform: imgHovered ? 'scale(1.03)' : 'scale(1)' }}
                        />
                    </div>

                    {/* Badge */}
                    <div
                        className="absolute bottom-[-24px] right-[-24px] md:bottom-[-12px] md:right-[-8px] bg-[#7DC542] rounded-xl p-5 px-6 text-center shadow-[0_16px_48px_rgba(0,0,0,0.4)] cursor-pointer transition-transform duration-300"
                        onMouseEnter={() => setBadgeHovered(true)}
                        onMouseLeave={() => setBadgeHovered(false)}
                        style={{ transform: badgeHovered ? 'scale(1.05) translateY(-3px)' : 'scale(1) translateY(0)' }}
                    >
                        <span className="text-[2.2rem] font-black text-[#0B1A08] block leading-none">1 in 3</span>
                        <span className="text-[0.72rem] font-semibold text-[rgba(11,26,8,0.75)] block mt-1 max-w-[100px] leading-[1.3]">
                            meals wasted globally
                        </span>
                    </div>
                </div>

                {/* Text column */}
                <div>
                    <p className="text-[0.75rem] font-semibold tracking-[0.22em] text-[#7DC542] mb-[18px] uppercase">
                        OUR MISSION
                    </p>
                    <h2
                        className="font-extrabold tracking-[-0.02em] leading-[1.08] text-[#F0EBE1] mb-6"
                        style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)' }}
                    >
                        Turning Surplus Into Sustenance
                    </h2>
                    <p className="text-base leading-[1.75] tracking-[0.01em] text-[rgba(240,235,225,0.55)] mb-4">
                        Every day, tons of perfectly edible food goes to landfill — while millions go to
                        bed hungry. RestroPlate exists to close that gap with technology, compassion, and community.
                    </p>
                    <p className="text-base leading-[1.75] tracking-[0.01em] text-[rgba(240,235,225,0.55)] mb-4">
                        We work with local restaurants, catering companies, and households to list surplus
                        food in real time, matching it instantly with verified community partners, shelters,
                        and individuals in need — all within a 5 km radius.
                    </p>

                    <div className="flex flex-wrap gap-2.5 mt-8">
                        {TAGS.map((tag) => (
                            <span
                                key={tag}
                                className="text-[0.78rem] font-semibold text-[#7DC542] rounded border border-[rgba(125,197,66,0.13)] px-[14px] py-1.5 tracking-[0.05em] cursor-pointer transition-[background,transform] duration-300 hover:bg-[rgba(125,197,66,0.12)] hover:-translate-y-0.5"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
