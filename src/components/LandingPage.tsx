import React from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LogIn,
  User,
  LogOut,
  ExternalLink,
  BookOpen,
  Volume2,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2,
  BookmarkCheck,
} from "lucide-react";
import { IslamicLogo } from "./IslamicLogo";
import { UserAccount, LanguageOption } from "../types";

interface LandingPageProps {
  onOpenChat: (initialPrompt?: string) => void;
  onOpenAuth: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  language: LanguageOption;
  onChangeLanguage: (lang: LanguageOption) => void;
  onOpenKnowledgeBase: () => void;
  onOpenCalendar: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenChat,
  onOpenAuth,
  currentUser,
  onLogout,
  language,
  onChangeLanguage,
  onOpenKnowledgeBase,
  onOpenCalendar,
}) => {
  const sampleQuestions = [
    {
      title: "اولاد کی اصلاح",
      prompt: "اگر بچے بات نا مانے تو قرآن و سنت کی روشنی میں رہنمائی فرمائیں",
      badge: "تربیت",
    },
    {
      title: "مسائلِ طہارت",
      prompt: "وضو کے بعد تولیہ استعمال کرنے کا کیا شرعی حکم ہے؟",
      badge: "شرعی فتویٰ",
    },
    {
      title: "آیت الکرسی و فضائل",
      prompt: "آیت الکرسی کا مکمل عربی متن اور مولانا حافظ عبدالسلام بھٹوی کا ترجمہ و فضیلت بیان فرمائیں",
      badge: "قرآن و تفسیر",
    },
    {
      title: "احادیثِ مبارکہ",
      prompt: "صحیح بخاری کی پہلی حدیث انما الاعمال بالنیات کا متن مع ترجمہ اور تفسیری نکات بتائیں",
      badge: "صحیح حدیث",
    },
  ];

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-[#050c0a] text-slate-100 font-sans selection:bg-emerald-600 selection:text-white overflow-x-hidden relative"
    >
      {/* Background Decorative Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 right-1/4 w-[650px] h-[650px] bg-emerald-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 -left-32 w-[550px] h-[550px] bg-teal-500/10 rounded-full blur-[180px]" />
        <div className="absolute -bottom-32 right-10 w-[700px] h-[700px] bg-emerald-950/40 rounded-full blur-[200px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:36px_36px] opacity-5" />
      </div>

      {/* =========================================================================
          1. TOP NAVIGATION BAR (Clean with Top-Side Login Button)
      ========================================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#050c0a]/85 border-b border-emerald-900/30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Right: Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <IslamicLogo className="w-11 h-11 rounded-2xl shadow-lg shadow-emerald-950/80 border border-emerald-500/40 group-hover:scale-105 transition-transform" />
              <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#050c0a] rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white font-sans">
                  Islamic ChatGPT
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                  v3.7 PRO
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 font-urdu font-medium">
                مستند اسلامی ڈیجیٹل اسسٹنٹ
              </p>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-urdu font-medium text-slate-300">
            <a href="#home" className="hover:text-emerald-300 transition-colors text-emerald-400 font-bold">
              ہوم
            </a>
            <a href="#features" className="hover:text-emerald-300 transition-colors">
              خصوصیات
            </a>
            <button
              onClick={onOpenKnowledgeBase}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              کتب خانہ
            </button>
            <button
              onClick={onOpenCalendar}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              اسلامی کیلنڈر
            </button>
          </nav>

          {/* Left: Top Corner Action Buttons (Login & Direct Chat) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#091b15] border border-emerald-800/40 rounded-xl p-1 text-xs">
              <button
                onClick={() => onChangeLanguage("urdu")}
                className={`px-2.5 py-1 rounded-lg font-urdu transition-all ${
                  language === "urdu"
                    ? "bg-emerald-600 text-white font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                اردو PK
              </button>
              <button
                onClick={() => onChangeLanguage("english")}
                className={`px-2.5 py-1 rounded-lg font-sans transition-all ${
                  language === "english"
                    ? "bg-emerald-600 text-white font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>

            {/* Top Corner Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-[#0c241d] border border-emerald-700/50 rounded-2xl px-3 py-1.5 shadow-md">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="hidden sm:inline-block text-xs font-bold text-emerald-200 font-urdu max-w-[100px] truncate">
                  {currentUser.name || currentUser.email}
                </span>
                <button
                  onClick={onLogout}
                  title="لاگ آؤٹ"
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenAuth();
                }}
                className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-800/80 to-teal-800/80 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold font-urdu rounded-xl border border-emerald-500/50 shadow-md shadow-emerald-950/60 hover:shadow-emerald-700/30 transition-all flex items-center gap-2 cursor-pointer group"
              >
                <LogIn className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                <span>لاگ ان / سائن ان</span>
              </button>
            )}

            {/* Direct Start Chat CTA Button */}
            <button
              onClick={() => onOpenChat()}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm font-urdu rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>چیٹ کھولیں</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION (Device Model & Islamic Headline)
      ========================================================================= */}
      <section id="home" className="relative z-10 pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Right Column (Hero Headline, Ayah, Action Buttons) */}
          <div className="lg:col-span-6 space-y-6 text-right">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-urdu font-bold shadow-md shadow-emerald-950">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>قرآن مجید، صحیح احادیث اور مستند فتاویٰ پر مبنی اسٹوڈیو</span>
            </div>

            {/* Big Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-urdu leading-[1.35] tracking-tight">
              پہلا مستند اسلامی چیٹ جی پی ٹی و علمی معاون
            </h1>

            {/* Subheading / Description */}
            <p className="text-sm sm:text-base text-slate-300 font-urdu leading-relaxed max-w-2xl">
              قرآن مجید کے مستند تراجم (مولانا حافظ عبدالسلام بن محمد بھٹویؒ)، صحاح ستہ کتبِ احادیث، فتاویٰ لجنۃ العلماء (alulama.org)، اور دینی کتب خانہ کے ساتھ آپ کا ہمہ وقت علمی و شرعی ساتھی۔
            </p>

            {/* Quranic Ayah Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#031d15] to-[#01140e] border border-emerald-500/40 shadow-xl shadow-emerald-950/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              <p className="font-quran font-arabic text-base sm:text-xl text-emerald-200 leading-[2.4] tracking-wide text-right">
                ﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾
              </p>
              <p className="text-xs sm:text-sm text-slate-300 font-urdu mt-1 text-right font-medium">
                "اور کہو: اے میرے رب! میرے علم میں اضافہ فرما۔"
              </p>
              <span className="inline-block text-[11px] text-emerald-400 font-mono mt-0.5">
                — سورۃ طہ: آیت 114 | ترجمہ: مولانا حافظ عبدالسلام بن محمد بھٹویؒ
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => onOpenChat()}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base font-urdu rounded-2xl shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/50 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <Sparkles className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span>ابھی سوال پوچھیں</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenAuth();
                }}
                className="px-5 py-3.5 bg-[#0a1e18] hover:bg-[#0f2e24] text-emerald-300 font-bold text-sm sm:text-base font-urdu rounded-2xl border border-emerald-600/50 shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>لاگ ان / اکاؤنٹ بنائیں</span>
              </button>

              <button
                onClick={onOpenKnowledgeBase}
                className="px-4 py-3.5 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-medium text-xs sm:text-sm font-urdu rounded-2xl border border-slate-800 transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>کتب خانہ دیکھیں</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-3 flex flex-wrap items-center gap-4 text-xs font-urdu text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>100% مستند اہل سنت مواد</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>لجنۃ العلماء للإفتاء مصدقہ</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <BookmarkCheck className="w-4 h-4" />
                <span>حافظ عبدالسلام بھٹویؒ ترجمہ</span>
              </div>
            </div>
          </div>

          {/* Left Column (Interactive Laptop & Screen Showcase Model) */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 via-teal-600/15 to-transparent rounded-3xl blur-3xl" />

            {/* Device Mockup Frame */}
            <div className="relative w-full max-w-xl bg-gradient-to-b from-[#0e2720] to-[#040e0b] border-2 border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/90 p-4 sm:p-5 backdrop-blur-xl">
              
              {/* Mockup Header Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-[11px] font-mono text-emerald-300 bg-black/40 px-3 py-1 rounded-full border border-emerald-800/40 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>chat.islamic-chatgpt.ai</span>
                </div>
              </div>

              {/* Chat Simulation Content */}
              <div className="space-y-3.5 text-right font-urdu text-xs sm:text-sm">
                
                {/* User Prompt Bubble */}
                <div className="flex items-start gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow">
                    آپ
                  </div>
                  <div className="bg-[#0b2921] border border-emerald-700/40 rounded-2xl rounded-tr-sm p-3 text-slate-100 shadow-md max-w-[85%]">
                    اگر بچے بات نہ مانیں تو قرآن و سنت کی روشنی میں رہنمائی فرمائیں؟
                  </div>
                </div>

                {/* Islamic ChatGPT Answer Bubble */}
                <div className="flex items-start gap-2.5 justify-start">
                  <IslamicLogo className="w-7 h-7 rounded-xl shrink-0 shadow border border-emerald-500/30" />
                  <div className="bg-[#041712] border border-emerald-900/80 rounded-2xl rounded-tr-sm p-3.5 text-slate-200 shadow-lg space-y-2 max-w-[90%]">
                    <p className="font-bold text-emerald-300 text-xs sm:text-sm">
                      ### اولاد کی تربیت اور ضدی بچوں کی اصلاح کا شرعی طریقہ
                    </p>
                    <div className="bg-[#02110c] border border-emerald-500/30 rounded-xl p-2.5 text-emerald-100 font-quran font-arabic text-xs sm:text-sm leading-relaxed">
                      ﴿وَالَّذِينَ يَقُولُونَ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ...﴾ [الفرقان: 74]
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      نرمی، حکمت اور دعا کے ذریعے بچوں کی اصلاح کریں۔ نبی کریم ﷺ نے فرمایا: «بے شک نرمی جس چیز میں بھی ہو اسے خوبصورت بنا دیتی ہے» [صحیح مسلم: 2594]
                    </p>
                    <div className="pt-1 flex items-center gap-2 text-[10px] text-emerald-400 font-sans">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">صحیح مسلم</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">حافظ عبدالسلام بھٹویؒ</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Mockup Interactive Input Bar */}
              <div className="mt-4 pt-3 border-t border-emerald-900/40 flex items-center gap-2">
                <button
                  onClick={() => onOpenChat("اگر بچے بات نا مانے تو شرعی طریقہ کیا ہے؟")}
                  className="flex-1 text-right bg-[#051410] border border-emerald-700/50 hover:border-emerald-500 text-slate-400 hover:text-white px-3.5 py-2 rounded-xl text-xs font-urdu transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>یہاں اپنا اسلامی یا شرعی سوال لکھیں...</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </button>
                <button
                  onClick={() => onOpenChat()}
                  className="p-2 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all cursor-pointer shadow-md"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>

              {/* Floating Highlight Badges */}
              <div className="absolute -top-4 -right-4 bg-[#0a241b] border border-emerald-400/50 text-emerald-200 text-xs font-urdu font-bold px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>لائیو Gemini 3.6 Flash</span>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-[#081f18] border border-emerald-400/50 text-slate-200 text-xs font-urdu px-3.5 py-1.5 rounded-xl shadow-xl flex items-center gap-2">
                <span>📜 4,500+ فتاویٰ لجنۃ العلماء</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          3. REAL ISLAMIC FEATURES GRID (Authentic & Modern Islamic Capabilities)
      ========================================================================= */}
      <section id="features" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-emerald-900/30">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-urdu font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>ہماری بنیادی خصوصیات و خدمات</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-urdu">
            قرآن، حدیث اور فتاویٰ کی مستند تحقیق ایک ہی جگہ
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-urdu leading-relaxed">
            اسلامی چیٹ جی پی ٹی آپ کے لیے قرآن مجید کے مستند تراجم، صحاح ستہ احادیث اور لجنۃ العلماء کے تصدیق شدہ فتاویٰ تک فوری رسائی ممکن بناتا ہے۔
          </p>
        </div>

        {/* 6 Core Authentic Islamic Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* 1. Quran & Authentic Tafseer (Bhuttawi) */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#071c16] to-[#04120e] border border-emerald-700/40 hover:border-emerald-500/70 transition-all shadow-xl hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/30 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📖
            </div>
            <h3 className="text-lg font-bold text-white font-urdu mb-2 flex items-center justify-between">
              <span>قرآن مجید و مستند تفسیر</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                رسم عثمانی
              </span>
            </h3>
            <p className="text-xs text-slate-300 font-urdu leading-loose">
              مکمل اعراب کے ساتھ مصحفِ مدینہ کا رسم عثمانی اور مولانا حافظ عبدالسلام بن محمد بھٹویؒ کا مستند ترجمہ و تفسیری فوائد۔
            </p>
            <button
              onClick={() => onOpenChat("آیت الکرسی کا مکمل عربی متن اور مولانا حافظ عبدالسلام بھٹوی کا ترجمہ و تفسیری فوائد بتائیں")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-200 font-urdu cursor-pointer"
            >
              <span>قرآنی آیت دیکھیں</span>
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {/* 2. Verified Fatawa Al-Ulama */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#071c16] to-[#04120e] border border-emerald-700/40 hover:border-emerald-500/70 transition-all shadow-xl hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/30 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ⚖️
            </div>
            <h3 className="text-lg font-bold text-white font-urdu mb-2 flex items-center justify-between">
              <span>فتاویٰ لجنۃ العلماء للإفتاء</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                alulama.org
              </span>
            </h3>
            <p className="text-xs text-slate-300 font-urdu leading-loose">
              alulama.org سے تصدیق شدہ براہ راست فتاویٰ، عبادات، معاملات، روزمرہ مسائل اور دارالافتاء کے مصدقہ حوالے مع اصل لنک۔
            </p>
            <button
              onClick={() => onOpenChat("وضو کے بعد تولیہ استعمال کرنے کا شرعی حکم کیا ہے؟")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-200 font-urdu cursor-pointer"
            >
              <span>فتویٰ تلاش کریں</span>
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {/* 3. Sahah Sitta Hadith Database */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#071c16] to-[#04120e] border border-emerald-700/40 hover:border-emerald-500/70 transition-all shadow-xl hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/30 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📜
            </div>
            <h3 className="text-lg font-bold text-white font-urdu mb-2 flex items-center justify-between">
              <span>صحاح ستہ کتبِ احادیث</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                تخریج و اسناد
              </span>
            </h3>
            <p className="text-xs text-slate-300 font-urdu leading-loose">
              صحیح بخاری، صحیح مسلم، سنن ابی داؤد، جامع ترمذی بمع مکمل عربی متن، ترجمہ، حدیث نمبر اور اسناد کی صحت کا حکم۔
            </p>
            <button
              onClick={() => onOpenChat("نیت کی اہمیت پر صحیح بخاری کی پہلی حدیث مع ترجمہ و تخریج بتائیں")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-200 font-urdu cursor-pointer"
            >
              <span>حدیث تلاش کریں</span>
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {/* 4. Digital Islamic Library (RAG) */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#071c16] to-[#04120e] border border-emerald-700/40 hover:border-emerald-500/70 transition-all shadow-xl hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/30 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📚
            </div>
            <h3 className="text-lg font-bold text-white font-urdu mb-2 flex items-center justify-between">
              <span>اسلامی کتب خانہ (PDF سرچ)</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                علمی تحقیق
              </span>
            </h3>
            <p className="text-xs text-slate-300 font-urdu leading-loose">
              مستند کتب کے پی ڈی ایف صفحات کا ذہین مطالعہ، کتب سے متعلق سوالات کے براہ راست دلائل اور حوالے حاصل کرنے کی سہولت۔
            </p>
            <button
              onClick={onOpenKnowledgeBase}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-200 font-urdu cursor-pointer"
            >
              <span>کتب خانہ کھولیں</span>
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {/* 5. Quran Audio Recitations */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#071c16] to-[#04120e] border border-emerald-700/40 hover:border-emerald-500/70 transition-all shadow-xl hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/30 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🔊
            </div>
            <h3 className="text-lg font-bold text-white font-urdu mb-2 flex items-center justify-between">
              <span>قرآنی تلاوت و آڈیو قرات</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                العفاسی و الشریم
              </span>
            </h3>
            <p className="text-xs text-slate-300 font-urdu leading-loose">
              ہر قرآنی آیت کی خوبصورت اور مستند قراء (شیخ مشاری راشد العفاسی اور شیخ سعود الشریم) کی آواز میں لائیو تلاوت سنیں۔
            </p>
            <button
              onClick={() => onOpenChat("سورۃ الفاتحہ کا عربی متن اور مولانا بھٹوی کا ترجمہ دکھائیں")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-200 font-urdu cursor-pointer"
            >
              <span>تلاوت سنیں</span>
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {/* 6. Triple Islamic Calendar */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#071c16] to-[#04120e] border border-emerald-700/40 hover:border-emerald-500/70 transition-all shadow-xl hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/30 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🗓️
            </div>
            <h3 className="text-lg font-bold text-white font-urdu mb-2 flex items-center justify-between">
              <span>تین وقتی اسلامی تقویم</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                ہجری، شمسی، بکرمی
              </span>
            </h3>
            <p className="text-xs text-slate-300 font-urdu leading-loose">
              ہجری (قمری)، عیسوی (شمسی) اور دیسی (بکرمی) تاریخوں کا بیک وقت مطالعہ اور اسلامی اہم ایام و تہواروں کی درست معلومات۔
            </p>
            <button
              onClick={onOpenCalendar}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-200 font-urdu cursor-pointer"
            >
              <span>کیلنڈر دیکھیں</span>
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

        </div>

      </section>

      {/* =========================================================================
          4. QUICK QUESTIONS (Clickable Islamic Prompts)
      ========================================================================= */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-emerald-900/30">
        <div className="text-center space-y-2 mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-white font-urdu">
            اکثر پوچھے جانے والے سوالات سے آغاز کریں
          </h3>
          <p className="text-xs text-slate-400 font-urdu">
            کسی بھی سوال پر کلک کریں اور قرآن و سنت کی روشنی میں مستند جواب حاصل کریں
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleQuestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onOpenChat(item.prompt)}
              className="p-4 rounded-2xl bg-[#081f18] hover:bg-[#0d2f25] border border-emerald-800/40 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-lg flex flex-col justify-between text-right"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {item.badge}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-emerald-200 font-urdu mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 font-urdu line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-900/40 text-[11px] font-bold text-emerald-400 flex items-center justify-end gap-1">
                <span>رہنمائی حاصل کریں</span>
                <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. FOOTER
      ========================================================================= */}
      <footer className="relative z-10 bg-[#030a08] border-t border-emerald-900/40 py-10 px-4 sm:px-6 lg:px-8 text-center font-urdu">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <IslamicLogo className="w-8 h-8 rounded-xl shadow border border-emerald-500/30" />
            <span className="text-lg font-black text-white font-sans">Islamic ChatGPT</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl mx-auto">
            مستند فتاویٰ لجنۃ العلماء للإفتاء (alulama.org) اور مولانا حافظ عبدالسلام بن محمد بھٹویؒ کے مستند ترجمہ و تفسیر کے ساتھ۔
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-emerald-400 font-medium pt-2">
            <a href="https://alulama.org/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              <span>لجنۃ العلماء للإفتاء</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <button onClick={() => onOpenChat()} className="hover:underline cursor-pointer">
              چیٹ اسکرین
            </button>
            <span>•</span>
            <button onClick={onOpenAuth} className="hover:underline cursor-pointer">
              لاگ ان / اکاؤنٹ
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-sans pt-2">
            © 2026 Islamic ChatGPT. Built with Google Gemini 3.6 Flash. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};
