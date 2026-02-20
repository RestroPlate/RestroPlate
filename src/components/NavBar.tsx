import React, { useEffect, useState } from 'react';

const TOKEN = {
    bgDeep: '#0B1A08',
    accent: '#7DC542',
    textPrimary: '#F0EBE1',
    textMuted: 'rgba(240,235,225,0.55)',
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
    const [hoveredLogo, setHoveredLogo] = useState(false);
    const [hoveredBtn, setHoveredBtn] = useState(false);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    useEffect((): (() => void) => {
        const handleScroll = (): void => {
            if (menuOpen) setMenuOpen(false);
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return (): void => window.removeEventListener('scroll', handleScroll);
    }, [menuOpen]);

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
        cursor: 'pointer',
    };

    const leafStyle: React.CSSProperties = {
        display: 'inline-block',
        transition: 'transform 0.3s ease',
        transform: hoveredLogo ? 'rotate(-15deg) scale(1.15)' : 'rotate(0deg) scale(1)',
    };

    const getLinkWrapStyle = (): React.CSSProperties => ({
        position: 'relative',
        display: 'inline-block',
        cursor: 'pointer',
    });

    const getLinkStyle = (label: string): React.CSSProperties => ({
        fontFamily: TOKEN.fontBody,
        fontSize: '0.85rem',
        fontWeight: 600,
        color: hoveredLink === label ? TOKEN.textPrimary : TOKEN.textMuted,
        textDecoration: 'none',
        transition: 'color 0.25s ease',
        letterSpacing: '0.02em',
        display: 'block',
        paddingBottom: '3px',
    });

    const getUnderlineStyle = (label: string): React.CSSProperties => ({
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: TOKEN.accent,
        transformOrigin: 'left',
        transform: hoveredLink === label ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.25s ease',
        borderRadius: '1px',
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
        marginLeft: '8px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: hoveredBtn ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hoveredBtn ? '0 8px 24px rgba(125,197,66,0.4)' : 'none',
    };

    // hamburger span transforms
    const bar1: React.CSSProperties = {
        transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none',
        transition: 'transform 0.3s ease',
    };
    const bar2: React.CSSProperties = {
        opacity: menuOpen ? 0 : 1,
        transition: 'opacity 0.3s ease',
    };
    const bar3: React.CSSProperties = {
        transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
        transition: 'transform 0.3s ease',
    };

    return (
        <nav style={navStyle} aria-label="Main navigation">
            {/* Main row */}
            <a
                href="#"
                style={logoStyle}
                onMouseEnter={() => setHoveredLogo(true)}
                onMouseLeave={() => setHoveredLogo(false)}
            >
                <span role="img" aria-label="leaf" style={leafStyle}>🍃</span>
                RestroPlate
            </a>

            {/* Desktop links */}
            <div className="nav-links">
                {NAV_LINKS.map(({ label, href }) => (
                    <div
                        key={label}
                        style={getLinkWrapStyle()}
                        onMouseEnter={() => setHoveredLink(label)}
                        onMouseLeave={() => setHoveredLink(null)}
                    >
                        <a href={href} style={getLinkStyle(label)}>{label}</a>
                        <div style={getUnderlineStyle(label)} aria-hidden="true" />
                    </div>
                ))}
                <button
                    className="nav-join-btn"
                    style={btnStyle}
                    type="button"
                    onMouseEnter={() => setHoveredBtn(true)}
                    onMouseLeave={() => setHoveredBtn(false)}
                >
                    JOIN FREE
                </button>
            </div>

            {/* Hamburger (mobile) */}
            <button
                className="mobile-menu-btn"
                type="button"
                onClick={() => setMenuOpen(prev => !prev)}
                aria-label="Toggle menu"
            >
                <span style={bar1} />
                <span style={bar2} />
                <span style={bar3} />
            </button>

            {/* Mobile drawer */}
            <div className={`mobile-nav-drawer${menuOpen ? ' open' : ''}`}>
                {NAV_LINKS.map(({ label, href }) => (
                    <a
                        key={label}
                        href={href}
                        className="mobile-nav-link"
                        onClick={() => setMenuOpen(false)}
                    >
                        {label}
                    </a>
                ))}
                <button
                    className="mobile-join-btn"
                    type="button"
                    onClick={() => setMenuOpen(false)}
                >
                    JOIN FREE
                </button>
            </div>
        </nav>
    );
}
