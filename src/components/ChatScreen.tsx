import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  Menu,
  BookOpen,
  Mic,
  MicOff,
  Calendar,
  Layers,
  Paperclip,
  Trash2,
  ArrowUp,
  ExternalLink,
  Info,
} from "lucide-react";
import { IslamicLogo } from "./IslamicLogo";
import { ChatMessage, ChatSession, BookRecord, LanguageOption } from "../types";

interface ChatScreenProps {
  session: ChatSession;
  books: BookRecord[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onOpenSidebar: () => void;
  onOpenKnowledgeBase: () => void;
  onOpenCalendar: () => void;
  onClearChat: () => void;
  language: LanguageOption;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  session,
  books,
  onSendMessage,
  isLoading,
  onOpenSidebar,
  onOpenKnowledgeBase,
  onOpenCalendar,
  onClearChat,
  language,
}) => {
  const [inputText, setInputText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for voice recognition if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === "arabic" ? "ar-SA" : language === "english" ? "en-US" : "ur-PK";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages, isLoading]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        Math.max(textareaRef.current.scrollHeight, 48),
        180
      )}px`;
    }
  }, [inputText]);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang =
          language === "arabic" ? "ar-SA" : language === "english" ? "en-US" : "ur-PK";
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Voice recognition start error:", e);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText("");
    if (textareaRef.current) textareaRef.current.style.height = "48px";
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeakingId === id) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner speech
    const cleanText = text.replace(/[#*`_>\[\]]/g, "").slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === "arabic" ? "ar-SA" : "ur-PK";
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);

    setIsSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const samplePrompts = [
    {
      title: "📖 وضو اور طہارت کے فرائض",
      prompt: "وضو کے بنیادی فرائض اور مسنون طریقہ کیا ہے؟",
    },
    {
      title: "⚖️ سفر میں نمازِ قصر کے احکام",
      prompt: "سفر میں نمازِ قصر کے کیا احکام اور شرائط ہیں؟",
    },
    {
      title: "📜 احادیث نبویہ و اخلاص",
      prompt: "حدیث «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ» کی جامع تشریح اور اہمیت بتائیں",
    },
    {
      title: "🤲 آیت الکرسی اور فضائل",
      prompt: "آیت الکرسی کی فضیلت اور سورۃ الفاتحہ کے مضامین کی وضاحت کریں",
    },
  ];

  return (
    <div dir="rtl" className="flex-1 flex flex-col h-full bg-[#07130f] relative overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 sm:h-16 px-4 border-b border-emerald-950/70 bg-[#06100d]/90 backdrop-blur-md flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-900/30 transition-colors"
            title="مینیو کھولیں"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <IslamicLogo className="w-9 h-9 rounded-xl shadow-md" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-emerald-200 font-urdu leading-tight">
                اسلامی چیٹ جی پی ٹی
              </h2>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Calendar */}
          <button
            onClick={onOpenCalendar}
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors"
            title="اسلامی کیلنڈر"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Clear Session */}
          {session.messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
              title="چیٹ صاف کریں"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {session.messages.length === 0 ? (
          /* EMPTY CHAT STATE */
          <div className="max-w-2xl mx-auto py-8 sm:py-12 text-center space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
              <IslamicLogo className="w-24 h-24 mx-auto relative rounded-3xl shadow-2xl shadow-emerald-950/80" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-200 font-urdu">
                السلام علیکم ورحمۃ اللہ وبرکاتہ!
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-urdu leading-relaxed max-w-lg mx-auto">
                میں آپ کا **اسلامی چیٹ جی پی ٹی (Islamic ChatGPT)** ہوں۔ آپ قرآن، احادیث، فقہ، اور اپنی فراہم کردہ کتب کی روشنی میں کوئی بھی دینی و علمی سوال پوچھ سکتے ہیں۔
              </p>
            </div>

            {/* Quick Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-right">
              {samplePrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(item.prompt)}
                  className="p-4 bg-[#0a1b16]/70 hover:bg-emerald-950/50 border border-emerald-900/40 hover:border-emerald-600/50 rounded-2xl transition-all text-right group shadow-sm"
                >
                  <p className="text-xs font-bold text-emerald-300 font-urdu group-hover:text-emerald-200">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400 font-urdu mt-1 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* MESSAGE THREAD */
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {session.messages.map((msg) => {
              const isUser = msg.sender === "user";

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isUser ? "justify-start flex-row" : "justify-start flex-row"}`}
                >
                  {/* Avatar */}
                  {!isUser ? (
                    <IslamicLogo className="w-9 h-9 rounded-2xl shrink-0 mt-0.5 shadow-md shadow-emerald-950" />
                  ) : (
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-700 border border-emerald-500/40 flex items-center justify-center text-emerald-100 font-bold text-xs shrink-0 mt-0.5 shadow-md">
                      آپ
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`flex-1 rounded-3xl p-4 sm:p-5 transition-all text-sm leading-relaxed font-urdu select-text selection:bg-emerald-600 selection:text-white ${
                      isUser
                        ? "bg-[#0c241d] border border-emerald-800/40 text-slate-100 shadow-md"
                        : "bg-[#061410] border border-emerald-950 text-slate-200 shadow-lg"
                    }`}
                  >
                    {/* Markdown Body */}
                    <div className="prose prose-invert prose-emerald max-w-none font-urdu leading-loose text-slate-200 select-text">
                      {msg.text ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            blockquote: ({ children }) => (
                              <blockquote className="border-r-4 border-emerald-400 pr-4 pl-3 py-3 my-3 text-emerald-100 bg-[#042017]/90 rounded-l-2xl shadow-inner font-arabic text-base sm:text-lg leading-[2.4] select-text text-right tracking-wide">
                                {children}
                              </blockquote>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold text-emerald-300 my-2 select-text">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-bold text-emerald-400 my-2 select-text">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-bold text-emerald-300 my-1.5 select-text">{children}</h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-2.5 leading-loose select-text">{children}</p>
                            ),
                            li: ({ children }) => (
                              <li className="mb-1 select-text">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold text-emerald-300 select-text">{children}</strong>
                            ),
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex items-center gap-2 py-1 text-emerald-400 text-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                          <span className="mr-2">کتب کا مطالعہ اور جواب کی تیاری جاری ہے...</span>
                        </div>
                      )}
                    </div>

                    {/* Book Citations Callout */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-emerald-950 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>ماخوذ از آپ کی کتب خانہ (Book References):</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.citations.map((c, i) => (
                            <div
                              key={i}
                              className="p-2.5 bg-emerald-950/40 border border-emerald-900/40 rounded-xl text-xs text-slate-300 space-y-1"
                            >
                              <div className="flex items-center justify-between text-emerald-300 font-semibold">
                                <span>📖 {c.bookTitle}</span>
                                {c.pageNumber && <span>صفحہ: {c.pageNumber}</span>}
                              </div>
                              {c.chapter && (
                                <p className="text-[11px] text-slate-400">باب: {c.chapter}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Message Actions */}
                    {!isUser && msg.text && (
                      <div className="mt-4 pt-2 border-t border-emerald-950/60 flex items-center justify-between text-slate-400 text-xs">
                        <span className="text-[11px] text-slate-500 font-sans">{msg.timestamp}</span>

                        <div className="flex items-center gap-1.5">
                          {/* Full Copy Button */}
                          <button
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="p-1.5 px-2 rounded-xl hover:text-emerald-300 hover:bg-emerald-950/60 bg-emerald-950/30 border border-emerald-900/40 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-300"
                            title="مکمل تحریر کاپی کریں"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[11px] text-emerald-400 font-urdu">کاپی ہو گئی</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[11px] font-urdu">مکمل کاپی</span>
                              </>
                            )}
                          </button>

                          {/* TTS Audio Reading */}
                          <button
                            onClick={() => handleSpeak(msg.text, msg.id)}
                            className={`p-1.5 px-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border ${
                              isSpeakingId === msg.id
                                ? "text-emerald-400 bg-emerald-950 border-emerald-600"
                                : "text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/60 bg-emerald-950/30 border-emerald-900/40"
                            }`}
                            title="آواز میں سنیں"
                          >
                            {isSpeakingId === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            <span className="text-[11px] font-urdu">سنیں</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 sm:p-4 bg-[#06100d]/95 border-t border-emerald-950/70 shrink-0 z-30">
        <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto relative">
          <div className="relative flex items-center bg-[#030907] border border-emerald-900/50 focus-within:border-emerald-500 rounded-2xl shadow-xl transition-all">
            {/* Voice Input Button */}
            {speechSupported && (
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-3 rounded-xl transition-colors ${
                  isListening
                    ? "text-red-400 bg-red-950/60 animate-pulse"
                    : "text-slate-400 hover:text-emerald-300"
                }`}
                title={isListening ? "سننا بند کریں" : "بول کر سوال لکھیں"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            {/* Expanding Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اسلامی سوال پوچھیں یا کتاب کے حوالے سے رہنمائی طلب کریں..."
              className="flex-1 py-3 px-3 bg-transparent text-slate-100 placeholder-slate-500 text-sm font-urdu focus:outline-none resize-none leading-relaxed"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="m-1.5 p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-40 text-white shadow-md transition-all flex items-center justify-center shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center text-[11px] text-slate-500 font-urdu mt-2">
            اسلامی چیٹ جی پی ٹی مستند اسلامی کتب اور AI ماڈل پر مبنی ہے۔ نازک فقہی مسائل میں جید علماء سے رجوع فرمائیں۔
          </p>
        </form>
      </div>
    </div>
  );
};
