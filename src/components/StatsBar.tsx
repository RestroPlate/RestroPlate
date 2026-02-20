import React from 'react';
import { useReveal } from './hooks/useReveal';

const TOKEN = {
    bgDeep: '#0B1A08',
    accent: '#7DC542',
    textPrimary: '#F0EBE1',
    fontDisplay: "'Roboto', sans-serif",
    fontBody: "'Nunito', sans-serif",
} as const;

interface Stat {
    value: string;
    label: string;
}

const STATS: Stat[] = [
    { value: '120K+', label: 'Meals Rescued' },
    { value: '840+', label: 'Partner Restaurants' },
    { value: '12T', label: 'CO₂ Avoided (kg)' },
    { value: '98%', label: 'Satisfaction Rate' },
];

export function StatsBar() {
    const [ref, visible] = useReveal(0.2);

    const sectionStyle: React.CSSProperties = {
        background: TOKEN.accent,
        padding: '0',
    };

    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        maxWidth: '1280px',
        margin: '0 auto',
    };

    const getStatStyle = (i: number): React.CSSProperties => ({
        padding: '44px 32px',
        textAlign: 'center',
        borderRight: i < 3 ? `1px solid rgba(11,26,8,0.18)` : 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`,
    });

    const valueStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontDisplay,
        fontSize: 'clamp(2.2rem, 4vw, 3rem)',
        fontWeight: 900,
        color: TOKEN.bgDeep,
        lineHeight: 1,
        marginBottom: '8px',
        display: 'block',
    };

    const labelStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.78rem',
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.14em',
        color: 'rgba(11,26,8,0.62)',
        display: 'block',
    };

    return (
        <section ref={ref as React.RefObject<HTMLElement>} style={sectionStyle} id="impact" aria-label="Impact statistics">
            <div style={gridStyle}>
                {STATS.map((stat, i) => (
                    <div key={stat.label} style={getStatStyle(i)}>
                        <span style={valueStyle}>{stat.value}</span>
                        <span style={labelStyle}>{stat.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
