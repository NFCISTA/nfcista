"use client";

import { useState } from "react";

export default function ExperienceDemo() {
  const [activeId, setActiveId] = useState("reviews");

  const experiences = [
    {
      id: "reviews",
      tag: "EXP-01",
      title: "Get more reviews",
      description: "Direct jump to your Google review form with zero typing.",
      screen: "review",
    },
    {
      id: "menu",
      tag: "EXP-02",
      title: "Show your menu",
      description: "Instant contactless digital menu and specials on their browser.",
      screen: "menu",
    },
    {
      id: "social",
      tag: "EXP-03",
      title: "Grow your following",
      description: "Single tap opens Instagram, WhatsApp, and social channels.",
      screen: "social",
    },
    {
      id: "orders",
      tag: "EXP-04",
      title: "Take more orders",
      description: "Pre-filled WhatsApp message ready for direct customer checkout.",
      screen: "orders",
    },
  ];

  return (
    <section id="demo" className="py-24 md:py-32 bg-ink border-b border-line">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="font-mono text-xs uppercase tracking-wider text-brand-text mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            <span>Interactive Tap Simulation</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-fg tracking-[-0.035em]">
            See exactly what your customer sees.
          </h2>
          <p className="font-sans text-sm sm:text-base text-muted mt-3">
            Choose a customer objective below to preview the mobile destination that loads immediately on tap.
          </p>
        </div>

        {/* Two-Column Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: 4 Selectable Buttons */}
          <div className="lg:col-span-6 flex flex-col gap-3" role="tablist" aria-label="NFC experience options">
            {experiences.map((exp) => {
              const isActive = activeId === exp.id;
              return (
                <button
                  key={exp.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-pressed={isActive}
                  onClick={() => setActiveId(exp.id)}
                  className={`w-full text-left p-5 sm:p-6 rounded-2xl transition-all border text-left ${
                    isActive
                      ? "bg-ink-alt border-line border-l-[3px] border-l-brand shadow-lg"
                      : "bg-transparent border-transparent hover:bg-ink-alt/50 hover:border-line/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-dim">
                      {exp.tag}
                    </span>
                    {isActive && (
                      <span className="font-mono text-[10px] text-brand-text uppercase tracking-widest font-semibold flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-brand" />
                        Active Demo
                      </span>
                    )}
                  </div>
                  <div className="font-display text-lg sm:text-xl font-bold text-fg mb-1">
                    {exp.title}
                  </div>
                  <div className="font-sans text-xs sm:text-sm text-muted">
                    {exp.description}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Phone Mockup Screen */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <div className="w-[300px] sm:w-[320px] aspect-[1/2] rounded-[38px] bg-ink-alt border-[2px] border-line p-3 shadow-2xl relative select-none">
              {/* Phone Speaker Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full bg-ink flex items-center justify-center gap-2 z-20">
                <div className="w-2 h-2 rounded-full bg-dim/40" />
                <div className="w-10 h-1.5 rounded-full bg-dim/20" />
              </div>

              {/* Internal Screen Area */}
              <div className="w-full h-full rounded-[28px] bg-canvas border border-line text-text-primary overflow-hidden flex flex-col justify-between pt-10 pb-5 px-4 relative">
                {/* 1. Review Screen */}
                {activeId === "reviews" && (
                  <div className="space-y-4 animate-fadeUp flex flex-col justify-between h-full">
                    <div className="text-center pt-2">
                      <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 border border-amber-200 mx-auto flex items-center justify-center font-bold text-lg mb-2">
                        ★
                      </div>
                      <div className="font-bold text-sm text-slate-900">Your Shop Name</div>
                      <div className="text-[11px] text-slate-500">Google Business Profile</div>
                      <div className="flex justify-center gap-1 text-amber-400 text-lg my-2">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                      </div>
                      <p className="text-[11px] text-slate-600 px-2 leading-relaxed">
                        Share your experience with the community. It takes 10 seconds.
                      </p>
                    </div>

                    <div className="space-y-2 mt-auto">
                      <div className="w-full py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold text-center shadow-sm">
                        Leave a review
                      </div>
                      <div className="text-[10px] text-center text-slate-400">
                        Zero sign-up required for Android / iOS
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Menu Screen */}
                {activeId === "menu" && (
                  <div className="space-y-3 animate-fadeUp flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                        <span className="font-bold text-xs text-slate-900">Daily Specials</span>
                        <span className="text-[10px] text-slate-400 font-mono">AUTUMN</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-medium text-slate-800">[ITEM NAME]</span>
                          <span className="font-mono text-slate-600 font-semibold">[PRICE]</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-medium text-slate-800">[ITEM NAME]</span>
                          <span className="font-mono text-slate-600 font-semibold">[PRICE]</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-medium text-slate-800">[ITEM NAME]</span>
                          <span className="font-mono text-slate-600 font-semibold">[PRICE]</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold text-center mt-auto">
                      View Full PDF Menu
                    </div>
                  </div>
                )}

                {/* 3. Social Screen */}
                {activeId === "social" && (
                  <div className="space-y-2.5 animate-fadeUp flex flex-col justify-between h-full">
                    <div className="text-center pt-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center font-bold text-slate-700 text-sm mb-2">
                        LOGO
                      </div>
                      <div className="font-bold text-sm text-slate-900">@yourshop</div>
                      <div className="text-[11px] text-slate-500">Official Channels</div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800">
                        <span>Instagram Profile</span>
                        <span className="text-accent-primary font-bold">→</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800">
                        <span>Save Contact Card</span>
                        <span className="text-accent-primary font-bold">→</span>
                      </div>
                    </div>

                    <div className="w-full py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold text-center mt-auto">
                      Follow &amp; Connect
                    </div>
                  </div>
                )}

                {/* 4. Orders Screen */}
                {activeId === "orders" && (
                  <div className="space-y-3 animate-fadeUp flex flex-col justify-between h-full">
                    <div className="pt-2">
                      <div className="text-xs font-bold text-slate-900 mb-1">Direct Chat &amp; Orders</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                        Connects customer straight to your verified WhatsApp chat.
                      </p>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed">
                        "Hi, I would like to place an order from your shop."
                      </div>
                    </div>

                    <div className="space-y-2 mt-auto">
                      <div className="w-full py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-semibold text-center shadow-sm">
                        Order on WhatsApp
                      </div>
                      <div className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-semibold text-center border border-slate-200">
                        View catalog
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
