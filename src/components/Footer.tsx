import React, { useState } from 'react';

const TOKEN = {
    bgFooter: '#060C05',
    accent: '#7DC542',
    textPrimary: '#F0EBE1',
    textMuted: 'rgba(240,235,225,0.45)',
    fontDisplay: "'Roboto', sans-serif",
    fontBody: "'Nunito', sans-serif",
} as const;

const FOOTER_LINKS: { label: string; href: string }[] = [
    { label: 'Privacy', href: '#privacy' },
    { label: 'Terms', href: '#terms' },
    { label: 'Contact', href: '#contact' },
];

export function Footer() {
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    const footerStyle: React.CSSProperties = {
        background: TOKEN.bgFooter,
        borderTop: '1px solid rgba(125,197,66,0.1)',
        padding: '48px 5vw',
    };

    const innerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto',
        flexWrap: 'wrap' as const,
        gap: '20px',
    };

    const logoStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: TOKEN.accent,
        fontFamily: TOKEN.fontDisplay,
        fontSize: '1.2rem',
        fontWeight: 700,
        textDecoration: 'none',
    };

    const copyrightStyle: React.CSSProperties = {
        fontFamily: TOKEN.fontBody,
        fontSize: '0.82rem',
        color: TOKEN.textMuted,
        textAlign: 'center',
    };

    const navStyle: React.CSSProperties = {
        display: 'flex',
        gap: '28px',
    };

    const getLinkStyle = (label: string): React.CSSProperties => ({
        fontFamily: TOKEN.fontBody,
        fontSize: '0.82rem',
        fontWeight: 600,
        color: hoveredLink === label ? TOKEN.accent : TOKEN.textMuted,
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        cursor: 'pointer',
    });

    return (
        <footer style={footerStyle} aria-label="Footer">
            <div style={innerStyle}>
                <a href="#" style={logoStyle}>
                    <span role="img" aria-label="leaf">🍃</span>
                    RestroPlate
                </a>

                <p style={copyrightStyle}>
                    © 2026 FoodShare Connect · RestroPlate. All rights reserved.
                </p>

                <nav style={navStyle} aria-label="Footer navigation">
                    {FOOTER_LINKS.map(({ label, href }) => (
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
                </nav>
            </div>
        </footer>
    );
}
