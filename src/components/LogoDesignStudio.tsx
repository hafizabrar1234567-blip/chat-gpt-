import React, { useRef, useState, useEffect } from "react";
import {
  Download,
  Share2,
  Sparkles,
  Check,
  Crown,
  Shield,
  Copy,
  Layers,
  BookOpen,
  CheckCircle2,
  UserCheck,
  RotateCcw,
  Palette,
  Eye,
  Shuffle,
  Smartphone,
  Youtube,
  Tv,
  Instagram,
  Radio,
  Flame,
  Award,
  CircleDot,
  Compass,
} from "lucide-react";
import {
  LogoDesignResult,
  LogoBadgeShape,
  LogoThemeStyle,
  LogoVariationConcept,
  LogoPlatformPreset,
} from "../types";
import { downloadElementAsImage } from "../utils/imageExporter";

interface LogoDesignStudioProps {
  data: LogoDesignResult;
  topic?: string;
  onCopyText?: (text: string, key: string) => void;
  onShareClick?: () => void;
}

type PlatformPreviewMode = "square" | "whatsapp" | "youtube" | "tiktok" | "instagram";

export const LogoDesignStudio: React.FC<LogoDesignStudioProps> = ({
  data,
  topic = "",
  onCopyText,
  onShareClick,
}) => {
  const logoRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRemixing, setIsRemixing] = useState(false);

  // Extract clean name from prompt if not directly present
  const extractCleanName = (rawText: string) => {
    if (!rawText) return "Hafiz Abrar";
    let cleaned = rawText
      .replace(/\s*-\s*.*$/i, "")
      .replace(/logo\s*design/gi, "")
      .replace(/لوگو\s*ڈیزائن/gi, "")
      .replace(/لوگو/gi, "")
      .replace(/کا\s*ڈیزائن/gi, "")
      .replace(/بنا\s*کر\s*دیں/gi, "")
      .trim();
    return cleaned || rawText;
  };

  const rawLogoText = data.logoText || extractCleanName(topic) || "Hafiz Abrar";
  const rawUrduText =
    data.logoUrduText ||
    (/[\u0600-\u06FF]/.test(rawLogoText)
      ? rawLogoText
      : /abrar|ابرار/i.test(rawLogoText)
      ? "حافظ ابرار"
      : "");

  const initialWords = rawLogoText.split(/\s+/).filter(Boolean);
  const derivedInitials =
    initialWords.length > 1
      ? (initialWords[0][0] + initialWords[1][0]).toUpperCase()
      : (rawLogoText.replace(/[^a-zA-Z]/g, "").slice(0, 2) || "HA").toUpperCase();

  const monogramInitials = data.monogramInitials || derivedInitials;

  // Detect platform preset from generation data or topic
  const determineInitialPlatform = (): PlatformPreviewMode => {
    if (data.platformPreset === "whatsapp_dp") return "whatsapp";
    if (data.platformPreset === "youtube_channel") return "youtube";
    if (data.platformPreset === "tiktok_profile") return "tiktok";
    if (data.platformPreset === "instagram_dp") return "instagram";

    const lowerTopic = (topic || "").toLowerCase();
    if (lowerTopic.includes("whatsapp") || lowerTopic.includes("واٹس ایپ") || lowerTopic.includes("dp")) return "whatsapp";
    if (lowerTopic.includes("youtube") || lowerTopic.includes("یوٹیوب") || lowerTopic.includes("channel")) return "youtube";
    if (lowerTopic.includes("tiktok") || lowerTopic.includes("ٹک ٹاک") || lowerTopic.includes("reels")) return "tiktok";
    if (lowerTopic.includes("instagram") || lowerTopic.includes("انسٹاگرام")) return "instagram";

    return "whatsapp"; // Default to circular DP for profile logos
  };

  const detectedPlatform = determineInitialPlatform();

  // Active custom state
  const [activeShape, setActiveShape] = useState<LogoBadgeShape>(
    data.badgeShape || "royal_crest"
  );
  const [activeTheme, setActiveTheme] = useState<LogoThemeStyle>(
    data.themeStyle || "royal_gold_dark"
  );
  const [activeTagline, setActiveTagline] = useState<string>(
    data.tagline || "Official Crest"
  );
  const [fontFamily, setFontFamily] = useState<
    "serif" | "calligraphy" | "sans" | "urdu" | "tech"
  >(/[\u0600-\u06FF]/.test(rawLogoText) ? "urdu" : "serif");

  // Always use platform from initial selection (or WhatsApp DP mode) with automatic safe-fit scale
  const [previewMode] = useState<PlatformPreviewMode>(detectedPlatform);
  const [showUrduSubtitle, setShowUrduSubtitle] = useState<boolean>(true);
  const [activeConceptIndex, setActiveConceptIndex] = useState<number>(0);
  // Default content scale set to 82% so everything (long names, emblem, Urdu) fits perfectly within circular & square frames without any clipping
  const [contentScale, setContentScale] = useState<number>(82);

  const isCircularMode = previewMode !== "square";

  // 5 AI Variation Concepts
  const fallbackVariations: LogoVariationConcept[] = [
    {
      id: "concept_1",
      nameUrdu: "شاہی 3D گولڈ مونوگرام",
      nameEng: "Royal 3D Gold Luxury",
      badgeShape: "royal_crest",
      themeStyle: "royal_gold_dark",
      tagline: "Official Crest",
      fontStyle: "serif",
      iconSymbol: "👑",
    },
    {
      id: "concept_2",
      nameUrdu: "اسلامی خطاطی و گنبد",
      nameEng: "Islamic Dome & Calligraphy",
      badgeShape: "islamic_dome",
      themeStyle: "islamic_emerald_gold",
      tagline: "شاہی خطاطی",
      fontStyle: "urdu",
      iconSymbol: "🕌",
    },
    {
      id: "concept_3",
      nameUrdu: "یوٹیوب و کریئیٹر شیلڈ",
      nameEng: "YouTube Creator Shield",
      badgeShape: "modern_shield",
      themeStyle: "youtube_red_gold",
      tagline: "Official Channel",
      fontStyle: "sans",
      iconSymbol: "▶️",
    },
    {
      id: "concept_4",
      nameUrdu: "ٹک ٹاک سائبر گلو",
      nameEng: "TikTok Cyber Neon",
      badgeShape: "cyber_hexagon",
      themeStyle: "tiktok_cyan_magenta",
      tagline: "Creator Badge",
      fontStyle: "tech",
      iconSymbol: "⚡",
    },
    {
      id: "concept_5",
      nameUrdu: "واٹس ایپ ڈی پی سرکل",
      nameEng: "WhatsApp Circular DP",
      badgeShape: "minimal_circle",
      themeStyle: "sapphire_luxury",
      tagline: "Verified DP",
      fontStyle: "serif",
      iconSymbol: "💬",
    },
  ];

  const variationsList: LogoVariationConcept[] =
    data.variations && data.variations.length > 0
      ? data.variations.map((v, i) => ({
          ...fallbackVariations[i % fallbackVariations.length],
          ...v,
        }))
      : fallbackVariations;

  // Set default based on concept
  const handleSelectConcept = (index: number) => {
    setActiveConceptIndex(index);
    const concept = variationsList[index];
    if (concept) {
      setActiveShape(concept.badgeShape || "royal_crest");
      setActiveTheme(concept.themeStyle || "royal_gold_dark");
      if (concept.tagline) setActiveTagline(concept.tagline);
      if (concept.fontStyle) setFontFamily(concept.fontStyle);
    }
  };

  // AI Magic Remix / Shuffle button (ہر دفعہ نیا ڈیزائن)
  const handleAiRemix = () => {
    setIsRemixing(true);
    const allShapes: LogoBadgeShape[] = [
      "royal_crest",
      "islamic_calligraphy",
      "islamic_dome",
      "luxury_diamond",
      "modern_shield",
      "minimal_circle",
      "classic_monogram",
      "cyber_hexagon",
      "laurel_wreath",
      "vintage_badge",
    ];

    const allThemes: LogoThemeStyle[] = [
      "royal_gold_dark",
      "islamic_emerald_gold",
      "sapphire_luxury",
      "ruby_prestige",
      "minimalist_black",
      "cyber_neon_purple",
      "youtube_red_gold",
      "tiktok_cyan_magenta",
      "rose_gold_luxury",
      "matte_pearl_white",
      "sunset_titanium",
      "turquoise_marble",
    ];

    const allFonts: Array<"serif" | "calligraphy" | "sans" | "urdu" | "tech"> = [
      "serif",
      "calligraphy",
      "sans",
      "urdu",
      "tech",
    ];

    const taglines = [
      "Official Crest",
      "Luxury Edition",
      "The Righteous",
      "Creative Studio",
      "Premium Brand",
      "Royal Monogram",
      "Verified Creator",
      "Official Channel",
    ];

    // Pick random different ones
    const randomShape = allShapes[Math.floor(Math.random() * allShapes.length)];
    const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)];
    const randomFont = allFonts[Math.floor(Math.random() * allFonts.length)];
    const randomTagline = taglines[Math.floor(Math.random() * taglines.length)];

    setActiveShape(randomShape);
    setActiveTheme(randomTheme);
    setFontFamily(randomFont);
    setActiveTagline(randomTagline);

    setTimeout(() => {
      setIsRemixing(false);
    }, 400);
  };

  // Copy handler
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (onCopyText) onCopyText(text, key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // High-Resolution Download
  const handleDownload = async (transparent = false) => {
    if (!logoRef.current) return;
    setIsDownloading(true);
    try {
      const cleanFileName = rawLogoText
        .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")
        .slice(0, 25);
      const filename = `${cleanFileName || "logo"}_${activeTheme}_${Date.now()}.png`;

      const success = await downloadElementAsImage(logoRef.current, filename, 3);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error downloading logo:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Get Visual Theme Classes
  const getThemeStyles = () => {
    switch (activeTheme) {
      case "islamic_emerald_gold":
        return {
          bg: "bg-gradient-to-br from-[#04281f] via-[#064e3b] to-[#021f17]",
          border: "border-amber-400/60",
          glow: "bg-amber-400/20",
          crestColor: "text-amber-300",
          crestBorder: "border-amber-400/70 shadow-[0_0_35px_rgba(251,191,36,0.3)]",
          titleColor: "text-amber-300 drop-shadow-[0_2px_14px_rgba(251,191,36,0.5)]",
          subColor: "text-emerald-100/90",
          taglineColor: "text-amber-200/90",
          badgeBg: "bg-amber-400/20 text-amber-300 border-amber-400/50",
          ringColor: "ring-emerald-500",
        };
      case "youtube_red_gold":
        return {
          bg: "bg-gradient-to-br from-[#2a0404] via-[#5c0a0a] to-[#120000]",
          border: "border-red-500/60",
          glow: "bg-red-500/25",
          crestColor: "text-amber-400",
          crestBorder: "border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.4)]",
          titleColor: "text-white drop-shadow-[0_2px_14px_rgba(239,68,68,0.6)]",
          subColor: "text-red-200/90",
          taglineColor: "text-amber-300",
          badgeBg: "bg-red-600/30 text-amber-300 border-red-500/50",
          ringColor: "ring-red-600",
        };
      case "tiktok_cyan_magenta":
        return {
          bg: "bg-gradient-to-br from-[#050510] via-[#120924] to-[#04040a]",
          border: "border-cyan-400/60",
          glow: "bg-cyan-500/25",
          crestColor: "text-cyan-300",
          crestBorder: "border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.4)]",
          titleColor: "text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.7)]",
          subColor: "text-fuchsia-300",
          taglineColor: "text-cyan-300",
          badgeBg: "bg-fuchsia-600/20 text-cyan-300 border-cyan-400/50",
          ringColor: "ring-cyan-500",
        };
      case "cyber_neon_purple":
        return {
          bg: "bg-gradient-to-br from-[#130324] via-[#240a45] to-[#080112]",
          border: "border-purple-400/60",
          glow: "bg-purple-500/25",
          crestColor: "text-purple-300",
          crestBorder: "border-purple-400/80 shadow-[0_0_35px_rgba(168,85,247,0.4)]",
          titleColor: "text-purple-200 drop-shadow-[0_2px_14px_rgba(168,85,247,0.6)]",
          subColor: "text-pink-200",
          taglineColor: "text-purple-300",
          badgeBg: "bg-purple-600/30 text-purple-200 border-purple-400/50",
          ringColor: "ring-purple-600",
        };
      case "sapphire_luxury":
        return {
          bg: "bg-gradient-to-br from-[#06122e] via-[#0f255c] to-[#020919]",
          border: "border-sky-400/60",
          glow: "bg-sky-400/20",
          crestColor: "text-sky-300",
          crestBorder: "border-sky-400/70 shadow-[0_0_30px_rgba(56,189,248,0.3)]",
          titleColor: "text-sky-100 drop-shadow-[0_2px_14px_rgba(56,189,248,0.5)]",
          subColor: "text-sky-200/90",
          taglineColor: "text-sky-300/90",
          badgeBg: "bg-sky-500/20 text-sky-300 border-sky-400/50",
          ringColor: "ring-sky-500",
        };
      case "ruby_prestige":
        return {
          bg: "bg-gradient-to-br from-[#2e0614] via-[#520f27] to-[#170209]",
          border: "border-rose-400/60",
          glow: "bg-rose-400/20",
          crestColor: "text-rose-300",
          crestBorder: "border-rose-400/70 shadow-[0_0_30px_rgba(251,113,133,0.3)]",
          titleColor: "text-rose-100 drop-shadow-[0_2px_14px_rgba(251,113,133,0.5)]",
          subColor: "text-rose-200/90",
          taglineColor: "text-rose-300/90",
          badgeBg: "bg-rose-500/20 text-rose-300 border-rose-400/50",
          ringColor: "ring-rose-500",
        };
      case "rose_gold_luxury":
        return {
          bg: "bg-gradient-to-br from-[#1a1418] via-[#2d1e26] to-[#120c10]",
          border: "border-pink-300/50",
          glow: "bg-pink-300/15",
          crestColor: "text-pink-300",
          crestBorder: "border-pink-300/60 shadow-[0_0_25px_rgba(244,114,182,0.25)]",
          titleColor: "text-pink-200 drop-shadow-[0_2px_12px_rgba(244,114,182,0.4)]",
          subColor: "text-pink-100/80",
          taglineColor: "text-pink-300/80",
          badgeBg: "bg-pink-500/20 text-pink-300 border-pink-300/40",
          ringColor: "ring-pink-400",
        };
      case "sunset_titanium":
        return {
          bg: "bg-gradient-to-br from-[#1f1008] via-[#3d1d0c] to-[#0d0603]",
          border: "border-orange-500/50",
          glow: "bg-orange-500/20",
          crestColor: "text-amber-300",
          crestBorder: "border-orange-400/70 shadow-[0_0_30px_rgba(249,115,22,0.3)]",
          titleColor: "text-orange-200 drop-shadow-[0_2px_12px_rgba(249,115,22,0.5)]",
          subColor: "text-amber-100/90",
          taglineColor: "text-orange-300/80",
          badgeBg: "bg-orange-500/20 text-orange-300 border-orange-400/40",
          ringColor: "ring-orange-500",
        };
      case "turquoise_marble":
        return {
          bg: "bg-gradient-to-br from-[#05242b] via-[#0c404c] to-[#031519]",
          border: "border-teal-400/60",
          glow: "bg-teal-400/20",
          crestColor: "text-teal-300",
          crestBorder: "border-teal-400/70 shadow-[0_0_30px_rgba(45,212,191,0.3)]",
          titleColor: "text-teal-100 drop-shadow-[0_2px_12px_rgba(45,212,191,0.5)]",
          subColor: "text-teal-200/90",
          taglineColor: "text-teal-300/90",
          badgeBg: "bg-teal-500/20 text-teal-300 border-teal-400/50",
          ringColor: "ring-teal-500",
        };
      case "matte_pearl_white":
        return {
          bg: "bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]",
          border: "border-slate-300",
          glow: "bg-amber-400/10",
          crestColor: "text-slate-900",
          crestBorder: "border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.1)]",
          titleColor: "text-slate-900",
          subColor: "text-slate-600",
          taglineColor: "text-amber-700",
          badgeBg: "bg-slate-900 text-white border-slate-700",
          ringColor: "ring-slate-900",
        };
      case "minimalist_black":
        return {
          bg: "bg-[#09090b]",
          border: "border-slate-800",
          glow: "bg-white/5",
          crestColor: "text-white",
          crestBorder: "border-slate-700 shadow-none",
          titleColor: "text-white",
          subColor: "text-slate-400",
          taglineColor: "text-slate-500",
          badgeBg: "bg-white/10 text-white border-white/20",
          ringColor: "ring-slate-400",
        };
      case "royal_gold_dark":
      default:
        return {
          bg: "bg-gradient-to-br from-[#0e0c0a] via-[#211d18] to-[#070605]",
          border: "border-amber-500/50",
          glow: "bg-amber-500/20",
          crestColor: "text-amber-400",
          crestBorder: "border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.35)]",
          titleColor: "text-amber-300 drop-shadow-[0_2px_14px_rgba(245,158,11,0.5)]",
          subColor: "text-amber-100/90",
          taglineColor: "text-amber-200/80",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/50",
          ringColor: "ring-amber-500",
        };
    }
  };

  const themeStyle = getThemeStyles();

  // Render Rich Vector Emblem
  const renderEmblem = () => {
    const emblemSize = isCircularMode
      ? {
          outer: "w-20 h-20 sm:w-24 sm:h-24",
          inner: "w-16 h-16 sm:w-20 sm:h-20",
          icon: "w-6 h-6 sm:w-7 sm:h-7",
          text: "text-base sm:text-lg",
        }
      : {
          outer: "w-26 h-26 sm:w-30 sm:h-30",
          inner: "w-22 h-22 sm:w-26 sm:h-26",
          icon: "w-8 h-8 sm:w-9 sm:h-9",
          text: "text-xl sm:text-2xl",
        };

    switch (activeShape) {
      case "islamic_dome":
      case "islamic_calligraphy":
        return (
          <div className="relative flex flex-col items-center justify-center">
            {/* 3D Islamic Teardrop / Mihrab Arch with Arabesque Lattice (Matching Screenshot) */}
            <div className={`relative ${isCircularMode ? "w-28 h-32 sm:w-32 sm:h-36" : "w-36 h-40 sm:w-40 sm:h-44"} flex items-center justify-center filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]`}>
              <svg
                viewBox="0 0 200 240"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="studioTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#042c27" />
                    <stop offset="50%" stopColor="#0d6e60" />
                    <stop offset="100%" stopColor="#021c17" />
                  </linearGradient>
                  <linearGradient id="studioGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF2B2" />
                    <stop offset="40%" stopColor="#E5B842" />
                    <stop offset="80%" stopColor="#966E1C" />
                    <stop offset="100%" stopColor="#E5B842" />
                  </linearGradient>
                  <radialGradient id="studioCreamGrad" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#FFFDF7" />
                    <stop offset="70%" stopColor="#F5EFE0" />
                    <stop offset="100%" stopColor="#E5DAC0" />
                  </radialGradient>
                  <pattern id="studioArabesque" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 0 10 L 10 0 L 20 10 L 10 20 Z" fill="none" stroke="rgba(180,140,60,0.25)" strokeWidth="0.8" />
                    <circle cx="10" cy="10" r="4" fill="none" stroke="rgba(180,140,60,0.2)" strokeWidth="0.8" />
                  </pattern>
                  <clipPath id="studioMihrabClip">
                    <path d="M 100,25 C 135,65 175,115 175,155 C 175,200 140,225 100,225 C 60,225 25,200 25,155 C 25,115 65,65 100,25 Z" />
                  </clipPath>
                </defs>

                {/* 1. Outer 3D Teardrop Arch Shell */}
                <path
                  d="M 100,15 C 145,58 190,110 190,155 C 190,210 150,238 100,238 C 50,238 10,210 10,155 C 10,110 55,58 100,15 Z"
                  fill="url(#studioTealGrad)"
                  stroke="url(#studioGoldGrad)"
                  strokeWidth="3.5"
                />

                {/* 2. Inner Ivory Cream Ground with Arabesque Lattice */}
                <path
                  d="M 100,25 C 135,65 175,115 175,155 C 175,200 140,225 100,225 C 60,225 25,200 25,155 C 25,115 65,65 100,25 Z"
                  fill="url(#studioCreamGrad)"
                  stroke="url(#studioGoldGrad)"
                  strokeWidth="1.8"
                />
                <rect x="0" y="0" width="200" height="240" fill="url(#studioArabesque)" clipPath="url(#studioMihrabClip)" />

                {/* 3. Top 3D Golden Globe with Inlaid Ruby Heart */}
                <g transform="translate(100, 68)">
                  <circle cx="0" cy="0" r="16" fill="url(#studioGoldGrad)" stroke="#664303" strokeWidth="0.8" />
                  <ellipse cx="0" cy="0" rx="16" ry="6" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
                  <ellipse cx="0" cy="0" rx="6" ry="16" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
                  <path
                    d="M 0,2 C 0,-1 -6,-6 -6,-1 C -6,3 0,7 0,9 C 0,7 6,3 6,-1 C 6,-6 0,-1 0,2 Z"
                    fill="#E11D48"
                    stroke="#9F1239"
                    strokeWidth="0.5"
                  />
                </g>

                {/* 4. Center 3D Calligraphy Symbol */}
                <text
                  x="100"
                  y="136"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-urdu font-black"
                  fontSize="38"
                  fill="url(#studioGoldGrad)"
                  stroke="#042c27"
                  strokeWidth="1"
                  filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.6))"
                >
                  {rawUrduText ? rawUrduText.split(" ")[0] : monogramInitials}
                </text>

                {/* 5. Base Partnership Clasped Hands */}
                <g transform="translate(100, 195)">
                  <path
                    d="M -30,-4 Q 0,-12 30,-4 L 38,12 Q 0,22 -38,12 Z"
                    fill="#042c27"
                    stroke="url(#studioGoldGrad)"
                    strokeWidth="1.5"
                  />
                  <text x="0" y="6" textAnchor="middle" dominantBaseline="middle" fontSize="13">
                    🤝
                  </text>
                </g>
              </svg>
            </div>
          </div>
        );

      case "royal_crest":
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className={`${emblemSize.outer} rounded-full border-2 border-dashed border-amber-400/50 flex items-center justify-center p-1.5 relative group`}>
              <div
                className={`${emblemSize.inner} rounded-full border-2 flex flex-col items-center justify-center relative ${themeStyle.crestBorder} bg-black/50 backdrop-blur-xs`}
              >
                <Crown
                  className={`${emblemSize.icon} mb-0.5 ${themeStyle.crestColor} drop-shadow-md`}
                />
                <span
                  className={`${emblemSize.text} font-black tracking-widest ${themeStyle.crestColor}`}
                >
                  {monogramInitials}
                </span>
              </div>
            </div>
          </div>
        );

      case "cyber_hexagon":
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div
              className={`${emblemSize.inner} rounded-3xl border-2 flex flex-col items-center justify-center relative ${themeStyle.crestBorder} bg-black/60 backdrop-blur-xs`}
            >
              <Sparkles className={`${emblemSize.icon} ${themeStyle.crestColor} mb-0.5 animate-pulse`} />
              <span
                className={`${emblemSize.text} font-black tracking-wider ${themeStyle.crestColor}`}
              >
                {monogramInitials}
              </span>
            </div>
          </div>
        );

      case "modern_shield":
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div
              className={`${isCircularMode ? "w-18 h-20 sm:w-22 sm:h-24" : "w-24 h-26 sm:w-28 sm:h-30"} rounded-b-3xl rounded-t-xl border-2 flex flex-col items-center justify-center ${themeStyle.crestBorder} bg-black/50 backdrop-blur-xs pt-1`}
            >
              <Shield
                className={`${emblemSize.icon} ${themeStyle.crestColor} mb-0.5`}
              />
              <span
                className={`${emblemSize.text} font-black tracking-wider ${themeStyle.crestColor}`}
              >
                {monogramInitials}
              </span>
            </div>
          </div>
        );

      case "laurel_wreath":
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div
              className={`${emblemSize.outer} rounded-full border-2 flex flex-col items-center justify-center relative ${themeStyle.crestBorder} bg-black/50 backdrop-blur-xs`}
            >
              <Award className={`${emblemSize.icon} ${themeStyle.crestColor} mb-0.5`} />
              <span
                className={`${emblemSize.text} font-black tracking-widest ${themeStyle.crestColor}`}
              >
                {monogramInitials}
              </span>
            </div>
          </div>
        );

      case "luxury_diamond":
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div
              className={`${emblemSize.inner} rotate-45 border-2 flex items-center justify-center ${themeStyle.crestBorder} bg-black/50 backdrop-blur-xs`}
            >
              <div className="-rotate-45 flex flex-col items-center justify-center">
                <Sparkles
                  className={`${emblemSize.icon} ${themeStyle.crestColor} mb-0.5`}
                />
                <span
                  className={`${emblemSize.text} font-black tracking-widest ${themeStyle.crestColor}`}
                >
                  {monogramInitials}
                </span>
              </div>
            </div>
          </div>
        );

      case "vintage_badge":
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div
              className={`${emblemSize.inner} rounded-2xl rotate-12 border-2 flex items-center justify-center ${themeStyle.crestBorder} bg-black/50 backdrop-blur-xs`}
            >
              <div className="-rotate-12 flex flex-col items-center justify-center">
                <Crown className={`${emblemSize.icon} ${themeStyle.crestColor} mb-0.5`} />
                <span
                  className={`${emblemSize.text} font-serif font-black tracking-tighter ${themeStyle.crestColor}`}
                >
                  {monogramInitials}
                </span>
              </div>
            </div>
          </div>
        );

      case "classic_monogram":
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div
              className={`${emblemSize.inner} rounded-2xl border-2 flex items-center justify-center ${themeStyle.crestBorder} bg-black/50 backdrop-blur-xs`}
            >
              <span
                className={`${isCircularMode ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"} font-serif font-black tracking-tighter ${themeStyle.crestColor}`}
              >
                {monogramInitials}
              </span>
            </div>
          </div>
        );

      case "minimal_circle":
      default:
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div
              className={`${emblemSize.inner} rounded-full border-2 flex items-center justify-center ${themeStyle.crestBorder} bg-black/50 backdrop-blur-xs`}
            >
              <span
                className={`${emblemSize.text} font-black tracking-wider ${themeStyle.crestColor}`}
              >
                {monogramInitials}
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. TOP HEADER & INSTANT AI MAGIC REMIX */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-l-4 border-amber-500 p-4 rounded-r-3xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-600" />
            <div>
              <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider block">
                👑 AI لوگو و ڈی پی اسٹوڈیو (Multi-Concept Design Studio)
              </span>
              <span className="text-[11px] text-slate-600 font-urdu block">
                لوگو پر صرف آپ کا خالص نام <strong>({rawLogoText})</strong> اور شاہی مونوگرام مارک ہے۔
              </span>
            </div>
          </div>

          {/* AI MAGIC SHUFFLE / REMIX BUTTON */}
          <button
            type="button"
            onClick={handleAiRemix}
            className={`px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs shadow-md shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
              isRemixing ? "animate-spin" : ""
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>🎲 ہر دفعہ نیا ڈیزائن (AI Remix)</span>
          </button>
        </div>
      </div>

      {/* 2. 5 DIVERSE AI VARIATION CONCEPTS (تبدیل شدہ 5 منفرد ڈیزائنز) */}
      <div className="bg-slate-50/80 p-3.5 rounded-3xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>✨ AI کے تیار کردہ 5 منفرد اسٹائلز (Choose Any Concept):</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400 font-urdu">
            ایک کلک پر منتخب کریں
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {variationsList.map((variation, idx) => (
            <button
              key={variation.id || idx}
              type="button"
              onClick={() => handleSelectConcept(idx)}
              className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                activeConceptIndex === idx
                  ? "border-amber-500 bg-amber-50 text-amber-950 font-black shadow-xs ring-2 ring-amber-500/30 scale-[1.02]"
                  : "border-slate-200 bg-white hover:bg-slate-100/70 text-slate-700"
              }`}
            >
              <span className="text-lg">{variation.iconSymbol || "💎"}</span>
              <span className="text-[11px] font-urdu font-bold leading-tight line-clamp-1">
                {variation.nameUrdu}
              </span>
              <span className="text-[9px] text-slate-500 font-mono line-clamp-1">
                {variation.nameEng}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. THE PURE LOGO CANVAS (WHAT IS DOWNLOADED / USED AS LOGO) */}
      <div className="relative group flex flex-col items-center justify-center space-y-2">
        {/* PLATFORM FRAME GUIDE BADGE */}
        {isCircularMode && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-urdu font-bold text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {previewMode === "whatsapp" && "واٹس ایپ ڈی پی کے لیے پورا نام اور مونوگرام اندر محفوظ فٹ ہے"}
              {previewMode === "youtube" && "یوٹیوب چینل پروفائل کے دائرے میں پرفیکٹ سیٹ"}
              {previewMode === "tiktok" && "ٹک ٹاک اور ریلز اوتار کے لیے محفوظ فریم"}
              {previewMode === "instagram" && "انسٹاگرام گول ڈی پی کے لیے مکمل و واضح نام"}
            </span>
          </div>
        )}

        {/* Realistic Platform Mockup Frame */}
        <div
          className={`relative transition-all duration-300 ${
            previewMode === "whatsapp"
              ? "p-4 rounded-full border-4 border-dashed border-emerald-400/80 bg-emerald-50/30 shadow-lg"
              : previewMode === "youtube"
              ? "p-4 rounded-full border-4 border-dashed border-red-500/80 bg-red-50/30 shadow-lg"
              : previewMode === "tiktok"
              ? "p-4 rounded-full border-4 border-dashed border-cyan-400/80 bg-cyan-950/20 shadow-lg"
              : previewMode === "instagram"
              ? "p-4 rounded-full border-4 border-dashed border-pink-400/80 bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-purple-600/10 shadow-lg"
              : "p-2 rounded-3xl"
          }`}
        >
          <div
            ref={logoRef}
            className={`w-full aspect-square max-w-[320px] sm:max-w-[380px] mx-auto flex flex-col items-center justify-between relative overflow-hidden border shadow-2xl transition-all duration-300 select-none ${
              isCircularMode ? "rounded-full p-6 sm:p-7" : "rounded-3xl p-7 sm:p-9"
            } ${themeStyle.bg} ${themeStyle.border}`}
          >
            {/* Subtle Ambient Light Glows */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none ${themeStyle.glow}`}
            />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            {/* TOP ORNAMENT ROW */}
            <div
              className={`relative z-10 w-full flex items-center justify-between tracking-widest font-black uppercase transition-all ${
                isCircularMode
                  ? "text-[9px] px-4 pt-1"
                  : "text-[10px] px-1"
              }`}
            >
              <span
                className={`px-2 py-0.5 rounded-full border ${themeStyle.badgeBg} text-[8px] sm:text-[9px] font-extrabold`}
              >
                ⚜️ Monogram
              </span>
              <span className="text-white/50 tracking-wider text-[8px] sm:text-[9px]">
                EST. {new Date().getFullYear()}
              </span>
            </div>

            {/* CENTER LOGO EMBLEM & PURE NAME WITH DYNAMIC SCALE */}
            <div
              style={{
                transform: `scale(${contentScale / 100})`,
                transformOrigin: "center center",
              }}
              className="relative z-10 my-auto w-full flex flex-col items-center justify-center text-center space-y-2 sm:space-y-2.5 transition-transform duration-200"
            >
              {/* EMBLEM ICON / CREST */}
              <div className="shrink-0">{renderEmblem()}</div>

              {/* PURE LOGO NAME */}
              <div className="space-y-0.5 max-w-full px-2">
                <h2
                  className={`font-black tracking-tight leading-tight transition-all truncate ${
                    themeStyle.titleColor
                  } ${
                    rawLogoText.length > 14
                      ? isCircularMode
                        ? "text-lg sm:text-xl"
                        : "text-2xl sm:text-3xl"
                      : rawLogoText.length > 9
                      ? isCircularMode
                        ? "text-xl sm:text-2xl"
                        : "text-3xl sm:text-4xl"
                      : isCircularMode
                      ? "text-2xl sm:text-3xl"
                      : "text-3xl sm:text-5xl"
                  } ${
                    fontFamily === "serif"
                      ? "font-serif"
                      : fontFamily === "urdu"
                      ? "font-urdu"
                      : fontFamily === "tech"
                      ? "font-mono"
                      : "font-sans"
                  }`}
                >
                  {rawLogoText}
                </h2>

                {/* URDU CALLIGRAPHY NAME IF AVAILABLE */}
                {rawUrduText && rawUrduText !== rawLogoText && showUrduSubtitle && (
                  <p
                    className={`font-urdu font-black leading-snug transition-all truncate ${
                      themeStyle.subColor
                    } ${isCircularMode ? "text-sm sm:text-base" : "text-lg sm:text-xl"}`}
                  >
                    {rawUrduText}
                  </p>
                )}

                {/* CLEAN 1-2 WORD TAGLINE */}
                {activeTagline && (
                  <p
                    className={`font-bold tracking-widest uppercase border-t border-white/15 pt-1 mt-1 transition-all truncate ${
                      themeStyle.taglineColor
                    } ${
                      isCircularMode ? "text-[8px] sm:text-[9px]" : "text-[10px] sm:text-xs"
                    }`}
                  >
                    {activeTagline}
                  </p>
                )}
              </div>
            </div>

            {/* BOTTOM SUBTLE BRAND SIGNATURE */}
            <div
              className={`relative z-10 w-full flex items-center justify-between font-bold border-t border-white/10 transition-all ${
                isCircularMode
                  ? "text-[8px] px-4 pb-1 pt-1.5"
                  : "text-[9px] px-1 pt-2.5"
              }`}
            >
              <span className="text-white/50 tracking-wider uppercase">Signature Crest</span>
              <span className="text-white/50 font-urdu">مستند شاہی ڈیزائن</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE LIVE CUSTOMIZATION CONTROLS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4.5 h-4.5 text-amber-600" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              لوگو کسٹمائزیشن و سائز کنٹرول (Live Controls)
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 font-urdu">
            فریم، سائز یا کلر تھیم بدلیں
          </span>
        </div>

        {/* 5A. SCALE / FIT SLIDER & INSTANT PRESETS (سائز ایڈجسٹمنٹ) */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-black text-slate-800 flex items-center gap-1.5">
              <span>🔍 لوگو اور نام کا سائز (Scale & Safe Fit):</span>
              <span className="text-indigo-600 font-mono text-[11px] font-extrabold bg-indigo-50 px-2 py-0.5 rounded-md">
                {contentScale}%
              </span>
            </label>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setContentScale(82)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-urdu font-bold transition-all cursor-pointer ${
                  contentScale === 82
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                🎯 گولائی میں پورا فٹ (82%)
              </button>
              <button
                type="button"
                onClick={() => setContentScale(95)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-urdu font-bold transition-all cursor-pointer ${
                  contentScale === 95
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                ⚖️ معیاری (95%)
              </button>
              <button
                type="button"
                onClick={() => setContentScale(105)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-urdu font-bold transition-all cursor-pointer ${
                  contentScale === 105
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                🔍 بڑا (105%)
              </button>
            </div>
          </div>

          <input
            type="range"
            min="70"
            max="115"
            step="1"
            value={contentScale}
            onChange={(e) => setContentScale(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[9px] font-bold text-slate-400">
            <span>70% (چھوٹا / محفوظ ترین)</span>
            <span className="text-emerald-600 font-urdu font-black">← دائرے میں فٹ کرنے کے لیے سلائیڈر بائیں کریں →</span>
            <span>115% (فل اسکرین)</span>
          </div>
        </div>

        {/* 5A. EMBLEM FRAME SELECTOR (10 SHAPES) */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
            لوگو فریم / ایمبلم اسٹائل (Emblem Shape):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: "islamic_dome", label: "اسلامی گنبد و ہلال", icon: "🕌" },
              { id: "royal_crest", label: "شاہی کرسٹ", icon: "👑" },
              { id: "modern_shield", label: "ماڈرن شیلڈ", icon: "🛡️" },
              { id: "cyber_hexagon", label: "سائبر ہیکساگون", icon: "⚡" },
              { id: "laurel_wreath", label: "شاہی لاریل بینڈ", icon: "🎖️" },
              { id: "luxury_diamond", label: "ڈائمنڈ فریم", icon: "💎" },
              { id: "vintage_badge", label: "ونٹیج بیج", icon: "⚜️" },
              { id: "islamic_calligraphy", label: "اسلامی خطاطی", icon: "✨" },
              { id: "classic_monogram", label: "کلاسک مونوگرام", icon: "🔤" },
              { id: "minimal_circle", label: "منیمل سرکل", icon: "⭕" },
            ].map((shape) => (
              <button
                key={shape.id}
                type="button"
                onClick={() => setActiveShape(shape.id as LogoBadgeShape)}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activeShape === shape.id
                    ? "border-amber-500 bg-amber-50 text-amber-950 font-black shadow-xs ring-2 ring-amber-500/20"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50"
                }`}
              >
                <span className="text-base">{shape.icon}</span>
                <span className="text-[10px] font-urdu leading-tight">{shape.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5B. COLOR THEME SELECTOR (12 THEMES) */}
        <div className="space-y-2 pt-1">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
            شاہی کلر تھیم (Color Palette):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                id: "royal_gold_dark",
                label: "شاہی گولڈ و بلیک",
                bg: "bg-amber-900 border-amber-500",
              },
              {
                id: "islamic_emerald_gold",
                label: "زمردی سبز و گولڈ",
                bg: "bg-emerald-900 border-emerald-500",
              },
              {
                id: "youtube_red_gold",
                label: "یوٹیوب ریڈ و گولڈ",
                bg: "bg-red-900 border-red-500",
              },
              {
                id: "tiktok_cyan_magenta",
                label: "ٹک ٹاک نیون سائبر",
                bg: "bg-cyan-900 border-cyan-400",
              },
              {
                id: "cyber_neon_purple",
                label: "سائبر پرپل گلو",
                bg: "bg-purple-900 border-purple-400",
              },
              {
                id: "sapphire_luxury",
                label: "شاہی نیلم (Sapphire)",
                bg: "bg-blue-950 border-sky-400",
              },
              {
                id: "ruby_prestige",
                label: "یاقوت روبی (Ruby)",
                bg: "bg-rose-950 border-rose-500",
              },
              {
                id: "rose_gold_luxury",
                label: "روز گولڈ میٹالک",
                bg: "bg-pink-950 border-pink-400",
              },
              {
                id: "sunset_titanium",
                label: "سن سیٹ ٹائٹینیم",
                bg: "bg-orange-950 border-orange-500",
              },
              {
                id: "turquoise_marble",
                label: "ترکش فیروزہ و گولڈ",
                bg: "bg-teal-950 border-teal-400",
              },
              {
                id: "matte_pearl_white",
                label: "پرل وائٹ منیمل",
                bg: "bg-slate-200 border-slate-400",
              },
              {
                id: "minimalist_black",
                label: "میٹ اوبسیڈین بلیک",
                bg: "bg-zinc-900 border-zinc-700",
              },
            ].map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setActiveTheme(theme.id as LogoThemeStyle)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeTheme === theme.id
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm ring-2 ring-slate-400/30 font-bold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full shrink-0 border ${theme.bg}`} />
                <span className="text-[10px] font-urdu font-bold truncate">
                  {theme.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 5C. FONT STYLE & TAGLINE CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
              فونٹ اسٹائل:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "serif", label: "Royal Serif", font: "font-serif" },
                { id: "urdu", label: "اردو خطاطی", font: "font-urdu" },
                { id: "sans", label: "Modern Sans", font: "font-sans" },
                { id: "tech", label: "Cyber Tech", font: "font-mono" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFontFamily(f.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    fontFamily === f.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  } ${f.font}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-urdu font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showUrduSubtitle}
              onChange={(e) => setShowUrduSubtitle(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <span>اردو نام ذیلی خط دکھائیں</span>
          </label>
        </div>
      </div>

      {/* 6. 1-CLICK DOWNLOAD & SHARE BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleDownload(false)}
          disabled={isDownloading}
          className="w-full py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
        >
          {isDownloading ? (
            <span>لوگو تیار ہو رہا ہے...</span>
          ) : downloadSuccess ? (
            <>
              <Check className="w-5 h-5 text-white stroke-[3]" />
              <span>لوگو ڈاؤن لوڈ ہو گیا ✓</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>📥 ڈاؤن لوڈ لوگو (Save HD Logo PNG)</span>
            </>
          )}
        </button>

        {onShareClick && (
          <button
            type="button"
            onClick={onShareClick}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
            <span>📤 ڈی پی لگائیں (Set as WhatsApp / FB DP)</span>
          </button>
        )}
      </div>

      {/* =====================================================
          7. DETAILS STRICTLY UNDER THE LOGO (معنی و حوالہ)
      ====================================================== */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              📖 نام کا معنی، قرآنی حوالہ اور تفاصیل (Details Below Logo)
            </h3>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            مستند مواد
          </span>
        </div>

        {/* 7A. MEANING CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-2 relative">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>💎 نام کا مفہوم و معنی:</span>
            </h4>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  data.meaningExplanation ||
                    `${rawLogoText}: نیکوکار، سچے، پاکیزہ اور اللہ تعالیٰ کے فرماں بردار بندے۔`,
                  "meaning"
                )
              }
              className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === "meaning" ? (
                <span className="text-emerald-600">کاپی ہو گیا ✓</span>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کاپی کریں</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 font-urdu leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            {data.meaningExplanation ||
              `«${rawLogoText}» کا معنی ہے: نیکوکار، پاکیزہ کردار کے حامل، سچے اور ہر بھلائی میں پیش پیش رہنے والے لوگ۔ یہ نہایت مبارک اور باوقار نام ہے۔`}
          </p>
        </div>

        {/* 7B. QURAN / SAHIH HADITH REFERENCE CARD */}
        <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 rounded-3xl border border-emerald-200 p-5 shadow-xs space-y-2 relative">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
              <span>🕌 مستند قرآنی حوالہ / حدیث مبارکہ:</span>
            </h4>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  data.quranHadithReference ||
                    "«إِنَّ الْأَبْرَارَ لَفِي نَعِيمٍ» (سورۃ الانفطار: 13) - بے شک نیک لوگ نعمتوں میں ہوں گے۔",
                  "hadith"
                )
              }
              className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === "hadith" ? (
                <span className="text-emerald-700">کاپی ہو گیا ✓</span>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کاپی کریں</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-emerald-900 text-emerald-100 p-4 rounded-2xl border border-emerald-700/50 space-y-1.5">
            <p className="font-urdu font-black text-base sm:text-lg text-amber-300 text-center">
              {data.quranHadithReference ||
                "«إِنَّ الْأَبْرَارَ لَفِي نَعِيمٍ» (سورۃ الانفطار: 13)"}
            </p>
            <p className="font-urdu text-xs sm:text-sm text-center text-emerald-100/90 leading-relaxed">
              ترجمہ: بے شک نیک و پارسا لوگ ہمیشہ رہنے والی نعمتوں (جنت) میں ہوں گے۔
            </p>
          </div>
        </div>

        {/* 7C. READY-TO-USE SOCIAL MEDIA BIO SUGGESTIONS */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>📱 سوشل میڈیا کے لیے بائیو (Bio Suggestions):</span>
            </h4>
            <span className="text-[10px] font-bold text-slate-400 font-urdu">
              کلک کر کے کاپی کریں
            </span>
          </div>

          <div className="space-y-2">
            {(
              data.bioSuggestions || [
                `✨ ${rawLogoText} | Living with pure intentions & gratitude 🤲`,
                `👑 ${rawLogoText} (Official) | «إِنَّ الْأَبْرَارَ لَفِي نَعِيمٍ» ✨`,
                `🌟 ${rawLogoText} | Simplicity • Faith • Determination 💫`,
              ]
            ).map((bio, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 transition-colors group"
              >
                <span className="text-xs text-slate-800 font-medium">{bio}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(bio, `bio_${index}`)}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] border border-slate-200 shrink-0 ml-2 cursor-pointer flex items-center gap-1"
                >
                  {copiedKey === `bio_${index}` ? (
                    <span className="text-emerald-600">کاپی ✓</span>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>کاپی</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
