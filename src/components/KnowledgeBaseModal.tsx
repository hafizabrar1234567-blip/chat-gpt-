import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Sparkles,
  Layers,
  Loader2,
} from "lucide-react";
import { BookRecord } from "../types";

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: BookRecord[];
  onRefreshBooks: () => Promise<void>;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  books,
  onRefreshBooks,
}) => {
  const [activeTab, setActiveTab] = useState<"list" | "upload" | "paste">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for manual paste
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteAuthor, setPasteAuthor] = useState("");
  const [pasteText, setPasteText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.author && b.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFeedback(null);

    try {
      const fileType = file.name.split(".").pop()?.toLowerCase() || "txt";
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          let payload: any = {
            title: file.name.replace(/\.[^/.]+$/, ""),
            fileName: file.name,
            fileType,
            fileSize: file.size,
          };

          if (fileType === "pdf") {
            const base64Content = (reader.result as string).split(",")[1];
            payload.contentBase64 = base64Content;
          } else {
            payload.content = reader.result as string;
          }

          const res = await fetch("/api/books/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          if (data.success) {
            setFeedback({
              type: "success",
              text: `کتاب "${payload.title}" کامیابی سے شامل اور انڈیکس ہو گئی ہے!`,
            });
            await onRefreshBooks();
            setActiveTab("list");
          } else {
            setFeedback({
              type: "error",
              text: data.error || "کتاب اپلوڈ کرنے میں مسئلہ آیا",
            });
          }
        } catch (err: any) {
          setFeedback({
            type: "error",
            text: err.message || "فائل پڑھنے میں ناکامی",
          });
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };

      if (fileType === "pdf") {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    } catch (err: any) {
      setIsUploading(false);
      setFeedback({
        type: "error",
        text: err.message || "فائل منتخب کرنے میں مسئلہ آیا",
      });
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteTitle.trim() || !pasteText.trim()) {
      setFeedback({ type: "error", text: "عنوان اور مواد لکھنا ضروری ہے" });
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/books/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pasteTitle.trim(),
          author: pasteAuthor.trim() || "مستند اسلامی مواد",
          content: pasteText.trim(),
          fileType: "txt",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: `مواد "${pasteTitle}" بطور کتاب کامیابی سے شامل کر دیا گیا!`,
        });
        setPasteTitle("");
        setPasteAuthor("");
        setPasteText("");
        await onRefreshBooks();
        setActiveTab("list");
      } else {
        setFeedback({ type: "error", text: data.error || "شامل کرنے میں ناکامی" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "سرور ایرر" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBook = async (bookId: string, title: string) => {
    if (!confirm(`کیا آپ واقعی "${title}" کو لائبریری سے ختم کرنا چاہتے ہیں؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await onRefreshBooks();
      }
    } catch (err) {
      console.error("Delete book failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        dir="rtl"
        className="relative w-full max-w-2xl bg-[#091512] border border-emerald-800/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-emerald-900/40 bg-gradient-to-r from-emerald-950/60 to-[#0c1e19] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-300 font-urdu">
                اسلامی کتب خانہ (Knowledge Base)
              </h2>
              <p className="text-xs text-slate-400 font-urdu">
                اپنی کتب شامل کریں تاکہ AI ان کے مستند حوالوں کے ساتھ جواب دے
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-emerald-900/30 px-6 pt-3 gap-2 bg-[#06100d]">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all flex items-center gap-2 font-urdu ${
              activeTab === "list"
                ? "bg-[#091512] text-emerald-300 border-t-2 border-emerald-500 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            شامل شدہ کتب ({books.length})
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all flex items-center gap-2 font-urdu ${
              activeTab === "upload"
                ? "bg-[#091512] text-emerald-300 border-t-2 border-emerald-500 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-4 h-4" />
            فائل اپلوڈ (PDF / Text)
          </button>
          <button
            onClick={() => setActiveTab("paste")}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all flex items-center gap-2 font-urdu ${
              activeTab === "paste"
                ? "bg-[#091512] text-emerald-300 border-t-2 border-emerald-500 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            براہِ راست متن درج کریں
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Feedback messages */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-urdu ${
                feedback.type === "success"
                  ? "bg-emerald-950/80 border border-emerald-600/50 text-emerald-200"
                  : "bg-red-950/80 border border-red-600/50 text-red-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* TAB 1: LIST BOOKS */}
          {activeTab === "list" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="کتب تلاش کریں..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-[#050c0a] border border-emerald-900/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-urdu"
                />
              </div>

              {filteredBooks.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-emerald-900/40 rounded-2xl">
                  <BookOpen className="w-12 h-12 mx-auto text-emerald-700/50 mb-3" />
                  <p className="text-slate-300 font-urdu font-medium text-base">کوئی کتاب نہیں ملی</p>
                  <p className="text-xs text-slate-500 font-urdu mt-1">
                    اوپر دیے گئے بٹن کے ذریعے اپنی مرضی کی اسلامی کتب یا فتاویٰ شامل کریں
                  </p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs rounded-xl font-urdu font-semibold inline-flex items-center gap-2 transition-all shadow-md shadow-emerald-900/30"
                  >
                    <Plus className="w-4 h-4" /> نئی کتاب شامل کریں
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      className="p-4 bg-[#050d0a] border border-emerald-900/30 rounded-2xl hover:border-emerald-700/50 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-900/40 border border-emerald-700/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-emerald-200 text-sm font-urdu leading-snug">
                            {book.title}
                          </h4>
                          {book.author && (
                            <p className="text-xs text-slate-400 font-urdu mt-0.5">
                              مصنف: {book.author}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                            <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800/40 rounded-md text-emerald-400 font-urdu">
                              {book.chunkCount} ابواب انڈیکس شدہ
                            </span>
                            <span>فائل: {book.fileName}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteBook(book.id, book.title)}
                        title="حذف کریں"
                        className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors opacity-80 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD FILE */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  isUploading
                    ? "border-emerald-500 bg-emerald-950/30 opacity-70 pointer-events-none"
                    : "border-emerald-800/60 hover:border-emerald-500 hover:bg-emerald-950/20 bg-[#050c0a]"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.pdf,.md,.json"
                  className="hidden"
                />

                {isUploading ? (
                  <div className="flex flex-col items-center justify-center space-y-3 py-4">
                    <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                    <p className="text-emerald-300 font-urdu text-sm font-medium">
                      کتاب کا مطالعہ اور انڈیکسنگ جاری ہے...
                    </p>
                    <p className="text-xs text-slate-500 font-urdu">
                      براہ کرم کچھ لمحات انتظار فرمائیں
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-800/30 border border-emerald-600/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-urdu font-bold text-emerald-200 text-base">
                        فائل یہاں منتخب کریں یا ڈریگ کریں
                      </p>
                      <p className="text-xs text-slate-400 font-urdu mt-1">
                        ہماری ایپ PDF، TXT، اور JSON فارمیٹس کو خودکار انڈیکس کرتی ہے
                      </p>
                    </div>
                    <span className="inline-block px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-urdu font-semibold shadow-md">
                      فائل منتخب کریں
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-emerald-950/30 border border-emerald-900/30 rounded-2xl text-xs text-slate-400 font-urdu space-y-1">
                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> کتاب شامل کرنے کے بعد کیا ہوگا؟
                </p>
                <p>
                  AI آپ کے پوچھے گئے سوالات کا اس کتاب میں موجود نصوص، فقہی مسائل اور ابواب کے ساتھ موازنہ کرے گا اور جواب میں اسی کتاب کا نام و باب بطور حوالہ پیش کرے گا۔
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PASTE TEXT DIRECTLY */}
          {activeTab === "paste" && (
            <form onSubmit={handlePasteSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 font-urdu mb-1 font-medium">
                    کتاب یا رسالے کا نام *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: خلاصۃ المسائل فی الفقہ"
                    value={pasteTitle}
                    onChange={(e) => setPasteTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#050c0a] border border-emerald-900/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-urdu"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-urdu mb-1 font-medium">
                    مصنف یا ادارہ
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: مولانا / مفتی صاحب"
                    value={pasteAuthor}
                    onChange={(e) => setPasteAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#050c0a] border border-emerald-900/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-urdu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-urdu mb-1 font-medium">
                  کتاب / فتویٰ / تحریر کا مکمل متن *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="یہاں کتاب، باب یا فتاویٰ کا اردو/عربی متن پیسٹ کریں..."
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  className="w-full p-3.5 bg-[#050c0a] border border-emerald-900/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-urdu resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isUploading || !pasteTitle.trim() || !pasteText.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-white rounded-2xl font-urdu font-bold text-sm shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> انڈیکس ہو رہا ہے...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> بطور کتاب محفوظ کریں
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
