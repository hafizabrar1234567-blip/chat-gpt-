import React, { useState, useEffect } from "react";
import { Bookmark, Trash2, Copy, Check, X, Search, ExternalLink, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface SavedItem {
  id: string;
  text: string;
  timestamp: string;
  title?: string;
}

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeak?: (text: string) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({ isOpen, onClose, onSpeak }) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSavedItems();
    }
  }, [isOpen]);

  const loadSavedItems = () => {
    try {
      const data = localStorage.getItem("saved_islamic_messages");
      if (data) {
        setSavedItems(JSON.parse(data));
      } else {
        setSavedItems([]);
      }
    } catch (e) {
      console.error("Error loading favorites:", e);
      setSavedItems([]);
    }
  };

  const handleDelete = (id: string) => {
    const updated = savedItems.filter((item) => item.id !== id);
    setSavedItems(updated);
    localStorage.setItem("saved_islamic_messages", JSON.stringify(updated));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const filtered = savedItems.filter(
    (item) =>
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        dir="rtl"
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#091512] border border-emerald-800/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-900/40 bg-gradient-to-r from-emerald-950/70 to-[#0c1e19] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bookmark className="w-5 h-5 fill-emerald-500/30" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-emerald-200 font-urdu">
                محفوظ شدہ پیغامات (Favorites)
              </h2>
              <p className="text-xs text-slate-400 font-urdu">
                آپ کی محفوظ کردہ آیات، احادیث اور فتاویٰ ({savedItems.length})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-emerald-950/60 bg-[#06100d]">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="محفوظ شدہ مواد میں تلاش کریں..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-[#040a08] border border-emerald-900/40 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-600 font-urdu"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Bookmark className="w-10 h-10 mx-auto text-emerald-900" />
              <p className="text-sm font-urdu text-slate-400">
                {savedItems.length === 0
                  ? "ابھی تک کوئی پیغام محفوظ نہیں کیا گیا۔ چیٹ میں 'محفوظ کریں' بٹن دبا کر آیات یا احادیث یہاں محفوظ کر سکتے ہیں۔"
                  : "تلاش کے مطابق کوئی محفوظ پیغام نہیں ملا۔"}
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#061410] border border-emerald-900/50 hover:border-emerald-700/50 transition-all space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-emerald-950/70 pb-2">
                  <span className="font-sans text-[11px] text-emerald-400/80">{item.timestamp}</span>
                  <div className="flex items-center gap-1">
                    {onSpeak && (
                      <button
                        onClick={() => onSpeak(item.text)}
                        className="p-1.5 rounded-lg hover:text-emerald-300 hover:bg-emerald-950/60 text-slate-400 transition-colors cursor-pointer"
                        title="سنیں"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(item.text, item.id)}
                      className="p-1.5 rounded-lg hover:text-emerald-300 hover:bg-emerald-950/60 text-slate-400 transition-colors cursor-pointer"
                      title="کاپی کریں"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg hover:text-red-400 hover:bg-red-950/40 text-slate-400 transition-colors cursor-pointer"
                      title="حذف کریں"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs sm:text-sm font-urdu leading-relaxed text-slate-200 line-clamp-6 select-text">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.text}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
