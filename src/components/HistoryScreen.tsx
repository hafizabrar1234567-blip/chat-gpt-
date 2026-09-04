import React, { useState } from "react";
import { History, Trash2, Search, Calendar, ChevronRight, Copy, Check, Sparkles, ArrowLeft, Share2 } from "lucide-react";
import { HistoryItem } from "../types";
import { TOOLS_CONFIG } from "../utils/constants";
import { SocialPublishModal } from "./SocialPublishModal";

interface HistoryScreenProps {
  history: HistoryItem[];
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
  onCopyText: (text: string) => void;
  onStartCreating?: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  onDeleteHistoryItem,
  onClearAllHistory,
  onCopyText,
  onStartCreating,
}) => {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const filteredHistory = history.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const topicMatch = item.topic.toLowerCase().includes(searchLower);
    const featureMatch = item.featureType.toLowerCase().includes(searchLower);
    return topicMatch || featureMatch;
  });

  const getToolTitle = (type: string) => {
    const cfg = TOOLS_CONFIG.find((t) => t.id === type);
    return cfg ? cfg.titleUrdu : type;
  };

  const handleCopy = (text: string, key: string) => {
    onCopyText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 w-full max-w-xl mx-auto space-y-4 animate-fade-in overflow-x-hidden">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 w-full">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-black text-[#111827] flex items-center gap-2 truncate">
            <History className="w-5 h-5 text-[#4F46E5] shrink-0" />
            <span className="truncate">Your Creations ✨</span>
          </h2>
          <p className="text-xs text-[#6B7280] font-medium mt-0.5 truncate">
            آپ کے محفوظ کردہ پیغامات و تحریریں
          </p>
        </div>

        {history.length > 0 && (
          <button
            id="clear-all-history-btn"
            onClick={() => setIsConfirmClearOpen(true)}
            className="text-xs text-rose-600 hover:text-rose-700 font-extrabold px-3 py-1.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs"
            title="تمام محفوظ ہسٹری ختم کریں (Clear All History)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      {history.length > 0 && (
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="تلاش کریں (Search creations)..."
            className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#4F46E5] shadow-2xs text-right"
          />
        </div>
      )}

      {/* Empty State vs History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4 w-full">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-8 h-8 text-[#4F46E5]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black text-[#111827]">
              ابھی کوئی محفوظ ڈیٹا موجود نہیں۔
            </h3>
            <p className="text-xs text-[#6B7280] font-medium max-w-xs mx-auto leading-relaxed">
              کوئی بھی سوال پوچھیں یا تحریر تیار کریں، وہ یہاں محفوظ ہو جائے گی۔
            </p>
          </div>

          {onStartCreating && (
            <button
              onClick={onStartCreating}
              className="px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:brightness-110 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#4F46E5]/25 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>نئی تحریر بنائیں</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5 w-full">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white hover:bg-[#F5F3FF] active:bg-[#F5F3FF] border border-slate-200/80 hover:border-[#4F46E5]/40 rounded-3xl p-3.5 sm:p-4 transition-all duration-180 hover:-translate-y-[2px] cursor-pointer group flex items-center justify-between gap-3 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] w-full min-w-0 overflow-hidden"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                {item.imagePreview ? (
                  <img
                    src={item.imagePreview}
                    alt="History thumbnail"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover shrink-0 border border-slate-200"
                  />
                ) : (
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 text-[#4F46E5]">
                    <Sparkles className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                )}

                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-black text-[#4F46E5] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 truncate">
                      {getToolTitle(item.featureType)}
                    </span>
                    <span className="text-[10px] text-[#6B7280] group-hover:text-[#4B5563] flex items-center gap-1 font-medium transition-colors shrink-0">
                      <Calendar className="w-3 h-3 text-[#6B7280]" />
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#111827] group-hover:text-[#111827] mt-1 font-urdu truncate transition-colors leading-relaxed">
                    {item.topic || "تحریر یا سوال"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistoryItem(item.id);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-[#4F46E5] group-hover:translate-x-0.5 transition-all rtl:rotate-180" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal - 100% Mobile Responsive */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-2 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col p-4 sm:p-5 space-y-4 shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0 gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-[#4F46E5] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block truncate">
                  {getToolTitle(selectedItem.featureType)}
                </span>
                <p className="text-[11px] text-[#6B7280] mt-1 font-mono">
                  {formatDate(selectedItem.date)}
                </p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#1F2937] active:scale-95 transition-all shadow-2xs flex items-center justify-center shrink-0 border border-slate-200 cursor-pointer gap-1"
                title="بند کریں (Back)"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4 text-[#1F2937] stroke-[2.5]" />
                <span className="text-xs font-bold font-urdu-ui">واپس</span>
              </button>
            </div>

            {/* Scrollable Modal Content with Strict Overflow Protection */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 no-scrollbar min-w-0 w-full">
              {selectedItem.imagePreview && (
                <img
                  src={selectedItem.imagePreview}
                  alt="Uploaded topic"
                  className="w-full h-40 object-cover rounded-2xl border border-slate-200"
                />
              )}

              {selectedItem.topic && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 min-w-0 w-full overflow-hidden break-words">
                  <span className="text-[10px] text-[#6B7280] uppercase font-black block mb-0.5">
                    موضوع / سوال (Topic / Request):
                  </span>
                  <p className="text-xs text-[#111827] font-urdu font-bold leading-relaxed break-words text-right">
                    {selectedItem.topic}
                  </p>
                </div>
              )}

              {/* Render Output Content */}
              <div className="space-y-3 min-w-0 w-full overflow-hidden">
                {(selectedItem.data as any)?.answerUrdu ? (
                  <div className="space-y-3 font-urdu min-w-0 w-full">
                    {/* Fatwa Card if present */}
                    {((selectedItem.data as any).fatwaSource || (selectedItem.data as any).fatwaTopic || (selectedItem.data as any).fatwaReference) && (
                      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-emerald-100 p-4 rounded-2xl border border-emerald-700/60 shadow-md space-y-2 dir-rtl text-xs min-w-0 w-full overflow-hidden">
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60 flex-wrap gap-2">
                          <span className="font-black text-amber-300 text-xs">
                            ⚖️ فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)
                          </span>
                          <a
                            href={(selectedItem.data as any).fatwaUrl || "https://alulama.org"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-800 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-600 shrink-0"
                          >
                            alulama.org ↗
                          </a>
                        </div>
                        {(selectedItem.data as any).fatwaTopic && (
                          <p className="text-[11px] text-emerald-200 break-words leading-relaxed">
                            <strong className="text-amber-400">باب / موضوع: </strong>
                            {(selectedItem.data as any).fatwaTopic}
                          </p>
                        )}
                        {(selectedItem.data as any).fatwaReference && (
                          <p className="text-[10px] text-emerald-300/90 break-words leading-relaxed">
                            <strong className="text-emerald-400">حوالہ: </strong>
                            {(selectedItem.data as any).fatwaReference}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Main Answer */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 min-w-0 w-full overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black text-emerald-700">جواب و شرعی رہنمائی</span>
                        <button
                          onClick={() => handleCopy((selectedItem.data as any).answerUrdu, "answerUrdu")}
                          className="px-3 py-1 bg-white text-[#111827] text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                        >
                          {copiedKey === "answerUrdu" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-xs text-[#111827] leading-relaxed whitespace-pre-wrap break-words text-right">
                        {(selectedItem.data as any).answerUrdu}
                      </p>
                    </div>

                    {/* Arabic text & References */}
                    {(selectedItem.data as any).arabicText && (
                      <div className="bg-[#052b1e] text-white p-4 rounded-2xl border border-emerald-700/80 space-y-2.5 dir-rtl text-right min-w-0 w-full overflow-hidden shadow-xs">
                        <p className="text-sm font-arabic text-[#FDE047] font-bold leading-loose break-words">
                          {(selectedItem.data as any).arabicText}
                        </p>
                        {(selectedItem.data as any).translation && (
                          <div className="bg-[#021f15] p-3 rounded-xl border border-emerald-600/50 space-y-1">
                            <span className="text-[10px] font-black text-amber-300 block">📖 ترجمہ:</span>
                            <p className="text-xs font-urdu text-white font-semibold break-words leading-relaxed">
                              {(selectedItem.data as any).translation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  Object.entries(selectedItem.data || {}).map(([key, val]) => {
                    const textVal = Array.isArray(val)
                      ? val.join("\n")
                      : typeof val === "object"
                      ? Object.entries(val)
                          .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
                          .join("\n")
                      : String(val);

                    if (!textVal) return null;

                    return (
                      <div key={key} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 min-w-0 w-full overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-black text-[#4F46E5] uppercase tracking-wide truncate">
                            {key}
                          </span>
                          <button
                            onClick={() => handleCopy(textVal, key)}
                            className="px-3 py-1 bg-white hover:bg-slate-100 text-[#111827] text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                          >
                            {copiedKey === key ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#6B7280]" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-[#111827] font-urdu leading-relaxed whitespace-pre-wrap break-words text-right">
                          {textVal}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Bottom Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setIsPublishOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-[#4F46E5] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-95 truncate px-2"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span className="truncate">پوسٹ کریں 🚀</span>
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-3 bg-slate-100 text-[#111827] font-bold text-xs rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-200 active:scale-95 truncate px-2"
              >
                بند کریں (Close)
              </button>
            </div>

            {/* Social Publish Modal for History Item */}
            {isPublishOpen && (
              <SocialPublishModal
                isOpen={isPublishOpen}
                onClose={() => setIsPublishOpen(false)}
                title={selectedItem.topic || "Islamic ChatGPT Content"}
                fullFormattedText={Object.entries(selectedItem.data || {})
                  .map(([k, v]) => `${k}:\n${Array.isArray(v) ? v.join(" ") : String(v)}`)
                  .join("\n\n")}
                mediaBase64={selectedItem.imagePreview}
                onCopySuccess={(msg) => onCopyText(msg)}
              />
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clear All History */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-rose-200 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl text-center animate-scale-up">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 font-urdu-ui">
                تمام محفوظ ہسٹری ختم کریں؟
              </h3>
              <p className="text-xs text-slate-600 font-medium font-urdu-ui leading-relaxed">
                کیا آپ واقعی اپنی تمام محفوظ کردہ تخلیقات اور پیغامات مٹانا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکے گا۔
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                id="confirm-delete-all-btn"
                onClick={() => {
                  onClearAllHistory();
                  setIsConfirmClearOpen(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-rose-600/25 active:scale-95 transition-all cursor-pointer font-urdu-ui"
              >
                ہاں، تمام ڈیلیٹ کریں
              </button>

              <button
                type="button"
                id="cancel-delete-all-btn"
                onClick={() => setIsConfirmClearOpen(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 active:scale-95 transition-all cursor-pointer font-urdu-ui"
              >
                منسوخ کریں (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
