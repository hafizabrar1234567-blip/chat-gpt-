import React from "react";
import { Sparkles, Zap, ArrowLeft } from "lucide-react";
import { IslamicLogo } from "./IslamicLogo";
import { ScreenTab, FeatureType } from "../types";

interface HeaderProps {
  activeTab: ScreenTab;
  activeResult: boolean;
  selectedTool?: FeatureType;
  onBack?: () => void;
  usedGenerations: number;
  maxGenerations: number;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  activeResult,
  selectedTool = "create_everything",
  onBack,
  usedGenerations,
  maxGenerations,
  onOpenProfile,
}) => {
  const getScreenTitle = (): string => {
    if (activeResult) return "AI Result ✨";
    if (activeTab === "ideas") return "Content Ideas ✨";
    if (activeTab === "history") return "Your Creations";
    if (activeTab === "profile") return "Profile & Settings";
    if (activeTab === "create") {
      switch (selectedTool) {
        case "image_caption":
          return "📸 Caption Generator";
        case "reel_script":
          return "🎬 Reel Script Generator";
        case "hashtags":
          return "#️⃣ Hashtag Generator";
        case "whatsapp_status":
          return "📱 WhatsApp Status";
        case "social_post":
          return "📝 Social Post";
        case "create_everything":
          return "✨ Create Everything";
        default:
          return "Create with AI";
      }
    }
    return "Islamic ChatGPT";
  };

  const isInnerScreen = activeTab !== "home" || activeResult;

  if (isInnerScreen && onBack) {
    return (
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-3 text-[#111827] shrink-0 shadow-xs transition-colors">
        <div className="w-full flex items-center justify-between gap-2">
          {/* Prominent Back Arrow & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-[#1F2937] active:scale-95 transition-all shadow-xs flex items-center gap-1.5 shrink-0 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              aria-label="Go Back"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 text-[#1F2937] stroke-[2.5]" />
              <span className="text-xs font-bold text-[#1F2937]">Back</span>
            </button>

            <div className="min-w-0">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight truncate text-[#111827]">
                {getScreenTitle()}
              </h1>
            </div>
          </div>

          {/* Usage Tracker Badge */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition-all shrink-0 active:scale-95 shadow-xs"
            title="Daily Usage Limit Status"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-mono text-[11px] text-slate-700">
              <strong className="text-slate-900">{usedGenerations}</strong>/{maxGenerations}
            </span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-emerald-100/80 px-4 py-3.5 text-[#111827] shrink-0 shadow-xs">
      <div className="w-full flex items-center justify-between gap-2">
        {/* Main Brand Header for Home Screen */}
        <div className="flex items-center gap-2.5">
          <IslamicLogo className="w-10 h-10" />
          <div>
            <h1 className="font-black text-base tracking-tight leading-none flex items-center gap-1.5 text-slate-900">
              <span>Islamic & AI ChatGPT</span>
              <span className="text-[10px] font-bold bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-2.5 py-0.5 rounded-full shadow-xs font-urdu-ui">
                اسلامی و AI معاون
              </span>
            </h1>
            <p className="text-[11px] text-emerald-800 font-semibold leading-normal mt-0.5 font-urdu-ui">
              قرآن، صحیح احادیث و جدید مصنوعی ذہانت (AI)
            </p>
          </div>
        </div>

        {/* Usage Tracker Badge */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-emerald-50 hover:from-amber-100 hover:to-emerald-100 border border-amber-200/80 text-xs font-semibold transition-all shrink-0 active:scale-95 shadow-xs"
          title="Daily Usage Limit Status"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
          <span className="text-amber-950 font-mono text-[11px]">
            <strong className="text-emerald-900 font-bold">{usedGenerations}</strong>/{maxGenerations}
          </span>
        </button>
      </div>
    </header>
  );
};
