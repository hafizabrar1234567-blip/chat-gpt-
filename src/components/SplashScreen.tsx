import React, { useEffect, useState } from "react";
import { Sparkles, Smartphone } from "lucide-react";
import { IslamicLogo } from "./IslamicLogo";

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 250);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19] flex flex-col items-center justify-between p-8 text-white select-none animate-fade-in">
      {/* Top indicator */}
      <div className="pt-6 flex items-center gap-2 text-xs text-emerald-300 font-extrabold bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
        <span>Islamic ChatGPT • اسلامی چیٹ جی پی ٹی</span>
      </div>

      {/* Main Center Logo & Title */}
      <div className="text-center space-y-6 max-w-xs my-auto">
        {/* Animated Icon Ring */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-700 animate-pulse blur-xl opacity-70" />
          <IslamicLogo className="relative w-full h-full" />
        </div>

        {/* App Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Islamic ChatGPT
          </h1>
          <p className="text-sm font-urdu text-emerald-200 font-bold leading-relaxed px-2">
            قرآن و صحیح حدیث کی روشنی میں اسلامی تخلیقی اسٹوڈیو
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-2 pt-2">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] transition-all duration-150 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono font-bold">
            <span>Initializing Studio...</span>
            <span className="text-indigo-300">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pb-4 text-center space-y-1">
        <p className="text-xs text-slate-400 font-urdu">
          اردو اور Roman Urdu سپورٹ کے ساتھ
        </p>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">
          Powered by Gemini AI • Version 1.0.0
        </p>
      </div>
    </div>
  );
};
