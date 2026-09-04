import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  Camera,
  Globe,
  Sliders,
  AlertCircle,
  Clock,
  Share2,
  ArrowLeft,
  Video,
  Hash,
  MessageCircle,
  FileText,
  Lightbulb,
  Instagram,
  Facebook,
  Youtube,
  Check,
  Download,
  Palette,
  Crown,
} from "lucide-react";
import {
  FeatureType,
  LanguageOption,
  StyleOption,
  GenerationData,
  GeneratePayload,
  SocialPostMode,
} from "../types";
import {
  TOOLS_CONFIG,
  LANGUAGES,
  STYLES,
  TOPIC_PROMPTS,
} from "../utils/constants";
import { ResultView } from "./ResultView";
import { SocialPostChoiceModal } from "./SocialPostChoiceModal";

interface CreateScreenProps {
  initialFeature?: FeatureType;
  initialTopic?: string;
  initialSocialPostMode?: SocialPostMode;
  isLimitReached: boolean;
  onGenerate: (payload: GeneratePayload) => void;
  isLoading: boolean;
  activeResult?: {
    featureType: FeatureType;
    topic: string;
    data: GenerationData;
  } | null;
  onCopyText?: (text: string, label?: string) => void;
  onRegenerate?: () => void;
  onNewGeneration?: () => void;
  copiedKey?: string | null;
  defaultLanguage?: LanguageOption;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({
  initialFeature,
  initialTopic = "",
  initialSocialPostMode = "visual_post",
  isLimitReached,
  onGenerate,
  isLoading,
  activeResult,
  onCopyText,
  onRegenerate,
  onNewGeneration,
  copiedKey,
  defaultLanguage = "urdu",
}) => {
  const [selectedFeature, setSelectedFeature] =
    useState<FeatureType | null>(initialFeature || null);

  const [socialPostMode, setSocialPostMode] =
    useState<SocialPostMode>(initialSocialPostMode);

  const [isSocialChoiceModalOpen, setIsSocialChoiceModalOpen] =
    useState<boolean>(false);

  const [topic, setTopic] = useState<string>(initialTopic);
  const [language, setLanguage] =
    useState<LanguageOption>(defaultLanguage);
  const [style, setStyle] =
    useState<StyleOption>("simple");

  useEffect(() => {
    if (defaultLanguage) {
      setLanguage(defaultLanguage);
    }
  }, [defaultLanguage]);

  const [duration, setDuration] =
    useState<string>("30s");

  /*
   * All platforms start unselected by default so the user explicitly chooses target platforms.
   */
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const [imageBase64, setImageBase64] =
    useState<string | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [validationError, setValidationError] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const cameraInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFeature) {
      setSelectedFeature(initialFeature);
    }
  }, [initialFeature]);

  useEffect(() => {
    if (initialTopic !== undefined) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  /*
   * PLATFORM SELECTOR
   *
   * Toggles selection state on/off.
   */
  const togglePlatform = (platformName: string) => {
    setSelectedPlatforms((previous) => {
      if (previous.includes(platformName)) {
        return previous.filter(
          (platform) => platform !== platformName
        );
      }

      return [...previous, platformName];
    });
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setValidationError(
        selectedFeature === "reel_script"
          ? "فائل کا سائز 25MB سے کم ہونا چاہیے۔"
          : "تصویر کا سائز 10MB سے کم ہونا چاہیے۔"
      );
      return;
    }

    if (selectedFeature === "reel_script") {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setValidationError(
          "براہ کرم ویڈیو یا تصویر منتخب کریں۔"
        );
        return;
      }
    } else {
      if (!file.type.startsWith("image/")) {
        setValidationError(
          "براہ کرم صرف تصویر منتخب کریں۔"
        );
        return;
      }
    }

    setValidationError(null);

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;

      setImageBase64(base64);
      setImagePreview(base64);
    };

    reader.onerror = () => {
      setValidationError(
        "تصویر پڑھنے میں مسئلہ آیا۔ دوبارہ کوشش کریں۔"
      );
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageBase64(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  /*
   * Automatically scroll to result after generation.
   */
  useEffect(() => {
    if (!activeResult) return;

    const timer = window.setTimeout(() => {
      const element = document.getElementById(
        "generated-result-section"
      );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 150);

    return () => window.clearTimeout(timer);
  }, [activeResult]);

  /*
   * MAIN GENERATION HANDLER
   */
  const handleGenerateSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!selectedFeature) {
      setValidationError(
        "Please select a content type first."
      );
      return;
    }

    /*
     * Photo/Video OR topic is enough.
     */
    if (!topic.trim() && !imageBase64) {
      setValidationError(
        selectedFeature === "reel_script"
          ? "پہلے ویڈیو upload کریں یا موضوع لکھیں۔"
          : "پہلے تصویر upload کریں یا موضوع لکھیں۔"
      );
      return;
    }

    if (isLoading) {
      return;
    }

    if (isLimitReached) {
      setValidationError(
        "آپ کی آج کی Free generations ختم ہو گئی ہیں۔"
      );
      return;
    }

    /*
     * Require at least one platform to be selected by the user.
     */
    if (selectedPlatforms.length === 0) {
      setValidationError("براہ کرم کم از کم ایک پلیٹ فارم (Instagram, TikTok وغیرہ) منتخب کریں۔");
      return;
    }

    setValidationError(null);

    const platformString = selectedPlatforms.join(", ");

    let finalTopic = topic.trim();

    /*
     * Image-only generation must work.
     */
    if (!finalTopic && imageBase64) {
      finalTopic =
        selectedFeature === "hashtags"
          ? "Analyze this photo and generate relevant hashtags"
          : "Create content based on this photo";
    }

    /*
     * Reel duration.
     */
    if (
      selectedFeature === "reel_script" &&
      duration
    ) {
      finalTopic += ` [Duration: ${duration}]`;
    }

    /*
     * Important:
     * Pass platform information to the backend.
     */
    if (
      selectedFeature === "hashtags" &&
      platformString
    ) {
      finalTopic += ` [Target Platform: ${platformString}]`;
    }

    onGenerate({
      featureType: selectedFeature,
      topic: finalTopic,
      imageBase64,
      language,
      style,
      platform: platformString,
      selectedPlatforms: selectedPlatforms,
      socialPostMode: selectedFeature === "social_post" ? socialPostMode : undefined,
      nonce: Date.now() + "_" + Math.random().toString(36).substring(2, 9),
    });
  };

  const featureOptions = [
    {
      id: "image_caption" as FeatureType,
      title: "Caption",
      description:
        "Turn your photo into the perfect caption.",
      icon: Camera,
      badge: "Photo AI",
    },
    {
      id: "reel_script" as FeatureType,
      title: "Reel Script",
      description:
        "Create engaging short-form video scripts.",
      icon: Video,
      badge: "Video",
    },
    {
      id: "hashtags" as FeatureType,
      title: "Hashtags",
      description:
        "Find hashtags that fit your content.",
      icon: Hash,
      badge: "SEO",
    },
    {
      id: "whatsapp_status" as FeatureType,
      title: "WhatsApp Status",
      description:
        "Create a status in seconds.",
      icon: MessageCircle,
      badge: "Status",
    },
    {
      id: "social_post" as FeatureType,
      title: "Social Post",
      description:
        "Create posts for your audience.",
      icon: FileText,
      badge: "Full Post",
    },
    {
      id: "logo_design" as FeatureType,
      title: "Logo & DP Maker",
      description:
        "Design pure luxury name logos & DP badges.",
      icon: Palette,
      badge: "Logo AI",
    },
    {
      id: "daily_ideas" as FeatureType,
      title: "Content Ideas",
      description:
        "Never run out of ideas.",
      icon: Lightbulb,
      badge: "Ideas",
    },
  ];

  /*
   * ============================================================
   * FEATURE SELECTOR
   * ============================================================
   */

  if (!selectedFeature) {
    return (
      <div className="pb-28 pt-3 px-4 max-w-xl mx-auto space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            Create with AI ✨
          </h2>

          <p className="text-sm text-[#6B7280] font-medium">
            What would you like to create today?
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setSelectedFeature("create_everything")
          }
          className="w-full text-left bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1F2937] text-white rounded-3xl p-6 border border-indigo-500/30 shadow-xl relative overflow-hidden group transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-200 text-slate-950 uppercase tracking-widest">
              Signature Feature
            </span>

            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>

          <h3 className="text-2xl font-black tracking-tight text-white">
            ✨ Create Everything
          </h3>

          <p className="text-xs text-indigo-200 font-medium mt-1">
            One idea. Every platform.
          </p>

          <p className="text-xs text-slate-400 font-urdu mt-3 leading-relaxed">
            ایک کلک میں Caption, Reel Script, Hashtags,
            Status اور Posts تیار۔
          </p>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {featureOptions.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  if (option.id === "social_post") {
                    setIsSocialChoiceModalOpen(true);
                  } else {
                    setSelectedFeature(option.id);
                  }
                }}
                className="text-left bg-white hover:bg-[#F5F3FF] active:bg-[#F5F3FF] border border-slate-200/80 hover:border-[#4F46E5]/40 rounded-3xl p-5 transition-all duration-180 ease-in-out hover:-translate-y-[2px] hover:shadow-md active:scale-95 group cursor-pointer shadow-xs flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100/80 text-[#4F46E5] flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-[#4F46E5]" />
                  </div>

                  <span className="text-[10px] font-extrabold text-[#4F46E5] bg-indigo-50 group-hover:bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {option.badge}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-[#111827] text-base">
                    {option.title}
                  </h4>

                  <p className="text-xs text-[#6B7280] font-medium mt-1 leading-snug">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* SOCIAL POST CHOICE MODAL */}
        <SocialPostChoiceModal
          isOpen={isSocialChoiceModalOpen}
          onClose={() => setIsSocialChoiceModalOpen(false)}
          onSelectMode={(mode) => {
            setSocialPostMode(mode);
            setSelectedFeature("social_post");
          }}
        />
      </div>
    );
  }

  /*
   * ============================================================
   * DEDICATED FEATURE SCREEN
   * ============================================================
   */

  const currentToolConfig =
    TOOLS_CONFIG.find(
      (tool) => tool.id === selectedFeature
    ) || TOOLS_CONFIG[0];

  const isHashtagGenerator =
    selectedFeature === "hashtags";

  const canGenerate =
    Boolean(topic.trim()) ||
    Boolean(imageBase64);

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-5 animate-fade-in">
      {/* TOOL SWITCHER */}

      <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-xs overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {TOOLS_CONFIG.map((tool) => {
            const isSelected =
              selectedFeature === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() =>
                  setSelectedFeature(tool.id)
                }
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/25"
                    : "bg-slate-100 hover:bg-[#F5F3FF] text-[#111827] border border-transparent hover:border-[#4F46E5]/40"
                }`}
              >
                <span>{tool.titleUrdu}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN FORM CARD */}

      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
        {/* HEADER */}

        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => {
                setSelectedFeature(null);
                setValidationError(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-[#1F2937] active:scale-95 transition-all shadow-xs flex items-center gap-1.5 shrink-0 border border-slate-200 focus:outline-none"
            >
              <ArrowLeft className="w-4 h-4 text-[#1F2937]" />
              <span className="text-xs font-bold">
                Back
              </span>
            </button>

            <span className="text-xs font-extrabold text-[#4F46E5] uppercase tracking-wider">
              {currentToolConfig.titleEng}
            </span>
          </div>

          <h2 className="text-xl font-black text-[#111827] tracking-tight">
            {currentToolConfig.titleUrdu}
          </h2>

          <p className="text-xs text-[#6B7280] font-urdu leading-relaxed">
            {currentToolConfig.descriptionUrdu}
          </p>
        </div>

        <form
          onSubmit={handleGenerateSubmit}
          className="space-y-5"
        >
          {/* =====================================================
              SOCIAL POST FORMAT SELECTOR (POST VS TEXT)
          ====================================================== */}
          {selectedFeature === "social_post" && (
            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/60 p-4.5 rounded-3xl border-2 border-indigo-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    پوسٹ کی قسم کا انتخاب کریں (Choose Format)
                  </span>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {socialPostMode === "visual_post" ? "🖼️ تصویری پوسٹ" : "📝 صرف تحریر"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* OPTION 1: VISUAL POST FOR UPLOAD */}
                <button
                  type="button"
                  onClick={() => setSocialPostMode("visual_post")}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-180 flex items-start gap-3 cursor-pointer ${
                    socialPostMode === "visual_post"
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.01]"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      socialPostMode === "visual_post"
                        ? "bg-white/20 text-white"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-black ${
                          socialPostMode === "visual_post"
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        🖼️ پوسٹ برائے اپلوڈ
                      </h4>
                      {socialPostMode === "visual_post" && (
                        <Check className="w-4 h-4 text-amber-300 stroke-[3]" />
                      )}
                    </div>
                    <p
                      className={`text-[10px] font-urdu leading-tight mt-0.5 ${
                        socialPostMode === "visual_post"
                          ? "text-indigo-100"
                          : "text-slate-500"
                      }`}
                    >
                      ڈاؤن لوڈ ایبل تصویری پوسٹ کارڈ + کیپشن
                    </p>
                  </div>
                </button>

                {/* OPTION 2: TEXT ONLY */}
                <button
                  type="button"
                  onClick={() => setSocialPostMode("text_only")}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-180 flex items-start gap-3 cursor-pointer ${
                    socialPostMode === "text_only"
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.01]"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      socialPostMode === "text_only"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-black ${
                          socialPostMode === "text_only"
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        📝 صرف تحریر / ٹیکسٹ
                      </h4>
                      {socialPostMode === "text_only" && (
                        <Check className="w-4 h-4 text-amber-300 stroke-[3]" />
                      )}
                    </div>
                    <p
                      className={`text-[10px] font-urdu leading-tight mt-0.5 ${
                        socialPostMode === "text_only"
                          ? "text-indigo-100"
                          : "text-slate-500"
                      }`}
                    >
                      مفصل تحریر، پیراگراف و ہیش ٹیگز
                    </p>
                  </div>
                </button>
              </div>

              <div
                className={`p-2.5 rounded-xl text-[11px] font-urdu leading-relaxed transition-colors ${
                  socialPostMode === "visual_post"
                    ? "bg-indigo-100/70 text-indigo-950 font-medium"
                    : "bg-slate-100 text-slate-700 font-medium"
                }`}
              >
                {socialPostMode === "visual_post" ? (
                  <span>
                    ✨ <strong>پوسٹ برائے اپلوڈ:</strong> AI سوشل میڈیا کے لیے ڈاؤن لوڈ کے قابل ایک مکمل تصویری پوسٹ کارڈ اور ساتھ تمام کیپشن تیار کرے گا جسے آپ براہِ راست اپلوڈ کر سکتے ہیں۔
                  </span>
                ) : (
                  <span>
                    📝 <strong>صرف تحریر:</strong> AI آپ کے منتخب کردہ سوشل پلیٹ فارمز کے لیے جامع تحریر، پیراگراف، ہکس، اختتامیہ اور وائرل ہیش ٹیگز تیار کرے گا۔
                  </span>
                )}
              </div>
            </div>
          )}

          {/* =====================================================
              PHOTO UPLOAD
          ====================================================== */}

          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              {selectedFeature === "reel_script" ? (
                <>
                  <Video className="w-4 h-4 text-[#4F46E5]" />
                  <span>🎥 Add Video (Optional)</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-[#4F46E5]" />
                  <span>📷 Add Photo (Optional)</span>
                </>
              )}
            </label>

            {imagePreview ? (
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-50">
                {imagePreview.startsWith("data:video/") ? (
                  <video
                    src={imagePreview}
                    controls
                    className="w-full h-52 object-cover rounded-3xl"
                  />
                ) : (
                  <img
                    src={imagePreview}
                    alt="Selected preview"
                    className="w-full h-52 object-cover rounded-3xl"
                  />
                )}

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-slate-900/85 text-white p-2 rounded-full hover:bg-rose-600 transition-colors shadow-md cursor-pointer z-10"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-black/65 text-white text-[10px] font-bold z-10">
                  {selectedFeature === "reel_script" || imagePreview.startsWith("data:video/")
                    ? "Video ready ✓"
                    : "Photo ready ✓"}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl border-2 border-dashed border-slate-200 hover:border-[#4F46E5] bg-slate-50/60 transition-all text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto">
                  {selectedFeature === "reel_script" ? (
                    <Video className="w-6 h-6 text-[#4F46E5]" />
                  ) : (
                    <Camera className="w-6 h-6 text-[#4F46E5]" />
                  )}
                </div>

                <div>
                  <p className="text-xs font-extrabold text-[#111827]">
                    {selectedFeature === "reel_script"
                      ? "Add your video"
                      : "Add your photo"}
                  </p>

                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    {selectedFeature === "reel_script"
                      ? "Upload from Gallery or Record a Video"
                      : "Upload from Gallery or Take a Photo"}
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-[#111827] text-xs font-bold rounded-2xl border border-slate-200 shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#4F46E5]" />
                    Gallery
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      cameraInputRef.current?.click()
                    }
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-[#111827] text-xs font-bold rounded-2xl border border-slate-200 shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    {selectedFeature === "reel_script" ? (
                      <>
                        <Video className="w-3.5 h-3.5 text-[#7C3AED]" />
                        Video
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5 text-[#7C3AED]" />
                        Camera
                      </>
                    )}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={
                    selectedFeature === "reel_script"
                      ? "video/*,image/*"
                      : "image/*"
                  }
                  onChange={handleImageChange}
                  className="hidden"
                />

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept={
                    selectedFeature === "reel_script"
                      ? "video/*"
                      : "image/*"
                  }
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* =====================================================
              DESCRIPTION
          ====================================================== */}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Describe your post
              </label>

              {(topic || imagePreview) && (
                <button
                  type="button"
                  onClick={() => {
                    setTopic("");
                    removeImage();
                    setValidationError(null);
                  }}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Clear / صاف کریں
                </button>
              )}
            </div>

            <textarea
              value={topic}
              onChange={(e) =>
                setTopic(e.target.value)
              }
              placeholder={
                selectedFeature === "logo_design"
                  ? "اپنا نام، برانڈ یا ادارہ کا نام لکھیں جس کا لوگو بنانا ہے (مثلاً: Abrar / ابرار یا کوئی بھی نام)۔ لوگو پر صرف نام آئے گا، باقی معنی و حوالہ نیچے دیے جائیں گے۔"
                  : "اپنی پوسٹ کے بارے میں لکھیں، یا خالی چھوڑ دیں۔ AI تصویر دیکھ کر خود سمجھ لے گا۔"
              }
              rows={selectedFeature === "logo_design" ? 2 : 3}
              className="w-full bg-slate-50 border border-slate-200/90 focus:border-[#4F46E5] rounded-2xl p-4 text-sm text-[#111827] placeholder-slate-400 font-urdu focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 transition-all"
            />

            {/* SUGGESTED PROMPTS */}

            <div className="pt-1">
              <span className="text-[11px] text-[#6B7280] font-semibold block mb-2">
                {selectedFeature === "logo_design" ? "✨ نمونہ نام / لوگو آئیڈیاز:" : "🔥 Suggested Prompts:"}
              </span>

              <div className="flex flex-wrap gap-2">
                {selectedFeature === "logo_design" ? (
                  [
                    "Abrar (ابرار)",
                    "Hafiz Abrar (حافظ ابرار)",
                    "Muhammad Ali (محمد علی)",
                    "Zeeshan Ahmed (ذیشان احمد)",
                    "Islamic Center Monogram",
                    "Abrar Design Studio",
                  ].map((nameSample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(nameSample)}
                      className="text-[12px] font-semibold font-urdu px-3 py-1.5 rounded-full border transition-all shadow-2xs cursor-pointer bg-white hover:bg-amber-50 text-slate-900 border-slate-200 hover:border-amber-400 active:scale-95 flex items-center gap-1"
                    >
                      <span>👑</span>
                      <span>{nameSample}</span>
                    </button>
                  ))
                ) : (
                  TOPIC_PROMPTS.map(
                    (prompt, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setTopic(prompt.urdu)
                        }
                        className="text-[12px] font-semibold font-urdu px-3 py-1.5 rounded-full border transition-all shadow-2xs cursor-pointer bg-white hover:bg-[#F5F3FF] text-[#111827] border-slate-200 hover:border-[#4F46E5]/40 active:scale-95"
                      >
                        {prompt.urdu}
                      </button>
                    )
                  )
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              REEL DURATION
          ====================================================== */}

          {selectedFeature === "reel_script" && (
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-600" />
                Script Duration
              </label>

              <div className="grid grid-cols-3 gap-2">
                {["15s", "30s", "60s"].map(
                  (durationOption) => (
                    <button
                      key={durationOption}
                      type="button"
                      onClick={() =>
                        setDuration(durationOption)
                      }
                      className={`py-2.5 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ${
                        duration === durationOption
                          ? "bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/40 shadow-xs"
                          : "bg-slate-50 text-[#111827] border-slate-200"
                      }`}
                    >
                      {durationOption}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* =====================================================
              PLATFORM SELECTOR
          ====================================================== */}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-[#4F46E5]" />
                <span>Target Platforms / پلیٹ فارم</span>
              </label>

              <span className="text-[10px] text-[#6B7280]">
                Select platforms to include
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {[
                {
                  name: "Instagram",
                  icon: Instagram,
                  iconColor: "text-[#E1306C]",
                  active:
                    "bg-[#E1306C] text-white border-2 border-[#E1306C] shadow-md font-black ring-2 ring-pink-500/40",
                  inactive:
                    "bg-slate-50 text-slate-700 border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300 font-bold",
                },
                {
                  name: "TikTok",
                  icon: Video,
                  iconColor: "text-slate-900",
                  active:
                    "bg-[#000000] text-white border-2 border-[#000000] shadow-md font-black ring-2 ring-slate-900/40",
                  inactive:
                    "bg-slate-50 text-slate-700 border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300 font-bold",
                },
                {
                  name: "Facebook",
                  icon: Facebook,
                  iconColor: "text-[#1877F2]",
                  active:
                    "bg-[#1877F2] text-white border-2 border-[#1877F2] shadow-md font-black ring-2 ring-blue-500/40",
                  inactive:
                    "bg-slate-50 text-slate-700 border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300 font-bold",
                },
                {
                  name: "WhatsApp",
                  icon: MessageCircle,
                  iconColor: "text-[#25D366]",
                  active:
                    "bg-[#25D366] text-white border-2 border-[#25D366] shadow-md font-black ring-2 ring-emerald-500/40",
                  inactive:
                    "bg-slate-50 text-slate-700 border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300 font-bold",
                },
                {
                  name: "YouTube",
                  icon: Youtube,
                  iconColor: "text-[#FF0000]",
                  active:
                    "bg-[#FF0000] text-white border-2 border-[#FF0000] shadow-md font-black ring-2 ring-red-500/40",
                  inactive:
                    "bg-slate-50 text-slate-700 border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300 font-bold",
                },
              ].map((platform) => {
                const PlatformIcon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.name);

                return (
                  <button
                    key={platform.name}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => togglePlatform(platform.name)}
                    className={`w-full min-h-[44px] py-2 px-2.5 rounded-2xl text-xs border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] overflow-hidden ${
                      isSelected ? platform.active : platform.inactive
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-4 h-4 shrink-0 stroke-[3]" />
                    ) : (
                      <PlatformIcon className={`w-4 h-4 shrink-0 ${platform.iconColor}`} />
                    )}

                    <span className="font-sans font-extrabold tracking-tight whitespace-nowrap text-xs">
                      {platform.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =====================================================
              LANGUAGE
          ====================================================== */}

          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#4F46E5]" />
              Language / زبان
            </label>

            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.id;

                return (
                  <button
                    key={lang.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setLanguage(lang.id)}
                    className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold border transition-all text-center cursor-pointer ${
                      isSelected
                        ? "bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/40 shadow-xs"
                        : "bg-slate-50 text-[#111827] border-slate-200 hover:bg-[#F5F3FF]"
                    }`}
                  >
                    {lang.labelEng}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =====================================================
              VIBE / STYLE
          ====================================================== */}

          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#7C3AED]" />
              Choose your vibe / انداز
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STYLES.map((styleOption) => {
                const isSelected = style === styleOption.id;

                return (
                  <button
                    key={styleOption.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setStyle(styleOption.id)}
                    className={`min-h-[42px] py-2 px-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/40 shadow-xs"
                        : "bg-slate-50 text-[#111827] border-slate-200 hover:bg-[#F5F3FF]"
                    }`}
                  >
                    <span className="text-sm shrink-0">{styleOption.icon}</span>

                    <span className="whitespace-nowrap font-medium text-xs">
                      {styleOption.labelEng}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =====================================================
              VALIDATION ERROR
          ====================================================== */}

          {validationError && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-2 text-amber-900 text-xs font-bold animate-shake">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* =====================================================
              FREE LIMIT
          ====================================================== */}

          {isLimitReached && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                آپ کی آج کی Free generations ختم ہو گئی ہیں۔
              </span>
            </div>
          )}

          {/* =====================================================
              HASHTAG GENERATOR BUTTON (ALWAYS VIBRANT GREEN)
          ====================================================== */}

          {isHashtagGenerator && (
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  isLimitReached
                }
                style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
                className="w-full py-4 px-6 rounded-2xl font-black text-base text-white shadow-lg shadow-green-600/30 flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] cursor-pointer hover:bg-[#15803d]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating hashtags...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 fill-white text-white" />
                    <span>✨ Generate Hashtags</span>
                  </>
                )}
              </button>

              {!canGenerate && (
                <p className="text-xs text-center text-slate-500 font-urdu pt-1">
                  پہلے تصویر upload کریں یا موضوع لکھیں۔
                </p>
              )}
            </div>
          )}

          {/* =====================================================
              OTHER GENERATORS' BUTTON (ALWAYS VIBRANT GREEN)
          ====================================================== */}

          {!isHashtagGenerator && (
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  isLimitReached
                }
                style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
                className="w-full py-4 px-6 rounded-2xl font-black text-base text-white shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] cursor-pointer hover:bg-[#15803d]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                    <span>
                      Generating content... ✨
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 fill-white" />

                    <span>
                      Generate{" "}
                      {currentToolConfig.titleEng} ✨
                    </span>
                  </>
                )}
              </button>

              {!canGenerate && (
                <p className="text-xs text-center text-slate-500 font-urdu pt-1">
                  {selectedFeature === "reel_script"
                    ? "پہلے ویڈیو upload کریں یا موضوع لکھیں۔"
                    : "پہلے تصویر upload کریں یا موضوع لکھیں۔"}
                </p>
              )}
            </div>
          )}
        </form>

        {/* =====================================================
            GENERATED RESULTS
        ====================================================== */}

        {activeResult &&
          onCopyText &&
          onRegenerate &&
          onNewGeneration && (
            <div
              id="generated-result-section"
              className="pt-6 border-t border-slate-200/80 animate-fade-in scroll-mt-6"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-black text-[#4F46E5] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#4F46E5]" />
                  Generated Results ✨
                </span>
              </div>

              <ResultView
                featureType={
                  activeResult.featureType
                }
                topic={activeResult.topic}
                data={activeResult.data}
                mediaBase64={imageBase64 || imagePreview}
                onCopyText={onCopyText}
                onRegenerate={onRegenerate}
                onNewGeneration={() => {
                  setTopic("");
                  removeImage();
                  onNewGeneration();
                }}
                copiedKey={copiedKey}
              />
            </div>
          )}
      </div>
    </div>
  );
};
