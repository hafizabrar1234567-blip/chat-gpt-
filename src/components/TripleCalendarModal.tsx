import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  X,
  Copy,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Compass,
} from "lucide-react";
import {
  getTripleCalendarInfo,
  generateTripleCalendarCardResponse,
  PUNJABI_DESI_MONTHS,
  HIJRI_MONTHS_URDU,
  GREGORIAN_MONTHS_URDU,
} from "../utils/calendarConverter";

interface TripleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskChat?: (promptText: string) => void;
}

export const TripleCalendarModal: React.FC<TripleCalendarModalProps> = ({
  isOpen,
  onClose,
  onAskChat,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const info = getTripleCalendarInfo(selectedDate);
  const isToday =
    selectedDate.toDateString() === new Date().toDateString();

  const handleCopy = () => {
    const text = `🗓️ آج کی تاریخ:
1. انگریزی: ${info.gregorian.fullStringUrdu} (${info.gregorian.fullStringEng})
2. اسلامی/ہجری: ${info.hijri.fullStringUrdu} (${info.hijri.fullStringArabic})
3. پنجابی دیسی: ${info.punjabiDesi.fullStringUrdu} (وار: ${info.gregorian.weekdayPunjabi})
✨ Islamic & AI ChatGPT`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleResetToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-5 text-right font-urdu"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>تینوں کیلنڈرز تقویم (3-in-1 Calendar)</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                انگریزی، اسلامی و پنجابی دیسی تاریخ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Selector Navigation Bar */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleNextDay}
            className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 transition-all shadow-xs flex items-center gap-1 text-xs font-bold cursor-pointer"
            title="اگلا دن"
          >
            <ChevronRight className="w-4 h-4" />
            <span>اگلا دن</span>
          </button>

          <div className="text-center">
            <span className="text-sm font-black text-slate-900 block">
              {info.gregorian.weekdayUrdu} ({info.gregorian.weekdayPunjabi})
            </span>
            {!isToday && (
              <button
                type="button"
                onClick={handleResetToday}
                className="text-[11px] text-emerald-600 font-bold hover:underline"
              >
                آج کی تاریخ پر جائیں
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 transition-all shadow-xs flex items-center gap-1 text-xs font-bold cursor-pointer"
            title="پچھلا دن"
          >
            <span>پچھلا دن</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* 1. English / Gregorian Calendar Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4.5 rounded-2xl border-2 border-blue-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5 font-sans">
              <Sun className="w-4 h-4 text-blue-600" />
              <span>1. انگریزی تقویم (Gregorian Calendar)</span>
            </span>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              عیسوی
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-baseline justify-between">
            <div className="text-right">
              <span className="text-2xl font-black text-blue-900 block">
                {info.gregorian.day} {info.gregorian.monthNameUrdu} {info.gregorian.year}ء
              </span>
              <span className="text-xs text-slate-500 font-sans font-medium" dir="ltr">
                {info.gregorian.fullStringEng}
              </span>
            </div>
            <span className="text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
              {info.gregorian.weekdayUrdu}
            </span>
          </div>
        </div>

        {/* 2. Islamic / Hijri Calendar Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4.5 rounded-2xl border-2 border-emerald-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-emerald-600" />
              <span>2. اسلامی / ہجری تقویم (Islamic Hijri Calendar)</span>
            </span>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              قمری تقویم
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-emerald-100 flex items-baseline justify-between">
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-900 block">
                {info.hijri.day} {info.hijri.monthNameUrdu} {info.hijri.year}ھ
              </span>
              <span className="text-xs text-slate-500 font-arabic">
                {info.hijri.day} {info.hijri.monthNameArabic} {info.hijri.year} هـ
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
              مہینہ: {info.hijri.monthNameUrdu}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            * قمری تاریخ مقامی چاند کی رویت کے مطابق ایک دن کے فرق سے ممکن ہو سکتی ہے۔
          </p>
        </div>

        {/* 3. Punjabi Desi Bikrami Calendar Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4.5 rounded-2xl border-2 border-amber-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-600" />
              <span>3. پنجابی دیسی بکرمی تقویم (Punjabi Desi Calendar)</span>
            </span>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              دیسی شمسی تقویم
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-100 flex items-baseline justify-between">
            <div className="text-right">
              <span className="text-2xl font-black text-amber-900 block">
                {info.punjabiDesi.day} {info.punjabiDesi.monthNameUrdu} {info.punjabiDesi.bikramiYear} بکرمی
              </span>
              <span className="text-xs text-slate-500">
                پنجابی وار: {info.gregorian.weekdayPunjabi} | مہینہ: {info.punjabiDesi.monthNameGurmukhi}
              </span>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
              موسم: {info.punjabiDesi.seasonUrdu}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer active:scale-98"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "کاپی ہو گیا!" : "تینوں تاریخیں کاپی کریں"}</span>
          </button>

          {onAskChat && (
            <button
              type="button"
              onClick={() => {
                onAskChat("آج کی انگریزی، اسلامی اور پنجابی دیسی تاریخ کیا ہے؟");
                onClose();
              }}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>چیٹ میں پوچھیں</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
