import { useEffect, useState } from 'react';

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
        <section
            className="relative z-[1] w-full min-h-screen flex flex-col bg-[#0B1A08] overflow-hidden"
            aria-label="Hero"
        >
            {/* Background image */}
            <div
                aria-hidden="true"
                className="absolute inset-0 z-0 bg-center bg-cover"
                style={{
                    backgroundImage: `url(${IMG.hero})`,
                    backgroundPosition: 'center 35%',
                    filter: 'brightness(0.25)',
                    backgroundColor: '#1a2e14',
                }}
            />

            {/* Gradient overlay */}
            <div
                aria-hidden="true"
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(11,26,8,0.88), rgba(5,15,3,0.55))' }}
            />

            {/* Decorative left bar */}
            <div
                aria-hidden="true"
                className="absolute left-[5vw] top-[20%] bottom-[20%] w-[3px] z-[2] pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent, #7DC542, transparent)' }}
            />

            {/* Content wrapper */}
            <div
                className="relative z-[3] flex-1 flex flex-row items-center justify-between w-full max-w-[1200px] mx-auto px-[5vw] pt-[100px] pb-[60px] gap-[4vw] box-border"
            >
                {/* LEFT column */}
                <div
                    className="flex-[0_0_50%] flex flex-col justify-center md:max-w-full max-w-full"
                    style={{ animation: 'fadeUp 0.8s ease 0.1s both' }}
                >
                    <p className="text-[0.75rem] font-semibold tracking-[0.22em] text-[#7DC542] mb-6 uppercase">
                        FOODSHARE CONNECT · EST. 2026
                    </p>

                    <h1
                        className="font-black tracking-[-0.02em] leading-[1.08] text-[#F0EBE1] mb-1.5"
                        style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)' }}
                    >
                        Every Plate
                        <span className="text-[#7DC542] block">Finds a Home.</span>
                    </h1>

                    <p className="text-[1.05rem] leading-[1.72] tracking-[0.01em] text-[rgba(240,235,225,0.55)] max-w-[520px] mb-10 mt-5">
                        We bridge the gap between restaurants and homes with surplus food and
                        community members facing food insecurity — one meal, one connection at a time.
                    </p>

                    <div className="flex gap-4 flex-wrap sm:flex-col">
                        <button
                            type="button"
                            className="text-[0.85rem] font-extrabold tracking-[0.1em] text-[#0B1A08] bg-[#7DC542] border-none rounded-[6px] px-8 py-[15px] cursor-pointer shadow-[0_8px_32px_rgba(125,197,66,0.35)] transition-[transform,box-shadow] duration-300 hover:-translate-y-[3px] hover:shadow-[0_14px_40px_rgba(125,197,66,0.45)]"
                        >
                            DONATE FOOD
                        </button>

                        <button
                            type="button"
                            className="text-[0.85rem] font-extrabold tracking-[0.1em] text-[#F0EBE1] bg-transparent border-2 border-[rgba(240,235,225,0.45)] rounded-[6px] px-8 py-[15px] cursor-pointer transition-[border-color,color] duration-300 hover:border-[#7DC542] hover:text-[#7DC542]"
                        >
                            FIND FOOD NEAR ME
                        </button>
                    </div>
                </div>

                {/* RIGHT column — rotating image */}
                <div
                    className="hidden md:block flex-[0_0_44%] relative h-[420px] rounded-[20px] overflow-hidden self-center flex-shrink-0 shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(125,197,66,0.2)] transition-transform duration-500"
                    aria-hidden="true"
                    onMouseEnter={(): void => setFrameHovered(true)}
                    onMouseLeave={(): void => setFrameHovered(false)}
                    style={{ transform: frameHovered ? 'scale(1.02)' : 'scale(1)' }}
                >
                    <img
                        key={currentIndex}
                        src={HERO_GALLERY[currentIndex]}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-[600ms]"
                        style={{
                            opacity: transitioning ? 0 : 1,
                            transform: transitioning ? 'scale(1.03)' : 'scale(1)',
                        }}
                    />

                    {/* Bottom gradient */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(to top, rgba(11,26,8,0.45) 0%, transparent 50%)' }}
                    />

                    {/* Dot indicators */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-[2]">
                        {HERO_GALLERY.map((_: string, i: number) => (
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
                                className="h-[7px] rounded-[4px] cursor-pointer transition-[width,background,transform] duration-[400ms]"
                                style={{
                                    width: i === currentIndex ? 24 : 7,
                                    background: i === currentIndex ? '#7DC542' : 'rgba(255,255,255,0.35)',
                                    transform: hoveredDot === i && i !== currentIndex ? 'scale(1.2)' : 'scale(1)',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div
                aria-hidden="true"
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-1.5 pointer-events-none"
            >
                <span
                    className="text-[#7DC542] text-[1.2rem]"
                    style={{ animation: 'heroArrowBounce 1.8s ease-in-out infinite' }}
                >
                    ↓
                </span>
                <span className="text-[0.6rem] tracking-[0.25em] text-[rgba(240,235,225,0.55)] uppercase">
                    SCROLL
                </span>
            </div>
        </section>
    );
}