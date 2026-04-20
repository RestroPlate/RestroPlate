import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PANELS = [
  {
    img: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=900&q=85",
    tag: "For Distribution Centers",
    headline: "Browse Available Donations",
    subline: "Find surplus food near you and claim it for your community.",
    cta: "Explore Donations",
    href: "/join",
  },
  {
    img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=85",
    tag: "For Donors",
    headline: "List Your Surplus Food",
    subline: "Turn leftover meals into community impact in under 60 seconds.",
    cta: "Start Donating",
    href: "/join",
  },
  {
    img: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=900&q=85",
    tag: "Community Impact",
    headline: "Every Plate Matters",
    subline: "Packed meals, shared resources, and real connections — made possible together.",
    cta: "Join the Network",
    href: "/join",
  },
];

export function PhotoStrip() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <section
      aria-label="Food donation panels"
      className="bg-[#0B1A08]"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[3px]">
        {PANELS.map((panel, i) => (
          <div
            key={panel.tag}
            className="relative overflow-hidden cursor-pointer"
            style={{ height: "420px" }}
            role="img"
            aria-label={panel.headline}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
            onTouchStart={() => setHoveredCard(i)}
            onTouchEnd={() => setHoveredCard(null)}
            onClick={() => navigate(panel.href)}
          >
            {/* Background image */}
            <img
              src={panel.img}
              alt={panel.headline}
              className="absolute inset-0 w-full h-full object-cover block transition-[transform,filter] duration-700"
              style={{
                filter: hoveredCard === i ? "brightness(0.45)" : "brightness(0.35)",
                transform: hoveredCard === i ? "scale(1.06)" : "scale(1)",
              }}
            />

            {/* Gradient */}
            <div
              aria-hidden="true"
              className="absolute inset-0 transition-[background] duration-500"
              style={{
                background: hoveredCard === i
                  ? "linear-gradient(to top, rgba(11,26,8,0.92) 0%, rgba(11,26,8,0.3) 60%, transparent 100%)"
                  : "linear-gradient(to top, rgba(11,26,8,0.85) 0%, rgba(11,26,8,0.2) 55%, transparent 100%)",
              }}
            />

            {/* Green accent bar — visible on hover */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-500"
              style={{
                background: "#7DC542",
                opacity: hoveredCard === i ? 1 : 0,
                transform: hoveredCard === i ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
              }}
            />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              {/* Tag */}
              <span
                className="inline-block text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#7DC542] bg-[#7DC542]/12 border border-[#7DC542]/25 rounded-full px-3 py-1 mb-4 transition-all duration-300"
                style={{ opacity: hoveredCard === i ? 1 : 0.7 }}
              >
                {panel.tag}
              </span>

              {/* Headline */}
              <h3
                className="text-[1.45rem] font-black text-[#F0EBE1] mb-2 leading-[1.2] transition-colors duration-300"
                style={{ color: hoveredCard === i ? "#ffffff" : "#F0EBE1" }}
              >
                {panel.headline}
              </h3>

              {/* Subline */}
              <p
                className="text-[0.82rem] text-[#F0EBE1]/60 leading-[1.6] mb-5 transition-all duration-300"
                style={{
                  maxHeight: hoveredCard === i ? "80px" : "0px",
                  overflow: "hidden",
                  opacity: hoveredCard === i ? 1 : 0,
                }}
              >
                {panel.subline}
              </p>

              {/* CTA */}
              <span
                className="flex items-center gap-2 text-[0.78rem] font-bold text-[#7DC542] uppercase tracking-[0.14em] transition-all duration-300"
                style={{ opacity: hoveredCard === i ? 1 : 0.5 }}
              >
                {panel.cta}
                <ArrowRight
                  size={14}
                  style={{
                    transform: hoveredCard === i ? "translateX(4px)" : "translateX(0)",
                    transition: "transform 0.3s ease",
                  }}
                />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
