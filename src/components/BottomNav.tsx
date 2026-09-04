import React from "react";
import { MessageSquare, History, User } from "lucide-react";
import { ScreenTab } from "../types";

interface BottomNavProps {
  activeTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  historyCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  historyCount = 0,
}) => {
  const tabs = [
    { id: "home" as ScreenTab, label: "چیٹ (Chat)", icon: MessageSquare, isHighlight: true },
    { id: "history" as ScreenTab, label: "تاریخچہ", icon: History, badge: historyCount },
    { id: "profile" as ScreenTab, label: "پروفائل", icon: User },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shrink-0 pb-3 pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
      <div className="w-full max-w-md mx-auto flex items-center justify-around px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === "home" && activeTab === "create");

          if (tab.isHighlight) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange("home")}
                className="relative flex flex-col items-center group focus:outline-none cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 flex items-center justify-center shadow-md shadow-emerald-600/30 border-2 border-white transition-all duration-200 active:scale-90 ${
                    isActive ? "ring-4 ring-emerald-500/25 scale-105" : "hover:scale-105"
                  }`}
                >
                  <Icon className="w-5 h-5 text-white fill-white/20 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[11px] font-urdu-ui font-bold mt-1 tracking-tight transition-colors ${
                    isActive ? "text-emerald-700" : "text-slate-600 group-hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center py-1 px-4 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive ? "text-emerald-700" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110 text-emerald-700 stroke-[2.5]" : "stroke-[2]"
                  }`}
                />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-urdu-ui mt-1 tracking-tight ${
                  isActive ? "font-bold text-emerald-700" : "font-semibold text-slate-600"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};


