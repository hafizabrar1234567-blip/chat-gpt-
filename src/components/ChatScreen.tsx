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
  getNodeText,
  getQuranAudioUrl,
  extractMessageSections,
  quranAudioPlayer,
  QARI_LIST,
  QariId,
  DetectedAyah,
  prepareHadithSpeechText,
} from "../utils/quranAudioService";
import { sanitizeUrduIslamicContent } from "../utils/textSanitizer";

// Urdu vs Arabic separation logic
const URDU_SPECIFIC_CHARS = /[\u0679\u0688\u0691\u06BA\u06D2\u06C1\u06BE\u0686\u067E\u06AF\u0698]/;
const URDU_COMMON_WORDS = /(?:^|\s)(کا|کی|کے|کو|میں|سے|پر|ہے|ہیں|تھا|تھی|تھے|نے|اور|کہ|یہ|وہ|کر|ہو|گیا|فرمایا|مروی|انہوں|سنا)(?:$|\s)/;
const ARABIC_OPENING_PHRASES = /^(الحمد\s*لله|والصلاة\s*والسلام|الصلاة\s*والسلام|بسم\s*الله|أشهد\s*أن|لا\s*إله\s*إلا\s*الله|سبحان\s*الله|أستغفر\s*الله|اللهم|ربنا|قال\s*رسول\s*الله|عن\s*أبي|عن\s*ابن|عن\s*عمر)/;
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670]/;

export function renderFormattedIslamicText(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string") {
    const trimmed = node.trim();
    if (!trimmed) return node;

    // Check if the whole string is an Arabic sentence or doxology
    const isPureArabic =
      !URDU_SPECIFIC_CHARS.test(trimmed) &&
      !URDU_COMMON_WORDS.test(trimmed) &&
      (ARABIC_OPENING_PHRASES.test(trimmed) || (TASHKEEL_REGEX.test(trimmed) && trimmed.length > 5));

    if (isPureArabic) {
      return (
        <span
          className="font-arabic font-quran text-emerald-950 font-normal inline-block text-[1.14em] leading-[2.4] tracking-wide"
          dir="rtl"
        >
          {node}
        </span>
      );
    }

    // Segment mixed text:
    // 1. Bracketed Arabic («...» or ﴿...﴾)
    // 2. Arabic doxologies (الحمد لله..., والصلاة والسلام..., بسم الله...)
    // 3. English words & tokens (starting with English letter, isolated so they never break in half)
    const SEGMENT_REGEX = /([«﴿][^»﴾\r\n]+[»﴾]|(?:الحمد\s+لله|والصلاة\s+والسلام|بسم\s+الله\s+الرحمن\s+الرحيم)[^\r\n.!؟]*[!؟.]?|[A-Za-z][A-Za-z0-9_.-]*(?:[ \t]+[A-Za-z0-9_.-]+)*)/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = SEGMENT_REGEX.exec(node)) !== null) {
      if (match.index > lastIndex) {
        parts.push(node.substring(lastIndex, match.index));
      }
      const token = match[0];
      const isEnglish = /[A-Za-z]/.test(token);

      if (isEnglish) {
        parts.push(
          <bdi
            key={`en-${match.index}`}
            className="inline-block font-sans font-medium px-1 text-[0.92em] text-slate-900 whitespace-nowrap align-baseline"
            dir="ltr"
          >
            {token}
          </bdi>
        );
      } else {
        parts.push(
          <span
            key={`ar-${match.index}`}
            className="font-arabic font-quran text-emerald-950 font-normal inline text-[1.12em] leading-[2.4] tracking-wide mx-0.5"
            dir="rtl"
          >
            {token}
          </span>
        );
      }
      lastIndex = SEGMENT_REGEX.lastIndex;
    }

    if (lastIndex === 0) {
      return node;
    }

    if (lastIndex < node.length) {
      parts.push(node.substring(lastIndex));
    }

    return parts;
  }

  if (Array.isArray(node)) {
    return React.Children.map(node, (child) => renderFormattedIslamicText(child));
  }

  if (React.isValidElement(node) && (node.props as any)?.children) {
    return React.cloneElement(
      node,
      undefined,
      renderFormattedIslamicText((node.props as any).children)
    );
  }

  return node;
}

// Context to prevent double-rendering inside nested blockquotes and paragraphs
const InBlockquoteContext = React.createContext(false);

interface InlineAyahAudioProps {
  msgId: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  preferredQari: QariId;
  activeAudio: any;
  onPlay: (msgId: string, surah: number, ayah: number) => void;
  onReplay: (msgId: string, surah: number, ayah: number) => void;
  onToggleQari: (qariId: QariId) => void;
}

const InlineAyahAudio: React.FC<InlineAyahAudioProps> = ({
  msgId,
  surahNumber,
  ayahNumber,
  surahName,
  preferredQari,
  activeAudio,
  onPlay,
  onReplay,
  onToggleQari,
}) => {
  const isPlayingThis =
    activeAudio?.msgId === msgId &&
    activeAudio?.type === "ayah" &&
    activeAudio?.isPlaying;

  return (
    <div
      className="not-prose my-2.5 p-3 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl shadow-xs space-y-2.5 text-right"
      dir="rtl"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-200/70 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 font-urdu">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>📖 تلاوتِ قرآن: {surahName} [آیت: {ayahNumber}]</span>
        </div>

        {/* Qari Selector Buttons */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-emerald-200 text-xs shadow-xs">
          <span className="text-[11px] text-slate-500 font-urdu px-1">قاری:</span>
          {QARI_LIST.map((qari) => (
            <button
              key={qari.id}
              type="button"
              onClick={() => onToggleQari(qari.id)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-urdu transition-all cursor-pointer ${
                preferredQari === qari.id
                  ? "bg-emerald-600 text-white font-bold shadow-xs"
                  : "text-slate-600 hover:text-emerald-800"
              }`}
            >
              {qari.id === "alafasy" ? "مشاری العفاسی" : "سعود الشریم"}
            </button>
          ))}
        </div>
      </div>

      {/* Play / Pause / Replay Action Button */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onPlay(msgId, surahNumber, ayahNumber)}
          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-urdu font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          {isPlayingThis ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>تلاوت روکیں (Pause)</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>🔊 تلاوت سنیں (عربی تلاوت)</span>
            </>
          )}
        </button>

        {activeAudio?.msgId === msgId && activeAudio?.type === "ayah" && (
          <button
            type="button"
            onClick={() => onReplay(msgId, surahNumber, ayahNumber)}
            className="p-1.5 px-2.5 rounded-xl text-emerald-800 hover:text-emerald-950 bg-white border border-emerald-200 shadow-xs transition-colors flex items-center gap-1 text-[11px] font-urdu cursor-pointer"
            title="دوبارہ سنیں"
          >
            <RotateCcw className="w-3 h-3 text-emerald-600" />
            <span>دوبارہ سنیں</span>
          </button>
        )}
      </div>
    </div>
  );
};



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

    const cleanText =
      type === "hadith"
        ? prepareHadithSpeechText(text).slice(0, 3000)
        : text.replace(/[#*`_>\[\]]/g, "").slice(0, 1000);

    const targetLang = language === "arabic" ? "ar-SA" : "ur-PK";
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLang;
    utterance.rate = 0.95;

    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        let voice: SpeechSynthesisVoice | undefined;
        if (targetLang.startsWith("ur")) {
          voice =
            voices.find((v) => v.lang.toLowerCase().startsWith("ur") || v.name.toLowerCase().includes("urdu") || v.name.includes("اردو")) ||
            voices.find((v) => v.lang.toLowerCase().startsWith("ar") || v.name.toLowerCase().includes("arabic")) ||
            voices.find((v) => v.lang.toLowerCase().startsWith("hi") || v.name.toLowerCase().includes("hindi"));
        } else {
          voice =
            voices.find((v) => v.lang.toLowerCase().startsWith("ar") || v.name.toLowerCase().includes("arabic")) ||
            voices.find((v) => v.lang.toLowerCase().startsWith("ur") || v.name.toLowerCase().includes("urdu"));
        }
        if (voice) {
          utterance.voice = voice;
        }
      }
    } catch {}

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
    <div dir="rtl" className="flex-1 flex flex-col h-full bg-[#f8faf9] relative overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 sm:h-16 px-3 sm:px-4 border-b border-slate-200/90 bg-white/95 backdrop-blur-md flex items-center justify-between z-30 shrink-0 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSidebar();
            }}
            className="p-2 sm:p-2.5 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 active:scale-90 transition-all cursor-pointer shrink-0 flex items-center justify-center border border-slate-200/80 bg-white shadow-xs"
            title={isSidebarOpen ? "ڈیش بورڈ بند کریں" : "ڈیش بورڈ / مینیو کھولیں"}
            aria-label={isSidebarOpen ? "ڈیش بورڈ بند کریں" : "ڈیش بورڈ / مینیو کھولیں"}
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5 text-emerald-700 transition-transform rotate-90" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <IslamicLogo className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-xs shrink-0" />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-bold text-emerald-950 font-urdu leading-tight truncate">
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
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
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
              className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200/80 bg-white active:scale-95 transition-all cursor-pointer shadow-xs"
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
            className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200/80 bg-white active:scale-95 transition-all cursor-pointer shadow-xs"
            title="اسلامی کیلنڈر"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* App Settings */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200/80 bg-white active:scale-95 transition-all cursor-pointer shadow-xs"
              title="سیٹنگز"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          )}

          {/* Clear Session */}
          {session.messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="p-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 bg-white active:scale-95 transition-all cursor-pointer shadow-xs"
              title="چیٹ صاف کریں"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
        {session.messages.length === 0 ? (
          /* EMPTY CHAT STATE */
          <div className="max-w-2xl mx-auto py-8 sm:py-12 text-center space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-500/15 blur-2xl rounded-full pointer-events-none" />
              <IslamicLogo className="w-20 h-20 sm:w-24 sm:h-24 mx-auto relative rounded-3xl shadow-md transition-all hover:scale-105" />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950 font-urdu">
                السلام علیکم ورحمۃ اللہ وبرکاتہ!
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-urdu leading-relaxed max-w-xl mx-auto">
                خوش آمدید! میں آپ کا **اسلامی چیٹ جی پی ٹی (Islamic ChatGPT)** ڈیجیٹل اسسٹنٹ ہوں۔ آپ مجھ سے قرآن و سنت، احادیث، فقہی احکام کے ساتھ ساتھ سائنسی، تاریخی، تعلیمی اور عمومی موضوعات پر کوئی بھی سوال پوچھ سکتے ہیں۔
              </p>
            </div>

            {/* Quick Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-right">
              {samplePrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(item.prompt)}
                  className="p-4 bg-white hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-300 rounded-2xl transition-all text-right group shadow-xs cursor-pointer"
                >
                  <p className="text-xs font-bold text-emerald-800 font-urdu group-hover:text-emerald-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-600 font-urdu mt-1 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* MESSAGE THREAD */
          <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-6">
            {session.messages.map((msg) => {
              const isUser = msg.sender === "user";
              const sections = !isUser && msg.text ? extractMessageSections(msg.text) : {};

              return (
                <div key={msg.id} className="w-full">
                  {isUser ? (
                    /* User Question Bubble - Right-aligned, neat and distinct */
                    <div className="flex items-start gap-2.5 max-w-[94%] sm:max-w-[85%] mr-auto my-1">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 border border-emerald-400/40 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                        آپ
                      </div>
                      <div
                        dir="auto"
                        className="rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3.5 bg-[#eef7f2] border border-emerald-200/90 text-slate-800 shadow-xs text-[16.5px] sm:text-[18px] leading-[2.1] font-urdu select-text"
                      >
                        {msg.imageUrl && (
                          <div className="mb-2 max-w-xs rounded-xl overflow-hidden border border-emerald-500/50 shadow-xs">
                            <img
                              src={msg.imageUrl}
                              alt="منسلک تصویر"
                              className="w-full max-h-64 object-contain bg-slate-100 rounded-lg"
                            />
                          </div>
                        )}
                        <p className="select-text whitespace-pre-wrap">{sanitizeUrduIslamicContent(msg.text)}</p>
                      </div>
                    </div>
                  ) : (
                    /* Assistant Answer - FULL WIDTH across mobile screen, matching ChatGPT in Image 2 */
                    <div className="w-full py-2 border-b border-slate-200/60 sm:border-0 pb-4 sm:pb-2 mb-2 sm:mb-0">
                      {/* Assistant Identity Header */}
                      <div className="flex items-center gap-2 mb-2.5 px-0.5">
                        <IslamicLogo className="w-6 h-6 rounded-lg shrink-0 shadow-xs" />
                        <span className="text-xs sm:text-sm font-bold text-emerald-950 font-urdu">
                          اسلامی چیٹ جی پی ٹی
                        </span>
                      </div>

                      {/* Attached Picture */}
                      {msg.imageUrl && (
                        <div className="mb-3 max-w-sm rounded-2xl overflow-hidden border border-emerald-500/50 shadow-xs">
                          <img
                            src={msg.imageUrl}
                            alt="منسلک تصویر"
                            className="w-full max-h-72 object-contain bg-slate-100 rounded-xl"
                          />
                        </div>
                      )}

                      {/* Markdown Body - Full width across screen */}
                      <div
                        dir="auto"
                        className="w-full font-urdu leading-[2.2] sm:leading-[2.3] text-[16.5px] sm:text-[18px] text-slate-800 select-text px-0.5"
                      >
                        {msg.text ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              blockquote: ({ node, children }) => {
                                const blockText = getNodeText(node);
                                const ayah = detectQuranAyah(blockText);

                                return (
                                  <InBlockquoteContext.Provider value={true}>
                                  <div className="my-3.5 space-y-2">
                                    <blockquote className="border border-emerald-200 border-r-4 border-r-emerald-600 pr-5 pl-4 py-4 text-emerald-950 bg-[#f0fdf4] rounded-2xl shadow-xs text-base sm:text-xl leading-[2.6] select-text text-right tracking-wide">
                                      {renderFormattedIslamicText(children)}
                                    </blockquote>

                                    {/* Inline Ayah Audio Bar directly below the Ayah */}
                                    {ayah && (
                                      <InlineAyahAudio
                                        msgId={msg.id}
                                        surahNumber={ayah.surahNumber}
                                        ayahNumber={ayah.ayahNumber}
                                        surahName={ayah.surahName}
                                        preferredQari={preferredQari}
                                        activeAudio={activeAudio}
                                        onPlay={handlePlayAyah}
                                        onReplay={(mId, sNum, aNum) =>
                                          handleReplayAudio(mId, sNum, aNum, undefined, "ayah")
                                        }
                                        onToggleQari={handleToggleQari}
                                      />
                                    )}
                                  </div>
                                </InBlockquoteContext.Provider>
                              );
                            },
                            h1: ({ children }) => (
                              <h1 className="text-[21px] sm:text-[23px] font-bold text-emerald-950 my-3 leading-[2] select-text">
                                {renderFormattedIslamicText(children)}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-[19px] sm:text-[21px] font-bold text-emerald-900 my-2.5 leading-[2.1] select-text">
                                {renderFormattedIslamicText(children)}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-[17.5px] sm:text-[19px] font-bold text-emerald-850 my-2 leading-[2.2] select-text">
                                {renderFormattedIslamicText(children)}
                              </h3>
                            ),
                            p: ({ node, children }) => {
                              const inBlockquote = React.useContext(InBlockquoteContext);
                              const pText = !inBlockquote ? getNodeText(node) : "";
                              const ayah = !inBlockquote ? detectQuranAyah(pText) : null;

                              return (
                                <div className="mb-2.5">
                                  <p className="text-[17px] sm:text-[18.5px] leading-[2.2] sm:leading-[2.3] select-text text-slate-800 font-normal">
                                    {renderFormattedIslamicText(children)}
                                  </p>
                                  {ayah && (
                                    <InlineAyahAudio
                                      msgId={msg.id}
                                      surahNumber={ayah.surahNumber}
                                      ayahNumber={ayah.ayahNumber}
                                      surahName={ayah.surahName}
                                      preferredQari={preferredQari}
                                      activeAudio={activeAudio}
                                      onPlay={handlePlayAyah}
                                      onReplay={(mId, sNum, aNum) =>
                                        handleReplayAudio(mId, sNum, aNum, undefined, "ayah")
                                      }
                                      onToggleQari={handleToggleQari}
                                    />
                                  )}
                                </div>
                              );
                            },
                            li: ({ children }) => (
                              <li className="mb-1.5 text-[17px] sm:text-[18.5px] leading-[2.2] sm:leading-[2.3] text-slate-800 select-text">
                                {renderFormattedIslamicText(children)}
                              </li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold text-emerald-900 select-text">
                                {renderFormattedIslamicText(children)}
                              </strong>
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
                                      ? "inline-flex items-center gap-1.5 px-3 py-1.5 my-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs border border-emerald-500 transition-all cursor-pointer no-underline"
                                      : isApp
                                      ? "inline-flex items-center gap-1.5 px-3 py-1.5 my-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl shadow-xs border border-emerald-200 transition-all cursor-pointer no-underline"
                                      : "inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 underline underline-offset-4 decoration-emerald-500 font-medium transition-colors my-1 px-1 bg-emerald-50 rounded-md border border-emerald-200"
                                  }
                                >
                                  <span>{children}</span>
                                  <ExternalLink className="w-3.5 h-3.5 inline-block opacity-90 shrink-0" />
                                </a>
                              );
                            },
                          }}
                        >
                          {sanitizeUrduIslamicContent(msg.text)}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex items-center gap-2 py-1 text-emerald-600 text-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                          <span className="mr-2">کتب کا مطالعہ اور جواب کی تیاری جاری ہے...</span>
                        </div>
                      )}
                    </div>

                    {/* Verified Al-Ulama Fatwa Source Card */}
                    {msg.alUlamaSource && (
                      <div className="mt-4 p-4 bg-emerald-50/85 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                            <span>ماخذ: لجنۃ العلماء للإفتاء (alulama.org)</span>
                          </div>
                          <p className="text-xs text-slate-700 font-urdu font-medium line-clamp-1">
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
                            className="px-3 py-2 bg-white hover:bg-slate-50 text-emerald-800 text-xs font-bold rounded-xl shadow-xs border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
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
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs border border-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer"
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
                      <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>ماخوذ از آپ کی کتب خانہ (Book References):</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.citations.map((c, i) => (
                            <div
                              key={i}
                              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1"
                            >
                              <div className="flex items-center justify-between text-emerald-900 font-semibold">
                                <span>📖 {c.bookTitle}</span>
                                {c.pageNumber && <span>صفحہ: {c.pageNumber}</span>}
                              </div>
                              {c.chapter && (
                                <p className="text-[11px] text-slate-500">باب: {c.chapter}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 🔊 Granular Audio Listening Bar (ترجمہ، تفسیر) */}
                    {!isUser && msg.text && (sections.ayahTranslation || sections.tafseerText) && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center gap-2 flex-wrap text-xs font-urdu">
                        <span className="text-[11px] text-emerald-700 font-bold">🔊 سنیں:</span>

                        {/* Translation Listen */}
                        {sections.ayahTranslation && (
                          <button
                            type="button"
                            onClick={() => handleSpeakSection(msg.id, sections.ayahTranslation!, "translation", "ترجمہ")}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                              activeAudio?.msgId === msg.id && activeAudio?.type === "translation" && activeAudio?.isPlaying
                                ? "bg-emerald-100 border-emerald-400 text-emerald-900 font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50"
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
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
                                ? "bg-emerald-100 border-emerald-400 text-emerald-900 font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50"
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>تفسیر سنیں</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* 🎛️ Active Audio Controller (When audio is playing/paused) */}
                    {!isUser && activeAudio?.msgId === msg.id && (
                      <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 text-xs font-urdu shadow-xs animate-fadeIn">
                        <div className="flex items-center gap-2 text-emerald-900">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                          <span className="font-bold">{activeAudio.label || "آڈیو"}</span>
                          <span className="text-[11px] text-slate-600">
                            {activeAudio.isPlaying ? "جاری ہے..." : "(موقوف / Paused)"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {activeAudio.isPlaying ? (
                            <button
                              type="button"
                              onClick={handlePauseAudio}
                              className="p-1 px-2 bg-white hover:bg-slate-100 border border-emerald-300 rounded-lg text-emerald-800 flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Pause"
                            >
                              <Pause className="w-3.5 h-3.5" />
                              <span>Pause</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResumeAudio}
                              className="p-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 cursor-pointer font-bold shadow-xs"
                              title="Resume"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Resume</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleStopAudio()}
                            className="p-1 px-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center gap-1 cursor-pointer"
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
                      <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-slate-500 text-xs flex-wrap gap-2">
                        <span className="text-[11px] text-slate-400 font-sans">{msg.timestamp}</span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Bookmark / محفوظ کریں */}
                          <button
                            type="button"
                            onClick={() => handleToggleBookmark(msg)}
                            className={`p-1.5 px-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border ${
                              savedIds.has(msg.id)
                                ? "text-emerald-800 bg-emerald-100 border-emerald-300"
                                : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 bg-slate-50 border-slate-200"
                            }`}
                            title="محفوظ کریں (Bookmark)"
                          >
                            {savedIds.has(msg.id) ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/30" />
                                <span className="text-[11px] font-urdu text-emerald-800">محفوظ شدہ</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[11px] font-urdu">محفوظ کریں</span>
                              </>
                            )}
                          </button>

                          {/* Share / شیئر کریں */}
                          <button
                            type="button"
                            onClick={() => handleShareMessage(msg)}
                            className="p-1.5 px-2 rounded-xl hover:text-emerald-800 hover:bg-emerald-50 bg-slate-50 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-600"
                            title="شیئر کریں"
                          >
                            {sharedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[11px] text-emerald-600 font-urdu">شیئر ہو گیا!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[11px] font-urdu">شیئر کریں</span>
                              </>
                            )}
                          </button>

                          {/* Full Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="p-1.5 px-2 rounded-xl hover:text-emerald-800 hover:bg-emerald-50 bg-slate-50 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-600"
                            title="مکمل تحریر کاپی کریں"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[11px] text-emerald-600 font-urdu">کاپی ہو گئی</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-emerald-600" />
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
                                ? "text-emerald-800 bg-emerald-100 border-emerald-400"
                                : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 bg-slate-50 border-slate-200"
                            }`}
                            title="مکمل جواب سنیں"
                          >
                            {activeAudio?.msgId === msg.id && activeAudio?.type === "full" && activeAudio?.isPlaying ? (
                              <VolumeX className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span className="text-[11px] font-urdu">سنیں</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="p-2.5 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shrink-0 z-30 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-xs">
        <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto relative">
          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="mb-2 flex items-center gap-2">
              <div className="relative inline-block rounded-xl overflow-hidden border border-emerald-500 shadow-md bg-white p-1">
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
              <span className="text-xs text-emerald-700 font-urdu">تصویر منسلک ہے</span>
            </div>
          )}

          <div className="relative flex items-center bg-slate-50 border border-slate-300 focus-within:border-emerald-600 focus-within:bg-white rounded-2xl shadow-xs transition-all p-1">
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
              className="p-2 sm:p-2.5 text-slate-500 hover:text-emerald-700 active:scale-90 transition-all cursor-pointer shrink-0 rounded-xl"
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
                    ? "text-red-600 bg-red-50 animate-pulse"
                    : "text-slate-500 hover:text-emerald-700"
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
              className={`flex-1 py-2 px-2.5 bg-transparent text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none resize-none leading-relaxed min-h-[38px] max-h-32 transition-all ${
                inputText.trim() && /^[a-zA-Z0-9]/.test(inputText.trim()[0])
                  ? "text-left font-sans"
                  : "text-right font-urdu"
              }`}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedImage) || isLoading}
              className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-40 text-white shadow-xs transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
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
