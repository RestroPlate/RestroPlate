import React, { useEffect, useState } from 'react';

const TOKEN = {
    bgDeep: '#0B1A08',
    accent: '#7DC542',
    textPrimary: '#F0EBE1',
    textMuted: 'rgba(240,235,225,0.55)',
    border: 'rgba(125,197,66,0.13)',
    fontDisplay: "'Roboto', sans-serif",
    fontBody: "'Nunito', sans-serif",
} as const;

const NAV_LINKS: { label: string; href: string }[] = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Impact', href: '#impact' },
    { label: 'Partners', href: '#partners' },
    { label: 'Stories', href: '#stories' },
];

export function NavBar() {
    const [scrolled, setScrolled] = useState(false);
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 5vw',
        background: scrolled ? 'rgba(11,26,8,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(125,197,66,0.15)' : '1px solid transparent',
        transition: 'background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease',
    };

    const logoStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: TOKEN.accent,
        fontFamily: TOKEN.fontDisplay,
        fontSize: '1.35rem',
        fontWeight: 700,
        textDecoration: 'none',
        letterSpacing: '-0.01em',
    };

    const linksContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
    };

    const getLinkStyle = (label: string): React.CSSProperties => ({
        fontFamily: TOKEN.fontBody,
        fontSize: '0.85rem',
        fontWeight: 600,
        color: hoveredLink === label ? TOKEN.textPrimary : TOKEN.textMuted,
        textDecoration: 'none',
        transition: 'color 0.35s ease',
        cursor: 'pointer',
        letterSpacing: '0.02em',
    });

    const btnStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.8rem',
        fontWeight: 800,
        letterSpacing: '0.1em',
        color: TOKEN.bgDeep,
        background: TOKEN.accent,
        border: 'none',
        borderRadius: '6px',
        padding: '10px 22px',
        cursor: 'pointer',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        marginLeft: '8px',
    };

    return (
        <nav style={navStyle} aria-label="Main navigation">
            <a href="#" style={logoStyle}>
                <span role="img" aria-label="leaf">🍃</span>
                RestroPlate
            </a>

            <div style={linksContainerStyle}>
                {NAV_LINKS.map(({ label, href }) => (
                    <a
                        key={label}
                        href={href}
                        style={getLinkStyle(label)}
                        onMouseEnter={() => setHoveredLink(label)}
                        onMouseLeave={() => setHoveredLink(null)}
                    >
                        {label}
                    </a>
                ))}
                <button
                    style={btnStyle}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.opacity = '0.88';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                    }}
                    type="button"
                >
                    JOIN FREE
                </button>
            </div>
        </nav>
    );
}
