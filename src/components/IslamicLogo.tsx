import React from "react";

interface IslamicLogoProps {
  className?: string;
  size?: number | string;
}

export const IslamicLogo: React.FC<IslamicLogoProps> = ({
  className = "w-16 h-16",
}) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/40 via-[#062c20] to-[#041610] p-[1.5px] shadow-lg shadow-emerald-950/80 border border-emerald-500/30 group ${className}`}
    >
      {/* Inner Emerald Container */}
      <div className="w-full h-full bg-gradient-to-b from-[#06241a] via-[#041a13] to-[#020d09] rounded-[14px] flex items-center justify-center relative overflow-hidden p-1">
        {/* Ambient Emerald Radial Glow */}
        <div className="absolute inset-0 bg-radial from-emerald-500/25 via-emerald-600/5 to-transparent pointer-events-none" />

        {/* Vector SVG Islamic AI Emblem */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(16,185,129,0.4)]"
        >
          <defs>
            {/* Primary Emerald Gradient */}
            <linearGradient id="emeraldMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="35%" stopColor="#34D399" />
              <stop offset="70%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            {/* Glowing Accent Gradient */}
            <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* 1. Outer Geometric Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#emeraldMain)"
            strokeWidth="1.8"
            strokeDasharray="3 3"
            opacity="0.5"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="url(#emeraldMain)"
            strokeWidth="1.5"
            opacity="0.85"
          />

          {/* 2. Eight-pointed Rub-el-Hizb Star Pattern (Subtle Background) */}
          <g opacity="0.25" stroke="url(#emeraldMain)" strokeWidth="1">
            <rect x="23" y="23" width="54" height="54" rx="4" />
            <rect
              x="23"
              y="23"
              width="54"
              height="54"
              rx="4"
              transform="rotate(45 50 50)"
            />
          </g>

          {/* 3. Central Islamic Crescent (Hilal) */}
          <path
            d="M 58 19 A 31 31 0 1 1 29 73 A 25 25 0 1 0 58 19 Z"
            fill="url(#emeraldMain)"
          />

          {/* 4. AI Sparkle / Star (Neural Star in the Crescent) */}
          <path
            d="M 64 28 Q 64 36 72 36 Q 64 36 64 44 Q 64 36 56 36 Q 64 36 64 28 Z"
            fill="url(#goldAccent)"
          />
          <circle cx="64" cy="36" r="1.5" fill="#FFFFFF" />

          {/* 5. Delicate Radiant Stars */}
          <circle cx="34" cy="32" r="1.6" fill="#6EE7B7" opacity="0.9" />
          <circle cx="69" cy="57" r="1.4" fill="#FBBF24" opacity="0.85" />
          <circle cx="38" cy="62" r="1.2" fill="#6EE7B7" opacity="0.75" />
        </svg>
      </div>
    </div>
  );
};
