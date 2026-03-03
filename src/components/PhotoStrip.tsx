import { useState } from 'react';

const IMG = {
    card1: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=700&q=80',
    card2: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&q=80',
    card3: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=700&q=80',
} as const;

const CARDS = [
    { img: IMG.card1, label: 'Restaurants' },
    { img: IMG.card2, label: 'Home Donors' },
    { img: IMG.card3, label: 'Communities' },
];

export function PhotoStrip() {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    return (
        <section
            aria-label="Photo strip"
            className="bg-[#0B1A08] grid grid-cols-3 md:grid-cols-1 gap-[4px]"
        >
            {CARDS.map((card, i) => (
                <div
                    key={card.label}
                    className="relative overflow-hidden cursor-pointer transition-transform duration-[400ms]"
                    role="img"
                    aria-label={card.label}
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onTouchStart={() => setHoveredCard(i)}
                    onTouchEnd={() => setHoveredCard(null)}
                    style={{
                        height: '360px',
                        transform: hoveredCard === i ? 'translateY(-6px)' : 'translateY(0)',
                    }}
                >
                    <img
                        src={card.img}
                        alt={card.label}
                        className="w-full h-full object-cover block transition-[transform,filter] duration-[600ms]"
                        style={{
                            filter: 'brightness(0.5)',
                            transform: hoveredCard === i ? 'scale(1.07)' : 'scale(1)',
                        }}
                    />

                    {/* Gradient overlay */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 transition-[background] duration-[400ms]"
                        style={{
                            background: hoveredCard === i
                                ? 'linear-gradient(to top, rgba(11,26,8,0.25) 0%, transparent 55%)'
                                : 'linear-gradient(to top, rgba(11,26,8,0.85) 0%, transparent 55%)',
                        }}
                    />

                    {/* Label */}
                    <div className="absolute bottom-7 left-7 right-7">
                        <span className="text-[1.4rem] font-bold text-[#F0EBE1] block mb-1.5">
                            {card.label}
                        </span>
                        <span
                            className="text-[0.78rem] font-semibold text-[#7DC542] block transition-[letter-spacing] duration-300"
                            style={{ letterSpacing: hoveredCard === i ? '0.18em' : '0.1em' }}
                        >
                            JOIN THE NETWORK →
                        </span>
                    </div>
                </div>
            ))}
        </section>
    );
}
