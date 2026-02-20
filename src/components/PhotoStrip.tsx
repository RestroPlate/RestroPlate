import React, { useState } from 'react';

const TOKEN = {
    bgDeep: '#0B1A08',
    accent: '#7DC542',
    textPrimary: '#F0EBE1',
    textMuted: 'rgba(240,235,225,0.55)',
    fontDisplay: "'Roboto', sans-serif",
    fontBody: "'Nunito', sans-serif",
} as const;

const IMG = {
    card1: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=700&q=80',
    card2: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&q=80',
    card3: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=700&q=80',
} as const;

interface PhotoCard {
    img: string;
    label: string;
}

const CARDS: PhotoCard[] = [
    { img: IMG.card1, label: 'Restaurants' },
    { img: IMG.card2, label: 'Home Donors' },
    { img: IMG.card3, label: 'Communities' },
];

export function PhotoStrip() {
    const [hovered, setHovered] = useState<number | null>(null);

    const sectionStyle: React.CSSProperties = {
        background: TOKEN.bgDeep,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '4px',
    };

    const getCardStyle = (): React.CSSProperties => ({
        position: 'relative',
        height: '360px',
        overflow: 'hidden',
        cursor: 'pointer',
    });

    const getImgStyle = (i: number): React.CSSProperties => ({
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        filter: 'brightness(0.5)',
        transform: hovered === i ? 'scale(1.07)' : 'scale(1)',
        transition: 'transform 0.6s ease, filter 0.6s ease',
    });

    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(11,26,8,0.85) 0%, transparent 55%)',
    };

    const labelWrapStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '28px',
        left: '28px',
        right: '28px',
    };

    const labelStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontDisplay,
        fontSize: '1.4rem',
        fontWeight: 700,
        color: TOKEN.textPrimary,
        display: 'block',
        marginBottom: '6px',
    };

    const subLabelStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.1em',
        color: TOKEN.accent,
        display: 'block',
    };

    return (
        <section style={sectionStyle} aria-label="Photo strip">
            {CARDS.map((card, i) => (
                <div
                    key={card.label}
                    style={getCardStyle()}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    role="img"
                    aria-label={card.label}
                >
                    <img src={card.img} alt={card.label} style={getImgStyle(i)} />
                    <div style={overlayStyle} aria-hidden="true" />
                    <div style={labelWrapStyle}>
                        <span style={labelStyle}>{card.label}</span>
                        <span style={subLabelStyle}>JOIN THE NETWORK →</span>
                    </div>
                </div>
            ))}
        </section>
    );
}
