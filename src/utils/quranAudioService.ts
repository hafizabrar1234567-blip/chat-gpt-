// Quran Audio & Speech Service
// Authentic EveryAyah recitations for Sheikh Mishary Rashid Alafasy and Sheikh Saud Al-Shuraim

export type QariId = "alafasy" | "shuraim";

export interface QariInfo {
  id: QariId;
  nameUrdu: string;
  nameArabic: string;
  nameEnglish: string;
  baseUrl: string;
}

export const QARI_LIST: QariInfo[] = [
  {
    id: "alafasy",
    nameUrdu: "شیخ مشاری راشد العفاسی",
    nameArabic: "الشيخ مشاري راشد العفاسي",
    nameEnglish: "Sheikh Mishary Rashid Alafasy",
    baseUrl: "https://everyayah.com/data/Alafasy_128kbps",
  },
  {
    id: "shuraim",
    nameUrdu: "شیخ سعود الشریم",
    nameArabic: "الشيخ سعود الشريم",
    nameEnglish: "Sheikh Saud Al-Shuraim",
    baseUrl: "https://everyayah.com/data/Saood_ash-Shuraym_128kbps",
  },
];

// Mapping of Surah names to Numbers (1 to 114)
const SURAH_NAME_MAP: Record<string, number> = {
  "فاتحہ": 1, "الفاتحة": 1, "فاتحه": 1, "fatiha": 1,
  "بقرہ": 2, "البقرة": 2, "بقره": 2, "baqarah": 2, "baqara": 2,
  "آل عمران": 3, "عمران": 3, "آلِ عمران": 3, "imran": 3,
  "نساء": 4, "النساء": 4, "nisa": 4,
  "مائدہ": 5, "المائدة": 5, "مائده": 5, "maidah": 5, "maida": 5,
  "انعام": 6, "الأنعام": 6, "anam": 6,
  "اعراف": 7, "الأعراف": 7, "araf": 7,
  "انفال": 8, "الأنفال": 8, "anfal": 8,
  "توبہ": 9, "التوبة": 9, "توبه": 9, "tawbah": 9, "taubah": 9,
  "یونس": 10, "يونس": 10, "yunus": 10,
  "ہود": 11, "هود": 11, "hud": 11,
  "یوسف": 12, "يوسف": 12, "yusuf": 12,
  "رعد": 13, "الرعد": 13, "rad": 13,
  "ابراہیم": 14, "إبراهيم": 14, "ibrahim": 14,
  "حجر": 15, "الحجر": 15, "hijr": 15,
  "نحل": 16, "النحل": 16, "nahl": 16,
  "اسراء": 17, "الإسراء": 17, "بنی اسرائیل": 17, "isra": 17,
  "کہف": 18, "الكهف": 18, "kahf": 18,
  "مریم": 19, "مريم": 19, "maryam": 19,
  "طہ": 20, "طه": 20, "taha": 20,
  "انبیاء": 21, "الأنبياء": 21, "anbiya": 21,
  "حج": 22, "الحج": 22, "hajj": 22,
  "مؤمنون": 23, "المؤمنون": 23, "muminun": 23,
  "نور": 24, "النور": 24, "noor": 24, "nur": 24,
  "فرقان": 25, "الفرقان": 25, "furqan": 25,
  "شعراء": 26, "الشعراء": 26, "shuara": 26,
  "نمل": 27, "النمل": 27, "naml": 27,
  "قصص": 28, "القصص": 28, "qasas": 28,
  "عنکبوت": 29, "العنكبوت": 29, "ankabut": 29,
  "روم": 30, "الروم": 30, "rum": 30,
  "لقمان": 31, "luqman": 31,
  "سجدہ": 32, "السجدة": 32, "sajdah": 32,
  "احزاب": 33, "الأحزاب": 33, "ahzab": 33,
  "سبا": 34, "سبأ": 34, "saba": 34,
  "فاطر": 35, "fatir": 35,
  "یس": 36, "يس": 36, "yasin": 36, "yaseen": 36,
  "صافات": 37, "الصافات": 37, "saffat": 37,
  "ص": 38, "sad": 38,
  "زمر": 39, "الزمر": 39, "zumar": 39,
  "غافر": 40, "مؤمن": 40, "ghafir": 40,
  "فصلت": 41, "fussilat": 41,
  "شوریٰ": 42, "الشورى": 42, "shura": 42,
  "زخرف": 43, "الزخرف": 43, "zukhruf": 43,
  "دخان": 44, "الدخان": 44, "dukhan": 44,
  "جاثیہ": 45, "الجاثية": 45, "jathiyah": 45,
  "احقاف": 46, "الأحقاف": 46, "ahqaf": 46,
  "محمد": 47, "muhammad": 47,
  "فتح": 48, "الفتح": 48, "fath": 48,
  "حجرات": 49, "الحجرات": 49, "hujurat": 49,
  "ق": 50, "qaf": 50,
  "ذاریات": 51, "الذاريات": 51, "dhariyat": 51,
  "طور": 52, "الطور": 52, "tur": 52,
  "نجم": 53, "النجم": 53, "najm": 53,
  "قمر": 54, "القمر": 54, "qamar": 54,
  "رحمن": 55, "الرحمن": 55, "rahman": 55,
  "واقعہ": 56, "الواقعة": 56, "waqiah": 56,
  "حدید": 57, "الحديد": 57, "hadid": 57,
  "مجادلہ": 58, "المجادلة": 58, "mujadilah": 58,
  "حشر": 59, "الحشر": 59, "hashr": 59,
  "ممتحنہ": 60, "الممتحنة": 60, "mumtahanah": 60,
  "صف": 61, "الصف": 61, "saff": 61,
  "جمعہ": 62, "الجمعة": 62, "jumah": 62,
  "منافقون": 63, "المنافقون": 63, "munafiqun": 63,
  "تغابن": 64, "التغابن": 64, "taghabun": 64,
  "طلاق": 65, "الطلاق": 65, "talaq": 65,
  "تحریم": 66, "التحريم": 66, "tahrim": 66,
  "ملک": 67, "الملك": 67, "mulk": 67,
  "قلم": 68, "القلم": 68, "qalam": 68,
  "حاقہ": 69, "الحاقة": 69, "haqqah": 69,
  "معارج": 70, "المعارج": 70, "maarij": 70,
  "نوح": 71, "nuh": 71,
  "جن": 72, "الجن": 72, "jinn": 72,
  "مزمل": 73, "المزمل": 73, "muzzammil": 73,
  "مدثر": 74, "المدثر": 74, "muddathir": 74,
  "قیامہ": 75, "القيامة": 75, "qiyamah": 75,
  "انسان": 76, "الإنسان": 76, "دہر": 76, "insan": 76,
  "مرسلات": 77, "المرسلات": 77, "mursalat": 77,
  "نبا": 78, "النبأ": 78, "عم": 78, "naba": 78,
  "نازعات": 79, "النازعات": 79, "naziat": 79,
  "عبس": 80, "abasa": 80,
  "تکویر": 81, "التكوير": 81, "takwir": 81,
  "انفطار": 82, "الانفطار": 82, "infitar": 82,
  "مطففین": 83, "المطففين": 83, "mutaffifin": 83,
  "انشقاق": 84, "الانشقاق": 84, "inshiqaq": 84,
  "بروج": 85, "البروج": 85, "buruj": 85,
  "طارق": 86, "الطارق": 86, "tariq": 86,
  "اعلیٰ": 87, "الأعلى": 87, "ala": 87,
  "غاشیہ": 88, "الغاشية": 88, "ghashiyah": 88,
  "فجر": 89, "الفجر": 89, "fajr": 89,
  "بلد": 90, "البلد": 90, "balad": 90,
  "شمس": 91, "الشمس": 91, "shams": 91,
  "لیل": 92, "الليل": 92, "layl": 92,
  "ضحیٰ": 93, "الضحى": 93, "duha": 93,
  "انشراح": 94, "الشرح": 94, "شرح": 94, "sharh": 94,
  "تین": 95, "التين": 95, "tin": 95,
  "علق": 96, "العلق": 96, "alaq": 96,
  "قدر": 97, "القدر": 97, "qadr": 97,
  "بینہ": 98, "البينة": 98, "bayyinah": 98,
  "زلزال": 99, "الزلزلة": 99, "zalzalah": 99,
  "عادیات": 100, "العاديات": 100, "adiyat": 100,
  "قارعہ": 101, "القارعة": 101, "qariah": 101,
  "تکاثر": 102, "التكاثر": 102, "takathur": 102,
  "عصر": 103, "العصر": 103, "asr": 103,
  "ہمزہ": 104, "الهمزة": 104, "humazah": 104,
  "فیل": 105, "الفيل": 105, "feel": 105, "fil": 105,
  "قریش": 106, "quraysh": 106,
  "ماعون": 107, "الماعون": 107, "maun": 107,
  "کوثر": 108, "الكوثر": 108, "kawthar": 108,
  "کافرون": 109, "الكافرون": 109, "kafirun": 109,
  "نصر": 110, "النصر": 110, "nasr": 110,
  "مسد": 111, "المسد": 111, "لہب": 111, "masad": 111,
  "اخلاص": 112, "الإخلاص": 112, "ikhlas": 112,
  "فلق": 113, "الفلق": 113, "falaq": 113,
  "ناس": 114, "الناس": 114, "nas": 114,
};

export interface DetectedAyah {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  matchedText: string;
}

export function detectQuranAyah(text: string): DetectedAyah | null {
  if (!text) return null;

  const bracketMatch = text.match(/\[([^:\]]+)[:：]\s*(\d+)\]/);
  if (bracketMatch) {
    const rawSurah = bracketMatch[1].trim();
    const ayahNum = parseInt(bracketMatch[2], 10);

    if (/^\d+$/.test(rawSurah)) {
      const sNum = parseInt(rawSurah, 10);
      if (sNum >= 1 && sNum <= 114 && ayahNum > 0) {
        return {
          surahNumber: sNum,
          ayahNumber: ayahNum,
          surahName: "سورۃ نمبر " + sNum,
          matchedText: bracketMatch[0],
        };
      }
    }

    const cleaned = rawSurah
      .replace(/^سورة\s*/i, "")
      .replace(/^سورۃ\s*/i, "")
      .replace(/^ال/, "")
      .trim();

    for (const [key, num] of Object.entries(SURAH_NAME_MAP)) {
      const cleanKey = key.replace(/^ال/, "");
      if (rawSurah.includes(key) || cleaned === cleanKey || key.includes(cleaned)) {
        return {
          surahNumber: num,
          ayahNumber: ayahNum,
          surahName: rawSurah,
          matchedText: bracketMatch[0],
        };
      }
    }
  }

  const surahTextMatch = text.match(/سور[ۃة]\s+([^\s،,:\d]+)(?:.*?آیت(?:\s*نمبر)?\s*[:：]?\s*(\d+))/i);
  if (surahTextMatch) {
    const sName = surahTextMatch[1].trim();
    const aNum = parseInt(surahTextMatch[2], 10);
    const cleaned = sName.replace(/^ال/, "");

    for (const [key, num] of Object.entries(SURAH_NAME_MAP)) {
      const cleanKey = key.replace(/^ال/, "");
      if (sName.includes(key) || cleaned === cleanKey || key.includes(cleaned)) {
        return {
          surahNumber: num,
          ayahNumber: aNum,
          surahName: sName,
          matchedText: surahTextMatch[0],
        };
      }
    }
  }

  return null;
}

export function getQuranAudioUrl(surahNumber: number, ayahNumber: number, qari: QariId = "alafasy"): string {
  const selectedQari = QARI_LIST.find((q) => q.id === qari) || QARI_LIST[0];
  const sPad = String(surahNumber).padStart(3, "0");
  const aPad = String(ayahNumber).padStart(3, "0");
  return selectedQari.baseUrl + "/" + sPad + aPad + ".mp3";
}

export function extractMessageSections(text: string): {
  ayahArabic?: string;
  ayahTranslation?: string;
  hadithText?: string;
  tafseerText?: string;
} {
  const sections: {
    ayahArabic?: string;
    ayahTranslation?: string;
    hadithText?: string;
    tafseerText?: string;
  } = {};

  if (!text) return sections;

  const ayahMatch = text.match(/"([^"]*[\u064B-\u0652\u0670][^"]*)"\s*\[(?:[^:\]]+)[:：]\s*\d+\]/);
  if (ayahMatch) {
    sections.ayahArabic = ayahMatch[1].trim();
  }

  const transMatch = text.match(/ترجمہ\s*[:：]\s*"([^"]+)"/);
  if (transMatch) {
    sections.ayahTranslation = transMatch[1].trim();
  } else {
    const altTrans = text.match(/ترجمہ\s*[:：]\s*(.+?)(?=\n\n|\n[#*]|"|$)/);
    if (altTrans) {
      sections.ayahTranslation = altTrans[1].replace(/[*_`"]/g, "").trim();
    }
  }

  const hadithMatch = text.match(/"([^"]+)"\s*\[(صحیح\s*(?:مسلم|بخاری)|سنن|جامع|مشکاۃ)[^\]]*\]/);
  if (hadithMatch) {
    sections.hadithText = hadithMatch[1].trim();
  }

  const tafseerMatch = text.match(/(?:تفسیر|خلاصۃ التفسیر|مختصر وضاحت|شرعی حکم|اہم فوائد)[\s\S]*?(?=\n---|\n#|$)/);
  if (tafseerMatch) {
    sections.tafseerText = tafseerMatch[0].replace(/[*_`#]/g, "").trim();
  }

  return sections;
}

class AudioPlayerManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentTrackId: string | null = null;
  private listeners: Map<string, (state: { isPlaying: boolean; isPaused: boolean; progress: number }) => void> = new Map();

  playAyah(url: string, trackId: string, onStateChange?: (state: any) => void) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (this.currentAudio && this.currentTrackId === trackId) {
      if (this.currentAudio.paused) {
        this.currentAudio.play();
        this.notify(trackId, { isPlaying: true, isPaused: false, progress: 0 });
        return;
      }
    }

    this.stop();

    const audio = new Audio(url);
    this.currentAudio = audio;
    this.currentTrackId = trackId;

    if (onStateChange) {
      this.listeners.set(trackId, onStateChange);
    }

    audio.onplay = () => {
      this.notify(trackId, { isPlaying: true, isPaused: false, progress: 0 });
    };

    audio.onpause = () => {
      this.notify(trackId, { isPlaying: false, isPaused: true, progress: 0 });
    };

    audio.onended = () => {
      this.notify(trackId, { isPlaying: false, isPaused: false, progress: 100 });
      this.currentAudio = null;
      this.currentTrackId = null;
    };

    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      this.notify(trackId, { isPlaying: false, isPaused: false, progress: 0 });
      this.currentAudio = null;
      this.currentTrackId = null;
    };

    audio.play().catch((err) => {
      console.warn("Autoplay was blocked or failed:", err);
      this.notify(trackId, { isPlaying: false, isPaused: false, progress: 0 });
    });
  }

  pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
  }

  replay() {
    if (this.currentAudio) {
      this.currentAudio.currentTime = 0;
      this.currentAudio.play();
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      if (this.currentTrackId) {
        this.notify(this.currentTrackId, { isPlaying: false, isPaused: false, progress: 0 });
      }
      this.currentAudio = null;
      this.currentTrackId = null;
    }
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  private notify(trackId: string, state: any) {
    const cb = this.listeners.get(trackId);
    if (cb) cb(state);
  }
}

export const quranAudioPlayer = new AudioPlayerManager();
