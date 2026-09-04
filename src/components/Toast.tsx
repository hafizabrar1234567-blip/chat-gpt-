import React, { useEffect } from "react";
import { Check, X, AlertCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-full shadow-2xl text-xs font-bold transition-all duration-200 bg-slate-900 text-white border border-slate-700/80 backdrop-blur-md">
      {type === "success" && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
      {type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
      {type === "info" && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
      <span className="font-urdu">{message}</span>
      <button
        onClick={onClose}
        className="ml-1 p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
