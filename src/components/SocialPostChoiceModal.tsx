import React from "react";
import { Image as ImageIcon, FileText, X, Sparkles, Download, Share2, CheckCircle2, ArrowRight } from "lucide-react";
import { SocialPostMode } from "../types";

interface SocialPostChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: SocialPostMode) => void;
}

export const SocialPostChoiceModal: React.FC<SocialPostChoiceModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200/90 relative space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="space-y-1 text-center pr-6 pl-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200/70 text-[11px] font-extrabold mb-1 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Social Post Formats</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            سوشل پوسٹ کا انتخاب کریں
          </h3>
          <p className="text-xs text-slate-500 font-medium font-urdu leading-relaxed">
            آپ کس قسم کی پوسٹ تیار کر کے سوشل میڈیا پر لگانا چاہتے ہیں؟
          </p>
        </div>

        {/* 2 CHOICES */}
        <div className="space-y-3 pt-1">
          {/* OPTION 1: VISUAL POST FOR UPLOAD */}
          <button
            type="button"
            onClick={() => {
              onSelectMode("visual_post");
              onClose();
            }}
            className="w-full text-left p-4.5 rounded-2xl border-2 border-indigo-500/30 hover:border-indigo-600 bg-gradient-to-br from-indigo-50/60 via-white to-sky-50/40 hover:shadow-lg transition-all duration-200 group cursor-pointer active:scale-[0.98] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>🖼️ پوسٹ برائے اپلوڈ</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Graphic Card
                  </span>
                </div>

                <p className="text-xs text-indigo-950 font-bold font-urdu">
                  ڈاؤن لوڈ ایبل تصویری پوسٹ کارڈ + کیپشن
                </p>

                <p className="text-[11px] text-slate-600 font-urdu leading-relaxed pt-0.5">
                  سوشل میڈیا (FB/Insta/WhatsApp) پر لگانے کے لیے تیار تصویری پوسٹر، شاندار ٹائپوگرافی، عنوان، کیپشن اور ہیش ٹیگز۔
                </p>

                <div className="flex items-center gap-2 pt-2 text-[11px] font-extrabold text-indigo-600">
                  <Download className="w-3.5 h-3.5" />
                  <span>1-Click Download & Share</span>
                  <ArrowRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </button>

          {/* OPTION 2: TEXT ONLY */}
          <button
            type="button"
            onClick={() => {
              onSelectMode("text_only");
              onClose();
            }}
            className="w-full text-left p-4.5 rounded-2xl border-2 border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/80 hover:shadow-md transition-all duration-200 group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>📝 صرف تحریر / ٹیکسٹ</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Text Only
                  </span>
                </div>

                <p className="text-xs text-slate-800 font-bold font-urdu">
                  مفصل تحریر، پیراگراف اور وائرل ہیش ٹیگز
                </p>

                <p className="text-[11px] text-slate-500 font-urdu leading-relaxed pt-0.5">
                  فیس بک، انسٹاگرام یا واٹس ایپ کے لیے جامع تحریر، پیراگراف، ہکس، اختتامیہ اور ہیش ٹیگز جنہیں بآسانی کاپی کر سکیں۔
                </p>

                <div className="flex items-center gap-2 pt-2 text-[11px] font-extrabold text-slate-600">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copyable Text & Tags</span>
                  <ArrowRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* BOTTOM HELPER */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center gap-2 text-slate-500 text-[11px]">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-urdu leading-tight">
            آپ بعد میں بھی پوسٹ بناتے وقت کسی بھی وقت موڈ تبدیل کر سکتے ہیں۔
          </span>
        </div>
      </div>
    </div>
  );
};
