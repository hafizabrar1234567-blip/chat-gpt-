import React, { useState, useEffect } from "react";
import {
  Zap,
  ShieldCheck,
  Globe,
  Moon,
  Info,
  Lock,
  ChevronRight,
  HeartHandshake,
  ArrowLeft,
  Sparkles,
  Crown,
  LogOut,
  User as UserIcon,
  Share2,
  Youtube,
  Facebook,
  Instagram,
  MessageCircle,
  Check,
  Link2,
} from "lucide-react";
import { UserAccount, ConnectedSocialAccounts, LanguageOption } from "../types";
import { getSavedConnectedAccounts, saveConnectedAccounts } from "../utils/socialShare";

interface ProfileScreenProps {
  usedGenerations: number;
  maxGenerations: number;
  user?: UserAccount | null;
  onLogout?: () => void;
  currentLanguage?: LanguageOption;
  onLanguageChange?: (lang: LanguageOption) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  usedGenerations,
  maxGenerations,
  user,
  onLogout,
  currentLanguage = "urdu",
  onLanguageChange,
}) => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isAccountsOpen, setIsAccountsOpen] = useState<boolean>(false);
  const [socialAccounts, setSocialAccounts] = useState<ConnectedSocialAccounts>(
    getSavedConnectedAccounts()
  );
  const [saveToast, setSaveToast] = useState<boolean>(false);

  useEffect(() => {
    setSocialAccounts(getSavedConnectedAccounts());
  }, []);

  const handleSaveSocial = () => {
    saveConnectedAccounts(socialAccounts);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-4 animate-fade-in">
      {/* Profile Card Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] p-0.5 mx-auto shadow-lg shadow-[#4F46E5]/25">
          <div className="w-full h-full bg-[#0B0F19] rounded-[22px] flex items-center justify-center text-amber-300 font-black text-2xl">
            {user?.name ? user.name.charAt(0).toUpperCase() : "✦"}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-black text-[#111827]">{user?.name || "Islamic ChatGPT User"}</h2>
          <p className="text-xs text-[#6B7280] font-medium font-mono">{user?.email || "user@islamic-chatgpt.app"}</p>
          <span className="inline-block mt-2 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-urdu">
            {user?.plan ? `Islamic ChatGPT ${user.plan} Plan` : "Islamic ChatGPT مفت اکاؤنٹ"}
          </span>
        </div>

        {/* Daily Usage Status */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 flex items-center gap-1.5 font-extrabold">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Today's Usage
            </span>
            <span className="text-[#4F46E5] font-mono font-black">{usedGenerations} / {maxGenerations} Used</span>
          </div>

          <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (usedGenerations / maxGenerations) * 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-[#6B7280] font-urdu leading-relaxed">
            آج آپ نے {maxGenerations} میں سے {usedGenerations} AI generations استعمال کی ہیں۔ رات 12 بجے کوٹہ ری سیٹ ہوگا۔
          </p>
        </div>
      </div>

      {/* Premium Upgrade Preview Card */}
      <div className="bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1F2937] text-white rounded-3xl p-5 border border-indigo-500/30 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-300" />
            <h3 className="text-base font-black tracking-tight text-white">
              Unlock More with Islamic ChatGPT ✨
            </h3>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
            Coming Soon
          </span>
        </div>

        <p className="text-xs text-indigo-200 font-medium">
          More generations • More styles • More creativity
        </p>
      </div>

      {/* App Settings List */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-xs">
        {/* Language Selection */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-[#4F46E5] border border-indigo-100 flex items-center justify-center">
              <Globe className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#111827]">Language (زبان)</p>
              <p className="text-[10px] text-[#6B7280]">Default generation language</p>
            </div>
          </div>
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange?.(e.target.value as LanguageOption)}
            className="bg-slate-50 text-[#4F46E5] text-xs font-extrabold px-3 py-1.5 rounded-xl border border-slate-200/80 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="urdu">اردو (Urdu)</option>
            <option value="english">English (انگریزی)</option>
            <option value="arabic">العربية (عربی)</option>
          </select>
        </div>

        {/* Theme Setting */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <Moon className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#111827]">Theme (تھیم)</p>
              <p className="text-[10px] text-[#6B7280]">Luxury Clean Light Theme</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Active
          </span>
        </div>

        {/* Connected Social Accounts */}
        <button
          onClick={() => setIsAccountsOpen(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-pink-50 text-pink-600 border border-pink-100 flex items-center justify-center">
              <Share2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#111827]">Connected Social Accounts</p>
              <p className="text-[10px] text-[#6B7280]">YouTube, Facebook, Instagram, WhatsApp</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* About App Modal Button */}
        <button
          onClick={() => setIsAboutOpen(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#7C3AED] border border-purple-100 flex items-center justify-center">
              <Info className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#111827]">About Islamic ChatGPT</p>
              <p className="text-[10px] text-[#6B7280]">App Version & Capabilities</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Privacy Policy Button */}
        <button
          onClick={() => setIsPrivacyOpen(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Lock className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#111827]">Privacy Policy (پرائیویسی)</p>
              <p className="text-[10px] text-[#6B7280]">Data protection & local storage</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full p-4 flex items-center justify-between hover:bg-rose-50/50 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:bg-rose-100">
                <LogOut className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-rose-600">Log Out (لاگ آؤٹ)</p>
                <p className="text-[10px] text-rose-400">Exit your account session</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-300 group-hover:text-rose-500" />
          </button>
        )}
      </div>

      {/* About Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setIsAboutOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#1F2937] shadow-2xs border border-slate-200 cursor-pointer"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-[#1F2937] stroke-[2.5]" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#059669] to-[#047857] p-0.5 mx-auto">
                <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center text-amber-300 font-extrabold text-xl">
                  🕌
                </div>
              </div>
              <h3 className="text-base font-black text-[#111827]">Islamic ChatGPT</h3>
              <p className="text-xs text-emerald-700 font-urdu font-bold">
                "قرآن و صحیح احادیث کی روشنی میں آپ کا اسلامی و AI معاون"
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-700 font-medium">
              <div className="flex justify-between font-mono">
                <span className="text-[#6B7280]">Version:</span>
                <span className="text-[#4F46E5] font-bold">1.0.0 (Luxury Edition)</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#6B7280]">Architecture:</span>
                <span className="text-[#111827]">Capacitor Mobile Hybrid</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#6B7280]">AI Engine:</span>
                <span className="text-[#4F46E5] font-bold">Gemini Server API</span>
              </div>
            </div>

            <button
              onClick={() => setIsAboutOpen(false)}
              className="w-full py-3.5 bg-[#4F46E5] text-white font-extrabold text-xs rounded-2xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Connected Accounts Modal */}
      {isAccountsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200/80 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setIsAccountsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#1F2937] shadow-2xs border border-slate-200 cursor-pointer"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-[#1F2937] stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#111827]">
                  Connected Social Accounts
                </h3>
                <p className="text-xs text-[#6B7280]">سوشل میڈیا چینلز کو لنک کریں</p>
              </div>
            </div>

            {saveToast && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs font-bold font-urdu flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>اکاؤنٹس کامیابی سے محفوظ ہو گئے!</span>
              </div>
            )}

            <div className="space-y-3 text-xs max-h-[50vh] overflow-y-auto pr-1">
              {/* YouTube */}
              <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-700">
                  <Youtube className="w-4 h-4" />
                  <span>YouTube Channel</span>
                </div>
                <input
                  type="text"
                  placeholder="@MyChannel"
                  value={socialAccounts.youtube?.handle || ""}
                  onChange={(e) =>
                    setSocialAccounts((prev) => ({
                      ...prev,
                      youtube: { connected: true, handle: e.target.value },
                    }))
                  }
                  className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-mono text-xs"
                />
              </div>

              {/* Facebook */}
              <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-700">
                  <Facebook className="w-4 h-4" />
                  <span>Facebook Page / Profile</span>
                </div>
                <input
                  type="text"
                  placeholder="My Facebook Page"
                  value={socialAccounts.facebook?.pageName || ""}
                  onChange={(e) =>
                    setSocialAccounts((prev) => ({
                      ...prev,
                      facebook: { connected: true, pageName: e.target.value },
                    }))
                  }
                  className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 text-xs"
                />
              </div>

              {/* Instagram */}
              <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-pink-700">
                  <Instagram className="w-4 h-4" />
                  <span>Instagram Handle</span>
                </div>
                <input
                  type="text"
                  placeholder="@my_insta_handle"
                  value={socialAccounts.instagram?.username || ""}
                  onChange={(e) =>
                    setSocialAccounts((prev) => ({
                      ...prev,
                      instagram: { connected: true, username: e.target.value },
                    }))
                  }
                  className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400 font-mono text-xs"
                />
              </div>

              {/* WhatsApp */}
              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Number (اختیاری)</span>
                </div>
                <input
                  type="text"
                  placeholder="923001234567"
                  value={socialAccounts.whatsapp?.phone || ""}
                  onChange={(e) =>
                    setSocialAccounts((prev) => ({
                      ...prev,
                      whatsapp: { connected: true, phone: e.target.value },
                    }))
                  }
                  className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-400 font-mono text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSocial}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-[#4F46E5] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer hover:opacity-95"
            >
              محفوظ کریں (Save Connected Accounts)
            </button>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setIsPrivacyOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#1F2937] shadow-2xs border border-slate-200 cursor-pointer"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-[#1F2937] stroke-[2.5]" />
            </button>

            <h3 className="text-base font-black text-[#111827] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Privacy Policy</span>
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700 font-urdu leading-relaxed space-y-2">
              <p>• آپ کا اپلوڈ کردہ فوٹو اور ٹیکسٹ ڈیٹا محفوظ ہے۔ ہم کوئی ڈیٹا پرسنل سرور پر نہیں رکھتے۔</p>
              <p>• آپ کی پچھلی تمام AI Generations صرف آپ کے موبائل کی Local Storage میں محفوظ ہوتی ہیں۔</p>
              <p>• Gemini AI کیز بیک اینڈ پر محفوظ کی گئی ہیں تاکہ سیکیورٹی برقرار رہے۔</p>
            </div>

            <button
              onClick={() => setIsPrivacyOpen(false)}
              className="w-full py-3.5 bg-[#4F46E5] text-white font-extrabold text-xs rounded-2xl cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center py-2 text-xs text-[#6B7280] font-urdu">
        <p>Islamic ChatGPT (اسلامی چیٹ جی پی ٹی) — ایڈیشن 1.0.0</p>
        <p className="mt-1 flex items-center justify-center gap-1 text-[#6B7280]">
          <HeartHandshake className="w-3.5 h-3.5 text-rose-500" /> قرآن و سنت و اخلاقی رہنمائی پر مبنی اسٹوڈیو
        </p>
      </div>
    </div>
  );
};
