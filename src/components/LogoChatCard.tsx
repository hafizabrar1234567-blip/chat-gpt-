import React, { useState, useMemo, useRef } from "react";
import { Download, Sparkles, Check, RefreshCw, Wand2 } from "lucide-react";
import { LogoDesignResult } from "../types";
import { downloadElementAsImage } from "../utils/imageExporter";

interface LogoChatCardProps {
  data: LogoDesignResult;
  onSelectOption?: (option: string) => void;
  onCopyText?: (text: string, key?: string) => void;
  messageId?: string;
}

// Expansive library of procedural 3D shapes & motifs
export type ProceduralShape =
  | "interlocking_oval"
  | "mihrab"
  | "circle_medallion"
  | "ruby_heart"
  | "imperial_shield"
  | "diamond_star"
  | "laurel_crown"
  | "crescent_star"
  | "cyber_hexagon"
  | "victorian_oval"
  | "lotus_teardrop";

export type DecorativeElement = "crown" | "wings" | "laurel" | "crescent" | "sparkles" | "shield";

interface ProceduralTheme {
  id: string;
  nameUrdu: string;
  bg1: string;
  bg2: string;
  goldLight: string;
  goldMain: string;
  goldDark: string;
  accent: string;
  glow: string;
}

const PROCEDURAL_THEMES: ProceduralTheme[] = [
  {
    id: "royal_gold",
    nameUrdu: "خالص 24K شاہی سونا (Royal 24K Gold & Obsidian)",
    bg1: "#0a1128",
    bg2: "#1e293b",
    goldLight: "#FFF59D",
    goldMain: "#F59E0B",
    goldDark: "#B45309",
    accent: "#FBBF24",
    glow: "rgba(245, 158, 11, 0.75)",
  },
  {
    id: "emerald_gold",
    nameUrdu: "زمردی سبز و درخشاں سونا (Emerald Green & Gold)",
    bg1: "#022c22",
    bg2: "#065f46",
    goldLight: "#FEF08A",
    goldMain: "#EAB308",
    goldDark: "#854D0E",
    accent: "#10B981",
    glow: "rgba(16, 185, 129, 0.75)",
  },
  {
    id: "sapphire_blue",
    nameUrdu: "سلطانی نیلم و روشن گولڈ (Sapphire Blue & Gold)",
    bg1: "#082f49",
    bg2: "#0369a1",
    goldLight: "#FEF9C3",
    goldMain: "#FBBF24",
    goldDark: "#B45309",
    accent: "#38BDF8",
    glow: "rgba(56, 189, 248, 0.75)",
  },
  {
    id: "ruby_rose",
    nameUrdu: "یاقوت سرخ و گلابی سونا (Ruby Red & Rose Gold)",
    bg1: "#450a0a",
    bg2: "#991b1b",
    goldLight: "#FFE4E6",
    goldMain: "#F43F5E",
    goldDark: "#9F1239",
    accent: "#FB7185",
    glow: "rgba(244, 63, 94, 0.75)",
  },
  {
    id: "persian_turquoise",
    nameUrdu: "شاہی فیروزہ و 24K سونا (Persian Turquoise & Gold)",
    bg1: "#042f2e",
    bg2: "#0d9488",
    goldLight: "#FEF08A",
    goldMain: "#F59E0B",
    goldDark: "#78350F",
    accent: "#2DD4BF",
    glow: "rgba(45, 212, 191, 0.75)",
  },
  {
    id: "cyber_neon",
    nameUrdu: "سائبر نیون میجنٹا و سیان (Cyber Neon & Cyan)",
    bg1: "#2e1065",
    bg2: "#6b21a8",
    goldLight: "#67E8F9",
    goldMain: "#EC4899",
    goldDark: "#9333EA",
    accent: "#06B6D4",
    glow: "rgba(236, 72, 153, 0.75)",
  },
  {
    id: "imperial_purple",
    nameUrdu: "شاہی ارغوانی و سنہری (Imperial Purple & Gold)",
    bg1: "#3b0764",
    bg2: "#581c87",
    goldLight: "#FEF08A",
    goldMain: "#FBBF24",
    goldDark: "#854D0E",
    accent: "#C084FC",
    glow: "rgba(192, 132, 252, 0.75)",
  },
  {
    id: "sunset_amber",
    nameUrdu: "شفق سرخ و عنبر گولڈ (Sunset Amber & Flame)",
    bg1: "#431407",
    bg2: "#c2410c",
    goldLight: "#FED7AA",
    goldMain: "#F97316",
    goldDark: "#7C2D12",
    accent: "#FB923C",
    glow: "rgba(249, 115, 22, 0.75)",
  },
  {
    id: "minimal_studio",
    nameUrdu: "اسٹوڈیو سیاہ و مونوکروم (Minimal Studio Monochrome)",
    bg1: "#0f172a",
    bg2: "#334155",
    goldLight: "#FFFFFF",
    goldMain: "#CBD5E1",
    goldDark: "#64748B",
    accent: "#94A3B8",
    glow: "rgba(203, 213, 225, 0.4)",
  },
];

const ALL_SHAPES: { id: ProceduralShape; labelUrdu: string; icon: string }[] = [
  { id: "interlocking_oval", labelUrdu: "انٹرلاکنگ بیضوی", icon: "⬭" },
  { id: "imperial_shield", labelUrdu: "شاہی شیلڈ", icon: "🛡️" },
  { id: "mihrab", labelUrdu: "سلطانی محراب", icon: "🕌" },
  { id: "circle_medallion", labelUrdu: "گول میڈلین", icon: "🪙" },
  { id: "laurel_crown", labelUrdu: "شاہی تاج و شاخیں", icon: "👑" },
  { id: "diamond_star", labelUrdu: "ڈائمنڈ کریسٹ", icon: "💎" },
  { id: "crescent_star", labelUrdu: "ہلال و ستارہ", icon: "🌙" },
  { id: "cyber_hexagon", labelUrdu: "سائبر مسدس", icon: "⬡" },
  { id: "ruby_heart", labelUrdu: "یاقوتی کلاسک", icon: "💖" },
  { id: "victorian_oval", labelUrdu: "وکٹورین ایلیگنٹ", icon: "⚜️" },
];

export const LogoChatCard: React.FC<LogoChatCardProps> = ({ data, onSelectOption }) => {
  const pureLogoRef = useRef<HTMLDivElement>(null);
  const [cycleSeed, setCycleSeed] = useState<number>(() => Math.floor(Math.random() * 10));
  const [selectedShapeId, setSelectedShapeId] = useState<ProceduralShape | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [activeAccessories, setActiveAccessories] = useState<DecorativeElement[]>(["crown", "sparkles"]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"preview" | "shapes" | "themes" | "elements">("preview");

  const rawLogoText = data.logoText?.trim() || "";
  const rawUrduText = data.logoUrduText?.trim() || (data as any).urduText?.trim() || "";

  const sanitizeName = (val: string) => {
    return val
      .replace(/[\*\_\#\`\:\'\"]/g, "")
      .replace(/^(لوگو|نام|ٹائٹل|موضوع|عنوان)\s*[:\-]?\s*/gi, "")
      .trim();
  };

  let initials = data.monogramInitials || "";
  initials = sanitizeName(initials);

  if (!initials || initials.length > 3 || /مجھے|بنا/i.test(initials)) {
    if (rawLogoText && /^[a-zA-Z\s]+$/.test(rawLogoText)) {
      const words = rawLogoText.split(/\s+/).filter(Boolean);
      initials = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : rawLogoText.slice(0, 2).toUpperCase();
    } else if (rawUrduText) {
      const uWords = rawUrduText.split(/\s+/).filter(Boolean);
      initials = uWords.length > 1 ? (uWords[0][0] + uWords[1][0]) : uWords[0].slice(0, 2);
    } else {
      initials = "AB";
    }
  }

  // Generate a procedural seed from the text so each brand has its own distinct signature
  const nameHash = useMemo(() => {
    const str = (rawUrduText || rawLogoText || "Brand") + "SaltKey";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }, [rawUrduText, rawLogoText]);

  // Dynamically calculate the active shape and active theme
  const initialShapeIdx = useMemo(() => {
    if (data.badgeShape) {
      const idx = ALL_SHAPES.findIndex((s) => s.id === data.badgeShape);
      if (idx !== -1) return idx;
      if (data.badgeShape === "modern_shield") return ALL_SHAPES.findIndex((s) => s.id === "imperial_shield");
      if (data.badgeShape === "minimal_circle") return ALL_SHAPES.findIndex((s) => s.id === "circle_medallion");
    }
    return 0; // default "interlocking_oval"
  }, [data.badgeShape]);

  const initialThemeIdx = useMemo(() => {
    if (data.themeStyle === "islamic_emerald_gold") return 1; // Emerald & Gold
    if (data.themeStyle === "sapphire_luxury") return 2; // Sapphire & Gold
    if (data.themeStyle === "youtube_red_gold") return 3; // Ruby Red & Rose Gold
    if (data.themeStyle === "tiktok_cyan_magenta") return 5; // Cyber Neon Cyan & Magenta
    if (data.themeStyle === "minimalist_black") return 0; // Royal 24K Gold & Obsidian
    if (data.themeStyle === "royal_gold_dark") return 0; // Royal 24K Gold & Obsidian
    return 0; // default Royal 24K Gold & Obsidian
  }, [data.themeStyle]);

  const currentShapeIndex = (initialShapeIdx + cycleSeed) % ALL_SHAPES.length;
  const currentThemeIndex = (initialThemeIdx + cycleSeed) % PROCEDURAL_THEMES.length;

  const currentShape: ProceduralShape = selectedShapeId || ALL_SHAPES[currentShapeIndex].id;
  const currentTheme: ProceduralTheme = selectedThemeId
    ? PROCEDURAL_THEMES.find((t) => t.id === selectedThemeId) || PROCEDURAL_THEMES[0]
    : PROCEDURAL_THEMES[currentThemeIndex];

  const getShapeTitle = (s: ProceduralShape) => {
    switch (s) {
      case "interlocking_oval":
        return "مونوگرام بیضوی بیج و انٹرلاکنگ لیٹرز (Oval Interlocking Monogram)";
      case "mihrab":
        return "3D سلطانی محراب و خطاطی";
      case "circle_medallion":
        return "3D شاہی گول میڈلین";
      case "ruby_heart":
        return "3D یاقوتی دل ایمبلم";
      case "imperial_shield":
        return "3D سلطانی شیلڈ و ایگل";
      case "diamond_star":
        return "3D کوہِ نور ڈائمنڈ و کراؤن";
      case "laurel_crown":
        return "3D شاہی تاج و سنہری شاخیں";
      case "crescent_star":
        return "3D ہلال و ستارہ عثمانی ایمبلم";
      case "cyber_hexagon":
        return "3D مسدس گولڈن و سیان کریسٹ";
      case "victorian_oval":
        return "3D وکٹورین بیضوی کریسٹ";
      case "lotus_teardrop":
        return "3D نیلوفر و قطرۂ آب ایمبلم";
    }
  };

  const handleNextDynamicStyle = () => {
    setSelectedShapeId(null);
    setSelectedThemeId(null);
    setCycleSeed((prev) => prev + 1);
  };

  const toggleAccessory = (acc: DecorativeElement) => {
    setActiveAccessories((prev) =>
      prev.includes(acc) ? prev.filter((item) => item !== acc) : [...prev, acc]
    );
  };

  // Ultra-HD 4K 1024x1024 Transparent PNG Exporter for the standalone 3D emblem
  const handleDownloadHD = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Soft glow background
      const glowGrad = ctx.createRadialGradient(512, 512, 40, 512, 512, 480);
      glowGrad.addColorStop(0, currentTheme.glow);
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1024, 1024);

      const createGoldGrad = (x1: number, y1: number, x2: number, y2: number) => {
        const g = ctx.createLinearGradient(x1, y1, x2, y2);
        g.addColorStop(0, currentTheme.goldLight);
        g.addColorStop(0.3, currentTheme.goldMain);
        g.addColorStop(0.7, currentTheme.goldDark);
        g.addColorStop(0.9, currentTheme.goldLight);
        g.addColorStop(1, currentTheme.goldMain);
        return g;
      };

      ctx.save();
      ctx.translate(512, 480);

      // --- RENDERING PROCEDURAL 3D SHAPES ON CANVAS ---
      if (currentShape === "interlocking_oval") {
        ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
        ctx.shadowBlur = 45;
        ctx.shadowOffsetY = 25;

        // Outer Oval Path
        ctx.beginPath();
        ctx.ellipse(0, 0, 240, 310, 0, 0, Math.PI * 2);
        const ovalBg = ctx.createRadialGradient(0, -60, 40, 0, 0, 310);
        ovalBg.addColorStop(0, currentTheme.bg2);
        ovalBg.addColorStop(0.7, currentTheme.bg1);
        ovalBg.addColorStop(1, "#030407");
        ctx.fillStyle = ovalBg;
        ctx.fill();

        // Double Border
        ctx.strokeStyle = createGoldGrad(-240, -310, 240, 310);
        ctx.lineWidth = 14;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, 0, 215, 285, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Top & Bottom Accents
        ctx.font = "bold 28px sans-serif";
        ctx.fillStyle = currentTheme.goldLight;
        ctx.textAlign = "center";
        ctx.fillText("✦", 0, -230);
        ctx.fillText("✦", 0, 230);

        // Center Monogram Glyphs
        ctx.font = "900 160px 'Cinzel', 'Playfair Display', serif";
        ctx.fillStyle = createGoldGrad(-150, -40, 150, 40);
        ctx.shadowColor = currentTheme.accent || "rgba(255, 255, 255, 0.8)";
        ctx.shadowBlur = 25;
        ctx.fillText(initials, 0, 20);

        // Interlocking Arches
        ctx.beginPath();
        ctx.arc(0, 0, 140, Math.PI * 0.8, Math.PI * 0.2, true);
        ctx.strokeStyle = createGoldGrad(-150, 0, 150, 0);
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 140, Math.PI * 1.8, Math.PI * 1.2, true);
        ctx.stroke();

        // Urdu script under initials
        if (rawUrduText) {
          ctx.font = "bold 52px 'Noto Nastaliq Urdu', sans-serif";
          ctx.fillStyle = currentTheme.goldLight;
          ctx.fillText(rawUrduText.split(" ")[0], 0, 130);
        }
      } else if (currentShape === "mihrab" || currentShape === "lotus_teardrop") {
        const traceMihrab = (scale: number) => {
          ctx.beginPath();
          ctx.moveTo(0, -320 * scale);
          ctx.bezierCurveTo(120 * scale, -220 * scale, 300 * scale, -70 * scale, 300 * scale, 100 * scale);
          ctx.bezierCurveTo(300 * scale, 270 * scale, 140 * scale, 340 * scale, 0, 340 * scale);
          ctx.bezierCurveTo(-140 * scale, 340 * scale, -300 * scale, 270 * scale, -300 * scale, 100 * scale);
          ctx.bezierCurveTo(-300 * scale, -70 * scale, -120 * scale, -220 * scale, 0, -320 * scale);
          ctx.closePath();
        };

        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 25;
        traceMihrab(1.05);
        const mihrabBg = ctx.createLinearGradient(-250, -300, 250, 300);
        mihrabBg.addColorStop(0, currentTheme.bg1);
        mihrabBg.addColorStop(0.5, currentTheme.bg2);
        mihrabBg.addColorStop(1, currentTheme.bg1);
        ctx.fillStyle = mihrabBg;
        ctx.fill();

        ctx.strokeStyle = createGoldGrad(-250, -300, 250, 300);
        ctx.lineWidth = 12;
        ctx.stroke();

        ctx.save();
        traceMihrab(0.9);
        ctx.clip();
        const creamGrad = ctx.createRadialGradient(0, -30, 30, 0, 80, 280);
        creamGrad.addColorStop(0, "#FFFDF7");
        creamGrad.addColorStop(0.7, "#F5EFE0");
        creamGrad.addColorStop(1, "#E5DAC0");
        ctx.fillStyle = creamGrad;
        ctx.fill();

        ctx.strokeStyle = "rgba(180, 140, 60, 0.25)";
        ctx.lineWidth = 2;
        for (let x = -300; x <= 300; x += 40) {
          for (let y = -350; y <= 350; y += 40) {
            ctx.strokeRect(x, y, 40, 40);
          }
        }
        ctx.restore();

        // Top 3D Golden Globe
        ctx.save();
        ctx.translate(0, -120);
        ctx.fillStyle = createGoldGrad(-30, -30, 30, 30);
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#E11D48";
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Center 3D Calligraphy Monogram
        ctx.font = "900 130px 'Noto Nastaliq Urdu', 'Cinzel', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = createGoldGrad(-150, -50, 150, 50);
        ctx.shadowColor = "rgba(245, 158, 11, 0.8)";
        ctx.shadowBlur = 20;
        ctx.fillText(rawUrduText ? rawUrduText.split(" ")[0] : initials, 0, 60);

        // Base Clasped Hands
        ctx.save();
        ctx.translate(0, 235);
        ctx.fillStyle = currentTheme.bg1;
        ctx.strokeStyle = createGoldGrad(-100, 0, 100, 0);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 15, 70, Math.PI, 0, true);
        ctx.lineTo(90, 35);
        ctx.lineTo(-90, 35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = currentTheme.goldLight;
        ctx.font = "38px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🤝", 0, 18);
        ctx.restore();
      } else if (currentShape === "circle_medallion" || currentShape === "laurel_crown" || currentShape === "crescent_star") {
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 45;
        ctx.shadowOffsetY = 25;

        ctx.beginPath();
        ctx.arc(0, 0, 310, 0, Math.PI * 2);
        ctx.fillStyle = createGoldGrad(-300, -300, 300, 300);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, 275, 0, Math.PI * 2);
        const discGrad = ctx.createRadialGradient(0, -60, 40, 0, 0, 270);
        discGrad.addColorStop(0, currentTheme.bg2);
        discGrad.addColorStop(0.7, currentTheme.bg1);
        discGrad.addColorStop(1, "#070503");
        ctx.fillStyle = discGrad;
        ctx.fill();

        ctx.font = "75px serif";
        ctx.textAlign = "center";
        ctx.fillText("👑", 0, -140);
        ctx.font = "50px serif";
        ctx.fillText("🌿", -180, 0);
        ctx.fillText("🌿", 180, 0);

        ctx.font = "900 150px 'Noto Nastaliq Urdu', 'Cinzel', serif";
        ctx.fillStyle = createGoldGrad(-150, -50, 150, 50);
        ctx.shadowColor = "rgba(245, 158, 11, 0.8)";
        ctx.shadowBlur = 20;
        ctx.fillText(rawUrduText ? rawUrduText.split(" ")[0] : initials, 0, 30);
      } else if (currentShape === "ruby_heart") {
        const traceHeart = (scale: number) => {
          ctx.beginPath();
          const hs = scale * 18;
          ctx.moveTo(0, 10 * hs);
          ctx.bezierCurveTo(0, -2 * hs, -18 * hs, -18 * hs, -18 * hs, -5 * hs);
          ctx.bezierCurveTo(-18 * hs, 8 * hs, 0, 24 * hs, 0, 30 * hs);
          ctx.bezierCurveTo(0, 24 * hs, 18 * hs, 8 * hs, 18 * hs, -5 * hs);
          ctx.bezierCurveTo(18 * hs, -18 * hs, 0, -2 * hs, 0, 10 * hs);
          ctx.closePath();
        };

        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 45;
        ctx.shadowOffsetY = 25;
        traceHeart(0.68);
        const heartBg = ctx.createRadialGradient(0, -60, 40, 0, 80, 300);
        heartBg.addColorStop(0, "#FF2A55");
        heartBg.addColorStop(0.4, "#BE123C");
        heartBg.addColorStop(0.8, "#881337");
        heartBg.addColorStop(1, "#4C0519");
        ctx.fillStyle = heartBg;
        ctx.fill();

        ctx.strokeStyle = createGoldGrad(-200, -200, 200, 200);
        ctx.lineWidth = 14;
        ctx.stroke();

        ctx.font = "60px serif";
        ctx.fillStyle = currentTheme.goldLight;
        ctx.textAlign = "center";
        ctx.fillText("✨", 0, -110);

        ctx.font = "900 130px 'Noto Nastaliq Urdu', 'Cinzel', serif";
        ctx.fillStyle = createGoldGrad(-150, -40, 150, 40);
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.shadowBlur = 20;
        ctx.fillText(rawUrduText ? rawUrduText.split(" ")[0] : initials, 0, 40);
      } else {
        // Shield, Diamond, Hexagon, Oval
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 45;
        ctx.shadowOffsetY = 25;

        ctx.beginPath();
        ctx.moveTo(0, -270);
        ctx.lineTo(240, -270);
        ctx.lineTo(240, 30);
        ctx.bezierCurveTo(240, 180, 120, 280, 0, 320);
        ctx.bezierCurveTo(-120, 280, -240, 180, -240, 30);
        ctx.lineTo(-240, -270);
        ctx.closePath();

        const shieldBg = ctx.createLinearGradient(-200, -250, 200, 250);
        shieldBg.addColorStop(0, currentTheme.bg1);
        shieldBg.addColorStop(0.5, currentTheme.bg2);
        shieldBg.addColorStop(1, currentTheme.bg1);
        ctx.fillStyle = shieldBg;
        ctx.fill();

        ctx.strokeStyle = createGoldGrad(-200, -250, 200, 250);
        ctx.lineWidth = 14;
        ctx.stroke();

        ctx.font = "65px serif";
        ctx.fillStyle = currentTheme.goldLight;
        ctx.textAlign = "center";
        ctx.fillText("🛡️", 0, -130);

        ctx.font = "900 140px 'Noto Nastaliq Urdu', 'Cinzel', serif";
        ctx.fillStyle = createGoldGrad(-150, -40, 150, 40);
        ctx.shadowColor = "rgba(245, 158, 11, 0.8)";
        ctx.shadowBlur = 20;
        ctx.fillText(rawUrduText ? rawUrduText.split(" ")[0] : initials, 0, 40);
      }

      ctx.restore();

      // Trigger Download
      const link = document.createElement("a");
      link.download = `${(rawUrduText || rawLogoText || "Logo").replace(/\s+/g, "_")}_${currentShape}_3D_Logo.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("HD Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPureLogo = async () => {
    setIsDownloading(true);
    try {
      if (pureLogoRef.current) {
        const fileName = `${(rawUrduText || rawLogoText || "Logo").replace(/\s+/g, "_")}_Pure_3D_Logo`;
        const success = await downloadElementAsImage(pureLogoRef.current, fileName, 3);
        if (success) {
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 3000);
          return;
        }
      }
      await handleDownloadHD();
    } catch (err) {
      console.error("Pure logo download failed:", err);
      await handleDownloadHD();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-3.5 text-slate-800 animate-fade-in max-w-sm mx-auto">
      {/* Header Info with Active Shape Title */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-amber-900 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 px-3 py-1 rounded-full border border-amber-400 font-urdu flex items-center gap-1.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>✨ {getShapeTitle(currentShape)}</span>
        </span>
        <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200">
          4K Ultra HD
        </span>
      </div>

      {/* AI VARIATIONS BAR (If AI generated multiple concepts, allow 1-click switching) */}
      {Array.isArray(data.variations) && data.variations.length > 0 && (
        <div className="bg-slate-900/95 p-2 rounded-xl border border-amber-500/30 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between text-[10px] font-urdu font-bold text-amber-300 px-1">
            <span>✨ AI کے تیار کردہ 5 مختلف شاہی ڈیزائنز:</span>
            <span className="text-amber-400/80 font-mono">1-Click Switch</span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-1">
            {data.variations.map((v, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (v.badgeShape) {
                    const match = ALL_SHAPES.find((s) => s.id === v.badgeShape);
                    if (match) setSelectedShapeId(match.id);
                  }
                  if (v.themeStyle) {
                    const tMatch = PROCEDURAL_THEMES.find((t) => t.id === v.themeStyle || t.nameUrdu.includes(v.themeStyle));
                    if (tMatch) setSelectedThemeId(tMatch.id);
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-amber-500/20 text-amber-200 hover:text-amber-300 border border-slate-700 hover:border-amber-400 text-center transition-all cursor-pointer"
                title={v.nameEng || v.nameUrdu || `Design ${idx + 1}`}
              >
                <div className="text-xs">
                  {idx === 0 ? "⬭" : idx === 1 ? "🛡️" : idx === 2 ? "🕌" : idx === 3 ? "👑" : idx === 4 ? "💎" : "✨"}
                </div>
                <div className="text-[8px] font-urdu font-bold truncate">{v.nameUrdu || `اسٹائل ${idx + 1}`}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STANDALONE 3D EMBLEM DISPLAY (ATTACHED TO PURE LOGO REF FOR CLEAN DOWNLOAD) */}
      <div ref={pureLogoRef} className="relative w-full py-4 px-2 flex flex-col items-center justify-center bg-slate-950/40 rounded-3xl border border-amber-500/20">
        {/* Soft Ambient Radial Light Halo */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full blur-3xl opacity-60 transform scale-75"
          style={{ background: currentTheme.glow }}
        />

        {/* 3D SVG EMBLEM CENTERPIECE */}
        <div className="relative z-10 w-48 h-56 flex items-center justify-center filter drop-shadow-[0_16px_30px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:scale-105">
          {/* Wings Accessory if active */}
          {activeAccessories.includes("wings") && (
            <div className="absolute -inset-x-8 top-12 flex justify-between pointer-events-none z-0 opacity-85">
              <span className="text-4xl filter drop-shadow-md">🪽</span>
              <span className="text-4xl filter drop-shadow-md scale-x-[-1]">🪽</span>
            </div>
          )}

          {/* 0. INTERLOCKING OVAL BADGE (ANNA / ABRAR MONOGRAM STYLE) */}
          {currentShape === "interlocking_oval" && (
            <svg viewBox="0 0 220 250" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="dynOvalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={currentTheme.goldLight} />
                  <stop offset="40%" stopColor={currentTheme.goldMain} />
                  <stop offset="80%" stopColor={currentTheme.goldDark} />
                  <stop offset="100%" stopColor={currentTheme.goldMain} />
                </linearGradient>
                <radialGradient id="dynOvalBg" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor={currentTheme.bg2} />
                  <stop offset="70%" stopColor={currentTheme.bg1} />
                  <stop offset="100%" stopColor="#030407" />
                </radialGradient>
              </defs>

              {/* Outer Oval Badge */}
              <ellipse cx="110" cy="125" rx="88" ry="112" fill="url(#dynOvalBg)" stroke="url(#dynOvalGrad)" strokeWidth="4" />
              <ellipse cx="110" cy="125" rx="78" ry="102" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeDasharray="3 3" />

              {/* Decorative Stars / Accents */}
              <text x="110" y="38" textAnchor="middle" dominantBaseline="middle" fontSize={activeAccessories.includes("crown") ? "18" : "14"} fill={currentTheme.goldLight}>
                {activeAccessories.includes("crown") ? "👑" : activeAccessories.includes("crescent") ? "🌙" : "✦"}
              </text>
              <text x="110" y="215" textAnchor="middle" dominantBaseline="middle" fontSize="14" fill={currentTheme.goldLight}>
                {activeAccessories.includes("sparkles") ? "✨" : "✦"}
              </text>

              {/* Interlocking Curved Bridge Lines */}
              <path
                d="M 50,125 Q 110,85 170,125"
                fill="none"
                stroke="url(#dynOvalGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M 50,125 Q 110,165 170,125"
                fill="none"
                stroke="url(#dynOvalGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* Center Monogram Letters */}
              <text
                x="110"
                y="125"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-serif font-black tracking-wider"
                fontSize="46"
                fill="url(#dynOvalGrad)"
                filter="drop-shadow(0 2px 8px rgba(0,0,0,0.9))"
              >
                {initials}
              </text>

              {/* Urdu script badge */}
              {rawUrduText && (
                <text
                  x="110"
                  y="172"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-urdu font-black"
                  fontSize="20"
                  fill={currentTheme.goldLight}
                  filter="drop-shadow(0 1px 4px rgba(0,0,0,0.8))"
                >
                  {rawUrduText.split(" ")[0]}
                </text>
              )}
            </svg>
          )}

          {/* 1. MIHRAB / LOTUS TEARDROP */}
          {(currentShape === "mihrab" || currentShape === "lotus_teardrop") && (
            <svg viewBox="0 0 200 240" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="dynTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={currentTheme.bg1} />
                  <stop offset="50%" stopColor={currentTheme.bg2} />
                  <stop offset="100%" stopColor={currentTheme.bg1} />
                </linearGradient>
                <linearGradient id="dynGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={currentTheme.goldLight} />
                  <stop offset="40%" stopColor={currentTheme.goldMain} />
                  <stop offset="80%" stopColor={currentTheme.goldDark} />
                  <stop offset="100%" stopColor={currentTheme.goldMain} />
                </linearGradient>
                <radialGradient id="dynCreamGrad" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#FFFDF7" />
                  <stop offset="70%" stopColor="#F5EFE0" />
                  <stop offset="100%" stopColor="#E5DAC0" />
                </radialGradient>
                <pattern id="dynArabesque" width="18" height="18" patternUnits="userSpaceOnUse">
                  <path d="M 0 9 L 9 0 L 18 9 L 9 18 Z" fill="none" stroke="rgba(180,140,60,0.3)" strokeWidth="0.8" />
                  <circle cx="9" cy="9" r="3.5" fill="none" stroke="rgba(180,140,60,0.2)" strokeWidth="0.8" />
                </pattern>
                <clipPath id="dynClip">
                  <path d="M 100,25 C 135,65 175,115 175,155 C 175,200 140,225 100,225 C 60,225 25,200 25,155 C 25,115 65,65 100,25 Z" />
                </clipPath>
              </defs>

              <path
                d="M 100,15 C 145,58 190,110 190,155 C 190,210 150,238 100,238 C 50,238 10,210 10,155 C 10,110 55,58 100,15 Z"
                fill="url(#dynTealGrad)"
                stroke="url(#dynGoldGrad)"
                strokeWidth="3.5"
              />
              <path
                d="M 100,25 C 135,65 175,115 175,155 C 175,200 140,225 100,225 C 60,225 25,200 25,155 C 25,115 65,65 100,25 Z"
                fill="url(#dynCreamGrad)"
                stroke="url(#dynGoldGrad)"
                strokeWidth="1.8"
              />
              <rect x="0" y="0" width="200" height="240" fill="url(#dynArabesque)" clipPath="url(#dynClip)" />

              {/* Top Motif */}
              <text x="100" y="60" textAnchor="middle" dominantBaseline="middle" fontSize="22">
                {activeAccessories.includes("crown") ? "👑" : activeAccessories.includes("crescent") ? "🌙" : "🕌"}
              </text>

              {/* Calligraphy */}
              <text
                x="100"
                y="136"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-urdu font-black"
                fontSize="38"
                fill="url(#dynGoldGrad)"
                stroke={currentTheme.bg1}
                strokeWidth="1"
              >
                {rawUrduText ? rawUrduText.split(" ")[0] : initials}
              </text>
            </svg>
          )}

          {/* 2. 3D CIRCULAR MEDALLION / LAUREL CROWN / CRESCENT */}
          {(currentShape === "circle_medallion" || currentShape === "laurel_crown" || currentShape === "crescent_star") && (
            <svg viewBox="0 0 220 220" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="dynCGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={currentTheme.goldLight} />
                  <stop offset="35%" stopColor={currentTheme.goldMain} />
                  <stop offset="75%" stopColor={currentTheme.goldDark} />
                  <stop offset="100%" stopColor={currentTheme.goldMain} />
                </linearGradient>
                <radialGradient id="dynCDarkGrad" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor={currentTheme.bg2} />
                  <stop offset="70%" stopColor={currentTheme.bg1} />
                  <stop offset="100%" stopColor="#070503" />
                </radialGradient>
              </defs>

              <circle cx="110" cy="110" r="102" fill="url(#dynCGoldGrad)" stroke="#5c3f08" strokeWidth="2" />
              <circle cx="110" cy="110" r="94" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="3 4" />
              <circle cx="110" cy="110" r="88" fill="url(#dynCDarkGrad)" stroke="url(#dynCGoldGrad)" strokeWidth="2" />

              <text x="110" y="58" textAnchor="middle" dominantBaseline="middle" fontSize="26">
                {activeAccessories.includes("crown") ? "👑" : currentShape === "crescent_star" || activeAccessories.includes("crescent") ? "🌙" : "👑"}
              </text>

              {(activeAccessories.includes("laurel") || currentShape === "laurel_crown") && (
                <>
                  <text x="44" y="112" textAnchor="middle" dominantBaseline="middle" fontSize="20">
                    🌿
                  </text>
                  <text x="176" y="112" textAnchor="middle" dominantBaseline="middle" fontSize="20">
                    🌿
                  </text>
                </>
              )}

              <text
                x="110"
                y="118"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-urdu font-black"
                fontSize="42"
                fill="url(#dynCGoldGrad)"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))"
              >
                {rawUrduText ? rawUrduText.split(" ")[0] : initials}
              </text>

              <text
                x="110"
                y="162"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-urdu font-bold"
                fontSize="12"
                fill={currentTheme.goldLight}
              >
                {currentTheme.nameUrdu.split(" ")[0]}
              </text>
            </svg>
          )}

          {/* 3. 3D RUBY HEART CREST */}
          {currentShape === "ruby_heart" && (
            <svg viewBox="0 0 220 220" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="dynHGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE4E6" />
                  <stop offset="35%" stopColor="#FB7185" />
                  <stop offset="75%" stopColor="#9F1239" />
                  <stop offset="100%" stopColor="#FB7185" />
                </linearGradient>
                <radialGradient id="dynHRubyGrad" cx="50%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FF2A55" />
                  <stop offset="40%" stopColor="#BE123C" />
                  <stop offset="80%" stopColor="#881337" />
                  <stop offset="100%" stopColor="#4C0519" />
                </radialGradient>
              </defs>

              <path
                d="M 110,65 C 110,35 60,15 40,50 C 20,85 60,130 110,185 C 160,130 200,85 180,50 C 160,15 110,35 110,65 Z"
                fill="url(#dynHRubyGrad)"
                stroke="url(#dynHGoldGrad)"
                strokeWidth="4"
              />
              <path
                d="M 110,75 C 110,48 70,30 52,60 C 36,90 70,126 110,170 C 150,126 184,90 168,60 C 150,30 110,48 110,75 Z"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
              />

              <text x="110" y="48" textAnchor="middle" dominantBaseline="middle" fontSize="18">
                {activeAccessories.includes("crown") ? "👑" : "✨"}
              </text>

              <text
                x="110"
                y="112"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-urdu font-black"
                fontSize="42"
                fill="#FFF"
                stroke="#881337"
                strokeWidth="0.8"
                filter="drop-shadow(0 2px 6px rgba(0,0,0,0.6))"
              >
                {rawUrduText ? rawUrduText.split(" ")[0] : initials}
              </text>
            </svg>
          )}

          {/* 4. 3D SHIELD / DIAMOND / HEXAGON / OVAL */}
          {currentShape !== "interlocking_oval" &&
            currentShape !== "mihrab" &&
            currentShape !== "lotus_teardrop" &&
            currentShape !== "circle_medallion" &&
            currentShape !== "laurel_crown" &&
            currentShape !== "crescent_star" &&
            currentShape !== "ruby_heart" && (
              <svg viewBox="0 0 220 220" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="dynSGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={currentTheme.goldLight} />
                    <stop offset="35%" stopColor={currentTheme.goldMain} />
                    <stop offset="75%" stopColor={currentTheme.goldDark} />
                    <stop offset="100%" stopColor={currentTheme.goldMain} />
                  </linearGradient>
                  <radialGradient id="dynSEmeraldGrad" cx="50%" cy="35%" r="65%">
                    <stop offset="0%" stopColor={currentTheme.bg2} />
                    <stop offset="70%" stopColor={currentTheme.bg1} />
                    <stop offset="100%" stopColor="#020d09" />
                  </radialGradient>
                </defs>

                <path
                  d="M 110,20 L 180,20 L 180,105 C 180,150 145,185 110,200 C 75,185 40,150 40,105 L 40,20 Z"
                  fill="url(#dynSEmeraldGrad)"
                  stroke="url(#dynSGoldGrad)"
                  strokeWidth="4"
                />
                <path
                  d="M 110,32 L 168,32 L 168,102 C 168,140 138,172 110,185 C 82,172 52,140 52,102 L 52,32 Z"
                  fill="none"
                  stroke="rgba(254,240,138,0.4)"
                  strokeWidth="1.5"
                />

                <text x="110" y="58" textAnchor="middle" dominantBaseline="middle" fontSize="24">
                  {activeAccessories.includes("crown") ? "👑" : currentShape === "diamond_star" ? "💎" : "🛡️"}
                </text>

                <text
                  x="110"
                  y="114"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-urdu font-black"
                  fontSize="42"
                  fill="url(#dynSGoldGrad)"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))"
                >
                  {rawUrduText ? rawUrduText.split(" ")[0] : initials}
                </text>

                <text x="110" y="160" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill={currentTheme.goldLight}>
                  ✦ ✦ ✦
                </text>
              </svg>
            )}
        </div>

        {/* Typography Below Emblem */}
        <div className="mt-3 text-center space-y-0.5">
          <h4 className="text-base font-urdu font-black text-slate-900 drop-shadow-xs">
            {rawUrduText || rawLogoText}
          </h4>
          {rawLogoText && rawLogoText !== rawUrduText && (
            <p className="text-xs font-serif font-bold tracking-wider text-amber-700 uppercase">
              {rawLogoText}
            </p>
          )}
          <p className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
            — {currentTheme.nameUrdu} —
          </p>
        </div>
      </div>

      {/* QUICK CUSTOMIZATION TABS (ڈیزائن تبدیل کریں / عناصر شامل کریں / تھیم بدلیں) */}
      <div className="bg-slate-100/90 p-2 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-around border-b border-slate-200 pb-1.5 text-[11px] font-urdu font-bold">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "shapes" ? "preview" : "shapes")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "shapes"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-700 hover:bg-slate-200/80"
            }`}
          >
            🎨 ڈیزائن و بیج بدلیں
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "elements" ? "preview" : "elements")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "elements"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-700 hover:bg-slate-200/80"
            }`}
          >
            👑 عناصر شامل کریں ({activeAccessories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "themes" ? "preview" : "themes")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "themes"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-700 hover:bg-slate-200/80"
            }`}
          >
            🌈 رنگ و تھیم
          </button>
        </div>

        {/* 1. SHAPES SELECTOR GRID */}
        {activeTab === "shapes" && (
          <div className="grid grid-cols-2 gap-1.5 pt-1 animate-fade-in">
            {ALL_SHAPES.map((shapeItem) => {
              const isSelected = currentShape === shapeItem.id;
              return (
                <button
                  key={shapeItem.id}
                  type="button"
                  onClick={() => setSelectedShapeId(shapeItem.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-right transition-all font-urdu text-[11px] cursor-pointer ${
                    isSelected
                      ? "bg-amber-100 border-amber-500 text-amber-950 font-black shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-amber-50/50"
                  }`}
                >
                  <span className="text-base">{shapeItem.icon}</span>
                  <span className="truncate flex-1">{shapeItem.labelUrdu}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. ACCESSORIES & ELEMENTS SELECTOR */}
        {activeTab === "elements" && (
          <div className="grid grid-cols-3 gap-1.5 pt-1 animate-fade-in">
            {[
              { id: "crown" as DecorativeElement, labelUrdu: "شاہی تاج", icon: "👑" },
              { id: "wings" as DecorativeElement, labelUrdu: "شاہی ونگز", icon: "🪽" },
              { id: "laurel" as DecorativeElement, labelUrdu: "گولڈن لاریل", icon: "🌿" },
              { id: "crescent" as DecorativeElement, labelUrdu: "چاند تارا", icon: "🌙" },
              { id: "sparkles" as DecorativeElement, labelUrdu: "اسپارکلز", icon: "✨" },
              { id: "shield" as DecorativeElement, labelUrdu: "شیلڈ ایمبلم", icon: "🛡️" },
            ].map((el) => {
              const isActive = activeAccessories.includes(el.id);
              return (
                <button
                  key={el.id}
                  type="button"
                  onClick={() => toggleAccessory(el.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all font-urdu text-[10px] cursor-pointer ${
                    isActive
                      ? "bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">{el.icon}</span>
                  <span className="mt-0.5">{el.labelUrdu}</span>
                  <span className="text-[8px] font-sans font-bold">{isActive ? "✓ شامل ہے" : "+ شامل کریں"}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 3. THEMES SELECTOR */}
        {activeTab === "themes" && (
          <div className="space-y-1 pt-1 animate-fade-in">
            {PROCEDURAL_THEMES.map((themeItem) => {
              const isSelected = currentTheme.id === themeItem.id;
              return (
                <button
                  key={themeItem.id}
                  type="button"
                  onClick={() => setSelectedThemeId(themeItem.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-right transition-all font-urdu text-[11px] cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-amber-400 text-amber-300 font-bold shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs" style={{ background: themeItem.bg1 }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs -mr-1" style={{ background: themeItem.goldMain }} />
                  </div>
                  <span className="truncate">{themeItem.nameUrdu}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons: Next Unique Dynamic Style & 4K Download */}
      <div className="flex flex-col gap-2">
        {/* Dynamic Re-Roll / Next Unique 3D Style Button */}
        <button
          type="button"
          onClick={handleNextDynamicStyle}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-amber-500/40 shadow-sm cursor-pointer transition-all active:scale-95 font-urdu"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span>نیا منفرد 3D ڈیزائن تیار کریں 🔄 (Generate Another Unique Style)</span>
        </button>

        {/* 1-Click 4K HD PNG Pure Logo Download Button */}
        <button
          type="button"
          disabled={isDownloading}
          onClick={handleDownloadPureLogo}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 border-2 border-amber-300 shadow-lg shadow-amber-900/30 cursor-pointer transition-all active:scale-95 font-urdu disabled:opacity-50"
        >
          {downloadSuccess ? <Check className="w-4 h-4 text-emerald-950 font-bold" /> : <Download className="w-4 h-4 text-slate-950 font-bold" />}
          <span>
            {isDownloading
              ? "صرف 4K HD لوگو ڈاؤن لوڈ ہو رہا ہے..."
              : downloadSuccess
              ? "شاہی لوگو ڈاؤن لوڈ ہو گیا! ✓"
              : "👑 4K پریمیم لوگو ڈاؤن لوڈ کریں (صرف لوگو PNG)"}
          </span>
        </button>
      </div>
    </div>
  );
};
