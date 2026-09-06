process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export interface AlUlamaFatwa {
  id: number;
  title: string;
  link: string;
  questionNumber?: string;
  questionText?: string;
  answerText?: string;
  fullContent: string;
  searchKeywords?: string;
}

// In-memory cache for fatwa queries (TTL: 1 hour)
const fatwaCache = new Map<string, { fatwa: AlUlamaFatwa | null; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

// Comprehensive Roman Urdu / English to Urdu transliteration dictionary
const romanToUrduMap: Record<string, string> = {
  // Wudu / Taharat / Cleanliness
  wezo: "وضو",
  wazu: "وضو",
  wuzu: "وضو",
  wudhu: "وضو",
  wadhu: "وضو",
  ghusal: "غسل",
  ghusl: "غسل",
  toliya: "تولیہ",
  tolia: "تولیہ",
  towel: "تولیہ",
  istinja: "استنجاء",
  istinza: "استنجاء",
  taharat: "طہارت",
  pak: "پاک",
  napak: "ناپاک",
  napaak: "ناپاک",
  paak: "پاک",
  tayammum: "تیمم",
  masah: "مسح",
  masa: "مسح",
  najasat: "نجاست",
  mani: "منی",
  mazi: "مذی",
  wadi: "ودی",
  haiz: "حیض",
  nifas: "نفاس",
  istehaza: "استحاضہ",

  // Permissibility / Rulings / Shariah
  jaiz: "جائز",
  jayaz: "جائز",
  jayej: "جائز",
  najaiz: "ناجائز",
  najayaz: "ناجائز",
  halal: "حلال",
  hlaal: "حلال",
  haram: "حرام",
  hraam: "حرام",
  makrooh: "مکروہ",
  makruh: "مکروہ",
  wajib: "واجب",
  farz: "فرض",
  farzain: "فرض",
  faradh: "فرض",
  sunnat: "سنت",
  sunnah: "سنت",
  mustahab: "مستحب",
  mubah: "مباح",
  bidat: "بدعت",
  biddat: "بدعت",
  shirk: "شرک",
  kufr: "کفر",
  gunah: "گناہ",
  sawab: "ثواب",
  ajr: "اجر",
  hukam: "حکم",
  hukm: "حکم",
  ahkam: "احکام",
  masla: "مسئلہ",
  maslah: "مسئلہ",
  masail: "مسائل",
  maslae: "مسئلے",
  fatwa: "فتوی",
  fatwah: "فتوی",
  fatawa: "فتاوی",
  fatawah: "فتاوی",
  shariat: "شریعت",
  shariah: "شریعت",
  shrai: "شرعی",
  sharai: "شرعی",
  shari: "شرعی",
  ruling: "حکم",
  permissible: "جائز",
  allowed: "جائز",
  forbidden: "حرام",
  prohibited: "حرام",

  // Prayer / Salah / Masjid
  namaz: "نماز",
  nimaz: "نماز",
  salah: "نماز",
  salat: "نماز",
  prayer: "نماز",
  sajda: "سجدہ",
  sajdah: "سجدہ",
  ruku: "رکوع",
  qirat: "قرات",
  qiraat: "قراءت",
  azan: "اذان",
  adhaan: "اذان",
  iqamat: "اقامت",
  imamat: "امامت",
  imam: "امام",
  muqtadi: "مقتدی",
  juma: "جمعہ",
  jummah: "جمعہ",
  friday: "جمعہ",
  taraweeh: "تراویح",
  taraveeh: "تراویح",
  tarawih: "تراویح",
  witir: "وتر",
  witr: "وتر",
  tahajjud: "تہجد",
  ishraq: "اشراق",
  chasht: "چاشت",
  janaza: "جنازہ",
  janazah: "جنازہ",
  qasr: "قصر",
  qasar: "قصر",
  safar: "سفر",
  musafir: "مسافر",
  sajdasahw: "سجدہ سہو",
  qaza: "قضا",

  // Fasting / Ramadan / Zakat / Hajj
  roza: "روزہ",
  roze: "روزے",
  sawm: "روزہ",
  fasting: "روزہ",
  sehri: "سحری",
  iftar: "افطار",
  iftari: "افطاری",
  ramzan: "رمضان",
  ramadan: "رمضان",
  itikaf: "اعتکاف",
  zakat: "زکوۃ",
  zakah: "زکوۃ",
  fitrana: "فطرانہ",
  fitrah: "فطرہ",
  sadqa: "صدقہ",
  sadaqah: "صدقہ",
  ashr: "عشر",
  ushr: "عشر",
  hajj: "حج",
  haj: "حج",
  umrah: "عمرہ",
  umra: "عمرہ",
  qurbani: "قربانی",
  aqeeqa: "عقیقہ",
  aqiqa: "عقیقہ",
  dam: "دم",
  ihram: "احرام",
  tawaf: "طواف",
  sai: "سعی",

  // Family / Marriage / Divorce
  nikah: "نکاح",
  nikaah: "نکاح",
  shaadi: "شادی",
  marriage: "نکاح",
  talaq: "طلاق",
  talaaq: "طلاق",
  divorce: "طلاق",
  khula: "خلع",
  khulaa: "خلع",
  iddat: "عدت",
  iddah: "عدت",
  mehar: "مہر",
  mahr: "مہر",
  ruju: "رجوع",
  halala: "حلالہ",
  virasat: "وراثت",
  wirast: "وراثت",
  wirasa: "وراثت",
  inheritance: "وراثت",
  walima: "ولیمہ",
  parda: "پردہ",
  purdah: "پردہ",
  hijab: "حجاب",
  niqab: "نقاب",
  aurat: "عورت",
  khawateen: "خواتین",
  mard: "مرد",
  bache: "بچے",
  bachon: "بچوں",
  aulad: "اولاد",
  walidain: "والدین",
  maan: "ماں",
  baap: "باپ",
  shohar: "شوہر",
  biwi: "بیوی",

  // Finance / Modern Issues
  sood: "سود",
  riba: "سود",
  interest: "سود",
  bank: "بینک",
  banking: "بینکنگ",
  loan: "قرض",
  qarz: "قرض",
  qiston: "قسطوں",
  kiston: "قسطوں",
  qist: "قسط",
  kist: "قسط",
  installment: "قسط",
  crypto: "کرپٹو",
  bitcoin: "بٹ کوائن",
  trading: "ٹریڈنگ",
  forex: "فاریکس",
  insurance: "انشورنس",
  bima: "بیمہ",
  lottery: "لاٹری",
  jowa: "جوا",
  gambling: "جوا",
  shares: "حصص",
  stock: "اسٹاک",
  job: "نوکری",
  naukri: "نوکری",
  mulazimat: "ملازمت",

  // Media / Tech / Daily Life / Occasions
  mobile: "موبائل",
  phone: "فون",
  screen: "اسکرین",
  quran: "قرآن",
  tilawat: "تلاوت",
  parhna: "پڑھنا",
  sunna: "سننا",
  dekhna: "دیکھنا",
  tasveer: "تصویر",
  photo: "تصویر",
  video: "ویڈیو",
  music: "موسیقی",
  gana: "گانا",
  daari: "داڑھی",
  dari: "داڑھی",
  beard: "داڑھی",
  kutta: "کتا",
  dog: "کتا",
  billi: "بلی",
  cat: "بلی",
  khana: "کھانا",
  peena: "پینا",
  pani: "پانی",
  gosht: "گوشت",
  zabiha: "ذبیحہ",
  istmaal: "استعمال",
  istemal: "استعمال",
  use: "استعمال",
  using: "استعمال",
  baad: "بعد",
  after: "بعد",
  pehle: "پہلے",
  before: "پہلے",
  duran: "دوران",
  during: "دوران",
  milad: "میلاد",
  melaad: "میلاد",
  rabiulawal: "ربیع الاول",
  eid: "عید",
  eidein: "عیدین",
};

const genericWords = new Set([
  "کیا", "ہے", "ہیں", "ہو", "ہوتی", "ہوتا", "تھا", "تھی", "تھے", "ہوں",
  "بتائیں", "بتائیے", "وضاحت", "کریں", "فرمائیں", "کے", "کی", "کا", "میں",
  "سے", "پر", "کو", "اور", "اگر", "تو", "اس", "یہ", "وہ", "ان", "اپنے", "اپنی",
  "ایک", "بارے", "متعلق", "پوچھا", "سوال", "رہنمائی", "کیجئے", "شکریہ",
  "سکتی", "سکتا", "چاہیے", "چاہئے", "یا", "نہ", "نہیں", "بھی", "ہی", "تک",
  "جب", "تب", "اب", "سب", "کہ", "کون", "کس", "کسے", "کیسے", "کیوں", "کتنا",
  "طور", "العلماء", "علماء", "لجنۃ", "alulama",
  "kia", "kya", "he", "hai", "hain", "k", "ke", "ki", "ka", "mein", "se", "par", "ko",
  "aur", "agr", "agar", "to", "yeh", "woh", "is", "us", "bhi", "hi", "krna", "karna",
  "bataye", "batayein", "bataen", "plz", "please"
]);

/**
 * Normalizes any query (Urdu, Roman Urdu, English) into clean Urdu keywords for search
 */
export function extractUrduTopicKeywords(query: string): string[] {
  if (!query || !query.trim()) return [];

  // 1. Tokenize query
  const cleanStr = query
    .toLowerCase()
    .replace(/[؟?!\.,۔،:;'"()\/\\\[\]{}*#_`~<>+=|-]/g, " ");

  const rawTokens = cleanStr.split(/\s+/).filter(Boolean);

  // 2. Map Roman Urdu / English tokens to Urdu equivalents
  const convertedTokens: string[] = [];
  for (const token of rawTokens) {
    if (romanToUrduMap[token]) {
      convertedTokens.push(romanToUrduMap[token]);
    } else {
      convertedTokens.push(token);
    }
  }

  // 3. Filter generic stopwords
  const topicKeywords = convertedTokens.filter(
    (w) =>
      !genericWords.has(w) &&
      (w.length >= 2 || w === "حج" || w === "دم" || w === "مد" || w === "عید") &&
      /[\u0600-\u06FF]/.test(w) // ensure it contains Urdu/Arabic characters
  );

  return Array.from(new Set(topicKeywords));
}

/**
 * Checks if a user message is asking for a Fatwa, Shariah ruling, or Fiqh issue.
 */
export function isIslamicFatwaQuery(message: string): boolean {
  if (!message || !message.trim()) return false;
  const lower = message.toLowerCase();

  // 1. Direct Urdu keywords
  const urduFatwaWords = [
    "فتوی", "فتویٰ", "فتاوی", "فتاویٰ", "حکم", "احکام", "مسئلہ", "مسائل",
    "جائز", "ناجائز", "حلال", "حرام", "مکروہ", "مستحب", "واجب", "فرض", "فرائض",
    "سنت", "بدعت", "شرک", "کفر", "گناہ", "ثواب", "طریقہ", "شرائط",
    "نماز", "روزہ", "زکوۃ", "زکوٰۃ", "حج", "عمرہ", "قربانی", "عقیقہ", "عشر",
    "نکاح", "طلاق", "خلع", "عدت", "رجوع", "حلالہ", "مہر", "ولیمہ", "وراثت", "ترکہ",
    "طہارت", "وضو", "غسل", "سجدہ", "سفر", "قصر", "تیمم", "مسح", "استنجاء",
    "تولیہ", "داڑھی", "خضاب", "پردہ", "حجاب", "ستر", "لباس",
    "سود", "بینک", "بینکنگ", "نوکری", "ملازمت", "قرض", "قسط", "قسطوں", "کرپٹو", "بٹ کوائن", "ٹریڈنگ", "بیمہ", "انشورنس", "لاٹری", "جوا",
    "میلاد", "ربیع الاول", "عید", "عیدین", "محفل", "تلاوت", "موسیقی", "گانا", "تصویر", "ویڈیو",
    "کھانا", "پینا", "ذبیحہ", "گوشت", "کتا", "بلی", "علماء", "العلماء", "alulama"
  ];

  for (const w of urduFatwaWords) {
    if (lower.includes(w)) return true;
  }

  // 2. Roman Urdu / English keywords
  const romanFatwaWords = [
    "fatwa", "fatwah", "fatawa", "hukam", "hukm", "masla", "maslah", "masail",
    "jaiz", "jayaz", "najaiz", "najayaz", "halal", "haram", "makrooh", "makruh",
    "wajib", "farz", "sunnat", "sunnah", "bidat", "namaz", "roza", "zakat", "zakah",
    "hajj", "umrah", "qurbani", "aqeeqa", "nikah", "talaq", "khula", "iddat", "wazu", "wudu", "wezo",
    "ghusl", "ghusal", "toliya", "towel", "sood", "riba", "bank", "naukri", "crypto", "bitcoin",
    "parda", "hijab", "milad", "rabiulawal", "eid", "sharia", "shariah", "ruling", "permissible", "allowed", "forbidden"
  ];

  const words = lower.replace(/[^\w\s]/g, " ").split(/\s+/);
  for (const rw of romanFatwaWords) {
    if (words.includes(rw) || lower.includes(rw)) return true;
  }

  return false;
}

/**
 * Returns the direct search URL on alulama.org for a given topic
 */
export function getAlUlamaSearchUrl(query: string): string {
  const keywords = extractUrduTopicKeywords(query);
  const term = keywords.length > 0 ? keywords.slice(0, 3).join(" ") : query.trim();
  return `https://alulama.org/?s=${encodeURIComponent(term)}`;
}

/**
 * Scores a candidate WordPress post strictly against extracted user topic keywords.
 * Enforces that specific topic keywords MUST match the post title.
 */
function scoreCandidatePost(post: any, topicKeywords: string[]): number {
  const rawTitle = post.title?.rendered || "";
  const title = rawTitle
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, "")
    .toLowerCase();

  const rawContent = post.content?.rendered || "";
  const content = rawContent
    .replace(/<[^>]+>/g, " ")
    .toLowerCase();

  const broadWords = new Set(["نماز", "روزہ", "وضو", "غسل", "اسلام", "دین", "مسئلہ", "حکم", "شرعی", "احکام", "بارے"]);
  const specificKeywords = topicKeywords.filter((w) => !broadWords.has(w));
  const primaryKeywords = specificKeywords.length > 0 ? specificKeywords : topicKeywords;

  let titleMatches = 0;
  let contentMatches = 0;

  for (const kw of primaryKeywords) {
    if (title.includes(kw)) {
      titleMatches++;
    } else if (content.includes(kw)) {
      contentMatches++;
    }
  }

  // Strict Rule: If we have specific topic keywords, the title MUST contain at least one specific keyword!
  if (specificKeywords.length > 0 && titleMatches === 0) {
    return 0; // Reject false positives where title does not relate to the specific topic
  }

  let score = titleMatches * 35;

  // Bonus if all specific keywords appear in title
  if (specificKeywords.length > 0 && titleMatches === specificKeywords.length) {
    score += 40;
  }

  // Modest bonus for content matches only if title is already relevant
  score += Math.min(contentMatches * 5, 20);

  // Bonus for broad words if present in title
  for (const bw of broadWords) {
    if (topicKeywords.includes(bw) && title.includes(bw)) {
      score += 10;
    }
  }

  return score;
}

/**
 * Searches https://alulama.org using its official REST API.
 * Returns the most relevant, highly scored verified fatwa ONLY if it genuinely matches the user's question topic.
 * Optimized with in-memory caching, parallel search, and smart relevance scoring.
 */
export async function searchAlUlamaFatwa(userQuery: string): Promise<AlUlamaFatwa | null> {
  try {
    if (!userQuery || !userQuery.trim()) return null;

    const normalizedQuery = userQuery.trim().toLowerCase();
    const cached = fatwaCache.get(normalizedQuery);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.fatwa;
    }

    const topicKeywords = extractUrduTopicKeywords(userQuery);

    if (topicKeywords.length === 0) {
      fatwaCache.set(normalizedQuery, { fatwa: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return null;
    }

    // Build prioritized search terms: combined primary terms and individual topic keywords
    const primaryTerm = topicKeywords.slice(0, 3).join(" ");
    const searchTerms = Array.from(new Set([primaryTerm, ...topicKeywords])).slice(0, 4);

    // Fetch candidate terms in parallel with 3.5s timeout
    const fetchPromises = searchTerms.map(async (term) => {
      const url = `https://alulama.org/wp-json/wp/v2/posts?search=${encodeURIComponent(term)}&per_page=10`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) IslamicChatGPT/1.0",
            "Accept": "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) return [];

        const posts: any[] = await response.json();
        return Array.isArray(posts) ? posts : [];
      } catch (termErr) {
        clearTimeout(timeoutId);
        return [];
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    const candidateMap = new Map<number, any>();

    for (const res of results) {
      if (res.status === "fulfilled" && Array.isArray(res.value)) {
        for (const post of res.value) {
          if (post && post.id && !candidateMap.has(post.id)) {
            candidateMap.set(post.id, post);
          }
        }
      }
    }

    if (candidateMap.size === 0) {
      fatwaCache.set(normalizedQuery, { fatwa: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return null;
    }

    let bestPost: any = null;
    let bestScore = 0;

    for (const post of candidateMap.values()) {
      const score = scoreCandidatePost(post, topicKeywords);
      if (score > bestScore) {
        bestScore = score;
        bestPost = post;
      }
    }

    // Require strict minimum threshold score of 35 (at least one specific primary topic keyword in the title)
    if (bestScore < 35 || !bestPost) {
      fatwaCache.set(normalizedQuery, { fatwa: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return null;
    }

    const rawTitle = bestPost.title?.rendered || "";
    const title = rawTitle
      .replace(/&#8217;/g, "'")
      .replace(/&#8211;/g, "-")
      .replace(/&amp;/g, "&")
      .replace(/<[^>]+>/g, "")
      .trim();

    const rawContent = bestPost.content?.rendered || "";
    const textContent = rawContent
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&#8217;/g, "'")
      .replace(/&#8211;/g, "-")
      .replace(/&amp;/g, "&")
      .replace(/\n\s*\n/g, "\n\n")
      .trim();

    const link = bestPost.link || `https://alulama.org/?p=${bestPost.id}`;

    let questionNumber = "";
    const qNumMatch = textContent.match(/سوال\s*[:\s(]*(\d+)[)\s:]*/i);
    if (qNumMatch) {
      questionNumber = `سوال نمبر ${qNumMatch[1]}`;
    }

    let questionText = "";
    let answerText = "";

    const jawabIndex = textContent.indexOf("جواب");
    if (jawabIndex !== -1) {
      questionText = textContent.substring(0, jawabIndex).trim();
      answerText = textContent.substring(jawabIndex).trim();
    } else {
      answerText = textContent;
    }

    const verifiedFatwa: AlUlamaFatwa = {
      id: bestPost.id,
      title,
      link,
      questionNumber,
      questionText,
      answerText,
      fullContent: textContent,
      searchKeywords: primaryTerm,
    };

    fatwaCache.set(normalizedQuery, { fatwa: verifiedFatwa, expiresAt: Date.now() + CACHE_TTL_MS });
    return verifiedFatwa;
  } catch (error: any) {
    console.warn("AlUlama search error:", error?.message || error);
    return null;
  }
}
