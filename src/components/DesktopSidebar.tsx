import React from "react";
import {
  MessageSquare,
  History,
  User,
  Sparkles,
  Zap,
  LogOut,
  PenTool,
  Code2,
  BarChart3,
  Scale,
  BookOpen,
  Crown,
} from "lucide-react";
import { ScreenTab, UserAccount } from "../types";
import { IslamicLogo } from "./IslamicLogo";

interface DesktopSidebarProps {
  activeTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  usedGenerations: number;
  maxGenerations: number;
  historyCount: number;
  user: UserAccount | null;
  onLogout: () => void;
  onQuickPrompt?: (prompt: string) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  usedGenerations,
  maxGenerations,
  historyCount,
  user,
  onLogout,
  onQuickPrompt,
}) => {
  const navItems = [
    {
      id: "home" as ScreenTab,
      label: "AI چیٹ و معاون",
      subLabel: "Islamic & AI ChatGPT",
      icon: MessageSquare,
    },
    {
      id: "history" as ScreenTab,
      label: "تاریخچہ و ریکارڈ",
      subLabel: "Saved History",
      icon: History,
      badge: historyCount,
    },
    {
      id: "profile" as ScreenTab,
      label: "پروفائل و اکاؤنٹ",
      subLabel: "Settings & Quota",
      icon: User,
    },
  ];

  const quickCategories = [
    {
      icon: "📖",
      title: "ترجمہ عبدالسلام بھٹوی",
      prompt: "مجھے سورۃ البقرہ (آیات 1 تا 5) کا مکمل اعراب والا عربی متن اور مولانا حافظ عبد السلام بھٹوی رحمہ اللہ کا مستند اردو ترجمہ مع تفسیری نکات لکھ کر دیں۔",
    },
    {
      icon: "⚖️",
      title: "فتاویٰ لجنۃ العلماء",
      prompt: "فتاویٰ لجنۃ العلماء للإفتاء (alulama.org): آن لائن ٹریڈنگ اور ڈیجیٹل کرنسی کا مستند شرعی حکم کیا ہے؟",
    },
    {
      icon: "🗓️",
      title: "3-in-1 کیلنڈر",
      prompt: "آج کی تاریخ کیا ہے؟ مجھے انگریزی، اسلامی ہجری اور پنجابی دیسی تینوں کیلنڈرز کی درست تاریخ بتائیں۔",
    },
    {
      icon: "🤲",
      title: "مسنون دعائیں و اذکار",
      prompt: "صبح و شام کے مسنون اذکار اور حفاظت کی مستند دعائیں اعراب اور اردو ترجمہ کے ساتھ درج کریں۔",
    },
    {
      icon: "🌟",
      title: "صحیح احادیث نبوی ﷺ",
      prompt: "صحیح بخاری اور صحیح مسلم سے والدین کے حقوق اور اخلاقِ حسنہ پر مستند احادیث فراہم کریں۔",
    },
    {
      icon: "📖",
      title: "متشابہات القرآن",
      prompt: "پہلے پارے (الم) کے تمام قرآنی متشابہات الفارق اللفظی کے ساتھ درج کریں۔",
    },
    {
      icon: "✍️",
      title: "اسلامی مضامین",
      prompt: "مجھے 'اخلاقِ حسنہ اور سیرت النبی ﷺ' پر ایک مفصل اسلامی مضمون اور تقریر تیار کر کے دیں۔",
    },
    {
      icon: "👑",
      title: "شاہی لوگو 3D",
      prompt: "میرے نام 'حافظ ابرار' کے لیے ایک نیا 3D شاہی مونوگرام و ڈی پی تیار کریں۔",
    },
  ];

  return (
    <aside className="w-80 bg-[#0F172A] text-white border-r-2 border-slate-800 p-4 flex flex-col justify-between shrink-0 shadow-2xl relative overflow-y-auto select-none">
      {/* Top Brand & Menu Area */}
      <div className="space-y-4">
        {/* Top Brand Header Card */}
        <div className="flex items-center gap-3 p-3 bg-[#1E293B] rounded-2xl border-2 border-slate-700 shadow-md">
          <IslamicLogo className="w-11 h-11" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-black text-sm text-white tracking-tight font-urdu">
                اسلامی چیٹ جی پی ٹی
              </h2>
              <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-md font-mono">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-amber-300 font-urdu font-bold mt-0.5">
              قرآن، صحیح احادیث و AI اسٹوڈیو
            </p>
          </div>
        </div>

        {/* Daily Quota Card - Ultra High Contrast */}
        <div className="bg-[#1E293B] border-2 border-slate-700 rounded-2xl p-3.5 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-white font-urdu font-bold text-xs flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              روزانہ تخلیقی کوٹہ
            </span>
            <span className="font-mono text-xs font-black text-amber-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-700">
              {usedGenerations} / {maxGenerations}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (usedGenerations / maxGenerations) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Main Navigation Links */}
        <div className="space-y-2">
          <div className="bg-[#020617] text-amber-300 border border-slate-800 px-3 py-1 rounded-xl text-[11px] font-urdu font-black tracking-wide flex items-center justify-between">
            <span>مرکزی مینو (Main Menu)</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-150 group cursor-pointer text-right font-urdu border-2 ${
                    isActive
                      ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/60 scale-[1.01]"
                      : "bg-[#1E293B] hover:bg-[#334155] text-white border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isActive
                          ? "bg-slate-950 text-emerald-300 border-emerald-400"
                          : "bg-slate-900 text-emerald-400 border-slate-700 group-hover:border-slate-500"
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.4]" />
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-xs text-white leading-snug">
                        {item.label}
                      </div>
                      <div className="text-[11px] font-semibold text-amber-300 font-sans">
                        {item.subLabel}
                      </div>
                    </div>
                  </div>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-2 py-0.5 rounded-full font-mono shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Launch Categories Grid */}
        <div className="space-y-2 pt-1">
          <div className="bg-[#020617] text-amber-300 border border-slate-800 px-3 py-1 rounded-xl text-[11px] font-urdu font-black tracking-wide flex items-center justify-between">
            <span>فوری فیچرز (Quick Starters)</span>
            <span className="text-[10px] text-emerald-400 font-mono">7 TOOLS</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {quickCategories.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onTabChange("home");
                  if (onQuickPrompt) onQuickPrompt(c.prompt);
                }}
                className="p-2.5 bg-[#1E293B] hover:bg-[#334155] border-2 border-slate-700 hover:border-emerald-500 rounded-xl text-left transition-all text-white flex items-center gap-2 group cursor-pointer shadow-sm active:scale-95"
              >
                <span className="text-base shrink-0">{c.icon}</span>
                <span className="text-xs font-urdu font-bold truncate text-slate-100 group-hover:text-amber-300">
                  {c.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom User Profile Area */}
      <div className="pt-4 mt-4 border-t-2 border-slate-800">
        <div className="flex items-center justify-between p-2.5 bg-[#1E293B] rounded-2xl border-2 border-slate-700 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 border border-emerald-400">
              {user?.name ? user.name.slice(0, 1).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-white truncate">
                {user?.name || "معزز صارف"}
              </div>
              <div className="text-[11px] text-slate-300 truncate font-mono">
                {user?.email || "User Account"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 text-rose-300 transition-colors cursor-pointer shrink-0 ml-1"
            title="لاگ آؤٹ (Sign Out)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
