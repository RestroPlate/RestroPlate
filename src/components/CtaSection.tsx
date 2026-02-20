import React from 'react';
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
        background: 'radial-gradient(ellipse at center, rgba(125,197,66,0.12) 0%, transparent 72%)',
        zIndex: 1,
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

    const btnRowStyle: React.CSSProperties = {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap' as const,
    };

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
        boxShadow: '0 8px 32px rgba(125,197,66,0.35)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    };

    const btnGhostStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.85rem',
        fontWeight: 800,
        letterSpacing: '0.1em',
        color: TOKEN.textPrimary,
        background: 'transparent',
        border: `2px solid rgba(240,235,225,0.35)`,
        borderRadius: '6px',
        padding: '16px 36px',
        cursor: 'pointer',
        transition: 'border-color 0.3s ease, color 0.3s ease',
    };

    return (
        <section ref={ref as React.RefObject<HTMLElement>} style={sectionStyle} aria-label="Call to action">
            <div style={bgStyle} aria-hidden="true" />
            <div style={glowStyle} aria-hidden="true" />

            <div style={contentStyle}>
                <span style={eyebrowStyle}>TAKE ACTION · TODAY</span>
                <h2 style={h2Style}>Ready to End Food Waste?</h2>
                <p style={paraStyle}>
                    Join thousands of restaurants, volunteers, and families already making a difference.
                    Every action — big or small — feeds someone who needs it.
                </p>

                <div style={btnRowStyle}>
                    <button
                        style={btnFilledStyle}
                        type="button"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 14px 40px rgba(125,197,66,0.45)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(125,197,66,0.35)';
                        }}
                    >
                        I WANT TO DONATE FOOD
                    </button>
                    <button
                        style={btnGhostStyle}
                        type="button"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = TOKEN.accent;
                            e.currentTarget.style.color = TOKEN.accent;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(240,235,225,0.35)';
                            e.currentTarget.style.color = TOKEN.textPrimary;
                        }}
                    >
                        I NEED FOOD SUPPORT
                    </button>
                </div>
            </div>
        </section>
    );
}
