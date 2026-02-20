import React, { useState } from 'react';
import { useReveal } from './hooks/useReveal';

const TOKEN = {
    bgSurface: '#111A0F',
    accent: '#7DC542',
    textPrimary: '#F0EBE1',
    textMuted: 'rgba(240,235,225,0.55)',
    border: 'rgba(125,197,66,0.13)',
    bgCard: 'rgba(255,255,255,0.03)',
    fontDisplay: "'Roboto', sans-serif",
    fontBody: "'Nunito', sans-serif",
} as const;

interface Step {
    n: string;
    icon: string;
    title: string;
    desc: string;
}

const STEPS: Step[] = [
    { n: '01', icon: '🍽️', title: 'List Surplus Food', desc: 'Restaurants and homes log surplus meals or produce in under 60 seconds.' },
    { n: '02', icon: '🔗', title: 'Get Matched', desc: 'Our algorithm instantly pairs donors with nearby community partners.' },
    { n: '03', icon: '🚲', title: 'Pick Up & Deliver', desc: 'Verified volunteers or recipients collect food at the scheduled window.' },
    { n: '04', icon: '📊', title: 'Track Impact', desc: 'Both sides receive live updates, receipts, and impact certificates.' },
];

export function HowItWorks() {
    const [ref, visible] = useReveal(0.1);
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);

    const sectionStyle: React.CSSProperties = {
        background: TOKEN.bgSurface,
        padding: '100px 5vw',
    };

    const headerStyle: React.CSSProperties = {
        textAlign: 'center',
        marginBottom: '64px',
    };

    const eyebrowStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.22em',
        color: TOKEN.accent,
        marginBottom: '16px',
        textTransform: 'uppercase' as const,
        display: 'block',
    };

    const h2Style: React.CSSProperties = {
        fontFamily: TOKEN.fontDisplay,
        fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.08,
        color: TOKEN.textPrimary,
    };

    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
    };

    const getCardStyle = (i: number): React.CSSProperties => ({
        position: 'relative',
        background: hoveredStep === i ? 'rgba(125,197,66,0.06)' : TOKEN.bgCard,
        border: `1px solid ${hoveredStep === i ? 'rgba(125,197,66,0.35)' : TOKEN.border}`,
        borderRadius: '12px',
        padding: '40px 28px 36px',
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        transform: visible
            ? (hoveredStep === i ? 'translateY(-6px)' : 'translateY(0)')
            : 'translateY(32px)',
        boxShadow: hoveredStep === i ? '0 20px 50px rgba(0,0,0,0.3)' : '0 0 0 rgba(0,0,0,0)',
        transition: `opacity 0.7s ease ${i * 0.12}s, transform 0.35s ease, background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease`,
    });

    const watermarkStyle: React.CSSProperties = {
        position: 'absolute',
        top: '12px',
        right: '20px',
        fontFamily: TOKEN.fontDisplay,
        fontSize: '4rem',
        fontWeight: 900,
        color: TOKEN.accent,
        opacity: 0.05,
        lineHeight: 1,
        userSelect: 'none' as const,
    };

    const getIconStyle = (i: number): React.CSSProperties => ({
        fontSize: '2rem',
        marginBottom: '20px',
        display: 'block',
        transform: hoveredStep === i ? 'scale(1.25) rotate(-5deg)' : 'scale(1) rotate(0deg)',
        transition: 'transform 0.35s ease',
    });

    const titleStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontDisplay,
        fontSize: '1.2rem',
        fontWeight: 800,
        color: TOKEN.textPrimary,
        marginBottom: '12px',
    };

    const descStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.92rem',
        lineHeight: 1.65,
        color: TOKEN.textMuted,
    };

    return (
        <section
            ref={ref as React.RefObject<HTMLElement>}
            style={sectionStyle}
            id="how-it-works"
            aria-label="How it works"
            className="section-pad"
        >
            <div style={headerStyle}>
                <span style={eyebrowStyle}>THE PROCESS</span>
                <h2 style={h2Style} className="section-heading">How RestroPlate Works</h2>
            </div>

            <div style={gridStyle} className="steps-grid">
                {STEPS.map((step, i) => (
                    <div
                        key={step.n}
                        style={getCardStyle(i)}
                        onMouseEnter={() => setHoveredStep(i)}
                        onMouseLeave={() => setHoveredStep(null)}
                        onTouchStart={() => setHoveredStep(i)}
                        onTouchEnd={() => setHoveredStep(null)}
                    >
                        <span style={watermarkStyle} aria-hidden="true">{step.n}</span>
                        <span style={getIconStyle(i)} role="img" aria-label={step.title}>{step.icon}</span>
                        <h3 style={titleStyle}>{step.title}</h3>
                        <p style={descStyle}>{step.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
