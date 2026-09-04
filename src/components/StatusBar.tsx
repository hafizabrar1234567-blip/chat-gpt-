import React, { useState, useEffect } from "react";
import { Wifi, Battery, Signal } from "lucide-react";

export const StatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white text-slate-900 px-5 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-bold tracking-tight border-b border-slate-100 select-none z-50">
      {/* Time */}
      <span className="font-mono text-[11px] font-extrabold text-slate-900">
        {currentTime || "11:02 AM"}
      </span>

      {/* Dynamic Island / Notch mockup */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200">
        <div className="w-2 h-2 rounded-full bg-[#5B4BDB] animate-pulse" />
        <span className="text-[9px] text-[#059669] font-extrabold uppercase tracking-wider">Islamic ChatGPT</span>
      </div>

      {/* Signal / Wifi / Battery */}
      <div className="flex items-center gap-2 text-slate-700">
        <Signal className="w-3 h-3 text-slate-800" />
        <span className="text-[10px] font-bold">5G</span>
        <Wifi className="w-3 h-3 text-slate-800" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px] font-mono font-extrabold">98%</span>
          <Battery className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/30" />
        </div>
      </div>
    </div>
  );
};
