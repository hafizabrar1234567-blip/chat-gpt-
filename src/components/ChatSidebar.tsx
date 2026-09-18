import React, { useState } from "react";
import {
  MessageSquarePlus,
  MessageSquare,
  BookOpen,
  Trash2,
  Calendar,
  X,
  Search,
  Sparkles,
  Edit2,
  Check,
  Globe,
  Settings2,
  Bookmark,
  LogOut,
  Home,
  Share2,
  RotateCcw,
  User,
  LogIn,
} from "lucide-react";
import { IslamicLogo } from "./IslamicLogo";
import { ChatSession, BookRecord, LanguageOption, UserAccount } from "../types";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onOpenKnowledgeBase: () => void;
  onOpenCalendar: () => void;
  onOpenSettings: () => void;
  onOpenFavorites?: () => void;
  favoritesCount?: number;
  booksCount: number;
  language: LanguageOption;
  onChangeLanguage: (lang: LanguageOption) => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onOpenHome?: () => void;
  onOpenAuth?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onOpenKnowledgeBase,
  onOpenCalendar,
  onOpenSettings,
  onOpenFavorites,
  favoritesCount = 0,
  booksCount,
  language,
  onChangeLanguage,
  currentUser,
  onLogout,
  onOpenHome,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startRename = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        dir="rtl"
        className={`fixed lg:static top-0 bottom-0 right-0 z-50 w-[85vw] max-w-xs sm:w-80 bg-[#06100d] border-l border-emerald-950/70 flex flex-col shadow-2xl mobile-sidebar-drawer ${
          isOpen ? "mobile-sidebar-open" : "mobile-sidebar-closed lg:translate-x-0"
        }`}
      >
        {/* Top Branding */}
        <div className="p-4 border-b border-emerald-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IslamicLogo className="w-10 h-10 shadow-lg shadow-emerald-950/60" />
            <div>
              <h1 className="font-bold text-sm text-emerald-200 font-urdu leading-tight flex items-center gap-1.5">
                اسلامی چیٹ جی پی ٹی
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-800/50 text-emerald-300 rounded font-sans">
                  AI
                </span>
              </h1>
              <p className="text-[11px] text-emerald-400/70 font-urdu">مستند دینی و علمی معاون</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-950/60 active:scale-95 transition-all lg:hidden cursor-pointer"
            title="بند کریں"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Controls: New Chat & Compact Tools Row */}
        <div className="p-3 pb-2 space-y-2 shrink-0">
          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-urdu font-bold text-xs shadow-md shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>نیا چیٹ (New Chat)</span>
          </button>

          {/* Quick Tools Row (3 in a single compact row to save maximum screen space) */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            {/* Knowledge Base */}
            <button
              type="button"
              onClick={() => {
                onOpenKnowledgeBase();
                if (window.innerWidth < 1024) onClose();
              }}
              className="py-1.5 px-1 bg-[#091b15] hover:bg-[#0e261f] border border-emerald-900/50 text-emerald-300 rounded-lg font-urdu text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="کتب خانہ"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">کتب خانہ ({booksCount})</span>
            </button>

            {/* Favorites */}
            <button
              type="button"
              onClick={() => {
                onOpenFavorites?.();
                if (window.innerWidth < 1024) onClose();
              }}
              className="py-1.5 px-1 bg-[#091b15] hover:bg-[#0e261f] border border-emerald-900/50 text-emerald-300 rounded-lg font-urdu text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="محفوظ شدہ"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">محفوظ ({favoritesCount || 0})</span>
            </button>

            {/* Calendar */}
            <button
              type="button"
              onClick={() => {
                onOpenCalendar();
                if (window.innerWidth < 1024) onClose();
              }}
              className="py-1.5 px-1 bg-[#091b15] hover:bg-[#0e261f] border border-emerald-900/50 text-emerald-300 rounded-lg font-urdu text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="اسلامی کیلنڈر"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">کیلنڈر</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="pt-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                dir="auto"
                placeholder="چیٹ تلاش کریں..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-3 pr-8 py-1.5 bg-[#040a08] border border-emerald-950 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-700 transition-all ${
                  searchQuery.trim() && /^[a-zA-Z0-9]/.test(searchQuery.trim()[0])
                    ? "text-left font-sans"
                    : "text-right font-urdu"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Chat History List - Maximum Vertical Height on Mobile and Desktop */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-1 space-y-1">
          <div className="px-1.5 py-1 text-[11px] font-urdu font-semibold text-slate-400 flex items-center justify-between">
            <span>حالیہ گفتگو ({filteredSessions.length})</span>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-urdu">
              {searchQuery ? "کوئی چیٹ نہیں ملی" : "کوئی حالیہ گفتگو نہیں"}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const isEditing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group relative flex items-start justify-between p-2 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? "bg-emerald-900/40 border border-emerald-600/50 text-emerald-100 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-emerald-950/40 border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <MessageSquare
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-emerald-400"
                      }`}
                    />

                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRename(session.id, e as any);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-full bg-[#030806] px-1.5 py-0.5 rounded text-xs text-emerald-200 border border-emerald-500 focus:outline-none font-urdu"
                      />
                    ) : (
                      <span className="text-xs font-urdu leading-snug line-clamp-2 select-none text-right">
                        {session.title || "نئی گفتگو"}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0 mr-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={(e) => saveRename(session.id, e)}
                        className="p-1 text-emerald-400 hover:bg-emerald-950 rounded"
                        title="محفوظ کریں"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => startRename(session, e)}
                        className="p-1 text-slate-500 hover:text-emerald-300 rounded"
                        title="نام تبدیل کریں"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 rounded"
                      title="ڈیلیٹ کریں"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Bar: Language & User Account */}
        <div className="p-2.5 border-t border-emerald-950/60 bg-[#040a08] space-y-2 shrink-0">
          {/* Language selector */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-urdu">
            <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Globe className="w-3 h-3 text-emerald-400" /> زبان:
            </span>
            <select
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as LanguageOption)}
              className="bg-[#08120f] border border-emerald-900/50 text-emerald-300 text-[11px] rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
            >
              <option value="urdu">اردو</option>
              <option value="roman_urdu">Roman Urdu</option>
              <option value="arabic">العربية</option>
              <option value="english">English</option>
            </select>
          </div>

          {/* User Account / Login Button */}
          {currentUser ? (
            <div className="flex items-center justify-between p-1.5 px-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
              <div className="flex items-center gap-2 overflow-hidden min-w-0">
                <div className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0 text-white font-bold text-xs">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : <User className="w-3.5 h-3.5 text-emerald-300" />}
                </div>
                <div className="truncate text-right min-w-0">
                  <div className="text-xs font-urdu font-bold text-emerald-200 truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans truncate leading-tight" dir="ltr">
                    {currentUser.email}
                  </div>
                </div>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className="py-1 px-2 text-[11px] font-urdu text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/40 rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1 active:scale-95 mr-1"
                  title="لاگ آؤٹ کریں"
                >
                  <LogOut className="w-3 h-3" />
                  <span>لاگ آؤٹ</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onOpenAuth?.();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-urdu font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>لاگ ان / سائن ان</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
