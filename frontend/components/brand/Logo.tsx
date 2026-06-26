"use client";

import { useEffect, useId, useState } from "react";

type LogoProps = {
  /** sm = 180px, md = 320px, lg = 480px wide (mark is always 64px square) */
  size?: "sm" | "md" | "lg";
  /** "full" shows the wordmark, "mark" shows only the AQAS circle */
  variant?: "full" | "mark";
  /** turn the animation on/off (also auto-disabled for prefers-reduced-motion) */
  animated?: boolean;
  /** wordmark color override; defaults adapt via currentColor */
  className?: string;
};

const WIDTHS = { sm: 180, mark: 64, md: 320, lg: 480 } as const;

/** Disable animation when the OS asks for reduced motion. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * AQAS animated logo for Al Qalam Auto Shop.
 * Gradient: electric red -> magenta -> blue, with an orbiting ring.
 * Pure SVG + SMIL, no external deps. Theme-aware wordmark via currentColor.
 */
export default function Logo({
  size = "md",
  variant = "full",
  animated = true,
  className = "",
}: LogoProps) {
  const reduced = usePrefersReducedMotion();
  const play = animated && !reduced;

  // unique gradient id so multiple logos on one page don't collide
  const gid = useId().replace(/:/g, "");
  const width = variant === "mark" ? WIDTHS.mark : WIDTHS[size];

  const Grad = (
    <linearGradient id={`aqas-${gid}`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E31937" />
      <stop offset="55%" stopColor="#9B1C8E" />
      <stop offset="100%" stopColor="#2563EB" />
      {play && (
        <>
          <animate attributeName="x1" values="0%;30%;0%" dur="6s" repeatCount="indefinite" />
          <animate attributeName="x2" values="100%;130%;100%" dur="6s" repeatCount="indefinite" />
        </>
      )}
    </linearGradient>
  );

  if (variant === "mark") {
    return (
      <svg
        width={width}
        height={width}
        viewBox="0 0 256 256"
        className={className}
        role="img"
        aria-label="AQAS — Al Qalam Auto Shop"
      >
        <defs>{Grad}</defs>
        <circle cx="128" cy="128" r="92" fill="none" stroke={`url(#aqas-${gid})`} strokeWidth="4" opacity="0.35">
          {play && (
            <animateTransform attributeName="transform" type="rotate" from="0 128 128" to="360 128 128" dur="14s" repeatCount="indefinite" />
          )}
        </circle>
        <circle cx="128" cy="128" r="92" fill="none" stroke={`url(#aqas-${gid})`} strokeWidth="4" strokeDasharray="44 540" strokeLinecap="round">
          {play && (
            <animateTransform attributeName="transform" type="rotate" from="360 128 128" to="0 128 128" dur="5s" repeatCount="indefinite" />
          )}
        </circle>
        <text x="128" y="156" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight={700} fontSize="60" letterSpacing="-2" fill={`url(#aqas-${gid})`}>
          AQAS
        </text>
      </svg>
    );
  }

  return (
    <svg
      width={width}
      viewBox="0 0 680 360"
      className={className}
      role="img"
      aria-label="AQAS — Al Qalam Auto Shop, Sharjah UAE"
    >
      <defs>{Grad}</defs>

      <circle cx="340" cy="150" r="92" fill="none" stroke={`url(#aqas-${gid})`} strokeWidth="3" opacity="0.35">
        {play && (
          <animateTransform attributeName="transform" type="rotate" from="0 340 150" to="360 340 150" dur="14s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx="340" cy="150" r="92" fill="none" stroke={`url(#aqas-${gid})`} strokeWidth="3" strokeDasharray="40 540" strokeLinecap="round">
        {play && (
          <animateTransform attributeName="transform" type="rotate" from="360 340 150" to="0 340 150" dur="5s" repeatCount="indefinite" />
        )}
      </circle>

      {["A", "Q", "A", "S"].map((ch, i) => (
        <text
          key={i}
          x={296 + i * 44}
          y="172"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight={600}
          fontSize="84"
          letterSpacing="2"
          fill={`url(#aqas-${gid})`}
        >
          {ch}
          {play && (
            <>
              <animate attributeName="opacity" values="0;1" dur="0.5s" begin={`${i * 0.18}s`} fill="freeze" />
              <animateTransform attributeName="transform" type="translate" values="0 18;0 0" dur="0.5s" begin={`${i * 0.18}s`} fill="freeze" />
            </>
          )}
        </text>
      ))}

      {/* Wordmark uses currentColor so it adapts to light/dark via the parent text color */}
      <text x="340" y="280" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight={600} fontSize="22" letterSpacing="6" fill="currentColor">
        AL QALAM AUTO SHOP
        {play && <animate attributeName="opacity" values="0;1" dur="0.8s" begin="0.9s" fill="freeze" />}
      </text>
      <text x="340" y="306" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight={400} fontSize="12" letterSpacing="3" fill="currentColor" opacity="0.6">
        SHARJAH · UAE
        {play && <animate attributeName="opacity" values="0;0.6" dur="0.8s" begin="1.1s" fill="freeze" />}
      </text>
    </svg>
  );
}
