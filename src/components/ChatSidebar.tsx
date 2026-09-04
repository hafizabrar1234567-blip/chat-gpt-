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
} from "lucide-react";
import { IslamicLogo } from "./IslamicLogo";
import { ChatSession, BookRecord, LanguageOption } from "../types";

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
  booksCount: number;
  language: LanguageOption;
  onChangeLanguage: (lang: LanguageOption) => void;
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
  booksCount,
  language,
  onChangeLanguage,
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
        className={`fixed lg:static top-0 bottom-0 right-0 z-50 w-72 sm:w-80 bg-[#06100d] border-l border-emerald-950/70 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
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
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-3 space-y-2">
          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-urdu font-bold text-sm shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all group"
          >
            <MessageSquarePlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>نیا چیٹ (New Chat)</span>
          </button>

          {/* Knowledge Base Button */}
          <button
            onClick={onOpenKnowledgeBase}
            className="w-full py-2 px-3 bg-[#0a1b16] hover:bg-[#0e241e] border border-emerald-900/40 text-emerald-300 rounded-xl font-urdu text-xs font-semibold flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>کتب خانہ (Knowledge Base)</span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full text-[10px] border border-emerald-800/40">
              {booksCount} کتب
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="چیٹ تلاش کریں..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 bg-[#040a08] border border-emerald-950 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-800 font-urdu"
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <div className="px-2 py-1 text-[11px] font-urdu font-semibold text-slate-500">
            حالیہ گفتگو (Recent Chats)
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-600 font-urdu">
              کوئی چیٹ موجود نہیں
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
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? "bg-emerald-900/30 border border-emerald-700/40 text-emerald-200 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-emerald-400" : "text-slate-500"
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
                      <span className="truncate text-xs font-urdu leading-relaxed">
                        {session.title}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                      <button
                        onClick={(e) => saveRename(session.id, e)}
                        className="p-1 text-emerald-400 hover:bg-emerald-950 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => startRename(session, e)}
                        className="p-1 text-slate-500 hover:text-emerald-300 rounded"
                        title="نام تبدیل کریں"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
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

        {/* Bottom Tools & Settings */}
        <div className="p-3 border-t border-emerald-950/60 bg-[#040a08] space-y-2">
          {/* Gemini AI Settings */}
          <button
            onClick={onOpenSettings}
            className="w-full py-2 px-3 rounded-xl bg-[#0a1c17] hover:bg-[#0e2720] text-emerald-300 text-xs font-urdu flex items-center justify-between transition-colors border border-emerald-800/40"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-emerald-400" />
              <span>Gemini AI سیٹنگز (Key)</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-sans bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-700/40">
              API
            </span>
          </button>

          {/* Calendar trigger */}
          <button
            onClick={onOpenCalendar}
            className="w-full py-2 px-3 rounded-xl bg-[#091512] hover:bg-[#0d1e1a] text-slate-300 text-xs font-urdu flex items-center justify-between transition-colors border border-emerald-950"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>3-in-1 اسلامی کیلنڈر</span>
            </div>
            <span className="text-[10px] text-emerald-400/80">ہجری و دیسی</span>
          </button>

          {/* Language selector */}
          <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-400 font-urdu">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Globe className="w-3.5 h-3.5" /> زبان:
            </span>
            <select
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as LanguageOption)}
              className="bg-[#08120f] border border-emerald-900/40 text-emerald-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="urdu">اردو</option>
              <option value="roman_urdu">Roman Urdu</option>
              <option value="arabic">العربية</option>
              <option value="english">English</option>
            </select>
          </div>
        </div>
      </aside>
    </>
  );
};
