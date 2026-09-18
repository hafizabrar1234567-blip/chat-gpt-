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
  Image as ImageIcon,
  X,
  Play,
  Pause,
  Square,
  Bookmark,
  BookmarkCheck,
  MessageSquarePlus,
  Settings2,
  Home,
} from "lucide-react";
import { IslamicLogo } from "./IslamicLogo";
import { ChatMessage, ChatSession, BookRecord, LanguageOption } from "../types";
import {
  detectQuranAyah,
  getQuranAudioUrl,
  extractMessageSections,
  quranAudioPlayer,
  QARI_LIST,
  QariId,
} from "../utils/quranAudioService";

interface ChatScreenProps {
  session: ChatSession;
  books: BookRecord[];
  onSendMessage: (text: string, image?: string | null) => Promise<void>;
  isLoading: boolean;
  onOpenSidebar: () => void;
  onOpenKnowledgeBase: () => void;
  onOpenCalendar: () => void;
  onClearChat: () => void;
  language: LanguageOption;
  onNewChat?: () => void;
  onOpenFavorites?: () => void;
  favoritesCount?: number;
  onOpenSettings?: () => void;
  isSidebarOpen?: boolean;
  onOpenHome?: () => void;
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
  onNewChat,
  onOpenFavorites,
  favoritesCount = 0,
  onOpenSettings,
  isSidebarOpen = false,
  onOpenHome,
}) => {
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const data = localStorage.getItem("saved_islamic_messages");
      if (data) {
        const arr = JSON.parse(data);
        return new Set(arr.map((item: any) => item.id));
      }
    } catch {}
    return new Set();
  });
  const [preferredQari, setPreferredQari] = useState<QariId>(() => {
    return (localStorage.getItem("preferred_qari") as QariId) || "alafasy";
  });
  const [activeAudio, setActiveAudio] = useState<{
    msgId: string;
    type: "ayah" | "translation" | "tafseer" | "hadith" | "full";
    isPlaying: boolean;
    isPaused: boolean;
    label?: string;
  } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isLoading) return;
    const text = inputText.trim();
    const image = selectedImage;
    setInputText("");
    setSelectedImage(null);
    if (textareaRef.current) textareaRef.current.style.height = "48px";
    await onSendMessage(text, image);
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

  const handleToggleQari = (qariId: QariId) => {
    setPreferredQari(qariId);
    localStorage.setItem("preferred_qari", qariId);
    // If currently playing ayah audio, restart with new qari
    if (activeAudio && activeAudio.type === "ayah") {
      quranAudioPlayer.stop();
      setActiveAudio(null);
    }
  };

  const handlePlayAyah = (msgId: string, surah: number, ayah: number) => {
    if (activeAudio?.msgId === msgId && activeAudio.type === "ayah") {
      if (activeAudio.isPlaying) {
        quranAudioPlayer.pause();
        setActiveAudio({ ...activeAudio, isPlaying: false, isPaused: true });
        return;
      } else if (activeAudio.isPaused) {
        quranAudioPlayer.resume();
        setActiveAudio({ ...activeAudio, isPlaying: true, isPaused: false });
        return;
      }
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const url = getQuranAudioUrl(surah, ayah, preferredQari);
    const qariObj = QARI_LIST.find((q) => q.id === preferredQari) || QARI_LIST[0];

    setActiveAudio({
      msgId,
      type: "ayah",
      isPlaying: true,
      isPaused: false,
      label: `آیت کی تلاوت (${qariObj.nameUrdu})`,
    });

    quranAudioPlayer.playAyah(url, `${msgId}-ayah`, (state) => {
      if (!state.isPlaying && !state.isPaused) {
        setActiveAudio(null);
      } else {
        setActiveAudio((prev) =>
          prev ? { ...prev, isPlaying: state.isPlaying, isPaused: state.isPaused } : null
        );
      }
    });
  };

  const handleSpeakSection = (
    msgId: string,
    text: string,
    type: "translation" | "tafseer" | "hadith" | "full",
    label: string
  ) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (activeAudio?.msgId === msgId && activeAudio.type === type) {
      if (activeAudio.isPlaying) {
        window.speechSynthesis.pause();
        setActiveAudio({ ...activeAudio, isPlaying: false, isPaused: true });
        return;
      } else if (activeAudio.isPaused) {
        window.speechSynthesis.resume();
        setActiveAudio({ ...activeAudio, isPlaying: true, isPaused: false });
        return;
      }
    }

    quranAudioPlayer.stop();
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[#*`_>\[\]]/g, "").slice(0, 1000);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === "arabic" ? "ar-SA" : "ur-PK";
    utterance.rate = 0.95;

    utterance.onend = () => setActiveAudio(null);
    utterance.onerror = () => setActiveAudio(null);

    window.speechSynthesis.speak(utterance);
    setActiveAudio({
      msgId,
      type,
      isPlaying: true,
      isPaused: false,
      label,
    });
  };

  const handlePauseAudio = () => {
    if (activeAudio?.type === "ayah") {
      quranAudioPlayer.pause();
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
    setActiveAudio((prev) => (prev ? { ...prev, isPlaying: false, isPaused: true } : null));
  };

  const handleResumeAudio = () => {
    if (activeAudio?.type === "ayah") {
      quranAudioPlayer.resume();
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
    }
    setActiveAudio((prev) => (prev ? { ...prev, isPlaying: true, isPaused: false } : null));
  };

  const handleReplayAudio = (
    msgId: string,
    surah?: number,
    ayah?: number,
    text?: string,
    type: "ayah" | "translation" | "tafseer" | "hadith" | "full" = "full",
    label: string = "آڈیو"
  ) => {
    if (type === "ayah" && surah && ayah) {
      const url = getQuranAudioUrl(surah, ayah, preferredQari);
      quranAudioPlayer.replay();
      setActiveAudio((prev) => (prev ? { ...prev, isPlaying: true, isPaused: false } : null));
    } else if (text && type !== "ayah") {
      handleSpeakSection(msgId, text, type, label);
    }
  };

  const handleStopAudio = () => {
    quranAudioPlayer.stop();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setActiveAudio(null);
  };

  const handleToggleBookmark = (msg: ChatMessage) => {
    try {
      const raw = localStorage.getItem("saved_islamic_messages");
      let list: any[] = raw ? JSON.parse(raw) : [];

      if (savedIds.has(msg.id)) {
        list = list.filter((item) => item.id !== msg.id);
        savedIds.delete(msg.id);
        setSavedIds(new Set(savedIds));
      } else {
        list.unshift({
          id: msg.id,
          text: msg.text,
          timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        savedIds.add(msg.id);
        setSavedIds(new Set(savedIds));
      }
      localStorage.setItem("saved_islamic_messages", JSON.stringify(list));
    } catch (e) {
      console.error("Failed to toggle bookmark:", e);
    }
  };

  const handleShareMessage = async (msg: ChatMessage) => {
    const shareText = `${msg.text}\n\n---\n📱 اسلامی چیٹ جی پی ٹی (Islamic ChatGPT) سے ماخوذ`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "اسلامی چیٹ جی پی ٹی",
          text: shareText,
        });
        setSharedId(msg.id);
        setTimeout(() => setSharedId(null), 2000);
        return;
      } catch (err) {
        // User cancelled or share error, fallback to clipboard
      }
    }

    navigator.clipboard.writeText(shareText);
    setSharedId(msg.id);
    setTimeout(() => setSharedId(null), 2000);
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
      <header className="h-14 sm:h-16 px-3 sm:px-4 border-b border-emerald-950/70 bg-[#06100d]/95 backdrop-blur-md flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSidebar();
            }}
            className="p-2 sm:p-2.5 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-900/40 active:scale-90 transition-all cursor-pointer shrink-0 flex items-center justify-center"
            title={isSidebarOpen ? "ڈیش بورڈ بند کریں" : "ڈیش بورڈ / مینیو کھولیں"}
            aria-label={isSidebarOpen ? "ڈیش بورڈ بند کریں" : "ڈیش بورڈ / مینیو کھولیں"}
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5 text-emerald-300 transition-transform rotate-90" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <IslamicLogo className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-md shrink-0" />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-bold text-emerald-200 font-urdu leading-tight truncate">
                اسلامی چیٹ جی پی ٹی
              </h2>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* New Chat Button (Easy 1-tap on Mobile) */}
          {onNewChat && (
            <button
              onClick={onNewChat}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-emerald-400 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/50 border border-emerald-800/50 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              title="نئی چیٹ شروع کریں"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-urdu font-semibold">نئی چیٹ</span>
            </button>
          )}

          {/* Favorites / محفوظ شدہ */}
          {onOpenFavorites && (
            <button
              onClick={onOpenFavorites}
              className="relative p-2 rounded-xl text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/50 active:scale-95 transition-all cursor-pointer"
              title="محفوظ شدہ پیغامات"
            >
              <Bookmark className="w-4 h-4" />
              {favoritesCount && favoritesCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {favoritesCount}
                </span>
              ) : null}
            </button>
          )}

          {/* Calendar */}
          <button
            onClick={onOpenCalendar}
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/50 active:scale-95 transition-all cursor-pointer"
            title="اسلامی کیلنڈر"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* AI Settings */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/50 active:scale-95 transition-all cursor-pointer"
              title="Gemini AI سیٹنگز"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          )}

          {/* Clear Session */}
          {session.messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 active:scale-95 transition-all cursor-pointer"
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

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-200 font-urdu">
                وعلیکم السلام ورحمۃ اللہ وبرکاتہ!
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-urdu leading-relaxed max-w-xl mx-auto">
                خوش آمدید! میں آپ کا **اسلامی چیٹ جی پی ٹی (Islamic ChatGPT)** ڈیجیٹل اسسٹنٹ ہوں۔ آپ مجھ سے قرآن و سنت، احادیث، فقہی احکام کے ساتھ ساتھ سائنسی، تاریخی، تعلیمی اور عمومی موضوعات پر کوئی بھی سوال پوچھ سکتے ہیں۔
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
              const detectedAyah = !isUser && msg.text ? detectQuranAyah(msg.text) : null;
              const sections = !isUser && msg.text ? extractMessageSections(msg.text) : {};

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
                    dir="auto"
                    className={`flex-1 rounded-3xl p-4 sm:p-5 transition-all text-sm leading-relaxed font-urdu select-text selection:bg-emerald-600 selection:text-white ${
                      isUser
                        ? "bg-[#0c241d] border border-emerald-800/40 text-slate-100 shadow-md"
                        : "bg-[#061410] border border-emerald-950 text-slate-200 shadow-lg"
                    }`}
                  >
                    {/* Attached Picture */}
                    {msg.imageUrl && (
                      <div className="mb-3 max-w-sm rounded-2xl overflow-hidden border border-emerald-700/50 shadow-md">
                        <img
                          src={msg.imageUrl}
                          alt="منسلک تصویر"
                          className="w-full max-h-72 object-contain bg-black/40 rounded-xl"
                        />
                      </div>
                    )}

                    {/* Markdown Body */}
                    <div className="prose prose-invert prose-emerald max-w-none font-urdu leading-loose text-slate-200 select-text">
                      {msg.text ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            blockquote: ({ children }) => (
                              <blockquote className="border border-emerald-500/40 pr-4 pl-4 py-3.5 my-3.5 text-emerald-100 bg-[#031d16] rounded-2xl shadow-md font-quran font-arabic text-base sm:text-xl leading-[2.6] select-text text-right tracking-wide">
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
                            a: ({ href, children }) => {
                              const isAlUlama = href && (href.includes("alulama.org") || href.includes("al-ulama"));
                              const isApp = href && (href.includes("localhost") || href.includes("127.0.0.1") || href.includes("vercel") || href.includes("chatgpt"));
                              return (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    if (href) {
                                      e.stopPropagation();
                                      window.open(href, "_blank", "noopener,noreferrer");
                                    }
                                  }}
                                  className={
                                    isAlUlama
                                      ? "inline-flex items-center gap-1.5 px-3 py-1.5 my-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md border border-emerald-400/40 transition-all cursor-pointer no-underline"
                                      : isApp
                                      ? "inline-flex items-center gap-1.5 px-3 py-1.5 my-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold text-xs rounded-xl shadow-md border border-emerald-700/50 transition-all cursor-pointer no-underline"
                                      : "inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-200 underline underline-offset-4 decoration-emerald-500/60 font-medium transition-colors my-1 px-1 bg-emerald-950/40 rounded-md border border-emerald-900/30"
                                  }
                                >
                                  <span>{children}</span>
                                  <ExternalLink className="w-3.5 h-3.5 inline-block opacity-90 shrink-0" />
                                </a>
                              );
                            },
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

                    {/* Verified Al-Ulama Fatwa Source Card */}
                    {msg.alUlamaSource && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-[#031d15] to-[#01140e] border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                            <span>ماخذ: لجنۃ العلماء للإفتاء (alulama.org)</span>
                          </div>
                          <p className="text-xs text-slate-300 font-urdu font-medium line-clamp-1">
                            📜 {msg.alUlamaSource.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <a
                            href={msg.alUlamaSource.homepageLink || "https://alulama.org/"}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              const targetUrl = msg.alUlamaSource?.homepageLink || "https://alulama.org/";
                              window.open(targetUrl, "_blank", "noopener,noreferrer");
                            }}
                            className="px-3 py-2 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 text-xs font-bold rounded-xl shadow-md border border-emerald-700/50 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>العلماء ویب سائٹ کھولیں</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          {msg.alUlamaSource.directLink && msg.alUlamaSource.isVerifiedFatwa && (
                            <a
                              href={msg.alUlamaSource.directLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (msg.alUlamaSource?.directLink) {
                                  window.open(msg.alUlamaSource.directLink, "_blank", "noopener,noreferrer");
                                }
                              }}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md border border-emerald-400/40 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>اصل فتویٰ دیکھیں</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

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

                    {/* 🎙️ Quran Ayah Recitation & Qari Selection Card */}
                    {!isUser && detectedAyah && (
                      <div className="mt-4 p-3.5 bg-gradient-to-r from-[#031d16] to-[#01140e] border border-emerald-500/50 rounded-2xl shadow-lg space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-900/60 pb-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 font-urdu">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            <span>📖 قرآن مجید: {detectedAyah.surahName} [آیت: {detectedAyah.ayahNumber}]</span>
                          </div>

                          {/* Qari Selector Buttons */}
                          <div className="flex items-center gap-1.5 bg-[#030c08] p-1 rounded-xl border border-emerald-900/60">
                            <span className="text-[11px] text-slate-400 font-urdu px-1.5">قاری:</span>
                            {QARI_LIST.map((qari) => (
                              <button
                                key={qari.id}
                                type="button"
                                onClick={() => handleToggleQari(qari.id)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-urdu transition-all cursor-pointer ${
                                  preferredQari === qari.id
                                    ? "bg-emerald-600 text-white font-bold shadow-sm"
                                    : "text-slate-400 hover:text-emerald-300"
                                }`}
                              >
                                {qari.id === "alafasy" ? "مشاری العفاسی" : "سعود الشریم"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Ayah Play / Pause Action Button */}
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => handlePlayAyah(msg.id, detectedAyah.surahNumber, detectedAyah.ayahNumber)}
                            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-urdu font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                          >
                            {activeAudio?.msgId === msg.id && activeAudio?.type === "ayah" && activeAudio?.isPlaying ? (
                              <>
                                <Pause className="w-4 h-4" />
                                <span>تلاوت روکیں (Pause)</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 fill-white" />
                                <span>🔊 آیت سنیں (عربی تلاوت)</span>
                              </>
                            )}
                          </button>

                          {/* Replay */}
                          {activeAudio?.msgId === msg.id && activeAudio?.type === "ayah" && (
                            <button
                              type="button"
                              onClick={() => handleReplayAudio(msg.id, detectedAyah.surahNumber, detectedAyah.ayahNumber, undefined, "ayah")}
                              className="p-2 rounded-xl text-slate-300 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/40 transition-colors flex items-center gap-1 text-xs font-urdu cursor-pointer"
                              title="دوبارہ سنیں"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                              <span>دوبارہ سنیں</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 🔊 Granular Audio Listening Bar (آیت، ترجمہ، تفسیر، حدیث) */}
                    {!isUser && msg.text && (sections.ayahTranslation || sections.tafseerText || sections.hadithText) && (
                      <div className="mt-3 pt-2.5 border-t border-emerald-950/70 flex items-center gap-2 flex-wrap text-xs font-urdu">
                        <span className="text-[11px] text-emerald-400/80 font-bold">🔊 سنیں:</span>

                        {/* Translation Listen */}
                        {sections.ayahTranslation && (
                          <button
                            type="button"
                            onClick={() => handleSpeakSection(msg.id, sections.ayahTranslation!, "translation", "ترجمہ")}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                              activeAudio?.msgId === msg.id && activeAudio?.type === "translation" && activeAudio?.isPlaying
                                ? "bg-emerald-900 border-emerald-500 text-emerald-100"
                                : "bg-[#040e0b] border-emerald-900/50 text-slate-300 hover:text-emerald-300"
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>ترجمہ سنیں</span>
                          </button>
                        )}

                        {/* Tafseer Listen */}
                        {sections.tafseerText && (
                          <button
                            type="button"
                            onClick={() => handleSpeakSection(msg.id, sections.tafseerText!, "tafseer", "تفسیر")}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                              activeAudio?.msgId === msg.id && activeAudio?.type === "tafseer" && activeAudio?.isPlaying
                                ? "bg-emerald-900 border-emerald-500 text-emerald-100"
                                : "bg-[#040e0b] border-emerald-900/50 text-slate-300 hover:text-emerald-300"
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>تفسیر سنیں</span>
                          </button>
                        )}

                        {/* Hadith Listen */}
                        {sections.hadithText && (
                          <button
                            type="button"
                            onClick={() => handleSpeakSection(msg.id, sections.hadithText!, "hadith", "حدیث")}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                              activeAudio?.msgId === msg.id && activeAudio?.type === "hadith" && activeAudio?.isPlaying
                                ? "bg-emerald-900 border-emerald-500 text-emerald-100"
                                : "bg-[#040e0b] border-emerald-900/50 text-slate-300 hover:text-emerald-300"
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>حدیث سنیں</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* 🎛️ Active Audio Controller (When audio is playing/paused) */}
                    {!isUser && activeAudio?.msgId === msg.id && (
                      <div className="mt-3 p-2.5 bg-[#020b08] border border-emerald-600/50 rounded-xl flex items-center justify-between gap-2 text-xs font-urdu shadow-md animate-fadeIn">
                        <div className="flex items-center gap-2 text-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-bold">{activeAudio.label || "آڈیو"}</span>
                          <span className="text-[11px] text-slate-400">
                            {activeAudio.isPlaying ? "جاری ہے..." : "(موقوف / Paused)"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {activeAudio.isPlaying ? (
                            <button
                              type="button"
                              onClick={handlePauseAudio}
                              className="p-1 px-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 rounded-lg text-emerald-300 flex items-center gap-1 cursor-pointer"
                              title="Pause"
                            >
                              <Pause className="w-3.5 h-3.5" />
                              <span>Pause</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResumeAudio}
                              className="p-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 cursor-pointer font-bold"
                              title="Resume"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Resume</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleStopAudio()}
                            className="p-1 px-2 bg-red-950/60 hover:bg-red-900/80 border border-red-800/40 text-red-300 rounded-lg flex items-center gap-1 cursor-pointer"
                            title="بند کریں"
                          >
                            <Square className="w-3 h-3" />
                            <span>بند</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Bottom Message Actions */}
                    {!isUser && msg.text && (
                      <div className="mt-4 pt-2.5 border-t border-emerald-950/60 flex items-center justify-between text-slate-400 text-xs flex-wrap gap-2">
                        <span className="text-[11px] text-slate-500 font-sans">{msg.timestamp}</span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Bookmark / محفوظ کریں */}
                          <button
                            type="button"
                            onClick={() => handleToggleBookmark(msg)}
                            className={`p-1.5 px-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border ${
                              savedIds.has(msg.id)
                                ? "text-emerald-300 bg-emerald-900/50 border-emerald-500"
                                : "text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/60 bg-emerald-950/30 border-emerald-900/40"
                            }`}
                            title="محفوظ کریں (Bookmark)"
                          >
                            {savedIds.has(msg.id) ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/30" />
                                <span className="text-[11px] font-urdu text-emerald-300">محفوظ شدہ</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[11px] font-urdu">محفوظ کریں</span>
                              </>
                            )}
                          </button>

                          {/* Share / شیئر کریں */}
                          <button
                            type="button"
                            onClick={() => handleShareMessage(msg)}
                            className="p-1.5 px-2 rounded-xl hover:text-emerald-300 hover:bg-emerald-950/60 bg-emerald-950/30 border border-emerald-900/40 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-300"
                            title="شیئر کریں"
                          >
                            {sharedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[11px] text-emerald-400 font-urdu">شیئر ہو گیا!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[11px] font-urdu">شیئر کریں</span>
                              </>
                            )}
                          </button>

                          {/* Full Copy Button */}
                          <button
                            type="button"
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

                          {/* Full Speech Reading */}
                          <button
                            type="button"
                            onClick={() => handleSpeakSection(msg.id, msg.text, "full", "مکمل جواب")}
                            className={`p-1.5 px-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border ${
                              activeAudio?.msgId === msg.id && activeAudio?.type === "full"
                                ? "text-emerald-400 bg-emerald-950 border-emerald-600"
                                : "text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/60 bg-emerald-950/30 border-emerald-900/40"
                            }`}
                            title="مکمل جواب سنیں"
                          >
                            {activeAudio?.msgId === msg.id && activeAudio?.type === "full" && activeAudio?.isPlaying ? (
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
      <div className="p-2.5 sm:p-4 bg-[#06100d]/95 backdrop-blur-md border-t border-emerald-950/70 shrink-0 z-30 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto relative">
          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="mb-2 flex items-center gap-2">
              <div className="relative inline-block rounded-xl overflow-hidden border border-emerald-500/80 shadow-lg bg-emerald-950/80 p-1">
                <img
                  src={selectedImage}
                  alt="Selected Preview"
                  className="h-14 w-14 sm:h-16 sm:w-16 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-0.5 shadow-md transition-colors cursor-pointer"
                  title="تصویر ہٹائیں"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-emerald-400 font-urdu">تصویر منسلک ہے</span>
            </div>
          )}

          <div className="relative flex items-center bg-[#030907] border border-emerald-900/50 focus-within:border-emerald-500 rounded-2xl shadow-xl transition-all p-1">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Picture Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 sm:p-2.5 text-slate-400 hover:text-emerald-300 active:scale-90 transition-all cursor-pointer shrink-0 rounded-xl"
              title="تصویر شامل کریں (Add Picture)"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Voice Input Button */}
            {speechSupported && (
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2 sm:p-2.5 rounded-xl active:scale-90 transition-all shrink-0 cursor-pointer ${
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
              dir="auto"
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اسلامی سوال پوچھیں یا رہنمائی طلب کریں..."
              className={`flex-1 py-2 px-2.5 bg-transparent text-slate-100 placeholder-slate-500 text-base sm:text-sm focus:outline-none resize-none leading-relaxed min-h-[38px] max-h-32 transition-all ${
                inputText.trim() && /^[a-zA-Z0-9]/.test(inputText.trim()[0])
                  ? "text-left font-sans"
                  : "text-right font-urdu"
              }`}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedImage) || isLoading}
              className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-40 text-white shadow-md transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center text-[10px] sm:text-[11px] text-slate-500 font-urdu mt-1.5 leading-tight">
            اسلامی چیٹ جی پی ٹی مستند اسلامی کتب اور AI ماڈل پر مبنی ہے۔
          </p>
        </form>
      </div>
    </div>
  );
};
