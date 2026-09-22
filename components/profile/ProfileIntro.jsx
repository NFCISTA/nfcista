"use client";

import { useEffect, useState } from "react";

export default function ProfileIntro({ name }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const timer = setTimeout(
      () => {
        setVisible(false);
      },
      reducedMotion ? 700 : 1850
    );

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style jsx>{`
        @keyframes introBackground {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.08);
          }
        }

        @keyframes introLogo {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.92);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes introText {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes introName {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
            filter: blur(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes introTagline {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes introGlow {
          from {
            opacity: 0.25;
            transform: scale(0.8);
          }
          to {
            opacity: 0.55;
            transform: scale(1.15);
          }
        }

        @keyframes introExit {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        .intro-background {
          animation: introBackground 2.2s ease-out forwards;
        }

        .intro-logo {
          opacity: 0;
          animation: introLogo 550ms cubic-bezier(0.22, 1, 0.36, 1)
            120ms forwards;
        }

        .intro-hi {
          opacity: 0;
          animation: introText 500ms cubic-bezier(0.22, 1, 0.36, 1)
            420ms forwards;
        }

        .intro-name {
          opacity: 0;
          animation: introName 700ms cubic-bezier(0.22, 1, 0.36, 1)
            560ms forwards;
        }

        .intro-tagline {
          opacity: 0;
          animation: introTagline 500ms ease-out 1050ms forwards;
        }

        .intro-glow {
          animation: introGlow 1.8s ease-in-out infinite alternate;
        }

        .intro-overlay {
          animation: introExit 400ms ease-in 1450ms forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .intro-background,
          .intro-logo,
          .intro-hi,
          .intro-name,
          .intro-tagline,
          .intro-glow,
          .intro-overlay {
            animation: none !important;
          }

          .intro-logo,
          .intro-hi,
          .intro-name,
          .intro-tagline {
            opacity: 1;
          }
        }
      `}</style>

      <div className="intro-overlay fixed inset-0 z-[9999] overflow-hidden bg-[#071426]">
        {/* Cinematic background */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-mountains.jpg"
            alt=""
            aria-hidden="true"
            className="intro-background h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-[#041126]/80 via-[#071426]/60 to-[#020817]" />

          {/* Atmospheric depth: seamless soft dark gradient behind typography */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_48%,rgba(3,11,24,0.78)_0%,rgba(3,11,24,0.5)_50%,transparent_90%)] pointer-events-none" />

          {/* Soft atmospheric blue glow behind name/tagline area */}
          <div
            className="intro-glow absolute left-1/2 top-[46%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-[100px] pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 text-center text-white">
          <div className="flex flex-col items-center">

            {/* NFCISTA logo */}
            <div className="intro-logo mb-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-xl">
                <span
                  className="material-symbols-outlined text-[22px] text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  nfc
                </span>
              </div>

              <span className="text-[15px] font-semibold tracking-[0.18em]">
                NFCISTA
              </span>
            </div>

            {/* Greeting */}
            <p className="intro-hi text-[12px] font-semibold uppercase tracking-[0.26em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Hi, I&apos;m
            </p>

            {/* Customer name */}
            <h1 className="intro-name mt-3 max-w-[90vw] text-4xl font-semibold tracking-[-0.03em] sm:text-5xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              {name}
            </h1>

            {/* Divider */}
            <div className="intro-tagline mt-7 flex items-center gap-3">
              <span className="h-px w-8 bg-white/35" />

              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/90 drop-shadow-[0_1px_8px_rgba(147,197,253,0.45)]">
                Tap · Connect · Grow
              </p>

              <span className="h-px w-8 bg-white/35" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}