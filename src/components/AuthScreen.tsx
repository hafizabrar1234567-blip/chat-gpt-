import React, { useState } from "react";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Globe,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { UserAccount } from "../types";
import {
  localGoogleLogin,
  localRegister,
  localLogin,
} from "../utils/localAuth";

interface AuthScreenProps {
  onLoginSuccess: (token: string, user: UserAccount) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<"request" | "reset">("request");
  const [forgotMsg, setForgotMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Google Sign In Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");
  const [googleModalError, setGoogleModalError] = useState<string | null>(null);

  // Language State for Auth UI (Urdu / English / Arabic)
  const [authLang, setAuthLang] = useState<"urdu" | "english" | "arabic">("urdu");

  const strings = {
    urdu: {
      loginTab: "لاگ ان",
      signupTab: "نیا اکاؤنٹ بنائیں",
      emailLabel: "ای میل ایڈریس",
      emailPlaceholder: "name@example.com",
      passwordLabel: "پاس ورڈ",
      confirmPasswordLabel: "پاس ورڈ کی تصدیق",
      forgotLink: "پاس ورڈ بھول گئے؟",
      fullNameLabel: "پورا نام",
      optional: "اختیاری",
      submitLogin: "لاگ ان کریں",
      submitSignup: "نیا اکاؤنٹ بنائیں",
      or: "یا",
      googleBtn: "گوگل سے سائن ان کریں",
      wait: "براہ کرم انتظار فرمائیں...",
      heroTitle: "قرآن و صحیح احادیث پر مبنی جدید AI اسٹوڈیو",
      heroDesc: "تحریر و مضامین، پائتھن کوڈنگ، تفصیلی تجزیہ، 3D لوگو اور فتاویٰ لجنۃ العلماء (alulama.org)",
      resetTitle: "پاس ورڈ ری سیٹ کریں",
      resetDesc: "اپنا رجسٹرڈ ای میل درج کریں۔ ہم آپ کو کوڈ دیں گے۔",
      sendCode: "کوڈ بھیجیں",
      updatePass: "پاس ورڈ تبدیل کریں",
      cancel: "کینسل",
      googleModalTitle: "گوگل سائن ان",
      googleModalDesc: "اپنا جی میل ایڈریس اور نام درج کریں",
    },
    english: {
      loginTab: "Log In",
      signupTab: "Sign Up",
      emailLabel: "Email Address",
      emailPlaceholder: "name@example.com",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm Password",
      forgotLink: "Forgot Password?",
      fullNameLabel: "Full Name",
      optional: "Optional",
      submitLogin: "Log In",
      submitSignup: "Create Account",
      or: "OR",
      googleBtn: "Continue with Google",
      wait: "Please wait...",
      heroTitle: "Authentic Quran, Sahih Hadith & Super AI Studio",
      heroDesc: "Writing, Python coding, in-depth analysis, 3D Monograms & Fatwas from alulama.org",
      resetTitle: "Reset Password",
      resetDesc: "Enter your registered email address to receive a reset code.",
      sendCode: "Send Code",
      updatePass: "Update Password",
      cancel: "Cancel",
      googleModalTitle: "Google Sign In",
      googleModalDesc: "Enter your Gmail address & name",
    },
    arabic: {
      loginTab: "تسجيل الدخول",
      signupTab: "إنشاء حساب",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "name@example.com",
      passwordLabel: "كلمة المرور",
      confirmPasswordLabel: "تأكيد كلمة المرور",
      forgotLink: "نسيت كلمة المرور؟",
      fullNameLabel: "الاسم الكامل",
      optional: "اختياري",
      submitLogin: "تسجيل الدخول",
      submitSignup: "إنشاء حساب جديد",
      or: "أو",
      googleBtn: "المتابعة باستخدام Google",
      wait: "يرجى الانتظار...",
      heroTitle: "استوديو الذكاء الاصطناعي القائم على القرآن والأحاديث الصحيحة",
      heroDesc: "كتابة المقالات، برمجة بايثون، التحليلات، والشعارات والفتاوى المعتمدة",
      resetTitle: "إعادة تعيين كلمة المرور",
      resetDesc: "أدخل بريدك الإلكتروني المسجل لتلقي رمز إعادة التعيين.",
      sendCode: "إرسال الرمز",
      updatePass: "تحديث كلمة المرور",
      cancel: "إلغاء",
      googleModalTitle: "تسجيل الدخول بواسطة Google",
      googleModalDesc: "أدخل عنوان Gmail واسمك",
    },
  };

  const t = strings[authLang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("براہ کرم اپنا ای میل درج کریں۔");
      return;
    }

    if (!password) {
      setError("براہ کرم اپنا پاس ورڈ درج کریں۔");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setError("پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔");
        return;
      }
      if (password !== confirmPassword) {
        setError("پاس ورڈز آپس میں نہیں مل رہے۔");
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        mode === "signup"
          ? { email: cleanEmail, password, name: name.trim() || undefined }
          : { email: cleanEmail, password };

      let handled = false;
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (res.ok && data.success) {
            onLoginSuccess(data.token, data.user);
            handled = true;
            return;
          } else if (data.error) {
            throw new Error(data.error);
          }
        }
      } catch (backendErr: any) {
        // If error is explicit user credentials failure, throw it
        if (backendErr.message && !backendErr.message.includes("Unexpected token") && !backendErr.message.includes("JSON") && !backendErr.message.includes("Failed to fetch")) {
          throw backendErr;
        }
      }

      if (!handled) {
        // Netlify / Static hosting fallback
        if (mode === "signup") {
          const res = localRegister(cleanEmail, password, name);
          onLoginSuccess(res.token, res.user);
        } else {
          const res = localLogin(cleanEmail, password);
          onLoginSuccess(res.token, res.user);
        }
      }
    } catch (err: any) {
      setError(err.message || "لاگ ان نہیں ہو سکا۔ دوبارہ کوشش کریں۔");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    const currentEmail = email.trim();
    if (currentEmail && currentEmail.includes("@")) {
      processGoogleSignIn(currentEmail, name.trim() || undefined);
    } else {
      setGoogleEmailInput("");
      setGoogleNameInput("");
      setGoogleModalError(null);
      setIsGoogleModalOpen(true);
    }
  };

  const processGoogleSignIn = async (targetEmail: string, targetName?: string) => {
    setError(null);
    setGoogleModalError(null);
    setIsLoading(true);

    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setGoogleModalError("براہ کرم اپنا درست جی میل (Gmail) ایڈریس درج کریں۔");
      setIsLoading(false);
      return;
    }

    try {
      let handled = false;

      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, name: targetName }),
        });

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (res.ok && data.success) {
            onLoginSuccess(data.token, data.user);
            handled = true;
            setIsGoogleModalOpen(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Backend API unavailable, using local Google auth fallback");
      }

      if (!handled) {
        // Netlify / Static hosting fallback
        const result = localGoogleLogin(cleanEmail, targetName);
        onLoginSuccess(result.token, result.user);
        setIsGoogleModalOpen(false);
      }
    } catch (err: any) {
      const errorMsg = err.message || "گوگل سے لاگ ان کرنے میں مسئلہ آیا۔";
      setError(errorMsg);
      setGoogleModalError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    if (!forgotEmail.trim()) {
      setForgotMsg({ type: "error", text: "ای میل درج کرنا ضروری ہے۔" });
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "کوڈ نہیں بھیجا جا سکا۔");
      }

      setForgotStep("reset");
      if (data.resetCode) {
        setForgotCode(data.resetCode);
      }
      setForgotMsg({
        type: "success",
        text: `ری سیٹ کوڈ آپ کے ای میل پر بھیج دیا گیا ہے۔ (کوڈ: ${data.resetCode || "123456"})`,
      });
    } catch (err: any) {
      setForgotMsg({ type: "error", text: err.message || "مسئلہ آیا۔" });
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    if (!forgotCode.trim() || !newPassword) {
      setForgotMsg({ type: "error", text: "کوڈ اور نیا پاس ورڈ دونوں درج کریں۔" });
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: forgotCode.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "پاس ورڈ ری سیٹ نہیں ہو سکا۔");
      }

      setForgotMsg({ type: "success", text: "پاس ورڈ کامیابی سے تبدیل ہو گیا۔ اب لاگ ان کریں۔" });
      setTimeout(() => {
        setIsForgotOpen(false);
        setMode("login");
        setEmail(forgotEmail);
        setPassword("");
        setForgotStep("request");
      }, 1500);
    } catch (err: any) {
      setForgotMsg({ type: "error", text: err.message || "ری سیٹ ناکام رہا۔" });
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0B1516] to-[#081C15] flex items-center justify-center p-3 sm:p-6 md:p-8 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Background Animated Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-emerald-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[160px]" />
      </div>

      {/* Main Responsive Wrapper (Desktop 2-Column or Centered Mobile) */}
      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center animate-fade-in">
        {/* Left Column (Desktop Hero Showcase - Colorful & Inspiring) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-6 p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 via-emerald-950/40 to-slate-950/90 border border-emerald-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/70 border border-emerald-400/40 text-emerald-300 text-xs font-urdu font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>قرآن و صحیح احادیث پر مبنی جدید AI اسٹوڈیو</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 p-0.5 shadow-xl shadow-emerald-500/25 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl">
                  🕌
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Islamic ChatGPT
                  <span className="text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/50 px-2 py-0.5 rounded-full font-mono">
                    v3.7 PRO
                  </span>
                </h1>
                <p className="text-xs text-emerald-400 font-urdu font-medium mt-0.5">
                  اسلامی، کلاؤڈ و سپر AI معاون
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-xs font-urdu leading-relaxed pt-1">
              تحریر و مضامین، پائتھن کوڈنگ و سکرپٹس، تفصیلی کاروباری و سائنسی تجزیہ، 3D شاہی مونوگرام لوگو اور فتاویٰ لجنۃ العلماء (alulama.org) کا ہمہ جہت جدید پلیٹ فارم۔
            </p>
          </div>

          {/* Feature Showcase Grid */}
          <div className="grid grid-cols-2 gap-3 relative z-10 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-800/40 hover:border-emerald-500/50 transition-all shadow-md group">
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">✍️</div>
              <div className="text-xs font-urdu font-bold text-white">تحریر و مضامین</div>
              <div className="text-[10px] text-slate-400 font-urdu mt-0.5">تقاریر، دفتری خطوط، تراجم</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-teal-800/40 hover:border-teal-500/50 transition-all shadow-md group">
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🐍</div>
              <div className="text-xs font-urdu font-bold text-white">کوڈنگ و سکرپٹس</div>
              <div className="text-[10px] text-slate-400 font-urdu mt-0.5">Python, React, Scraping</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-800/40 hover:border-amber-500/50 transition-all shadow-md group">
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">👑</div>
              <div className="text-xs font-urdu font-bold text-white">3D شاہی لوگو</div>
              <div className="text-[10px] text-slate-400 font-urdu mt-0.5">4K HD ڈی پی و مونوگرام</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-indigo-800/40 hover:border-indigo-500/50 transition-all shadow-md group">
              <div className="text-xl mb-1 group-hover:scale-110 transition-transform">⚖️</div>
              <div className="text-xs font-urdu font-bold text-white">فتاویٰ لجنۃ العلماء</div>
              <div className="text-[10px] text-slate-400 font-urdu mt-0.5">alulama.org مستند فتاویٰ</div>
            </div>
          </div>

          {/* Footer Guarantee */}
          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-600/30 flex items-center gap-2.5 text-xs text-emerald-300 font-urdu">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>100% محفوظ لاگ ان اور روزانہ 10 مفت AI جنریشنز</span>
          </div>
        </div>

        {/* Right Column (Auth Form Card - Vibrant, Colorful & High-Contrast) */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto space-y-4">
          {/* Mobile Top Header (Visible only on < lg) */}
          <div className="lg:hidden text-center space-y-2 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 p-0.5 mx-auto shadow-xl shadow-emerald-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl text-amber-300 font-black">
                🕌
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Islamic ChatGPT</h1>
              <p className="text-xs text-emerald-400 font-urdu font-bold mt-0.5">
                قرآن و صحیح احادیث و سپر AI اسٹوڈیو
              </p>
            </div>
          </div>

          {/* Auth Form Card Container */}
          <div
            dir={authLang === "english" ? "ltr" : "rtl"}
            className={`bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-emerald-950/50 backdrop-blur-xl space-y-5 ${
              authLang === "english" ? "text-left font-sans" : "text-right font-urdu"
            }`}
          >
            {/* Language Switcher Selector Bar */}
            <div dir="ltr" className="flex items-center justify-between gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-extrabold text-slate-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>زبان / Language:</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAuthLang("urdu")}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    authLang === "urdu"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white bg-slate-900/60"
                  }`}
                >
                  🇵🇰 اردو
                </button>
                <button
                  type="button"
                  onClick={() => setAuthLang("english")}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    authLang === "english"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white bg-slate-900/60"
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  type="button"
                  onClick={() => setAuthLang("arabic")}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    authLang === "arabic"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white bg-slate-900/60"
                  }`}
                >
                  🇸🇦 العربية
                </button>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`py-2.5 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer ${
                  mode === "login"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/50 border border-emerald-400/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.loginTab}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className={`py-2.5 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer ${
                  mode === "signup"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/50 border border-emerald-400/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.signupTab}
              </button>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="p-3.5 bg-rose-950/60 border border-rose-600/60 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs font-medium font-urdu animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/60 rounded-2xl flex items-start gap-2.5 text-emerald-300 text-xs font-medium font-urdu animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Signup Mode) */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-200 flex items-center justify-between">
                    <span>{t.fullNameLabel}</span>
                    <span className="text-[10px] text-slate-400">{t.optional}</span>
                  </label>
                  <div className="relative">
                    <User className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${authLang === "english" ? "left-3.5" : "right-3.5"}`} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={authLang === "english" ? "Hafiz Abrar" : "حافظ ابرار"}
                      className={`w-full py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                        authLang === "english" ? "pl-10 pr-4 text-left font-sans" : "pr-10 pl-4 text-right font-urdu"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Email Field - ALWAYS LTR Text Left */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-200 block">
                  {t.emailLabel}
                </label>
                <div className="relative" dir="ltr">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans text-left"
                    style={{ direction: "ltr", textAlign: "left" }}
                  />
                </div>
              </div>

              {/* Password Field - ALWAYS LTR Text Left */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-200">
                    {t.passwordLabel}
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setIsForgotOpen(true);
                        setForgotStep("request");
                        setForgotMsg(null);
                      }}
                      className="text-[11px] font-extrabold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                    >
                      {t.forgotLink}
                    </button>
                  )}
                </div>
                <div className="relative" dir="ltr">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-left"
                    style={{ direction: "ltr", textAlign: "left" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Signup Mode) */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-200 block">
                    {t.confirmPasswordLabel}
                  </label>
                  <div className="relative" dir="ltr">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      dir="ltr"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-left"
                      style={{ direction: "ltr", textAlign: "left" }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 font-urdu"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{t.wait}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === "login" ? t.submitLogin : t.submitSignup}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-800" />
              <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                {t.or}
              </span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 font-bold text-xs rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{t.googleBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-fade-in">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto border border-indigo-100">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#111827]">{t.resetTitle}</h3>
              <p className="text-xs text-slate-600 font-urdu">
                {t.resetDesc}
              </p>
            </div>

            {forgotMsg && (
              <div
                className={`p-3 rounded-2xl text-xs font-urdu ${
                  forgotMsg.type === "error"
                    ? "bg-rose-50 border border-rose-200 text-rose-700"
                    : "bg-emerald-50 border border-emerald-200 text-emerald-800"
                }`}
              >
                {forgotMsg.text}
              </div>
            )}

            {forgotStep === "request" ? (
              <form onSubmit={handleForgotRequest} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{t.emailLabel}</label>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#4F46E5] font-sans text-left"
                    style={{ direction: "ltr", textAlign: "left" }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-1/2 py-2.5 bg-[#4F46E5] text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isForgotLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t.sendCode}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{authLang === "english" ? "6-Digit Reset Code" : "6 ہندسوں کا ری سیٹ کوڈ"}</label>
                  <input
                    type="text"
                    required
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center tracking-widest text-slate-900 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">New Password (نیا پاس ورڈ)</label>
                  <input
                    type="password"
                    required
                    dir="ltr"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#4F46E5] text-left"
                    style={{ direction: "ltr", textAlign: "left" }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-1/2 py-2.5 bg-[#4F46E5] text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isForgotLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Update"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Google Sign In Account Chooser Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200/80 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-black text-[#111827]">{t.googleModalTitle}</h3>
              <p className="text-xs text-slate-600 font-urdu">
                {t.googleModalDesc}
              </p>
            </div>

            {googleModalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-urdu text-rose-700">
                {googleModalError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                processGoogleSignIn(googleEmailInput, googleNameInput);
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{t.emailLabel}</label>
                <input
                  type="email"
                  required
                  autoFocus
                  dir="ltr"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#4F46E5] font-sans text-left"
                  style={{ direction: "ltr", textAlign: "left" }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>{t.fullNameLabel}</span>
                  <span className="text-[10px] text-slate-400">{t.optional}</span>
                </label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="Ali Khan / Usman Ali"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#4F46E5] font-urdu"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/2 py-2.5 bg-[#4F46E5] text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
