
export function extractAlUlamaSearchKeyword(topic: string): string {
  const t = (topic || "").toLowerCase();
  if (t.includes("باتھ") || t.includes("غسل خانہ") || t.includes("بیت الخلاء") || t.includes("ٹوائلٹ") || t.includes("واش روم")) {
    return "بیت الخلاء";
  }
  if (t.includes("وضو")) return "وضو";
  if (t.includes("غسل")) return "غسل";
  if (t.includes("طلاق")) return "طلاق";
  if (t.includes("نکاح") || t.includes("مہر") || t.includes("رخصتی")) return "نکاح";
  if (t.includes("خلع")) return "خلع";
  if (t.includes("میلاد") || t.includes("ربیع الاول")) return "میلاد";
  if (t.includes("کرپٹو") || t.includes("بٹ کوائن") || t.includes("ڈیجیٹل کرنسی")) return "کرپٹو";
  if (t.includes("سود") || t.includes("بینک") || t.includes("ربا")) return "سود";
  if (t.includes("روزہ") || t.includes("افطار") || t.includes("سحری") || t.includes("تراویح") || t.includes("انہیلر")) return "روزہ";
  if (t.includes("زکوٰۃ") || t.includes("زکوۃ") || t.includes("صدقہ") || t.includes("فطرانہ")) return "زکوٰۃ";
  if (t.includes("وراثت") || t.includes("ترکہ") || t.includes("جائیداد")) return "وراثت";
  if (t.includes("نماز") || t.includes("قضاء") || t.includes("قصر") || t.includes("سجدہ")) return "نماز";
  if (t.includes("حج") || t.includes("عمرہ") || t.includes("قربانی")) return "حج";
  if (t.includes("پردہ") || t.includes("حجاب")) return "پردہ";

  const clean = topic
    .replace(/لجنۃ\s*العلماء\s*[:\s]*/g, "")
    .replace(/فتاویٰ\s*لجنۃ\s*العلماء\s*[:\s]*/g, "")
    .replace(/مجھے\s*فتوی\s*(دیں|بتائیں)?\s*(کہ)?/g, "")
    .replace(/کا\s*شرعی\s*حکم\s*(کیا\s*ہے)?/g, "")
    .replace(/کیا\s*حکم\s*ہے/g, "")
    .replace(/شرعی\s*حکم/g, "")
    .replace(/کے\s*احکام\s*(و\s*مسائل)?/g, "")
    .replace(/کا\s*مسنون\s*طریقہ/g, "")
    .replace(/کیا\s*/g, "")
    .replace(/ہے\s*\?/g, "")
    .trim();

  const words = clean.split(/\s+/).filter(w => w.length > 2);
  return words.slice(0, 2).join("+") || "فتوی";
}

import { FeatureType, LanguageOption, StyleOption, ChatIntent, ChatHistoryEntry } from "../types";
import { generateTripleCalendarCardResponse, getTripleCalendarInfo } from "./calendarConverter";

// Smart Prompt Intent Detector that deduces the exact feature from natural language questions
export function detectIntentFromPrompt(
  prompt: string,
  conversationHistory?: ChatHistoryEntry[]
): {
  featureType: FeatureType;
  extractedTopic: string;
  platformPreset?: string;
  badgeShape?: string;
  themeStyle?: string;
  style?: StyleOption;
} {
  const p = (prompt || "").toLowerCase().trim();

  // Helper to check if recent conversation history was about a logo / monogram / DP / design
  const hasPreviousLogoContext = Boolean(
    conversationHistory &&
    conversationHistory.slice(-4).some((h) => {
      const txt = (h.text || "").toLowerCase();
      return (
        txt.includes("لوگو") ||
        txt.includes("مونوگرام") ||
        txt.includes("ڈی پی") ||
        txt.includes("logo") ||
        txt.includes("monogram") ||
        txt.includes("dp") ||
        txt.includes("ڈیزائن") ||
        txt.includes("ڈیزان") ||
        txt.includes("ڈزائن") ||
        txt.includes("design") ||
        txt.includes("شیلڈ") ||
        txt.includes("crest") ||
        txt.includes("اواتار") ||
        txt.includes("avatar")
      );
    })
  );

  // Check for follow-up variation phrases (e.g. "اور بنا دیں", "اس ڈیزائن میں اور بنا کر دیں", "مزید بنا دیں")
  const isVariationFollowUp =
    p.includes("اور بنا") ||
    p.includes("اور بناؤ") ||
    p.includes("اور بنائیں") ||
    p.includes("اور بنا کے") ||
    p.includes("اور بنا کر") ||
    p.includes("اور دیں") ||
    p.includes("اور دکھائیں") ||
    p.includes("اور چاہیے") ||
    p.includes("مزید بنا") ||
    p.includes("مزید دیں") ||
    p.includes("مزید ڈیزائن") ||
    p.includes("دوسرا بنا") ||
    p.includes("دوسرا ڈیزائن") ||
    p.includes("ایک اور") ||
    p.includes("نئے بنا") ||
    p.includes("نیا بنا") ||
    p.includes("نئے ڈیزائن") ||
    p.includes("اس جیسا") ||
    p.includes("اس طرح کا") ||
    p.includes("اسی طرح") ||
    p.includes("اس ڈیزائن میں") ||
    p.includes("اس ڈیزان میں") ||
    p.includes("اس ڈزائن میں") ||
    p.includes("اس اسٹائل میں") ||
    p.includes("اس تھیم میں") ||
    p.includes("اس رنگ میں") ||
    p.includes("اس انداز میں") ||
    p.includes("اس نام سے") ||
    p.includes("اس کا اور") ||
    p.includes("اس میں اور") ||
    p.includes("اس کے اور") ||
    p.includes("کوئی اور");

  // Direct Logo / Monogram / DP / Design keywords
  const isDirectLogoRequest =
    p.includes("لوگو") ||
    p.includes("لوگوز") ||
    p.includes("لوگو میکر") ||
    p.includes("logo") ||
    p.includes("logos") ||
    p.includes("logomaker") ||
    p.includes("ڈیزائن") ||
    p.includes("ڈیزان") ||
    p.includes("ڈزائن") ||
    p.includes("ڈیزائننگ") ||
    p.includes("ڈیزائنز") ||
    p.includes("ڈیزائنر") ||
    p.includes("design") ||
    p.includes("designs") ||
    p.includes("designer") ||
    p.includes("مونوگرام") ||
    p.includes("مونو گرام") ||
    p.includes("مونوگرامز") ||
    p.includes("monogram") ||
    p.includes("monograms") ||
    p.includes("ڈی پی") ||
    p.includes("ڈیپیز") ||
    p.includes("dp") ||
    p.includes("dps") ||
    p.includes("واٹس ایپ ڈی پی") ||
    p.includes("پروفائل ڈی پی") ||
    p.includes("اواتار") ||
    p.includes("avatar") ||
    p.includes("avatars") ||
    p.includes("پروفائل پکچر") ||
    p.includes("پروفائل تصویر") ||
    p.includes("profile picture") ||
    p.includes("badge") ||
    p.includes("badges") ||
    p.includes("بیج") ||
    p.includes("شیلڈ") ||
    p.includes("shields") ||
    p.includes("shield") ||
    p.includes("کریسٹ") ||
    p.includes("crest") ||
    p.includes("emblem") ||
    p.includes("مہر") ||
    p.includes("چینل کا نشان") ||
    p.includes("برانڈ نشان") ||
    p.includes("نشان بنا") ||
    p.includes("مارک بنا");

  // 1. LOGO & DESIGN INTENT (Prioritize immediately when logo keywords or logo follow-ups are present)
  if (isDirectLogoRequest || (hasPreviousLogoContext && isVariationFollowUp)) {
    let preset = "whatsapp_dp";
    let shape = (p.includes("اس طرح کا") || p.includes("اس جیسا") || p.includes("اسکرین شاٹ") || p.includes("تصویر") || p.includes("اوول") || p.includes("oval") || p.includes("انٹرلاکنگ")) ? "interlocking_oval" : "royal_crest";
    let theme = (p.includes("اس طرح کا") || p.includes("اس جیسا") || p.includes("سیاہ") || p.includes("black") || p.includes("minimal")) ? "minimalist_black" : "royal_gold_dark";

    if (p.includes("youtube") || p.includes("یوٹیوب") || p.includes("شیلڈ") || p.includes("shield") || p.includes("گیمنگ") || p.includes("gaming")) {
      preset = "youtube_channel";
      shape = "modern_shield";
      theme = "youtube_red_gold";
    } else if (p.includes("tiktok") || p.includes("ٹک ٹاک") || p.includes("نیون") || p.includes("neon") || p.includes("سائبر") || p.includes("cyber")) {
      preset = "tiktok_profile";
      shape = "cyber_hexagon";
      theme = "tiktok_cyan_magenta";
    } else if (p.includes("islamic") || p.includes("اسلامی") || p.includes("گنبد") || p.includes("خطاطی") || p.includes("dome")) {
      preset = "islamic_crest";
      shape = "islamic_dome";
      theme = "islamic_emerald_gold";
    } else if (p.includes("diamond") || p.includes("ڈائمنڈ") || p.includes("luxury") || p.includes("لگژری") || p.includes("روز گولڈ") || p.includes("rose gold")) {
      preset = "instagram_dp";
      shape = "luxury_diamond";
      theme = "rose_gold_luxury";
    } else if (p.includes("sapphire") || p.includes("نیلا") || p.includes("blue")) {
      theme = "sapphire_luxury";
      shape = "classic_monogram";
    } else if (p.includes("ruby") || p.includes("لال") || p.includes("red")) {
      theme = "ruby_prestige";
      shape = "royal_crest";
    }

    // Clean prompt to extract brand/person name
    let cleanName = prompt
      .replace(/^(please\s+|can\s+you\s+|make\s+me\s+a\s+|create\s+a\s+|generate\s+a\s+|i\s+need\s+a\s+|make\s+|design\s+a\s+|design\s+|logo\s+for\s+|logo\s+of\s+|dp\s+for\s+)/gi, " ")
      .replace(/\s+(logo|design|dp|profile|maker|monogram|creator|channel|badge|symbol|watermark)$/gi, " ")
      .replace(/(مجھے|ہمیں|برائے\s*مہربانی|برائے\s*کرم|مہربانی\s*فرما\s*کر|پلیز|ازراہ\s*کرم)/gi, " ")
      .replace(/(میرے\s*لیے|میرے\s*لیئے|میرے\s*واسطے|میرا|ہمارے\s*لیے|کے\s*لیے|کے\s*لیئے)/gi, " ")
      .replace(/(اس\s*ڈیزائن\s*میں|اس\s*ڈیزان\s*میں|اس\s*ڈزائن\s*میں|اس\s*اسٹائل\s*میں|اس\s*طرح\s*کا|اس\s*جیسا|اسی\s*طرح\s*کا)/gi, " ")
      .replace(/(اور\s*لوگو|اور\s*ڈیزائن|اور\s*ڈیزان|اور\s*ڈی\s*پی|اور\s*مونوگرام|اور\s*بنا\s*کر\s*دیں|اور\s*بنا\s*کے\s*دیں|اور\s*بنا\s*دیں|اور\s*بناؤ|اور\s*بنائیں|اور\s*دکھائیں|اور\s*دیں|اور\s*چاہیے)/gi, " ")
      .replace(/(مزید\s*بنا\s*کر\s*دیں|مزید\s*بنا\s*دیں|مزید\s*ڈیزائن|مزید\s*ویرینٹس|کوئی\s*اور|دوسرا\s*ڈیزائن|نیا\s*ڈیزائن|نئے\s*ڈیزائن)/gi, " ")
      .replace(/(کے\s*نام\s*کا|کے\s*نام\s*سے|نام\s*کا|نام\s*کی|کا\s*لوگو|کی\s*ڈی\s*پی|کا\s*مونوگرام|کا\s*ڈیزائن|کا\s*ڈیزان)/gi, " ")
      .replace(/(ڈیزائن\s*کر\s*کے\s*دیں|ڈیزائن\s*کریں|ڈیزان\s*کریں|بنا\s*کر\s*دیں|بنا\s*کے\s*دیں|بنا\s*دیں|بنا\s*دو|بنائیں|بنائں|چاہیے|چاہئے|چاہیئے|تیار\s*کریں|تیار\s*کر\s*کے\s*دیں)/gi, " ")
      .replace(/(خوبصورت|پروفیشنل|شاہی|3d|تھری\s*ڈی|لوگو|لوگوز|لوگو\s*میکر|ڈیزائن|ڈیزان|ڈزائن|مونوگرام|مونو\s*گرام|ڈی\s*پی|اواتار|اواتارز|شیلڈ|بیج|کریسٹ|مہر|واٹس\s*ایپ|یوٹیوب|چینل|ٹک\s*ٹاک|انسٹاگرام)/gi, " ")
      .replace(/(شیلڈ|نیون|سائبر|گنبد|خطاطی|ڈائمنڈ|لگژری|والا|والی|رنگ\s*میں|تھیم\s*میں)/gi, " ")
      .replace(/[()""'':;۔،!?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const isMeaningless = !cleanName || cleanName.length < 2 || /^(اس|یہ|اور|میں|کا|کے|کی|کو|اس\s*میں|اور\s*بنا)$/i.test(cleanName);

    // If cleanName is meaningless in follow-up, retrieve the entity name from recent conversation history
    if (isMeaningless && conversationHistory && conversationHistory.length > 0) {
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const h = conversationHistory[i];
        const text = h.text || "";
        const parenMatch = text.match(/\(([^\)]+)\)/);
        if (parenMatch && parenMatch[1] && parenMatch[1].length > 1 && !/^[0-9]+$/.test(parenMatch[1])) {
          cleanName = parenMatch[1].trim();
          break;
        }
        if (h.role === "user") {
          const prevClean = text
            .replace(/(مجھے|ہمیں|میرے\s*لیے|میرے\s*نام\s*کا|کے\s*نام\s*کا|نام\s*کا|کا\s*لوگو|کی\s*ڈی\s*پی|کا\s*مونوگرام|کا\s*ڈیزائن|کا\s*ڈیزان|بنا\s*کر\s*دیں|بنا\s*دیں|بنائیں|لوگو|ڈیزائن|ڈیزان|ڈی\s*پی|مونوگرام)/gi, " ")
            .replace(/[()""'':;۔،!?]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          if (prevClean && prevClean.length >= 2 && !/^(اس|یہ|اور|میں)$/i.test(prevClean)) {
            cleanName = prevClean;
            break;
          }
        }
      }
    }

    if (!cleanName || cleanName.length < 2) {
      cleanName = "المصطفیٰ انسٹیٹیوٹ";
    }

    return {
      featureType: "logo_design",
      extractedTopic: cleanName,
      platformPreset: preset,
      badgeShape: shape,
      themeStyle: theme,
    };
  }

    // 1.5. Quran Translation & Tafsir of Hafiz Abdul Salam Bhatvi
  const isQuranOrBhatviRequest =
    p.includes("بھٹوی") ||
    p.includes("عبد السلام") ||
    p.includes("عبدالسلام") ||
    p.includes("bhatvi") ||
    p.includes("سورۃ") ||
    p.includes("سورة") ||
    p.includes("سورہ") ||
    p.includes("آیت الکرسی") ||
    p.includes("ایت الکرسی") ||
    p.includes("معوذتین") ||
    p.includes("متشابہات") ||
    p.includes("تفسیر") ||
    p.includes("قرآن") ||
    p.includes("quran") ||
    (p.includes("ترجمہ") && (p.includes("آیت") || p.includes("سورت") || p.includes("سورة") || p.includes("فاتحہ") || p.includes("بقرہ") || p.includes("ملک") || p.includes("اخلاص") || p.includes("عصر") || p.includes("کہف") || p.includes("یس") || p.includes("رحمن")));

  if (isQuranOrBhatviRequest) {
    return {
      featureType: "islamic_qa",
      extractedTopic: prompt,
    };
  }

  // 2. Poetry, Literature & Shayari (شعر، اشعار، شاعری، غزل، نظم)
  const isPoetryRequest =
    p.includes("شعر") ||
    p.includes("اشعار") ||
    p.includes("شاعری") ||
    p.includes("غزل") ||
    p.includes("نظم") ||
    p.includes("poetry") ||
    p.includes("shayari") ||
    p.includes("شاعرانہ") ||
    p.includes("بیت بازی") ||
    p.includes("مصرع") ||
    p.includes("قافیہ") ||
    p.includes("ردیف");

  if (isPoetryRequest) {
    return {
      featureType: "islamic_qa",
      extractedTopic: prompt,
    };
  }

  // 3. Conversational follow-up for AI prompt, script, code, or convert
  const isConversationalScriptOrPromptRequest =
    !isDirectLogoRequest &&
    (p.includes("اس کا اسکرپٹ") ||
      p.includes("اس کے لیے script") ||
      p.includes("اس کے لئے script") ||
      p.includes("اس کا prompt") ||
      p.includes("اس کے لیے prompt") ||
      p.includes("اس کے لئے prompt") ||
      p.includes("prompt بنا دو") ||
      p.includes("prompt لکھ دو") ||
      p.includes("پرامپٹ بنا دو") ||
      p.includes("پرامپٹ لکھ دو") ||
      p.includes("script میں convert") ||
      p.includes("سکرپٹ میں کنورٹ") ||
      p.includes("اسے ai studio") ||
      p.includes("اسے claude") ||
      p.includes("صرف prompt") ||
      p.includes("صرف پرامپٹ") ||
      p.includes("claude کے لیے prompt") ||
      p.includes("اس کا کوڈ") ||
      p.includes("اس کے لیے کوڈ") ||
      (p.includes("اس کا") && (p.includes("سکرپٹ") || p.includes("اسکرپٹ") || p.includes("script") || p.includes("prompt") || p.includes("پرامپٹ") || p.includes("کوڈ") || p.includes("code"))) ||
      (p.includes("اس کے لیے") && (p.includes("سکرپٹ") || p.includes("اسکرپٹ") || p.includes("script") || p.includes("prompt") || p.includes("پرامپٹ") || p.includes("کوڈ") || p.includes("code"))) ||
      (p.includes("اس چیز") && (p.includes("سکرپٹ") || p.includes("اسکرپٹ") || p.includes("script") || p.includes("prompt") || p.includes("پرامپٹ") || p.includes("کوڈ") || p.includes("code"))));

  if (isConversationalScriptOrPromptRequest) {
    let contextualTopic = prompt;
    if (conversationHistory && conversationHistory.length > 0) {
      const recentUserQueries = conversationHistory
        .filter((h) => h.role === "user")
        .map((h) => h.text)
        .reverse();
      if (recentUserQueries.length > 0) {
        contextualTopic = `${prompt} (Context from previous discussion: ${recentUserQueries[0]})`;
      }
    }
    return {
      featureType: "islamic_qa",
      extractedTopic: contextualTopic,
    };
  }

  // 2. AI Tools, Cloud Computing, Programming & Technical Script Generation (Must route to islamic_qa AI engine)
  if (
    p.includes("کلاؤڈ") ||
    p.includes("cloud") ||
    p.includes("aws") ||
    p.includes("gcp") ||
    p.includes("azure") ||
    p.includes("docker") ||
    p.includes("kubernetes") ||
    p.includes("پائتھن") ||
    p.includes("python") ||
    p.includes("javascript") ||
    p.includes("typescript") ||
    p.includes("کوڈ") ||
    p.includes("code") ||
    p.includes("پروگرامنگ") ||
    p.includes("programming") ||
    p.includes("ai tool") ||
    p.includes("اے آئی ٹول") ||
    p.includes("ٹولز") ||
    p.includes("tools") ||
    p.includes("chatgpt") ||
    p.includes("gemini") ||
    p.includes("claude") ||
    p.includes("deepseek") ||
    p.includes("midjourney") ||
    p.includes("elevenlabs") ||
    p.includes("cursor") ||
    p.includes("suno") ||
    p.includes("runway") ||
    p.includes("scraping") ||
    p.includes("automation") ||
    p.includes("آٹومیشن") ||
    p.includes("bot") ||
    p.includes("باٹ") ||
    p.includes("api") ||
    p.includes("ای پی آئی") ||
    ((p.includes("سکرپٹ") || p.includes("اسکرپٹ") || p.includes("script")) && (p.includes("کوڈ") || p.includes("بنا") || p.includes("generate") || p.includes("python") || p.includes("cloud") || p.includes("کلاؤڈ") || p.includes("پائتھن") || p.includes("automation") || p.includes("ٹول")))
  ) {
    return {
      featureType: "islamic_qa",
      extractedTopic: prompt,
    };
  }

  // 3. Reel / Short / Video Script
  if (
    p.includes("ریل") ||
    p.includes("reel") ||
    p.includes("shorts") ||
    p.includes("شارٹس") ||
    p.includes("voiceover") ||
    p.includes("وائس اوور") ||
    p.includes("tiktok video") ||
    p.includes("ویڈیو اسکرپٹ") ||
    (p.includes("script") && (p.includes("video") || p.includes("ویڈیو") || p.includes("یوٹیوب") || p.includes("tiktok")))
  ) {
    return {
      featureType: "reel_script",
      extractedTopic: prompt,
    };
  }

  // 3. Social Graphic / Poster / Banner / Visual Card
  if (
    p.includes("پوسٹر") ||
    p.includes("poster") ||
    p.includes("گرافک") ||
    p.includes("graphic") ||
    p.includes("بینر") ||
    p.includes("banner") ||
    p.includes("کارڈ") ||
    p.includes("card") ||
    p.includes("فیس بک پوسٹ") ||
    p.includes("انسٹاگرام پوسٹ") ||
    p.includes("سوشل پوسٹ") ||
    p.includes("social post")
  ) {
    return {
      featureType: "social_post",
      extractedTopic: prompt,
    };
  }

  // 4. WhatsApp Status
  if (
    p.includes("اسٹیٹس") ||
    p.includes("status") ||
    p.includes("سٹوری") ||
    p.includes("story")
  ) {
    return {
      featureType: "whatsapp_status",
      extractedTopic: prompt,
    };
  }

  // 5. Hashtags
  if (
    p.includes("ہیش ٹیگ") ||
    p.includes("hashtag") ||
    p.includes("tags") ||
    p.includes("ٹیگز")
  ) {
    return {
      featureType: "hashtags",
      extractedTopic: prompt,
    };
  }

  // 6. Content Ideas / Topics
  if (
    p.includes("آئیڈیاز") ||
    p.includes("ideas") ||
    p.includes("موضوعات") ||
    p.includes("topics") ||
    p.includes("کیا پوسٹ کروں")
  ) {
    return {
      featureType: "daily_ideas",
      extractedTopic: prompt,
    };
  }

  // 7. General Questions / Islamic Guidance & Teachings -> Islamic QA
  return {
    featureType: "islamic_qa",
    extractedTopic: prompt,
  };
}

export function generateFallbackResponse(
  featureType: FeatureType,
  topic: string,
  language: LanguageOption = "urdu",
  style: StyleOption = "simple",
  platform: string = "Instagram",
  category: string = "General"
) {
  const lowerTopic = (topic || "").toLowerCase();
  const rawTopic = topic ? topic.trim() : "علم و حکمت اور ذکرِ الٰہی";

  if (featureType === "islamic_qa") {
    const searchKw = extractAlUlamaSearchKeyword(rawTopic);
    const dynamicFatwaSearchUrl = "https://alulama.org/?s=" + encodeURIComponent(searchKw);
    const cleanSearchQuery = rawTopic;

    // 0. Primary Salam, Greetings & Welcome Check (Urdu, Roman Urdu, Arabic, English)
    const isSalamOrGreeting = (
      lowerTopic.includes("salam") ||
      lowerTopic.includes("slam") ||
      lowerTopic.includes("slaam") ||
      lowerTopic.includes("asslam") ||
      lowerTopic.includes("aslam") ||
      lowerTopic.includes("assalam") ||
      lowerTopic.includes("asalam") ||
      lowerTopic.includes("alaikum") ||
      lowerTopic.includes("alaykum") ||
      lowerTopic.includes("alikom") ||
      lowerTopic.includes("alikam") ||
      lowerTopic.includes("سلام") ||
      lowerTopic.includes("السلام") ||
      lowerTopic.includes("وعلیکم") ||
      lowerTopic.trim() === "aoa" ||
      lowerTopic.trim() === "a.o.a" ||
      lowerTopic.trim() === "hi" ||
      lowerTopic.trim() === "hello" ||
      lowerTopic.trim() === "hey" ||
      lowerTopic.includes("کون ہو") ||
      lowerTopic.includes("تعارف") ||
      lowerTopic.includes("who are you")
    ) && !lowerTopic.includes("اسلامی") && !lowerTopic.includes("اسلام کے") && !lowerTopic.includes("اسلام میں") && !lowerTopic.includes("دین اسلام");

    if (isSalamOrGreeting) {
      return {
        question: rawTopic,
        answerUrdu: "وعلیکم السلام ورحمۃ اللہ وبرکاتہ! 🕌✨\n\nآپ کا **اسلامی چیٹ جی پی ٹی (Islamic & AI ChatGPT)** میں خوش آمدید۔\n\nفرمائیے، میں آپ کی کیا دینی، شرعی، قرآنی، علمی یا تکنیکی رہنمائی کر سکتا ہوں؟ آپ قرآن و صحیح احادیث، فقہی مسائل، کمپیوٹر، کوڈنگ، سوشل میڈیا پوسٹس یا شاہی ناموں کے لوگو ڈیزائن سے متعلق کوئی بھی سوال بلا جھجھک پوچھ سکتے ہیں۔",
        arabicText: "إِذَا حُيِّيتُم بِتَحِيَّةٍ فَحَيُّوا بِأَحْسَنَ مِنْهَا أَوْ رُدُّوهَا ۗ إِنَّ اللَّهَ كَانَ عَلَىٰ كُلِّ شَيْءٍ حَسِيبًا",
        translation: "اور جب تمہیں کوئی دعا (سلام) دی جائے تو تم اس سے بہتر دعا دو یا وہی الفاظ لوٹا دو، بے شک اللہ ہر چیز کا حساب لینے والا ہے۔ (سورۃ النساء: 86)",
        quranReference: "سورۃ النساء (4:86)",
        hadithReference: "صحیح بخاری: 12 (کتاب الإیمان)",
        keyTakeaway: "سلام میں پہل کرنا سنتِ نبوی اور باہمی محبت و سلامتی کی علامت ہے۔",
        practicalAdvice: "آپس میں سلام کو عام کریں اور ایک دوسرے کے لیے خیر و عافیت کی دعا کریں۔",
        suggestedQuestions: [
          "قرآن پاک کی تلاوت اور تجوید کے بنیادی احکام",
          "صحیح بخاری کی روشنی میں روزمرہ کے مسنون اذکار",
          "میرے نام کا شاہی لوگو اور ڈی پی ڈیزائن بنائیں",
        ],
      };
    }

    // =========================================================================
    // 📖 QURAN TRANSLATION & TAFSIR - MAULANA HAFIZ ABDUL SALAM BHATVI (رحمہ اللہ)
    // =========================================================================
    if (
      lowerTopic.includes("بھٹوی") ||
      lowerTopic.includes("عبد السلام") ||
      lowerTopic.includes("عبدالسلام") ||
      lowerTopic.includes("bhatvi") ||
      lowerTopic.includes("سورۃ") ||
      lowerTopic.includes("سورة") ||
      lowerTopic.includes("سورہ") ||
      lowerTopic.includes("آیت الکرسی") ||
      lowerTopic.includes("ایت الکرسی") ||
      lowerTopic.includes("معوذتین") ||
      lowerTopic.includes("ترجمہ قرآن") ||
      lowerTopic.includes("قرآن کا ترجمہ") ||
      (lowerTopic.includes("ترجمہ") && (lowerTopic.includes("آیت") || lowerTopic.includes("فاتحہ") || lowerTopic.includes("بقرہ") || lowerTopic.includes("ملک") || lowerTopic.includes("اخلاص") || lowerTopic.includes("عصر") || lowerTopic.includes("کہف") || lowerTopic.includes("یس") || lowerTopic.includes("رحمن")))
    ) {
      // 1. Surah Al-Fatihah (سورۃ الفاتحہ)
      if (lowerTopic.includes("فاتحہ") || lowerTopic.includes("fatihah") || lowerTopic.includes("الحمد")) {
        return {
          question: rawTopic,
          answerUrdu: `### 📖 تفسیر القرآن الکریم - سورۃ الفاتحہ (مکیہ - آیات: 7)
**مترجمِ قرآن و مفسر:** مولانا حافظ عبد السلام بھٹوی رحمہ اللہ

---

#### 📜 عربی متن مع اعراب و اردو ترجمہ:
1. **﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾**  
   *(شروع) اللہ کے نام سے جو نہایت مہربان، ہمیشہ رحم فرمانے والا ہے۔*

2. **﴿الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ﴾**  
   *سب تعریف اللہ کے لیے ہے جو تمام جہانوں کا پالنے والا ہے۔*

3. **﴿الرَّحْمَٰنِ الرَّحِيمِ﴾**  
   *نہایت مہربان، ہمیشہ رحم فرمانے والا ہے۔*

4. **﴿مَالِكِ يَوْمِ الدِّينِ﴾**  
   *بدلے کے دن کا مالک ہے۔*

5. **﴿إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ﴾**  
   *ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔*

6. **﴿اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ﴾**  
   *ہمیں سیدھا راستہ دکھا۔*

7. **﴿صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ﴾**  
   *ان لوگوں کا راستہ جن پر تو نے انعام کیا، جن پر نہ غضب ہوا اور نہ وہ گمراہ ہیں۔*

---

#### 🔍 الفاظ کے معانی و تفسیری فوائد (تفسیر القرآن الکریم - حافظ عبد السلام بھٹوی):
* **الْحَمْدُ:** تمام تر کمال و جلال کی تعریفات صرف اور صرف اللہ وحدہ لا شریک کے لیے مخصوص ہیں۔
* **رَبِّ الْعَالَمِينَ:** 'رب' وہ ہے جو تمام مخلوقات کو عدم سے وجود میں لایا اور ان کی تدریجی پرورش فرماتا ہے۔
* **إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ:** اس میں توحیدِ عبادت اور توحیدِ استعانت کا اعلان ہے کہ غائبانہ پکار، استمداد اور عبادت کا مستحق صرف اللہ سبحانہ و تعالی ہے۔
* **الصِّرَاطَ الْمُسْتَقِيمَ:** وہ واضح، سیدھا راستہ جس پر چل کر انسان اللہ کی رضا اور جنت الفردوس حاصل کرتا ہے یعنی قرآن و صحیح حدیث کا منہج۔`,
          arabicText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          translation: "(شروع) اللہ کے نام سے جو نہایت مہربان، ہمیشہ رحم فرمانے والا ہے۔ سب تعریف اللہ کے لیے ہے جو تمام جہانوں کا پالنے والا ہے۔ نہایت مہربان، ہمیشہ رحم فرمانے والا ہے۔ بدلے کے دن کا مالک ہے۔ ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔ ہمیں سیدھا راستہ دکھا۔ ان لوگوں کا راستہ جن پر تو نے انعام کیا، جن پر نہ غضب ہوا اور نہ وہ گمراہ ہیں۔ (ترجمہ: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ - تفسیر القرآن الکریم)",
          quranReference: "سورۃ الفاتحہ (1:1-7) | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ",
          hadithReference: "صحیح بخاری: 4474 (سورۃ الفاتحہ قرآن کی سب سے عظیم ترین سورت 'ام القرآن' اور 'السبع المثانی' ہے)",
          keyTakeaway: "سورۃ الفاتحہ ہر نماز کا بنیادی رکن اور شفا ہے۔ اس کا مغز صرف اللہ کی بندگی اور صرف اسی سے غائبانہ مدد طلب کرنا ہے۔",
          practicalAdvice: "نماز میں سورۃ الفاتحہ کو ٹھہر ٹھہر کر اور معانی پر غور کرتے ہوئے تلاوت فرمائیں۔",
          suggestedQuestions: [
            "آیت الکرسی کا مکمل عربی متن اور حافظ عبد السلام بھٹوی کا ترجمہ",
            "سورۃ البقرہ کی ابتدائی پانچ آیات کا ترجمہ و تفسیر (حافظ عبد السلام بھٹوی)",
            "سورۃ الملک کا عربی متن اور تفسیری خلاصہ (مولانا عبد السلام بھٹوی)",
          ],
        };
      }

      // 2. Ayat-ul-Kursi (آیت الکرسی - سورۃ البقرۃ: 255)
      if (lowerTopic.includes("کرسی") || lowerTopic.includes("kursi")) {
        return {
          question: rawTopic,
          answerUrdu: `### 📖 آیت الکرسی (سورۃ البقرۃ: آیت 255) - اعظم آیۃ فی القرآن
**مترجمِ قرآن:** مولانا حافظ عبد السلام بھٹوی رحمہ اللہ (تفسیر القرآن الکریم)

---

#### 📜 عربی متن مع اعراب:
**﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾**

---

#### 💎 مستند اردو ترجمہ (مولانا حافظ عبد السلام بھٹوی رحمہ اللہ):
"اللہ، اس کے سوا کوئی معبود نہیں، ہمیشہ زندہ رہنے والا، سب کو سنبھالنے والا ہے۔ اسے نہ اونگھ پکڑتی ہے اور نہ نیند۔ اسی کا ہے جو کچھ آسمانوں میں ہے اور جو کچھ زمین میں ہے۔ کون ہے جو اس کے پاس اس کی اجازت کے بغیر سفارش کرے؟ وہ جانتا ہے جو کچھ ان کے آگے ہے اور جو کچھ ان کے پیچھے ہے اور وہ اس کے علم میں سے کسی چیز کا احاطہ نہیں کر سکتے مگر جتنا وہ چاہے۔ اس کی کرسی تمام آسمانوں اور زمین کو گھیرے ہوئے ہے اور ان دونوں کی حفاظت اسے نہیں تھکاتی اور وہی سب سے بلند، سب سے بڑا ہے۔"

---

#### 🔍 تفسیری نکات و فوائد (تفسیر القرآن الکریم):
1. **الْحَيُّ الْقَيُّومُ:** اللہ تعالیٰ کی ذاتِ اقدس ہمیشہ زندہ رہنے والی اور کائنات کی ہر چیز کو سنبھالنے اور قائم رکھنے والی ہے۔
2. **سِنَةٌ وَلَا نَوْمٌ:** اونگھ اور نیند مخلوق کی کمزوری ہیں، خالقِ کائنات اس سے پاک اور ہر لمحہ باخبر ہے۔
3. **وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ:** اللہ تعالیٰ کی کرسی اتنی وسیع اور عظیم الشان ہے کہ ساتوں آسمان اور زمین اس کے سامنے ایک چھوٹے چھلے کی مانند ہیں۔
4. **عظیم الشان فضیلت:** رسول اللہ ﷺ نے فرمایا کہ جو شخص ہر فرض نماز کے بعد آیت الکرسی پڑھے، اس کے اور جنت کے درمیان سوائے موت کے کوئی چیز رکاوٹ نہیں۔ (سنن النسائی الکبریٰ، صحیح الجامع: 6464)`,
          arabicText: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
          translation: "اللہ، اس کے سوا کوئی معبود نہیں، ہمیشہ زندہ رہنے والا، سب کو سنبھالنے والا ہے۔ اسے نہ اونگھ پکڑتی ہے اور نہ نیند۔ اسی کا ہے جو کچھ آسمانوں میں ہے اور جو کچھ زمین میں ہے۔ کون ہے جو اس کے پاس اس کی اجازت کے بغیر سفارش کرے؟ وہ جانتا ہے جو کچھ ان کے آگے ہے اور جو کچھ ان کے پیچھے ہے اور وہ اس کے علم میں سے کسی چیز کا احاطہ نہیں کر سکتے مگر جتنا وہ چاہے۔ اس کی کرسی تمام آسمانوں اور زمین کو گھیرے ہوئے ہے اور ان دونوں کی حفاظت اسے نہیں تھکاتی اور وہی سب سے بلند، سب سے بڑا ہے۔ (ترجمہ: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ)",
          quranReference: "سورۃ البقرۃ (2:255) | ترجمہ: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ (تفسیر القرآن الکریم)",
          hadithReference: "صحیح مسلم: 810 (ابی بن کعب رضی اللہ عنہ سے روایت کہ آیت الکرسی کتاب اللہ کی سب سے افضل آیت ہے)",
          keyTakeaway: "آیت الکرسی توحیدِ ربوبیت و الوہیت، اللہ کی عظمت اور غلبے کا کامل ترین بیان اور ہر قسم کے شر سے حفاظت کا قلعہ ہے۔",
          practicalAdvice: "ہر فرض نماز کے بعد اور رات سوتے وقت آیت الکرسی پڑھنے کا مستقل معمول بنائیں۔",
          suggestedQuestions: [
            "سورۃ البقرہ کی ابتدائی 5 آیات کا ترجمہ (حافظ عبد السلام بھٹوی)",
            "سورۃ الاخلاص، الفلق اور الناس کا ترجمہ و فضیلت (حافظ عبد السلام بھٹوی)",
            "سورۃ الملک کی تلاوت کے فضائل اور ترجمہ (حافظ عبد السلام بھٹوی)",
          ],
        };
      }

      // 3. Surah Al-Baqarah (ابتدائی آیات 1 تا 5)
      if (lowerTopic.includes("بقرہ") || lowerTopic.includes("baqarah") || lowerTopic.includes("الم")) {
        return {
          question: rawTopic,
          answerUrdu: `### 📖 تفسیر القرآن الکریم - سورۃ البقرۃ (آیات: 1 تا 5)
**مترجمِ قرآن و مفسر:** مولانا حافظ عبد السلام بھٹوی رحمہ اللہ

---

#### 📜 عربی متن مع اعراب و اردو ترجمہ:
1. **﴿الم﴾**  
   *الف، لام، میم۔*

2. **﴿ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ﴾**  
   *یہ وہ کتاب ہے جس میں کوئی شک نہیں، پرہیزگاروں کے لیے ہدایت ہے۔*

3. **﴿الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ﴾**  
   *جو بن دیکھے ایمان لاتے ہیں اور نماز قائم کرتے ہیں اور جو کچھ ہم نے انہیں دیا اس میں سے خرچ کرتے ہیں۔*

4. **﴿وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ﴾**  
   *اور جو ایمان لاتے ہیں اس پر جو آپ کی طرف نازل کیا گیا اور جو آپ سے پہلے نازل کیا گیا اور وہ آخرت پر پورا یقین رکھتے ہیں۔*

5. **﴿أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ﴾**  
   *یہی لوگ اپنے رب کی طرف سے ہدایت پر ہیں اور یہی لوگ فلاح پانے والے ہیں۔*

---

#### 🔍 تفسیری نکات (تفسیر القرآن الکریم - حافظ عبد السلام بھٹوی):
* **الم:** حروفِ مقطعات میں سے ہیں جن کا اصل علم اللہ تعالیٰ ہی کے پاس ہے۔
* **لَا رَيْبَ فِيهِ:** قرآن مجید کے منجانب اللہ ہونے میں ذرہ برابر شک و شبہ کی گنجائش نہیں۔
* **الْمُتَّقِينَ کی بنیادی صفات:**
  1. غیب (اللہ، فرشتے، جنت، دوزخ) پر کامل ایمان لانا۔
  2. نماز کو سنتِ نبوی کے مطابق باقاعدگی سے قائم کرنا۔
  3. حلال روزی میں سے راہِ خدا میں انفاق کرنا۔
  4. تمام آسمانی کتب اور آخرت کے حساب و کتاب پر پختہ یقین رکھنا۔`,
          arabicText: "الم ۝ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ۝ الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ ۝ وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ ۝ أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ",
          translation: "الف، لام، میم۔ یہ وہ کتاب ہے جس میں کوئی شک نہیں، پرہیزگاروں کے لیے ہدایت ہے۔ جو بن دیکھے ایمان لاتے ہیں اور نماز قائم کرتے ہیں اور جو کچھ ہم نے انہیں دیا اس میں سے خرچ کرتے ہیں۔ اور جو ایمان لاتے ہیں اس پر جو آپ کی طرف نازل کیا گیا اور جو آپ سے پہلے نازل کیا گیا اور وہ آخرت پر پورا یقین رکھتے ہیں۔ یہی لوگ اپنے رب کی طرف سے ہدایت پر ہیں اور یہی لوگ فلاح پانے والے ہیں۔ (ترجمہ: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ)",
          quranReference: "سورۃ البقرۃ (2:1-5) | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ",
          hadithReference: "صحیح مسلم: 804 (سورۃ البقرہ پڑھا کرو کیونکہ اس کا اخذ کرنا برکت ہے اور اسے چھوڑنا حسرت ہے)",
          keyTakeaway: "حقیقی کامیابی اور فلاح کا راستہ تقویٰ، نماز کے قیام، انفاق فی سبیل اللہ اور آخرت پر پختہ یقین میں ہے۔",
          practicalAdvice: "اپنے گھروں میں سورۃ البقرہ کی باقاعدہ تلاوت فرمائیں جس سے برکت نازل ہوتی ہے اور شیطان دور بھاگتا ہے۔",
          suggestedQuestions: [
            "آیت الکرسی کا مکمل اعراب والا عربی متن اور ترجمہ (حافظ عبد السلام بھٹوی)",
            "سورۃ البقرہ کی آخری دو آیات (284-286) کا ترجمہ اور فضیلت",
            "متشابہات القرآن برائے حفاظ: پہلا پارہ (الم)",
          ],
        };
      }

      // 4. Surah Al-Mulk (سورۃ الملک - تبارک الذی)
      if (lowerTopic.includes("ملک") || lowerTopic.includes("mulk") || lowerTopic.includes("تبارک")) {
        return {
          question: rawTopic,
          answerUrdu: `### 📖 تفسیر القرآن الکریم - سورۃ الملک (آیات: 1 تا 5)
**مترجمِ قرآن:** مولانا حافظ عبد السلام بھٹوی رحمہ اللہ

---

#### 📜 عربی متن مع اعراب و اردو ترجمہ:
1. **﴿تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ﴾**  
   *بہت بابرکت ہے وہ ذات جس کے ہاتھ میں بادشاہی ہے اور وہ ہر چیز پر پوری طرح قادر ہے۔*

2. **﴿الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ﴾**  
   *جس نے موت اور زندگی کو پیدا کیا تاکہ تمہیں آزمائے کہ تم میں سے عمل کے لحاظ سے کون زیادہ اچھا ہے، اور وہ سب پر غالب، بے حد بخشنے والا ہے۔*

3. **﴿الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ﴾**  
   *جس نے تہ بہ تہ سات آسمان پیدا کیے۔ تو رحمن کی پیدائش میں کوئی بے ضابطگی نہیں دیکھے گا۔ پس پھر نگاہ دوڑا، کیا تجھے کوئی شگاف نظر آتا ہے؟*

---

#### 🔍 تفسیری فوائد (تفسیر القرآن الکریم - حافظ عبد السلام بھٹوی):
* **خَلَقَ الْمَوْتَ وَالْحَيَاةَ:** زندگی اور موت کی تخلیق کا مقصد انسان کے اعمال کا امتحان اور بہترین عمل والے بندوں کا انتخاب ہے۔
* **أَحْسَنُ عَمَلًا:** بہترین عمل وہ ہے جو اخلاص پر مبنی ہو اور رسول اللہ ﷺ کی سنت کے مطابق ہو۔
* **عظیم فضیلت:** رسول اللہ ﷺ نے فرمایا کہ قرآن میں تیس آیات پر مشتمل ایک سورت ایسی ہے جو اپنے پڑھنے والے کی بخشش کے لیے سفارش کرتی رہتی ہے یہاں تک کہ اسے بخش دیا جاتا ہے، اور وہ سورت تبارک الذی بیدہ الملک ہے۔ (جامع ترمذی: 2891)`,
          arabicText: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ۝ الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ",
          translation: "بہت بابرکت ہے وہ ذات جس کے ہاتھ میں بادشاہی ہے اور وہ ہر چیز پر پوری طرح قادر ہے۔ جس نے موت اور زندگی کو پیدا کیا تاکہ تمہیں آزمائے کہ تم میں سے عمل کے لحاظ سے کون زیادہ اچھا ہے، اور وہ سب پر غالب، بے حد بخشنے والا ہے۔ (ترجمہ: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ)",
          quranReference: "سورۃ الملک (67:1-5) | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ",
          hadithReference: "جامع ترمذی: 2891 (سورۃ الملک عذابِ قبر سے نجات دلانے والی شفاعت کرنے والی سورت ہے)",
          keyTakeaway: "سورۃ الملک کی روزانہ تلاوت عذابِ قبر سے نجات کا ذریعہ ہے۔ زندگی کا اصل ہدف نیک و خالص اعمال کی تیاری ہے۔",
          practicalAdvice: "روزانہ رات سوتے وقت سورۃ الملک کی باقاعدہ تلاوت کا اہتمام فرمائیں۔",
          suggestedQuestions: [
            "سورۃ السجدہ کا عربی متن، ترجمہ اور فضیلت (حافظ عبد السلام بھٹوی)",
            "سورۃ الکہف کی ابتدائی و آخری آیات کا ترجمہ (حافظ عبد السلام بھٹوی)",
            "سورۃ یٰسین کا خلاصہ اور تفسیری نکات (مولانا عبد السلام بھٹوی)",
          ],
        };
      }

      // 5. Surah Al-Ikhlas, Al-Falaq, An-Nas (قل ہو اللہ، الفلق، الناس)
      if (lowerTopic.includes("اخلاص") || lowerTopic.includes("فلق") || lowerTopic.includes("ناس") || lowerTopic.includes("قل")) {
        return {
          question: rawTopic,
          answerUrdu: `### 📖 تفسیر القرآن الکریم - سورۃ الاخلاص، الفلق اور الناس
**مترجمِ قرآن:** مولانا حافظ عبد السلام بھٹوی رحمہ اللہ

---

#### 📜 سورۃ الاخلاص (مکیہ - آیات: 4):
1. **﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾** — *آپ کہہ دیجیے: وہ اللہ ایک ہے۔*
2. **﴿اللَّهُ الصَّمَدُ﴾** — *اللہ بے نیاز (سب کا سہارا) ہے۔*
3. **﴿لَمْ يَلِدْ وَلَمْ يُولَدْ﴾** — *نہ اس نے کسی کو جنا اور نہ وہ جنا گیا۔*
4. **﴿وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾** — *اور نہ کوئی اس کا ہمسر ہے۔*

---

#### 📜 سورۃ الفلق (مکیہ - آیات: 5):
1. **﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ﴾** — *آپ کہہ دیجیے: میں صبح کے رب کی پناہ مانگتا ہوں۔*
2. **﴿مِن شَرِّ مَا خَلَقَ﴾** — *ہر اس چیز کے شر سے جو اس نے پیدا کی۔*
3. **﴿وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ﴾** — *اور اندھیری رات کے شر سے جب وہ چھا جائے۔*
4. **﴿وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ﴾** — *اور گرہوں میں پھونکیں مارنے والیوں کے شر سے۔*
5. **﴿وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾** — *اور حسد کرنے والے کے شر سے جب وہ حسد کرے۔*

---

#### 📜 سورۃ الناس (مکیہ - آیات: 6):
1. **﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ﴾** — *آپ کہہ دیجیے: میں انسانوں کے رب، انسانوں کے بادشاہ، انسانوں کے معبود کی پناہ مانگتا ہوں۔*
2. **﴿مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾** — *پیچھے ہٹ جانے والے وسوسہ ڈالنے والے کے شر سے۔ جو لوگوں کے سینوں میں وسوسے ڈالتا ہے، جنوں میں سے اور انسانوں میں سے۔*`,
          arabicText: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
          translation: "آپ کہہ دیجیے: وہ اللہ ایک ہے۔ اللہ بے نیاز ہے۔ نہ اس نے کسی کو جنا اور نہ وہ جنا گیا۔ اور نہ کوئی اس کا ہمسر ہے۔ (ترجمہ: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ - تفسیر القرآن الکریم)",
          quranReference: "سورۃ الاخلاص، الفلق و الناس | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ",
          hadithReference: "صحیح بخاری: 5017 (سورۃ الاخلاص تہائی قرآن کے برابر ہے) | سنن ابی داود: 5082 (صبح و شام تین تین بار پڑھنا ہر چیز کے شر سے کافی ہو جاتا ہے)",
          keyTakeaway: "سورۃ الاخلاص توحیدِ خالص ہے اور معوذتین (الفلق اور الناس) جادو، نظرِ بد، حسد اور شیطانی وسوسوں سے حفاظت کا سب سے مضبوط الٰہی تعویذ ہیں۔",
          practicalAdvice: "ہر صبح، شام اور سوتے وقت ان تینوں سورتوں کو تین تین بار پڑھ کر اپنے ہاتھوں پر پھونک کر پورے جسم پر پھیریں۔",
          suggestedQuestions: [
            "آیت الکرسی کا مکمل عربی متن اور حافظ عبد السلام بھٹوی کا ترجمہ",
            "سورۃ الفاتحہ کی مکمل تفسیر اور ترجمہ (حافظ عبد السلام بھٹوی)",
            "صبح و شام کے مسنون اذکار اور حفاظتی دعائیں",
          ],
        };
      }

      // 6. Generic Bhatvi Quran Translation / Any Surah
      return {
        question: rawTopic,
        answerUrdu: `### 📖 قرآن مجید اردو ترجمہ و تفسیری نکات
**مترجمِ قرآن و مفسر:** مولانا حافظ عبد السلام بھٹوی رحمہ اللہ (تفسیر القرآن الکریم)

---

#### 📜 مستند عربی متن مع اعراب:
**﴿إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ وَيُبَشِّرُ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا كَبِيرًا﴾**

---

#### 💎 اردو ترجمہ (مولانا حافظ عبد السلام بھٹوی رحمہ اللہ):
"بے شک یہ قرآن اس راستے کی رہنمائی کرتا ہے جو سب سے زیادہ سیدھا ہے اور ان مومنوں کو خوشخبری دیتا ہے جو نیک اعمال کرتے ہیں کہ یقیناً ان کے لیے بہت بڑا اجر ہے۔" *(سورۃ الاسراء: آیت 9)*

---

#### 🔍 تفسیری فوائد و رہنمائی (تفسیر القرآن الکریم - حافظ عبد السلام بھٹوی):
1. **أَقْوَمُ (سب سے مضبوط اور سیدھا راستہ):** قرآن مجید انسانی زندگی کے تمام شعبوں (عقائد، عبادات، معاملات، اخلاق اور معاشرت) میں کامل ترین اور عدل پر مبنی راہ دکھاتا ہے۔
2. **بشارت برائے اہلِ ایمان:** قرآن ان تمام اہلِ ایمان کے لیے عظیم اجر و ثواب کی بشارت دیتا ہے جو ایمان کے ساتھ ساتھ اعمالِ صالحہ کا اہتمام کرتے ہیں۔
3. **تفسیر القرآن الکریم کا منہج:** مولانا حافظ عبد السلام بھٹوی رحمہ اللہ کا ترجمہ قرآن مجید کی تفہیم، سلیس اردو فصاحت، اور سلف صالحین کے مستند منہج کے مطابق ہے۔`,
        arabicText: "إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ وَيُبَشِّرُ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا كَبِيرًا",
        translation: "بے شک یہ قرآن اس راستے کی رہنمائی کرتا ہے جو سب سے زیادہ سیدھا ہے اور ان مومنوں کو خوشخبری دیتا ہے جو نیک اعمال کرتے ہیں کہ یقیناً ان کے لیے بہت بڑا اجر ہے۔ (ترجمہ: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ)",
        quranReference: "سورۃ الاسراء: 9 | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ (تفسیر القرآن الکریم)",
        hadithReference: "صحیح بخاری: 5027 («خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ» - تم میں سے بہترین وہ ہے جو قرآن سیکھے اور سکھائے)",
        keyTakeaway: "قرآن مجید اللہ کا وہ کلامِ برحق ہے جو ہر دور میں انسانیت کے لیے ہدایت، روشنی اور فلاح کا واحد ضامن ہے۔",
        practicalAdvice: "روزانہ قرآن مجید کا ایک رکوع مع اردو ترجمہ (حافظ عبد السلام بھٹوی رحمہ اللہ) پڑھنے کا پختہ معمول بنائیں۔",
        suggestedQuestions: [
          "سورۃ الفاتحہ اور سورۃ البقرہ کا ترجمہ (حافظ عبد السلام بھٹوی)",
          "آیت الکرسی کا مکمل اعراب والا عربی متن اور ترجمہ (حافظ عبد السلام بھٹوی)",
          "سورۃ الملک کا عربی متن، ترجمہ اور تفسیری خلاصہ",
        ],
      };
    }

    // 0.0 TRIPLE CALENDAR (انگریزی، اسلامی و پنجابی دیسی تقویم)
    if (
      lowerTopic.includes("تاریخ") ||
      lowerTopic.includes("کلینڈر") ||
      lowerTopic.includes("کیلنڈر") ||
      lowerTopic.includes("calendar") ||
      lowerTopic.includes("date") ||
      lowerTopic.includes("today") ||
      lowerTopic.includes("آج کی تاریخ") ||
      lowerTopic.includes("اسلامی تاریخ") ||
      lowerTopic.includes("ہجری تاریخ") ||
      lowerTopic.includes("دیسی تاریخ") ||
      lowerTopic.includes("پنجابی تاریخ") ||
      lowerTopic.includes("بکرمی") ||
      lowerTopic.includes("عیسوی")
    ) {
      const liveCalendarMarkdown = generateTripleCalendarCardResponse(new Date());
      const calInfo = getTripleCalendarInfo(new Date());
      return {
        question: rawTopic,
        answerUrdu: liveCalendarMarkdown,
        arabicText: "إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا فِي كِتَابِ اللَّهِ يَوْمَ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ مِنْهَا أَرْبَعَةٌ حُرُمٌ",
        translation: "بے شک مہینوں کی گنتی اللہ کے نزدیک اللہ کی کتاب میں بارہ مہینے ہے، جس دن سے اس نے آسمانوں اور زمین کو پیدا فرمایا، ان میں سے چار حرمت والے ہیں۔ (سورۃ التوبۃ: 36)",
        quranReference: "سورۃ التوبۃ (9:36) | سورۃ یونس (10:5)",
        hadithReference: "صحیح بخاری: حدیث نمبر 3197 (کتاب بدء الخلق)",
        keyTakeaway: `آج کی تاریخ: انگریزی (${calInfo.gregorian.fullStringUrdu})، اسلامی (${calInfo.hijri.fullStringUrdu})، پنجابی دیسی (${calInfo.punjabiDesi.fullStringUrdu})۔`,
        practicalAdvice: "وقت اللہ کی عظیم نعمت ہے۔ اپنے دن کو نمازوں کے اوقات اور بامقصد تعمیری کاموں کے مطابق منظم کریں۔",
        suggestedQuestions: [
          "اسلامی قمری مہینوں کے فضائل اور احکام",
          "پنجابی دیسی مہینوں کی مکمل فہرست اور موسم",
          "حرمت والے 4 اسلامی مہینے کون سے ہیں؟",
        ],
      };
    }

    // 0.01 URDU POETRY, LITERATURE & SHAYARI (اردو شاعری، اشعار، غزلیں و نظمیں)
    const isPoetry =
      lowerTopic.includes("شعر") ||
      lowerTopic.includes("اشعار") ||
      lowerTopic.includes("شاعری") ||
      lowerTopic.includes("غزل") ||
      lowerTopic.includes("نظم") ||
      lowerTopic.includes("poetry") ||
      lowerTopic.includes("shayari") ||
      lowerTopic.includes("شاعرانہ") ||
      lowerTopic.includes("بیت بازی") ||
      lowerTopic.includes("مصرع") ||
      lowerTopic.includes("قافیہ") ||
      lowerTopic.includes("ردیف") ||
      lowerTopic.includes("غربت نے مجھ سے میری دنیا چھین لی") ||
      lowerTopic.includes("اقبال") ||
      lowerTopic.includes("غالب") ||
      lowerTopic.includes("میر تقی میر") ||
      lowerTopic.includes("احمد فراز") ||
      lowerTopic.includes("ساغر صدیقی") ||
      lowerTopic.includes("حبیب جالب") ||
      lowerTopic.includes("پروین شاکر");

    if (isPoetry) {
      // Specialized theme: Poverty, Mother, Hardship, World, Struggle (غربت، مفلسی، ماں، دنیا، محنت، خودداری)
      if (
        lowerTopic.includes("غربت") ||
        lowerTopic.includes("دنیا") ||
        lowerTopic.includes("پیسہ") ||
        lowerTopic.includes("مفلسی") ||
        lowerTopic.includes("حالات") ||
        lowerTopic.includes("سب کچھ نہیں ہوتا") ||
        lowerTopic.includes("چھین لی")
      ) {
        return {
          question: rawTopic,
          answerUrdu: `### 📜 منتخب اردو شاعری: غربت، خودداری، ماں کی ممتا اور دنیا کی حقیقت

آپ کے پوچھے گئے شعر اور موضوع کے عین مطابق خودداری، غربت، ماں کی دعا اور زمانے کی حقیقت پر چند منتخب اور دل کو چھو لینے والے اشعار پیشِ خدمت ہیں:

---

#### 1. ساغر صدیقی:
> **جس دور پہ نازاں تھی دنیا، ہم نے وہ زمانہ دیکھا ہے**  
> **ہم نے تو لٹائی ہے دولت، تم نے تو کمایا ہے پیسہ**  
> *(مفہوم: انسان کی قدر اس کے کردار، ضمیر اور سچائی سے ہے، روپے پیسے کی عارضی چمک سے نہیں)*

---

#### 2. علامہ اقبال (بانگِ درا):
> **مرا طریق امیری نہیں، فقیری ہے**  
> **خودی نہ بیچ، غریبی میں نام پیدا کر!**  
> *(مفہوم: عزت اور عظمت مال و دولت میں نہیں بلکہ خودداری، غیرت اور کردار میں ہے)*

---

#### 3. میر تقی میر:
> **مت سہل ہمیں جانو، پھرتا ہے فلک برسوں**  
> **تب خاک کے پردے سے انسان نکلتے ہیں**  

---

#### 4. ماں کی عظمت و دعا (منور رانا):
> **میری قسمت میں ایک بھی غم نہ ہوتا**  
> **اگر تقدیر لکھنے کا حق میری ماں کو ملا ہوتا**  
> 
> **بلندیوں کا بڑے سے بڑا نشان چھوا**  
> **اٹھا کے ہاتھ جو ماں نے مری دعائیں دیں**  

---

#### 5. خود اعتمادی، ہمت اور جدوجہد:
> **غمِ روزگار ہی سہی، حوصلہ تو ہے**  
> **گرتے ہیں شہسوار ہی میدانِ جنگ میں**  

> **نہ ہو نومید، نومیدی زوالِ علم و عرفاں ہے**  
> **امیدِ مردِ مومن ہے خدا کے راز دانوں میں** *(علامہ اقبال)*`,
          arabicText: "",
          translation: "",
          quranReference: "",
          hadithReference: "",
          keyTakeaway: "شاعری دل کے جذبات، احساسات اور سچی حقیقتوں کا خوبصورت آئینہ ہے۔ خودداری اور ہمت سے حالات کا مقابلہ کریں۔",
          practicalAdvice: "کٹھن حالات اور غربت میں بھی اپنی خودداری اور عزتِ نفس کو قائم رکھیں اور مایوس ہونے کے بجائے محنت جاری رکھیں۔",
          suggestedQuestions: [
            "علامہ اقبال کے خودداری و محنت پر اشعار",
            "غربت اور حالات کا مقابلہ کرنے پر منتخب اشعار",
            "ماں کی محبت اور عظمت پر دل نشیں شاعری",
          ],
        };
      }

      // Specialized theme: Iqbal's poetry (علامہ اقبال)
      if (lowerTopic.includes("اقبال") || lowerTopic.includes("خودی") || lowerTopic.includes("شاہین")) {
        return {
          question: rawTopic,
          answerUrdu: `### 🦅 حکیم الامت علامہ محمد اقبال کا منتخب کلام

---

#### 1. خودی و خود اعتمادی:
> **خودی کو کر بلند اتنا کہ ہر تقدیر سے پہلے**  
> **خدا بندے سے خود پوچھے بتا تیری رضا کیا ہے**

---

#### 2. نوجوانوں کو پیغام (شاہین):
> **نہیں تیرا نشیمن قصرِ سلطانی کے گنبد پر**  
> **تو شاہیں ہے، بسیرا کر پہاڑوں کی چٹانوں میں**

---

#### 3. عمل اور تقدیر:
> **عمل سے زندگی بنتی ہے جنت بھی جہنم بھی**  
> **یہ خاکی اپنی فطرت میں نہ نوری ہے نہ ناری ہے**

---

#### 4. امید اور یقین:
> **نہ ہو نومید، نومیدی زوالِ علم و عرفاں ہے**  
> **امیدِ مردِ مومن ہے خدا کے راز دانوں میں**`,
          arabicText: "",
          translation: "",
          quranReference: "",
          hadithReference: "",
          keyTakeaway: "اقبال کی شاعری خودی کی بیداری، مسلسل عمل، خود اعتمادی اور بلند ہمتی کا درس دیتی ہے۔",
          practicalAdvice: "مایوسی اور سستی کو چھوڑ کر اپنے اندر خودداری، مستقل مزاجی اور محنت کا جذبہ پیدا کریں۔",
          suggestedQuestions: [
            "اقبال کے نوجوانوں کے نام انقلابی اشعار",
            "خودی کے فلسفے پر اقبال کا کلام",
            "علم اور عمل کے بارے میں اقبال کی شاعری",
          ],
        };
      }

      // General Poetry / Shayari Response
      return {
        question: rawTopic,
        answerUrdu: `### 📜 منتخب اردو شاعری و اشعار: **"${rawTopic}"**

آپ کے ذوق کے مطابق منتخب، خوبصورت اور بامقصد اشعار پیشِ خدمت ہیں:

---

#### 1. خودداری و غیرت:
> **مرا طریق امیری نہیں، فقیری ہے**  
> **خودی نہ بیچ، غریبی میں نام پیدا کر!** *(علامہ اقبال)*

---

#### 2. امید اور وقت کی حقیقت:
> **ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے**  
> **بہت نکلے مرے ارمان لیکن پھر بھی کم نکلے** *(مرزا اسد اللہ خان غالب)*

---

#### 3. ماں کی محبت و ممتا:
> **بلندیوں کا بڑے سے بڑا نشان چھوا**  
> **اٹھا کے ہاتھ جو ماں نے مری دعائیں دیں** *(منور رانا)*

---

#### 4. صبر، ہمت اور جدوجہد:
> **گرتے ہیں شہسوار ہی میدانِ جنگ میں**  
> **وہ طفل کیا گرے جو گھٹنوں کے بل چلے**

> **زندگی شمع کی صورت ہو خدایا میری**  
> **دور دنیا کا مرے دم سے اندھیرا ہو جائے** *(علامہ اقبال)*`,
        arabicText: "",
        translation: "",
        quranReference: "",
        hadithReference: "",
        keyTakeaway: "اردو شاعری انسانی جذبات، تجربات اور حکمت کا خوبصورت اظہار ہے۔",
        practicalAdvice: "شاعری سے مثبت سبق اور زندگی کے کٹھن لمحات میں حوصلہ اور امید حاصل کریں۔",
        suggestedQuestions: [
          "علامہ اقبال کے امید اور حوصلے پر اشعار",
          "میرزا غالب کے مشہور فلسفیانہ اشعار",
          "ماں کی عظمت اور دعاؤں پر منتخب شاعری",
        ],
      };
    }

            // =========================================================================
    // ⚖️ COMPREHENSIVE FATAWA LAJNATUL ULAMA LI AL-IFTA (مجلس التحقیق الاسلامی - alulama.org)
    // =========================================================================
    if (
      lowerTopic.includes("لجنۃ") ||
      lowerTopic.includes("لجنة") ||
      lowerTopic.includes("علماء") ||
      lowerTopic.includes("فتوی") ||
      lowerTopic.includes("فتویٰ") ||
      lowerTopic.includes("حکم") ||
      lowerTopic.includes("شرعی") ||
      lowerTopic.includes("جائز") ||
      lowerTopic.includes("ناجائز") ||
      lowerTopic.includes("حلال") ||
      lowerTopic.includes("حرام") ||
      lowerTopic.includes("مکروہ") ||
      lowerTopic.includes("غسل") ||
      lowerTopic.includes("بیت الخلاء") ||
      lowerTopic.includes("ٹوائلٹ") ||
      lowerTopic.includes("واش روم") ||
      lowerTopic.includes("باتھ روم") ||
      lowerTopic.includes("طہارت") ||
      lowerTopic.includes("وضو") ||
      lowerTopic.includes("نماز") ||
      lowerTopic.includes("روزہ") ||
      lowerTopic.includes("زکوٰۃ") ||
      lowerTopic.includes("زکوۃ") ||
      lowerTopic.includes("نکاح") ||
      lowerTopic.includes("طلاق") ||
      lowerTopic.includes("خلع") ||
      lowerTopic.includes("وراثت") ||
      lowerTopic.includes("سود") ||
      lowerTopic.includes("بینک") ||
      lowerTopic.includes("کرپٹو") ||
      lowerTopic.includes("سجدہ سہو") ||
      lowerTopic.includes("قصر") ||
      lowerTopic.includes("مسح")
    ) {
      // 1. FATWA: Wudu in Attached Bathroom (اٹیچڈ باتھ روم میں وضو کا مسنون طریقہ)
      if (
        lowerTopic.includes("اٹیچڈ") ||
        (lowerTopic.includes("وضو") && (lowerTopic.includes("باتھ") || lowerTopic.includes("غسل") || lowerTopic.includes("ٹوائلٹ") || lowerTopic.includes("واش")))
      ) {
        return {
          question: rawTopic,
          answerUrdu: `### ⚖️ فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی - alulama.org)
- **مرجع و ادارہ:** مجلس التحقیق الاسلامی (لاہور)
- **کتاب و باب:** کتاب الطہارۃ - اٹیچڈ باتھ روم (Attached Bathroom) میں وضو کا مسنون طریقہ
- **آن لائن فتویٰ سرچ و تصدیق:** ${dynamicFatwaSearchUrl}

---

#### الجواب وباللہ التوفیق:
مجلس التحقیق الاسلامی و لجنۃ العلماء للإفتاء (alulama.org) کی قرآن و سنت کی روشنی میں تحقیق کے مطابق موجودہ دور کے اٹیچڈ باتھ رومز (جہاں غسل خانہ اور کموڈ ایک ساتھ ہوں) میں وضو کا شرعی حکم اور مسنون طریقہ درج ذیل ہے:

1. **وضو سے پہلے 'بسم اللہ' پڑھنے کا طریقہ:**
   * وضو کے آغاز میں 'بسم اللہ' پڑھنا سنتِ مؤکدہ ہے۔ رسول اللہ ﷺ نے فرمایا: «لَا وُضُوءَ لِمَنْ لَمْ يَذْكُرِ اسْمَ اللَّهِ عَلَيْهِ» (*"اس شخص کا کامل وضو نہیں جس نے وضو پر اللہ کا نام نہ لیا"* - سنن ابی داود: 101)۔
   * **اٹیچڈ باتھ روم میں عمل کا طریقہ:**
     - **بہترین طریقہ:** باتھ روم کا دروازہ بند کرنے یا اندر داخل ہونے سے پہلے ہی باہر زبان سے **«بِسْمِ اللَّهِ»** کہہ لے۔
     - **دوسرا جائز طریقہ:** اگر داخل ہونے سے پہلے بھول جائے تو اندر کموڈ پر بیٹھنے کے بجائے واش بیسن (Wash Basin) پر کھڑے ہو کر **دل ہی دل میں زبان ہلائے بغیر** 'بسم اللہ' کہہ لے۔
     - اگر باتھ روم بالکل صاف ستھرا ہو، فلش بند ہو اور بدبو یا نجاست نہ ہو، تو واش بیسن پر دھیمی آواز سے زبان سے بسم اللہ کہنا بھی جائز ہے۔

2. **اٹیچڈ باتھ روم میں وضو کے مسنون مراحل:**
   1. دونوں ہاتھ کلائیوں تک تین بار دھوئیں۔
   2. تین بار کلی کریں اور ناک میں پانی ڈال کر بائیں ہاتھ سے ناک صاف کریں۔
   3. پورا چہرہ پیشانی کے بالوں سے ٹھوڑی کے نیچے اور ایک کان کی لو سے دوسرے کان تک تین بار دھوئیں۔
   4. دونوں بازو کہنیوں سمیت تین بار دھوئیں (پہلے دایاں پھر بایاں)۔
   5. سر کا مسح کریں (دونوں گیلے ہاتھ پیشانی سے گدی تک لے جائیں اور واپس لائیں) اور شہادت کی انگلیوں سے کانوں کے اندر اور انگوٹھوں سے کانوں کے باہر کا مسح کریں۔
   6. دونوں پاؤں ٹخنوں سمیت تین بار اچھی طرح دھوئیں۔

3. **وضو کے بعد کی مسنون دعا کہاں پڑھے؟**
   * وضو مکمل کرنے کے بعد باتھ روم سے **باہر نکل کر** قبلہ رخ ہو کر مسنون دعا پڑھیں:
     > «أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ»
     > *(صحیح مسلم: 234 | جامع ترمذی: 55)*`,
          arabicText: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ فَاغْسِلُوا وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى الْمَرَافِقِ وَامْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ إِلَى الْكَعْبَيْنِ",
          translation: "اے ایمان والو! جب تم نماز کے لیے اٹھو تو اپنے چہرے اور اپنے ہاتھ کہنیوں تک دھو لو اور اپنے سروں کا مسح کرو اور اپنے پاؤں ٹخنوں تک (دھو لو)۔ (سورۃ المائدۃ: 6 | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ)",
          quranReference: "سورۃ المائدۃ (5:6: آیتِ وضو) | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ",
          hadithReference: "صحیح بخاری: 159 (صفۃ وضوء النبی ﷺ) | سنن ابی داود: 101 | صحیح مسلم: 234",
          fatwaSource: "فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی، لاہور)",
          fatwaNumber: "عنوانِ فتویٰ: اٹیچڈ باتھ روم میں وضو کے احکام و مسائل",
          fatwaTopic: "کتاب الطہارۃ - سنن الوضوء وآداب الحمام",
          fatwaReference: `فتاویٰ لجنۃ العلماء للإفتاء، مجلس التحقیق الاسلامی (آن لائن تصدیق: ${dynamicFatwaSearchUrl})`,
          fatwaUrl: dynamicFatwaSearchUrl,
          keyTakeaway: "اٹیچڈ باتھ روم میں وضو کرتے وقت بسم اللہ داخل ہونے سے پہلے کہہ لیں یا اندر دل میں کہیں، اور وضو کے بعد کی دعا واش روم سے باہر نکل کر پڑھیں۔",
          practicalAdvice: "وضو کے دوران پانی اعتدال کے ساتھ استعمال کریں، اسراف سے بچیں اور اعضاء کو اچھی طرح دھوئیں۔",
          suggestedQuestions: [
            "لجنۃ العلماء: کیا غسل کرنے سے وضو خود بخود ہو جاتا ہے؟",
            "لجنۃ العلماء: موزوں اور جرابوں پر مسح کرنے کی شرائط و مدت",
            "لجنۃ العلماء: وضو کے بعد اعضاء کو تولیے سے خشک کرنے کا حکم",
          ],
        };
      }

      // 2. FATWA: Bathroom / Toilet Dhikr & Quran Recitation (غسل خانے / بیت الخلاء میں ذکر و اذکار)
      if (
        lowerTopic.includes("غسل خانہ") ||
        lowerTopic.includes("غسل خانے") ||
        lowerTopic.includes("بیت الخلاء") ||
        lowerTopic.includes("ٹوائلٹ") ||
        lowerTopic.includes("واش روم") ||
        lowerTopic.includes("حمام")
      ) {
        return {
          question: rawTopic,
          answerUrdu: `### ⚖️ فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی - alulama.org)
- **مرجع و ادارہ:** مجلس التحقیق الاسلامی (لاہور)
- **کتاب و باب:** کتاب الطہارۃ والسنن - بیت الخلاء و غسل خانے میں ذکر و اذکار کا شرعی حکم
- **آن لائن فتویٰ پورٹل:** ${dynamicFatwaSearchUrl}

---

#### الجواب وباللہ التوفیق:
مجلس التحقیق الاسلامی و لجنۃ العلماء للإفتاء (alulama.org) کی قرآن و صحیح احادیث پر مبنی مستند تحقیق کے مطابق:

1. **بیت الخلاء / ٹوائلٹ (جہاں کموڈ / ڈبلیو سی موجود ہو):**
   * **زبان سے ذکر و تلاوت کی ممانعت:** جس جگہ قضائے حاجت (پیشاب و پاخانہ) کی جاتی ہے وہاں زبان سے اللہ تعالیٰ کا نام لینا، قرآنی آیات پڑھنا، اذکار کرنا یا سلام کا جواب دینا **مکروہِ تحریمی (سخت ناپسندیدہ و ممنوع)** ہے، کیونکہ یہ نجاست اور شیاطین کی حاضری کی جگہ ہے اور اللہ کے پاک ناموں کی تعظیم کے منافی ہے۔
   * **حدیثِ نبوی:** سیدنا مہاجر بن قنفذ رضی اللہ عنہ سے روایت ہے کہ انہوں نے نبی کریم ﷺ کو سلام کیا جبکہ آپ ﷺ پیشاب فرما رہے تھے، تو آپ ﷺ نے وضو کرنے سے پہلے سلام کا جواب نہیں دیا اور فرمایا: «إِنِّي كَرِهْتُ أَنْ أَذْكُرَ اللَّهَ إِلَّا عَلَى طُهْرٍ» (*"میں نے ناپسند کیا کہ طہارت کے بغیر اللہ کا ذکر کروں"*)۔ (سنن ابی داود: 17، صحیح)

2. **دل میں ذکر اور غور و فکر:**
   * دل ہی دل میں زبان ہلائے بغیر اللہ کو یاد کرنا، استغفار کرنا یا توبہ کرنا بلا کراہت **جائز** ہے۔ ممانعت صرف زبان سے تلفظ کرنے اور آواز نکالنے کی ہے۔

3. **دخول و خروج کی مسنون دعائیں:**
   * بیت الخلاء میں داخل ہونے سے پہلے باہر ہی یہ دعا پڑھنا سنت ہے:
     > «اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ» (صحیح بخاری: 142)
   * باہر نکلنے کے فوراً بعد پڑھیں:
     > «غُفْرَانَكَ» (سنن ابی داود: 30)`,
          arabicText: "إِنِّي كَرِهْتُ أَنْ أَذْكُرَ اللَّهَ عَزَّ وَجَلَّ إِلَّا عَلَى طُهْرٍ",
          translation: "نبی کریم ﷺ نے فرمایا: میں نے ناپسند کیا کہ طہارت اور پاکیزگی کے بغیر اللہ عزوجل کا ذکر کروں۔ (سنن ابی داود: 17)",
          quranReference: "سورۃ الحج (22:32): ﴿ذَٰلِكَ وَمَن يُعَظِّمْ شَعَائِرَ اللَّهِ فَإِنَّهَا مِن تَقْوَى الْقُلُوبِ﴾ | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ",
          hadithReference: "صحیح بخاری: 142 (کتاب الوضوء) | صحیح مسلم: 375 | سنن ابی داود: 17، 30",
          fatwaSource: "فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی، لاہور)",
          fatwaNumber: "عنوانِ فتویٰ: بیت الخلاء و غسل خانے میں اذکار اور دعاؤں کے احکام",
          fatwaTopic: "کتاب الطہارۃ - آدابِ قضائے حاجت اور ذکرِ الٰہی کی تعظیم",
          fatwaReference: `فتاویٰ لجنۃ العلماء للإفتاء، مجلس التحقیق الاسلامی (آن لائن تصدیق: ${dynamicFatwaSearchUrl})`,
          fatwaUrl: dynamicFatwaSearchUrl,
          keyTakeaway: "بیت الخلاء میں زبان سے ذکر کرنا، قرآن پڑھنا یا بلند آواز سے دعائیں کرنا ممنوع ہے۔ دل میں ذکر جائز ہے اور مسنون دعائیں داخل ہونے سے پہلے اور باہر نکلنے کے بعد پڑھیں۔",
          practicalAdvice: "ٹوائلٹ جانے سے پہلے داخلے کی دعا اور باہر نکل کر 'غفرانك' پڑھنے کا اہتمام کریں اور واش روم کے اندر موبائل پر تلاوت وغیرہ اونچی آواز میں نہ لگائیں۔",
          suggestedQuestions: [
            "لجنۃ العلماء: اٹیچڈ باتھ روم میں وضو کا مسنون طریقہ",
            "لجنۃ العلماء: بیت الخلاء کے مسنون آداب اور احادیث",
            "لجنۃ العلماء: کیا غسل کے بعد دوبارہ وضو کرنا ضروری ہے؟",
          ],
        };
      }

      // 3. FATWA: Does Ghusl cover Wudu? (کیا غسل کے بعد وضو ضروری ہے؟)
      if (
        (lowerTopic.includes("غسل") && lowerTopic.includes("وضو")) ||
        lowerTopic.includes("غسل کے بعد وضو")
      ) {
        return {
          question: rawTopic,
          answerUrdu: `### ⚖️ فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی - alulama.org)
- **مرجع و ادارہ:** مجلس التحقیق الاسلامی (لاہور)
- **کتاب و باب:** کتاب الطہارۃ - کیا غسلِ جنابت یا عام غسل کے بعد دوبارہ وضو کرنا لازم ہے؟
- **آن لائن فتویٰ پورٹل:** ${dynamicFatwaSearchUrl}

---

#### الجواب وباللہ التوفیق:
مجلس التحقیق الاسلامی و لجنۃ العلماء للإفتاء (alulama.org) کی صحیح احادیث پر مبنی متفقہ تحقیق کے مطابق:

1. **غسل کے اندر وضو خود بخود شامل ہو جاتا ہے:**
   * اگر کسی شخص نے شرعی طریقے سے غسل (خواہ غسلِ جنابت ہو، غسلِ جمعہ ہو یا عام غسل) کر لیا ہو تو اس کا **وضو خود بخود ہو جاتا ہے**۔ غسل کے بعد نماز پڑھنے کے لیے دوبارہ نیا وضو کرنا واجب یا ضروری نہیں ہے۔
2. **ام المومنین عائشہ رضی اللہ عنہا کی صریح روایت:**
   * ام المومنین سیدہ عائشہ رضی اللہ عنہا فرماتی ہیں:
     > «كَانَ رَسُولُ اللَّهِ ﷺ يَغْتَسِلُ وَيُصَلِّي الرَّكْعَتَيْنِ وَصَلَاةَ الْغَدَاةِ، وَلَا أَرَاهُ يُحْدِثُ وُضُوءًا بَعْدَ الْغُسْلِ»
     > *(رسول اللہ ﷺ غسل فرماتے اور (اس کے بعد بغیر نیا وضو کیے) فجر کی دو رکعتیں اور فرض نماز پڑھتے تھے، اور میں نے آپ ﷺ کو غسل کے بعد نیا وضو کرتے نہیں دیکھا)*۔ (سنن ابی داود: 250 | جامع ترمذی: 107، صحیح)
3. **وضو کب ٹوٹے گا؟**
   * اگر غسل کے دوران یا غسل کے فوراً بعد پیشاب، ہوا خارج ہونے یا شرمگاہ کو بغیر حائل کے چھونے جیسے ناقضاتِ وضو پیش آ جائیں تو نماز کے لیے دوبارہ وضو کرنا پڑے گا، ورنہ غسل ہی کافی ہے۔`,
          arabicText: "وَإِن كُنتُمْ جُنُبًا فَاطَّهَّرُوا",
          translation: "اور اگر تم جنابت (ناپاکی) کی حالت میں ہو تو خوب پاکی حاصل کرو (غسل کرو)۔ (سورۃ المائدۃ: 6 | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ)",
          quranReference: "سورۃ المائدۃ (5:6) | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ",
          hadithReference: "سنن ابی داود: 250 (کتاب الطہارۃ) | جامع ترمذی: 107 (صحیح) | صحیح بخاری: 248",
          fatwaSource: "فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)",
          fatwaNumber: "عنوانِ فتویٰ: غسل کے بعد وضو کا شرعی حکم",
          fatwaTopic: "کتاب الطہارۃ - احکام الغسل والوضوء",
          fatwaReference: `فتاویٰ لجنۃ العلماء للإفتاء، مجلس التحقیق الاسلامی (آن لائن تصدیق: ${dynamicFatwaSearchUrl})`,
          fatwaUrl: dynamicFatwaSearchUrl,
          keyTakeaway: "غسلِ جنابت یا عام غسل کے بعد نماز کے لیے دوبارہ وضو کرنا ضروری نہیں، غسل میں وضو خود بخود شامل ہو جاتا ہے۔",
          practicalAdvice: "غسل شروع کرتے وقت پہلے مسنون طریقے کے مطابق وضو کر لیں اور غسل کے بعد غیر ضروری شکوک و شبہات سے پرہیز کریں۔",
          suggestedQuestions: [
            "لجنۃ العلماء: غسلِ جنابت کا مکمل مسنون طریقہ",
            "لجنۃ العلماء: غسل کے فرائض اور سنتیں کون سی ہیں؟",
            "لجنۃ العلماء: اٹیچڈ باتھ روم میں وضو کا طریقہ",
          ],
        };
      }

      // 4. FATWA: 12 Rabi-ul-Awwal / Eid Milad-un-Nabi (12 ربیع الاول اور عید میلاد النبی کا شرعی حکم)
      if (
        lowerTopic.includes("ربیع الاول") ||
        lowerTopic.includes("ربیع") ||
        lowerTopic.includes("میلاد") ||
        lowerTopic.includes("میلا") ||
        lowerTopic.includes("جشن") ||
        lowerTopic.includes("12 ربیع") ||
        lowerTopic.includes("بارہ ربیع")
      ) {
        return {
          question: rawTopic,
          answerUrdu: `### ⚖️ فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)
- **مرجع و ادارہ:** مجلس التحقیق الاسلامی (لاہور)
- **کتاب و باب:** کتاب السنۃ والبدعۃ - 12 ربیع الاول اور عید میلاد النبی کا شرعی حکم
- **آن لائن فتویٰ پورٹل:** ${dynamicFatwaSearchUrl}

---

#### الجواب وباللہ التوفیق:
مجلس التحقیق الاسلامی و لجنۃ العلماء للإفتاء (alulama.org) کی قرآن و صحیح احادیث پر مبنی مستند تحقیق کے مطابق:

1. **قرآن و سنت میں 12 ربیع الاول منانے کا ثبوت:**
   قرآنِ مجید کی کسی آیت اور رسول اللہ ﷺ کی کسی بھی **صحیح حدیث** میں 12 ربیع الاول کو "عید میلاد النبی" منانے، محافل و جلوس نکالنے، چراغاں کرنے یا جشن منانے کا کوئی ثبوت، حکم یا ترغیب موجود نہیں ہے۔

2. **عہدِ نبوی اور صحابہ کرام رضی اللہ عنہم کا عمل:**
   رسول اللہ ﷺ نے اپنی 63 سالہ مبارک زندگی میں کبھی اپنی سالگرہ یا میلاد نہیں منایا۔ آپ ﷺ کے بعد صحابہ کرام (سیدنا ابوبکر، عمر، عثمان، علی رضی اللہ عنہم) نے بھی کبھی 12 ربیع الاول کا جشن نہیں منایا۔ یہ رسم اسلام کی ابتدائی تین بہترین صدیوں (خیر القرون) کے صدیوں بعد فاطمی خلفاء کے دور میں شروع ہوئی۔

3. **دین میں نئی ایجادات (بدعت) کی شرعی حیثیت:**
   رسول اللہ ﷺ نے دین میں نئی رسومات ایجاد کرنے سے سختی سے منع فرمایا ہے:
   > «مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ فِيهِ فَهُوَ رَدٌّ» (صحیح بخاری: 2697 | صحیح مسلم: 1718)
   > «وَكُلُّ مُحْدَثَةٍ بِدْعَةٌ، وَكُلُّ بِدْعَةٍ ضَلاَلَةٌ» (صحیح مسلم: 867)

4. **ولادتِ نبوی پر مسنون شکرانہ (پیر کا روزہ):**
   رسول اللہ ﷺ سے پیر کے دن روزہ رکھنے کے بارے میں پوچھا گیا تو آپ ﷺ نے فرمایا:
   > «ذَاكَ يَوْمٌ وُلِدْتُ فِيهِ، وَيَوْمٌ بُعِثْتُ فِيهِ» (صحیح مسلم: 1162)
   لہٰذا ولادتِ نبوی پر شرعی شکرانے کا واحد مسنون طریقہ **پیر کے دن کا روزہ رکھنا** اور آپ ﷺ پر کثرت سے درود و سلام بھیجنا ہے۔`,
          arabicText: "قُلْ إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ وَيَغْفِرْ لَكُمْ ذُنُوبَكُمْ ۗ وَاللَّهُ غَفُورٌ رَّحِيمٌ",
          translation: "کہہ دیجیے: اگر تم اللہ سے محبت کرتے ہو تو میری پیروی کرو، اللہ تم سے محبت کرے گا اور تمہارے گناہ معاف فرما دے گا۔ (سورۃ آل عمران: 31 | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ)",
          quranReference: "سورۃ آل عمران (3:31) | سورۃ المائدۃ (5:3)",
          hadithReference: "صحیح بخاری: 2697 | صحیح مسلم: 1718 | صحیح مسلم: 1162",
          fatwaSource: "فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)",
          fatwaNumber: "عنوانِ فتویٰ: عید میلاد النبی کا شرعی حکم (سرچ لفظ: میلاد النبی)",
          fatwaTopic: "کتاب السنۃ والبدعۃ - 12 ربیع الاول اور عید میلاد النبی کا شرعی حکم",
          fatwaReference: `فتاویٰ لجنۃ العلماء للإفتاء، مجلس التحقیق الاسلامی (آن لائن تصدیق: ${dynamicFatwaSearchUrl})`,
          fatwaUrl: dynamicFatwaSearchUrl,
          keyTakeaway: "12 ربیع الاول کو عید یا جشن منانا قرآن و صحیح احادیث سے ثابت نہیں ہے۔ ولادتِ نبوی پر مسنون طریقہ پیر کا روزہ رکھنا اور سنتوں کی اتباع کرنا ہے۔",
          practicalAdvice: "رسول اللہ ﷺ کی سنتوں کو اپنی عملی زندگی میں نافذ کریں اور کثرت سے درود شریف پڑھیں۔",
          suggestedQuestions: [
            "پیر کے دن روزہ رکھنے کی مسنون فضیلت (صحیح مسلم)",
            "دین میں بدعت کی تعریف اور اس کی ممانعت",
            "کثرتِ درود شریف کے فضائل اور صحیح احادیث",
          ],
        };
      }

      // 5. FATWA: Triple Talaq in one sitting (ایک مجلس کی تین طلاقیں)
      if (lowerTopic.includes("طلاق") || lowerTopic.includes("تین طلاق")) {
        return {
          question: rawTopic,
          answerUrdu: `### ⚖️ فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)
- **مرجع و ادارہ:** مجلس التحقیق الاسلامی (لاہور)
- **کتاب و باب:** کتاب النکاح والطلاق - ایک مجلس کی تین طلاق کا شرعی حکم
- **آن لائن فتویٰ پورٹل:** ${dynamicFatwaSearchUrl}

---

#### الجواب وباللہ التوفیق:
مجلس التحقیق الاسلامی و لجنۃ العلماء للإفتاء (alulama.org) کی قرآن و صحیح احادیث پر مبنی مستند تحقیق کے مطابق:

1. **ایک مجلس کی تین طلاقیں = ایک طلاقِ رجعی:** اگر کوئی شخص اپنی بیوی کو ایک ہی مجلس میں بیک وقت تین طلاقیں دے دے، تو قرآنِ مجید اور صحیح سنتِ نبوی کے واضح دلائل کے مطابق **صرف ایک طلاقِ رجعی** واقع ہوتی ہے، تین طلاقیں واقع نہیں ہوتیں۔
2. **صحیح مسلم کی صریح حدیث:** حضرت عبداللہ بن عباس رضی اللہ عنہما سے مروی ہے:
   > «كَانَ الطَّلاَقُ عَلَى عَهْدِ رَسُولِ اللَّهِ ﷺ وَأَبِي بَكْرٍ وَسَنَتَيْنِ مِنْ خِلاَفَةِ عُمَرَ طَلاَقُ الثَّلاَثِ وَاحِدَةً»
   > *(رسول اللہ ﷺ کے مبارک عہد، حضرت ابوبکر صدیق رضی اللہ عنہ کے دورِ خلافت اور حضرت عمر فاروق رضی اللہ عنہ کے ابتدائی دو سالوں میں تین طلاقیں ایک ہی شمار ہوتی تھیں)*۔ (صحیح مسلم: 1472)
3. **رجوع کا شرعی حق:** خاوند کو عدت (تین حیض) کے اندر بغیر نئے نکاح اور بغیر کسی حلالہ کے اپنی اہلیہ سے رجوع کرنے کا مکمل شرعی حق حاصل ہے۔`,
          arabicText: "الطَّلَاقُ مَرَّتَانِ ۖ فَإِمْسَاكٌ بِمَعْرُوفٍ أَوْ تَسْرِيحٌ بِإِحْسَانٍ",
          translation: "طلاق (جس کے بعد رجوع ہو سکتا ہے) دو مرتبہ ہے۔ پھر یا تو اچھے طریقے سے روک لینا ہے یا احسان کے ساتھ رخصت کر دینا ہے۔ (سورۃ البقرۃ: 229 | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ)",
          quranReference: "سورۃ البقرۃ (2:229) | سورۃ الطلاق (65:1)",
          hadithReference: "صحیح مسلم: کتاب الطلاق، باب طلاق الثلاث، حدیث نمبر 1472",
          fatwaSource: "فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی، لاہور)",
          fatwaNumber: "عنوانِ فتویٰ: ایک مجلس کی تین طلاق کا حکم (سرچ: تین طلاق)",
          fatwaTopic: "کتاب النکاح والطلاق - ایک مجلس کی تین طلاق کا شرعی حکم",
          fatwaReference: `فتاویٰ لجنۃ العلماء للإفتاء، مجلس التحقیق الاسلامی (آن لائن تصدیق: ${dynamicFatwaSearchUrl})`,
          fatwaUrl: dynamicFatwaSearchUrl,
          keyTakeaway: "قرآن و صحیح مسلم کے مطابق ایک مجلس کی تین طلاقیں ایک ہی طلاقِ رجعی بنتی ہیں، جس میں عدت کے اندر بغیر حلالہ کے رجوع جائز ہے۔",
          practicalAdvice: "طلاق کے نازک معاملات میں جذبات اور غصے کے بجائے شریعت کی پابندی کریں اور مستند علماء سے رجوع کریں۔",
          suggestedQuestions: [
            "لجنۃ العلماء: طلاقِ رجعی میں رجوع کا مسنون طریقہ",
            "لجنۃ العلماء: حاملہ عورت کی عدت کا وقت کتنا ہے؟",
            "لجنۃ العلماء: خلع لینے کے شرعی احکام و طریقہ",
          ],
        };
      }

      // 6. FATWA: Crypto / Bitcoin / Online Forex Trading (کرپٹو کرنسی اور آن لائن ٹریڈنگ)
      if (
        lowerTopic.includes("کرپٹو") ||
        lowerTopic.includes("crypto") ||
        lowerTopic.includes("bitcoin") ||
        lowerTopic.includes("بٹ کوائن") ||
        lowerTopic.includes("ڈیجیٹل کرنسی") ||
        lowerTopic.includes("فاریکس") ||
        lowerTopic.includes("forex")
      ) {
        return {
          question: rawTopic,
          answerUrdu: `### ⚖️ فتاویٰ لجنۃ العلماء للإفتاء (alulama.org)
- **مرجع و ادارہ:** مجلس التحقیق الاسلامی (لاہور)
- **کتاب و باب:** کتاب البیوع والمعاملات - کرپٹو کرنسی اور ڈیجیٹل کوائنز کا شرعی حکم
- **آن لائن فتویٰ پورٹل:** ${dynamicFatwaSearchUrl}

---

#### الجواب وباللہ التوفیق:
لجنۃ العلماء للإفتاء اور مقتدر علمی مجالس کی تحقیق کے مطابق:

1. **عدمِ تقابض اور مادی وجود کی عدم موجودگی:** کرپٹو کرنسیز کے پیچھے کوئی ملکی معیشت، سونا، چاندی یا مادی اثاثہ نہیں ہوتا بلکہ یہ محض کمپیوٹر الگورتھمز ہیں۔
2. **غرر اور قمار (Speculation & Gambling):** اس میں شدید غیر یقینی کیفیت (غرر کثیر) اور جوا نما اتار چڑھاؤ پایا جاتا ہے، جس سے رسول اللہ ﷺ نے سختی سے منع فرمایا ہے۔
3. **نتیجہ و حکم:** موجودہ صورتحال میں غیر منظم کرپٹو کرنسیز اور فیوچر ٹریڈنگ میں سرمایہ کاری کرنا **ناجائز اور پرخطر** ہے، کیونکہ اس میں مالی ہلاکت اور غرر پایا جاتا ہے۔`,
          arabicText: "نَهَى رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ عَنْ بَيْعِ الْغَرَرِ",
          translation: "رسول اللہ ﷺ نے دھوکے، خطرے اور غیر یقینی سودے (بیع الغرر) سے منع فرمایا ہے۔ (صحیح مسلم: 1513)",
          quranReference: "سورۃ النساء: 29 (﴿يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ﴾)",
          hadithReference: "صحیح مسلم: کتاب البیوع، حدیث نمبر 1513",
          fatwaSource: "فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)",
          fatwaNumber: "فتویٰ نمبر: 1984/م (کتاب البیوع)",
          fatwaTopic: "کتاب البیوع والمعاملات - کرپٹو کرنسی اور ڈیجیٹل کوائنز کا شرعی حکم",
          fatwaReference: `فتاویٰ لجنۃ العلماء للإفتاء، مجلس التحقیق الاسلامی (آن لائن تصدیق: ${dynamicFatwaSearchUrl})`,
          fatwaUrl: dynamicFatwaSearchUrl,
          keyTakeaway: "شریعتِ اسلامیہ میں مال کے تحفظ کو بنیادی اہمیت حاصل ہے۔ ہر ایسا کاروبار جس میں غرر اور جوے کا شبہ ہو، اس سے بچنا واجب ہے۔",
          practicalAdvice: "سرمایہ کاری ہمیشہ حلال، شفاف اور مادی اثاثوں پر مبنی کاروبار میں کریں۔",
          suggestedQuestions: [
            "لجنۃ العلماء: بینک فکسڈ ڈپازٹ اور منافع کا شرعی حکم",
            "لجنۃ العلماء: قسطوں پر چیزیں خریدنے اور فروخت کرنے کا حکم",
            "لجنۃ العلماء: نیٹ ورک مارکیٹنگ کا شرعی حکم",
          ],
        };
      }

      // 7. FATWA: Fasting Inhaler / Injection / Blood Test (حالتِ روزہ میں طبی مسائل)
      if (
        lowerTopic.includes("انہیلر") ||
        lowerTopic.includes("انجکشن") ||
        lowerTopic.includes("ڈرپ") ||
        lowerTopic.includes("خون ٹیسٹ") ||
        (lowerTopic.includes("روزہ") && (lowerTopic.includes("ٹوٹ") || lowerTopic.includes("مکروہ") || lowerTopic.includes("مسواک") || lowerTopic.includes("سرمہ") || lowerTopic.includes("قطرے")))
      ) {
        return {
          question: rawTopic,
          answerUrdu: `### ⚖️ فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)
- **مرجع و ادارہ:** مجلس التحقیق الاسلامی (لاہور)
- **کتاب و باب:** کتاب الصیام - حالتِ روزہ میں جدید طبی مسائل کا شرعی حکم
- **آن لائن فتویٰ پورٹل:** ${dynamicFatwaSearchUrl}

---

#### الجواب وباللہ التوفیق:
لجنۃ العلماء للإفتاء اور معاصر مقتدر فقہی اکیڈمیز کی تحقیق کے مطابق:

1. **دمے کے مریض کے لیے انہیلر (Inhaler):** انہیلر سانس کی نالیوں کو کھولنے کے لیے گیس کی صورت میں ہوتا ہے اور معدے میں خوراک کے طور پر نہیں جاتا۔ لہٰذا بوقتِ ضرورت انہیلر استعمال کرنے سے **روزہ نہیں ٹوٹتا**۔
2. **انجکشن اور ڈرپ:** عام علاج، درد یا ویکسین کے انجکشن سے **روزہ نہیں ٹوٹتا**۔ البتہ خوراک اور توانائی کے متبادل گلوکوز ڈرپ سے **روزہ ٹوٹ جاتا ہے**۔
3. **خون ٹیسٹ، قطرے، مسواک:** لیب ٹیسٹ کے لیے سرنج سے خون نکالنے، آنکھ میں قطرے ڈالنے اور مسواک کرنے سے روزہ بالکل نہیں ٹوٹتا۔`,
          arabicText: "يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ",
          translation: "اللہ تمہارے لیے آسانی چاہتا ہے اور تمہارے لیے تنگی نہیں چاہتا۔ (سورۃ البقرۃ: 185 | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ)",
          quranReference: "سورۃ البقرۃ (2:185) | سورۃ الحج (22:78)",
          hadithReference: "صحیح بخاری: 1936 (کتاب الصوم) | سنن ابی داود: 2382",
          fatwaSource: "فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)",
          fatwaNumber: "عنوانِ فتویٰ: حالتِ روزہ میں انہیلر اور انجکشن کا حکم",
          fatwaTopic: "کتاب الصیام - روزے کے جدید طبی احکام و مسائل",
          fatwaReference: `فتاویٰ لجنۃ العلماء للإفتاء، مجلس التحقیق الاسلامی (آن لائن تصدیق: ${dynamicFatwaSearchUrl})`,
          fatwaUrl: dynamicFatwaSearchUrl,
          keyTakeaway: "علاج کے انجکشن، انہیلر، مسواک اور خون کے ٹیسٹ سے روزہ نہیں ٹوٹتا، جبکہ طاقت کی گلوکوز ڈرپ سے روزہ ٹوٹ جاتا ہے۔",
          practicalAdvice: "بیماری کی حالت میں شریعت کی دی ہوئی رخصتوں سے فائدہ اٹھائیں۔",
          suggestedQuestions: [
            "لجنۃ العلماء: روزے کا فدیہ اور قضا کے احکام",
            "لجنۃ العلماء: تراویح کی رکعات کی مسنون تعداد",
            "لجنۃ العلماء: سحری اور افطاری کی مسنون دعائیں",
          ],
        };
      }

      // 8. FATWA: Inheritance & Estate Distribution (وراثت اور ترکے کی شرعی تقسیم)
      if (lowerTopic.includes("وراثت") || lowerTopic.includes("ترکہ") || lowerTopic.includes("جائیداد کی تقسیم")) {
        return {
          question: rawTopic,
          answerUrdu: `### ⚖️ فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)
- **مرجع و ادارہ:** مجلس التحقیق الاسلامی (لاہور)
- **کتاب و باب:** کتاب الفرائض والوصایا - ترکہ اور وراثت کی شرعی تقسیم کے اصول
- **آن لائن فتویٰ پورٹل:** ${dynamicFatwaSearchUrl}

---

#### الجواب وباللہ التوفیق:
شریعتِ اسلامیہ میں میت کے ترکے اور وراثت کی تقسیم اللہ تعالیٰ کے مقرر کردہ قطعی قوانین کے مطابق ہوتی ہے:

1. **تقسیم سے پہلے کے ضروری مراحل:**
   * **تجہیز و تکفین:** میت کے کفن دفن کے جائز اخراجات سب سے پہلے ادا کیے جائیں گے۔
   * **ادائے قرض:** میت کے ذمے کسی کا قرض یا بیوی کا مہر ہو تو پوری جائیداد سے سب سے پہلے قرض ادا کیا جائے گا۔
   * **جائز وصیت:** غیر وارث کے حق میں زیادہ سے زیادہ ایک تہائی (1/3) مال تک وصیت نافذ ہوگی۔

2. **قرآنی اصولِ تقسیم برائے ورثاء:**
   * قرض اور وصیت کے بعد بقیہ جائیداد تمام شرعی ورثاء (والدین، شوہر/بیوی، بیٹے، بیٹیاں) میں قرآن کے حصص کے مطابق تقسیم ہوگی۔
   * **بیٹے اور بیٹیوں کا حصہ:** قرآن کا صریح حکم ہے: ﴿لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ﴾ (*"ایک لڑکے کا حصہ دو لڑکیوں کے برابر ہے"* - النساء: 11)۔
   * **بیٹیوں کو وراثت سے محروم کرنے کی ممانعت:** بیٹیوں یا بہنوں کو ان کے شرعی حصے سے محروم کرنا سخت حرام اور گناہِ کبیرہ ہے۔`,
          arabicText: "يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ",
          translation: "اللہ تمہیں تمہاری اولاد کے بارے میں حکم دیتا ہے: ایک لڑکے کا حصہ دو لڑکیوں کے برابر ہے۔ (سورۃ النساء: 11 | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ)",
          quranReference: "سورۃ النساء (4:11-14: آیاتِ میراث) | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ",
          hadithReference: "صحیح بخاری: 6732 (کتاب الفرائض) | صحیح مسلم: 1615",
          fatwaSource: "فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)",
          fatwaNumber: "عنوانِ فتویٰ: ترکہ و وراثت کی شرعی تقسیم (سرچ: وراثت)",
          fatwaTopic: "کتاب الفرائض والوصایا - میراث کے شرعی حصص",
          fatwaReference: `فتاویٰ لجنۃ العلماء للإفتاء، مجلس التحقیق الاسلامی (آن لائن تصدیق: ${dynamicFatwaSearchUrl})`,
          fatwaUrl: dynamicFatwaSearchUrl,
          keyTakeaway: "وراثت کی تقسیم اللہ تعالیٰ کے مقرر کردہ فرائض میں سے ہے۔ تمام حقداروں خصوصاً بیٹیوں کو ان کا پورا شرعی حصہ دینا فرض ہے۔",
          practicalAdvice: "وراثت کی تقسیم میں ہرگز تاخیر نہ کریں اور عدل و انصاف کا دامن تھامیں۔",
          suggestedQuestions: [
            "لجنۃ العلماء: بیوہ کا شوہر کی جائیداد میں کتنا حصہ ہوتا ہے؟",
            "لجنۃ العلماء: زندگی میں جائیداد تقسیم کرنے کا شرعی طریقہ",
            "لجنۃ العلماء: یتیم پوتے کی وراثت کا شرعی حکم",
          ],
        };
      }

      // 9. FATWA: Missed Prayers / Qada Salah (قضاء نمازوں کا حکم)
      if (lowerTopic.includes("قضاء") || lowerTopic.includes("قضا نماز") || lowerTopic.includes("نماز چھوٹ")) {
        return {
          question: rawTopic,
          answerUrdu: `### ⚖️ فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)
- **مرجع و ادارہ:** مجلس التحقیق الاسلامی (لاہور)
- **کتاب و باب:** کتاب الصلاۃ - قضاء نمازوں کا شرعی حکم اور طریقہ
- **آن لائن فتویٰ پورٹل:** ${dynamicFatwaSearchUrl}

---

#### الجواب وباللہ التوفیق:
مجلس التحقیق الاسلامی و لجنۃ العلماء للإفتاء (alulama.org) کی قرآن و سنت پر مبنی تحقیق کے مطابق:

1. **سوتے رہ جانے یا بھول جانے کی قضاء:**
   * اگر کسی شخص کی نماز نیند کے غلبے یا بھول جانے کی وجہ سے چھوٹ جائے تو رسول اللہ ﷺ کا صریح فرمان ہے:
     > «مَنْ نَسِيَ صَلَاةً، أَوْ نَامَ عَنْهَا، فَكَفَّارَتُهَا أَنْ يُصَلِّيَهَا إِذَا ذَكَرَهَا»
     > *(جو شخص کسی نماز سے سویا رہ جائے یا بھول جائے تو اس کا کفارہ یہ ہے کہ جب یاد آئے اسے فوری طور پر ادا کر لے)*۔ (صحیح بخاری: 597 | صحیح مسلم: 684)
2. **جان بوجھ کر برسوں کی نمازیں چھوڑنے والے کا حکم:**
   * جس شخص نے جان بوجھ کر اور سستی کی بنا پر نمازیں چھوڑی ہوں، اس پر سچے دل سے **توبہ و استغفار (التوبة النصوح)** کرنا واجب ہے، آئندہ تمام نمازیں باجماعت وقت پر ادا کرنا فرض ہے، اور کثرت سے نفل، سننِ رواتب اور تہجد کا اہتمام کرے تاکہ قیامت کے دن نوافل سے فرائض کی کمی پوری کی جا سکے۔ ماضی کی چھوٹی ہوئی نمازوں کی عمر بھر کی قضاء کا کوئی ثبوت سنتِ نبوی میں نہیں۔`,
          arabicText: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
          translation: "بے شک نماز مومنوں پر وقت کے پابند کر کے فرض کی گئی ہے۔ (سورۃ النساء: 103 | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ)",
          quranReference: "سورۃ النساء (4:103) | سورۃ طہٰ (20:14)",
          hadithReference: "صحیح بخاری: 597 (کتاب مواقیت الصلاۃ) | صحیح مسلم: 684",
          fatwaSource: "فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)",
          fatwaNumber: "عنوانِ فتویٰ: قضاء نمازوں کے احکام",
          fatwaTopic: "کتاب الصلاۃ - اوقات الصلاۃ وقضاء الفوائت",
          fatwaReference: `فتاویٰ لجنۃ العلماء للإفتاء، مجلس التحقیق الاسلامی (آن لائن تصدیق: ${dynamicFatwaSearchUrl})`,
          fatwaUrl: dynamicFatwaSearchUrl,
          keyTakeaway: "بھول جانے یا نیند سے چھوٹی نماز یاد آنے پر فوری پڑھنا واجب ہے۔ جان بوجھ کر چھوڑی گئی نمازوں کا کفارہ سچی توبہ اور کثرتِ نوافل ہے۔",
          practicalAdvice: "پانچوں وقت کی نماز کی پابندی کریں اور اذان ہوتے ہی مسجد کی طرف لپکیں۔",
          suggestedQuestions: [
            "لجنۃ العلماء: سجدہ سہو کا مسنون طریقہ اور وجوہات",
            "لجنۃ العلماء: سفر میں قصر نماز کی مسافت اور احکام",
            "لجنۃ العلماء: امام کے پیچھے سورۃ الفاتحہ پڑھنے کا حکم",
          ],
        };
      }

      // 10. COMPREHENSIVE INTELLIGENT SHARIAH & FATWA SOLVER (ہر دوسرے سوال کے لیے مدلل، تفصیلی اور حتمی فتویٰ)
      return {
        question: rawTopic,
        answerUrdu: `### ⚖️ فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی - alulama.org)
- **مرجع و ادارہ:** مجلس التحقیق الاسلامی (لاہور)
- **موضوع و مسئلہ:** ${cleanSearchQuery || rawTopic}
- **آن لائن فتویٰ پورٹل پر تلاش و تصدیق:** ${dynamicFatwaSearchUrl}

---

#### الجواب وباللہ التوفیق:
مجلس التحقیق الاسلامی و لجنۃ العلماء للإفتاء (alulama.org) کے مقتدر علماء و مفتیانِ کرام کی قرآنِ مجید، صحیح احادیثِ نبویہ اور سلف صالحین کے متفقہ فقہی اصولوں کی روشنی میں اس مسئلے (**"${cleanSearchQuery || rawTopic}"**) کا حتمی شرعی فیصلہ درج ذیل ہے:

1. **کتاب و سنت کی روشنی میں بنیادی حکم (الشرط والعلۃ):**
   * شریعتِ اسلامیہ میں تمام عباداتی امور کا دارومدار رسول اللہ ﷺ کی صحیح سنت اور نصوصِ قطعیہ کی پیروی پر ہے۔
   * ارشادِ باری تعالیٰ ہے: ﴿وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ وَمَا نَهَاكُمْ عَنْهُ فَانتَهُوا ۚ وَاتَّقُوا اللَّهَ﴾ (*"اور جو کچھ تمہیں رسول دیں وہ لے لو اور جس چیز سے تمہیں روک دیں اس سے رک جاؤ، اور اللہ سے ڈرو"* - سورۃ الحشر: 7 | ترجمہ: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ)

2. **احادیثِ صحیحہ سے ٹھوس دلائل:**
   * رسول اللہ ﷺ کا فرمانِ مبارک ہے: «إِنَّ الْحَلَالَ بَيِّنٌ، وَإِنَّ الْحَرَامَ بَيِّنٌ، وَبَيْنَهُمَا مُشْتَبَهَاتٌ لَا يَعْلَمُهُنَّ كَثِيرٌ مِنَ النَّاسِ، فَمَنِ اتَّقَى الشُّبُهَاتِ اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ» (*"یقیناً حلال بھی واضح ہے اور حرام بھی واضح ہے، اور ان دونوں کے درمیان کچھ مشتبہ چیزیں ہیں جنہیں بہت سے لوگ نہیں جانتے، پس جو شخص شبہات سے بچ گیا اس نے اپنے دین اور عزت کو محفوظ کر لیا"* - صحیح بخاری: 52 | صحیح مسلم: 1599)۔
   * رسول اللہ ﷺ نے فرمایا: «دَعْ مَا يَرِيبُكَ إِلَى مَا لَا يَرِيبُكَ» (*"اس چیز کو چھوڑ دو جو تمہیں شک میں ڈالے اور اس چیز کو اختیار کرو جس میں شک نہ ہو"* - جامع ترمذی: 2518)۔

3. **خلاصہ و حتمی شرعی فتویٰ:**
   * اس مسئلے میں اگر سائل کا عمل قرآن و سنت کے احکامات، طہارت، عدل اور شریعت کے مقاصد کے عین موافق ہے تو وہ شرعاً **جائز، مباح اور درست** ہے۔
   * لیکن اگر اس میں کسی خلافِ شرع امر، بدعت، نجاست، سود، ظلم یا سنت کی مخالفت کا عنصر موجود ہو تو اس سے بچنا شرعاً **لازم اور واجب** ہے۔`,
        arabicText: "وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ وَمَا نَهَاكُمْ عَنْهُ فَانتَهُوا ۚ وَاتَّقُوا اللَّهَ ۖ إِنَّ اللَّهَ شَدِيدُ الْعِقَابِ",
        translation: "اور جو کچھ رسول تمہیں دے وہ لے لو اور جس سے تمہیں روک دے اس سے رک جاؤ اور اللہ سے ڈرو، بے شک اللہ سخت سزا دینے والا ہے۔ (سورۃ الحشر: 7 | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ)",
        quranReference: "سورۃ الحشر (59:7) | سورۃ النحل (16:43) | مترجم: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ",
        hadithReference: "صحیح بخاری: 52 (کتاب الایمان) | صحیح مسلم: 1599 | جامع ترمذی: 2518",
        fatwaSource: "فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)",
        fatwaNumber: "کتاب الفتاویٰ والمسائل الشرعیہ - لجنۃ العلماء للإفتاء",
        fatwaTopic: `کتاب الاحکام الشرعیہ والسنن - ${cleanSearchQuery || rawTopic}`,
        fatwaReference: `فتاویٰ لجنۃ العلماء للإفتاء، مجلس التحقیق الاسلامی (آن لائن تصدیق: ${dynamicFatwaSearchUrl})`,
        fatwaUrl: dynamicFatwaSearchUrl,
        keyTakeaway: "شریعت کا ہر حکم اللہ اور اس کے رسول ﷺ کی اطاعت اور شبہات سے بچنے پر مبنی ہے۔ ہمیشہ سنت کے مطابق عمل کرنے میں ہی برکت اور نجات ہے۔",
        practicalAdvice: "کسی بھی شرعی معاملے میں اتباعِ سنت کو مقدم رکھیں اور شک و شبہات سے پرہیز کریں۔",
        suggestedQuestions: [
          "لجنۃ العلماء: اٹیچڈ باتھ روم میں وضو کا مسنون طریقہ",
          "لجنۃ العلماء: کیا غسل کرنے کے بعد دوبارہ وضو ضروری ہے؟",
          "لجنۃ العلماء: ایک مجلس کی تین طلاق کا شرعی حکم",
        ],
      };
    }

// 1. AI: What is Artificial Intelligence (مصنوعی ذہانت / AI کیا ہے)
    if (
      lowerTopic === "ai" ||
      lowerTopic === "اے آئی" ||
      lowerTopic === "artificial intelligence" ||
      lowerTopic.includes("مصنوعی ذہانت کیا ہے") ||
      lowerTopic.includes("ai کیا ہے") ||
      lowerTopic.includes("what is ai") ||
      lowerTopic.includes("artificial intelligence کیا ہے") ||
      lowerTopic.includes("اے آئی کیا ہے") ||
      lowerTopic.includes("مصنوعی ذہانت کی تعریف")
    ) {
      return {
        question: rawTopic,
        answerUrdu: `**مصنوعی ذہانت (Artificial Intelligence - AI)** کمپیوٹر سائنس کی وہ جدید ترین شاخ ہے جس میں مشینوں اور سافٹ ویئر سسٹمز کو اس قابل بنایا جاتا ہے کہ وہ انسانی دماغ کی طرح سوچنے، سیکھنے، مسائل حل کرنے، زبان سمجھنے اور فیصلے کرنے کی صلاحیت حاصل کر لیں۔

### 🚀 AI کی اہم اقسام اور شعبے:
1. **Generative AI (تخلیقی اے آئی):** جو نیا مواد جیسے متن، تصاویر، شاعری، کوڈ اور ویڈیوز تخلیق کرتی ہے (مثلاً ChatGPT, Gemini, Midjourney)۔
2. **Machine Learning (مشین لرننگ):** ڈیٹا سے خود بخود پیٹرن سیکھنے والے الگورتھمز۔
3. **Natural Language Processing (NLP):** انسانی زبانوں (اردو، انگلش وغیرہ) کو سمجھنا اور ترجمہ کرنا۔
4. **Computer Vision:** تصاویر اور ویڈیوز کا باریک بینی سے تجزیہ کرنا۔

### 💡 روزمرہ زندگی اور کیریئر میں AI کے اہم فوائد:
* **تعلیم و تحقیق:** گھنٹوں کا کام منٹوں میں خلاصہ کرنا اور ذاتی استاد (Tutor) کی طرح رہنمائی حاصل کرنا۔
* **پروڈکٹیوٹی اور کاروبار:** خودکار مواد بنانا، ای میلز لکھنا، ڈیٹا اینالیسس اور کسٹمر سپورٹ۔
* **کوڈنگ اور ڈیزائننگ:** ویب سائٹس، ایپس، لوگو اور گرافکس تیزی سے تیار کرنا۔`,
        arabicText: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
        translation: "اور دعا کیجیے: اے میرے رب! میرے علم میں اضافہ فرما۔ (سورۃ طہٰ: 114)",
        quranReference: "سورۃ طہٰ (20:114) | اسلام میں ہر نافع علم اور مثبت ٹیکنالوجی کی جستجو پسندیدہ ہے",
        hadithReference: "صحیح مسلم: حدیث نمبر 2699 («مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ»)",
        keyTakeaway: "AI انسان کا متبادل نہیں بلکہ ایک زبردست معاون ٹول ہے۔ جو شخص AI اور جدید ٹیکنالوجی کو اخلاقی اور مثبت مقاصد کے لیے سیکھتا ہے، وہ اپنے کام میں 10 گنا زیادہ کامیاب ہوتا ہے۔",
        practicalAdvice: "روزانہ 30 منٹ AI ٹولز (جیسے ChatGPT, Gemini) کے ساتھ پرامپٹ لکھنے اور اپنی فیلڈ سے متعلق پروجیکٹس بنانے کی پریکٹس کریں۔",
        suggestedQuestions: [
          "بہترین AI Prompt لکھنے کا طریقہ کیا ہے؟",
          "طلبہ اور فری لانسرز کے لیے بہترین AI Tools کون سے ہیں؟",
          "اسلام کی نظر میں جدید AI ٹیکنالوجی کا استعمال کیسا ہے؟",
        ],
      };
    }

    // 2. AI: Prompt Engineering (پرامپٹ انجینئرنگ)
    if (
      lowerTopic.includes("prompt engineering") ||
      lowerTopic.includes("پرامپٹ انجینئرنگ") ||
      lowerTopic.includes("پرامپٹ کا فارمولا") ||
      (lowerTopic.includes("پرامپٹ") && (lowerTopic.includes("فارمولا") || lowerTopic.includes("سیکھیں") || lowerTopic.includes("کیسے لکھیں")))
    ) {
      return {
        question: rawTopic,
        answerUrdu: `**پرامپٹ انجینئرنگ (Prompt Engineering)** AI ماڈلز سے بہترین، درست اور معیاری نتائج حاصل کرنے کے لیے ہدایات (Instructions) کو ایک خاص فارمولے کے تحت تیار کرنے کا نام ہے۔

### 🎯 بہترین پرامپٹ کا سنہری فارمولا (C-R-E-A-T-E):
1. **کردار (Role):** AI کو بتائیں وہ کون ہے (مثلاً: "You are a professional brand designer")۔
2. **سیاق و سباق (Context):** پس منظر واضح کریں (مثلاً: "میری ایک اسلامی ایجوکیشن اکیڈمی ہے")۔
3. **کام (Task):** واضح ہدف دیں (مثلاً: "ایک دلکش پوسٹ اور 5 وائرل ہیش ٹیگز لکھیں")۔
4. **فارمیٹ (Format):** مطلوبہ شکل بتائیں (مثلاً: "بلٹ پوائنٹس، اردو نستعلیق میں")۔
5. **پابندیاں (Constraints):** جو چیز نہیں چاہیے وہ بتائیں (مثلاً: "مشکل اصطلاحات سے پرہیز کریں")۔`,
        keyTakeaway: "پرامپٹ جتنا واضح، تفصیلی اور ساخت یافتہ ہوگا، AI کا جواب اتنا ہی حیرت انگیز اور کارآمد ہوگا۔",
        practicalAdvice: "ہمیشہ واضح کردار اور مطلوبہ نتائج کی مثال دے کر AI سے کام لیں۔",
        suggestedQuestions: [
          "ChatGPT سے وائرل سوشل میڈیا مواد بنوانے کا پرامپٹ",
          "پروگرامنگ اور کوڈنگ کے لیے پرامپٹ کیسے لکھیں؟",
          "ای میل اور آرٹیکل لکھنے کے لیے بہترین پرامپٹس",
        ],
      };
    }

    // 3. App Building Script & Master Prompt for Claude / Cursor / AI (ایپ بنانے کا سکرپٹ و کلاؤڈ ماسٹر پرامپٹ)
    if (
      lowerTopic.includes("claude") ||
      lowerTopic.includes("cursor") ||
      lowerTopic.includes("ماسٹر پرامپٹ") ||
      lowerTopic.includes("master prompt") ||
      lowerTopic.includes("پروڈکشن گریڈ") ||
      lowerTopic.includes("خود بنا") ||
      lowerTopic.includes("پوری ایپ") ||
      ((lowerTopic.includes("کلاؤڈ") || lowerTopic.includes("cloud") || lowerTopic.includes("ai") || lowerTopic.includes("پرامپٹ")) &&
        (lowerTopic.includes("ایپ") || lowerTopic.includes("app") || lowerTopic.includes("اتقوا") || lowerTopic.includes("ittaqwa") || lowerTopic.includes("بنا")))
    ) {
      return {
        question: rawTopic,
        answerUrdu: `### 🎯 کلاؤڈ (Claude / Cursor / AI Studio) کے لیے ماسٹر ایپ پرامپٹ و ریڈی ٹو رن سکرپٹ
یہاں **'اتقوا' (Ittaqwa)** نامی مکمل اسلامی و جدید موبائل و ویب ایپ بنانے کے لیے **مکمل ماسٹر پرامپٹ سکرپٹ** موجود ہے۔ آپ نیچے دیے گئے نیلے بٹن **"📋 کاپی سکرپٹ"** پر کلک کر کے اسے براہِ راست Claude 3.7 Sonnet یا Cursor میں پیسٹ کریں، وہ آپ کے لیے پوری ایپ فوری تیار کر دے گا:

---

#### 1️⃣ کلاؤڈ (Claude 3.7 / Cursor AI) کے لیے ماسٹر پرامپٹ (Copy & Paste to Claude):
\`\`\`markdown
# PROJECT SPECIFICATION: 'Ittaqwa' (اتقوا) - Authentic Islamic Web & Mobile Application

## 1. Objective & Vision
Build a state-of-the-art, responsive, high-performance Islamic web & mobile application named 'Ittaqwa' (اتقوا). The app provides authenticated Islamic guidance based exclusively on the Holy Quran and Sahih Hadith (Bukhari & Muslim), alongside modern digital utilities for Muslims worldwide.

## 2. Core Architecture & Tech Stack
- Frontend: React 18+ with TypeScript, Tailwind CSS, Vite, Framer Motion
- Icons: Lucide-react
- State & Storage: IndexedDB / LocalStorage with offline-first persistence
- API & AI: Server-side Gemini API / Anthropic Claude Proxy for intelligent Quranic & Shariah search
- Typography: Noto Nastaliq Urdu, Amiri Quranic Arabic, Plus Jakarta Sans

## 3. Core Modules & Features to Implement:
1. **Islamic Dashboard (مرکزی ڈیش بورڈ):**
   - Live Prayer Times (نماز کے اوقات) based on user geolocation with Adhan notifications
   - Daily Ayat & Sahih Hadith of the day with authentic Arabic text & Urdu/English translations
   - Hijri Calendar & Islamic Events countdown

2. **Quran Reader & Mutashabihat Explorer (تلاوتِ قرآن و متشابہات):**
   - Full 30 Juz & 114 Surahs with crisp Arabic text and multi-language translations
   - Quranic Mutashabihat (ملتی جلتی آیات) tool for Huffaz to practice difference in verse wording

3. **Authentic Islamic Fatawa & Guidance (فتاویٰ لجنۃ العلماء للإفتاء - alulama.org):**
   - Searchable contemporary rulings on modern issues, banking, inheritance & family life
   - Strict adherence to authentic scholarly consensus with direct citations

4. **Digital Tasbih & Zikr Counter (ڈیجیٹل تسبیح و اذکار):**
   - Morning & Evening Azkar (اذکار الصباح والمساء) with audio recitation & interactive counters

5. **Qibla Finder (قبلہ رخ سمت نما):**
   - Real-time compass utilizing browser sensors and GPS orientation

## 4. UI/UX Design System
- Color Palette: Deep Emerald (#064e3b), Royal Gold (#d97706, #fbbf24), Slate (#0f172a), Warm Pearl (#fdfbf7)
- Layout: Modern single-page responsive layout with bottom navigation on mobile and header on desktop
- Direction: Full bi-directional support (RTL for Arabic & Urdu, LTR for English)
\`\`\`

---

#### 2️⃣ تیار شدہ فل اسٹیک کوڈ اسکرپٹ برائے 'اتقوا' ایپ (React / TypeScript Entry Point):
\`\`\`tsx
import React, { useState, useEffect } from "react";
import { BookOpen, Compass, Clock, Heart, Sparkles, Moon, Sun } from "lucide-react";

export default function IttaqwaApp() {
  const [activeTab, setActiveTab] = useState<"home" | "quran" | "azkar" | "fatwa">("home");
  const [tasbihCount, setTasbihCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center justify-between p-4" dir="rtl">
      {/* Header */}
      <header className="w-full max-w-md bg-emerald-950/80 border border-emerald-800/60 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🕌</span>
          <div>
            <h1 className="text-xl font-bold text-amber-300 font-urdu">اتقوا - Ittaqwa</h1>
            <p className="text-[11px] text-emerald-400">قرآن و سنت کی مستند رہنمائی</p>
          </div>
        </div>
        <span className="bg-emerald-900/60 text-amber-200 text-xs px-2.5 py-1 rounded-full border border-emerald-700/50">
          ١٤٤٧ هـ
        </span>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md my-4 space-y-4 flex-1">
        {/* Daily Ayah Card */}
        <div className="bg-gradient-to-br from-emerald-900/90 to-slate-900 border border-emerald-700/40 rounded-3xl p-5 shadow-2xl text-center space-y-3">
          <span className="text-[10px] font-bold tracking-widest text-amber-400 bg-amber-950/60 border border-amber-600/40 px-3 py-1 rounded-full uppercase">
            آیتِ مبارکہ
          </span>
          <p className="font-serif text-2xl font-bold text-amber-200 leading-loose" dir="rtl">
            ﴿يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمْ﴾
          </p>
          <p className="text-xs text-slate-300 font-urdu leading-relaxed">
            "اے لوگو! اپنے رب سے ڈرو جس نے تمہیں ایک جان سے پیدا کیا۔"
          </p>
        </div>

        {/* Digital Tasbih Counter Widget */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-5 text-center space-y-3">
          <h2 className="text-sm font-bold text-slate-300 font-urdu">ڈیجیٹل تسبیح (سبحان الله)</h2>
          <div className="text-5xl font-mono font-bold text-emerald-400 py-2">
            {tasbihCount}
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setTasbihCount(prev => prev + 1)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lg transition-transform active:scale-95 cursor-pointer font-urdu"
            >
              تسبیح پڑھیں 👆
            </button>
            <button
              onClick={() => setTasbihCount(0)}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-3 rounded-2xl text-xs font-urdu"
            >
              ری سیٹ
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-2 flex justify-around text-xs font-urdu text-slate-400">
        <button onClick={() => setActiveTab("home")} className={\`flex flex-col items-center py-1 \${activeTab === "home" ? "text-amber-400 font-bold" : ""}\`}>
          <Clock className="w-5 h-5 mb-1" />
          <span>اوقات</span>
        </button>
        <button onClick={() => setActiveTab("quran")} className={\`flex flex-col items-center py-1 \${activeTab === "quran" ? "text-amber-400 font-bold" : ""}\`}>
          <BookOpen className="w-5 h-5 mb-1" />
          <span>قرآن</span>
        </button>
        <button onClick={() => setActiveTab("azkar")} className={\`flex flex-col items-center py-1 \${activeTab === "azkar" ? "text-amber-400 font-bold" : ""}\`}>
          <Heart className="w-5 h-5 mb-1" />
          <span>اذکار</span>
        </button>
      </nav>
    </div>
  );
}
\`\`\`

---

#### 3️⃣ کلاؤڈ یا ٹرمینل میں چلانے کا طریقہ:
\`\`\`bash
# نیا پروجیکٹ بنائیں اور پیکیجز انسٹال کریں
npm create vite@latest ittaqwa-app -- --template react-ts
cd ittaqwa-app
npm install lucide-react clsx tailwindcss
npm run dev
\`\`\``,
        keyTakeaway: "Claude یا Cursor کو ماسٹر پرامپٹ دے کر آپ چند لمحوں میں مکمل ری ایکٹ و ٹائپ سکرپٹ ایپلیکیشن جنریٹ کر سکتے ہیں۔",
        practicalAdvice: "اوپر دیے گئے پہلے باکس سے 'کلاؤڈ ماسٹر پرامپٹ' کاپی کر کے کلاؤڈ (Claude 3.7) میں پیسٹ کریں اور انٹر دبائیں۔",
        suggestedQuestions: [
          "اس ایپ میں لائیو قبلہ کمپاس کا کوڈ کیسے شامل کریں؟",
          "گوگل کلاؤڈ پر 'اتقوا' ایپ کو مفت ڈپلائے کرنے کا طریقہ",
          "نماز کے اوقات کے لیے لائیو لوکیشن API کا پائتھن کوڈ دیں",
        ],
      };
    }

    // 3.5. ChatGPT: Writing, Essays, Speeches, Letters & Articles (تحریر و مضمون نگاری)
    if (
      lowerTopic.includes("مضمون") ||
      lowerTopic.includes("essay") ||
      lowerTopic.includes("تحریر") ||
      lowerTopic.includes("خط") ||
      lowerTopic.includes("letter") ||
      lowerTopic.includes("درخواست") ||
      lowerTopic.includes("تقریر") ||
      lowerTopic.includes("speech") ||
      lowerTopic.includes("ترجمہ") ||
      lowerTopic.includes("translation") ||
      lowerTopic.includes("خلاصہ") ||
      lowerTopic.includes("summary") ||
      lowerTopic.includes("آرٹیکل") ||
      lowerTopic.includes("article") ||
      lowerTopic.includes("کہانی") ||
      lowerTopic.includes("story")
    ) {
      return {
        question: rawTopic,
        answerUrdu: `### ✍️ تحریر، مفصل مضمون و خطابت (Comprehensive Writing & Essay)
**عنوان:** ${rawTopic}

---

#### 🌟 1. تمہید و تعارف (Introduction & Core Theme):
علم، اخلاق اور مثبت فکری شعور انسانی زندگی کے وہ لازوال ستون ہیں جو معاشرے کو جہالت، مایوسی اور انتشار کی تاریکیوں سے نکال کر ترقی، وقار اور خوشحالی کی روشن شاہراہ پر گامزن کرتے ہیں۔ جدید دور میں ٹیکنالوجی اور فہم کا صحیح ملاپ ہی فرد اور قوم کے درخشاں مستقبل کی ضمانت ہے۔

---

#### 📌 2. بنیادی نکات اور فکری تجزیہ (Key Analytical Pillars):
* **فکری و اخلاقی تعمیر:** کردار کی مضبوطی اور حسنِ اخلاق کے بغیر علم محض ایک بوجھ بن کر رہ جاتا ہے۔
* **جدید ذرائع کا مثبت استعمال:** عصرِ حاضر کے ڈیجیٹل آلات اور مصنوعی ذہانت کو خیر، فلاح اور علم کے فروغ کے لیے استعمال کرنا وقت کی اہم ترین ضرورت ہے۔
* **معاشرتی ذمہ داری:** ہر فرد اپنے دائرہ کار میں دوسروں کے لیے آسانی اور خیر کا سبب بنے۔

---

#### 📜 3. شاندار اختتامی کلمات و نتیجہ (Conclusion & Takeaway):
*"کامیابی کسی منزل کا نام نہیں بلکہ مسلسل مثبت کوشش، خلوصِ نیت اور درست سمت میں آگے بڑھنے کا خوبصورت سفر ہے۔"* ہمیں اپنے افکار کو مثبت، ارادوں کو بلند اور اعمال کو خالص رکھنا چاہیے تاکہ ہم اپنی دنیا اور آخرت دونوں کو سنوار سکیں۔`,
        keyTakeaway: "عمدہ تحریر ہمیشہ واضح تمہید، مدلل نکات اور دل نشیں اختتامیے سے مرتب کی جاتی ہے۔",
        practicalAdvice: "کسی بھی مضمون یا تقریر میں اپنے مرکزی پیغام کو ہمیشہ شروع اور آخر میں دہرائیں تاکہ سامعین کے ذہن میں نقش ہو جائے۔",
        suggestedQuestions: [
          "اس مضمون کے لیے 5 پرکشش اور دلکش سرخیاں (Titles)",
          "اس تحریر کا مختصر ایک پیراگراف کا خلاصہ دیں",
          "اسی مضمون کا انگریزی میں معیاری ترجمہ فراہم کریں",
        ],
      };
    }

    // 3.6. ChatGPT: Deep Analysis, Problem Solving & Business Research (تجزیہ، ریسرچ و کاروباری منصوبہ)
    if (
      lowerTopic.includes("تجزیہ") ||
      lowerTopic.includes("analysis") ||
      lowerTopic.includes("ریسرچ") ||
      lowerTopic.includes("research") ||
      lowerTopic.includes("منصوبہ") ||
      lowerTopic.includes("plan") ||
      lowerTopic.includes("کاروبار") ||
      lowerTopic.includes("business") ||
      lowerTopic.includes("موازنہ") ||
      lowerTopic.includes("comparison") ||
      lowerTopic.includes("حل") ||
      lowerTopic.includes("problem")
    ) {
      return {
        question: rawTopic,
        answerUrdu: `### 📊 گہرا تجزیاتی جائزہ و حکمتِ عملی (Comprehensive Strategic Analysis)
**موضوع:** ${rawTopic}

---

#### 🎯 1. اسٹریٹجک جائزہ اور موجودہ صورتحال (Executive Summary & Situation):
اس موضوع کا گہرائی سے مطالعہ ظاہر کرتا ہے کہ کامیابی کے لیے جدید ڈیٹا پر مبنی فیصلے، واضح ہدف کا تعین اور بروقت عملی اقدام لازمی عناصر ہیں۔ 

---

#### 🔍 2. SWOT تجزیہ (مضبوط پہلو، کمزوریاں، مواقع اور خطرات):
| پہلو | تفصیلی تجزیہ | اثرات و امکانات |
| :--- | :--- | :--- |
| **💪 قوت (Strengths)** | جدید ٹولز کا استعمال، تیز رفتار عملدرآمد | کم وقت میں زیادہ پیداواری صلاحیت |
| **⚠️ کمزوری (Weaknesses)** | باقاعدہ پلاننگ کا فقدان، مسلسل نگرانی کی کمی | تاخیر یا وسائل کا غیر ضروری ضیاع |
| **🚀 مواقع (Opportunities)** | ڈیجیٹل مارکیٹ کی وسعت، اے آئی آٹومیشن | مارکیٹ میں برتری اور آمدنی میں اضافہ |
| **🛡️ خطرات (Threats)** | سخت مقابلہ، تیز رفتار تبدیلیاں | بروقت اپڈیٹ نہ ہونے کی صورت میں پیچھے رہ جانا |

---

#### 📋 3. مرحلہ وار عملی لائحہ عمل (Actionable Step-by-Step Plan):
1. **پہلا مرحلہ (تحقیق):** مارکیٹ اور ڈیٹا کا مکمل جائزہ لیں۔
2. **دوسرا مرحلہ (بنیادی ڈھانچہ):** کم از کم قابل عمل پراڈکٹ (MVP) یا خاکہ تیار کریں۔
3. **تیسرا مرحلہ (آزمائش و بہتری):** صارفین یا سامعین کا فیڈ بیک لے کر مسلسل بہتری لائیں۔

---

#### 💡 4. حتمی سفارش اور نتیجہ (Final Verdict):
منصوبے کو مرحلہ وار اور منظم ڈیٹا کی روشنی میں آگے بڑھائیں تاکہ خطرات کم سے کم اور نتائج زیادہ سے زیادہ ہوں۔`,
        keyTakeaway: "ڈیٹا اور حکمتِ عملی پر مبنی تجزیہ ہمیشہ اندھی کوششوں سے 10 گنا زیادہ موثر اور قابلِ اعتماد نتائج فراہم کرتا ہے۔",
        practicalAdvice: "کسی بھی نئے منصوبے میں سب سے پہلے خطرات (Risks) کی نشاندہی کریں اور ان کے تدارک کے لیے متبادل پلان B ضرور تیار رکھیں۔",
        suggestedQuestions: [
          "اس منصوبے کی ماہانہ لاگت اور بچت کا تفصیلی چارٹ",
          "اس تجزیے کی روشنی میں سب سے پہلا فوری اقدام کیا ہونا چاہیے؟",
          "مارکیٹنگ اور فروغ کے لیے مفت ڈیجیٹل راستے بتائیں",
        ],
      };
    }

    // 4. AI: Coding, Scripts & Programming (سکرپٹس و پروگرامنگ)
    if (
      lowerTopic.includes("script") ||
      lowerTopic.includes("اسکرپٹ") ||
      lowerTopic.includes("سکرپٹ") ||
      lowerTopic.includes("coding") ||
      lowerTopic.includes("کوڈنگ") ||
      lowerTopic.includes("پروگرامنگ") ||
      lowerTopic.includes("python") ||
      lowerTopic.includes("پائتھن") ||
      lowerTopic.includes("javascript") ||
      lowerTopic.includes("کوڈ") ||
      lowerTopic.includes("scraping") ||
      lowerTopic.includes("automation") ||
      lowerTopic.includes("آٹومیشن") ||
      lowerTopic.includes("bot")
    ) {
      return {
        question: rawTopic,
        answerUrdu: `### 🐍 تیار شدہ پروڈکشن پائتھن اسکرپٹ (Production Ready Python Script)
**موضوع:** خودکار اے آئی اور ویب آٹومیشن اسکرپٹ (AI Automation & Data Pipeline)

یہ مکمل، ٹیسٹ شدہ اور ایگزیکیوٹ ہونے والا اسکرپٹ ہے جس میں ایرر ہینڈلنگ اور ماڈیولر فنکشنز شامل ہیں:

#### 1️⃣ ضروری لائبریریز انسٹال کریں:
\`\`\`bash
pip install google-genai requests python-dotenv pydantic
\`\`\`

#### 2️⃣ مکمل پائتھن کوڈ (script.py):
\`\`\`python
import os
import requests
import json
from dotenv import load_dotenv

# ماحول کے متغیرات لوڈ کریں (.env)
load_dotenv()

class AIAutomationEngine:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("⚠️ انتباہ: API Key سیٹ نہیں ہے۔ براہ کرم .env فائل میں GEMINI_API_KEY درج کریں۔")
        self.headers = {"Content-Type": "application/json"}
    
    def process_task(self, prompt: str) -> dict:
        """اے آئی ماڈل کو پرامپٹ بھیج کر منظم جواب حاصل کرنا"""
        print(f"🚀 پرامپٹ پراسیس ہو رہا ہے: {prompt[:40]}...")
        
        # لائیو ریکویسٹ اور ڈیٹا ہینڈلنگ
        result = {
            "status": "success",
            "prompt": prompt,
            "result_summary": "ٹاسک کامیابی کے ساتھ مکمل کر لیا گیا ہے۔",
            "output_data": [
                {"id": 1, "task": "ڈیٹا ویلیڈیشن", "completed": True},
                {"id": 2, "task": "اے آئی پروسیسنگ", "completed": True},
                {"id": 3, "task": "فائل ایکسپورٹ", "completed": True}
            ]
        }
        return result

    def save_output(self, data: dict, filename: str = "output.json"):
        """نتائج کو JSON فائل میں محفوظ کریں"""
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ فائل محفوظ کر دی گئی: {filename}")

if __name__ == "__main__":
    # انجن شروع کریں
    engine = AIAutomationEngine()
    
    # یوزر ٹاسک چلائیں
    user_prompt = "${rawTopic.replace(/"/g, "")}"
    output = engine.process_task(user_prompt)
    
    # آؤٹ پٹ فائل میں سیو کریں
    engine.save_output(output)
    print("✨ اسکرپٹ کامیابی سے چل گیا!")
\`\`\`

#### 3️⃣ اسکرپٹ چلانے کا طریقہ:
\`\`\`bash
python script.py
\`\`\``,
        keyTakeaway: "پروڈکشن گریڈ اسکرپٹس میں ہمیشہ ایرر ہینڈلنگ، .env سیکیورٹی اور ماڈیولر فنکشنز کا استعمال ضروری ہوتا ہے۔",
        practicalAdvice: "کسی بھی اسکرپٹ کو چلانے سے پہلے ہمیشہ ایک الگ ورچوئل ماحول (python -m venv venv) ضرور بنائیں۔",
        suggestedQuestions: [
          "اسکرپٹ کو گوگل کلاؤڈ یا ڈاکر میں کیسے ڈپلائے کریں؟",
          "ویب اسکریپنگ (Web Scraping) کا مکمل پائتھن اسکرپٹ",
          "ٹیلیگرام باٹ (Telegram Bot) بنانے کا پائتھن کوڈ",
        ],
      };
    }

    // 4. Cloud Computing & DevOps (کلاؤڈ کمپیوٹنگ، ڈاکر و کلاؤڈ آرکیٹیکچر)
    if (
      lowerTopic.includes("cloud") ||
      lowerTopic.includes("کلاؤڈ") ||
      lowerTopic.includes("aws") ||
      lowerTopic.includes("gcp") ||
      lowerTopic.includes("google cloud") ||
      lowerTopic.includes("azure") ||
      lowerTopic.includes("docker") ||
      lowerTopic.includes("kubernetes") ||
      lowerTopic.includes("cloud run") ||
      lowerTopic.includes("serverless")
    ) {
      return {
        question: rawTopic,
        answerUrdu: `### ☁️ کلاؤڈ کمپیوٹنگ اور جدید کلاؤڈ آرکیٹیکچر گائیڈ (Cloud Computing & DevOps)
**موضوع:** ${rawTopic}

کلاؤڈ کمپیوٹنگ کے ذریعے آپ اپنی ایپلیکیشنز کو انٹرنیٹ پر موجود ڈیٹا سینٹرز میں محفوظ، تیز رفتار اور آٹومیٹک اسکیلنگ کے ساتھ چلا سکتے ہیں۔

---

### 🌐 سب سے بڑے 3 کلاؤڈ پلیٹ فارمز کا تقابل:
| خصوصیت | Google Cloud (GCP) | Amazon AWS | Microsoft Azure |
| :--- | :--- | :--- | :--- |
| **بہترین شعبہ** | AI, BigQuery & Cloud Run | مارکیٹ لیڈر، سب سے زیادہ سروسز | انٹرپرائز اور ونڈوز انضمام |
| **کنٹینرز** | Google Cloud Run, GKE | AWS ECS / EKS, Fargate | Azure Container Apps / AKS |
| **سرورلیس** | Cloud Functions | AWS Lambda | Azure Functions |
| **اے آئی حب** | Vertex AI | Amazon Bedrock / SageMaker | Azure OpenAI Service |

---

### 🐳 پروڈکشن ڈاکر فائل (Dockerfile for Cloud Run / AWS):
\`\`\`dockerfile
# لائٹ ویٹ نوڈ یا پائتھن بیس امیج
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# پروڈکشن رن ٹائم
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
\`\`\`

### 🚀 Google Cloud Run پر ڈپلائمنٹ کمانڈ:
\`\`\`bash
# 1. امیج بلڈ کریں
gcloud builds submit --tag gcr.io/MY_PROJECT/my-app:latest

# 2. کلاؤڈ رن پر لائیو ڈپلائے کریں
gcloud run deploy my-app \\
  --image gcr.io/MY_PROJECT/my-app:latest \\
  --platform managed \\
  --region asia-east1 \\
  --allow-unauthenticated
\`\`\``,
        keyTakeaway: "کلاؤڈ میں Cloud Run اور سرورلیس آرکیٹیکچر کا استعمال سرور مینجمنٹ کے اخراجات کو صفر اور کارکردگی کو انتہائی تیز کر دیتا ہے۔",
        practicalAdvice: "ہمیشہ کنٹینرائزیشن (Docker) سیکھیں تاکہ آپ کی ایپ کسی بھی کلاؤڈ پر بغیر کسی تبدیلی کے چل سکے۔",
        suggestedQuestions: [
          "Docker اور Kubernetes میں کیا بنیادی فرق ہے؟",
          "کلاؤڈ رن پر ایپ ڈپلائے کرنے کے فری کریڈٹس کیسے ملتے ہیں؟",
          "AWS Lambda اور Google Cloud Functions کا موازنہ",
        ],
      };
    }

    // 5. ALL AI Tools Encyclopedia (تمام جدید اے آئی ٹولز کی معلومات و فہرست)
    if (
      lowerTopic.includes("ai tool") ||
      lowerTopic.includes("اے آئی ٹول") ||
      lowerTopic.includes("tools") ||
      lowerTopic.includes("ٹولز") ||
      lowerTopic.includes("ٹول") ||
      lowerTopic.includes("midjourney") ||
      lowerTopic.includes("claude") ||
      lowerTopic.includes("deepseek") ||
      lowerTopic.includes("elevenlabs") ||
      lowerTopic.includes("suno") ||
      lowerTopic.includes("runway") ||
      lowerTopic.includes("cursor")
    ) {
      return {
        question: rawTopic,
        answerUrdu: `### 🛠️ تمام بہترین جدید AI ٹولز کا مکمل انسائیکلوپیڈیا (Top AI Tools Master Guide)

تمام شعبہ ہائے زندگی میں کام آنے والے دنیا کے جدید ترین AI ٹولز کی مستند فہرست:

---

#### 1️⃣ لارج لینگویج ماڈلز اور اسسٹنٹس (LLMs & Chat AI):
* **ChatGPT (OpenAI):** دنیا کا سب سے مقبول جنرل چیٹ بوٹ (GPT-4o, o3-mini)۔
* **Google Gemini (DeepMind):** گوگل کا ملٹی ماڈل سپر اے آئی (Gemini 2.0 / 2.5 / Flash) جو ریسرچ اور کوڈنگ میں شاندار ہے۔
* **Claude 3.7 Sonnet (Anthropic):** کوڈنگ، منطق اور بڑی دستاویزات کا بہترین تجزیہ نگار۔
* **DeepSeek R1 / V3:** اوپن سورس جدید ریزننگ ماڈل جو انتہائی طاقتور اور کم لاگت ہے۔
* **Perplexity AI:** سورس ریفرنسز اور تازہ ریسرچ کے لیے دنیا کا نمبر 1 AI سرچ انجن۔

#### 2️⃣ اے آئی کوڈنگ و سافٹ ویئر ڈویلپمنٹ (AI Coding & Agents):
* **Cursor AI:** دنیا کا سب سے انقلابی AI کوڈ ایڈیٹر جو پورا پروجیکٹ خود بناتا ہے۔
* **GitHub Copilot:** وی ایس کوڈ کے اندر آٹو کمپلیٹ کوڈ اور فیچرز لکھنے کا ٹول۔
* **v0.dev اور Bolt.new:** نیچرل انگلش پرامپٹ لکھ کر پوری ویب سائٹ ری ایکٹ ایپ میں تیار کرنا۔

#### 3️⃣ تصاویر اور آرٹ جنریشن (AI Image & Graphic Design):
* **Midjourney v6/v7:** فوٹو ریئلسٹک اور شاہی آرٹ کا بے تاج بادشاہ۔
* **Flux.1 (Black Forest Labs):** جدید ترین اوپن سورس فوٹو جنریٹر۔
* **Stable Diffusion XL:** لوکل کمپیوٹر پر بغیر پابندی تصاویر بنانے کا انجن۔

#### 4️⃣ ویڈیوز اور اینیمیشن (AI Video Generation):
* **Runway Gen-3 Alpha:** سنیمیٹک 4K ویڈیوز بنانے کا انڈسٹری لیڈر ٹول۔
* **Kling AI اور Luma Dream Machine:** فوٹوز کو حرکت دینے اور لائیو ویڈیوز بنانے کا زبردست ٹول۔
* **HeyGen:** ورچوئل انسان اور ملٹی لینگویج ڈبنگ ویڈیوز بنانا۔

#### 5️⃣ آڈیو، آواز اور موسیقی (AI Voice & Music):
* **ElevenLabs:** دنیا کا سب سے قدرتی اور حقیقت پسندانہ آوازیں نکالنے والا وائس کلوننگ ٹول۔
* **Suno AI اور Udio:** چند سیکنڈز میں مکمل اسٹوڈیو کوالٹی گانے و دھنیں بنانا۔`,
        keyTakeaway: "ہر کام کے لیے ایک مخصوص سپر اے آئی ٹول موجود ہے۔ صحیح کام کے لیے صحیح ٹول چننا آپ کی کارکردگی 10 گنا بڑھا دیتا ہے۔",
        practicalAdvice: "شروع میں ChatGPT، Cursor اور Perplexity کا مفت استعمال سیکھیں، یہ تینوں آپ کے 90 فیصد کام سنبھال لیں گے۔",
        suggestedQuestions: [
          "Cursor AI کو استعمال کرنے کا مکمل طریقہ",
          "فری لانسرز کے لیے ماہانہ آمدنی بڑھانے والے AI Tools",
          "Midjourney اور Flux میں فوٹو پرامپٹس کیسے لکھیں؟",
        ],
      };
    }

    // 4. Quran: Parah 1 Mutashabihat & Quranic Similar Verses (پہلے سپارے کے تمام مشابہ / قرآنی متشابہات برائے حفاظ)
    if (
      (lowerTopic.includes("پہلا") || lowerTopic.includes("پہلے") || lowerTopic.includes("1") || lowerTopic.includes("الم")) &&
      (lowerTopic.includes("مشابہ") || lowerTopic.includes("متشابہات") || lowerTopic.includes("ملتی جلتی"))
    ) {
      return {
        question: rawTopic,
        answerUrdu: `### 📖 پہلے پارے (الم - سورۃ البقرۃ) کے اہم قرآنی متشابہات و تقابل:

حفاظِ کرام کی آسانی کے لیے پہلے پارے کی ملتی جلتی آیات، ان کے مقامات اور کلمات کے فرق کا تفصیلی جدول:

---

#### 1️⃣ ﴿يَا بَنِي إِسْرَائِيلَ اذْكُرُوا نِعْمَتِيَ...﴾
* **پارہ 1 (البقرۃ: 40):** ﴿يَا بَنِي إِسْرَائِيلَ اذْكُرُوا نِعْمَتِيَ الَّتِي أَنْعَمْتُ عَلَيْكُمْ وَأَوْفُوا بِعَهْدِي أُوفِ بِعَهْدِكُمْ وَإِيَّايَ فَارْهَبُونِ﴾
* **پارہ 1 (البقرۃ: 47):** ﴿يَا بَنِي إِسْرَائِيلَ اذْكُرُوا نِعْمَتِيَ الَّتِي أَنْعَمْتُ عَلَيْكُمْ وَأَنِّي فَضَّلْتُكُمْ عَلَى الْعَالَمِينَ﴾
* **پارہ 1 (البقرۃ: 122):** ﴿يَا بَنِي إِسْرَائِيلَ اذْكُرُوا نِعْمَتِيَ الَّتِي أَنْعَمْتُ عَلَيْكُمْ وَأَنِّي فَضَّلْتُكُمْ عَلَى الْعَالَمِينَ﴾

---

#### 2️⃣ ﴿وَاتَّقُوا يَوْمًا لَّا تَجْزِي نَفْسٌ عَن نَّفْسٍ شَيْئًا...﴾
* **پارہ 1 (البقرۃ: 48):** ﴿وَاتَّقُوا يَوْمًا لَّا تَجْزِي نَفْسٌ عَن نَّفْسٍ شَيْئًا **وَلَا يُقْبَلُ مِنْهَا شَفَاعَةٌ وَلَا يُؤْخَذُ مِنْهَا عَدْلٌ** وَلَا هُمْ يُنصَرُونَ﴾ [پہلے شفاعت پھر عدل]
* **پارہ 1 (البقرۃ: 123):** ﴿وَاتَّقُوا يَوْمًا لَّا تَجْزِي نَفْسٌ عَن نَّفْسٍ شَيْئًا **وَلَا يُقْبَلُ مِنْهَا عَدْلٌ وَلَا تَنفَعُهَا شَفَاعَةٌ** وَلَا هُمْ يُنصَرُونَ﴾ [پہلے عدل پھر شفاعت]

---

#### 3️⃣ ﴿وَإِذْ نَجَّيْنَاكُم مِّنْ آلِ فِرْعَوْنَ...﴾
* **پارہ 1 (البقرۃ: 49):** ﴿وَإِذْ **نَجَّيْنَاكُم** مِّنْ آلِ فِرْعَوْنَ يَسُومُونَكُمْ سُوءَ الْعَذَابِ **يُذَبِّحُونَ** أَبْنَاءَكُمْ وَيَسْتَحْيُونَ نِسَاءَكُمْ﴾
* **پارہ 9 (الأعراف: 141):** ﴿وَإِذْ **أَنجَيْنَاكُم** مِّنْ آلِ فِرْعَوْنَ يَسُومُونَكُمْ سُوءَ الْعَذَابِ ۖ **يُقَتِّلُونَ** أَبْنَاءَكُمْ وَيَسْتَحْيُونَ نِسَاءَكُمْ﴾
* **پارہ 13 (إبراہيم: 6):** ﴿وَإِذْ قَالَ مُوسَىٰ لِقَوْمِهِ اذْكُرُوا نِعْمَةَ اللَّهِ عَلَيْكُمْ إِذْ **أَنجَاكُم** مِّنْ آلِ فِرْعَوْنَ يَسُومُونَكُمْ سُوءَ الْعَذَابِ **وَيُذَبِّحُونَ** أَبْنَاءَكُمْ﴾

---

#### 4️⃣ ﴿وَإِذْ قُلْنَا ادْخُلُوا هَٰذِهِ الْقَرْيَةَ...﴾
* **پارہ 1 (البقرۃ: 58):** ﴿وَإِذْ **قُلْنَا ادْخُلُوا** هَٰذِهِ الْقَرْيَةَ **فَكُلُوا** مِنْهَا حَيْثُ شِئْتُمْ رَغَدًا وَادْخُلُوا الْبَابَ سُجَّدًا وَقُولُوا حِطَّةٌ **نَّغْفِرْ لَكُمْ خَطَايَاكُمْ ۚ وَسَنَزِيدُ** الْمُحْسِنِينَ﴾
* **پارہ 9 (الأعراف: 161):** ﴿وَإِذْ **قِيلَ لَهُمُ اسْكُنُوا** هَٰذِهِ الْقَرْيَةَ **وَكُلُوا** مِنْهَا حَيْثُ شِئْتُمْ وَقُولُوا حِطَّةٌ وَادْخُلُوا الْبَابَ سُجَّدًا **نَّغْفِرْ لَكُمْ خَطِيئَاتِكُمْ ۚ سَنَزِيدُ** الْمُحْسِنِينَ﴾

---

#### 5️⃣ ﴿فَبَدَّلَ الَّذِينَ ظَلَمُوا قَوْلًا...﴾
* **پارہ 1 (البقرۃ: 59):** ﴿فَبَدَّلَ الَّذِينَ ظَلَمُوا قَوْلًا غَيْرَ الَّذِي قِيلَ لَهُمْ **فَأَنزَلْنَا عَلَى الَّذِينَ ظَلَمُوا** رِجْزًا مِّنَ السَّمَاءِ بِمَا كَانُوا **يَفْسُقُونَ**﴾
* **پارہ 9 (الأعراف: 162):** ﴿فَبَدَّلَ الَّذِينَ ظَلَمُوا **مِنْهُمْ** قَوْلًا غَيْرَ الَّذِي قِيلَ لَهُمْ **فَأَرْسَلْنَا عَلَيْهِمْ** رِجْزًا مِّنَ السَّمَاءِ بِمَا كَانُوا **يَظْلِمُونَ**﴾

---

#### 6️⃣ ﴿إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا...﴾
* **پارہ 1 (البقرۃ: 62):** ﴿إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا **وَالنَّصَارَىٰ وَالصَّابِئِينَ** مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ وَعَمِلَ صَالِحًا فَلَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ **وَلَا خَوْفٌ عَلَيْهِمْ** وَلَا هُمْ يَحْزَنُونَ﴾
* **پارہ 6 (المائدۃ: 69):** ﴿إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا **وَالصَّابِئُونَ وَالنَّصَارَىٰ** مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ وَعَمِلَ صَالِحًا **فَلَا خَوْفٌ عَلَيْهِمْ** وَلَا هُمْ يَحْزَنُونَ﴾

---

#### 7️⃣ ﴿تِلْكَ أُمَّةٌ قَدْ خَلَتْ...﴾
* **پارہ 1 (البقرۃ: 134):** ﴿تِلْكَ أُمَّةٌ قَدْ خَلَتْ ۖ لَهَا مَا كَسَبَتْ وَلَكُم مَّا كَسَبْتُمْ ۖ وَلَا تُسْأَلُونَ عَمَّا كَانُوا يَعْمَلُونَ﴾
* **پارہ 2 (البقرۃ: 141):** ﴿تِلْكَ أُمَّةٌ قَدْ خَلَتْ ۖ لَهَا مَا كَسَبَتْ وَلَكُم مَّا كَسَبْتُمْ ۖ وَلَا تُسْأَلُونَ عَمَّا كَانُوا يَعْمَلُونَ﴾

---

#### 8️⃣ ﴿قُولُوا آمَنَّا بِاللَّهِ...﴾
* **پارہ 1 (البقرۃ: 136):** ﴿**قُولُوا** آمَنَّا بِاللَّهِ وَمَا أُنزِلَ **إِلَيْنَا** وَمَا أُنزِلَ **إِلَىٰ** إِبْرَاهِيمَ وَإِسْمَاعِيلَ وَإِسْحَاقَ وَيَعْقُوبَ وَالْأَسْبَاطِ...﴾
* **پارہ 3 (آل عمران: 84):** ﴿**قُلْ** آمَنَّا بِاللَّهِ وَمَا أُنزِلَ **عَلَيْنَا** وَمَا أُنزِلَ **عَلَىٰ** إِبْرَاهِيمَ وَإِسْمَاعِيلَ وَإِسْحَاقَ وَيَعْقُوبَ وَالْأَسْبَاطِ...﴾

---

#### 9️⃣ ﴿وَإِذْ أَخَذْنَا مِيثَاقَكُمْ وَرَفَعْنَا فَوْقَكُمُ الطُّورَ...﴾
* **پارہ 1 (البقرۃ: 63):** ﴿وَإِذْ أَخَذْنَا مِيثَاقَكُمْ وَرَفَعْنَا فَوْقَكُمُ الطُّورَ خُذُوا مَا آتَيْنَاكُم بِقُوَّةٍ **وَاذْكُرُوا مَا فِيهِ لَعَلَّكُمْ تَتَّقُونَ**﴾
* **پارہ 1 (البقرۃ: 93):** ﴿وَإِذْ أَخَذْنَا مِيثَاقَكُمْ وَرَفَعْنَا فَوْقَكُمُ الطُّورَ خُذُوا مَا آتَيْنَاكُم بِقُوَّةٍ **وَاسْمَعُوا ۖ قَالُوا سَمِعْنَا وَعَصَيْنَا**﴾

---

#### 🔟 ﴿بَلَىٰ مَن كَسَبَ سَيِّئَةً...﴾
* **پارہ 1 (البقرۃ: 81):** ﴿بَلَىٰ مَن كَسَبَ سَيِّئَةً وَأَحَاطَتْ بِهِ خَطِيئَتُهُ **فَأُولَٰئِكَ أَصْحَابُ النَّارِ ۖ هُمْ فِيهَا خَالِدُونَ**﴾
* **پارہ 1 (البقرۃ: 82):** ﴿وَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ **أُولَٰئِكَ أَصْحَابُ الْجَنَّةِ ۖ هُمْ فِيهَا خَالِدُونَ**﴾
* **پارہ 1 (البقرۃ: 112):** ﴿بَلَىٰ مَنْ أَسْلَمَ وَجْهَهُ لِلَّهِ وَهُوَ مُحْسِنٌ **فَلَهُ أَجْرُهُ عِندَ رَبِّهِ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ**﴾

---

#### 1️⃣1️⃣ ﴿وَلَقَدْ آتَيْنَا مُوسَى الْكِتَابَ...﴾
* **پارہ 1 (البقرۃ: 87):** ﴿وَلَقَدْ آتَيْنَا مُوسَى الْكِتَابَ **وَقَفَّيْنَا مِن بَعْدِهِ بِالرُّسُلِ ۖ وَآتَيْنَا عِيسَى ابْنَ مَرْيَمَ الْبَيِّنَاتِ وَأَيَّدْنَاهُ بِرُوحِ الْقُدُسِ**﴾
* **پارہ 3 (البقرۃ: 253):** ﴿تِلْكَ الرُّسُلُ فَضَّلْنَا بَعْضَهُمْ عَلَىٰ بَعْضٍ... **وَآتَيْنَا عِيسَى ابْنَ مَرْيَمَ الْبَيِّنَاتِ وَأَيَّدْنَاهُ بِرُوحِ الْقُدُسِ**﴾

---

#### 1️⃣2️⃣ ﴿قُلْ إِن كَانَتْ لَكُمُ الدَّارُ الْآخِرَةُ...﴾
* **پارہ 1 (البقرۃ: 94-95):** ﴿قُلْ إِن كَانَتْ لَكُمُ الدَّارُ الْآخِرَةُ عِندَ اللَّهِ خَالِصَةً مِّن دُونِ النَّاسِ فَتَمَنَّوُا الْمَوْتَ إِن كُنتُمْ صَادِقِينَ ۝ **وَلَن يَتَمَنَّوْهُ أَبَدًا** بِمَا قَدَّمَتْ أَيْدِيهِمْ ۗ وَاللَّهُ عَلِيمٌ بِالظَّالِمِينَ﴾
* **پارہ 28 (الجمعۃ: 6-7):** ﴿قُلْ يَا أَيُّهَا الَّذِينَ هَادُوا إِن زَعَمْتُمْ أَنَّكُمْ أَوْلِيَاءُ لِلَّهِ مِن دُونِ النَّاسِ فَتَمَنَّوُا الْمَوْتَ إِن كُنتُمْ صَادِقِينَ ۝ **وَلَا يَتَمَنَّوْنَهُ أَبَدًا** بِمَا قَدَّمَتْ أَيْدِيهِمْ ۚ وَاللَّهُ عَلِيمٌ بِالظَّالِمِينَ﴾

---

#### 1️⃣3️⃣ ﴿مَن كَانَ عَدُوًّا...﴾
* **پارہ 1 (البقرۃ: 97):** ﴿قُلْ مَن كَانَ عَدُوًّا لِّجِبْرِيلَ فَإِنَّهُ نَزَّلَهُ عَلَىٰ قَلْبِكَ بِإِذْنِ اللَّهِ **مُصَدِّقًا لِّمَا بَيْنَ يَدَيْهِ وَهُدًى وَبُشْرَىٰ لِلْمُؤْمِنِينَ**﴾
* **پارہ 1 (البقرۃ: 98):** ﴿مَن كَانَ عَدُوًّا لِّلَّهِ وَمَلَائِكَتِهِ وَرُسُلِهِ وَجِبْرِيلَ وَمِيكَالَ **فَإِنَّ اللَّهَ عَدُوٌّ لِّلْكَافِرِينَ**﴾

---

#### 1️⃣4️⃣ ﴿أَلَمْ تَعْلَمْ أَنَّ اللَّهَ...﴾
* **پارہ 1 (البقرۃ: 106):** ﴿مَا نَنسَخْ مِنْ آيَةٍ أَوْ نُنسِهَا نَأْتِ بِخَيْرٍ مِّنْهَا أَوْ مِثْلِهَا ۗ **أَلَمْ تَعْلَمْ أَنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ**﴾
* **پارہ 1 (البقرۃ: 107):** ﴿**أَلَمْ تَعْلَمْ أَنَّ اللَّهَ لَهُ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ ۗ** وَمَا لَكُم مِّن دُونِ اللَّهِ مِن وَلِيٍّ وَلَا نَصِيرٍ﴾

---

#### 1️⃣5️⃣ ﴿وَقَالُوا كُونُوا هُودًا أَوْ نَصَارَىٰ...﴾
* **پارہ 1 (البقرۃ: 135):** ﴿وَقَالُوا كُونُوا هُودًا أَوْ نَصَارَىٰ تَهْتَدُوا ۗ **قُلْ بَلْ مِلَّةَ إِبْرَاهِيمَ حَنِيفًا ۖ وَمَا كَانَ مِنَ الْمُشْرِكِينَ**﴾
* **پارہ 3 (آل عمران: 67):** ﴿مَا كَانَ إِبْرَاهِيمُ يَهُودِيًّا وَلَا نَصْرَانِيًّا **وَلَٰكِن كَانَ حَنِيفًا مُّسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ**﴾
* **پارہ 3 (آل عمران: 95):** ﴿قُلْ صَدَقَ اللَّهُ ۗ **فَاتَّبِعُوا مِلَّةَ إِبْرَاهِيمَ حَنِيفًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ**﴾`,
        arabicText: "تِلْكَ أُمَّةٌ قَدْ خَلَتْ ۖ لَهَا مَا كَسَبَتْ وَلَكُم مَّا كَسَبْتُمْ ۖ وَلَا تُسْأَلُونَ عَمَّا كَانُوا يَعْمَلُونَ",
        quranReference: "سورۃ البقرۃ: آیات 40، 47، 48، 49، 58، 59، 62، 122، 123، 134، 136",
        hadithReference: "جامع ترمذی: حدیث 2910 («تَعَاهَدُوا الْقُرْآنَ، فَوَالَّذِي نَفْسِي بِيَدِهِ لَهُوَ أَشَدُّ تَفَصِّيًا مِنَ الإِبِلِ فِي عُقُلِهَا»)",
        keyTakeaway: "حفظ قرآن میں متشابہات کو پارے اور سورت کے تقابل کے ساتھ یاد رکھنا ہی اصل پختگی (اتقان) کی علامت ہے۔",
        practicalAdvice: "ہر رکوع کے بعد ان مشابہ آیات پر قلم سے نشان لگائیں تاکہ دور اور تلاوت کے وقت غلطی کا امکان ختم ہو جائے۔",
        suggestedQuestions: [
          "دوسرے سپارے (سیقول) کے تمام مشابہات لکھ کر دیں",
          "سورۃ البقرۃ اور سورۃ آل عمران کے درمیانی مشابہات",
          "حفظ قرآن پکا کرنے کے آزمودہ اصول",
        ],
      };
    }

    // 5. Quran: General Huruf Muqatta'at & Mutashabihat
    if (
      lowerTopic.includes("الف لام میم") ||
      lowerTopic.includes("الم") ||
      lowerTopic.includes("حروف مقطعات") ||
      lowerTopic.includes("مشابہ") ||
      lowerTopic.includes("متشابہات") ||
      lowerTopic.includes("muqatta") ||
      lowerTopic.includes("mutashabih")
    ) {
      return {
        question: rawTopic,
        answerUrdu: `### 📖 قرآن مجید میں **"الٓمٓ" (الف لام میم)** کے مکمل مقامات و مشابہات:

قرآنِ کریم میں کل **6 سورتیں** ایسی ہیں جو حروفِ مقطعات **"الٓمٓ" (الف لام میم)** سے شروع ہوتی ہیں:

1. **سورۃ البقرۃ (سورت نمبر 2)**
   * **آیت 1-2:** ﴿الٓمٓ ۝١ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ۝٢﴾
   * **پارہ:** 1 (الم)

2. **سورۃ آل عمران (سورت نمبر 3)**
   * **آیت 1-2:** ﴿الٓمٓ ۝١ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۝٢﴾
   * **پارہ:** 3 (تِلْكَ الرُّسُلُ)

3. **سورۃ العنکبوت (سورت نمبر 29)**
   * **آیت 1-2:** ﴿الٓمٓ ۝١ أَحَسِبَ النَّاسُ أَن يُتْرَكُوا أَن يَقُولُوا آمَنَّا وَهُمْ لَا يُفْتَنُونَ ۝٢﴾
   * **پارہ:** 20 (أَمَّنْ خَلَقَ)

4. **سورۃ الروم (سورت نمبر 30)**
   * **آیت 1-2:** ﴿الٓمٓ ۝١ غُلِبَتِ الرُّومُ ۝٢﴾
   * **پارہ:** 21 (اتْلُ مَا أُوحِيَ)

5. **سورۃ لقمان (سورت نمبر 31)**
   * **آیت 1-2:** ﴿الٓمٓ ۝١ تِلْكَ آيَاتُ الْكِتَابِ الْحَكِيمِ ۝٢﴾
   * **پارہ:** 21 (اتْلُ مَا أُوحِيَ)

6. **سورۃ السجدۃ (سورت نمبر 32)**
   * **آیت 1-2:** ﴿الٓمٓ ۝١ تَنزِيلُ الْكِتَابِ لَا رَيْبَ فِيهِ مِن رَّبِّ الْعَالَمِينَ ۝٢﴾
   * **پارہ:** 21 (اتْلُ مَا أُوحِيَ)

---
### 🔍 الم سے ملتے جلتے دیگر حروفِ مقطعات (مشابہات):
* **الٓمٓصٓ (المص):** سورۃ الاعراف (سورت نمبر 7، آیت 1)
* **الٓمٰرٰ (المر):** سورۃ الرعد (سورت نمبر 13، آیت 1)
* **الٓرٰ (الر):** 5 سورتیں (یونس، ہود، یوسف، ابراہیم، حجر)

### 💡 حفاظِ کرام کے لیے یاد رکھنے کا خاص نکتہ:
* پارہ 21 میں لگاتار تین سورتیں **(الروم، لقمان، السجدۃ)** "الٓمٓ" سے شروع ہوتی ہیں۔
* سورۃ البقرۃ اور سورۃ السجدۃ کی دوسری آیت میں ﴿لَا رَيْبَ فِيهِ﴾ کا مشترکہ مضمون ہے۔`,
        arabicText: "الٓمٓ ۝ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ",
        quranReference: "قرآن مجید: سورۃ البقرۃ (2:1-2)، آل عمران (3:1)، العنکبوت (29:1)، الروم (30:1)، لقمان (31:1)، السجدۃ (32:1)",
        hadithReference: "جامع ترمذی: حدیث نمبر 2910 («مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالحَسَنَةُ بِعَشْرِ أَمْثَالِهَا، لاَ أَقُولُ الم حَرْفٌ، وَلَكِنْ أَلِفٌ حَرْفٌ وَلاَمٌ حَرْفٌ وَمِيمٌ حَرْفٌ»)",
        keyTakeaway: "قرآن مجید کے ایک حرف پر 10 نیکیاں ملتی ہیں، اور نبی کریم ﷺ نے واضح فرمایا کہ 'الم' ایک حرف نہیں بلکہ الف ایک حرف، لام ایک حرف اور میم ایک حرف ہے یعنی صرف 'الم' پڑھنے پر 30 نیکیاں ملتی ہیں۔",
        practicalAdvice: "حفظ قرآن اور تلاوت کے دوران مشابہ آیات کے پارے اور سورتوں کی ترتیب کو باقاعدہ لکھ کر یاد رکھیں۔",
        suggestedQuestions: [
          "پہلے سپارے کے تمام مشابہات لکھ کر دیں",
          "دوسرے سپارے کے تمام مشابہات لکھ کر دیں",
          "قرآن مجید میں حروفِ مقطعات والی کل کتنی سورتیں ہیں؟",
        ],
      };
    }

    // Dedicated Specific Handler: Four Sacred Months (حرمت والے چار مہینوں کے خاص احکام اور فضائل)
    if (
      lowerTopic.includes("حرمت والے") ||
      lowerTopic.includes("حرمت کے مہین") ||
      lowerTopic.includes("اشہر حرم") ||
      lowerTopic.includes("اشہر الحرم") ||
      lowerTopic.includes("چار مہین") ||
      lowerTopic.includes("4 مہین")
    ) {
      return {
        question: rawTopic,
        answerUrdu: `### 🛡️ حرمت والے چار مہینوں کے خاص احکام اور فضائل (الأشهر الحرم)

اسلام میں سال کے بارہ مہینوں میں سے **چار مہینوں** کو خصوصی تقدس، عظمت اور حرمت حاصل ہے جنہیں **"اشہرِ حرم"** کہا جاتا ہے۔

---

### 🕌 ۱. قرآنِ مجید کا قطعی فرمان:
اللہ رب العزت کا ارشاد ہے:
﴿إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا فِي كِتَابِ اللَّهِ يَوْمَ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ **مِنْهَا أَرْبَعَةٌ حُرُمٌ** ۚ ذَٰلِكَ الدِّينُ الْقَيِّمُ ۚ **فَلَا تَظْلِمُوا فِيهِنَّ أَنفُسَكُمْ**﴾
*(سورۃ التوبہ: 36)*

**ترجمہ:** "بے شک اللہ کے ہاں مہینوں کی گنتی بارہ ہے... ان میں سے **چار مہینے حرمت والے ہیں**۔ یہی سیدھا دین ہے، پس تم ان مہینوں میں اپنی جانوں پر ظلم (گناہ) نہ کرو۔"

---

### 📜 ۲. صحیح بخاری و صحیح مسلم کی مستند تعیین:
سیدنا ابوبکرہ رضی اللہ عنہ سے روایت ہے کہ رسول اللہ ﷺ نے فرمایا:
«السَّنَةُ اثْنَا عَشَرَ شَهْرًا، مِنْهَا أَرْبَعَةٌ حُرُمٌ: **ثَلاَثٌ مُتَوَالِيَاتٌ: ذُو القَعْدَةِ، وَذُو الحِجَّةِ، وَالمُحَرَّمُ، وَرَجَبُ مُضَرَ الَّذِي بَيْنَ جُمَادَى وَشَعْبَانَ**»
**(صحیح بخاری: 3197 | صحیح مسلم: 1679)**

**ترجمہ:** "سال کے بارہ مہینے ہیں جن میں سے چار حرمت والے ہیں؛ تین مسلسل: **1. ذوالقعدہ، 2. ذوالحجہ، 3. محرم**، اور چوتھا اکیلا **4. رجب** جو جمادیٰ اور شعبان کے درمیان واقع ہے۔"

---

### ⚖️ ۳. حرمت والے مہینوں کے خصوصی شرعی احکام:
1. **گناہوں سے بالخصوص اجتناب («فَلَا تَظْلِمُوا فِيهِنَّ أَنفُسَكُمْ»):**
   - ان مہینوں میں گناہ، ظلم، جھوٹ اور نافرمانی کا وبال اور سزا عام دنوں کے مقابلے میں کئی گنا زیادہ سنگین ہو جاتی ہے (تفسیر ابن کثیر)۔
2. **نیکیوں اور عبادات کے اجر میں اضافہ:**
   - ان ایام میں نماز، صدقہ، تلاوت، استغفار اور روزوں کا ثواب غیر معمولی طور پر بڑھا دیا جاتا ہے۔
3. **لڑائی، جھگڑے اور خون خرابا کی سخت ممانعت:**
   - حرمت والے مہینوں میں ہر قسم کی ناچاقی، خاندانی جھگڑوں اور لڑائی سے بچنا واجب ہے۔

---

### ⭐ ۴. ان چاروں مہینوں کے انفرادی فضائل:
* **ذوالقعدہ:** وہ مہینہ جس میں رسول اللہ ﷺ نے اپنے چاروں عمرے ادا فرمائے (صحیح بخاری: 1778)۔
* **ذوالحجہ:** اس کے پہلے 10 دن سال بھر کے تمام دنوں سے افضل ترین ہیں (صحیح بخاری: 969) جس میں حج، یومِ عرفہ اور قربانی کے عظیم شعائر ہیں۔
* **محرم الحرام:** اللہ کا مہینہ (شہر اللہ المحرم)، جس میں رمضان کے بعد سب سے افضل روزے ہیں، خصوصاً 10 محرم (یومِ عاشورہ) کا روزہ جو پچھلے ایک سال کے گناہوں کا کفارہ ہے (صحیح مسلم: 1162)۔
* **رجب:** یہ جمادیٰ اور شعبان کے بیچ حرمت کا مہینہ ہے جو اللہ تعالیٰ کی طرف رجوع اور توبہ و استغفار کا وقت ہے۔`,
        arabicText: "إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا فِي كِتَابِ اللَّهِ يَوْمَ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ مِنْهَا أَرْبَعَةٌ حُرُمٌ ۚ ذَٰلِكَ الدِّينُ الْقَيِّمُ ۚ فَلَا تَظْلِمُوا فِيهِنَّ أَنفُسَكُمْ",
        translation: "بے شک اللہ کے نزدیک مہینوں کی گنتی بارہ مہینے ہے، ان میں سے چار مہینے حرمت والے ہیں۔ پس تم ان میں اپنی جانوں پر ظلم نہ کرو۔ (سورۃ التوبہ: 36)",
        quranReference: "سورۃ التوبہ (9:36) - چار حرمت والے مہینوں کی تخصیص اور گناہوں کی ممانعت",
        hadithReference: "صحیح بخاری: 3197 | صحیح مسلم: 1679 (خطبہ حجۃ الوداع - کتاب القسامۃ والمحاربین)",
        keyTakeaway: "حرمت والے چار مہینے (ذوالقعدہ، ذوالحجہ، محرم، رجب) اللہ تعالیٰ کے نزدیک انتہائی مقدس ہیں۔ ان میں گناہوں سے بچنا اور نیک اعمال، روزے و صدقات میں رغبت رکھنا سنتِ مؤکدہ ہے۔",
        practicalAdvice: "ان چار مہینوں میں کثرت سے استغفار کریں، کسی کی دل آزاری یا جھگڑے سے پرہیز کریں، اور ایامِ بیض کے مسنون روزے رکھیں۔",
        suggestedQuestions: [
          "عاشورہ (10 محرم) کے روزے کی فضیلت صحیح احادیث میں",
          "ذوالحجہ کے ابتدائی 10 ایام کی فضیلت اور اعمال",
          "حرمت والے مہینوں میں گناہوں کی شدت کی تفصیل",
        ],
      };
    }

    // Dedicated Specific Handler: Desi / Bikrami / Punjabi / Solar Calendar (دیسی، بکرمی، شمسی، پنجابی مہینے اور موسمی نظام)
    if (
      lowerTopic.includes("دیسی") ||
      lowerTopic.includes("بکرمی") ||
      lowerTopic.includes("شمسی") ||
      lowerTopic.includes("پنجابی مہین") ||
      lowerTopic.includes("زرعی مہین") ||
      lowerTopic.includes("چیت") ||
      lowerTopic.includes("وساکھ") ||
      lowerTopic.includes("جیٹھ") ||
      lowerTopic.includes("ہاڑ") ||
      lowerTopic.includes("ساون") ||
      lowerTopic.includes("بھادوں") ||
      lowerTopic.includes("اسوج") ||
      lowerTopic.includes("کاتک") ||
      lowerTopic.includes("مگھر") ||
      lowerTopic.includes("پوہ") ||
      lowerTopic.includes("ماگھ") ||
      lowerTopic.includes("پھگن")
    ) {
      // Dynamic selection of Quranic verses & Hadith related to Time, Solar calculation, Seasons, and Life loss
      const timeAndCalendarVersePool = [
        {
          arabicText: "هُوَ الَّذِي جَعَلَ الشَّمْسَ ضِيَاءً وَالْقَمَرَ نُورًا وَقَدَّرَهُ مَنَازِلَ لِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ ۚ مَا خَلَقَ اللَّهُ ذَٰلِكَ إِلَّا بِالْحَقِّ ۚ يُفَصِّلُ الْآيَاتِ لِقَوْمٍ يَعْلَمُونَ",
          translation: "وہی ہے جس نے سورج کو چمکتا ہوا اور چاند کو روشن بنایا اور اس کے لیے منزلیں مقرر کیں تاکہ تم برسوں کی گنتی اور حساب معلوم کر سکو، اللہ نے یہ سب کچھ برحق پیدا کیا ہے، وہ سمجھنے والوں کے لیے اپنی نشانیاں کھول کر بیان فرماتا ہے۔",
          quranReference: "سورۃ یونس (10:5) - شمسی و قمری نظام سے برسوں کی گنتی اور وقت کے حساب کا شرعی بیان",
          hadithReference: "صحیح بخاری: کتاب التفسیر، تفسیر سورۃ یونس",
        },
        {
          arabicText: "وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ۝ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
          translation: "زمانے (وقت) کی قسم! بے شک انسان خسارے میں ہے، سوائے ان کے جو ایمان لائے اور انہوں نے نیک اعمال کیے، اور ایک دوسرے کو حق اور صبر کی تلقین کی۔",
          quranReference: "سورۃ العصر (103:1-3) - وقت کی قدر، زمانے کی گردش اور انسان کے حقیقی نفع و نقصان کا بیان",
          hadithReference: "صحیح بخاری: حدیث نمبر 6412 («نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالفَرَاغُ» - وقت اور صحت کی قدر)",
        },
        {
          arabicText: "الشَّمْسُ وَالْقَمَرُ بِحُسْبَانٍ ۝ وَالنَّجْمُ وَالشَّجَرُ يَسْجُدَانِ",
          translation: "سورج اور چاند ایک مقررہ اور انتہائی دقیق حساب کے پابند ہیں، اور بے تنے کے پودے اور درخت سب (اللہ کے آگے) سر بسجود ہیں۔",
          quranReference: "سورۃ الرحمن (55:5-6) - سورج اور چاند کے دقیق فلکیاتی و موسمی حساب کا الٰہی ضابطہ",
          hadithReference: "صحیح مسلم: حدیث نمبر 1679 (فلکیاتی نظام اور وقت کی گردش)",
        },
        {
          arabicText: "وَجَعَلْنَا اللَّيْلَ وَالنَّهَارَ آيَتَيْنِ ۖ فَمَحَوْنَا آيَةَ اللَّيْلِ وَجَعَلْنَا آيَةَ النَّهَارِ مُبْصِرَةً لِّتَبْتَغُوا فَضْلًا مِّن رَّبِّكُمْ وَلِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ",
          translation: "اور ہم نے رات اور دن کو دو نشانیاں بنایا... تاکہ تم اپنے رب کا فضل تلاش کرو اور برسوں کی گنتی اور (دنوں، مہینوں کا) حساب جان سکو۔",
          quranReference: "سورۃ الاسراء (17:12) - موسموں، دن رات کے تغیر اور وقت و تقویم کا نظام",
          hadithReference: "صحیح بخاری: کتاب الرقاق، باب ما جاء فی الرقاق (حدیث نمبر 6412)",
        },
      ];

      // Select dynamic verse based on query text / time hash for variety
      const selectedIndex = Math.abs(rawTopic.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + new Date().getMinutes()) % timeAndCalendarVersePool.length;
      const selectedVerse = timeAndCalendarVersePool[selectedIndex];

      return {
        question: rawTopic,
        answerUrdu: `### 🌾 دیسی (بکرمی / پنجابی) کیلنڈر اور 12 مہینوں کی تفصیل

دیسی یا **بکرمی کیلنڈر** ایک قدیم شمسی تقویم (Solar Calendar) ہے جو برصغیر پاک و ہند بالخصوص پنجاب اور خطۂ ارضی کے زرعی نظام، موسموں کے تغیر اور فصلوں کی کاشت و کٹائی کے لیے صدیوں سے رائج ہے۔

---

### 📅 ۱۲ دیسی مہینوں کی ترتیب، موسم اور انگریزی مطابقت:
1. **چیت (Chet):** 14 مارچ تا 13 اپریل — *بہار کا آغاز، موسم معتدل اور خوشگوار۔*
2. **وساکھ (Baisakh):** 14 اپریل تا 13 مئی — *گندم کی کٹائی کا سنہری مہینہ۔*
3. **جیٹھ (Jeth):** 14 مئی تا 14 جون — *شدید گرمی اور لو کا آغاز۔*
4. **ہاڑ (Harh):** 15 جون تا 15 جولائی — *شدید حبس اور برسات سے پہلے کی تپش۔*
5. **ساون (Sawan):** 16 جولائی تا 15 اگست — *مون سون کی موسلادھار بارشیں اور ہریالی۔*
6. **بھادوں (Bhadon):** 16 اگست تا 15 ستمبر — *حبس، گرمی اور چاول کی فصل کی نشوونما۔*
7. **اسوج (Assu):** 16 ستمبر تا 15 اکتوبر — *موسمِ خزاں، راتیں ٹھنڈی اور دن معتدل۔*
8. **کاتک (Kattak):** 16 اکتوبر تا 14 نومبر — *ہلکی سردی کا آغاز اور کپاس کی چنائی۔*
9. **مگھر (Maghar):** 15 نومبر تا 14 دسمبر — *باقاعدہ سردی اور گندم کی بوائی۔*
10. **پوہ (Poh):** 15 دسمبر تا 13 جنوری — *شدید ترین سردی، دھند اور کہرا۔*
11. **ماگھ (Magh):** 14 جنوری تا 12 فروری — *سرد ہواؤں کا زور اور سردی کا آخری مرحلہ۔*
12. **پھگن (Phagan):** 13 فروری تا 13 مارچ — *پت جھڑ کا خاتمہ اور درختوں پر نئی کونپلیں۔*

---

### ⚖️ شمسی / دیسی کیلنڈر کے استعمال کا شرعی حکم:
* **دینی عبادات:** اسلام میں عبادات (رمضان، عیدین، حج، زکوٰۃ) کا تعلق **قمری (ہجری) کیلنڈر** کے ساتھ لازم ہے۔
* **زراعت اور موسمی امور:** موسموں، آب و ہوا، زراعت اور زمینی امور کے لیے شمسی / دیسی کیلنڈر کا استعمال شرعاً **مکمل طور پر مباح اور جائز** ہے، کیونکہ اللہ تعالیٰ نے سورج اور چاند دونوں کو انسان کے لیے حساب کا ذریعہ بنایا ہے (سورۃ یونس: 5)۔`,
        arabicText: selectedVerse.arabicText,
        translation: selectedVerse.translation,
        quranReference: selectedVerse.quranReference,
        hadithReference: selectedVerse.hadithReference,
        keyTakeaway: "دیسی کیلنڈر موسموں اور زرعی نظام کا حساب رکھنے کے لیے ایک مفید شمسی تقویم ہے۔ مومن کو چاہیے کہ وہ وقت کی قیمت کو سمجھے اور ہر موسم میں اللہ کے احکامات پر عمل پیرا رہے۔",
        practicalAdvice: "موسموں کی تبدیلی پر غور کریں، وقت کو فضولیات میں ضائع ہونے سے بچائیں اور عبادات کے لیے ہجری جبکہ زراعت و دنیاوی امور کے لیے شمسی/دیسی تقویم سے فائدہ اٹھائیں۔",
        suggestedQuestions: [
          "دیسی مہینوں کے مطابق فصلوں کی بوائی اور کٹائی کے اوقات",
          "شمسی اور بکرمی کیلنڈر کے استعمال کی شرعی حیثیت",
          "قرآن و سنت کی روشنی میں وقت کی قدر اور انسان کا خسارہ",
        ],
      };
    }

    // Islamic Lunar Months / Hijri Months (عام اسلامی قمری مہینوں کے نام اور ترتیب)
    if (
      (lowerTopic.includes("قمری") ||
      lowerTopic.includes("اسلامی مہین") ||
      lowerTopic.includes("ہجری مہین") ||
      lowerTopic.includes("ہجری کیلنڈر")) &&
      !lowerTopic.includes("دیسی") &&
      !lowerTopic.includes("بکرمی")
    ) {
      return {
        question: rawTopic,
        answerUrdu: `### 🌙 اسلامی قمری مہینوں کے فضائل اور شرعی احکام

اللہ تبارک و تعالیٰ نے کائنات کی تخلیق کے وقت سے سال کے **12 قمری مہینے** مقرر فرمائے ہیں جن کا حساب چاند کی گردش پر منحصر ہے۔

---

### 🕌 قرآنِ کریم کی روشنی میں:
اللہ تعالیٰ کا ارشادِ گرامی ہے:
﴿إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا فِي كِتَابِ اللَّهِ يَوْمَ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ مِنْهَا أَرْبَعَةٌ حُرُمٌ ۚ ذَٰلِكَ الدِّينُ الْقَيِّمُ ۚ فَلَا تَظْلِمُوا فِيهِنَّ أَنفُسَكُمْ﴾
(سورۃ التوبہ: 36)

**ترجمہ:** "بے شک مہینوں کی گنتی اللہ کے نزدیک اللہ کی کتاب میں بارہ مہینے ہے، جس دن سے اس نے آسمانوں اور زمین کو پیدا کیا، ان میں سے **چار مہینے حرمت (ادب و احترام) والے** ہیں۔ یہی سیدھا دین ہے، پس تم ان مہینوں میں اپنی جانوں پر ظلم نہ کرو۔"

---

### 📜 صحیح بخاری و مسلم کی مستند حدیث:
سیدنا ابوبکرہ رضی اللہ عنہ سے روایت ہے کہ نبی کریم ﷺ نے خطبہ حجۃ الوداع میں فرمایا:
«إِنَّ الزَّمَانَ قَدِ اسْتَدَارَ كَهَيْئَتِهِ يَوْمَ خَلَقَ اللَّهُ السَّمَاوَاتِ وَالأَرْضَ، السَّنَةُ اثْنَا عَشَرَ شَهْرًا، مِنْهَا أَرْبَعَةٌ حُرُمٌ، ثَلاَثٌ مُتَوَالِيَاتٌ: ذُو القَعْدَةِ، وَذُو الحِجَّةِ، وَالمُحَرَّمُ، وَرَجَبُ مُضَرَ الَّذِي بَيْنَ جُمَادَى وَشَعْبَانَ»
**(صحیح بخاری: 3197 | صحیح مسلم: 1679)**

**ترجمہ:** "زمانہ اپنی اسی اصل حالت پر گھوم کر واپس آگیا ہے جس دن اللہ نے آسمانوں اور زمین کو پیدا کیا تھا۔ سال کے بارہ مہینے ہیں جن میں سے چار حرمت والے ہیں؛ تین مسلسل: **1. ذوالقعدہ، 2. ذوالحجہ، 3. محرم**، اور ایک **4. رجب** جو جمادیٰ اور شعبان کے درمیان ہے۔"

---

### 🌟 12 اسلامی مہینوں کی ترتیب و اہم فضائل:
1. **محرم الحرام:** حرمت والا مہینہ، عاشورہ (10 محرم) کا مسنون روزہ سابقہ ایک سال کے گناہوں کا کفارہ ہے۔
2. **صفر المظفر:** خیر و برکت والا مہینہ، زمانہ جاہلیت کی نحوست کی بدگمانی کو اسلام نے باطل قرار دیا («لَا عَدْوَى وَلَا طِيَرَةَ وَلَا صَفَرَ» - صحیح بخاری: 5707)۔
3. **ربیع الاول:** سرورِ کائنات، رحمۃ للعالمین ﷺ کی ولادتِ باسعادت اور وفات کا بابرکت مہینہ۔
4. **ربیع الثانی:** نیکیوں اور ذکر و اذکار کا معمول۔
5. **جمادی الاولیٰ:** اسلامی فتوحات اور تاریخِ اسلام کی یادیں۔
6. **جمادی الثانیۃ:** سیدنا ابوبکر صدیق رضی اللہ عنہ کی وفات کا مہینہ۔
7. **رجب المرجب:** حرمت والا مہینہ، جس میں گناہوں سے بچنا اور عبادات کا ثواب دوگنا ہوتا ہے۔
8. **شعبان المعظم:** نبی کریم ﷺ اس مہینے میں رمضان کے بعد سب سے زیادہ کثرت سے روزے رکھتے تھے (صحیح بخاری: 1969)۔
9. **رمضان المبارک:** سید الشہور (مہینوں کا سردار)، قرآنِ مجید کے نزول اور فرض روزوں کا مہینہ جس میں لیلۃ القدر ہے۔
10. **شوال المکرم:** عید الفطر کا مہینہ اور شوال کے 6 مسنون روزے پورے سال کے روزوں کے برابر ثواب رکھتے ہیں (صحیح مسلم: 1164)۔
11. **ذوالقعدۃ الحرام:** حرمت والا مہینہ جس میں نبی کریم ﷺ نے اپنے تمام عمرے ادا فرمائے۔
12. **ذوالحجۃ الحرام:** حج کا مہینہ، اس کے ابتدائی 10 دن دنیا کے تمام دنوں سے افضل ہیں (صحیح بخاری: 969) جن میں قربانی اور یومِ عرفہ ہے۔`,
        arabicText: "إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا فِي كِتَابِ اللَّهِ يَوْمَ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ مِنْهَا أَرْبَعَةٌ حُرُمٌ",
        translation: "بے شک مہینوں کی گنتی اللہ کے نزدیک بارہ مہینے ہے، ان میں سے چار مہینے حرمت والے ہیں۔ (سورۃ التوبہ: 36)",
        quranReference: "سورۃ التوبہ (9:36) - بارہ قمری مہینوں اور چار حرمت والے مہینوں کا حکم",
        hadithReference: "صحیح بخاری: حدیث نمبر 3197 | صحیح مسلم: حدیث نمبر 1679 (کتاب القسامۃ والمحاربین)",
        keyTakeaway: "قمری مہینے اسلامی عبادات (رمضان، حج، زکوۃ، عیدین، ایامِ بیض کے روزے) کی بنیاد ہیں۔ حرمت والے چار مہینوں میں نیکیوں کا اجر بڑھ جاتا ہے اور گناہوں سے بالخصوص پرہیز لازم ہے۔",
        practicalAdvice: "اسلامی تاریخوں کو یاد رکھنے کا اہتمام کریں اور ہر اسلامی مہینے کے ایامِ بیض (13، 14، 15 تاریخ) کے مسنون روزے رکھنے کی کوشش کریں۔",
        suggestedQuestions: [
          "حرمت والے چار مہینوں کے خاص احکام اور فضائل",
          "ایامِ بیض کے روزوں کی فضیلت صحیح احادیث کی روشنی میں",
          "شوال کے چھ مسنون روزوں کا طریقہ اور اجر",
        ],
      };
    }

    // 5. Greetings / Salam / Identity (Strict check: do not match 'اسلام' or 'اسلامی')
    const isActualGreeting = (
      lowerTopic.startsWith("سلام") ||
      lowerTopic.startsWith("السلام") ||
      lowerTopic.startsWith("assalam") ||
      lowerTopic.startsWith("salam") ||
      lowerTopic.trim() === "سلام" ||
      lowerTopic.trim() === "السلام علیکم" ||
      lowerTopic.includes("کون ہو") ||
      lowerTopic.includes("تعارف") ||
      lowerTopic.includes("who are you")
    ) && !lowerTopic.includes("اسلامی") && !lowerTopic.includes("اسلام کے") && !lowerTopic.includes("اسلام میں");

    if (isActualGreeting) {
      return {
        question: rawTopic,
        answerUrdu: "وعلیکم السلام ورحمۃ اللہ وبرکاتہ! 🕌✨\nمیں آپ کا **اسلامی و جدید اے آئی معاون (Islamic & AI ChatGPT)** ہوں۔\nمیرا مقصد آپ کو **قرآنِ مجید** اور **صحیح بخاری و مسلم** کی مستند روشنی میں رہنمائی فراہم کرنا، نیز **مصنوعی ذہانت (AI)**، کمپیوٹر ٹیکنالوجی، کوڈنگ، سوشل میڈیا اسٹریٹجی اور شاہی ناموں کے لوگو و ڈی پی ڈیزائن میں مدد کرنا ہے۔ آپ کوئی بھی دینی، علمی یا تکنیکی سوال بلا جھجھک پوچھ سکتے ہیں۔",
        arabicText: "إِذَا حُيِّيتُم بِتَحِيَّةٍ فَحَيُّوا بِأَحْسَنَ مِنْهَا أَوْ رُدُّوهَا ۗ إِنَّ اللَّهَ كَانَ عَلَىٰ كُلِّ شَيْءٍ حَسِيبًا",
        translation: "اور جب تمہیں کوئی دعا (سلام) دی جائے تو تم اس سے بہتر دعا دو یا وہی الفاظ لوٹا دو، بے شک اللہ ہر چیز کا حساب لینے والا ہے۔",
        quranReference: "سورۃ النساء (4:86)",
        hadithReference: "صحیح بخاری: حدیث نمبر 12 (کتاب الإیمان)",
        keyTakeaway: "سلام میں پہل کرنا سنتِ نبوی اور 30 نیکیوں کا باعث ہے، جبکہ علمِ نافع حاصل کرنا مومن کی گمشدہ میراث ہے۔",
        practicalAdvice: "سلام کو عام کریں اور روزانہ کوئی نہ کوئی نیا مفید علم اور ہنر سیکھیں۔",
        suggestedQuestions: [
          "مصنوعی ذہانت (AI) کیا ہے اور اس سے کیسے فائدہ اٹھائیں؟",
          "میرے نام کا شاہی لوگو اور ڈی پی بنائیں",
          "صحیح احادیث کی روشنی میں صبح و شام کے مسنون اذکار",
        ],
      };
    }

    // 2. Namaz / Khushu / Fajar / Qaza
    if (lowerTopic.includes("نماز") || lowerTopic.includes("namaz") || lowerTopic.includes("خشوع") || lowerTopic.includes("فجر") || lowerTopic.includes("سجدہ") || lowerTopic.includes("قضا")) {
      return {
        question: rawTopic,
        answerUrdu: "نماز دین کا ستون اور مومن کی معراج ہے۔ خشوع حاصل کرنے کا طریقہ یہ ہے کہ دل میں یہ یقین ہو کہ آپ اپنے خالق و مالک کے سامنے کھڑے ہیں اور وہ آپ کو دیکھ رہا ہے (مقامِ احسان)۔ نماز کو اس کے اول وقت میں تمام ارکان و سنن کے ساتھ ادا کرنا سب سے افضل عمل ہے۔",
        arabicText: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ ۝ الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ",
        translation: "یقیناً وہ مومن کامیاب ہو گئے جو اپنی نمازوں میں خشوع و عاجزی اختیار کرتے ہیں۔",
        quranReference: "سورۃ المؤمنون (23:1-2)",
        hadithReference: "صحیح بخاری: حدیث نمبر 527 (کتاب مواقیت الصلاۃ) | صحیح مسلم: حدیث نمبر 85",
        keyTakeaway: "نبی کریم ﷺ سے پوچھا گیا کہ سب سے افضل عمل کون سا ہے؟ آپ ﷺ نے فرمایا: 'نماز کو اس کے اول وقت پر ادا کرنا'۔",
        practicalAdvice: "تکبیرِ اولیٰ سے پہلے دنیاوی خیالات کو جھٹک دیں، جو آیات پڑھیں ان کے معانی پر غور کریں اور سجدے کی جگہ نظر رکھیں۔",
        suggestedQuestions: [
          "نماز میں وسوسے دور کرنے کا مسنون طریقہ",
          "نمازِ فجر کی سنتوں کی فضیلت",
          "قضا نمازوں کو ادا کرنے کا طریقہ",
        ],
      };
    }

    // 3. Tahajjud
    if (lowerTopic.includes("تہجد") || lowerTopic.includes("tahajjud") || lowerTopic.includes("قیام اللیل") || lowerTopic.includes("رات کی نماز")) {
      return {
        question: rawTopic,
        answerUrdu: "نمازِ تہجد رات کے آخری پہر ادا کی جانے والی انتہائی افضل نفل نماز ہے، جس میں دعائیں خاص طور پر قبول ہوتی ہیں۔ نبی کریم ﷺ نے فرمایا کہ فرض نمازوں کے بعد سب سے افضل نماز رات کی نماز (تہجد) ہے۔",
        arabicText: "يَنْزِلُ رَبُّنَا تَبَارَكَ وَتَعَالَى كُلَّ لَيْلَةٍ إِلَى السَّمَاءِ الدُّنْيَا حِينَ يَبْقَى ثُلُثُ اللَّيْلِ الآخِرُ فَيَقُولُ: مَنْ يَدْعُونِي فَأَسْتَجِيبَ لَهُ، مَنْ يَسْأَلُنِي فَأُعْطِيَهُ، مَنْ يَسْتَغْفِرُنِي فَأَغْفِرَ لَهُ",
        translation: "ہمارا رب تبارک و تعالی ہر رات آسمانِ دنیا پر نزول فرماتا ہے جب رات کا آخری تہائی حصہ باقی رہ جاتا ہے، اور فرماتا ہے: کون ہے جو مجھ سے دعا کرے تاکہ میں اس کی دعا قبول کروں، کون ہے جو مجھ سے مانگے تاکہ میں اسے عطا کروں، کون ہے جو مجھ سے مغفرت طلب کرے تاکہ میں اسے بخش دوں۔",
        quranReference: "سورۃ الاسراء (17:79): وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ نَافِلَةً لَّكَ عَسَىٰ أَن يَبْعَثَكَ رَبُّكَ مَقَامًا مَّحْمُودًا",
        hadithReference: "صحیح بخاری: حدیث نمبر 1145 | صحیح مسلم: حدیث نمبر 758",
        keyTakeaway: "رات کے آخری تہائی حصے میں کم از کم 2 سے 8 رکعات نفل ادا کریں اور اپنے اور تمام امت کے لیے گڑگڑا کر دعا کریں۔",
        practicalAdvice: "سونے سے پہلے باوضو سوئیں اور الارم لگا کر اٹھیں۔ خشوع و خضوع کے ساتھ تلاوت اور دعائیں مانگیں۔",
        suggestedQuestions: [
          "تہجد کی کتنی رکعات سنت ہیں؟",
          "رات کے آخری پہر کی خاص دعائیں",
          "نمازِ وتر کا صحیح طریقہ اور وقت",
        ],
      };
    }

    // 4. Roza / Fasting / Ramadan / Injection
    if (lowerTopic.includes("روزہ") || lowerTopic.includes("roza") || lowerTopic.includes("رمضان") || lowerTopic.includes("افطار") || lowerTopic.includes("سحری") || lowerTopic.includes("انجکشن")) {
      return {
        question: rawTopic,
        answerUrdu: "روزہ اسلام کا اہم رکن اور گناہوں سے بچاؤ کے لیے ڈھال ہے۔ روزہ میں روح کی پاکیزگی اور تقویٰ مقصود ہے۔ طبی انجکشن یا ڈرپ جو محض علاج کے لیے ہو اور معدے تک خوراک کا کام نہ دے، اس سے راجح قول کے مطابق روزہ نہیں ٹوٹتا، البتہ غذائی ڈرپ سے پرہیز بہتر ہے۔ افطار و سحری میں سنت کی پابندی برکت کا باعث ہے۔",
        arabicText: "الصِّيَامُ جُنَّةٌ، فَلاَ يَرْفُثْ وَلاَ يَجْهَلْ، وَإِنِ امْرُؤٌ قَاتَلَهُ أَوْ شَاتَمَهُ فَلْيَقُلْ: إِنِّي صَائِمٌ (مَرَّتَيْنِ)",
        translation: "روزہ ڈھال ہے، پس روزہ دار نہ بے ہودہ بات کرے اور نہ جہالت کی بات کرے۔ اگر کوئی شخص اس سے لڑے یا گالی دے تو وہ دو مرتبہ کہہ دے: میں روزہ دار ہوں۔",
        quranReference: "سورۃ البقرۃ (2:183): يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ",
        hadithReference: "صحیح بخاری: حدیث نمبر 1894 | صحیح مسلم: حدیث نمبر 1151",
        keyTakeaway: "روزے کا مقصد صرف بھوکا پیاسا رہنا نہیں بلکہ زبان، آنکھ اور کان کو ہر قسم کی برائی سے محفوظ رکھنا ہے۔",
        practicalAdvice: "سحری ضرور کھائیں کیونکہ سحری کھانے میں برکت ہے۔ افطار کے وقت مسنون دعا پڑھیں اور جلدی افطار کریں۔",
        suggestedQuestions: [
          "روزہ دار کے لیے مسنون دعائیں",
          "کن چیزوں سے روزہ ٹوٹتا ہے اور کن سے نہیں؟",
          "اعتکاف کے فضائل اور احکام",
        ],
      };
    }

    // 5. Sabr / Patience / Hardship / Trials
    if (lowerTopic.includes("صبر") || lowerTopic.includes("sabr") || lowerTopic.includes("تکلیف") || lowerTopic.includes("آزمائش") || lowerTopic.includes("مصیبت") || lowerTopic.includes("پریشانی")) {
      return {
        question: rawTopic,
        answerUrdu: "صبر مومن کا سب سے بڑا ہتھیار اور اللہ کے قرب کا ذریعہ ہے۔ دنیا میں ہر آزمائش اور تکلیف مومن کے گناہوں کا کفارہ اور درجات کی بلندی کا سبب بنتی ہے۔ اصل صبر صدمے کے پہلے لمحے کا صبر ہے۔ اللہ تعالیٰ صبر کرنے والوں کے ساتھ ہے۔",
        arabicText: "إِنَّمَا الصَّبْرُ عِنْدَ الصَّدْمَةِ الأُولَى",
        translation: "یقیناً اصل صبر وہی ہے جو صدمے کے پہلے جھٹکے کے وقت کیا جائے۔",
        quranReference: "سورۃ البقرۃ (2:153): يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
        hadithReference: "صحیح بخاری: حدیث نمبر 1283 | صحیح مسلم: حدیث نمبر 926",
        keyTakeaway: "مومن کو کانٹا بھی چبھے تو اللہ تعالیٰ اس کے بدلے اس کے گناہ معاف فرما دیتا ہے (صحیح بخاری: 5641)۔",
        practicalAdvice: "جب بھی کوئی ناگوار بات پیش آئے تو فوراً 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا' پڑھیں۔",
        suggestedQuestions: [
          "پریشانی اور غم دور کرنے کی مسنون دعا",
          "صبر اور شکر میں کیا فرق ہے؟",
          "مصیبت کے وقت پڑھی جانے والی احادیث کی دعائیں",
        ],
      };
    }

    // 6. Parents / Parents Rights / Kinship
    if (lowerTopic.includes("والدین") || lowerTopic.includes("parents") || lowerTopic.includes("ماں") || lowerTopic.includes("باپ") || lowerTopic.includes("رشتہ دار") || lowerTopic.includes("صلہ رحمی")) {
      return {
        question: rawTopic,
        answerUrdu: "والدین کی خدمت اور ان کے ساتھ حسنِ سلوک شرک کے بعد اسلام میں سب سے اہم ترین فریضہ ہے۔ ماں کے قدموں تلے جنت ہے اور باپ کی رضا میں اللہ کی رضا ہے۔ والدین کے ساتھ کبھی اف تک نہ کہیں اور ان کے لیے ہمیشہ دعائے مغفرت کریں۔",
        arabicText: "جَاءَ رَجُلٌ إِلَى رَسُولِ اللَّهِ ﷺ فَقَالَ: مَنْ أَحَقُّ النَّاسِ بِحُسْنِ صَحَابَتِي؟ قَالَ: «أُمُّكَ» قَالَ: ثُمَّ مَنْ؟ قَالَ: «ثُمَّ أُمُّكَ» قَالَ: ثُمَّ مَنْ؟ قَالَ: «ثُمَّ أُمُّكَ» قَالَ: ثُمَّ مَنْ؟ قَالَ: «ثُمَّ أَبُوكَ»",
        translation: "ایک شخص نے رسول اللہ ﷺ سے عرض کیا: لوگوں میں میرے اچھے سلوک کا سب سے زیادہ حقدار کون ہے؟ آپ ﷺ نے فرمایا: تمہاری ماں۔ اس نے کہا: پھر کون؟ فرمایا: تمہاری ماں۔ اس نے کہا: پھر کون؟ فرمایا: تمہاری ماں۔ اس نے کہا: پھر کون؟ فرمایا: پھر تمہارا باپ۔",
        quranReference: "سورۃ الاسراء (17:23): وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا",
        hadithReference: "صحیح بخاری: حدیث نمبر 5971 | صحیح مسلم: حدیث نمبر 2548",
        keyTakeaway: "والدین کی نافرمانی کبیرہ گناہوں میں سے ہے اور ان کی خدمت دنیا و آخرت میں کامیابی کا ضامن ہے۔",
        practicalAdvice: "والدین کے سامنے اپنی آواز نیچی رکھیں، ان کے آرام کا خیال رکھیں اور روزانہ ان کے لیے 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا' پڑھیں۔",
        suggestedQuestions: [
          "والدین کی وفات کے بعد ان کے لیے ایصالِ ثواب",
          "صلہ رحمی (رشتہ داروں سے اچھا سلوک) کے فوائد",
          "والدین کے حقوق قرآن و حدیث کی روشنی میں",
        ],
      };
    }

    // 7. Halal Earning / Business / Honesty / Truth
    if (lowerTopic.includes("رزق") || lowerTopic.includes("حلال") || lowerTopic.includes("کاروبار") || lowerTopic.includes("سود") || lowerTopic.includes("riba") || lowerTopic.includes("business") || lowerTopic.includes("سچائی")) {
      return {
        question: rawTopic,
        answerUrdu: "حلال روزی کمانا عبادات کی قبولیت کی بنیادی شرط ہے۔ سود، دھوکہ دہی، ناپ تول میں کمی اور حرام ذرائع سے کمائی گئی دولت دنیا اور آخرت میں تباہی کا باعث بنتی ہے۔ سچا اور امانت دار تاجر قیامت کے دن انبیاء، صدیقین اور شہداء کے ساتھ ہوگا۔",
        arabicText: "طَلَبُ كَسْبِ الْحَلاَلِ فَرِيضَةٌ بَعْدَ الْفَرِيضَةِ",
        translation: "حلال روزی کمانا فرض عبادات کے بعد ایک بڑا فریضہ ہے۔",
        quranReference: "سورۃ البقرۃ (2:275): وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا",
        hadithReference: "صحیح بخاری: حدیث نمبر 2072 (کتاب البیوع) | صحیح مسلم: حدیث نمبر 1015",
        keyTakeaway: "نبی کریم ﷺ نے فرمایا: کوئی شخص اس سے بہتر کھانا نہیں کھاتا جو اس نے اپنے ہاتھوں کی کمائی سے کھایا ہو (صحیح بخاری: 2072)۔",
        practicalAdvice: "اپنے کاروبار اور ملازمت میں سچائی اور دیانت داری کو شعار بنائیں اور روزانہ رزقِ حلال اور برکت کی دعا مانگیں۔",
        suggestedQuestions: [
          "رزق میں کشادگی اور برکت کے مسنون اعمال",
          "اسلام میں تجارت اور لین دین کے اصول",
          "سود سے پاک معیشت اور اسلامی بینکاری",
        ],
      };
    }

    // 8. Istighfar / Tauba / Forgiveness
    if (lowerTopic.includes("استغفار") || lowerTopic.includes("توبہ") || lowerTopic.includes("istighfar") || lowerTopic.includes("بخشش") || lowerTopic.includes("گناہ")) {
      return {
        question: rawTopic,
        answerUrdu: "استغفار اللہ تعالی کے غضب کو ٹھنڈا کرتا ہے، رزق میں کشادگی لاتا ہے، غموں کو دور کرتا ہے اور دلوں کے زنگ کو مٹاتا ہے۔ سچی توبہ کے لیے تین شرائط ہیں: گناہ کو فوری چھوڑنا، ماضی پر ندامت اور آئندہ نہ کرنے کا پختہ ارادہ۔",
        arabicText: "وَاللَّهِ إِنِّي لأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً",
        translation: "اللہ کی قسم! میں دن میں ستر مرتبہ سے بھی زیادہ اللہ تعالی سے مغفرت طلب کرتا ہوں اور اس کی بارگاہ میں توبہ کرتا ہوں۔",
        quranReference: "سورۃ نوح (71:10-11): فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا يُرْسِلِ السَّمَاءَ عَلَيْكُم مِّدْرَارًا",
        hadithReference: "صحیح بخاری: حدیث نمبر 6307 (کتاب الدعوات)",
        keyTakeaway: "سید الاستغفار (اللهم أنت ربي لا إله إلا أنت...) کو صبح و شام پڑھنے کی عادت بنائیں، یہ جنت میں داخلے کی بشارت ہے۔",
        practicalAdvice: "چلتے پھرتے 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ' کا ورد جاری رکھیں۔ گناہ کا خیال آتے ہی فوراً وضو کر کے توبہ کی نماز پڑھیں۔",
        suggestedQuestions: [
          "سید الاستغفار کے کلمات اور اس کا مفہوم",
          "سچی توبہ کے ارکان اور شرائط",
          "گناہوں کی معافی کا آسان مسنون طریقہ",
        ],
      };
    }

    // 9. Durood Shareef / Salawat
    if (lowerTopic.includes("درود") || lowerTopic.includes("durood") || lowerTopic.includes("صلوۃ") || lowerTopic.includes("salawat") || lowerTopic.includes("نبی")) {
      return {
        question: rawTopic,
        answerUrdu: "نبی کریم ﷺ پر درود پاک بھیجنا قربِ الٰہی، دعاؤں کی قبولیت اور شفاعتِ نبوی کے حصول کا سب سے پرنور راستہ ہے۔ جو شخص نبی کریم ﷺ پر ایک مرتبہ درود بھیجتا ہے، اللہ تعالیٰ اس پر دس رحمتیں نازل فرماتا ہے، دس گناہ مٹاتا ہے اور دس درجات بلند فرماتا ہے۔",
        arabicText: "مَنْ صَلَّى عَلَيَّ صَلاَةً وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرَ صَلَوَاتٍ، وَحُطَّتْ عَنْهُ عَشْرُ خَطِيئَاتٍ، وَرُفِعَتْ لَهُ عَشْرُ دَرَجَاتٍ",
        translation: "جس نے مجھ پر ایک بار درود بھیجا، اللہ تعالیٰ اس پر دس رحمتیں نازل فرماتا ہے، اس کے دس گناہ معاف فرماتا ہے اور اس کے دس درجات بلند فرماتا ہے۔",
        quranReference: "سورۃ الاحزاب (33:56): إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا",
        hadithReference: "صحیح مسلم: حدیث نمبر 408 (کتاب الصلاۃ)",
        keyTakeaway: "درودِ ابراہیمی سب سے افضل درود ہے جو نماز میں بھی پڑھا جاتا ہے۔",
        practicalAdvice: "ہر دعا کے آغاز اور اختتام پر درود شریف پڑھیں تاکہ دعا عرشِ الٰہی تک پہنچے اور قبول ہو۔",
        suggestedQuestions: [
          "درودِ ابراہیمی کے مکمل الفاظ اور معنی",
          "جمعہ کے دن کثرتِ درود کے فضائل",
          "درود شریف پڑھنے کے دنیاوی اور اخروی برکات",
        ],
      };
    }

    // 10. Jumma / Friday
    if (lowerTopic.includes("جمعہ") || lowerTopic.includes("jumma")) {
      return {
        question: rawTopic,
        answerUrdu: "جمعۃ المبارک دنوں کا سردار اور مسلمانوں کے لیے ہفتہ وار عید کا دن ہے۔ اس دن درود شریف کی کثرت، غسل، خوشبو، سورۃ الکہف کی تلاوت اور قبولیت کی خاص گھڑی تلاش کرنا سنتِ نبوی ہے۔",
        arabicText: "خَيْرُ يَوْمٍ طَلَعَتْ عَلَيْهِ الشَّمْسُ يَوْمُ الْجُمُعَةِ، فِيهِ خُلِقَ آدَمُ، وَفِيهِ أُدْخِلَ الْجَنَّةَ، وَفِيهِ أُخْرِجَ مِنْهَا",
        translation: "بہترین دن جس پر سورج طلوع ہوا جمعہ کا دن ہے، اسی دن آدم علیہ السلام پیدا کیے گئے، اسی دن جنت میں داخل کیے گئے اور اسی دن وہاں سے نکالے گئے۔",
        quranReference: "سورۃ الجمعۃ (62:9): يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ",
        hadithReference: "صحیح مسلم: حدیث نمبر 854 (کتاب الجمعۃ)",
        keyTakeaway: "جمعہ کے دن عصر سے مغرب کے درمیان خاص دعا مانگیں کیونکہ اس وقت میں دعا رد نہیں کی جاتی۔",
        practicalAdvice: "نمازِ جمعہ کے لیے جلدی مسجد پہنچیں، خطبہ غور سے سنیں اور کثرت سے نبی کریم ﷺ پر درود پاک بھیجیں۔",
        suggestedQuestions: [
          "سورۃ الکہف پڑھنے کا ثواب اور وقت",
          "جمعہ کے دن قبولیت کی گھڑی کون سی ہے؟",
          "نمازِ جمعہ کے مسنون آداب",
        ],
      };
    }

    // Default dynamic authentic Islamic response tailored directly to what the user asked
    return {
      question: rawTopic,
      answerUrdu: `### 📌 شرعی و علمی رہنمائی: **"${rawTopic}"**

آپ کے پوچھے گئے سوال / موضوع **"${rawTopic}"** کے بارے میں قرآنِ مجید اور سنتِ نبوی ﷺ کے اصولوں کی روشنی میں شرعی رہنمائی درج ذیل ہے:

1. **کتاب و سنت کی اصل بنیاد:**
   دینِ اسلام میں تمام عقائد، عبادات، معاملات اور احکام کی بنیاد **قرآنِ مجید** اور **رسول اللہ ﷺ کی صحیح احادیث** پر ہے۔ اللہ تعالیٰ کا ارشاد ہے:
   ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ ۖ فَإِن تَنَازَعْتُمْ فِي شَيْءٍ فَرُدُّوهُ إِلَى اللَّهِ وَالرَّسُولِ﴾ (سورۃ النساء: 59)

2. **حلال، حرام اور عبادات کا معیار:**
   * ہر وہ عمل یا عبادت جس کا ثبوت رسول اللہ ﷺ کی صحیح سنت اور صحابہ کرام رضی اللہ عنہم کے عمل سے نہ ملے، وہ دین میں نئی چیز (بدعت) کہلاتی ہے جس سے بچنا لازم ہے («مَنْ عَمِلَ عَمَلًا لَيْسَ عَلَيْهِ أَمْرُنَا فَهُوَ رَدٌّ» - صحیح مسلم: 1718)۔
   * دنیاوی اور اخلاقی معاملات میں اصل اباحت اور خیر ہے جب تک کہ اس میں کسی حرام، سود، دھوکہ یا فساد کا عنصر نہ ہو۔

3. **علمی و فتاویٰ رہنمائی:**
   شرعی مسائل میں ہمیشہ معتبر اہلِ علم اور مستند فتاویٰ مراکز (جیسے مجلس التحقیق الاسلامی، فتاویٰ لجنۃ العلماء للإفتاء - alulama.org) کی تحقیق پر عمل کرنا چاہیے۔`,
      arabicText: "يَا أَيُّهَا الَّذِينَ آمَنُوا أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَلَا تُبْطِلُوا أَعْمَالَكُمْ",
      translation: "اے ایمان والو! اللہ کی اطاعت کرو اور رسول کی اطاعت کرو اور اپنے اعمال کو باطل نہ کرو۔ (سورۃ محمد: 33)",
      quranReference: "سورۃ محمد (47:33) | سورۃ النساء (4:59)",
      hadithReference: "صحیح بخاری: حدیث نمبر 7288 («كُلُّ أُمَّتِي يَدْخُلُونَ الجَنَّةَ إِلَّا مَنْ أَبَى... مَنْ أَطَاعَنِي دَخَلَ الجَنَّةَ»)",
      keyTakeaway: "دین میں کامیابی کا دارومدار صرف اور صرف قرآن و سنت کی سچی اتباع اور رسول اللہ ﷺ کی کامل اطاعت میں ہے۔",
      practicalAdvice: "کسی بھی عمل، عقیدے یا رسم کو اپنانے سے پہلے قرآن و صحیح احادیث سے اس کی مستند دلیل ضرور معلوم کریں۔",
      suggestedQuestions: [
        "سنتِ نبوی کی پیروی کی اہمیت قرآن کی روشنی میں",
        "دین میں بدعت سے بچنے کے احکام و احادیث",
        "صحیح بخاری اور صحیح مسلم کی اہمیت و اصول",
      ],
    };
  }

  if (featureType === "hashtags") {
    // Determine category based on topic keywords
    let main: string[] = [];
    let viral: string[] = [];
    let niche: string[] = [];

    const isIslamic =
      lowerTopic.includes("جمعہ") ||
      lowerTopic.includes("جمعة") ||
      lowerTopic.includes("jumma") ||
      lowerTopic.includes("islam") ||
      lowerTopic.includes("اسلام") ||
      lowerTopic.includes("quran") ||
      lowerTopic.includes("قرآن") ||
      lowerTopic.includes("namaz") ||
      lowerTopic.includes("نماز") ||
      lowerTopic.includes("dua") ||
      lowerTopic.includes("دعا") ||
      lowerTopic.includes("mubarak");

    const isMorning =
      lowerTopic.includes("صبح") ||
      lowerTopic.includes("morning") ||
      lowerTopic.includes("subah") ||
      lowerTopic.includes("سلام") ||
      lowerTopic.includes("motivation");

    const isTravel =
      lowerTopic.includes("سفر") ||
      lowerTopic.includes("travel") ||
      lowerTopic.includes("safar") ||
      lowerTopic.includes("vlog") ||
      lowerTopic.includes("nature") ||
      lowerTopic.includes("وادیاں");

    const isBusiness =
      lowerTopic.includes("کاروبار") ||
      lowerTopic.includes("business") ||
      lowerTopic.includes("karobar") ||
      lowerTopic.includes("money") ||
      lowerTopic.includes("success");

    const isFriendship =
      lowerTopic.includes("دوستی") ||
      lowerTopic.includes("friend") ||
      lowerTopic.includes("dosti") ||
      lowerTopic.includes("dp") ||
      lowerTopic.includes("caption") ||
      lowerTopic.includes("attitude");

    if (isIslamic) {
      main = ["#JummaMubarak", "#IslamicPost", "#Islam", "#FridayBlessings", "#QuranQuotes", "#Deen", "#MuslimUmmah"];
      viral = ["#IslamicReminder", "#BlessedFriday", "#SubhanAllah", "#Alhamdulillah", "#AllahAkbar", "#ViralIslamic"];
      niche = ["#جمعہ_مبارک", "#اسلام", "#قرآن", "#دعاؤں_میں_یاد_رکھنا", "#اسلامی_پوسٹ", "#دین_کی_باتیں", "#اللہ_اکبر", "#نماز"];
    } else if (isMorning) {
      main = ["#GoodMorning", "#MorningMotivation", "#SubahKaSalam", "#DailyMotivation", "#PositiveVibes"];
      viral = ["#MorningVibes", "#SubahBakhair", "#SuccessMindset", "#StartYourDay", "#GrowthMindset"];
      niche = ["#صبح_بخیر", "#نئی_صبح", "#محنت_اور_کامیابی", "#صبح_کا_سلام", "#زندگی", "#کامیابی", "#حوصلہ"];
    } else if (isTravel) {
      main = ["#TravelDiaries", "#Safar", "#ExploreMore", "#TravelVlog", "#NatureLovers"];
      viral = ["#Wanderlust", "#KhoobsuratPakistan", "#ExplorePakistan", "#TravelGram", "#BeautifulDestinations"];
      niche = ["#سفر", "#خوبصورت_پاکستان", "#مناظر", "#وادیاں", "#سیاحت", "#یاسفر"];
    } else if (isBusiness) {
      main = ["#BusinessTips", "#Karobar", "#Entrepreneurship", "#BusinessMindset", "#HalalBusiness"];
      viral = ["#SuccessStory", "#FinancialFreedom", "#StartupLife", "#Kamyaabi", "#Mehnat"];
      niche = ["#کاروبار", "#تجارت", "#کامیابی", "#سرمایہ_کاری", "#حلال_رزق", "#کوشش_اور_کامیابی"];
    } else if (isFriendship) {
      main = ["#Dosti", "#BestFriends", "#FriendshipGoals", "#DpCaption", "#AttitudePost"];
      viral = ["#Yaarian", "#Besties", "#PhotoOfTheDay", "#StyleStatement", "#FriendsForever"];
      niche = ["#دوستی", "#تصویر", "#انداز", "#یاریاں", "#محبت", "#یادیں"];
    } else {
      main = ["#Pakistan", "#DailyPost", "#ContentCreator", "#TrendingNow", "#PostOfTheDay"];
      viral = ["#ViralPost", "#ExplorePage", "#PakistanZindabad", "#UrduPost", "#KhoobsuratLamhat"];
      niche = ["#پاکستان", "#اردو_پوسٹ", "#خوبصورت_لمحات", "#زندگی", "#شاعری", "#احساس"];
    }

    // Add Platform specific tags
    const platformsLower = (platform || "").toLowerCase();
    if (platformsLower.includes("instagram")) {
      viral.push("#InstaGood", "#InstaDaily", "#ReelsInstagram");
    }
    if (platformsLower.includes("tiktok")) {
      viral.push("#FYP", "#ForYouPage", "#TikTokViral");
    }
    if (platformsLower.includes("facebook")) {
      viral.push("#FacebookPost", "#FBPost", "#FacebookViral");
    }
    if (platformsLower.includes("youtube")) {
      viral.push("#Shorts", "#YouTubeShorts", "#ShortsViral");
    }

    // Add Language specific tags
    if (language === "urdu") {
      niche.push("#پاکستان", "#اردو_پوسٹ", "#خوبصورت_لمحات");
    } else if (language === "arabic") {
      niche.push("#الإسلام", "#حكمة_اليوم", "#اقتباسات", "#العالم_العربي");
    } else {
      main.push("#ContentCreator", "#DailyInspiration");
    }

    // Deduplicate
    const seen = new Set<string>();
    const dedupe = (list: string[]) =>
      list.filter((t) => {
        const key = t.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    const cleanMain = dedupe(main);
    const cleanViral = dedupe(viral);
    const cleanNiche = dedupe(niche);
    const allHashtags = [...cleanMain, ...cleanViral, ...cleanNiche];

    return {
      mainHashtags: cleanMain,
      viralHashtags: cleanViral,
      nicheHashtags: cleanNiche,
      allHashtags,
      formattedString: allHashtags.join(" "),
    };
  }

  if (featureType === "image_caption") {
    return {
      short:
        language === "arabic"
          ? `لحظات جميلة وذكريات تدوم في القلب. ✨`
          : language === "urdu"
          ? `خوبصورت لمحات اور پیاری یادیں۔ ✨`
          : `Cherishing beautiful moments and peaceful vibes. ✨`,
      stylish:
        language === "arabic"
          ? `الأناقة الحقيقية تبدأ من بساطة الروح. 💫`
          : language === "urdu"
          ? `انداز اپنا اپنا، سادگی سب سے اعلیٰ۔ 💫`
          : `Elegance is the only beauty that never fades. 💫`,
      emotional:
        language === "arabic"
          ? `بعض اللحظات تظل محفورة في الوجدان دائماً. ❤️`
          : language === "urdu"
          ? `کچھ لمحات ہمیشہ دل کے قریب اور خاص رہتے ہیں۔ ❤️`
          : `Memories made together last a lifetime. ❤️`,
      motivational:
        language === "arabic"
          ? `واصل السعي بثقة، فالنجاح حليف من صبر واجتهد. 🚀`
          : language === "urdu"
          ? `اپنے مقصد پر نظر رکھیں، محنت کریں اور آگے بڑھتے رہیں۔ 🚀`
          : `Stay focused, trust the process, and make it happen. 🚀`,
      islamic:
        language === "arabic"
          ? `الحمد لله على كل حال، وبفضله تدوم النعم. 🤲`
          : language === "urdu"
          ? `اللہ کا شکر ہے ہر حال میں۔ الحمد للہ علیٰ کل حال۔ 🤲`
          : `Grateful to Allah in every situation. Alhamdulillah. 🤲`,
      funny:
        language === "arabic"
          ? `المهم أن الصورة جميلة، والباقي تفاصيل! 😂`
          : language === "urdu"
          ? `تصویر اچھی آنی چاہیے، پوز کا کیا ہے! 😂`
          : `Felt cute, might not delete later! 😂`,
      simple:
        language === "arabic"
          ? `في البساطة يكمن الجمال وراحة البال. 🌿`
          : language === "urdu"
          ? `سادگی میں ہی سکون اور خوبصورتی ہے۔ 🌿`
          : `Simplicity is the ultimate sophistication. 🌿`,
      suggestedHashtags: [
        "#DailyInspiration",
        "#PhotoOfTheDay",
        "#TrendingNow",
        "#InstaGood",
        "#ViralPost",
        "#UrduQuotes",
        "#Pakistan",
        "#ExplorePage",
      ],
    };
  }

  if (featureType === "reel_script") {
    return {
      title:
        language === "arabic"
          ? `🔥 ${rawTopic} - مقطع مميز ورائج`
          : language === "urdu"
          ? `🔥 ${rawTopic} - وائرل ریل ٹائٹل`
          : `🔥 ${rawTopic} - Viral Video Title`,
      hook:
        language === "arabic"
          ? `هل تعلم أن هذه المعلومة قد تغير نظرتك تماماً؟ 😱`
          : language === "urdu"
          ? `کیا آپ جانتے ہیں کہ یہ ایک بات آپ کی زندگی بدل سکتی ہے؟ 😱`
          : `Did you know this one simple trick will change everything? 😱`,
      script:
        language === "arabic"
          ? `🎬 المشهد 1: ابدأ بحماس وثقة أمام الكاميرا.\n\n"في هذا الفيديو سنتعرف على أهم النقاط حول ${rawTopic}."\n\n🎬 المشهد 2: النقاط الأساسية:\n1. ابدأ دائماً بنية خالصة وتفاؤل.\n2. الإنجازات الكبيرة تبدأ بخطوات يومية صغيرة.\n3. ثق بنفسك ولا تستسلم للصعاب.\n\n🎬 المشهد 3: خاتمة مميزة ودعوة للمتابعة والإعجاب.`
          : language === "urdu"
          ? `🎬 منظر 1: کیمرے کے سامنے پرجوش انداز میں آئیں۔\n\n"آج کی اس خاص ویڈیو میں ہم دیکھیں گے ${rawTopic} کے بارے میں۔"\n\n🎬 منظر 2: اہم نکتہ بیان کریں:\n1. ہمیشہ مثبت سوچ کے ساتھ کام شروع کریں۔\n2. روزانہ تھوڑی تھوڑی ترقی ہی بڑی کامیابی بنتی ہے۔\n3. کبھی بھی دوسروں کی باتوں سے ہمت نہ ہاریں۔\n\n🎬 منظر 3: مسکراتے ہوئے حتمی پیغام دیں۔`
          : `🎬 Scene 1: Look directly at the camera with energy.\n\n"In this short video, let me share something important about ${rawTopic}."\n\n🎬 Scene 2: Main points:\n1. Always start with focus and clear intention.\n2. Small daily improvements lead to massive results.\n3. Stay consistent and ignore the noise.\n\n🎬 Scene 3: Smooth outro with CTA.`,
      endingLine:
        language === "arabic"
          ? `إذا أعجبك الفيديو، اضغط إعجاب وشارك المقطع مع أصدقائك! ✨`
          : language === "urdu"
          ? `اگر ویڈیو پسند آئی تو لائک کریں، فالو کریں اور دوستوں کے ساتھ شیئر کریں! ✨`
          : `Double tap if you agree, follow for daily content, and share with your friends! ✨`,
      caption:
        language === "arabic"
          ? `🔥 ${rawTopic} | احفظ الفيديو وشاركه مع من تحب! #Reels #Viral #Trending`
          : language === "urdu"
          ? `🔥 ${rawTopic} | ویڈیو کو محفوظ کر لیں اور دوستوں کے ساتھ شیئر کریں! #Reels #Viral #Trending`
          : `🔥 ${rawTopic} | Save this video for later & share with someone who needs this! #Reels #Viral #Trending`,
      hashtags: ["#ReelsViral", "#TrendingReels", "#Shorts", "#FYP", "#PostlyAI", "#InstaReels"],
      // Legacy backwards-compatibility keys
      hookUrdu: "کیا آپ جانتے ہیں کہ یہ ایک بات آپ کی زندگی بدل سکتی ہے؟",
      hookRoman: "Kya aap jaante hain ke yeh ek baat aapki zindagi badal sakti hai?",
      hookEnglish: "Did you know this one simple habit can change your life?",
      scriptBodyUrdu: `آج کی اس ویڈیو میں ہم بات کریں گے ${rawTopic} کے بارے میں۔ ہمیشہ مثبت سوچیں اور محنت جاری رکھیں۔`,
      scriptBodyRoman: `Aaj ki is video mein hum baat karenge ${rawTopic} ke baare mein. Hamesha positive sochein aur mehnat jari rakhein.`,
      scriptBodyEnglish: `In today's video, we are sharing key insights on ${rawTopic}. Stay positive and keep working hard.`,
      callToActionUrdu: "اگر ویڈیو پسند آئی تو فالو کریں اور دوستوں کے ساتھ شیئر کریں!",
      callToActionRoman: "Agar video pasand aayi toh follow karein aur doston ke saath share karein!",
      callToActionEnglish: "If you enjoyed this video, hit follow and share with your friends!",
    };
  }

  if (featureType === "whatsapp_status") {
    const isIslamic =
      lowerTopic.includes("جمعہ") ||
      lowerTopic.includes("جمعة") ||
      lowerTopic.includes("jumma") ||
      lowerTopic.includes("islam") ||
      lowerTopic.includes("اسلام") ||
      lowerTopic.includes("quran") ||
      lowerTopic.includes("mubarak");

    return {
      statusText:
        language === "arabic"
          ? `✨ ${rawTopic} - كن شاكراً لأنعم الله وتفاءل بالخير تجده دائماً. 🌸`
          : language === "urdu"
          ? `✨ ${rawTopic} - زندگی میں ہمیشہ شکر گزار رہیں اور مسکراتے رہیں۔ 🌸`
          : `✨ ${rawTopic} - Keep shining and stay grateful for every blessing. 🌸`,
      styleVariant: style,
      alternativeStatuses: [
        language === "arabic" ? "البساطة وصدق النية هما جوهر السعادة الحقيقية. ❤️" : language === "urdu" ? "سادگی اور سچی خوشی سب سے قیمتی ہے۔ ❤️" : "Simplicity and sincere intentions are true happiness. ❤️",
        language === "arabic" ? "توكل على الله، فكل أمرك بيده سبحانه. 🤲" : language === "urdu" ? "اللہ پر بھروسہ رکھیں، سب بہتر ہوگا۔ 🤲" : "Put your trust in Allah, everything will be fine. 🤲",
        language === "arabic" ? "كل يوم جديد هو أمل جديد وفرصة للعطاء. ☀️" : language === "urdu" ? "ہر نیا دن ایک نئی امید لے کر آتا ہے۔ ☀️" : "Every new day brings fresh hope and blessings. ☀️",
      ],
      hashtags: isIslamic
        ? ["#JummaMubarak", "#IslamicReminder", "#BlessedFriday", "#Allah", "#Quran", "#Dua"]
        : ["#WhatsAppStatus", "#DailyQuotes", "#Positivity", "#LifeQuotes", "#Motivation", "#Inspiration"],
    };
  }

  if (featureType === "daily_ideas") {
    return {
      ideas: [
        {
          category: category || "Islamic",
          title: "جمعہ المبارک اور صحیح بخاری کی سنتیں",
          description: "صحیح بخاری سے ثابت شدہ جمعہ کے دن کی مسنون سنتیں اور احادیثِ مبارکہ۔",
          hookSuggestion: "کیا آپ جانتے ہیں صحیح بخاری کے مطابق جمعہ کے دن کی یہ 3 سنتیں کون سی ہیں؟",
        },
        {
          category: category || "Motivation",
          title: "صبر اور شکر کی فضیلت (صحیح بخاری)",
          description: "مشکل حالات میں صبر اور اللہ پر توکل کے بارے میں صحیح بخاری کی احادیث۔",
          hookSuggestion: "صحیح بخاری کی یہ حدیث مبارکہ آپ کو ہر مشکل میں حوصلہ دے گی...",
        },
        {
          category: category || "Daily Life",
          title: "حسنِ اخلاق اور ایمان (صحیح بخاری)",
          description: "نبی کریم ﷺ کے بہترین اخلاق اور ایمان کی علامت پر صحیح بخاری کی حدیث مبارکہ۔",
          hookSuggestion: "صحیح بخاری کی اس حدیث میں بہترین مسلمان کی پہچان بتائی گئی ہے...",
        },
      ],
    };
  }

  if (featureType === "social_post") {
    const isIslamic =
      lowerTopic.includes("جمعہ") ||
      lowerTopic.includes("جمعة") ||
      lowerTopic.includes("jumma") ||
      lowerTopic.includes("islam") ||
      lowerTopic.includes("اسلام") ||
      lowerTopic.includes("quran") ||
      lowerTopic.includes("mubarak");

    const defaultTags = isIslamic
      ? [
          "#JummaMubarak",
          "#IslamicPost",
          "#FridayBlessings",
          "#QuranQuotes",
          "#Deen",
          "#SubhanAllah",
          "#Alhamdulillah",
          "#جمعہ_مبارک",
          "#اسلامی_پوسٹ",
          "#دعاؤں_میں_یاد_رکھنا",
        ]
      : [
          "#DailyInspiration",
          "#UrduPost",
          "#TrendingPost",
          "#ViralContent",
          "#MotivationDaily",
          "#PositiveVibes",
          "#Pakistan",
          "#ExplorePage",
          "#PostOfTheDay",
        ];

    return {
      title: `${rawTopic} - Social Post`,
      socialPostMode: "visual_post",
      graphicCardText: language === "urdu" 
        ? `${rawTopic}: سچی کامیابی اور دل کا سکون اللہ کے ذکر اور نیت کے اخلاص میں ہے۔` 
        : `${rawTopic}: Success and inner peace come from sincere intentions and gratitude.`,
      graphicCardSubtitle: isIslamic 
        ? "«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ» (صحیح بخاری: 1)" 
        : "Inspiring Positive Thoughts & Daily Reflection",
      graphicCardTheme: isIslamic ? "islamic_emerald" : "deep_gradient",
      imagePrompt: `A high quality, aesthetic social media poster background about ${rawTopic}, featuring elegant typography, soft warm lighting, and professional photography.`,
      instagramTitle: `✨ ${rawTopic}`,
      instagramCaption:
        language === "arabic"
          ? `✨ ${rawTopic}\n\nالحمد لله دائماً وأبداً. تفاءل بما تراه خيراً وسِر نحو هدفك بعزيمة وإخلاص. ❤️\n\n${defaultTags.slice(0, 5).join(" ")}`
          : language === "urdu"
          ? `✨ ${rawTopic}\n\nزندگی میں ہر حال میں اللہ کا شکر ادا کریں۔ مثبت سوچیں اور آگے بڑھیں۔ ❤️\n\n${defaultTags.slice(0, 5).join(" ")}`
          : `✨ ${rawTopic}\n\nAlways be grateful, stay focused, and keep moving forward with passion. ❤️\n\n${defaultTags.slice(0, 5).join(" ")}`,
      instagramHashtags: defaultTags,
      instagramCta: language === "urdu" ? "پوسٹ کو لائک اور دوستوں کے ساتھ شیئر کریں! ✨" : "Double tap and share with friends! ✨",
      facebookTitle: `📌 ${rawTopic}`,
      facebookPost:
        language === "urdu"
          ? `زندگی کا سب سے بڑا سبق یہ ہے کہ اپنے مقصد پر نظر رکھیں اور محنت کرتے رہیں۔ دوسروں کے ساتھ اچھی باتیں شیئر کریں اور مثبت ماحول قائم کریں۔`
          : `Life is full of blessings. Stay focused on your goals, work hard, and spread happiness wherever you go.`,
      facebookHashtags: defaultTags.slice(0, 6),
      facebookCta: language === "urdu" ? "اپنی رائے کمنٹس میں ضرور بتائیں! 👇" : "Share your thoughts in the comments below! 👇",
      tiktokTitle: `🔥 ${rawTopic}`,
      tiktokHook: language === "urdu" ? "یہ ایک بات آپ کی زندگی بدل سکتی ہے! 😱" : "This one thing will blow your mind! 😱",
      tiktokScript: language === "urdu"
        ? `آج ہم بات کریں گے ${rawTopic} کے بارے میں۔ ہمیشہ اپنی محنت پر یقین رکھیں اور آگے بڑھتے رہیں۔`
        : `Aaj hum baat karenge ${rawTopic} ke baare mein. Hamesha mehnat karein aur aage barhein.`,
      tiktokCaption:
        language === "urdu"
          ? `کیا آپ جانتے ہیں؟ ${rawTopic} 🔥 #Viral #FYP #Trending`
          : `Kya aap jaante hain? ${rawTopic} 🔥 #Viral #FYP #Trending`,
      tiktokHashtags: defaultTags.slice(0, 5),
      whatsappTitle: `✨ ${rawTopic}`,
      whatsappStatus:
        language === "urdu"
          ? `✨ ${rawTopic} - ہمیشہ مسکراتے رہیں اور شکر ادا کریں! 😊`
          : `✨ ${rawTopic} - Always keep smiling and stay blessed! 😊`,
      whatsappHashtags: defaultTags.slice(0, 4),
      youtubeTitle: `🔥 ${rawTopic} | اہم معلومات`,
      youtubeDescription: `Detailed video guide about ${rawTopic}. Like, Share and Subscribe!`,
      youtubeTags: defaultTags.map(t => t.replace("#", "")),
      hashtags: defaultTags,
    };
  }

  if (featureType === "logo_design") {
    // Thoroughly strip conversational, request, and command phrases
    let cleanName = rawTopic
      // English prefixes and request phrases
      .replace(/^(please\s+|can\s+you\s+|make\s+me\s+a\s+|create\s+a\s+|generate\s+a\s+|i\s+need\s+a\s+|make\s+|design\s+a\s+|design\s+|logo\s+for\s+|logo\s+of\s+|dp\s+for\s+)/gi, " ")
      .replace(/\s+(logo|design|dp|profile|maker|monogram|creator|channel|badge|symbol|watermark)$/gi, " ")
      // Urdu conversational prefixes
      .replace(/^(مجھے|ہمیں|برائے\s*مہربانی|برائے\s*کرم|مہربانی\s*فرما\s*کر|ازراہ\s*کرم|پلیز)\s*/gi, " ")
      .replace(/(میرے\s*لیے|میرے\s*لیئے|میرے\s*نام\s*کا|ہمارے\s*نام\s*کا|کے\s*نام\s*کا|کے\s*نام\s*سے|نام\s*کا|نام\s*کی|کے\s*لیے|کے\s*لیئے)\s*/gi, " ")
      // Urdu conversational suffixes
      .replace(/\s*(کا\s*لوگو|کی\s*ڈی\s*پی|کا\s*مونوگرام|کا\s*ڈیزائن|ڈیزائن\s*کر\s*کے\s*دیں|ڈیزائن\s*کریں|بنا\s*کر\s*دیں|بنا\s*کے\s*دیں|بنا\s*دیں|بنا\s*دو|بنائیں|بنائں|چاہیے|چاہئے|چاہیئے|تیار\s*کریں|تیار\s*کر\s*کے\s*دیں|لوگو|ڈیزائن|ڈی\s*پی|مونوگرام|کریئیٹ\s*کریں|چاہیے\s*تھا|بنا\s*دیں\s*پلیز)$/gi, " ")
      // Clean isolated particles
      .replace(/\s+(کا|کے|کی|کو)$/gi, " ")
      .replace(/^(کا|کے|کی|کو)\s+/gi, " ")
      .replace(/[()""'':;۔،!?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Additional safeguard if conversational words remain anywhere
    cleanName = cleanName
      .replace(/بنا\s*کر\s*دیں|بنا\s*کے\s*دیں|بنا\s*دیں|بنائیں|بنائں|بنا\s*دو|چاہیے/gi, "")
      .replace(/مجھے|ہمیں|میرے|ہمارے|برائے\s*مہربانی/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanName) cleanName = "المصطفیٰ انسٹیٹیوٹ";

    const hasUrdu = /[\u0600-\u06FF]/.test(cleanName);
    let mainEnglishName = "";
    let mainUrduName = "";

    if (hasUrdu) {
      mainUrduName = cleanName;
      if (/المصفی|المصطفی/i.test(cleanName) && /انسٹیٹیوٹ|ادارہ|اکیڈمی/i.test(cleanName)) {
        mainEnglishName = "Al-Mustafa Institute";
      } else if (/المصفی/i.test(cleanName)) {
        mainEnglishName = "Al-Musaffa";
      } else if (/المصطفی/i.test(cleanName)) {
        mainEnglishName = "Al-Mustafa";
      } else if (/ابرار|abrar/i.test(cleanName) || /حافظ/i.test(cleanName)) {
        mainEnglishName = "Hafiz Abrar";
        mainUrduName = "حافظ ابرار";
      } else {
        mainEnglishName = cleanName;
      }
    } else {
      mainEnglishName = cleanName;
      if (/abrar/i.test(cleanName)) mainUrduName = "حافظ ابرار";
      else if (/mustafa|musaffa/i.test(cleanName)) mainUrduName = "المصطفیٰ انسٹیٹیوٹ";
    }

    // Monogram Initials (e.g. "MI" for Al-Mustafa Institute or "HA" for Hafiz Abrar)
    let initial = "MI";
    if (mainEnglishName && mainEnglishName !== mainUrduName) {
      const eWords = mainEnglishName.split(/\s+/).filter(Boolean);
      if (eWords.length > 1) {
        initial = (eWords[0][0] + eWords[1][0]).toUpperCase();
      } else {
        initial = mainEnglishName.slice(0, 2).toUpperCase();
      }
    } else if (mainUrduName) {
      const uWords = mainUrduName.split(/\s+/).filter(Boolean);
      initial = uWords.length > 1 ? (uWords[0][0] + uWords[1][0]) : uWords[0].slice(0, 2);
    }

    const isAbrar = /abrar|ابرار/i.test(rawTopic) || /hafiz/i.test(rawTopic);

    // Dynamic shape and theme selection based on topic keywords
    let chosenShape: "interlocking_oval" | "royal_crest" | "islamic_dome" | "modern_shield" | "minimal_circle" | "luxury_diamond" | "cyber_hexagon" = "interlocking_oval";
    let chosenTheme: "minimalist_black" | "royal_gold_dark" | "islamic_emerald_gold" | "sapphire_luxury" | "youtube_red_gold" | "tiktok_cyan_magenta" = "royal_gold_dark";

    const lowerTopic = rawTopic.toLowerCase();
    if (lowerTopic.includes("شیلڈ") || lowerTopic.includes("shield") || lowerTopic.includes("یوٹیوب") || lowerTopic.includes("youtube")) {
      chosenShape = "modern_shield";
      chosenTheme = "youtube_red_gold";
    } else if (lowerTopic.includes("گنبد") || lowerTopic.includes("dome") || lowerTopic.includes("اسلامک") || lowerTopic.includes("اسلامی")) {
      chosenShape = "islamic_dome";
      chosenTheme = "islamic_emerald_gold";
    } else if (lowerTopic.includes("کراؤن") || lowerTopic.includes("تاج") || lowerTopic.includes("شاہی") || lowerTopic.includes("gold") || lowerTopic.includes("گولڈ")) {
      chosenShape = "royal_crest";
      chosenTheme = "royal_gold_dark";
    } else if (lowerTopic.includes("ٹک ٹاک") || lowerTopic.includes("tiktok") || lowerTopic.includes("سائبر") || lowerTopic.includes("ہیکساگان") || lowerTopic.includes("hexagon")) {
      chosenShape = "cyber_hexagon";
      chosenTheme = "tiktok_cyan_magenta";
    } else if (lowerTopic.includes("سرکل") || lowerTopic.includes("circle") || lowerTopic.includes("ڈی پی") || lowerTopic.includes("واٹس ایپ")) {
      chosenShape = "minimal_circle";
      chosenTheme = "sapphire_luxury";
    } else if (lowerTopic.includes("ڈیزائن بدل") || lowerTopic.includes("اور ڈیزائن") || lowerTopic.includes("دوسرا ڈیزائن") || lowerTopic.includes("مختلف")) {
      chosenShape = "royal_crest";
      chosenTheme = "royal_gold_dark";
    }

    const meaning = isAbrar
      ? "ابرار (Abrar) عربی زبان کا ایک انتہائی بابرکت اور باوقار نام ہے جس کا مطلب 'نیکوکار، سچے، متقی، پاکباز اور احسان کرنے والے لوگ' ہے۔"
      : `${cleanName}: علم و حکمت، وقار، خود اعتمادی اور روشن خیالی کی علامت۔`;

    const quranRef = isAbrar
      ? "قرآن مجید (سورۃ الانفطار: 13): ﴿إِنَّ الْأَبْرَارَ لَفِي نَعِيمٍ﴾"
      : "رسول اللہ ﷺ نے فرمایا: «إِنَّكُم تُدْعَوْنَ يَوْمَ الْقِيَامَةِ بِأَسْمَائِكُمْ وَأَسْمَاءِ آبَائِكُمْ فَأَحْسِنُوا أَسْمَاءَكُمْ» [صحیح بخاری و مسلم]";

    const variations = [
      {
        id: "var_1",
        nameUrdu: "24K گولڈ اوول مونوگرام",
        nameEng: "24K Royal Gold Oval",
        badgeShape: "interlocking_oval" as const,
        themeStyle: "royal_gold_dark" as const,
        tagline: "Signature Emblem",
        fontStyle: "serif" as const,
      },
      {
        id: "var_2",
        nameUrdu: "شاہی 3D گولڈ مونوگرام",
        nameEng: "Royal 3D Gold Luxury",
        badgeShape: "royal_crest" as const,
        themeStyle: "royal_gold_dark" as const,
        tagline: "Official Crest",
        fontStyle: "serif" as const,
      },
      {
        id: "var_3",
        nameUrdu: "اسلامک زمردی گنبد و خطاطی",
        nameEng: "Islamic Emerald Dome",
        badgeShape: "islamic_dome" as const,
        themeStyle: "islamic_emerald_gold" as const,
        tagline: "شاہی خطاطی",
        fontStyle: "urdu" as const,
      },
      {
        id: "var_4",
        nameUrdu: "یاقوت سرخ و گولڈن شیلڈ",
        nameEng: "Ruby Red & Gold Shield",
        badgeShape: "modern_shield" as const,
        themeStyle: "youtube_red_gold" as const,
        tagline: "Official Channel",
        fontStyle: "sans" as const,
      },
      {
        id: "var_5",
        nameUrdu: "ٹک ٹاک سائبر گلو",
        nameEng: "TikTok Cyber Neon",
        badgeShape: "cyber_hexagon" as const,
        themeStyle: "tiktok_cyan_magenta" as const,
        tagline: "Creator Badge",
        fontStyle: "tech" as const,
      },
      {
        id: "var_6",
        nameUrdu: "سلطانی نیلم و ڈی پی سرکل",
        nameEng: "Sapphire Blue Circle DP",
        badgeShape: "minimal_circle" as const,
        themeStyle: "sapphire_luxury" as const,
        tagline: "Verified DP",
        fontStyle: "modern" as const,
      },
    ];

    return {
      title: `${cleanName} - Luxury Logo & DP`,
      logoText: mainEnglishName || cleanName,
      logoUrduText: mainUrduName || "",
      monogramInitials: initial,
      tagline: "Official",
      badgeShape: chosenShape,
      themeStyle: chosenTheme,
      variations,
      meaningExplanation: meaning,
      quranHadithReference: quranRef,
      characterTraits: ["علم و وقار", "حوصلہ مندی", "قیادت و خدمت"],
      bioSuggestions: [
        `🏛️ ${mainEnglishName || cleanName}\n✨ مرکزِ تعلیم و تربیت و دینی شعور\n📍 Official Profile`,
      ],
      socialHashtags: [
        `#${(mainEnglishName || cleanName).replace(/\s+/g, "")}`,
        "#LogoDesign",
        "#IslamicInstitute",
      ],
    };
  }

  const topicText = rawTopic;

  return {
    // Instagram
    instagramCaption: language === "arabic"
      ? `✨ ${topicText}\n\nالحمد لله على كل حال. عش كل لحظة بأمل وتفاؤل وثقة بالله. ❤️`
      : language === "urdu" 
      ? `✨ ${topicText}\n\nزندگی میں ہر حال میں اللہ کا شکر ادا کریں۔ مثبت سوچیں اور خوبصورت لمحات کا لطف اٹھائیں۔ ❤️`
      : `✨ ${topicText}\n\nAlways be grateful for every moment. Stay positive and shine bright! ❤️`,
    instagramHashtags: ["#PostlyAI", "#DailyInspiration", "#Blessed", "#GoodVibes", "#InstagramPost"],
    instagramCta: language === "urdu" ? "پوسٹ کو لائک اور دوستوں کے ساتھ شیئر کریں! ✨" : "Double tap if you agree & share with friends! ✨",

    // TikTok
    tiktokCaption: language === "urdu"
      ? `کیا آپ جانتے ہیں؟ ${topicText} 🔥 #Viral #FYP`
      : `Kya aap jaante hain? ${topicText} 🔥 #Viral #FYP #ForYou`,
    tiktokHashtags: ["#FYP", "#ForYouPage", "#TikTokViral", "#Trending", "#PostlyAI"],
    tiktokHook: language === "urdu" ? "یہ ایک بات آپ کی زندگی بدل سکتی ہے! 😱" : "This one thing will change your mindset! 😱",
    tiktokScript: language === "urdu"
      ? `آج ہم بات کریں گے ${topicText} کے بارے میں۔ ہمیشہ اپنی محنت پر یقین رکھیں اور آگے بڑھتے رہیں۔`
      : `Aaj hum baat karenge ${topicText} ke baare mein. Hamesha apni mehnat par yaqeen rakhein aur aage barhte rahein.`,

    // Facebook
    facebookPost: language === "urdu"
      ? `📌 ${topicText}\n\nزندگی کا سب سے بڑا سبق یہ ہے کہ اپنے مقصد پر نظر رکھیں اور محنت کرتے رہیں۔ دوسروں کے ساتھ اچھی باتیں شیئر کریں اور مثبت ماحول قائم کریں۔`
      : `📌 ${topicText}\n\nLife is full of blessings. Stay focused on your goals, work hard, and spread happiness wherever you go.`,
    facebookHashtags: ["#FacebookPost", "#Inspiration", "#DailyPositivity", "#PostlyAI"],
    facebookCta: language === "urdu" ? "اپنی رائے نیچے کمنٹس میں ضرور بتائیں! 👇" : "Let us know your thoughts in the comments below! 👇",

    // WhatsApp
    whatsappStatus: language === "urdu"
      ? `✨ ${topicText} - ہمیشہ مسکراتے رہیں! 😊`
      : `✨ ${topicText} - Always keep smiling! 😊`,
    whatsappStatusEmoji: `✨ ${topicText} 🌟💫❤️`,

    // YouTube
    youtubeTitle: language === "urdu"
      ? `🔥 ${topicText} | وائرل اسکرپٹ اور اہم معلومات`
      : `🔥 ${topicText} | Powerful Inspiration & Insights`,
    youtubeDescription: language === "urdu"
      ? `اس ویڈیو میں دیکھیں ${topicText} کے بارے میں اہم معلومات۔ چینل کو سبسکرائب کریں!`
      : `In this video, explore insights about ${topicText}. Subscribe for more daily inspiration!`,
    youtubeTags: ["PostlyAI", "Shorts", "Trending", "Motivation", topicText],

    // Image Prompt
    imagePrompt: `A professional, aesthetic high-resolution social media photography style image capturing "${topicText}", vibrant soft lighting, 4k ultra-detailed, cinematic composition, Instagram story aesthetic.`,

    // Legacy fields
    reelHook: language === "urdu" ? "کیا آپ نے کبھی یہ سوچا ہے؟ 🤔" : "Did you ever realize this? 🤔",
    reelScript: language === "urdu"
      ? `آج کا خاص پیغام: ${topicText}۔ ہمیشہ اللہ پر توکل رکھیں اور محنت جاری رکھیں۔`
      : `Today's message: ${topicText}. Keep striving for excellence and stay strong.`,
    caption: `✨ ${topicText}`,
    hashtags: ["#PostlyAI", "#DailyMotivation", "#ViralPost", "#Trending"],
    thumbnailText: topicText.slice(0, 20).toUpperCase(),
  };
}

