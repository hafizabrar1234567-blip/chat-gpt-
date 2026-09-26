import React, { useState, useEffect } from "react";
import {
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Volume2,
  Lock,
  Unlock,
  Settings as SettingsIcon,
} from "lucide-react";
import { QARI_LIST, QariId } from "../utils/quranAudioService";
import { UserAccount } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
  currentUser?: UserAccount | null;
}

const ADMIN_EMAILS = ["hafizabrar1234567@gmail.com"];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
  currentUser,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [defaultQari, setDefaultQari] = useState<QariId>(() => {
    return (localStorage.getItem("preferred_qari") as QariId) || "alafasy";
  });

  // Admin access state
  const isDirectAdminUser = Boolean(
    currentUser?.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase().trim())
  );
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem("admin_session_unlocked") === "true";
  });
  const [showAdminPinPrompt, setShowAdminPinPrompt] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const isAdmin = isDirectAdminUser || isAdminUnlocked;

  const handleQariChange = (id: QariId) => {
    setDefaultQari(id);
    localStorage.setItem("preferred_qari", id);
  };

  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      setPinError("");
      setShowAdminPinPrompt(false);
      setAdminPinInput("");
      if (isAdmin) {
        fetchStatus();
      }
    }
  }, [isOpen, isAdmin]);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/settings/status");
      const data = await res.json();
      if (data.success) {
        setHasKey(data.hasGeminiKey);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = adminPinInput.trim().toLowerCase();
    // Accept standard Admin PIN or admin email
    if (
      pin === "786" ||
      pin === "admin786" ||
      pin === "hafizabrar" ||
      pin === "hafizabrar1234567@gmail.com"
    ) {
      localStorage.setItem("admin_session_unlocked", "true");
      setIsAdminUnlocked(true);
      setShowAdminPinPrompt(false);
      setPinError("");
      fetchStatus();
    } else {
      setPinError("غیر درست ایڈمن پاس ورڈ / پن درج کیا گیا ہے۔");
    }
  };

  const handleLockAdmin = () => {
    localStorage.removeItem("admin_session_unlocked");
    setIsAdminUnlocked(false);
    setShowAdminPinPrompt(false);
    setPinError("");
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/settings/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("custom_gemini_api_key", apiKey.trim());
        setFeedback({
          type: "success",
          text: "Gemini API Key محفوظ ہو گئی ہے اور لائیو AI ایکٹو ہو گیا ہے! 🎉",
        });
        setHasKey(true);
        setApiKey("");
        if (onKeySaved) onKeySaved();
      } else {
        setFeedback({
          type: "error",
          text: data.error || "کی محفوظ کرنے میں مسئلہ آیا",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "سرور سے رابطہ نہیں ہو سکا",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        dir="rtl"
        className="relative w-full max-w-lg bg-[#091512] border border-emerald-800/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-emerald-900/40 bg-gradient-to-r from-emerald-950/60 to-[#0c1e19] flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {isAdmin ? <Key className="w-5 h-5" /> : <SettingsIcon className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-emerald-200 font-urdu">
                  {isAdmin ? "Gemini AI سیٹنگز (ایڈمن پینل)" : "ایپ سیٹنگز"}
                </h2>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-800/50 text-emerald-300 border border-emerald-600/40">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-urdu">
                {isAdmin
                  ? "مکمل لائیو AI (Gemini Flash) ایکٹو کرنے اور کنٹرول کے لیے ایڈمن سیٹنگز"
                  : "قرآن مجید کی تلاوت اور ایپ کی عمومی ترتیبات"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Default Qari Selection - Available for all users */}
          <div className="p-4 rounded-2xl bg-[#061410] border border-emerald-900/60 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 font-urdu">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>قرآن کی تلاوت کے لیے پسندیدہ قاری (Default Qari):</span>
            </div>
            <p className="text-[11px] text-slate-400 font-urdu leading-relaxed">
              قرآن مجید کی عربی تلاوت سننے کے لیے اپنا پسندیدہ قاری منتخب کریں:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {QARI_LIST.map((qari) => (
                <button
                  key={qari.id}
                  type="button"
                  onClick={() => handleQariChange(qari.id)}
                  className={`p-3 rounded-xl border text-right transition-all font-urdu flex items-center justify-between cursor-pointer ${
                    defaultQari === qari.id
                      ? "bg-emerald-900/50 border-emerald-500 text-emerald-100 shadow-md"
                      : "bg-[#040c09] border-emerald-950 text-slate-300 hover:border-emerald-800/60"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{qari.nameUrdu}</p>
                    <p className="text-[10px] text-emerald-400/80 font-sans">{qari.nameEnglish}</p>
                  </div>
                  {defaultQari === qari.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ADMIN ONLY SECTION: Gemini AI Key Configuration */}
          {isAdmin ? (
            <div className="space-y-4 pt-2 border-t border-emerald-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 font-urdu flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Gemini API کلید کنٹرول (صرف ایڈمن):
                </span>
                {!isDirectAdminUser && (
                  <button
                    type="button"
                    onClick={handleLockAdmin}
                    className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer font-urdu"
                  >
                    <Lock className="w-3 h-3" /> ایڈمن سیشن بند کریں
                  </button>
                )}
              </div>

              {/* Status Badge */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-urdu ${
                  hasKey
                    ? "bg-emerald-950/70 border-emerald-700/50 text-emerald-300"
                    : "bg-amber-950/70 border-amber-700/50 text-amber-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {hasKey
                      ? "✅ لائیو AI (Gemini Flash) فعال ہے"
                      : "⚠️ Gemini API Key شامل نہیں ہے"}
                  </span>
                </div>
                <span className="font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded">
                  gemini-3.7-flash
                </span>
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-urdu ${
                    feedback.type === "success"
                      ? "bg-emerald-950/80 border border-emerald-600/50 text-emerald-200"
                      : "bg-red-950/80 border border-red-600/50 text-red-200"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSaveKey} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 font-urdu mb-1.5 font-medium">
                    نئی Gemini API Key یہاں درج کریں:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#050c0a] border border-emerald-900/50 rounded-xl text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-left"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !apiKey.trim()}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-white rounded-xl font-urdu font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> تصدیق ہو رہی ہے...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" /> API Key محفوظ کریں
                    </>
                  )}
                </button>
              </form>

              {/* Get Key Link */}
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/30 rounded-2xl text-xs text-slate-400 font-urdu space-y-1.5">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> مفت Gemini API Key کیسے حاصل کریں؟
                </p>
                <p className="text-[11px] leading-relaxed">
                  Google AI Studio سے 1 منٹ میں مفت API Key حاصل کی جا سکتی ہے۔
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold underline text-xs mt-1"
                >
                  <span>Google AI Studio سے مفت Key لیں</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            /* NON-ADMIN: Subtle Admin Unlock Option */
            <div className="pt-2 border-t border-emerald-900/30">
              {!showAdminPinPrompt ? (
                <button
                  type="button"
                  onClick={() => setShowAdminPinPrompt(true)}
                  className="w-full py-2 px-3 text-slate-500 hover:text-emerald-400 text-xs font-urdu flex items-center justify-center gap-1.5 rounded-xl hover:bg-emerald-950/30 transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 opacity-60" />
                  <span>ایڈمن سیٹنگز (Admin Access)</span>
                </button>
              ) : (
                <form
                  onSubmit={handleUnlockAdmin}
                  className="p-3.5 bg-[#050e0c] border border-emerald-900/50 rounded-2xl space-y-2.5 animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-urdu font-bold text-emerald-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      ایڈمن تصدیق:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAdminPinPrompt(false)}
                      className="text-slate-500 hover:text-slate-300 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-urdu">
                    Gemini AI سیٹنگز صرف ایڈمن کے لیے مخصوص ہیں۔ جاری رکھنے کے لیے ایڈمن پن درج کریں:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      autoFocus
                      required
                      placeholder="ایڈمن پن / پاس ورڈ..."
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#040908] border border-emerald-900/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-urdu"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-urdu font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Unlock className="w-3 h-3" /> ان لاک
                    </button>
                  </div>
                  {pinError && (
                    <p className="text-[11px] text-red-400 font-urdu flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {pinError}
                    </p>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
