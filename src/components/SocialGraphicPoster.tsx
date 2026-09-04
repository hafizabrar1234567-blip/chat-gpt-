import React, { useRef, useState } from "react";
import {
  Download,
  Share2,
  Sparkles,
  Check,
  Palette,
  Image as ImageIcon,
  ShieldCheck,
  RefreshCw,
  Copy,
} from "lucide-react";
import { SocialPostResult } from "../types";
import { downloadElementAsImage } from "../utils/imageExporter";

interface SocialGraphicPosterProps {
  data: SocialPostResult;
  mediaBase64?: string | null;
  topic?: string;
  onShareClick?: () => void;
  onCopyText?: (text: string, key: string) => void;
}

type PosterTheme = "islamic_emerald" | "deep_gradient" | "royal_purple" | "minimal_clean";

export const SocialGraphicPoster: React.FC<SocialGraphicPosterProps> = ({
  data,
  mediaBase64,
  topic,
  onShareClick,
  onCopyText,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<PosterTheme>(() => {
    if (data.graphicCardTheme && ["islamic_emerald", "deep_gradient", "royal_purple", "minimal_clean"].includes(data.graphicCardTheme)) {
      return data.graphicCardTheme as PosterTheme;
    }
    const isIslamic =
      (topic && /جمعہ|جمعة|اسلام|حدیث|بخاری|مسلم|قرآن|jumma|islam/i.test(topic)) ||
      (data.title && /جمعہ|جمعة|اسلام|حدیث|بخاری|مسلم|قرآن|jumma|islam/i.test(data.title));
    return isIslamic ? "islamic_emerald" : "deep_gradient";
  });

  const posterHeadline =
    data.graphicCardText ||
    data.facebookTitle ||
    data.instagramTitle ||
    data.title ||
    topic ||
    "سوشل پوسٹ برائے اپلوڈ";

  const posterSubtitle =
    data.graphicCardSubtitle ||
    data.facebookCta ||
    data.instagramCta ||
    "«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ» (صحیح بخاری: 1)";

  const handleDownloadImage = async () => {
    if (!posterRef.current) return;
    setIsDownloading(true);
    try {
      const cleanFileName = (topic || data.title || "social_post")
        .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")
        .slice(0, 30);
      const filename = `${cleanFileName || "islami_chatgpt_post"}_${Date.now()}.png`;
 
      const success = await downloadElementAsImage(posterRef.current, filename, 2.5);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error generating image download:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const getThemeStyles = () => {
    switch (currentTheme) {
      case "islamic_emerald":
        return {
          container: "bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#022C22] text-white border-emerald-500/40",
          badge: "bg-amber-400/20 text-amber-300 border-amber-400/40",
          ornament: "text-amber-300/40",
          subtext: "text-emerald-100/90",
          brandColor: "text-amber-400",
        };
      case "royal_purple":
        return {
          container: "bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#312E81] text-white border-purple-500/40",
          badge: "bg-purple-300/20 text-purple-200 border-purple-300/40",
          ornament: "text-pink-300/30",
          subtext: "text-purple-100/90",
          brandColor: "text-pink-400",
        };
      case "minimal_clean":
        return {
          container: "bg-gradient-to-br from-[#F8FAFC] via-[#FFFFFF] to-[#F1F5F9] text-slate-900 border-slate-300",
          badge: "bg-slate-900 text-white border-slate-900",
          ornament: "text-slate-300",
          subtext: "text-slate-600",
          brandColor: "text-indigo-600",
        };
      case "deep_gradient":
      default:
        return {
          container: "bg-gradient-to-br from-[#0B0F19] via-[#1E1B4B] to-[#0F172A] text-white border-indigo-500/40",
          badge: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40",
          ornament: "text-indigo-400/30",
          subtext: "text-slate-300",
          brandColor: "text-indigo-400",
        };
    }
  };

  const themeStyle = getThemeStyles();

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
            🖼️ تیار شدہ تصویری پوسٹ (Ready to Upload)
          </span>
        </div>

        {/* THEME PICKER PILLS */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setCurrentTheme("islamic_emerald")}
            title="Emerald Theme"
            className={`w-5 h-5 rounded-lg transition-transform cursor-pointer ${
              currentTheme === "islamic_emerald" ? "ring-2 ring-emerald-500 scale-110" : "opacity-70 hover:opacity-100"
            } bg-emerald-600`}
          />
          <button
            type="button"
            onClick={() => setCurrentTheme("deep_gradient")}
            title="Dark Indigo Theme"
            className={`w-5 h-5 rounded-lg transition-transform cursor-pointer ${
              currentTheme === "deep_gradient" ? "ring-2 ring-indigo-500 scale-110" : "opacity-70 hover:opacity-100"
            } bg-indigo-900`}
          />
          <button
            type="button"
            onClick={() => setCurrentTheme("royal_purple")}
            title="Royal Purple Theme"
            className={`w-5 h-5 rounded-lg transition-transform cursor-pointer ${
              currentTheme === "royal_purple" ? "ring-2 ring-purple-500 scale-110" : "opacity-70 hover:opacity-100"
            } bg-purple-700`}
          />
          <button
            type="button"
            onClick={() => setCurrentTheme("minimal_clean")}
            title="Editorial Light Theme"
            className={`w-5 h-5 rounded-lg transition-transform cursor-pointer ${
              currentTheme === "minimal_clean" ? "ring-2 ring-slate-800 scale-110" : "opacity-70 hover:opacity-100"
            } bg-slate-200 border border-slate-400`}
          />
        </div>
      </div>

      {/* THE ACTUAL GRAPHIC POSTER CANVAS / CARD TO BE DOWNLOADED */}
      <div className="relative group">
        <div
          ref={posterRef}
          className={`w-full aspect-[4/5] sm:aspect-square rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border shadow-xl transition-all duration-300 ${themeStyle.container}`}
          style={{ minHeight: "360px" }}
        >
          {/* BACKGROUND IMAGE IF USER UPLOADED MEDIA */}
          {mediaBase64 && (
            <>
              <img
                src={mediaBase64}
                alt="Background media"
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div
                className={`absolute inset-0 z-1 ${
                  currentTheme === "minimal_clean"
                    ? "bg-white/85 backdrop-blur-[2px]"
                    : "bg-black/75 backdrop-blur-[2px]"
                }`}
              />
            </>
          )}

          {/* BACKGROUND ORNAMENTS / LIGHTS */}
          {!mediaBase64 && (
            <>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-3xl pointer-events-none" />
            </>
          )}

          {/* TOP BANNER ROW */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${themeStyle.badge}`}
              >
                {currentTheme === "islamic_emerald" ? "🕌 فرمانِ رسول ﷺ" : "✨ Islamic Insight"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-extrabold tracking-tight opacity-90">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ISLAMIC CHATGPT</span>
            </div>
          </div>

          {/* CENTER TEXT / HEADLINE / HADITH */}
          <div className="relative z-10 my-auto py-4 text-center space-y-3 px-2">
            <p className="font-urdu font-black text-xl sm:text-2xl md:text-3xl leading-snug sm:leading-normal drop-shadow-xs tracking-normal">
              {posterHeadline}
            </p>

            {posterSubtitle && (
              <p
                className={`font-urdu font-bold text-xs sm:text-sm max-w-md mx-auto leading-relaxed pt-1.5 border-t border-white/15 ${themeStyle.subtext}`}
              >
                {posterSubtitle}
              </p>
            )}
          </div>

          {/* BOTTOM BRANDING & FOOTER */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-3 text-[10px] font-bold">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مصدقہ حوالہ • مستند مواد</span>
            </div>
            <span className="opacity-80">Designed with Islamic ChatGPT</span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS (DOWNLOAD & SHARE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* DOWNLOAD BUTTON */}
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          {isDownloading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>تصویر تیار ہو رہی ہے...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-white stroke-[3]" />
              <span>تصویر ڈاؤن لوڈ ہو گئی ✓</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>📥 تصویر ڈاؤن لوڈ کریں (Save to Gallery)</span>
            </>
          )}
        </button>

        {/* SHARE BUTTON */}
        {onShareClick && (
          <button
            type="button"
            onClick={onShareClick}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>📤 سوشل میڈیا پر لگائیں (Multi-Share)</span>
          </button>
        )}
      </div>

      {/* HELPFUL NOTE */}
      <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-950">
        <span className="font-urdu">
          💡 آپ یہ تصویر ڈاؤن لوڈ کر کے فیس بک، انسٹاگرام یا واٹس ایپ پر تصویری پوسٹ کے طور پر لگا سکتے ہیں۔
        </span>
        {onCopyText && (
          <button
            type="button"
            onClick={() => onCopyText(`${posterHeadline}\n\n${posterSubtitle}`, "graphicPosterText")}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] border border-indigo-200 shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            <span>ٹیکسٹ کاپی</span>
          </button>
        )}
      </div>
    </div>
  );
};
