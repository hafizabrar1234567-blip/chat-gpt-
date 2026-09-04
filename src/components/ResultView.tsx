import React, { useState } from "react";
import {
  Copy,
  Check,
  RotateCcw,
  PlusCircle,
  Sparkles,
  MessageCircle,
  Video,
  Instagram,
  Facebook,
  Hash,
  Type as FontIcon,
  ArrowLeft,
  Share2,
  Image as ImageIcon,
  Youtube,
  Send,
  ExternalLink,
  Zap,
  CheckCircle2,
  Settings,
  FileText,
  Download,
  Scale,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { FeatureType, GenerationData } from "../types";
import { SocialPublishModal } from "./SocialPublishModal";
import { SocialGraphicPoster } from "./SocialGraphicPoster";
import { LogoDesignStudio } from "./LogoDesignStudio";
import {
  openWhatsAppShare,
  openFacebookShare,
  openInstagramShare,
  openYouTubeUpload,
  shareNativelyWithFile,
} from "../utils/socialShare";

interface ResultViewProps {
  featureType: FeatureType;
  topic: string;
  data: GenerationData;
  mediaBase64?: string | null;
  onCopyText: (text: string, label?: string) => void;
  onRegenerate: () => void;
  onNewGeneration: () => void;
  copiedKey?: string | null;
}

function extractSafeString(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val.trim();
  if (Array.isArray(val)) {
    return val.map(extractSafeString).filter(Boolean).join(" ");
  }
  if (typeof val === "object") {
    return (
      extractSafeString(val.text) ||
      extractSafeString(val.content) ||
      extractSafeString(val.script) ||
      extractSafeString(val.hook) ||
      extractSafeString(val.title) ||
      extractSafeString(val.caption) ||
      extractSafeString(val.urdu) ||
      extractSafeString(val.roman) ||
      extractSafeString(val.english) ||
      extractSafeString(val.value) ||
      extractSafeString(val.statusText) ||
      Object.values(val).map(extractSafeString).filter(Boolean).join("\n") ||
      ""
    );
  }
  return String(val).trim();
}

function extractAllHashtags(dataObj: any, selectedPlatforms?: string[]): string[] {
  if (!dataObj) return [];
  const list: string[] = [];
  const addTags = (item: any) => {
    if (!item) return;
    if (Array.isArray(item)) {
      item.forEach((t) => {
        if (typeof t === "string" && t.trim()) {
          t.trim().split(/\s+/).forEach((sub) => {
            const clean = sub.trim();
            if (clean) list.push(clean.startsWith("#") ? clean : `#${clean}`);
          });
        }
      });
    } else if (typeof item === "string") {
      item.split(/[\s,]+/).forEach((sub) => {
        const clean = sub.trim();
        if (clean) list.push(clean.startsWith("#") ? clean : `#${clean}`);
      });
    }
  };

  const isPlatformSelected = (platName: string) => {
    if (!selectedPlatforms || !Array.isArray(selectedPlatforms) || selectedPlatforms.length === 0) {
      return true;
    }
    return selectedPlatforms.includes(platName);
  };

  addTags(dataObj.allHashtags);
  addTags(dataObj.hashtags);
  addTags(dataObj.suggestedHashtags);
  addTags(dataObj.mainHashtags);
  addTags(dataObj.viralHashtags);
  addTags(dataObj.nicheHashtags);

  if (isPlatformSelected("Instagram")) {
    addTags(dataObj.instagramHashtags);
  }
  if (isPlatformSelected("TikTok")) {
    addTags(dataObj.tiktokHashtags);
  }
  if (isPlatformSelected("Facebook")) {
    addTags(dataObj.facebookHashtags);
  }
  if (isPlatformSelected("WhatsApp")) {
    addTags(dataObj.whatsappHashtags);
  }
  if (isPlatformSelected("YouTube")) {
    addTags(dataObj.youtubeTags);
  }

  // If no structured tags, look for #tags in strings
  if (list.length === 0) {
    try {
      const fullStr = JSON.stringify(dataObj);
      const matches = fullStr.match(/#[a-zA-Z0-9_\u0600-\u06FF]+/g);
      if (matches) {
        matches.forEach((m) => list.push(m));
      }
    } catch (e) {
      // ignore
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return list.filter((tag) => {
    const clean = tag.trim();
    if (!clean || clean === "#") return false;
    const lower = clean.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}

function buildFullCombinedText(data: any): string {
  const parts: string[] = [];
  const selectedPlatforms: string[] | undefined = data?.selectedPlatforms;

  const isPlatformSelected = (platName: string) => {
    if (!selectedPlatforms || !Array.isArray(selectedPlatforms) || selectedPlatforms.length === 0) {
      return true;
    }
    return selectedPlatforms.includes(platName);
  };

  if (isPlatformSelected("Instagram") && (data.instagramCaption || data.caption)) {
    const igCap = extractSafeString(data.instagramCaption || data.caption);
    if (igCap) {
      let igText = `--- INSTAGRAM CAPTION ---\n${igCap}`;
      const tags = data.instagramHashtags || data.hashtags;
      if (tags) {
        const tagStr = Array.isArray(tags) ? tags.join(" ") : extractSafeString(tags);
        if (tagStr) igText += `\n\nHashtags:\n${tagStr}`;
      }
      if (data.instagramCta) {
        igText += `\n\nCTA: ${extractSafeString(data.instagramCta)}`;
      }
      parts.push(igText);
    }
  }

  if (isPlatformSelected("TikTok") && (data.tiktokCaption || data.tiktokScript || data.reelScript)) {
    let ttText = `--- TIKTOK / REEL CONTENT ---`;
    const hook = extractSafeString(data.tiktokHook || data.reelHook || data.hook);
    const script = extractSafeString(data.tiktokScript || data.reelScript || data.script);
    const caption = extractSafeString(data.tiktokCaption || data.caption);
    if (hook) ttText += `\nHook: ${hook}`;
    if (script) ttText += `\nScript:\n${script}`;
    if (caption) ttText += `\nCaption: ${caption}`;
    const tags = data.tiktokHashtags || data.hashtags;
    if (tags && Array.isArray(tags) && tags.length > 0) {
      ttText += `\nHashtags: ${tags.join(" ")}`;
    }
    parts.push(ttText);
  }

  if (isPlatformSelected("Facebook") && (data.facebookPost || data.caption)) {
    const fbPost = extractSafeString(data.facebookPost || data.caption);
    if (fbPost) {
      let fbText = `--- FACEBOOK POST ---\n${fbPost}`;
      const tags = data.facebookHashtags || data.hashtags;
      if (tags && Array.isArray(tags) && tags.length > 0) {
        fbText += `\n\nHashtags: ${tags.join(" ")}`;
      }
      if (data.facebookCta) {
        fbText += `\nCTA: ${extractSafeString(data.facebookCta)}`;
      }
      parts.push(fbText);
    }
  }

  if (isPlatformSelected("WhatsApp") && (data.whatsappStatus || data.caption)) {
    const wa = extractSafeString(data.whatsappStatus || data.caption);
    if (wa) parts.push(`--- WHATSAPP STATUS ---\n${wa}`);
  }

  if (isPlatformSelected("YouTube") && (data.youtubeTitle || data.title)) {
    const ytTitle = extractSafeString(data.youtubeTitle || data.title);
    if (ytTitle) {
      let ytText = `--- YOUTUBE SHORTS / VIDEO ---\nTitle: ${ytTitle}`;
      const ytDesc = extractSafeString(data.youtubeDescription || data.caption);
      if (ytDesc) ytText += `\nDescription:\n${ytDesc}`;
      if (Array.isArray(data.youtubeTags) && data.youtubeTags.length > 0) {
        ytText += `\nTags: ${data.youtubeTags.join(", ")}`;
      }
      parts.push(ytText);
    }
  }

  if (data.imagePrompt) {
    const prompt = extractSafeString(data.imagePrompt);
    if (prompt) parts.push(`--- AI IMAGE PROMPT ---\n${prompt}`);
  }

  if (data.hook || data.script || data.endingLine || data.title) {
    const t = extractSafeString(data.title);
    const h = extractSafeString(data.hook);
    const s = extractSafeString(data.script);
    const e = extractSafeString(data.endingLine);
    const c = extractSafeString(data.caption);
    if (t) parts.push(`--- REEL TITLE ---\n${t}`);
    if (h) parts.push(`--- HOOK (FIRST 3 SEC) ---\n${h}`);
    if (s) parts.push(`--- REEL SCRIPT ---\n${s}`);
    if (e) parts.push(`--- CALL TO ACTION ---\n${e}`);
    if (c) parts.push(`--- CAPTION ---\n${c}`);
    if (Array.isArray(data.hashtags) && data.hashtags.length > 0) {
      parts.push(`--- HASHTAGS ---\n${data.hashtags.join(" ")}`);
    }
  }

  if (data.captionUrduScript || data.captionRomanUrdu || data.captionEnglish || data.short || data.stylish || data.emotional || data.motivational || data.islamic) {
    if (data.title) parts.push(`--- TITLE ---\n${extractSafeString(data.title)}`);
    if (data.captionUrduScript) parts.push(`--- اردو کیپشن ---\n${extractSafeString(data.captionUrduScript)}`);
    if (data.captionRomanUrdu) parts.push(`--- ROMAN URDU CAPTION ---\n${extractSafeString(data.captionRomanUrdu)}`);
    if (data.captionEnglish) parts.push(`--- ENGLISH CAPTION ---\n${extractSafeString(data.captionEnglish)}`);
    if (data.short) parts.push(`--- SHORT CAPTION ---\n${extractSafeString(data.short)}`);
    if (data.stylish) parts.push(`--- STYLISH CAPTION ---\n${extractSafeString(data.stylish)}`);
    if (data.emotional) parts.push(`--- EMOTIONAL CAPTION ---\n${extractSafeString(data.emotional)}`);
    if (data.motivational) parts.push(`--- MOTIVATIONAL CAPTION ---\n${extractSafeString(data.motivational)}`);
    if (data.islamic) parts.push(`--- ISLAMIC CAPTION ---\n${extractSafeString(data.islamic)}`);
    if (data.funny) parts.push(`--- FUNNY CAPTION ---\n${extractSafeString(data.funny)}`);
    if (data.simple) parts.push(`--- SIMPLE CAPTION ---\n${extractSafeString(data.simple)}`);
    if (data.suggestedHashtags) {
      const tagStr = Array.isArray(data.suggestedHashtags) ? data.suggestedHashtags.join(" ") : String(data.suggestedHashtags).split(",").join(" ");
      parts.push(`--- HASHTAGS ---\n${tagStr}`);
    }
  }

  if (parts.length === 0) {
    if (data.caption) parts.push(extractSafeString(data.caption));
    if (data.hook || data.reelHook) parts.push(`Hook: ${extractSafeString(data.hook || data.reelHook)}`);
    if (data.script || data.reelScript) parts.push(`Script:\n${extractSafeString(data.script || data.reelScript)}`);
    if (data.endingLine) parts.push(`CTA: ${extractSafeString(data.endingLine)}`);
    if (data.whatsappStatus) parts.push(`WhatsApp: ${extractSafeString(data.whatsappStatus)}`);
    if (data.facebookPost) parts.push(`Facebook:\n${extractSafeString(data.facebookPost)}`);
    if (data.formattedString) parts.push(extractSafeString(data.formattedString));
  }

  return parts.join("\n\n");
}

export const ResultView: React.FC<ResultViewProps> = ({
  featureType,
  topic,
  data,
  mediaBase64,
  onCopyText,
  onRegenerate,
  onNewGeneration,
  copiedKey,
}) => {
  const [showImageNotice, setShowImageNotice] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const selectedPlatforms: string[] | undefined = (data as any)?.selectedPlatforms;

  const isPlatformSelected = (platName: string) => {
    if (!selectedPlatforms || !Array.isArray(selectedPlatforms) || selectedPlatforms.length === 0) {
      return true;
    }
    return selectedPlatforms.includes(platName);
  };

  const isCopied = (key: string) => copiedKey === key;

  const renderCopyButton = (text: string, keyName: string, label = "Copy") => (
    <button
      onClick={() => onCopyText(text, keyName)}
      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 shadow-2xs cursor-pointer ${
        isCopied(keyName)
          ? "bg-emerald-500 text-white border border-emerald-500"
          : "bg-slate-100 hover:bg-slate-200 text-[#111827] border border-slate-200 active:scale-95"
      }`}
    >
      {isCopied(keyName) ? (
        <>
          <Check className="w-3.5 h-3.5 text-white" />
          <span>Copied ✓</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-[#6B7280]" />
          <span>{label}</span>
        </>
      )}
    </button>
  );

  const handleShareAll = () => {
    setIsPublishModalOpen(true);
  };

  const fullTextContent = buildFullCombinedText(data);
  const displayTitle = (data as any).title || topic || "Islamic ChatGPT Content";
  const allExtractedHashtags = extractAllHashtags(data, selectedPlatforms);

  const renderHashtagChipsCard = (
    tags: string[],
    keyPrefix: string,
    title = "#️⃣ Trending & Viral Hashtags (وائرل ہیش ٹیگز)"
  ) => {
    if (!tags || tags.length === 0) return null;
    const combinedText = tags.join(" ");

    return (
      <div className="bg-white border border-indigo-200/90 rounded-3xl p-5 space-y-3.5 shadow-xs max-w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-indigo-100 pb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
              <Hash className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
                {title}
              </span>
              <span className="text-[10px] text-indigo-600 font-bold font-mono">
                {tags.length} Tags Generated • Tap any tag to copy
              </span>
            </div>
          </div>
          {renderCopyButton(combinedText, `${keyPrefix}_all_tags`, "📋 Copy All Tags")}
        </div>

        <div className="flex flex-wrap gap-2 pt-1 max-w-full">
          {tags.map((tag, i) => {
            const chipKey = `${keyPrefix}_tag_${i}_${tag}`;
            const copied = isCopied(chipKey);
            return (
              <button
                key={chipKey}
                type="button"
                onClick={() => onCopyText(tag, chipKey)}
                className={`px-3 py-1.5 rounded-full text-xs font-black font-mono transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 break-all ${
                  copied
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-200/80 hover:border-[#4F46E5]/40"
                }`}
                title="Click to copy this hashtag"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white stroke-[3]" /> : null}
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const handleDirectNativePost = async () => {
    try {
      const result = await shareNativelyWithFile(mediaBase64, displayTitle, fullTextContent);
      onCopyText(fullTextContent, "post_all_native");
    } catch (e) {
      console.warn(e);
      onCopyText(fullTextContent, "post_all_native");
    }
  };

  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 w-full max-w-xl mx-auto space-y-5 animate-fade-in overflow-x-hidden min-w-0">
      {/* Top Status Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onNewGeneration}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#1F2937] active:scale-95 transition-all shadow-xs flex items-center justify-center shrink-0 border border-slate-200 cursor-pointer"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-[#1F2937] stroke-[2.5]" />
          </button>
          <div className="min-w-0">
            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> ✨ Your Content is Ready
            </span>
            <p className="text-sm font-black text-[#111827] mt-0.5 font-urdu truncate">
              {topic || "AI Generated Content"}
            </p>
          </div>
        </div>
        <button
          onClick={onNewGeneration}
          className="px-3.5 py-2 bg-[#16A34A] text-white hover:bg-[#15803D] font-black text-xs rounded-2xl flex items-center gap-1 transition-all shrink-0 shadow-md shadow-green-600/20 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Feature 1: CREATE EVERYTHING RESULTS */}
      {featureType === "create_everything" && (
        <div className="space-y-4">

          {/* INSTAGRAM RESULT CARD */}
          {isPlatformSelected("Instagram") && ((data as any).instagramCaption || (data as any).caption) && (
            <div className="bg-white border border-pink-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-pink-100 pb-2.5">
                <span className="text-xs font-black text-pink-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-pink-600" /> Instagram Post
                </span>
                {renderCopyButton(
                  `${(data as any).instagramTitle ? `Title: ${(data as any).instagramTitle}\n\n` : ""}${(data as any).instagramCaption || (data as any).caption}\n\n${
                    Array.isArray((data as any).instagramHashtags)
                      ? (data as any).instagramHashtags.join(" ")
                      : Array.isArray((data as any).hashtags)
                      ? (data as any).hashtags.join(" ")
                      : ""
                  }`,
                  "ig_complete"
                )}
              </div>

              {((data as any).instagramTitle || (data as any).title) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600">📌 Hook / Title:</span>
                  <p className="text-sm font-black text-[#111827] font-urdu bg-pink-50/70 p-3 rounded-2xl border border-pink-100">
                    {(data as any).instagramTitle || (data as any).title}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Caption:</span>
                <p className="text-sm text-[#111827] font-urdu leading-relaxed bg-pink-50/50 p-4 rounded-2xl border border-pink-100 whitespace-pre-line">
                  {(data as any).instagramCaption || (data as any).caption}
                </p>
              </div>

              {((data as any).instagramHashtags || (data as any).hashtags) && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hashtags:</span>
                  <p className="text-xs text-pink-800 font-mono leading-relaxed bg-pink-50/30 p-3 rounded-xl border border-pink-100/60">
                    {Array.isArray((data as any).instagramHashtags)
                      ? (data as any).instagramHashtags.join(" ")
                      : Array.isArray((data as any).hashtags)
                      ? (data as any).hashtags.join(" ")
                      : (data as any).instagramHashtags || (data as any).hashtags}
                  </p>
                </div>
              )}

              {(data as any).instagramCta && (
                <p className="text-xs font-semibold text-pink-900 bg-pink-100/60 p-2.5 rounded-xl border border-pink-200">
                  👉 {(data as any).instagramCta}
                </p>
              )}
            </div>
          )}

          {/* TIKTOK RESULT CARD */}
          {isPlatformSelected("TikTok") && ((data as any).tiktokCaption || (data as any).tiktokScript || (data as any).reelScript) && (
            <div className="bg-white border border-slate-300 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-slate-900" /> TikTok / Reel Script & Caption
                </span>
                {renderCopyButton(
                  `Hook: ${(data as any).tiktokHook || (data as any).reelHook || ""}\n\nScript:\n${
                    (data as any).tiktokScript || (data as any).reelScript || ""
                  }\n\nCaption: ${(data as any).tiktokCaption || ""}`,
                  "tt_complete"
                )}
              </div>

              {((data as any).tiktokHook || (data as any).reelHook) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">🎣 Hook (First 3s):</span>
                  <p className="text-sm font-bold text-amber-950 font-urdu bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                    {(data as any).tiktokHook || (data as any).reelHook}
                  </p>
                </div>
              )}

              {((data as any).tiktokScript || (data as any).reelScript) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">🎬 Short Script / Voiceover:</span>
                  <div className="text-sm text-[#111827] font-urdu leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 whitespace-pre-line">
                    {(data as any).tiktokScript || (data as any).reelScript}
                  </div>
                </div>
              )}

              {(data as any).tiktokCaption && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Caption:</span>
                  <p className="text-sm text-slate-900 font-urdu bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {(data as any).tiktokCaption}
                  </p>
                </div>
              )}

              {Array.isArray((data as any).tiktokHashtags) && (data as any).tiktokHashtags.length > 0 && (
                <p className="text-xs text-slate-800 font-mono bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                  {(data as any).tiktokHashtags.join(" ")}
                </p>
              )}
            </div>
          )}

          {/* FACEBOOK RESULT CARD */}
          {isPlatformSelected("Facebook") && ((data as any).facebookPost || (data as any).facebookTitle) && (
            <div className="bg-white border border-blue-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
                <span className="text-xs font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Facebook className="w-4 h-4 text-blue-600" /> Facebook Post
                </span>
                {renderCopyButton(
                  `${(data as any).facebookTitle ? `Title: ${(data as any).facebookTitle}\n\n` : ""}${(data as any).facebookPost || ""}${
                    (data as any).facebookHashtags ? `\n\n${Array.isArray((data as any).facebookHashtags) ? (data as any).facebookHashtags.join(" ") : (data as any).facebookHashtags}` : ""
                  }`,
                  "fb_complete"
                )}
              </div>

              {((data as any).facebookTitle || (data as any).title) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">📌 Post Title / عنوان:</span>
                  <p className="text-sm font-black text-[#111827] font-urdu bg-blue-50/70 p-3 rounded-2xl border border-blue-200">
                    {(data as any).facebookTitle || (data as any).title}
                  </p>
                </div>
              )}

              {(data as any).facebookPost && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Post Content:</span>
                  <p className="text-sm text-[#111827] font-urdu leading-relaxed bg-blue-50/50 p-4 rounded-2xl border border-blue-100 whitespace-pre-line">
                    {(data as any).facebookPost}
                  </p>
                </div>
              )}

              {(data as any).facebookCta && (
                <p className="text-xs font-semibold text-blue-900 bg-blue-100/60 p-2.5 rounded-xl border border-blue-200">
                  💬 {(data as any).facebookCta}
                </p>
              )}
            </div>
          )}

          {/* WHATSAPP RESULT CARD */}
          {isPlatformSelected("WhatsApp") && (data as any).whatsappStatus && (
            <div className="bg-white border border-emerald-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Status
                </span>
                {renderCopyButton((data as any).whatsappStatus, "wa_complete")}
              </div>

              <p className="text-sm font-bold text-[#111827] font-urdu leading-relaxed bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 text-center">
                {(data as any).whatsappStatus}
              </p>

              {(data as any).whatsappStatusEmoji && (
                <p className="text-xs text-emerald-900 font-urdu bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100 text-center">
                  {(data as any).whatsappStatusEmoji}
                </p>
              )}
            </div>
          )}

          {/* YOUTUBE RESULT CARD */}
          {isPlatformSelected("YouTube") && (data as any).youtubeTitle && (
            <div className="bg-white border border-red-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-red-100 pb-2.5">
                <span className="text-xs font-black text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-red-600" /> YouTube Title & Description
                </span>
                {renderCopyButton(
                  `Title: ${(data as any).youtubeTitle}\n\nDescription:\n${(data as any).youtubeDescription || ""}`,
                  "yt_complete"
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Video Title:</span>
                <p className="text-sm font-black text-[#111827] font-urdu bg-red-50/50 p-3.5 rounded-2xl border border-red-100">
                  {(data as any).youtubeTitle}
                </p>
              </div>

              {(data as any).youtubeDescription && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description:</span>
                  <p className="text-xs text-[#111827] font-urdu bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-line">
                    {(data as any).youtubeDescription}
                  </p>
                </div>
              )}

              {Array.isArray((data as any).youtubeTags) && (data as any).youtubeTags.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tags:</span>
                  <p className="text-xs text-red-800 font-mono bg-red-50/30 p-2.5 rounded-xl border border-red-100">
                    {(data as any).youtubeTags.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI IMAGE PROMPT CARD */}
          {(data as any).imagePrompt && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-5 space-y-3.5 shadow-md border border-indigo-500/30">
              <div className="flex items-center justify-between border-b border-indigo-700/50 pb-2.5">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-300" /> 🖼️ AI Image Prompt
                </span>
                {renderCopyButton((data as any).imagePrompt, "imagePrompt", "Copy Prompt 📋")}
              </div>

              <p className="text-xs text-indigo-100 leading-relaxed font-mono bg-black/30 p-3.5 rounded-2xl border border-indigo-400/20">
                {(data as any).imagePrompt}
              </p>

              <div className="pt-1 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowImageNotice(!showImageNotice)}
                  className="py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✨ Generate Image</span>
                </button>

                <p className="text-[11px] text-indigo-200 font-medium">
                  Use this prompt with any image generator
                </p>
              </div>

              {showImageNotice && (
                <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-2xl text-amber-200 text-xs font-medium space-y-1 animate-fade-in">
                  <p className="font-bold text-amber-300">ℹ️ Image generation API notice:</p>
                  <p>Image generation API is not connected yet. Copy the prompt above and paste it into Midjourney, DALL-E, or Leonardo AI.</p>
                </div>
              )}
            </div>
          )}

          {/* DEDICATED VIRAL HASHTAGS CARD FOR CREATE EVERYTHING */}
          {renderHashtagChipsCard(allExtractedHashtags, "create_everything")}

        </div>
      )}

      {/* Feature 2: IMAGE CAPTION RESULTS */}
      {featureType === "image_caption" && (() => {
        const rawData = (data as any) || {};

        const getFriendlyLabel = (key: string) => {
          const lower = key.toLowerCase();
          if (lower === "short") return "⚡ Short & Catchy";
          if (lower === "stylish") return "💫 Stylish & Classy";
          if (lower === "emotional") return "❤️ Emotional & Heartfelt";
          if (lower === "motivational") return "🚀 Motivational";
          if (lower === "islamic") return "🤲 Islamic & Dua";
          if (lower === "funny") return "😂 Funny & Humorous";
          if (lower === "simple") return "🌿 Simple & Clean";
          if (lower === "captionurduscript") return "✍️ اردو کیپشن (Urdu)";
          if (lower === "captionromanurdu") return "💬 Roman Urdu";
          if (lower === "captionenglish") return "🌐 English Caption";
          if (lower === "title") return "📌 Post Title";
          if (lower.includes("hashtag")) return "# Suggested Hashtags";
          return `✨ ${key.charAt(0).toUpperCase() + key.slice(1)}`;
        };

        const entries = Object.entries(rawData).filter(([key, val]) => {
          if (!val) return false;
          if (key === "selectedPlatforms") return false;
          return true;
        });

        // Separate hashtags from standard text captions
        const captionEntries = entries.filter(([key]) => !key.toLowerCase().includes("hashtag"));

        return (
          <div className="space-y-4 max-w-full">
            {captionEntries.map(([styleKey, captionText]) => {
              const textValue = String(captionText);
              return (
                <div
                  key={styleKey}
                  className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-2 shadow-xs max-w-full overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-[#4F46E5] uppercase tracking-wider truncate">
                      {getFriendlyLabel(styleKey)}
                    </span>
                    {renderCopyButton(textValue, `caption_${styleKey}`)}
                  </div>
                  <p className="text-sm text-[#111827] font-urdu leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80 break-words [overflow-wrap:anywhere] whitespace-pre-line max-w-full">
                    {textValue}
                  </p>
                </div>
              );
            })}

            {/* DEDICATED VIRAL HASHTAGS CARD FOR IMAGE CAPTION */}
            {renderHashtagChipsCard(allExtractedHashtags, "image_caption")}
          </div>
        );
      })()}

      {/* Feature 3: REEL SCRIPT RESULTS */}
      {featureType === "reel_script" && (() => {
        const titleText = extractSafeString(
          (data as any).title ||
          (data as any).reelTitle ||
          (data as any).videoTitle ||
          (data as any).youtubeTitle ||
          topic ||
          "وائرل ریل اسکرپٹ (Viral Reel)"
        );
        const hookText = extractSafeString(
          (data as any).hook ||
          (data as any).reelHook ||
          (data as any).tiktokHook ||
          (data as any).hookUrdu ||
          (data as any).hookRoman ||
          (data as any).hookEnglish ||
          "کیا آپ نے کبھی یہ بات سوچی ہے؟ اگر نہیں تو یہ ویڈیو آخر تک لازمی دیکھیں! 🔥"
        );
        const scriptText = extractSafeString(
          (data as any).script ||
          (data as any).reelScript ||
          (data as any).tiktokScript ||
          (data as any).scriptBodyUrdu ||
          (data as any).scriptBodyRoman ||
          (data as any).scriptBodyEnglish ||
          (data as any).content ||
          (data as any).caption ||
          "آج کی اس ویڈیو میں ہم ایک زبردست اور حیران کن بات جانیں گے۔ ویڈیو کو لائک اور شیئر ضرور کریں!"
        );
        const endingText = extractSafeString(
          (data as any).endingLine ||
          (data as any).callToActionUrdu ||
          (data as any).callToActionRoman ||
          (data as any).callToActionEnglish ||
          (data as any).instagramCta ||
          "ویڈیو پسند آئے تو فالو اور شیئر کریں! 🚀"
        );
        const captionText = extractSafeString(
          (data as any).caption || (data as any).instagramCaption || (data as any).description
        );
        const reelTags = extractAllHashtags(data);

        return (
          <div className="space-y-4">
            {titleText && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                    📌 Reel Title (وائرل ٹائٹل)
                  </span>
                  {renderCopyButton(titleText, "reelTitle")}
                </div>
                <p className="text-base font-bold text-[#111827] font-urdu bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
                  {titleText}
                </p>
              </div>
            )}

            {hookText && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                    🎣 Hook (First 3 Sec)
                  </span>
                  {renderCopyButton(hookText, "hook")}
                </div>
                <p className="text-sm font-bold text-[#111827] font-urdu bg-amber-50 p-4 rounded-2xl border border-amber-200 leading-relaxed">
                  {hookText}
                </p>
              </div>
            )}

            {scriptText && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#7C3AED] uppercase tracking-wider flex items-center gap-1.5">
                    🎬 Reel Script
                  </span>
                  {renderCopyButton(scriptText, "script")}
                </div>
                <div className="text-sm text-[#111827] font-urdu leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80 whitespace-pre-line font-medium">
                  {scriptText}
                </div>
              </div>
            )}

            {endingText && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    🏁 Ending Line / Call to Action
                  </span>
                  {renderCopyButton(endingText, "endingLine")}
                </div>
                <p className="text-sm font-semibold text-[#111827] font-urdu bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 leading-relaxed">
                  {endingText}
                </p>
              </div>
            )}

            {captionText && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#4F46E5] uppercase tracking-wider flex items-center gap-1.5">
                    📝 Caption & Hashtags
                  </span>
                  {renderCopyButton(captionText, "reelCaption")}
                </div>
                <p className="text-sm text-[#111827] font-urdu bg-slate-50 p-4 rounded-2xl border border-slate-200/80 whitespace-pre-line leading-relaxed">
                  {captionText}
                </p>
              </div>
            )}

            {/* HASHTAGS CARD FOR REEL SCRIPT */}
            {renderHashtagChipsCard(reelTags, "reel_script")}
          </div>
        );
      })()}

      {/* Feature 4: HASHTAGS RESULTS */}
      {featureType === "hashtags" && (
        <div className="space-y-4">
          {renderHashtagChipsCard(allExtractedHashtags, "hashtags_full", "✨ Trending & Viral Hashtags")}
        </div>
      )}

      {/* Feature 5: WHATSAPP STATUS RESULTS */}
      {featureType === "whatsapp_status" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                📱 WhatsApp Status Line
              </span>
              {renderCopyButton((data as any).statusText || (data as any).caption || "", "statusMain")}
            </div>
            <p className="text-base text-[#111827] font-urdu font-bold bg-slate-50 p-4.5 rounded-2xl border border-slate-200/80 text-center leading-relaxed">
              {(data as any).statusText || (data as any).caption}
            </p>
          </div>

          {Array.isArray((data as any).alternativeStatuses) && (data as any).alternativeStatuses.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-3 shadow-xs">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                🔄 متبادل چوائس (Alternative Options)
              </span>
              <div className="space-y-2">
                {(data as any).alternativeStatuses.map((alt: string, idx: number) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <p className="text-xs text-[#111827] font-urdu flex-1">{alt}</p>
                    {renderCopyButton(alt, `status_alt_${idx}`)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {renderHashtagChipsCard(allExtractedHashtags, "whatsapp_status")}
        </div>
      )}

      {/* Feature: LOGO & DP DESIGN STUDIO RESULTS */}
      {(featureType === "logo_design" || Boolean((data as any).logoText)) && (
        <div className="space-y-5">
          <LogoDesignStudio
            data={data as any}
            topic={topic}
            onCopyText={onCopyText}
            onShareClick={() => setIsPublishModalOpen(true)}
          />
          {renderHashtagChipsCard(allExtractedHashtags, "logo_design")}
        </div>
      )}

      {/* Feature 6: SOCIAL POST RESULTS */}
      {featureType === "social_post" && !(data as any).logoText && (
        <div className="space-y-5">
          {/* 1. VISUAL GRAPHIC POST CARD (READY TO DOWNLOAD & UPLOAD) */}
          <div className="bg-slate-50/80 p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <SocialGraphicPoster
              data={data as any}
              mediaBase64={mediaBase64}
              topic={topic}
              onShareClick={() => setIsPublishModalOpen(true)}
              onCopyText={onCopyText}
            />
          </div>

          {/* 2. PLATFORM-WISE POST CAPTIONS & SCRIPTS */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                📝 پوسٹ کیپشن و تحریر (Platform Captions)
              </span>
            </div>
            <span className="text-[11px] font-extrabold text-slate-500 font-urdu">
              کاپی کر کے سوشل میڈیا پر لگائیں
            </span>
          </div>

          {/* INSTAGRAM POST */}
          {isPlatformSelected("Instagram") && ((data as any).instagramCaption || (data as any).caption || (data as any).instagramTitle) && (
            <div className="bg-white border border-pink-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-pink-100 pb-2.5">
                <span className="text-xs font-black text-pink-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-pink-600" /> Instagram Post
                </span>
                {renderCopyButton(
                  `${(data as any).instagramTitle ? `Title: ${(data as any).instagramTitle}\n\n` : ""}${(data as any).instagramCaption || (data as any).caption || ""}${
                    (data as any).instagramHashtags ? `\n\n${Array.isArray((data as any).instagramHashtags) ? (data as any).instagramHashtags.join(" ") : (data as any).instagramHashtags}` : ""
                  }`,
                  "igPost"
                )}
              </div>

              {((data as any).instagramTitle || (data as any).title) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600">📌 Hook / Title:</span>
                  <p className="text-sm font-black text-[#111827] font-urdu bg-pink-50/70 p-3 rounded-2xl border border-pink-100">
                    {(data as any).instagramTitle || (data as any).title}
                  </p>
                </div>
              )}

              {((data as any).instagramCaption || (data as any).caption) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Caption:</span>
                  <p className="text-sm text-[#111827] font-urdu leading-relaxed bg-pink-50/50 p-4 rounded-2xl border border-pink-100 whitespace-pre-line">
                    {(data as any).instagramCaption || (data as any).caption}
                  </p>
                </div>
              )}

              {(data as any).instagramCta && (
                <p className="text-xs font-semibold text-pink-900 bg-pink-100/60 p-2.5 rounded-xl border border-pink-200">
                  👉 {(data as any).instagramCta}
                </p>
              )}

              {((data as any).instagramHashtags || (data as any).hashtags) && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hashtags:</span>
                  <p className="text-xs text-pink-800 font-mono bg-pink-50/30 p-2.5 rounded-xl border border-pink-100/60">
                    {Array.isArray((data as any).instagramHashtags)
                      ? (data as any).instagramHashtags.join(" ")
                      : Array.isArray((data as any).hashtags)
                      ? (data as any).hashtags.join(" ")
                      : (data as any).instagramHashtags || (data as any).hashtags}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* FACEBOOK POST */}
          {isPlatformSelected("Facebook") && ((data as any).facebookPost || (data as any).caption || (data as any).facebookTitle) && (
            <div className="bg-white border border-blue-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
                <span className="text-xs font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Facebook className="w-4 h-4 text-blue-600" /> Facebook Post
                </span>
                {renderCopyButton(
                  `${(data as any).facebookTitle ? `Title: ${(data as any).facebookTitle}\n\n` : ""}${(data as any).facebookPost || (data as any).caption || ""}${
                    (data as any).facebookHashtags ? `\n\n${Array.isArray((data as any).facebookHashtags) ? (data as any).facebookHashtags.join(" ") : (data as any).facebookHashtags}` : ""
                  }`,
                  "fbPost"
                )}
              </div>

              {((data as any).facebookTitle || (data as any).title) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">📌 Post Title / عنوان:</span>
                  <p className="text-sm font-black text-[#111827] font-urdu bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200">
                    {(data as any).facebookTitle || (data as any).title}
                  </p>
                </div>
              )}

              {((data as any).facebookPost || (data as any).caption) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Post Content / مواد:</span>
                  <p className="text-sm text-[#111827] font-urdu leading-relaxed bg-blue-50/50 p-4 rounded-2xl border border-blue-100 whitespace-pre-line">
                    {(data as any).facebookPost || (data as any).caption}
                  </p>
                </div>
              )}

              {((data as any).facebookCta || (data as any).cta) && (
                <p className="text-xs font-semibold text-blue-900 bg-blue-100/60 p-2.5 rounded-xl border border-blue-200">
                  💬 {(data as any).facebookCta || (data as any).cta}
                </p>
              )}

              {((data as any).facebookHashtags || (data as any).hashtags) && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Facebook Hashtags:</span>
                  <p className="text-xs text-blue-800 font-mono bg-blue-50/30 p-2.5 rounded-xl border border-blue-100/60">
                    {Array.isArray((data as any).facebookHashtags)
                      ? (data as any).facebookHashtags.join(" ")
                      : Array.isArray((data as any).hashtags)
                      ? (data as any).hashtags.join(" ")
                      : (data as any).facebookHashtags || (data as any).hashtags}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TIKTOK POST */}
          {isPlatformSelected("TikTok") && ((data as any).tiktokCaption || (data as any).tiktokScript || (data as any).reelScript || (data as any).tiktokHook || (data as any).tiktokTitle) && (
            <div className="bg-white border border-slate-300 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-slate-900" /> TikTok / Reel
                </span>
                {renderCopyButton(
                  `Hook: ${(data as any).tiktokHook || (data as any).reelHook || ""}\n\nScript:\n${
                    (data as any).tiktokScript || (data as any).reelScript || ""
                  }\n\nCaption: ${(data as any).tiktokCaption || ""}${
                    (data as any).tiktokHashtags ? `\n\n${Array.isArray((data as any).tiktokHashtags) ? (data as any).tiktokHashtags.join(" ") : (data as any).tiktokHashtags}` : ""
                  }`,
                  "ttPost"
                )}
              </div>

              {((data as any).tiktokTitle || (data as any).title) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">🎬 Video Title:</span>
                  <p className="text-sm font-black text-[#111827] font-urdu bg-slate-100 p-3 rounded-2xl border border-slate-200">
                    {(data as any).tiktokTitle || (data as any).title}
                  </p>
                </div>
              )}

              {((data as any).tiktokHook || (data as any).reelHook) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">🎣 Hook (First 3s):</span>
                  <p className="text-sm font-bold text-amber-950 font-urdu bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                    {(data as any).tiktokHook || (data as any).reelHook}
                  </p>
                </div>
              )}

              {((data as any).tiktokScript || (data as any).reelScript) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">🎬 Short Script / Voiceover:</span>
                  <div className="text-sm text-[#111827] font-urdu leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 whitespace-pre-line">
                    {(data as any).tiktokScript || (data as any).reelScript}
                  </div>
                </div>
              )}

              {(data as any).tiktokCaption && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Caption:</span>
                  <p className="text-sm text-slate-900 font-urdu bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {(data as any).tiktokCaption}
                  </p>
                </div>
              )}

              {((data as any).tiktokHashtags || (data as any).hashtags) && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hashtags:</span>
                  <p className="text-xs text-slate-800 font-mono bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                    {Array.isArray((data as any).tiktokHashtags)
                      ? (data as any).tiktokHashtags.join(" ")
                      : Array.isArray((data as any).hashtags)
                      ? (data as any).hashtags.join(" ")
                      : (data as any).tiktokHashtags || (data as any).hashtags}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* WHATSAPP STATUS */}
          {isPlatformSelected("WhatsApp") && ((data as any).whatsappStatus || (data as any).whatsappTitle || (data as any).caption) && (
            <div className="bg-white border border-emerald-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Status
                </span>
                {renderCopyButton((data as any).whatsappStatus || (data as any).caption || "", "waPost")}
              </div>

              {((data as any).whatsappTitle || (data as any).title) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Theme / Title:</span>
                  <p className="text-sm font-bold text-emerald-950 font-urdu bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
                    {(data as any).whatsappTitle || (data as any).title}
                  </p>
                </div>
              )}

              <p className="text-sm font-bold text-[#111827] font-urdu leading-relaxed bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 text-center">
                {(data as any).whatsappStatus || (data as any).caption}
              </p>

              {(data as any).whatsappStatusEmoji && (
                <p className="text-xs text-emerald-900 font-urdu bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100 text-center">
                  {(data as any).whatsappStatusEmoji}
                </p>
              )}
            </div>
          )}

          {/* YOUTUBE RESULT CARD */}
          {isPlatformSelected("YouTube") && ((data as any).youtubeTitle || (data as any).youtubeDescription || (data as any).title) && (
            <div className="bg-white border border-red-200 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-red-100 pb-2.5">
                <span className="text-xs font-black text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-red-600" /> YouTube Title & Description
                </span>
                {renderCopyButton(
                  `Title: ${(data as any).youtubeTitle || (data as any).title || ""}\n\nDescription:\n${(data as any).youtubeDescription || ""}`,
                  "ytPost"
                )}
              </div>

              {((data as any).youtubeTitle || (data as any).title) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Video Title:</span>
                  <p className="text-sm font-black text-[#111827] font-urdu bg-red-50/50 p-3.5 rounded-2xl border border-red-100">
                    {(data as any).youtubeTitle || (data as any).title}
                  </p>
                </div>
              )}

              {(data as any).youtubeDescription && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description:</span>
                  <p className="text-xs text-[#111827] font-urdu bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-line">
                    {(data as any).youtubeDescription}
                  </p>
                </div>
              )}

              {Array.isArray((data as any).youtubeTags) && (data as any).youtubeTags.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tags:</span>
                  <p className="text-xs text-red-800 font-mono bg-red-50/30 p-2.5 rounded-xl border border-red-100">
                    {(data as any).youtubeTags.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* VIRAL HASHTAGS CARD */}
          {renderHashtagChipsCard(allExtractedHashtags, "social_post")}
        </div>
      )}

      {/* Feature 7: DAILY IDEAS RESULTS */}
      {featureType === "daily_ideas" && Array.isArray((data as any).ideas) && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4 shadow-xs">
            <span className="text-xs font-black text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" /> 💡 Content Ideas
            </span>
            <div className="space-y-3">
              {(data as any).ideas.map((idea: any, i: number) => (
                <div key={i} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 font-urdu">{idea.title || idea.category}</span>
                    {renderCopyButton(
                      `${idea.title || ""}\n${idea.description || ""}\nHook: ${idea.hookSuggestion || ""}`,
                      `idea_${i}`
                    )}
                  </div>
                  {idea.description && <p className="text-xs text-slate-700 font-urdu">{idea.description}</p>}
                  {idea.hookSuggestion && (
                    <p className="text-xs font-bold text-amber-950 font-urdu bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      🎣 {idea.hookSuggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          {renderHashtagChipsCard(allExtractedHashtags, "daily_ideas")}
        </div>
      )}

      {/* Feature: ISLAMIC QA RESULTS */}
      {featureType === "islamic_qa" && (
        <div className="space-y-4">
          <div className="bg-white border border-emerald-200 rounded-3xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 font-urdu">
                📖 اسلامی سوال و مستند رہنمائی
              </span>
              {renderCopyButton(
                `${(data as any).answerUrdu || ""}\n\n${(data as any).arabicText || ""}\n${(data as any).translation || ""}\n\n${(data as any).quranReference || (data as any).hadithReference || ""}`,
                "islamic_qa_copy"
              )}
            </div>

            {/* Answer */}
            <p className="text-sm font-urdu leading-relaxed text-slate-800 whitespace-pre-wrap">
              {(data as any).answerUrdu}
            </p>

            {/* Authentic Arabic Quran / Hadith Box (رسمِ عثمانی) */}
            {(data as any).arabicText && (
              <div className="bg-[#052b1e] text-white p-5 rounded-2xl border-2 border-emerald-700/80 shadow-md space-y-3 text-center">
                <span className="text-[11px] font-extrabold tracking-wider text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-600/70 inline-block font-urdu-ui shadow-xs">
                  القرآن و الحدیث الصحیح (رسمِ عثمانی - صحیح بخاری و مسلم)
                </span>
                <p className="font-quran text-xl sm:text-2xl font-bold leading-[2.4] text-[#FDE047] dir-rtl tracking-wide select-text py-1">
                  {(data as any).arabicText}
                </p>
                {(data as any).translation && (
                  <div className="bg-[#021f15] p-3.5 sm:p-4 rounded-xl border border-emerald-600/50 shadow-inner text-right dir-rtl space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black font-urdu-ui border-b border-emerald-800/80 pb-1.5">
                      <span>📖</span>
                      <span>اردو ترجمہ و مفہوم:</span>
                    </div>
                    <p className="text-sm sm:text-base font-bold font-urdu text-white leading-relaxed select-text pt-1">
                      {(data as any).translation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Fatwa Authority & Verification Card */}
            {((data as any).fatwaSource || (data as any).fatwaNumber || (data as any).fatwaReference) && (
              <div className="bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900 text-emerald-100 p-4 rounded-2xl border border-emerald-700/60 shadow-md space-y-2.5 font-urdu text-xs dir-rtl">
                <div className="flex items-center justify-between gap-2 border-b border-emerald-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-800/80 flex items-center justify-center text-amber-300">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-300 text-xs block">
                        {(data as any).fatwaSource || "فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)"}
                      </span>
                      <span className="text-[10px] text-emerald-400">
                        مستند شرعی دار الافتاء و تحقیقی فتویٰ کونسل
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {/* Button 1: Specific Fatwa Page Link */}
                    <a
                      href={(data as any).fatwaUrl || "https://alulama.org/online-fatwa-urdu/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95 border border-amber-300"
                      title="العلماء ویب سائٹ پر یہ مخصوص فتویٰ کھولیں"
                    >
                      <span>🔗 فتویٰ العلماء</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                    </a>

                    {/* Button 2: Main Alulama Website Link */}
                    <a
                      href="https://alulama.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-800/90 hover:bg-emerald-700 text-amber-200 border border-emerald-600/60 font-black text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                      title="العلماء کی آفیشل ویب سائٹ (alulama.org) کھولیں"
                    >
                      <span>🌐 العلماء ویب سائٹ</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-300 stroke-[3]" />
                    </a>
                  </div>
                </div>

                {/* Reference Number & Bab/Topic Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-0.5">
                  {(data as any).fatwaNumber && (
                    <div className="bg-emerald-900/50 border border-emerald-700/40 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                      <span className="text-amber-400 font-bold shrink-0">🔖 حوالہ / عنوان:</span>
                      <span className="text-white font-bold tracking-wide">{(data as any).fatwaNumber}</span>
                    </div>
                  )}
                  {(data as any).fatwaTopic && (
                    <div className="bg-emerald-900/50 border border-emerald-700/40 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                      <span className="text-emerald-300 font-bold shrink-0">📁 موضوع / باب:</span>
                      <span className="text-emerald-100">{(data as any).fatwaTopic}</span>
                    </div>
                  )}
                </div>

                {(data as any).fatwaReference && (
                  <div className="text-[10.5px] text-emerald-300/90 bg-black/20 p-2 rounded-xl border border-emerald-800/40 flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-amber-300">مستند حوالہ: </strong>
                      {(data as any).fatwaReference}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Reference */}
            <div className="flex flex-wrap gap-2 text-xs font-urdu">
              {(data as any).quranReference && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl font-bold">
                  {(data as any).quranReference}
                </span>
              )}
              {(data as any).hadithReference && (
                <span className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl font-bold">
                  📖 {(data as any).hadithReference}
                </span>
              )}
            </div>

            {/* Key Takeaway & Advice */}
            {((data as any).keyTakeaway || (data as any).practicalAdvice) && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs font-urdu">
                {(data as any).keyTakeaway && (
                  <p className="text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 font-bold">💡 اہم سبق: </strong>
                    {(data as any).keyTakeaway}
                  </p>
                )}
                {(data as any).practicalAdvice && (
                  <p className="text-slate-700 leading-relaxed border-t border-slate-200/60 pt-2">
                    <strong className="text-slate-900 font-bold">🌱 عملی نصیحت: </strong>
                    {(data as any).practicalAdvice}
                  </p>
                )}
              </div>
            )}

            {/* Suggested Follow-up Questions / Topics */}
            {Array.isArray((data as any).suggestedQuestions) && (data as any).suggestedQuestions.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2 font-urdu">
                <span className="text-[11px] font-bold text-slate-600 block">
                  💡 متعلقہ تجاویز و مزید اہم سوالات:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(data as any).suggestedQuestions.map((q: string, idx: number) => (
                    <div
                      key={idx}
                      className="text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium flex items-center justify-between gap-2"
                    >
                      <span>{q}</span>
                      {renderCopyButton(q, `suggested_q_${idx}`)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social Publish Detailed Modal (Opens on Share button click) */}
      <SocialPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title={displayTitle}
        fullFormattedText={fullTextContent}
        mediaBase64={mediaBase64}
        onCopySuccess={(msg) => onCopyText(fullTextContent, "publish_toast")}
      />

      {/* Bottom Primary Action Bar */}
      <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => {
            const text = buildFullCombinedText(data);
            onCopyText(text, "copy_all_btn");
          }}
          className="py-3 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center"
        >
          <Copy className="w-4 h-4 shrink-0" />
          <span>{isCopied("copy_all_btn") ? "Copied ✓" : "Copy All 📋"}</span>
        </button>

        <button
          type="button"
          onClick={handleShareAll}
          className="py-3 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center"
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>{isCopied("share_all") ? "Shared ✓" : "Share 📤"}</span>
        </button>

        <button
          type="button"
          onClick={onRegenerate}
          className="py-3 px-2.5 bg-slate-100 hover:bg-slate-200 text-[#111827] font-black text-xs rounded-2xl border border-slate-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center"
        >
          <RotateCcw className="w-4 h-4 text-slate-700 shrink-0" />
          <span>Regenerate 🔄</span>
        </button>

        <button
          type="button"
          onClick={onNewGeneration}
          className="py-3 px-2.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>New ➕</span>
        </button>
      </div>
    </div>
  );
};
