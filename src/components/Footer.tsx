import { useState } from 'react';

const FOOTER_LINKS: { label: string; href: string }[] = [
    { label: 'Privacy', href: '#privacy' },
    { label: 'Terms', href: '#terms' },
    { label: 'Contact', href: '#contact' },
];

export function Footer() {
    const [hoveredLogo, setHoveredLogo] = useState(false);

    return (
        <>
            <div className="footer-top-line" aria-hidden="true" />
            <footer
                aria-label="Footer"
                className="bg-[#060C05] border-t border-[rgba(125,197,66,0.1)] py-12 px-[5vw]"
            >
                <div className="max-w-[1200px] mx-auto flex flex-wrap sm:flex-row flex-col justify-between items-center gap-5 sm:gap-5 text-center sm:text-left">
                    {/* Logo */}
                    <a
                        href="#"
                        className="flex items-center gap-2.5 text-[#7DC542] text-[1.2rem] font-bold no-underline cursor-pointer group"
                        onMouseEnter={() => setHoveredLogo(true)}
                        onMouseLeave={() => setHoveredLogo(false)}
                    >
                        <span
                            role="img"
                            aria-label="leaf"
                            className="inline-block transition-transform duration-300"
                            style={{ transform: hoveredLogo ? 'rotate(-15deg) scale(1.15)' : 'rotate(0deg) scale(1)' }}
                        >
                            🍃
                        </span>
                        RestroPlate
                    </a>

                    {/* Copyright */}
                    <p className="text-[0.82rem] text-[rgba(240,235,225,0.45)]">
                        © 2026 FoodShare Connect · RestroPlate. All rights reserved.
                    </p>

                    {/* Nav links */}
                    <nav aria-label="Footer navigation" className="flex gap-7">
                        {FOOTER_LINKS.map(({ label, href }) => (
                            <a
                                key={label}
                                href={href}
                                className="text-[0.82rem] font-semibold text-[rgba(240,235,225,0.45)] no-underline cursor-pointer inline-block transition-[color,transform] duration-200 hover:text-[#7DC542] hover:-translate-y-0.5"
                            >
                                {label}
                            </a>
                        ))}
                    </nav>
                </div>
            </footer>
        </>
    );
}
