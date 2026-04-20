import { useReveal } from "./hooks/useReveal";
import React from "react";
import { Leaf, Users, Truck, ThumbsUp } from "lucide-react";

const STATS: { value: string; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "120K+",
    label: "Meals Rescued",
    icon: <Leaf size={22} />,
    description: "Surplus meals saved from landfill and delivered to people in need",
  },
  {
    value: "840+",
    label: "Partner Restaurants",
    icon: <Users size={22} />,
    description: "Verified food donors actively listing surplus daily",
  },
  {
    value: "12T",
    label: "CO₂ Avoided",
    icon: <Truck size={22} />,
    description: "Kilograms of greenhouse gas prevented through food rescue",
  },
  {
    value: "98%",
    label: "Satisfaction Rate",
    icon: <ThumbsUp size={22} />,
    description: "Donors and recipients rate their RestroPlate experience",
  },
];

export function StatsBar() {
  const [ref, visible] = useReveal(0.2);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="impact"
      aria-label="Impact statistics"
      className="bg-[#0B1A08] py-16 px-[5vw] border-y border-white/5"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Section label */}
        <div className="text-center mb-10">
          <span className="text-[0.72rem] font-bold tracking-[0.22em] text-[#7DC542]/80 uppercase">
            Our Impact in Numbers
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-[#0D1F0A] px-8 py-10 flex flex-col gap-3 group hover:bg-[#111F0C] transition-colors duration-300"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s, background 0.3s ease`,
              }}
            >
              {/* Icon + value row */}
              <div className="flex items-start justify-between">
                <span
                  className="font-black text-[#7DC542] leading-none"
                  style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)" }}
                >
                  {stat.value}
                </span>
                <span className="text-[#7DC542]/40 group-hover:text-[#7DC542]/70 transition-colors duration-300 mt-1">
                  {stat.icon}
                </span>
              </div>

              {/* Label */}
              <div>
                <p className="text-[0.82rem] font-bold uppercase tracking-[0.12em] text-[#F0EBE1]/80 mb-1">
                  {stat.label}
                </p>
                <p className="text-[0.75rem] leading-[1.55] text-[#F0EBE1]/30 group-hover:text-[#F0EBE1]/45 transition-colors duration-300">
                  {stat.description}
                </p>
              </div>

              {/* Bottom accent line */}
              <div className="h-[2px] rounded-full bg-[#7DC542]/0 group-hover:bg-[#7DC542]/30 transition-all duration-500 w-0 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
