import React from 'react';
import { useReveal } from './hooks/useReveal';

const TOKEN = {
    bgDeep: '#0B1A08',
    accent: '#7DC542',
    textPrimary: '#F0EBE1',
    textMuted: 'rgba(240,235,225,0.55)',
    border: 'rgba(125,197,66,0.13)',
    fontDisplay: "'Roboto', sans-serif",
    fontBody: "'Nunito', sans-serif",
} as const;

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

    const sectionStyle: React.CSSProperties = {
        background: TOKEN.bgDeep,
        padding: '100px 5vw',
    };

    const innerStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6vw',
        maxWidth: '1200px',
        margin: '0 auto',
        alignItems: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(36px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
    };

    const imageWrapStyle: React.CSSProperties = {
        position: 'relative',
        display: 'block',
    };

    const imgStyle: React.CSSProperties = {
        width: '100%',
        height: '420px',
        borderRadius: '16px',
        objectFit: 'cover',
        display: 'block',
    };

    const badgeStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '-24px',
        right: '-24px',
        background: TOKEN.accent,
        borderRadius: '12px',
        padding: '20px 24px',
        textAlign: 'center',
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
    };

    const badgeNumStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontDisplay,
        fontSize: '2.2rem',
        fontWeight: 900,
        color: TOKEN.bgDeep,
        display: 'block',
        lineHeight: 1,
    };

    const badgeLabelStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.72rem',
        fontWeight: 600,
        color: 'rgba(11,26,8,0.75)',
        display: 'block',
        marginTop: '4px',
        maxWidth: '100px',
        lineHeight: 1.3,
    };

    const eyebrowStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.22em',
        color: TOKEN.accent,
        marginBottom: '18px',
        textTransform: 'uppercase' as const,
    };

    const h2Style: React.CSSProperties = {
        fontFamily: TOKEN.fontDisplay,
        fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.08,
        color: TOKEN.textPrimary,
        marginBottom: '24px',
    };

    const paraStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '1rem',
        lineHeight: 1.75,
        letterSpacing: '0.01em',
        color: TOKEN.textMuted,
        marginBottom: '16px',
    };

    const tagsRowStyle: React.CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '10px',
        marginTop: '32px',
    };

    const tagStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.78rem',
        fontWeight: 600,
        color: TOKEN.accent,
        border: `1px solid ${TOKEN.border}`,
        borderRadius: '4px',
        padding: '6px 14px',
        letterSpacing: '0.05em',
    };

    return (
        <section ref={ref as React.RefObject<HTMLElement>} style={sectionStyle} id="partners" aria-label="Our mission">
            <div style={innerStyle}>
                {/* Image column */}
                <div style={imageWrapStyle}>
                    <img src={IMG.mission} alt="Community sharing food" style={imgStyle} />
                    <div style={badgeStyle}>
                        <span style={badgeNumStyle}>1 in 3</span>
                        <span style={badgeLabelStyle}>meals wasted globally</span>
                    </div>
                </div>

                {/* Text column */}
                <div>
                    <p style={eyebrowStyle}>OUR MISSION</p>
                    <h2 style={h2Style}>Turning Surplus Into Sustenance</h2>
                    <p style={paraStyle}>
                        Every day, tons of perfectly edible food goes to landfill — while millions go to
                        bed hungry. RestroPlate exists to close that gap with technology, compassion, and community.
                    </p>
                    <p style={paraStyle}>
                        We work with local restaurants, catering companies, and households to list surplus
                        food in real time, matching it instantly with verified community partners, shelters,
                        and individuals in need — all within a 5 km radius.
                    </p>

                    <div style={tagsRowStyle}>
                        {TAGS.map((tag) => (
                            <span key={tag} style={tagStyle}>{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
