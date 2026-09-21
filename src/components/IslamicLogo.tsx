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
      className={`relative flex items-center justify-center shrink-0 select-none overflow-hidden rounded-2xl bg-gradient-to-b from-white via-emerald-50/70 to-emerald-100/50 p-[1.5px] shadow-sm shadow-emerald-900/10 border border-emerald-200/90 group transition-all ${className}`}
    >
      {/* Inner Clean Light Emerald Container */}
      <div className="w-full h-full bg-gradient-to-b from-white to-[#f2f9f5] rounded-[14px] flex items-center justify-center relative overflow-hidden p-1">
        {/* Subtle Ambient Emerald Glow */}
        <div className="absolute inset-0 bg-radial from-emerald-500/12 via-emerald-500/5 to-transparent pointer-events-none" />

        {/* Vector SVG Islamic AI Emblem */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_1px_3px_rgba(4,120,87,0.25)]"
        >
          <defs>
            {/* Rich Royal Islamic Emerald Gradient */}
            <linearGradient id="emeraldMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="40%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>

            {/* Glowing Accent Gradient */}
            <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* 1. Outer Geometric Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#emeraldMain)"
            strokeWidth="1.6"
            strokeDasharray="3 3"
            opacity="0.55"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="url(#emeraldMain)"
            strokeWidth="1.5"
            opacity="0.85"
          />

          {/* 2. Eight-pointed Rub-el-Hizb Star Pattern */}
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
          <circle cx="34" cy="32" r="1.6" fill="#059669" opacity="0.9" />
          <circle cx="69" cy="57" r="1.4" fill="#D97706" opacity="0.95" />
          <circle cx="38" cy="62" r="1.2" fill="#059669" opacity="0.85" />
        </svg>
      </div>
    </div>
  );
};
