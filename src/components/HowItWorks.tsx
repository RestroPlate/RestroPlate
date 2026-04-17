import { useReveal } from "./hooks/useReveal";
import React, { useState } from "react";
import { Search, LayoutList, PackageCheck, ArrowRight } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: <Search size={28} strokeWidth={1.75} />,
    title: "Browse Donations",
    desc: "Open RestroPlate and explore available food donations listed by restaurants, caterers, and households near you in real time.",
    color: "#7DC542",
  },
  {
    n: "02",
    icon: <LayoutList size={28} strokeWidth={1.75} />,
    title: "See Available Donations",
    desc: "View detailed listings for each available donation — food type, quantity, pickup address, and availability window — all on one screen.",
    color: "#5FA832",
  },
  {
    n: "03",
    icon: <PackageCheck size={28} strokeWidth={1.75} />,
    title: "Pick Up",
    desc: "Confirm your pickup through the platform and collect the food at the listed address within the available time window. No waste, no waiting.",
    color: "#7DC542",
  },
];

export function HowItWorks() {
  const [ref, visible] = useReveal(0.1);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="how-it-works"
      aria-label="How it works"
      className="bg-[#111A0F] py-[100px] px-[5vw]"
    >
      {/* Header */}
      <div className="text-center mb-16">
        <span className="text-[0.75rem] font-semibold tracking-[0.22em] text-[#7DC542] mb-4 uppercase block">
          THE PROCESS
        </span>
        <h2
          className="font-extrabold tracking-[-0.02em] leading-[1.08] text-[#F0EBE1] mb-4"
          style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)" }}
        >
          How RestroPlate Works
        </h2>
        <p className="text-[#F0EBE1]/45 text-base max-w-xl mx-auto leading-relaxed">
          Three simple steps from surplus food to a meal on the table.
        </p>
      </div>

      {/* Steps — horizontal connected layout */}
      <div className="max-w-[1000px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">

          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-[52px] left-[calc(33.33%+32px)] right-[calc(33.33%+32px)] h-[1px] bg-[#7DC542]/20 z-0" />
          <div className="hidden md:block absolute top-[52px] left-[calc(66.66%-32px+64px)] w-[calc(33.33%-64px)] h-[1px] bg-[#7DC542]/20 z-0" />

          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className="relative flex flex-col items-center text-center px-6 py-2 cursor-default"
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(28px)",
                transition: `opacity 0.7s ease ${i * 0.15}s, transform 0.5s ease ${i * 0.15}s`,
              }}
            >
              {/* Step number + icon circle */}
              <div
                className="relative z-10 mb-8 flex flex-col items-center"
              >
                <div
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-300 border-2"
                  style={{
                    background: hoveredStep === i ? "#7DC542" : "rgba(125,197,66,0.08)",
                    borderColor: hoveredStep === i ? "#7DC542" : "rgba(125,197,66,0.25)",
                    color: hoveredStep === i ? "#0B1A08" : "#7DC542",
                    boxShadow: hoveredStep === i ? "0 0 40px rgba(125,197,66,0.3)" : "none",
                    transform: hoveredStep === i ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {step.icon}
                </div>
                <span className="mt-3 text-[0.65rem] font-black tracking-[0.2em] text-[#7DC542]/40 uppercase">
                  Step {step.n}
                </span>
              </div>

              {/* Text */}
              <div
                className="rounded-xl p-6 w-full transition-all duration-300"
                style={{
                  background: hoveredStep === i ? "rgba(125,197,66,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${hoveredStep === i ? "rgba(125,197,66,0.3)" : "rgba(125,197,66,0.1)"}`,
                }}
              >
                <h3 className="text-[1.15rem] font-extrabold text-[#F0EBE1] mb-3 flex items-center justify-center gap-2">
                  {step.title}
                  {i < STEPS.length - 1 && (
                    <ArrowRight
                      size={14}
                      className="hidden md:block text-[#7DC542]/30"
                    />
                  )}
                </h3>
                <p className="text-[0.88rem] leading-[1.7] text-[rgba(240,235,225,0.5)]">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
