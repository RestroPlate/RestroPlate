import React from 'react';
import { useReveal } from './hooks/useReveal';

const TOKEN = {
    bgSurface: '#111A0F',
    accent: '#7DC542',
    textPrimary: '#F0EBE1',
    textMuted: 'rgba(240,235,225,0.55)',
    border: 'rgba(125,197,66,0.13)',
    bgCard: 'rgba(255,255,255,0.03)',
    bgDeep: '#0B1A08',
    fontDisplay: "'Roboto', sans-serif",
    fontBody: "'Nunito', sans-serif",
} as const;

interface Testimonial {
    name: string;
    role: string;
    quote: string;
    initials: string;
}

const TESTIMONIALS: Testimonial[] = [
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

    const sectionStyle: React.CSSProperties = {
        background: TOKEN.bgSurface,
        padding: '100px 5vw',
    };

    const headerStyle: React.CSSProperties = {
        textAlign: 'center',
        marginBottom: '60px',
    };

    const eyebrowStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.22em',
        color: TOKEN.accent,
        textTransform: 'uppercase' as const,
        display: 'block',
        marginBottom: '16px',
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
    };

    const getCardStyle = (i: number): React.CSSProperties => ({
        background: TOKEN.bgCard,
        border: `1px solid ${TOKEN.border}`,
        borderRadius: '12px',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${i * 0.12}s, transform 0.7s ease ${i * 0.12}s`,
    });

    const quoteMarkStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontDisplay,
        fontSize: '3rem',
        fontWeight: 900,
        color: TOKEN.accent,
        lineHeight: 1,
        display: 'block',
        marginBottom: '-16px',
    };

    const quoteStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.97rem',
        lineHeight: 1.75,
        color: TOKEN.textMuted,
        flexGrow: 1,
    };

    const authorRowStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginTop: 'auto',
    };

    const avatarStyle: React.CSSProperties = {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: TOKEN.accent,
        color: TOKEN.bgDeep,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: TOKEN.fontBody,
        fontSize: '0.85rem',
        fontWeight: 800,
        flexShrink: 0,
    };

    const nameStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.92rem',
        fontWeight: 700,
        color: TOKEN.textPrimary,
        display: 'block',
    };

    const roleStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.78rem',
        color: TOKEN.textMuted,
        display: 'block',
        marginTop: '2px',
    };

    return (
        <section
            ref={ref as React.RefObject<HTMLElement>}
            style={sectionStyle}
            id="stories"
            aria-label="Testimonials"
        >
            <div style={headerStyle}>
                <span style={eyebrowStyle}>SUCCESS STORIES</span>
                <h2 style={h2Style}>Voices from Our Community</h2>
            </div>

            <div style={gridStyle}>
                {TESTIMONIALS.map((t, i) => (
                    <div key={t.name} style={getCardStyle(i)}>
                        <span style={quoteMarkStyle} aria-hidden="true">"</span>
                        <p style={quoteStyle}>{t.quote}</p>
                        <div style={authorRowStyle}>
                            <div style={avatarStyle} aria-hidden="true">{t.initials}</div>
                            <div>
                                <span style={nameStyle}>{t.name}</span>
                                <span style={roleStyle}>{t.role}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
