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

          <div className="absolute inset-0 bg-gradient-to-b from-[#041126]/70 via-[#071426]/55 to-[#020817]" />

          <div
            className="intro-glow absolute left-1/2 top-[42%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/20 blur-[90px]"
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
            <p className="intro-hi text-[11px] font-medium uppercase tracking-[0.32em] text-white/55">
              Hi, I&apos;m
            </p>

            {/* Customer name */}
            <h1 className="intro-name mt-3 max-w-[90vw] text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              {name}
            </h1>

            {/* Divider */}
            <div className="intro-tagline mt-7 flex items-center gap-3">
              <span className="h-px w-8 bg-white/20" />

              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/50">
                Tap · Connect · Grow
              </p>

              <span className="h-px w-8 bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}