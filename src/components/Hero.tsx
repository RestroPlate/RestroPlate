import React, { useEffect, useState } from 'react';

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

const HERO_GALLERY: readonly string[] = [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=85',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900&q=85',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=900&q=85',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=85',
    'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=900&q=85',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=85',
];

export function Hero() {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [transitioning, setTransitioning] = useState<boolean>(false);
    const [frameHovered, setFrameHovered] = useState<boolean>(false);
    const [hoveredDot, setHoveredDot] = useState<number | null>(null);

    useEffect((): (() => void) => {
        const interval = setInterval((): void => {
            setTransitioning(true);
            setTimeout((): void => {
                setCurrentIndex((prev: number): number => (prev + 1) % HERO_GALLERY.length);
                setTransitioning(false);
            }, 400);
        }, 3500);
        return (): void => clearInterval(interval);
    }, []);

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    0%   { opacity: 0; transform: translateY(28px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes heroArrowBounce {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(8px); }
                }

                /* ── Hero section ── */
                .hero-section {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: #0B1A08;
                    overflow: hidden;
                }

                /* ── Left column ── */
                .hero-left {
                    flex: 0 0 50%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    animation: fadeUp 0.8s ease 0.1s both;
                    will-change: opacity, transform;
                }

                /* ── Right column ── */
                .hero-right-col {
                    flex: 0 0 44%;
                    position: relative;
                    height: 420px;
                    border-radius: 20px;
                    overflow: hidden;
                    align-self: center;
                    flex-shrink: 0;
                    box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(125,197,66,0.2);
                }

                .hero-buttons {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .hero-h1 {
                    font-size: clamp(2.4rem, 5vw, 5rem);
                }

                /* ── Tablet ── */
                @media (max-width: 900px) {
                    .hero-right-col { display: none !important; }
                    .hero-left { flex: 0 0 100% !important; max-width: 100%; }
                }

                /* ── Mobile ── */
                @media (max-width: 768px) {
                    .hero-h1 { font-size: clamp(2rem, 8vw, 3rem) !important; }
                    .hero-buttons { flex-direction: column !important; width: 100%; }
                    .hero-buttons button { width: 100% !important; }
                }

                /* ── Small mobile ── */
                @media (max-width: 480px) {
                    .hero-h1 { font-size: 2rem !important; }
                }
            `}</style>

            <section className="hero-section" aria-label="Hero">

                {/* Background image */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        backgroundImage: `url(${IMG.hero})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 35%',
                        filter: 'brightness(0.25)',
                        backgroundColor: '#1a2e14',
                    } satisfies React.CSSProperties}
                />

                {/* Gradient overlay */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                        background: 'linear-gradient(135deg, rgba(11,26,8,0.88), rgba(5,15,3,0.55))',
                        pointerEvents: 'none',
                    } satisfies React.CSSProperties}
                />

                {/* Decorative left bar */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        left: '5vw',
                        top: '20%',
                        bottom: '20%',
                        width: 3,
                        zIndex: 2,
                        background: 'linear-gradient(to bottom, transparent, #7DC542, transparent)',
                        pointerEvents: 'none',
                    } satisfies React.CSSProperties}
                />

                {/*
                  ── CRITICAL FIX ──
                  This wrapper uses paddingTop: 68px (navbar height) + 32px breathing room.
                  It does NOT use minHeight — only the section has minHeight: 100vh.
                  flex: 1 fills the remaining height of the section naturally.
                  NO className used here to avoid any CSS override from Home.tsx.
                */}
                <div
                    style={{
                        position: 'relative',
                        zIndex: 3,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        paddingTop: '100px',
                        paddingBottom: '60px',
                        paddingLeft: '5vw',
                        paddingRight: '5vw',
                        gap: '4vw',
                        boxSizing: 'border-box',
                    } satisfies React.CSSProperties}
                >

                    {/* LEFT column */}
                    <div className="hero-left">
                        <p style={{
                            fontFamily: TOKEN.fontBody,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.22em',
                            color: TOKEN.accent,
                            marginBottom: 24,
                            textTransform: 'uppercase',
                        } satisfies React.CSSProperties}>
                            FOODSHARE CONNECT · EST. 2026
                        </p>

                        <h1
                            className="hero-h1"
                            style={{
                                fontFamily: TOKEN.fontDisplay,
                                fontWeight: 900,
                                letterSpacing: '-0.02em',
                                lineHeight: 1.08,
                                color: TOKEN.textPrimary,
                                marginBottom: 6,
                            } satisfies React.CSSProperties}
                        >
                            Every Plate
                            <span style={{
                                color: TOKEN.accent,
                                display: 'block',
                            } satisfies React.CSSProperties}>
                                Finds a Home.
                            </span>
                        </h1>

                        <p style={{
                            fontFamily: TOKEN.fontBody,
                            fontSize: '1.05rem',
                            lineHeight: 1.72,
                            letterSpacing: '0.01em',
                            color: TOKEN.textMuted,
                            maxWidth: 520,
                            marginBottom: 40,
                            marginTop: 20,
                        } satisfies React.CSSProperties}>
                            We bridge the gap between restaurants and homes with surplus food and
                            community members facing food insecurity — one meal, one connection at a time.
                        </p>

                        <div className="hero-buttons">
                            <button
                                type="button"
                                style={{
                                    fontFamily: TOKEN.fontBody,
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.1em',
                                    color: TOKEN.bgDeep,
                                    background: TOKEN.accent,
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '15px 32px',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 32px rgba(125,197,66,0.35)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                } satisfies React.CSSProperties}
                                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>): void => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = '0 14px 40px rgba(125,197,66,0.45)';
                                }}
                                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>): void => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(125,197,66,0.35)';
                                }}
                            >
                                DONATE FOOD
                            </button>

                            <button
                                type="button"
                                style={{
                                    fontFamily: TOKEN.fontBody,
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.1em',
                                    color: TOKEN.textPrimary,
                                    background: 'transparent',
                                    border: '2px solid rgba(240,235,225,0.45)',
                                    borderRadius: 6,
                                    padding: '15px 32px',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.3s ease, color 0.3s ease',
                                } satisfies React.CSSProperties}
                                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>): void => {
                                    e.currentTarget.style.borderColor = TOKEN.accent;
                                    e.currentTarget.style.color = TOKEN.accent;
                                }}
                                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>): void => {
                                    e.currentTarget.style.borderColor = 'rgba(240,235,225,0.45)';
                                    e.currentTarget.style.color = TOKEN.textPrimary;
                                }}
                            >
                                FIND FOOD NEAR ME
                            </button>
                        </div>
                    </div>

                    {/* RIGHT column — rotating image */}
                    <div
                        className="hero-right-col"
                        aria-hidden="true"
                        onMouseEnter={(): void => setFrameHovered(true)}
                        onMouseLeave={(): void => setFrameHovered(false)}
                        style={{
                            transform: frameHovered ? 'scale(1.02)' : 'scale(1)',
                            transition: 'transform 0.5s ease',
                        } satisfies React.CSSProperties}
                    >
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
                            } satisfies React.CSSProperties}
                        />

                        {/* Bottom gradient */}
                        <div
                            aria-hidden="true"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(11,26,8,0.45) 0%, transparent 50%)',
                                pointerEvents: 'none',
                            } satisfies React.CSSProperties}
                        />

                        {/* Dot indicators */}
                        <div style={{
                            position: 'absolute',
                            bottom: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 8,
                            zIndex: 2,
                        } satisfies React.CSSProperties}>
                            {HERO_GALLERY.map((_: string, i: number): React.ReactElement => (
                                <div
                                    key={i}
                                    onClick={(): void => {
                                        setTransitioning(true);
                                        setTimeout((): void => {
                                            setCurrentIndex(i);
                                            setTransitioning(false);
                                        }, 200);
                                    }}
                                    onMouseEnter={(): void => setHoveredDot(i)}
                                    onMouseLeave={(): void => setHoveredDot(null)}
                                    style={{
                                        width: i === currentIndex ? 24 : 7,
                                        height: 7,
                                        borderRadius: 4,
                                        background: i === currentIndex
                                            ? TOKEN.accent
                                            : 'rgba(255,255,255,0.35)',
                                        transition: 'width 0.4s ease, background 0.4s ease, transform 0.2s ease',
                                        cursor: 'pointer',
                                        transform: hoveredDot === i && i !== currentIndex
                                            ? 'scale(1.2)'
                                            : 'scale(1)',
                                    } satisfies React.CSSProperties}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        pointerEvents: 'none',
                    } satisfies React.CSSProperties}
                >
                    <span style={{
                        color: TOKEN.accent,
                        fontSize: '1.2rem',
                        animation: 'heroArrowBounce 1.8s ease-in-out infinite',
                    } satisfies React.CSSProperties}>↓</span>
                    <span style={{
                        fontFamily: TOKEN.fontBody,
                        fontSize: '0.6rem',
                        letterSpacing: '0.25em',
                        color: TOKEN.textMuted,
                        textTransform: 'uppercase',
                    } satisfies React.CSSProperties}>SCROLL</span>
                </div>

            </section>
        </>
    );
}