import React, { useState, useEffect } from "react";
import { Key, CheckCircle2, AlertCircle, X, Sparkles, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      fetchStatus();
    }
  }, [isOpen]);

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
        className="relative w-full max-w-lg bg-[#091512] border border-emerald-800/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
      >
        {/* Header */}
        <div className="p-5 border-b border-emerald-900/40 bg-gradient-to-r from-emerald-950/60 to-[#0c1e19] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-200 font-urdu">
                Gemini AI سیٹنگز و لائیو ایکٹیویشن
              </h2>
              <p className="text-xs text-slate-400 font-urdu">
                مکمل لائیو AI (Gemini Flash) ایکٹو کرنے کے لیے API Key درج کریں
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
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
                  : "⚠️ Gemini API Key شامل نہیں ہے (آف لائن موڈ ایکٹو ہے)"}
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
                اپنی مفت Gemini API Key یہاں پیسٹ کریں:
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
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-white rounded-xl font-urdu font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> تصدیق ہو رہی ہے...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" /> API Key محفوظ کریں اور لائیو AI چلائیں
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
      </div>
    </div>
  );
};
