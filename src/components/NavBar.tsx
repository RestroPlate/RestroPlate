import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from "../services/authService";

const NAV_LINKS: { label: string; href: string }[] = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Impact', href: '#impact' },
    { label: 'Partners', href: '#partners' },
    { label: 'Stories', href: '#stories' },
];

export function NavBar() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const user = getCurrentUser();
    const isLoggedIn = user !== null;
    const dashboardPath = user?.role === "DONOR" ? "/dashboard/donor" : "/dashboard/center";
    const ctaLabel = isLoggedIn ? "DASHBOARD" : "JOIN FREE";
    const ctaTarget = isLoggedIn ? dashboardPath : "/join";

    useEffect((): (() => void) => {
        const handleScroll = (): void => {
            if (menuOpen) setMenuOpen(false);
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return (): void => window.removeEventListener('scroll', handleScroll);
    }, [menuOpen]);

    return (
        <nav
            aria-label="Main navigation"
            className={[
                'fixed top-0 left-0 right-0 z-[100] h-[68px] flex items-center justify-between px-[5vw] transition-[background,backdrop-filter,border-color] duration-[350ms] ease-in-out border-b',
                scrolled
                    ? 'bg-[rgba(11,26,8,0.92)] backdrop-blur-[14px] border-[rgba(125,197,66,0.15)]'
                    : 'bg-transparent border-transparent',
            ].join(' ')}
        >
            {/* Logo */}
            <a
                href="#"
                className="flex items-center gap-2.5 text-[#7DC542] text-[1.35rem] font-bold no-underline tracking-[-0.01em] cursor-pointer group"
            >
                <span
                    role="img"
                    aria-label="leaf"
                    className="inline-block transition-transform duration-300 group-hover:rotate-[-15deg] group-hover:scale-[1.15]"
                >
                    🍃
                </span>
                RestroPlate
            </a>

            {/* Desktop links */}
            <div className="hidden md:flex gap-9 items-center">
                {NAV_LINKS.map(({ label, href }) => (
                    <div key={label} className="relative inline-block group cursor-pointer">
                        <a
                            href={href}
                            className="text-[0.85rem] font-semibold text-[rgba(240,235,225,0.55)] no-underline tracking-[0.02em] block pb-[3px] transition-colors duration-[250ms] hover:text-[#F0EBE1]"
                        >
                            {label}
                        </a>
                        {/* Underline */}
                        <div
                            aria-hidden="true"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7DC542] rounded-[1px] origin-left scale-x-0 transition-transform duration-[250ms] group-hover:scale-x-100"
                        />
                    </div>
                ))}
                <button
                    type="button"
                    className="text-[0.8rem] font-extrabold tracking-[0.1em] text-[#0B1A08] bg-[#7DC542] border-none rounded-[6px] px-[22px] py-[10px] ml-2 cursor-pointer transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(125,197,66,0.4)]"
                    onClick={() => navigate(ctaTarget)}
                >
                    {ctaLabel}
                </button>
            </div>

            {/* Hamburger (mobile) */}
            <button
                type="button"
                className="flex md:hidden flex-col gap-[5px] p-2 cursor-pointer bg-transparent border-none"
                onClick={() => setMenuOpen(prev => !prev)}
                aria-label="Toggle menu"
            >
                <span
                    className="block w-6 h-[2px] bg-[#F0EBE1] rounded-[2px] transition-transform duration-300"
                    style={{ transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }}
                />
                <span
                    className="block w-6 h-[2px] bg-[#F0EBE1] rounded-[2px] transition-opacity duration-300"
                    style={{ opacity: menuOpen ? 0 : 1 }}
                />
                <span
                    className="block w-6 h-[2px] bg-[#F0EBE1] rounded-[2px] transition-transform duration-300"
                    style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }}
                />
            </button>

            {/* Mobile drawer */}
            <div
                className={[
                    'fixed top-[68px] left-0 right-0 z-[99] flex flex-col',
                    'px-[5vw] pb-8 pt-0',
                    'border-b border-[rgba(125,197,66,0.15)]',
                    'bg-[rgba(11,26,8,0.98)] backdrop-blur-[20px]',
                    'transition-transform duration-[350ms] ease-in-out',
                    menuOpen ? 'translate-y-0' : '-translate-y-[150%]',
                ].join(' ')}
            >
                {NAV_LINKS.map(({ label, href }) => (
                    <a
                        key={label}
                        href={href}
                        className="text-[1.1rem] text-[rgba(240,235,225,0.8)] no-underline py-4 border-b border-[rgba(125,197,66,0.08)] last:border-b-0 transition-colors duration-200 hover:text-[#7DC542]"
                        onClick={() => setMenuOpen(false)}
                    >
                        {label}
                    </a>
                ))}
                <button
                    type="button"
                    className="mt-5 bg-[#7DC542] text-[#0B1A08] border-none rounded-lg py-[14px] font-extrabold text-[0.95rem] tracking-[0.06em] cursor-pointer w-full"
                    onClick={() => { setMenuOpen(false); navigate(ctaTarget); }}
                >
                    {ctaLabel}
                </button>
            </div>
        </nav>
    );
}
