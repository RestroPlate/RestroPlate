import React, { useState } from 'react';
import { useReveal } from './hooks/useReveal';

const TOKEN = {
    bgDeep: '#0B1A08',
    accent: '#7DC542',
    textPrimary: '#F0EBE1',
    textMuted: 'rgba(240,235,225,0.55)',
    fontDisplay: "'Roboto', sans-serif",
    fontBody: "'Nunito', sans-serif",
} as const;

const IMG = {
    ctaBg: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1400&q=80',
} as const;

export function CtaSection() {
    const [ref, visible] = useReveal(0.1);
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
    const [hoveredFilled, setHoveredFilled] = useState(false);
    const [hoveredGhost, setHoveredGhost] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>): void => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    const sectionStyle: React.CSSProperties = {
        position: 'relative',
        padding: '120px 5vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        textAlign: 'center',
    };

    const bgStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        background: `url(${IMG.ctaBg}) center/cover no-repeat`,
        filter: 'brightness(0.14)',
        zIndex: 0,
    };

    const glowStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, rgba(125,197,66,0.1) 0%, transparent 65%)`,
        zIndex: 1,
        transition: 'background 0.1s ease',
        pointerEvents: 'none',
    };

    const contentStyle: React.CSSProperties = {
        position: 'relative',
        zIndex: 2,
        maxWidth: '640px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
    };

    const eyebrowStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.22em',
        color: TOKEN.accent,
        marginBottom: '20px',
        textTransform: 'uppercase' as const,
        display: 'block',
    };

    const h2Style: React.CSSProperties = {
        fontFamily: TOKEN.fontDisplay,
        fontSize: 'clamp(2rem, 4.5vw, 3.6rem)',
        fontWeight: 900,
        letterSpacing: '-0.02em',
        lineHeight: 1.08,
        color: TOKEN.textPrimary,
        marginBottom: '20px',
    };

    const paraStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '1.05rem',
        lineHeight: 1.7,
        letterSpacing: '0.01em',
        color: TOKEN.textMuted,
        marginBottom: '44px',
    };

    const btnRowStyle: React.CSSProperties = {};

    const btnFilledStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.85rem',
        fontWeight: 800,
        letterSpacing: '0.1em',
        color: TOKEN.bgDeep,
        background: TOKEN.accent,
        border: 'none',
        borderRadius: '6px',
        padding: '16px 36px',
        cursor: 'pointer',
        boxShadow: hoveredFilled
            ? '0 16px 48px rgba(125,197,66,0.45)'
            : '0 8px 32px rgba(125,197,66,0.35)',
        transform: hoveredFilled ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
    };

    const btnGhostStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.85rem',
        fontWeight: 800,
        letterSpacing: '0.1em',
        color: hoveredGhost ? TOKEN.accent : TOKEN.textPrimary,
        background: 'transparent',
        border: `2px solid ${hoveredGhost ? TOKEN.accent : 'rgba(240,235,225,0.35)'}`,
        borderRadius: '6px',
        padding: '16px 36px',
        cursor: 'pointer',
        transform: hoveredGhost ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
    };

    return (
        <section
            ref={ref as React.RefObject<HTMLElement>}
            style={sectionStyle}
            aria-label="Call to action"
            onMouseMove={handleMouseMove}
        >
            <div style={bgStyle} aria-hidden="true" />
            <div style={glowStyle} aria-hidden="true" />

            <div style={contentStyle}>
                <span style={eyebrowStyle}>TAKE ACTION · TODAY</span>
                <h2 style={h2Style} className="cta-heading">Ready to End Food Waste?</h2>
                <p style={paraStyle}>
                    Join thousands of restaurants, volunteers, and families already making a difference.
                    Every action — big or small — feeds someone who needs it.
                </p>

                <div style={btnRowStyle} className="cta-buttons">
                    <button
                        style={btnFilledStyle}
                        type="button"
                        onMouseEnter={() => setHoveredFilled(true)}
                        onMouseLeave={() => setHoveredFilled(false)}
                    >
                        I WANT TO DONATE FOOD
                    </button>
                    <button
                        style={btnGhostStyle}
                        type="button"
                        onMouseEnter={() => setHoveredGhost(true)}
                        onMouseLeave={() => setHoveredGhost(false)}
                    >
                        I NEED FOOD SUPPORT
                    </button>
                </div>
            </div>
        </section>
    );
}
