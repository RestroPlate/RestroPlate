import React, { useState } from 'react';
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
    const [hoveredTag, setHoveredTag] = useState<string | null>(null);
    const [imgHovered, setImgHovered] = useState(false);
    const [badgeHovered, setBadgeHovered] = useState(false);

    const sectionStyle: React.CSSProperties = {
        background: TOKEN.bgDeep,
        padding: '100px 5vw',
    };

    const innerStyle: React.CSSProperties = {
        maxWidth: '1200px',
        margin: '0 auto',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(36px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
    };

    const imageWrapStyle: React.CSSProperties = {
        position: 'relative',
        display: 'block',
        overflow: 'hidden',
        borderRadius: '16px',
    };

    const imgStyle: React.CSSProperties = {
        width: '100%',
        height: '420px',
        borderRadius: '16px',
        objectFit: 'cover',
        display: 'block',
        transform: imgHovered ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform 0.6s ease',
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
        cursor: 'pointer',
        transform: badgeHovered ? 'scale(1.05) translateY(-3px)' : 'scale(1) translateY(0)',
        transition: 'transform 0.3s ease',
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

    const getTagStyle = (tag: string): React.CSSProperties => ({
        fontFamily: TOKEN.fontBody,
        fontSize: '0.78rem',
        fontWeight: 600,
        color: TOKEN.accent,
        border: `1px solid ${TOKEN.border}`,
        borderRadius: '4px',
        padding: '6px 14px',
        letterSpacing: '0.05em',
        cursor: 'pointer',
        background: hoveredTag === tag ? 'rgba(125,197,66,0.12)' : 'transparent',
        transform: hoveredTag === tag ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'background 0.3s ease, transform 0.3s ease',
    });

    return (
        <section ref={ref as React.RefObject<HTMLElement>} style={sectionStyle} id="partners" aria-label="Our mission">
            <div style={innerStyle} className="mission-grid">
                {/* Image column */}
                <div style={{ position: 'relative', display: 'block' }} className="mission-image-col">
                    <div
                        style={imageWrapStyle}
                        onMouseEnter={() => setImgHovered(true)}
                        onMouseLeave={() => setImgHovered(false)}
                    >
                        <img src={IMG.mission} alt="Community sharing food" style={imgStyle} className="mission-image" />
                    </div>
                    <div
                        style={badgeStyle}
                        className="mission-badge"
                        onMouseEnter={() => setBadgeHovered(true)}
                        onMouseLeave={() => setBadgeHovered(false)}
                    >
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
                            <span
                                key={tag}
                                style={getTagStyle(tag)}
                                onMouseEnter={() => setHoveredTag(tag)}
                                onMouseLeave={() => setHoveredTag(null)}
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
