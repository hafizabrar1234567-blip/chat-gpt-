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
  const isUrdu = language !== "english";

  const content = {
    urdu: {
      tagline: "مستند اسلامی ڈیجیٹل اسسٹنٹ",
      navHome: "ہوم",
      navFeatures: "خصوصیات",
      navLibrary: "کتب خانہ",
      navCalendar: "اسلامی کیلنڈر",
      loginBtn: "لاگ ان / سائن ان",
      loginMobile: "لاگ ان",
      logout: "لاگ آؤٹ",
      chatBtn: "چیٹ کھولیں",
      chatMobile: "چیٹ",
      badge: "قرآن مجید، صحیح احادیث اور مستند فتاویٰ پر مبنی اسٹوڈیو",
      headline: "پہلا مستند اسلامی چیٹ جی پی ٹی و علمی معاون",
      description:
        "قرآن مجید کے مستند تراجم (مولانا حافظ عبدالسلام بن محمد بھٹویؒ)، صحاح ستہ کتبِ احادیث، فتاویٰ لجنۃ العلماء (alulama.org)، اور دینی کتب خانہ کے ساتھ آپ کا ہمہ وقت علمی و شرعی ساتھی۔",
      ayahText: "﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾",
      ayahTranslation: '"اور کہو: اے میرے رب! میرے علم میں اضافہ فرما۔"',
      ayahRef: "— سورۃ طہ: آیت 114 | ترجمہ: مولانا حافظ عبدالسلام بن محمد بھٹویؒ",
      askQuestionBtn: "ابھی سوال پوچھیں",
      loginCreateAccountBtn: "لاگ ان / اکاؤنٹ بنائیں",
      exploreLibraryBtn: "کتب خانہ دیکھیں",
      trust1: "100% مستند اہل سنت مواد",
      trust2: "لجنۃ العلماء للإفتاء مصدقہ",
      trust3: "حافظ عبدالسلام بھٹویؒ ترجمہ",
      mockUserTag: "آپ",
      mockUserPrompt: "اگر بچے بات نہ مانیں تو قرآن و سنت کی روشنی میں رہنمائی فرمائیں؟",
      mockAiTitle: "### اولاد کی تربیت اور ضدی بچوں کی اصلاح کا شرعی طریقہ",
      mockAiAyah:
        "﴿وَالَّذِينَ يَقُولُونَ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ...﴾ [الفرقان: 74]",
      mockAiText:
        "نرمی، حکمت اور دعا کے ذریعے بچوں کی اصلاح کریں۔ نبی کریم ﷺ نے فرمایا: «بے شک نرمی جس چیز میں بھی ہو اسے خوبصورت بنا دیتی ہے» [صحیح مسلم: 2594]",
      mockBadgeMuslim: "صحیح مسلم",
      mockBadgeBhuttawi: "حافظ عبدالسلام بھٹویؒ",
      mockPlaceholder: "یہاں اپنا اسلامی یا شرعی سوال لکھیں...",
      mockFloating1: "لائیو Gemini 3.6 Flash",
      mockFloating2: "📜 4,500+ فتاویٰ لجنۃ العلماء",
      featuresTag: "ہماری بنیادی خصوصیات و خدمات",
      featuresTitle: "قرآن، حدیث اور فتاویٰ کی مستند تحقیق ایک ہی جگہ",
      featuresDesc:
        "اسلامی چیٹ جی پی ٹی آپ کے لیے قرآن مجید کے مستند تراجم، صحاح ستہ احادیث اور لجنۃ العلماء کے تصدیق شدہ فتاویٰ تک فوری رسائی ممکن بناتا ہے۔",
      cards: [
        {
          icon: "📖",
          title: "قرآن مجید و مستند تفسیر",
          tag: "رسم عثمانی",
          desc: "مکمل اعراب کے ساتھ مصحفِ مدینہ کا رسم عثمانی اور مولانا حافظ عبدالسلام بن محمد بھٹویؒ کا مستند ترجمہ و تفسیری فوائد۔",
          action: "قرآنی آیت دیکھیں",
          prompt:
            "آیت الکرسی کا مکمل عربی متن اور مولانا حافظ عبدالسلام بھٹوی کا ترجمہ و تفسیری فوائد بتائیں",
        },
        {
          icon: "⚖️",
          title: "فتاویٰ لجنۃ العلماء للإفتاء",
          tag: "alulama.org",
          desc: "alulama.org سے تصدیق شدہ براہ راست فتاویٰ، عبادات، معاملات، روزمرہ مسائل اور دارالافتاء کے مصدقہ حوالے مع اصل لنک۔",
          action: "فتویٰ تلاش کریں",
          prompt: "وضو کے بعد تولیہ استعمال کرنے کا شرعی حکم کیا ہے؟",
        },
        {
          icon: "📜",
          title: "صحاح ستہ کتبِ احادیث",
          tag: "تخریج و اسناد",
          desc: "صحیح بخاری، صحیح مسلم، سنن ابی داؤد، جامع ترمذی بمع مکمل عربی متن، ترجمہ، حدیث نمبر اور اسناد کی صحت کا حکم۔",
          action: "حدیث تلاش کریں",
          prompt: "نیت کی اہمیت پر صحیح بخاری کی پہلی حدیث مع ترجمہ و تخریج بتائیں",
        },
        {
          icon: "📚",
          title: "اسلامی کتب خانہ (PDF سرچ)",
          tag: "علمی تحقیق",
          desc: "مستند کتب کے پی ڈی ایف صفحات کا ذہین مطالعہ، کتب سے متعلق سوالات کے براہ راست دلائل اور حوالے حاصل کرنے کی سہولت۔",
          action: "کتب خانہ کھولیں",
          isKnowledgeBase: true,
        },
        {
          icon: "🔊",
          title: "قرآنی تلاوت و آڈیو قرات",
          tag: "العفاسی و الشریم",
          desc: "ہر قرآنی آیت کی خوبصورت اور مستند قراء (شیخ مشاری راشد العفاسی اور شیخ سعود الشریم) کی آواز میں لائیو تلاوت سنیں۔",
          action: "تلاوت سنیں",
          prompt: "سورۃ الفاتحہ کا عربی متن اور مولانا بھٹوی کا ترجمہ دکھائیں",
        },
        {
          icon: "🗓️",
          title: "تین وقتی اسلامی تقویم",
          tag: "ہجری، شمسی، بکرمی",
          desc: "ہجری (قمری)، عیسوی (شمسی) اور دیسی (بکرمی) تاریخوں کا بیک وقت مطالعہ اور اسلامی اہم ایام و تہواروں کی درست معلومات۔",
          action: "کیلنڈر دیکھیں",
          isCalendar: true,
        },
      ],
      faqTitle: "اکثر پوچھے جانے والے سوالات سے آغاز کریں",
      faqDesc: "کسی بھی سوال پر کلک کریں اور قرآن و سنت کی روشنی میں مستند جواب حاصل کریں",
      faqBtn: "رہنمائی حاصل کریں",
      sampleQuestions: [
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
          prompt:
            "آیت الکرسی کا مکمل عربی متن اور مولانا حافظ عبدالسلام بھٹوی کا ترجمہ و فضیلت بیان فرمائیں",
          badge: "قرآن و تفسیر",
        },
        {
          title: "احادیثِ مبارکہ",
          prompt:
            "صحیح بخاری کی پہلی حدیث انما الاعمال بالنیات کا متن مع ترجمہ اور تفسیری نکات بتائیں",
          badge: "صحیح حدیث",
        },
      ],
      footerDesc:
        "مستند فتاویٰ لجنۃ العلماء للإفتاء (alulama.org) اور مولانا حافظ عبدالسلام بن محمد بھٹویؒ کے مستند ترجمہ و تفسیر کے ساتھ۔",
      footerLinkFatwa: "لجنۃ العلماء للإفتاء",
      footerLinkChat: "چیٹ اسکرین",
      footerLinkAuth: "لاگ ان / اکاؤنٹ",
      copyright: "© 2026 Islamic ChatGPT. Built with Google Gemini 3.6 Flash. All rights reserved.",
    },
    english: {
      tagline: "Authentic Islamic AI Assistant",
      navHome: "Home",
      navFeatures: "Features",
      navLibrary: "Library",
      navCalendar: "Calendar",
      loginBtn: "Log In / Sign Up",
      loginMobile: "Log In",
      logout: "Log Out",
      chatBtn: "Open Chat",
      chatMobile: "Chat",
      badge: "Powered by Holy Quran, Sahih Hadith & Verified Fatawa",
      headline: "The First Authentic Islamic ChatGPT & Scholarly Assistant",
      description:
        "Your trusted scholarly companion equipped with verified Quranic translations (Hafiz Abdul Salam Bhuttawi rh.), Sahah Sitta Hadith collections, authentic rulings from Lajnat-ul-Ulama (alulama.org), and a digital Islamic library.",
      ayahText: "﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾",
      ayahTranslation: '"And say: My Lord, increase me in knowledge."',
      ayahRef: "— Surah Ta-Ha: Ayah 114 | Translation: Hafiz Abdul Salam Bhuttawi (rh)",
      askQuestionBtn: "Ask a Question Now",
      loginCreateAccountBtn: "Log In / Create Account",
      exploreLibraryBtn: "Explore Library",
      trust1: "100% Authentic Ahl-us-Sunnah Sources",
      trust2: "Verified by Lajnat-ul-Ulama",
      trust3: "Hafiz Abdul Salam Bhuttawi Translation",
      mockUserTag: "You",
      mockUserPrompt: "How should parents guide and discipline children according to Quran & Sunnah?",
      mockAiTitle: "### Guiding and Disciplining Children According to Islamic Principles",
      mockAiAyah:
        "﴿وَالَّذِينَ يَقُولُونَ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ...﴾ [الفرقان: 74]",
      mockAiText:
        "Guide children with kindness, wisdom, and sincere prayer. The Prophet ﷺ said: 'Verily, gentleness does not enter anything except that it beautifies it.' [Sahih Muslim: 2594]",
      mockBadgeMuslim: "Sahih Muslim",
      mockBadgeBhuttawi: "Hafiz Abdul Salam Bhuttawi",
      mockPlaceholder: "Type your Islamic or Shariah question here...",
      mockFloating1: "Live Gemini 3.6 Flash",
      mockFloating2: "📜 4,500+ Al-Ulama Fatawa",
      featuresTag: "Core Capabilities & Services",
      featuresTitle: "Authentic Research in Quran, Hadith & Fatawa in One Place",
      featuresDesc:
        "Islamic ChatGPT provides instant access to authentic Quran translations, Sahah Sitta Hadith collections, and verified rulings from Lajnat-ul-Ulama.",
      cards: [
        {
          icon: "📖",
          title: "Holy Quran & Authentic Tafseer",
          tag: "Uthmani Script",
          desc: "Complete Madinah Uthmani script with full diacritics, accompanied by authentic translation and commentary by Hafiz Abdul Salam Bhuttawi (rh).",
          action: "View Quranic Verse",
          prompt:
            "Provide full Arabic text of Ayat al-Kursi with Hafiz Abdul Salam Bhuttawi translation and commentary virtues.",
        },
        {
          icon: "⚖️",
          title: "Lajnat-ul-Ulama Fatawa",
          tag: "alulama.org",
          desc: "Verified direct fatawa from alulama.org covering acts of worship, commerce, family matters, and daily questions with source links.",
          action: "Search Fatwa",
          prompt: "What is the Shariah ruling on using a towel after performing Wudhu?",
        },
        {
          icon: "📜",
          title: "Sahah Sitta Hadith Database",
          tag: "Isnad & Takhrij",
          desc: "Sahih Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami Tirmidhi with Arabic text, translation, hadith number, and authenticity grade.",
          action: "Search Hadith",
          prompt: "Explain Hadith 1 of Sahih Bukhari 'Actions are by intentions' with translation and scholarly insights.",
        },
        {
          icon: "📚",
          title: "Islamic Digital Library (RAG)",
          tag: "PDF Research",
          desc: "Intelligent AI search through authentic Islamic book PDFs, providing direct page citations, references, and scholarly context.",
          action: "Open Library",
          isKnowledgeBase: true,
        },
        {
          icon: "🔊",
          title: "Quran Audio Recitations",
          tag: "Alafasy & Al-Shuraim",
          desc: "Listen to high-quality audio recitations for any verse by renowned reciters Sheikh Mishary Rashid Alafasy and Sheikh Saud Al-Shuraim.",
          action: "Listen to Recitation",
          prompt: "Show Arabic text of Surah Al-Fatihah with audio recitation and translation",
        },
        {
          icon: "🗓️",
          title: "Triple Islamic Calendar",
          tag: "Hijri, Solar, Bikrami",
          desc: "Simultaneous view of Hijri (Lunar), Gregorian (Solar), and Punjabi Desi (Bikrami) dates along with significant Islamic historical events.",
          action: "View Calendar",
          isCalendar: true,
        },
      ],
      faqTitle: "Start with Frequently Asked Questions",
      faqDesc: "Click any question below to receive an authentic answer grounded in Quran and Sunnah",
      faqBtn: "Get Guidance",
      sampleQuestions: [
        {
          title: "Child Upbringing",
          prompt: "How should parents deal with disobedient children according to Quran & Sunnah?",
          badge: "Parenting",
        },
        {
          title: "Purity & Wudhu",
          prompt: "What is the ruling on using a towel after performing Wudhu?",
          badge: "Shariah Fatwa",
        },
        {
          title: "Ayat al-Kursi & Virtues",
          prompt:
            "Provide full Arabic text of Ayat al-Kursi with Hafiz Abdul Salam Bhuttawi translation and virtues.",
          badge: "Quran & Tafseer",
        },
        {
          title: "Hadith of Intentions",
          prompt:
            "Provide text and translation of Sahih Bukhari Hadith #1 'Actions are by intentions' with scholarly insights.",
          badge: "Sahih Hadith",
        },
      ],
      footerDesc:
        "Powered by verified rulings from Lajnat-ul-Ulama (alulama.org) and authentic translation & tafseer by Hafiz Abdul Salam Bhuttawi (rh).",
      footerLinkFatwa: "Lajnat-ul-Ulama Fatwa",
      footerLinkChat: "Chat Workspace",
      footerLinkAuth: "Log In / Account",
      copyright: "© 2026 Islamic ChatGPT. Built with Google Gemini 3.6 Flash. All rights reserved.",
    },
  };

  const t = isUrdu ? content.urdu : content.english;

  return (
    <div
      dir={isUrdu ? "rtl" : "ltr"}
      className={`min-h-screen w-full bg-[#050c0a] text-slate-100 ${
        isUrdu ? "font-urdu" : "font-sans"
      } selection:bg-emerald-600 selection:text-white overflow-x-hidden relative`}
    >
      {/* Background Decorative Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 right-1/4 w-[650px] h-[650px] bg-emerald-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 -left-32 w-[550px] h-[550px] bg-teal-500/10 rounded-full blur-[180px]" />
        <div className="absolute -bottom-32 right-10 w-[700px] h-[700px] bg-emerald-950/40 rounded-full blur-[200px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:36px_36px] opacity-5" />
      </div>

      {/* =========================================================================
          1. TOP NAVIGATION BAR (Responsive, Mobile-friendly, No Overflow)
      ========================================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#050c0a]/90 border-b border-emerald-900/30 transition-all">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <IslamicLogo className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-950/80 border border-emerald-500/40 group-hover:scale-105 transition-transform" />
              <span className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#050c0a] rounded-full animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-lg lg:text-xl font-black tracking-tight text-white font-sans truncate">
                  Islamic ChatGPT
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                  v3.7 PRO
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-emerald-400 font-medium truncate">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#home" className="hover:text-emerald-300 transition-colors text-emerald-400 font-bold">
              {t.navHome}
            </a>
            <a href="#features" className="hover:text-emerald-300 transition-colors">
              {t.navFeatures}
            </a>
            <button
              onClick={onOpenKnowledgeBase}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {t.navLibrary}
            </button>
            <button
              onClick={onOpenCalendar}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {t.navCalendar}
            </button>
          </nav>

          {/* Action Buttons: Language Switcher, Login & Direct Chat */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#091b15] border border-emerald-800/40 rounded-xl p-0.5 sm:p-1 text-xs">
              <button
                onClick={() => onChangeLanguage("urdu")}
                className={`px-1.5 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs transition-all ${
                  isUrdu
                    ? "bg-emerald-600 text-white font-bold shadow"
                    : "text-slate-400 hover:text-white"
                } font-urdu`}
              >
                اردو
              </button>
              <button
                onClick={() => onChangeLanguage("english")}
                className={`px-1.5 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs transition-all ${
                  !isUrdu
                    ? "bg-emerald-600 text-white font-bold shadow"
                    : "text-slate-400 hover:text-white"
                } font-sans`}
              >
                EN
              </button>
            </div>

            {/* Top Corner Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-[#0c241d] border border-emerald-700/50 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 shadow-md">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="hidden md:inline-block text-xs font-bold text-emerald-200 max-w-[90px] truncate">
                  {currentUser.name || currentUser.email}
                </span>
                <button
                  onClick={onLogout}
                  title={t.logout}
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
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-800/90 to-teal-800/90 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl border border-emerald-500/50 shadow-md shadow-emerald-950/60 hover:shadow-emerald-700/30 transition-all flex items-center gap-1.5 cursor-pointer group shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">{t.loginBtn}</span>
                <span className="inline sm:hidden">{t.loginMobile}</span>
              </button>
            )}

            {/* Direct Start Chat CTA Button */}
            <button
              onClick={() => onOpenChat()}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
            >
              <span className="hidden sm:inline">{t.chatBtn}</span>
              <span className="inline sm:hidden">{t.chatMobile}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isUrdu ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION
      ========================================================================= */}
      <section id="home" className="relative z-10 pt-6 sm:pt-14 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Main Hero Headline & Actions */}
          <div className={`lg:col-span-6 space-y-6 ${isUrdu ? "text-right" : "text-left"}`}>
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-md shadow-emerald-950">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t.badge}</span>
            </div>

            {/* Big Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.35] tracking-tight">
              {t.headline}
            </h1>

            {/* Subheading / Description */}
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {t.description}
            </p>

            {/* Quranic Ayah Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#031d15] to-[#01140e] border border-emerald-500/40 shadow-xl shadow-emerald-950/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              <p
                dir="rtl"
                className="font-quran font-arabic text-base sm:text-xl text-emerald-200 leading-[2.4] tracking-wide text-right"
              >
                {t.ayahText}
              </p>
              <p className={`text-xs sm:text-sm text-slate-300 mt-1 font-medium ${isUrdu ? "text-right" : "text-left"}`}>
                {t.ayahTranslation}
              </p>
              <span className="inline-block text-[11px] text-emerald-400 font-mono mt-0.5">
                {t.ayahRef}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenChat()}
                className="px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-base rounded-2xl shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/50 transition-all flex items-center gap-2.5 cursor-pointer group"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span>{t.askQuestionBtn}</span>
                <ArrowRight className={`w-4 h-4 ${isUrdu ? "rotate-180" : ""}`} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenAuth();
                }}
                className="px-4 sm:px-5 py-3 sm:py-3.5 bg-[#0a1e18] hover:bg-[#0f2e24] text-emerald-300 font-bold text-xs sm:text-base rounded-2xl border border-emerald-600/50 shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.loginCreateAccountBtn}</span>
              </button>

              <button
                onClick={onOpenKnowledgeBase}
                className="px-3.5 sm:px-4 py-3 sm:py-3.5 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-medium text-xs sm:text-sm rounded-2xl border border-slate-800 transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>{t.exploreLibraryBtn}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>{t.trust1}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.trust2}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <BookmarkCheck className="w-4 h-4" />
                <span>{t.trust3}</span>
              </div>
            </div>
          </div>

          {/* Interactive Laptop & Screen Showcase Model */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 via-teal-600/15 to-transparent rounded-3xl blur-3xl" />

            {/* Device Mockup Frame */}
            <div className="relative w-full max-w-xl bg-gradient-to-b from-[#0e2720] to-[#040e0b] border-2 border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/90 p-3.5 sm:p-5 backdrop-blur-xl">
              
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
              <div className="space-y-3 text-xs sm:text-sm">
                {/* User Prompt Bubble */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow">
                    {t.mockUserTag}
                  </div>
                  <div className="bg-[#0b2921] border border-emerald-700/40 rounded-2xl p-3 text-slate-100 shadow-md max-w-[88%] leading-relaxed">
                    {t.mockUserPrompt}
                  </div>
                </div>

                {/* Islamic ChatGPT Answer Bubble */}
                <div className="flex items-start gap-2.5">
                  <IslamicLogo className="w-7 h-7 rounded-xl shrink-0 shadow border border-emerald-500/30" />
                  <div className="bg-[#041712] border border-emerald-900/80 rounded-2xl p-3.5 text-slate-200 shadow-lg space-y-2 max-w-[90%]">
                    <p className="font-bold text-emerald-300 text-xs sm:text-sm">
                      {t.mockAiTitle}
                    </p>
                    <div
                      dir="rtl"
                      className="bg-[#02110c] border border-emerald-500/30 rounded-xl p-2.5 text-emerald-100 font-quran font-arabic text-xs sm:text-sm leading-relaxed text-right"
                    >
                      {t.mockAiAyah}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {t.mockAiText}
                    </p>
                    <div className="pt-1 flex items-center gap-2 text-[10px] text-emerald-400 font-sans">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                        {t.mockBadgeMuslim}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                        {t.mockBadgeBhuttawi}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mockup Interactive Input Bar */}
              <div className="mt-4 pt-3 border-t border-emerald-900/40 flex items-center gap-2">
                <button
                  onClick={() => onOpenChat(t.mockUserPrompt)}
                  className="flex-1 text-left rtl:text-right bg-[#051410] border border-emerald-700/50 hover:border-emerald-500 text-slate-400 hover:text-white px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">{t.mockPlaceholder}</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </button>
                <button
                  onClick={() => onOpenChat()}
                  className="p-2 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all cursor-pointer shadow-md shrink-0"
                >
                  <ArrowRight className={`w-4 h-4 ${isUrdu ? "rotate-180" : ""}`} />
                </button>
              </div>

              {/* Floating Highlight Badges */}
              <div className="hidden sm:flex absolute -top-4 -right-4 bg-[#0a241b] border border-emerald-400/50 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl items-center gap-2 animate-bounce">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{t.mockFloating1}</span>
              </div>

              <div className="hidden sm:flex absolute -bottom-4 -left-4 bg-[#081f18] border border-emerald-400/50 text-slate-200 text-xs px-3.5 py-1.5 rounded-xl shadow-xl items-center gap-2">
                <span>{t.mockFloating2}</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. ISLAMIC FEATURES GRID
      ========================================================================= */}
      <section id="features" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-emerald-900/30">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>{t.featuresTag}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            {t.featuresTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.featuresDesc}
          </p>
        </div>

        {/* 6 Core Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.cards.map((card, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-gradient-to-b from-[#071c16] to-[#04120e] border border-emerald-700/40 hover:border-emerald-500/70 transition-all shadow-xl hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-800/30 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center justify-between">
                  <span>{card.title}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                    {card.tag}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {card.desc}
                </p>
              </div>
              <button
                onClick={() => {
                  if (card.isKnowledgeBase) {
                    onOpenKnowledgeBase();
                  } else if (card.isCalendar) {
                    onOpenCalendar();
                  } else {
                    onOpenChat(card.prompt);
                  }
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-200 cursor-pointer self-start"
              >
                <span>{card.action}</span>
                <ChevronRight className={`w-3.5 h-3.5 ${isUrdu ? "rotate-180" : ""}`} />
              </button>
            </div>
          ))}
        </div>

      </section>

      {/* =========================================================================
          4. QUICK QUESTIONS (Clickable Islamic Prompts)
      ========================================================================= */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-emerald-900/30">
        <div className="text-center space-y-2 mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            {t.faqTitle}
          </h3>
          <p className="text-xs text-slate-400">
            {t.faqDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.sampleQuestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onOpenChat(item.prompt)}
              className={`p-4 rounded-2xl bg-[#081f18] hover:bg-[#0d2f25] border border-emerald-800/40 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-lg flex flex-col justify-between ${
                isUrdu ? "text-right" : "text-left"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {item.badge}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-emerald-200 mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </div>
              <div className={`mt-3 pt-2 border-t border-emerald-900/40 text-[11px] font-bold text-emerald-400 flex items-center ${
                isUrdu ? "justify-end" : "justify-start"
              } gap-1`}>
                <span>{t.faqBtn}</span>
                <ArrowRight className={`w-3 h-3 ${isUrdu ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. FOOTER
      ========================================================================= */}
      <footer className="relative z-10 bg-[#030a08] border-t border-emerald-900/40 py-10 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <IslamicLogo className="w-8 h-8 rounded-xl shadow border border-emerald-500/30" />
            <span className="text-lg font-black text-white font-sans">Islamic ChatGPT</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl mx-auto">
            {t.footerDesc}
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-emerald-400 font-medium pt-2">
            <a
              href="https://alulama.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              <span>{t.footerLinkFatwa}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <button onClick={() => onOpenChat()} className="hover:underline cursor-pointer">
              {t.footerLinkChat}
            </button>
            <span>•</span>
            <button onClick={onOpenAuth} className="hover:underline cursor-pointer">
              {t.footerLinkAuth}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-sans pt-2">
            {t.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
};
