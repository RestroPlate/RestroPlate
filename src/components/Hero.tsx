import React, { useEffect, useState } from 'react';
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
    hero: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80',
} as const;

const HERO_GALLERY: string[] = [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=85',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900&q=85',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=900&q=85',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=85',
    'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=900&q=85',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=85',
];

export function Hero() {
    const [ref] = useReveal(0.05);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [transitioning, setTransitioning] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTransitioning(true);
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % HERO_GALLERY.length);
                setTransitioning(false);
            }, 400);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    // ── Section & BG ──────────────────────────────────────────────────────────

    const sectionStyle: React.CSSProperties = {
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    };

    const bgStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        background: `url(${IMG.hero}) center/cover no-repeat`,
        filter: 'brightness(0.25)',
        zIndex: 0,
    };

    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(11,26,8,0.88), rgba(5,15,3,0.55))',
        zIndex: 1,
    };

    const decorBarStyle: React.CSSProperties = {
        position: 'absolute',
        left: '5vw',
        top: '15%',
        bottom: '15%',
        width: '3px',
        background: 'linear-gradient(to bottom, transparent, #7DC542, transparent)',
        zIndex: 2,
    };

    // ── Two-column row ────────────────────────────────────────────────────────

    const rowStyle: React.CSSProperties = {
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 5vw',
        paddingTop: 80,
        minHeight: '100vh',
        gap: '4vw',
    };

    // ── Left column ───────────────────────────────────────────────────────────

    const leftColStyle: React.CSSProperties = {
        flex: '0 0 50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        animation: 'fadeUp 1s ease both',
    };

    const eyebrowStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.22em',
        color: TOKEN.accent,
        marginBottom: '24px',
        textTransform: 'uppercase' as const,
    };

    const h1Style: React.CSSProperties = {
        fontFamily: TOKEN.fontDisplay,
        fontSize: 'clamp(2.8rem, 6vw, 5.2rem)',
        fontWeight: 900,
        letterSpacing: '-0.02em',
        lineHeight: 1.08,
        color: TOKEN.textPrimary,
        marginBottom: '6px',
    };

    const h1AccentStyle: React.CSSProperties = {
        ...h1Style,
        color: TOKEN.accent,
        display: 'block',
    };

    const subStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '1.1rem',
        lineHeight: 1.72,
        letterSpacing: '0.01em',
        color: TOKEN.textMuted,
        maxWidth: '520px',
        marginBottom: '44px',
        marginTop: '20px',
    };

    const btnRowStyle: React.CSSProperties = {
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap' as const,
    };

    const btnPrimaryStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.85rem',
        fontWeight: 800,
        letterSpacing: '0.1em',
        color: TOKEN.bgDeep,
        background: TOKEN.accent,
        border: 'none',
        borderRadius: '6px',
        padding: '15px 32px',
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
        border: '2px solid rgba(240,235,225,0.45)',
        borderRadius: '6px',
        padding: '15px 32px',
        cursor: 'pointer',
        transition: 'border-color 0.3s ease, color 0.3s ease',
    };

    // ── Scroll indicator ──────────────────────────────────────────────────────

    const scrollIndicatorStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '36px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '6px',
    };

    const scrollLabelStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.6rem',
        letterSpacing: '0.25em',
        color: TOKEN.textMuted,
        textTransform: 'uppercase' as const,
    };

    const arrowStyle: React.CSSProperties = {
        color: TOKEN.accent,
        fontSize: '1.2rem',
        animation: 'bounce 1.8s ease-in-out infinite',
    };

    return (
        <>
            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(8px); }
        }
        @media (max-width: 900px) {
          .hero-right-col { display: none; }
        }
      `}</style>

            <section ref={ref as React.RefObject<HTMLElement>} style={sectionStyle} aria-label="Hero">
                <div style={bgStyle} aria-hidden="true" />
                <div style={overlayStyle} aria-hidden="true" />
                <div style={decorBarStyle} aria-hidden="true" />

                <div style={rowStyle}>

                    {/* ── LEFT: text content ── */}
                    <div style={leftColStyle}>
                        <p style={eyebrowStyle}>FOODSHARE CONNECT · EST. 2026</p>
                        <h1 style={h1Style}>
                            Every Plate
                            <span style={h1AccentStyle}>Finds a Home.</span>
                        </h1>
                        <p style={subStyle}>
                            We bridge the gap between restaurants and homes with surplus food and
                            community members facing food insecurity — one meal, one connection at a time.
                        </p>

                        <div style={btnRowStyle}>
                            <button
                                style={btnPrimaryStyle}
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
                                DONATE FOOD
                            </button>
                            <button
                                style={btnGhostStyle}
                                type="button"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = TOKEN.accent;
                                    e.currentTarget.style.color = TOKEN.accent;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(240,235,225,0.45)';
                                    e.currentTarget.style.color = TOKEN.textPrimary;
                                }}
                            >
                                FIND FOOD NEAR ME
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT: single crossfading image ── */}
                    <div
                        className="hero-right-col"
                        style={{
                            flex: '0 0 44%',
                            position: 'relative',
                            height: 420,
                            borderRadius: 20,
                            overflow: 'hidden',
                            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(125,197,66,0.2)',
                            alignSelf: 'center',
                            flexShrink: 0,
                        }}
                        aria-hidden="true"
                    >
                        {/* Rotating image */}
                        <img
                            key={currentIndex}
                            src={HERO_GALLERY[currentIndex]}
                            alt=""
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: transitioning ? 0 : 1,
                                transform: transitioning ? 'scale(1.03)' : 'scale(1)',
                                transition: 'opacity 0.6s ease, transform 0.6s ease',
                            }}
                        />

                        {/* Subtle bottom gradient */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(11,26,8,0.45) 0%, transparent 50%)',
                            pointerEvents: 'none',
                        }} />

                        {/* Dot indicators — bottom center */}
                        <div style={{
                            position: 'absolute',
                            bottom: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 8,
                            pointerEvents: 'none',
                        }}>
                            {HERO_GALLERY.map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: i === currentIndex ? 24 : 7,
                                        height: 7,
                                        borderRadius: 4,
                                        background: i === currentIndex ? '#7DC542' : 'rgba(255,255,255,0.35)',
                                        transition: 'width 0.4s ease, background 0.4s ease',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                </div>

                {/* Scroll indicator */}
                <div style={scrollIndicatorStyle} aria-hidden="true">
                    <span style={arrowStyle}>↓</span>
                    <span style={scrollLabelStyle}>SCROLL</span>
                </div>
            </section>
        </>
    );
}
