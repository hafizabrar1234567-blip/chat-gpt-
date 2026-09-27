import React, { useState, useEffect } from "react";
import {
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Volume2,
  Lock,
  Settings as SettingsIcon,
  Users,
  RefreshCw,
  Mail,
  User,
  Calendar,
  MessageSquare,
  Database,
} from "lucide-react";
import { QARI_LIST, QariId } from "../utils/quranAudioService";
import { UserAccount } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
  currentUser?: UserAccount | null;
}

const ADMIN_EMAILS = ["hafizabrar1234567@gmail.com"];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
  currentUser,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [defaultQari, setDefaultQari] = useState<QariId>(() => {
    return (localStorage.getItem("preferred_qari") as QariId) || "alafasy";
  });

  // Admin access state
  const isDirectAdminUser = Boolean(
    currentUser?.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase().trim())
  );
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem("admin_session_unlocked") === "true";
  });
  const [showAdminPinPrompt, setShowAdminPinPrompt] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const isAdmin = isDirectAdminUser || isAdminUnlocked;
  const [adminTab, setAdminTab] = useState<"users" | "apikey" | "database">("users");
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isUsersLoading, setIsUsersLoading] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Database state
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    type: string;
    message: string;
    databaseName?: string;
    totalUsers?: number;
  } | null>(null);
  const [dbUri, setDbUri] = useState("");
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [dbFeedback, setDbFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleQariChange = (id: QariId) => {
    setDefaultQari(id);
    localStorage.setItem("preferred_qari", id);
  };

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    setUsersError(null);
    try {
      const pin = localStorage.getItem("admin_session_unlocked") === "true" ? "786" : "";
      const token = localStorage.getItem("postly_auth_token") || "";

      let fetchedFromServer = false;
      try {
        const res = await fetch(`/api/admin/users?pin=${encodeURIComponent(pin)}&token=${encodeURIComponent(token)}`, {
          headers: {
            ...(pin ? { "x-admin-pin": pin } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.users)) {
            setTotalUsers(data.totalUsers || data.users.length);
            setUsersList(data.users);
            fetchedFromServer = true;
          }
        }
      } catch (serverErr) {
        // Fallback to local
      }

      if (!fetchedFromServer) {
        const raw = localStorage.getItem("postly_local_users_db");
        if (raw) {
          const localList: UserAccount[] = JSON.parse(raw);
          setTotalUsers(localList.length);
          setUsersList(localList);
        } else {
          setTotalUsers(0);
          setUsersList([]);
        }
      }
    } catch (err: any) {
      setUsersError(err.message || "ڈیٹا لانے میں مسئلہ پیش آیا۔");
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      setPinError("");
      setShowAdminPinPrompt(false);
      setAdminPinInput("");
      if (isAdmin) {
        fetchStatus();
        fetchUsers();
        fetchDatabaseStatus();
      }
    }
  }, [isOpen, isAdmin]);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/settings/status");
      const data = await res.json();
      if (data.success) {
        setHasKey(data.hasGeminiKey);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDatabaseStatus = async () => {
    try {
      const res = await fetch("/api/admin/database");
      const data = await res.json();
      if (data.success) {
        setDbStatus(data);
      }
    } catch (e) {
      console.error("fetchDatabaseStatus error:", e);
    }
  };

  const handleSaveDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUri.trim()) return;
    setIsDbLoading(true);
    setDbFeedback(null);
    try {
      const pin = localStorage.getItem("admin_session_unlocked") === "true" ? "786" : "";
      const token = localStorage.getItem("postly_auth_token") || "";
      const res = await fetch("/api/admin/database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(pin ? { "x-admin-pin": pin } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ uri: dbUri.trim(), pin, token }),
      });
      const data = await res.json();
      if (data.success) {
        setDbFeedback({
          type: "success",
          text: data.message || "MongoDB کلاؤڈ ڈیٹا بیس کامیابی سے منسلک ہو گیا ہے! 🎉",
        });
        setDbStatus(data.status);
        setDbUri("");
        fetchUsers();
      } else {
        setDbFeedback({
          type: "error",
          text: data.error || "ڈیٹا بیس سے رابطہ قائم نہیں ہو سکا",
        });
      }
    } catch (err: any) {
      setDbFeedback({
        type: "error",
        text: err.message || "سرور سے رابطہ نہیں ہو سکا",
      });
    } finally {
      setIsDbLoading(false);
    }
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = adminPinInput.trim().toLowerCase();
    // Accept standard Admin PIN or admin email
    if (
      pin === "786" ||
      pin === "admin786" ||
      pin === "hafizabrar" ||
      pin === "hafizabrar1234567@gmail.com"
    ) {
      localStorage.setItem("admin_session_unlocked", "true");
      setIsAdminUnlocked(true);
      setShowAdminPinPrompt(false);
      setPinError("");
      fetchStatus();
      fetchUsers();
    } else {
      setPinError("غیر درست ایڈمن پاس ورڈ / پن درج کیا گیا ہے۔");
    }
  };

  const handleLockAdmin = () => {
    localStorage.removeItem("admin_session_unlocked");
    setIsAdminUnlocked(false);
    setShowAdminPinPrompt(false);
    setPinError("");
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/settings/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("custom_gemini_api_key", apiKey.trim());
        setFeedback({
          type: "success",
          text: "Gemini API Key محفوظ ہو گئی ہے اور لائیو AI ایکٹو ہو گیا ہے! 🎉",
        });
        setHasKey(true);
        setApiKey("");
        if (onKeySaved) onKeySaved();
      } else {
        setFeedback({
          type: "error",
          text: data.error || "کی محفوظ کرنے میں مسئلہ آیا",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "سرور سے رابطہ نہیں ہو سکا",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        dir="rtl"
        className="relative w-full max-w-lg bg-[#091512] border border-emerald-800/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-emerald-900/40 bg-gradient-to-r from-emerald-950/60 to-[#0c1e19] flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {isAdmin ? <Key className="w-5 h-5" /> : <SettingsIcon className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-emerald-200 font-urdu">
                  {isAdmin ? "Gemini AI سیٹنگز (ایڈمن پینل)" : "ایپ سیٹنگز"}
                </h2>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-800/50 text-emerald-300 border border-emerald-600/40">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-urdu">
                {isAdmin
                  ? "مکمل لائیو AI (Gemini Flash) ایکٹو کرنے اور کنٹرول کے لیے ایڈمن سیٹنگز"
                  : "قرآن مجید کی تلاوت اور ایپ کی عمومی ترتیبات"}
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Default Qari Selection - Available for all users */}
          <div className="p-4 rounded-2xl bg-[#061410] border border-emerald-900/60 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 font-urdu">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>قرآن کی تلاوت کے لیے پسندیدہ قاری (Default Qari):</span>
            </div>
            <p className="text-[11px] text-slate-400 font-urdu leading-relaxed">
              قرآن مجید کی عربی تلاوت سننے کے لیے اپنا پسندیدہ قاری منتخب کریں:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {QARI_LIST.map((qari) => (
                <button
                  key={qari.id}
                  type="button"
                  onClick={() => handleQariChange(qari.id)}
                  className={`p-3 rounded-xl border text-right transition-all font-urdu flex items-center justify-between cursor-pointer ${
                    defaultQari === qari.id
                      ? "bg-emerald-900/50 border-emerald-500 text-emerald-100 shadow-md"
                      : "bg-[#040c09] border-emerald-950 text-slate-300 hover:border-emerald-800/60"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{qari.nameUrdu}</p>
                    <p className="text-[10px] text-emerald-400/80 font-sans">{qari.nameEnglish}</p>
                  </div>
                  {defaultQari === qari.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ADMIN ONLY SECTION: Users Dashboard & Gemini AI Key */}
          {isAdmin ? (
            <div className="space-y-4 pt-3 border-t border-emerald-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 font-urdu flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ایڈمن کنٹرول پینل (Admin Dashboard):
                </span>
                {!isDirectAdminUser && (
                  <button
                    type="button"
                    onClick={handleLockAdmin}
                    className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer font-urdu"
                  >
                    <Lock className="w-3 h-3" /> ایڈمن سیشن بند کریں
                  </button>
                )}
              </div>

              {/* Admin Tabs */}
              <div className="grid grid-cols-3 gap-1.5 bg-[#020b08] p-1 rounded-xl border border-emerald-900/40">
                <button
                  type="button"
                  onClick={() => setAdminTab("users")}
                  className={`py-2 px-2 rounded-lg text-xs font-urdu font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    adminTab === "users"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="truncate">صارفین ({totalUsers})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab("database")}
                  className={`py-2 px-2 rounded-lg text-xs font-urdu font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    adminTab === "database"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40"
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span className="truncate">ڈیٹا بیس</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab("apikey")}
                  className={`py-2 px-2 rounded-lg text-xs font-urdu font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    adminTab === "apikey"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40"
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span className="truncate">API کلید</span>
                </button>
              </div>

              {/* TAB 1: USERS ANALYTICS DASHBOARD */}
              {adminTab === "users" && (
                <div className="space-y-3">
                  {/* Summary Metric Card */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#031d12] to-emerald-950 border border-emerald-600/40 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-emerald-300/90 font-urdu block">
                          کل لاگ ان و رجسٹرڈ صارفین:
                        </span>
                        <h3 className="text-xl font-bold text-white font-mono leading-none mt-1">
                          {totalUsers} افراد
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={fetchUsers}
                      disabled={isUsersLoading}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-urdu flex items-center gap-1.5 border border-emerald-700/50 cursor-pointer active:scale-95 transition-all shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isUsersLoading ? "animate-spin" : ""}`} />
                      <span>تازہ کریں</span>
                    </button>
                  </div>

                  {/* Users List */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 font-urdu">
                      <span>صارفین کی فہرست:</span>
                      {usersList.length > 0 && <span>تازہ ترین پہلے</span>}
                    </div>

                    {isUsersLoading ? (
                      <div className="p-6 text-center text-emerald-400 text-xs font-urdu flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>صارفین کا ڈیٹا حاصل ہو رہا ہے...</span>
                      </div>
                    ) : usersError ? (
                      <div className="p-3 rounded-xl bg-red-950/60 border border-red-700/40 text-red-200 text-xs font-urdu text-center">
                        {usersError}
                      </div>
                    ) : usersList.length === 0 ? (
                      <div className="p-5 rounded-2xl bg-black/40 border border-emerald-900/30 text-center text-slate-400 text-xs font-urdu space-y-1">
                        <p>ابھی تک کوئی نیا صارف رجسٹرڈ نہیں ہوا۔</p>
                        <p className="text-[10px] text-slate-500">جیسے ہی کوئی سائن اپ یا لاگ ان کرے گا، وہ فوراً یہاں نظر آئے گا۔</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {usersList.map((u, i) => (
                          <div
                            key={u.id || i}
                            className="p-3 rounded-xl bg-[#03150d] border border-emerald-900/50 flex items-center justify-between gap-3 text-xs hover:border-emerald-700/50 transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-emerald-700/40 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-200 shrink-0 shadow-inner">
                                {(u.name || u.email || "U").charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white font-urdu truncate leading-snug">
                                  {u.name || "صارف"}
                                </p>
                                <p className="text-[11px] text-emerald-400 font-mono truncate" dir="ltr">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                            <div className="text-left shrink-0 text-[10px] text-slate-400 font-sans space-y-0.5" dir="ltr">
                              <span className="block text-emerald-300 font-urdu font-medium text-right">
                                💬 سوالات: {u.dailyUsage?.count ?? 0}
                              </span>
                              <span className="block text-slate-400">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GEMINI API KEY */}
              {adminTab === "apikey" && (
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-urdu ${
                      hasKey
                        ? "bg-emerald-950/70 border-emerald-700/50 text-emerald-300"
                        : "bg-amber-950/70 border-amber-700/50 text-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>
                        {hasKey
                          ? "✅ لائیو AI (Gemini Flash) فعال ہے"
                          : "⚠️ Gemini API Key شامل نہیں ہے"}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded">
                      gemini-3.7-flash
                    </span>
                  </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-urdu ${
                    feedback.type === "success"
                      ? "bg-emerald-950/80 border border-emerald-600/50 text-emerald-200"
                      : "bg-red-950/80 border border-red-600/50 text-red-200"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSaveKey} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 font-urdu mb-1.5 font-medium">
                    نئی Gemini API Key یہاں درج کریں:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#050c0a] border border-emerald-900/50 rounded-xl text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-left"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !apiKey.trim()}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-white rounded-xl font-urdu font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> تصدیق ہو رہی ہے...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" /> API Key محفوظ کریں
                    </>
                  )}
                </button>
              </form>

              {/* Get Key Link */}
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/30 rounded-2xl text-xs text-slate-400 font-urdu space-y-1.5">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> مفت Gemini API Key کیسے حاصل کریں؟
                </p>
                <p className="text-[11px] leading-relaxed">
                  Google AI Studio سے 1 منٹ میں مفت API Key حاصل کی جا سکتی ہے۔
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold underline text-xs mt-1"
                >
                  <span>Google AI Studio سے مفت Key لیں</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: CLOUD DATABASE SETTINGS */}
          {adminTab === "database" && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-urdu ${
                  dbStatus?.connected
                    ? "bg-emerald-950/70 border-emerald-700/50 text-emerald-300"
                    : "bg-amber-950/70 border-amber-700/50 text-amber-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>
                    {dbStatus?.connected
                      ? "🟢 کلاؤڈ ڈیٹا بیس منسلک ہے (MongoDB Atlas)"
                      : "🟡 مقامی فائل اسٹوریج موڈ (Local File Storage)"}
                  </span>
                </div>
                {dbStatus?.databaseName && (
                  <span className="font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded text-emerald-400">
                    {dbStatus.databaseName}
                  </span>
                )}
              </div>

              {dbStatus?.message && (
                <div className="text-[11px] text-slate-300 font-urdu bg-black/40 p-3 rounded-xl border border-emerald-900/30">
                  {dbStatus.message}
                </div>
              )}

              {/* Feedback */}
              {dbFeedback && (
                <div
                  className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-urdu ${
                    dbFeedback.type === "success"
                      ? "bg-emerald-950/80 border border-emerald-600/50 text-emerald-200"
                      : "bg-red-950/80 border border-red-600/50 text-red-200"
                  }`}
                >
                  {dbFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{dbFeedback.text}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSaveDatabase} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 font-urdu mb-1.5 font-medium">
                    MongoDB Connection String (URI):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="mongodb+srv://username:password@cluster.mongodb.net/islamic_chatgpt?retryWrites=true&w=majority"
                    value={dbUri}
                    onChange={(e) => setDbUri(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#050c0a] border border-emerald-900/50 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-left"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isDbLoading || !dbUri.trim()}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-white rounded-xl font-urdu font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDbLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> ڈیٹا بیس ٹیسٹ ہو رہا ہے...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" /> کنکشن محفوظ اور ٹیسٹ کریں
                    </>
                  )}
                </button>
              </form>

              {/* Instructions */}
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/30 rounded-2xl text-xs text-slate-400 font-urdu space-y-2">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> مفت MongoDB Atlas ڈیٹا بیس کیسے بنائیں؟
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                  <li>
                    <a
                      href="https://www.mongodb.com/cloud/atlas/register"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-sans"
                    >
                      mongodb.com/atlas <ExternalLink className="w-3 h-3" />
                    </a>{" "}
                    پر مفت سائن اپ کریں۔
                  </li>
                  <li>"M0 Free Cluster" منتخب کریں اور Create Database پر کلک کریں۔</li>
                  <li>Database Access میں ڈیٹا بیس صارف کا یوزر نیم اور پاس ورڈ بنائیں۔</li>
                  <li>Network Access میں <code>0.0.0.0/0</code> (Allow Access from Anywhere) منتخب کریں۔</li>
                  <li>Connect ➔ Drivers کا کنکشن لنک کاپی کر کے اوپر داخل کر کے محفوظ کریں۔</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      ) : (
            /* NON-ADMIN: Subtle Admin Unlock Option */
            <div className="pt-2 border-t border-emerald-900/30">
              {!showAdminPinPrompt ? (
                <button
                  type="button"
                  onClick={() => setShowAdminPinPrompt(true)}
                  className="w-full py-2 px-3 text-slate-500 hover:text-emerald-400 text-xs font-urdu flex items-center justify-center gap-1.5 rounded-xl hover:bg-emerald-950/30 transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 opacity-60" />
                  <span>ایڈمن سیٹنگز (Admin Access)</span>
                </button>
              ) : (
                <form
                  onSubmit={handleUnlockAdmin}
                  className="p-3.5 bg-[#050e0c] border border-emerald-900/50 rounded-2xl space-y-2.5 animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-urdu font-bold text-emerald-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      ایڈمن تصدیق:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAdminPinPrompt(false)}
                      className="text-slate-500 hover:text-slate-300 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-urdu">
                    Gemini AI سیٹنگز صرف ایڈمن کے لیے مخصوص ہیں۔ جاری رکھنے کے لیے ایڈمن پن درج کریں:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      autoFocus
                      required
                      placeholder="ایڈمن پن / پاس ورڈ..."
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#040908] border border-emerald-900/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-urdu"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-urdu font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Unlock className="w-3 h-3" /> ان لاک
                    </button>
                  </div>
                  {pinError && (
                    <p className="text-[11px] text-red-400 font-urdu flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {pinError}
                    </p>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
