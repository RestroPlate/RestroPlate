import React, { useState } from 'react';
import { useReveal } from './hooks/useReveal';

const IMG = {
    ctaBg: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1400&q=80',
} as const;

export function CtaSection() {
    const [ref, visible] = useReveal(0.1);
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>): void => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    return (
        <section
            ref={ref as React.RefObject<HTMLElement>}
            aria-label="Call to action"
            className="relative py-[120px] px-[5vw] flex justify-center items-center overflow-hidden text-center"
            onMouseMove={handleMouseMove}
        >
            {/* Background */}
            <div
                aria-hidden="true"
                className="absolute inset-0 z-0"
                style={{
                    background: `url(${IMG.ctaBg}) center/cover no-repeat`,
                    filter: 'brightness(0.14)',
                }}
            />

            {/* Interactive radial glow */}
            <div
                aria-hidden="true"
                className="absolute inset-0 z-[1] pointer-events-none transition-[background] duration-100"
                style={{
                    background: `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, rgba(125,197,66,0.1) 0%, transparent 65%)`,
                }}
            />

            {/* Content */}
            <div
                className="relative z-[2] max-w-[640px] transition-[opacity,transform] duration-[800ms]"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(32px)',
                }}
            >
                <span className="text-[0.75rem] font-semibold tracking-[0.22em] text-[#7DC542] mb-5 uppercase block">
                    TAKE ACTION · TODAY
                </span>
                <h2
                    className="font-black tracking-[-0.02em] leading-[1.08] text-[#F0EBE1] mb-5"
                    style={{ fontSize: 'clamp(2rem, 4.5vw, 3.6rem)' }}
                >
                    Ready to End Food Waste?
                </h2>
                <p className="text-[1.05rem] leading-[1.7] tracking-[0.01em] text-[rgba(240,235,225,0.55)] mb-11">
                    Join thousands of restaurants, volunteers, and families already making a difference.
                    Every action — big or small — feeds someone who needs it.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center flex-wrap">
                    <button
                        type="button"
                        className="text-[0.85rem] font-extrabold tracking-[0.1em] text-[#0B1A08] bg-[#7DC542] border-none rounded-[6px] px-9 py-4 cursor-pointer shadow-[0_8px_32px_rgba(125,197,66,0.35)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(125,197,66,0.45)] md:w-auto w-full max-w-[360px] mx-auto"
                    >
                        I WANT TO DONATE FOOD
                    </button>
                    <button
                        type="button"
                        className="text-[0.85rem] font-extrabold tracking-[0.1em] text-[#F0EBE1] bg-transparent border-2 border-[rgba(240,235,225,0.35)] rounded-[6px] px-9 py-4 cursor-pointer transition-[border-color,color,transform] duration-300 hover:border-[#7DC542] hover:text-[#7DC542] hover:-translate-y-1 md:w-auto w-full max-w-[360px] mx-auto"
                    >
                        I NEED FOOD SUPPORT
                    </button>
                </div>
            </div>
        </section>
    );
}
