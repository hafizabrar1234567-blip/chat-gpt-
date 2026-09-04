import React from "react";
import { Zap, X, Calendar } from "lucide-react";

interface DailyLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyLimitModal: React.FC<DailyLimitModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#5B4BDB] to-[#7C3AED] p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-[#5B4BDB]/20">
          <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-[#5B4BDB]">
            <Zap className="w-8 h-8 fill-[#5B4BDB]/20" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Daily Free Limit Reached</h3>
          <p className="text-sm font-bold text-[#5B4BDB] font-urdu mt-2 leading-relaxed">
            آج کی Free Generations ختم ہو گئی ہیں۔ کل دوبارہ 10 Free Generations دستیاب ہوں گی۔
          </p>
          <p className="text-xs text-slate-500 font-urdu mt-1 leading-relaxed">
            کل رات 12 بجے آپ کا کوٹہ دوبارہ ری سیٹ ہو جائے گا۔ آپ تب تک پہلے سے محفوظ کی گئی ہسٹری دیکھ سکتے ہیں۔
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-700 font-medium flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Resets daily at midnight 12:00 AM</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-[#5B4BDB] hover:bg-[#4F46E5] text-white font-extrabold text-xs rounded-2xl shadow-md transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
