import React, { useState, useEffect } from "react";
import {
  X,
  Share2,
  Check,
  Send,
  Youtube,
  Facebook,
  Instagram,
  MessageCircle,
  Copy,
  ExternalLink,
  Sparkles,
  Link2,
  Sliders,
  CheckCircle2,
  Film,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  Video,
} from "lucide-react";
import { ConnectedSocialAccounts } from "../types";
import {
  getSavedConnectedAccounts,
  saveConnectedAccounts,
  shareNativelyWithFile,
  openWhatsAppShare,
  openFacebookShare,
  openYouTubeUpload,
  openInstagramShare,
} from "../utils/socialShare";

interface SocialPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  fullFormattedText: string;
  mediaBase64?: string | null;
  onCopySuccess?: (msg: string) => void;
}

export const SocialPublishModal: React.FC<SocialPublishModalProps> = ({
  isOpen,
  onClose,
  title = "Islamic ChatGPT Content",
  fullFormattedText,
  mediaBase64,
  onCopySuccess,
}) => {
  // All platforms are unselected by default so the user selects them explicitly
  const [selectedPlatforms, setSelectedPlatforms] = useState<{
    whatsapp: boolean;
    facebook: boolean;
    instagram: boolean;
    youtube: boolean;
    tiktok: boolean;
  }>({
    whatsapp: false,
    facebook: false,
    instagram: false,
    youtube: false,
    tiktok: false,
  });

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedSocialAccounts>(
    getSavedConnectedAccounts()
  );
  const [showAccountSettings, setShowAccountSettings] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  useEffect(() => {
    setConnectedAccounts(getSavedConnectedAccounts());
    setPublishSuccess(null);
    setValidationMsg(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const isVideo = mediaBase64?.startsWith("data:video/");
  const isImage = mediaBase64?.startsWith("data:image/");

  const togglePlatform = (key: "whatsapp" | "facebook" | "instagram" | "youtube" | "tiktok") => {
    setValidationMsg(null);
    setSelectedPlatforms((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectedCount = Object.values(selectedPlatforms).filter(Boolean).length;

  const handleSaveAccounts = () => {
    saveConnectedAccounts(connectedAccounts);
    setShowAccountSettings(false);
    if (onCopySuccess) {
      onCopySuccess("سوشل میڈیا اکاؤنٹس محفوظ ہو گئے! ✨");
    }
  };

  // Main 1-Click Multi-Publish
  const handlePublishAll = async () => {
    if (selectedCount === 0) {
      setValidationMsg("براہ کرم پوسٹ کرنے کے لیے کم از کم ایک پلیٹ فارم منتخب کریں۔");
      return;
    }

    setIsPublishing(true);
    setPublishSuccess(null);
    setValidationMsg(null);

    try {
      // 1. Copy text to clipboard so it's ready in all cases
      try {
        await navigator.clipboard.writeText(fullFormattedText);
      } catch (e) {
        console.warn(e);
      }

      // 2. Trigger Native Share with attached Media (video/image) + Formatted Text
      const result = await shareNativelyWithFile(mediaBase64, title, fullFormattedText);

      if (result.success) {
        setPublishSuccess("پوسٹ کاپی اور تیار ہو گئی ہے! اب منتخب ایپس پر شیئر کریں۔ 🎉");
        if (onCopySuccess) {
          onCopySuccess("پوسٹ شیئرنگ کے لیے تیار ہے! ✨");
        }
      } else {
        // Fallback: open the first selected platform directly
        if (selectedPlatforms.whatsapp) {
          openWhatsAppShare(fullFormattedText, connectedAccounts.whatsapp?.phone);
        } else if (selectedPlatforms.facebook) {
          openFacebookShare(fullFormattedText);
        } else if (selectedPlatforms.instagram) {
          openInstagramShare(fullFormattedText);
        } else if (selectedPlatforms.youtube) {
          openYouTubeUpload(fullFormattedText);
        }
        setPublishSuccess("پوسٹ کاپی ہو گئی اور ایپ اوپن کر دی گئی! 🎉");
      }
    } catch (err) {
      console.error("Publish error:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const platformsConfig = [
    {
      id: "whatsapp" as const,
      name: "WhatsApp",
      urduDesc: "اسٹیٹس و چیٹ",
      icon: MessageCircle,
      iconBg: "bg-[#25D366]",
      selectedBorder: "border-[#25D366]",
      selectedBg: "bg-emerald-50/90",
      textColor: "text-emerald-950",
      badgeBg: "bg-[#25D366]",
      ringColor: "ring-emerald-500/20",
    },
    {
      id: "facebook" as const,
      name: "Facebook",
      urduDesc: "پوسٹ و ریل",
      icon: Facebook,
      iconBg: "bg-[#1877F2]",
      selectedBorder: "border-[#1877F2]",
      selectedBg: "bg-blue-50/90",
      textColor: "text-blue-950",
      badgeBg: "bg-[#1877F2]",
      ringColor: "ring-blue-500/20",
    },
    {
      id: "instagram" as const,
      name: "Instagram",
      urduDesc: "ریل و فیڈ",
      icon: Instagram,
      iconBg: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
      selectedBorder: "border-[#DD2A7B]",
      selectedBg: "bg-pink-50/90",
      textColor: "text-pink-950",
      badgeBg: "bg-[#DD2A7B]",
      ringColor: "ring-pink-500/20",
    },
    {
      id: "youtube" as const,
      name: "YouTube",
      urduDesc: "شارٹس و ویڈیو",
      icon: Youtube,
      iconBg: "bg-[#FF0000]",
      selectedBorder: "border-[#FF0000]",
      selectedBg: "bg-rose-50/90",
      textColor: "text-rose-950",
      badgeBg: "bg-[#FF0000]",
      ringColor: "ring-red-500/20",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Modal Header */}
        <div className="bg-gradient-to-r from-[#111827] via-[#1E1B4B] to-[#31104B] px-4 py-3.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#EC4899] p-0.5 shadow-xs shrink-0">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Share2 className="w-4 h-4 text-indigo-300" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5 font-urdu">
                سوشل میڈیا پر شیئر کریں 🚀
              </h3>
              <p className="text-[10px] text-indigo-200">
                Select platforms & 1-Click Publish
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body with Compact Spacing */}
        <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3 flex-1">
          {/* Media Attachment Indicator (if image/video present) */}
          {mediaBase64 && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 overflow-hidden relative">
                {isVideo ? (
                  <video src={mediaBase64} className="w-full h-full object-cover" />
                ) : isImage ? (
                  <img src={mediaBase64} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                    {isVideo ? <Film className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                    {isVideo ? "Video" : "Photo"}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 truncate font-urdu mt-0.5">
                  {title}
                </p>
              </div>
            </div>
          )}

          {/* Platform Selector Checklist - All start UNSELECTED */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>پلیٹ فارم منتخب کریں</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  {selectedCount > 0 ? `${selectedCount} منتخب ہیں` : "کوئی منتخب نہیں"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowAccountSettings(!showAccountSettings)}
                className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Link2 className="w-3 h-3" />
                {showAccountSettings ? "چھپائیں" : "اکاؤنٹس لنک کریں ⚙️"}
              </button>
            </div>

            {/* 2x2 Clean Platform Cards Grid (No overlapping on any screen size) */}
            <div className="grid grid-cols-2 gap-2">
              {platformsConfig.map((plat) => {
                const Icon = plat.icon;
                const isSelected = selectedPlatforms[plat.id];

                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => togglePlatform(plat.id)}
                    className={`p-2.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer active:scale-98 ${
                      isSelected
                        ? `${plat.selectedBorder} ${plat.selectedBg} shadow-xs ring-2 ${plat.ringColor}`
                        : "bg-slate-50/70 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl ${plat.iconBg} text-white flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-black leading-tight truncate ${
                            isSelected ? plat.textColor : "text-slate-700"
                          }`}
                        >
                          {plat.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-urdu truncate leading-tight mt-0.5">
                          {plat.urduDesc}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ml-1.5 transition-all ${
                        isSelected
                          ? `${plat.badgeBg} text-white shadow-2xs`
                          : "border-2 border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Validation message if none selected */}
          {validationMsg && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl text-xs font-urdu font-bold flex items-center gap-1.5 animate-fade-in">
              <span>⚠️ {validationMsg}</span>
            </div>
          )}

          {/* Expandable Connected Accounts Settings */}
          {showAccountSettings && (
            <div className="bg-slate-50 border border-indigo-200 rounded-2xl p-3 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#111827] flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-indigo-600" /> اپنے اکاؤنٹس لنک کریں
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Local Sync
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* YouTube */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    YouTube Handle
                  </label>
                  <input
                    type="text"
                    placeholder="@MyChannel"
                    value={connectedAccounts.youtube?.handle || ""}
                    onChange={(e) =>
                      setConnectedAccounts((prev) => ({
                        ...prev,
                        youtube: { connected: true, handle: e.target.value },
                      }))
                    }
                    className="w-full bg-white px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    Facebook Page / Profile
                  </label>
                  <input
                    type="text"
                    placeholder="My Facebook Page"
                    value={connectedAccounts.facebook?.pageName || ""}
                    onChange={(e) =>
                      setConnectedAccounts((prev) => ({
                        ...prev,
                        facebook: { connected: true, pageName: e.target.value },
                      }))
                    }
                    className="w-full bg-white px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    placeholder="@my_insta_handle"
                    value={connectedAccounts.instagram?.username || ""}
                    onChange={(e) =>
                      setConnectedAccounts((prev) => ({
                        ...prev,
                        instagram: { connected: true, username: e.target.value },
                      }))
                    }
                    className="w-full bg-white px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    WhatsApp Number (اختیاری)
                  </label>
                  <input
                    type="text"
                    placeholder="923001234567"
                    value={connectedAccounts.whatsapp?.phone || ""}
                    onChange={(e) =>
                      setConnectedAccounts((prev) => ({
                        ...prev,
                        whatsapp: { connected: true, phone: e.target.value },
                      }))
                    }
                    className="w-full bg-white px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveAccounts}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer mt-1"
                >
                  اکاؤنٹس محفوظ کریں (Save)
                </button>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {publishSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-2xl text-xs font-urdu font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{publishSuccess}</span>
            </div>
          )}

          {/* Primary Action Button: 1-Click Multi-App Auto Publish */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={handlePublishAll}
              disabled={isPublishing}
              className={`w-full py-3 px-4 rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${
                selectedCount > 0
                  ? "bg-gradient-to-r from-emerald-600 via-[#4F46E5] to-[#7C3AED] hover:opacity-95 text-white shadow-indigo-600/25"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700 shadow-none"
              }`}
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="font-urdu text-sm">شیئر کیا جا رہا ہے...</span>
                </>
              ) : (
                <>
                  <Zap className={`w-4 h-4 ${selectedCount > 0 ? "fill-amber-300 text-amber-300" : "text-slate-500"}`} />
                  <span className="font-urdu text-sm">
                    {selectedCount > 0
                      ? `${selectedCount} منتخب پلیٹ فارمز پر ابھی پوسٹ کریں 🚀`
                      : "پلیٹ فارم منتخب کریں اور پوسٹ کریں 📤"}
                  </span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-500 font-urdu pt-1">
              تصویر/ویڈیو، ٹائٹل اور ہیش ٹیگز خود بخود ایپس پر شیئر ہوں گے۔
            </p>
          </div>

          {/* Individual 1-Tap Direct Launchers */}
          <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block px-0.5">
              براہِ راست سنگل پلیٹ فارم اوپن کریں (Direct Launchers)
            </span>

            <div className="grid grid-cols-2 gap-1.5">
              {/* WhatsApp Direct */}
              <button
                type="button"
                onClick={() => openWhatsAppShare(fullFormattedText, connectedAccounts.whatsapp?.phone)}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-extrabold truncate">WhatsApp</span>
                </div>
                <ExternalLink className="w-3 h-3 text-emerald-600 shrink-0" />
              </button>

              {/* Facebook Direct */}
              <button
                type="button"
                onClick={() => openFacebookShare(fullFormattedText)}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Facebook className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-xs font-extrabold truncate">Facebook</span>
                </div>
                <ExternalLink className="w-3 h-3 text-blue-600 shrink-0" />
              </button>

              {/* Instagram Direct */}
              <button
                type="button"
                onClick={() => openInstagramShare(fullFormattedText)}
                className="p-2 bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200/80 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Instagram className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  <span className="text-xs font-extrabold truncate">Instagram</span>
                </div>
                <ExternalLink className="w-3 h-3 text-pink-600 shrink-0" />
              </button>

              {/* YouTube Studio Direct */}
              <button
                type="button"
                onClick={() => openYouTubeUpload(fullFormattedText)}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200/80 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Youtube className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="text-xs font-extrabold truncate">YouTube</span>
                </div>
                <ExternalLink className="w-3 h-3 text-rose-600 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

