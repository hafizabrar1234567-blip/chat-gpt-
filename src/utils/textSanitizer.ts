// Islamic & Urdu Text Sanitizer
// Ensures pure Urdu diction, joins split infinitives (e.g. 'چھوڑ نا' -> 'چھوڑنا'),
// and converts any English Surah references into authentic Urdu Quranic citations.

export const SURAH_NUMBER_TO_URDU: Record<number, string> = {
  1: "الفاتحہ",
  2: "البقرۃ",
  3: "آل عمران",
  4: "النساء",
  5: "المائدۃ",
  6: "الانعام",
  7: "الاعراف",
  8: "الانفال",
  9: "التوبۃ",
  10: "یونس",
  11: "ہود",
  12: "یوسف",
  13: "الرعد",
  14: "ابراہیم",
  15: "الحجر",
  16: "النحل",
  17: "الاسراء",
  18: "الکہف",
  19: "مریم",
  20: "طٰہٰ",
  21: "الانبیاء",
  22: "الحج",
  23: "المؤمنون",
  24: "النور",
  25: "الفرقان",
  26: "الشعراء",
  27: "النمل",
  28: "القصص",
  29: "العنکبوت",
  30: "الروم",
  31: "لقمان",
  32: "السجدۃ",
  33: "الاحزاب",
  34: "سبا",
  35: "فاطر",
  36: "یٰس",
  37: "الصافات",
  38: "ص",
  39: "الزمر",
  40: "غافر",
  41: "فصلت",
  42: "الشوریٰ",
  43: "الزخرف",
  44: "الدخان",
  45: "الجاثیہ",
  46: "الاحقاف",
  47: "محمد",
  48: "الفتح",
  49: "الحجرات",
  50: "ق",
  51: "الذاریات",
  52: "الطور",
  53: "النجم",
  54: "القمر",
  55: "الرحمن",
  56: "الواقعۃ",
  57: "الحدید",
  58: "المجادلہ",
  59: "الحشر",
  60: "الممتحنہ",
  61: "الصف",
  62: "الجمعۃ",
  63: "المنافقون",
  64: "التغابن",
  65: "الطلاق",
  66: "التحریم",
  67: "الملک",
  68: "القلم",
  69: "الحاقۃ",
  70: "المعارج",
  71: "نوح",
  72: "الجن",
  73: "المزمل",
  74: "المدثر",
  75: "القیامۃ",
  76: "الانسان",
  77: "المرسلات",
  78: "النبأ",
  79: "النازعات",
  80: "عبس",
  81: "التکویر",
  82: "الانفطار",
  83: "المطففین",
  84: "الانشقاق",
  85: "البروج",
  86: "الطارق",
  87: "الاعلیٰ",
  88: "الغاشیۃ",
  89: "الفجر",
  90: "البلد",
  91: "الشمس",
  92: "اللیل",
  93: "الضحیٰ",
  94: "الانشراح",
  95: "التین",
  96: "العلق",
  97: "القدر",
  98: "البینۃ",
  99: "الزلزلۃ",
  100: "العادیات",
  101: "القارعۃ",
  102: "التکاثر",
  103: "العصر",
  104: "الہمزۃ",
  105: "الفیل",
  106: "قریش",
  107: "الماعون",
  108: "الکوثر",
  109: "الکافرون",
  110: "النصر",
  111: "المسد",
  112: "الاخلاص",
  113: "الفلق",
  114: "الناس",
};

export const ENGLISH_SURAH_MAP: Record<string, number> = {
  "fatiha": 1, "fatihah": 1, "al-fatiha": 1, "al-fatihah": 1,
  "baqarah": 2, "baqara": 2, "al-baqarah": 2, "al-baqara": 2,
  "imran": 3, "ali-imran": 3, "al-imran": 3, "aal-imran": 3,
  "nisa": 4, "an-nisa": 4, "an-nisaa": 4, "nisaa": 4,
  "maidah": 5, "maida": 5, "al-maidah": 5, "al-maida": 5,
  "anam": 6, "al-anam": 6,
  "araf": 7, "al-araf": 7, "al-a'raf": 7,
  "anfal": 8, "al-anfal": 8,
  "tawbah": 9, "taubah": 9, "at-tawbah": 9, "at-taubah": 9,
  "yunus": 10,
  "hud": 11,
  "yusuf": 12,
  "rad": 13, "ar-rad": 13, "ar-ra'd": 13,
  "ibrahim": 14,
  "hijr": 15, "al-hijr": 15,
  "nahl": 16, "an-nahl": 16,
  "isra": 17, "al-isra": 17, "bani-israel": 17,
  "kahf": 18, "al-kahf": 18,
  "maryam": 19,
  "taha": 20, "ta-ha": 20,
  "anbiya": 21, "al-anbiya": 21, "al-anbiyaa": 21,
  "hajj": 22, "al-hajj": 22,
  "muminun": 23, "al-muminun": 23, "al-mu'minun": 23,
  "noor": 24, "an-noor": 24, "an-nur": 24, "nur": 24,
  "furqan": 25, "al-furqan": 25,
  "shuara": 26, "ash-shuara": 26, "ash-shu'ara": 26,
  "naml": 27, "an-naml": 27,
  "qasas": 28, "al-qasas": 28,
  "ankabut": 29, "al-ankabut": 29,
  "rum": 30, "ar-rum": 30,
  "luqman": 31,
  "sajdah": 32, "as-sajdah": 32, "as-sajda": 32,
  "ahzab": 33, "al-ahzab": 33,
  "saba": 34,
  "fatir": 35,
  "yasin": 36, "yaseen": 36, "ya-sin": 36,
  "saffat": 37, "as-saffat": 37,
  "sad": 38,
  "zumar": 39, "az-zumar": 39,
  "ghafir": 40, "mumin": 40,
  "fussilat": 41,
  "shura": 42, "ash-shura": 42,
  "zukhruf": 43, "az-zukhruf": 43,
  "dukhan": 44, "ad-dukhan": 44,
  "jathiyah": 45, "al-jathiyah": 45,
  "ahqaf": 46, "al-ahqaf": 46,
  "muhammad": 47,
  "fath": 48, "al-fath": 48,
  "hujurat": 49, "al-hujurat: 49": 49,
  "qaf": 50,
  "dhariyat": 51, "adh-dhariyat": 51,
  "tur": 52, "at-tur": 52,
  "najm": 53, "an-najm": 53,
  "qamar": 54, "al-qamar": 54,
  "rahman": 55, "ar-rahman": 55,
  "waqiah": 56, "al-waqiah": 56, "al-waqi'ah": 56,
  "hadid": 57, "al-hadid": 57,
  "mujadilah": 58, "al-mujadilah": 58, "al-mujadila": 58,
  "hashr": 59, "al-hashr": 59,
  "mumtahanah": 60, "al-mumtahanah": 60,
  "saff": 61, "as-saff": 61,
  "jumah": 62, "al-jumah": 62, "al-jumu'ah": 62,
  "munafiqun": 63, "al-munafiqun": 63,
  "taghabun": 64, "at-taghabun": 64,
  "talaq": 65, "at-talaq": 65,
  "tahrim": 66, "at-tahrim": 66,
  "mulk": 67, "al-mulk": 67,
  "qalam": 68, "al-qalam": 68,
  "haqqah": 69, "al-haqqah": 69,
  "maarij": 70, "al-maarij": 70, "al-ma'arij": 70,
  "nuh": 71,
  "jinn": 72, "al-jinn": 72,
  "muzzammil": 73, "al-muzzammil": 73,
  "muddathir": 74, "al-muddathir": 74,
  "qiyamah": 75, "al-qiyamah": 75,
  "insan": 76, "al-insan": 76, "dahr": 76,
  "mursalat": 77, "al-mursalat": 77,
  "naba": 78, "an-naba": 78,
  "naziat": 79, "an-naziat": 79, "an-nazi'at": 79,
  "abasa": 80,
  "takwir": 81, "at-takwir": 81,
  "infitar": 82, "al-infitar": 82,
  "mutaffifin": 83, "al-mutaffifin": 83,
  "inshiqaq": 84, "al-inshiqaq": 84,
  "buruj": 85, "al-buruj": 85,
  "tariq": 86, "at-tariq": 86,
  "ala": 87, "al-ala": 87, "al-a'la": 87,
  "ghashiyah": 88, "al-ghashiyah": 88,
  "fajr": 89, "al-fajr": 89,
  "balad": 90, "al-balad": 90,
  "shams": 91, "ash-shams": 91,
  "layl": 92, "al-layl": 92,
  "duha": 93, "ad-duha": 93,
  "sharh": 94, "inshirah": 94, "ash-sharh": 94, "al-inshirah": 94,
  "tin": 95, "at-tin": 95,
  "alaq": 96, "al-alaq": 96,
  "qadr": 97, "al-qadr": 97,
  "bayyinah": 98, "al-bayyinah": 98,
  "zalzalah": 99, "az-zalzalah": 99,
  "adiyat": 100, "al-adiyat": 100,
  "qariah": 101, "al-qariah": 101, "al-qari'ah": 101,
  "takathur": 102, "at-takathur": 102,
  "asr": 103, "al-asr": 103,
  "humazah": 104, "al-humazah": 104,
  "fil": 105, "feel": 105, "al-fil": 105, "al-feel": 105,
  "quraysh": 106,
  "maun": 107, "al-maun": 107, "al-ma'un": 107,
  "kawthar": 108, "al-kawthar": 108,
  "kafirun": 109, "al-kafirun": 109,
  "nasr": 110, "an-nasr": 110,
  "masad": 111, "al-masad": 111, "lahab": 111,
  "ikhlas": 112, "al-ikhlas": 112,
  "falaq": 113, "al-falaq": 113,
  "nas": 114, "an-nas": 114,
};

// Known Urdu verbal stems that should join with 'نا', 'نے', 'نی'
const VERB_STEMS = [
  "چھوڑ", "کر", "ہو", "دیکھ", "کہ", "سن", "لکھ", "پڑھ", "بیٹھ", "اٹھ",
  "روک", "ٹوک", "مان", "جان", "سمجھ", "سیکھ", "سکھا", "بتا", "پوچھ", "ڈھونڈ",
  "مانگ", "بچ", "نبھا", "چاہ", "مل", "کھو", "پا", "چل", "بول", "بڑھ", "لڑ",
  "جوڑ", "توڑ", "رکھ", "پہنچ", "سدھار", "سنوار", "ڈال", "نکال", "سنبھال",
  "پھیلا", "دھو", "بنا", "دکھا", "مٹا", "بجھا", "جلا", "تھام", "جاگ", "بھاگ",
  "بانٹ", "کاٹ", "لوٹ", "چھپ", "جھک", "چپک", "چمٹ", "لپٹ", "سمٹ", "سو", "رو", "پی", "کھا",
  "رہ", "سہ", "سہہ", "بہ", "بہہ"
];

// Unicode boundaries for Urdu/Arabic script (since standard \b only works on ASCII)
const UB_L = "(?<=^|[^\\p{L}\\p{M}])";
const UB_R = "(?=[^\\p{L}\\p{M}]|$)";

const VERB_STEMS_REGEX = new RegExp(
  `${UB_L}(${VERB_STEMS.join("|")})\\s+(نا|نے|نی)${UB_R}`,
  "gu"
);

/**
 * Sanitizes Urdu text to remove Hindi phrasing, join split verbs,
 * and fix any English surah/verse references into standard Urdu.
 */
export function sanitizeUrduIslamicContent(rawText: string): string {
  if (!rawText || typeof rawText !== "string") return rawText;

  let text = rawText;

  // 1. Join split verbs like 'کہہ نا' -> 'کہنا'
  text = text.replace(new RegExp(`${UB_L}کہہ\\s+نا${UB_R}`, "gu"), "کہنا");
  text = text.replace(new RegExp(`${UB_L}کہہ\\s+نے${UB_R}`, "gu"), "کہنے");
  text = text.replace(new RegExp(`${UB_L}کہہ\\s+نی${UB_R}`, "gu"), "کہنی");

  // 2. Join all other known verb stems (e.g. 'چھوڑ نا' -> 'چھوڑنا', 'کر نا' -> 'کرنا')
  text = text.replace(VERB_STEMS_REGEX, "$1$2");

  // 3. Dynamic rule for any Urdu verb stem followed by modal verbs / postpositions:
  // e.g. "چھوڑ نا چاہیے" -> "چھوڑنا چاہیے", "دیکھ نا چاہیے" -> "دیکھنا چاہیے"
  text = text.replace(
    new RegExp(
      `${UB_L}([\\p{L}\\p{M}]{2,})\\s+نا\\s+(چاہیے|چاہئیں|پڑے|پڑا|پڑی|ہوگا|ہوگی|تھا|تھی|تھے)${UB_R}`,
      "gu"
    ),
    "$1نا $2"
  );
  // e.g. "کر نے کے لیے" -> "کرنے کے لیے", "بچ نے کے لیے" -> "بچنے کے لیے"
  text = text.replace(
    new RegExp(
      `${UB_L}([\\p{L}\\p{M}]{2,})\\s+نے\\s+(کے\\s+لیے|کی\\s+خاطر|سے\\s+پہلے|کے\\s+بعد|کا\\s+ارادہ|کی\\s+کوشش|کی\\s+ضرورت|والا|والی|والے)${UB_R}`,
      "gu"
    ),
    "$1نے $2"
  );

  // 4. Hindi loan words replacement to standard Urdu
  text = text.replace(new RegExp(`${UB_L}سمسیا${UB_R}`, "gu"), "مسئلہ");
  text = text.replace(new RegExp(`${UB_L}سمسیاؤں${UB_R}`, "gu"), "مسائل");
  text = text.replace(new RegExp(`${UB_L}سمسیائیں${UB_R}`, "gu"), "مسائل");
  text = text.replace(new RegExp(`${UB_L}(?:کوشٹ|کشت)${UB_R}`, "gu"), "تکلیف");
  text = text.replace(new RegExp(`${UB_L}سفلتا${UB_R}`, "gu"), "کامیابی");
  text = text.replace(new RegExp(`${UB_L}سفل${UB_R}`, "gu"), "کامیاب");
  text = text.replace(new RegExp(`${UB_L}پریوار${UB_R}`, "gu"), "خاندان");
  text = text.replace(new RegExp(`${UB_L}پریواروں${UB_R}`, "gu"), "خاندانوں");
  text = text.replace(new RegExp(`${UB_L}(?:سمبندھ|سنبندھ)${UB_R}`, "gu"), "تعلق");
  text = text.replace(new RegExp(`${UB_L}(?:سمبندھوں|سنبندھوں)${UB_R}`, "gu"), "تعلقات");
  text = text.replace(new RegExp(`${UB_L}شترو${UB_R}`, "gu"), "دشمن");
  text = text.replace(new RegExp(`${UB_L}شتروؤں${UB_R}`, "gu"), "دشمنوں");
  text = text.replace(new RegExp(`${UB_L}متر${UB_R}`, "gu"), "دوست");
  text = text.replace(new RegExp(`${UB_L}متروں${UB_R}`, "gu"), "دوستوں");
  text = text.replace(new RegExp(`${UB_L}یوگدان${UB_R}`, "gu"), "کردار");
  text = text.replace(new RegExp(`${UB_L}سروپرتھم${UB_R}`, "gu"), "سب سے پہلے");
  text = text.replace(new RegExp(`${UB_L}اوشیک${UB_R}`, "gu"), "ضروری");
  text = text.replace(new RegExp(`${UB_L}انوکل${UB_R}`, "gu"), "مناسب");

  // 5. Convert English Quran citations:
  // e.g. [Surah Al-Baqarah: 255] or (Surah Al-Baqarah: 255) -> [سورۃ البقرۃ: 255]
  text = text.replace(
    /[\[\(](?:Surah|Surat|Sura)?\s*([A-Za-z'-]+(?:\s+[A-Za-z'-]+)?)\s*[,:\s]+\s*(?:Ayah|Ayat|Verse)?\s*(\d+)[\]\)]/gi,
    (match, englishSurah, ayahNum) => {
      const cleanKey = englishSurah.toLowerCase().replace(/['\s-]/g, "");
      for (const [key, num] of Object.entries(ENGLISH_SURAH_MAP)) {
        if (cleanKey === key.replace(/['\s-]/g, "")) {
          const urduName = SURAH_NUMBER_TO_URDU[num] || englishSurah;
          return `[سورۃ ${urduName}: ${ayahNum}]`;
        }
      }
      return match;
    }
  );

  // e.g. [Surah 2:255] or (Surah 2:255) or [Quran 2:255]
  text = text.replace(
    /[\[\(](?:Surah|Surat|Quran|Qur'an)?\s*(\d+)\s*[:：]\s*(\d+)[\]\)]/gi,
    (match, surahNumStr, ayahNum) => {
      const sNum = parseInt(surahNumStr, 10);
      if (sNum >= 1 && sNum <= 114) {
        const urduName = SURAH_NUMBER_TO_URDU[sNum];
        return `[سورۃ ${urduName}: ${ayahNum}]`;
      }
      return match;
    }
  );

  // Clean English words inside blockquotes '>' that might be beside Ayahs
  // e.g. "> ﴿...﴾ Surah Al-Baqarah: 255" -> "> ﴿...﴾ [سورۃ البقرۃ: 255]"
  text = text.replace(
    /(>\s*﴿[^﴾]+﴾)\s*(?:Surah|Surat)?\s*([A-Za-z'-]+(?:\s+[A-Za-z'-]+)?)\s*[:：]\s*(\d+)/gi,
    (match, ayahPart, englishSurah, ayahNum) => {
      const cleanKey = englishSurah.toLowerCase().replace(/['\s-]/g, "");
      for (const [key, num] of Object.entries(ENGLISH_SURAH_MAP)) {
        if (cleanKey === key.replace(/['\s-]/g, "")) {
          const urduName = SURAH_NUMBER_TO_URDU[num] || englishSurah;
          return `${ayahPart} [سورۃ ${urduName}: ${ayahNum}]`;
        }
      }
      return match;
    }
  );

  return text;
}
