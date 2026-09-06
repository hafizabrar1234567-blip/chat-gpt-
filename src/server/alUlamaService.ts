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
  teen: "تین",
  tin: "تین",
  three: "تین",
  majlis: "مجلس",
  do: "دو",
  two: "دو",
  gussa: "غصہ",
  ghussa: "غصہ",
  shart: "شرط",
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
  pina: "پینا",
  peene: "پینے",
  pine: "پینے",
  pilana: "پلانا",
  pilane: "پلانے",
  doodh: "دودھ",
  dodh: "دودھ",
  dudh: "دودھ",
  dhodh: "دودھ",
  milk: "دودھ",
  khawind: "خاوند",
  khawand: "خاوند",
  ahliya: "اہلیہ",
  razaat: "رضاعت",
  raza: "رضاعت",
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
  rukhsati: "رخصتی",
  ruksati: "رخصتی",
  humbistari: "ہمبستری",
  hambistari: "ہمبستری",
  hambistri: "ہمبستری",
  humbistri: "ہمبستری",
  jima: "جماع",
  sohbat: "ہمبستری",
  mubashrat: "مباشرت",
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
  "بعد", "پہلے", "قبل", "دوران", "درمیان",
  "ہوا", "ہوئی", "ہوئ", "ہوئے", "ہوتے", "ہوگا", "ہوگی", "ہوںگے", "ہوںگی",
  "گیا", "گئی", "گئے", "جا", "جائے", "جائیں", "جاتا", "جاتی", "جاتے",
  "رہا", "رہی", "رہے", "رہنا", "رہتا", "رہتی", "رہتے",
  "دیا", "دی", "دئے", "دیے", "دینا", "دیتے", "دیتی",
  "لیا", "لی", "لئے", "لیے", "لینا", "لیتے", "لیتی",
  "کرنے", "کرتے", "کرتی", "کرتا", "کرے", "کروں", "کرلوں",
  "سکوں", "لیکن", "مگر", "بلکہ", "چونکہ", "حالانکہ",
  "جائز", "ناجائز", "حلال", "حرام", "مکروہ", "مستحب", "واجب", "حکم", "احکام", "مسئلہ", "مسائل", "شرعی", "فتوی", "فتویٰ", "فتاوی",
  "kia", "kya", "he", "hai", "hain", "k", "ke", "ki", "ka", "ks", "kis", "kisi",
  "mein", "me", "se", "par", "pr", "ko", "apna", "apni", "apne", "wala", "wali", "wale",
  "jaiz", "najaiz", "halal", "haram", "hukm", "hukam", "masla", "maslah", "fatwa",
  "aur", "agr", "agar", "to", "yeh", "woh", "is", "us", "bhi", "hi", "krna", "karna",
  "baad", "bad", "pehle", "pehly", "qabl", "doran", "darmiyan",
  "lekin", "magar", "gya", "gaya", "gaye", "gai", "hua", "hui", "hue", "hoga", "hogi",
  "bataye", "batayein", "bataen", "plz", "please"
]);

/**
 * Normalizes any query (Urdu, Roman Urdu, English) into clean Urdu keywords for search
 */
export function extractUrduTopicKeywords(query: string): string[] {
  if (!query || !query.trim()) return [];

  // 1. Tokenize query with Urdu compound words normalized
  const cleanStr = query
    .toLowerCase()
    .replace(/[؟?!\.,۔،:;'"()\/\\\[\]{}*#_`~<>+=|-]/g, " ")
    .replace(/ہم\s+بستری/g, "ہمبستری")
    .replace(/حق\s+مہر/g, "حقمہر")
    .replace(/اہل\s+حدیث/g, "اہلحدیث");

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

  // If user is explicitly asking for Hadith, Quran, Tafsir or Story without asking for a ruling/fatwa/permissibility
  const isHadithOrQuranRequest =
    /(حدیث|احادیث|روایت|hadees|hadith|سنن|بخاری|مسلم|قرآن|آیت|سورت|تفسیر|quran|surah|ayah)/i.test(lower);

  const hasExplicitRulingWord =
    /(فتوی|فتویٰ|فتاوی|فتاویٰ|fatwa|حکم|احکام|ruling|مسئلہ|مسائل|masla|maslah|جائز|ناجائز|jaiz|jayaz|najaiz|حلال|حرام|halal|haram|مکروہ|makrooh|واجب|wajib|بدعت|bidat|شرعی|sharia|shariah)/i.test(lower) ||
    /کیا.*(جائز|حلال|حرام|ہو سکتا|کر سکتے|منع|صحیح)/i.test(lower);

  // If it's purely asking for a Hadith/Quran quote without asking for a ruling, do not treat as fatwa search
  if (isHadithOrQuranRequest && !hasExplicitRulingWord) {
    return false;
  }

  // 1. Direct Urdu ruling keywords
  const urduFatwaWords = [
    "فتوی", "فتویٰ", "فتاوی", "فتاویٰ", "حکم", "احکام", "مسئلہ", "مسائل",
    "جائز", "ناجائز", "حلال", "حرام", "مکروہ", "مستحب", "واجب", "بدعت", "شرعی",
    "طلاق", "خلع", "عدت", "رجوع", "حلالہ", "مہر", "ولیمہ", "وراثت", "ترکہ",
    "قصر", "تیمم", "مسح", "استنجاء",
    "تولیہ", "خضاب", "دودھ", "رضاعت",
    "سود", "کرپٹو", "بٹ کوائن", "ٹریڈنگ", "بیمہ", "انشورنس", "لاٹری", "جوا",
    "alulama", "العلماء"
  ];

  for (const w of urduFatwaWords) {
    if (lower.includes(w)) return true;
  }

  // Check question patterns like "کیا ... جائز ہے", "کیا ... کر سکتے ہیں" or roman "kia ... jaiz he"
  if (/کیا.*(جائز|حلال|حرام|ہو سکتا|کر سکتے|منع|درست|صحیح)/i.test(lower)) {
    return true;
  }
  if (/(kia|kya|kis)\b.*(jaiz|najaiz|halal|haram|hukm|hukam|mana|kr sakty|kr sakte|peena|pina|doodh|dodh)/i.test(lower)) {
    return true;
  }

  // 2. Roman Urdu / English keywords
  const romanFatwaWords = [
    "fatwa", "fatwah", "fatawa", "hukam", "hukm", "masla", "maslah", "masail",
    "jaiz", "jayaz", "najaiz", "najayaz", "halal", "haram", "makrooh", "makruh",
    "wajib", "bidat", "talaq", "khula", "iddat", "toliya", "towel", "doodh", "dodh", "razaat", "sood", "riba",
    "crypto", "bitcoin", "sharia", "shariah", "ruling", "permissible"
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
 * Comprehensive Islamic Fiqh synonyms dictionary for multi-variant topic matching
 */
const synonymDict: Record<string, string[]> = {
  // Family / Marriage / Relations
  "ہمبستری": ["ہمبستری", "جماع", "مباشرت", "خلوت", "ازدواجی تعلق", "ہم بستری", "قربت", "صحبت", "ہمبستر"],
  "جماع": ["جماع", "ہمبستری", "مباشرت", "خلوت", "ازدواجی تعلق", "ہم بستری", "قربت", "صحبت", "ہمبستر"],
  "مباشرت": ["مباشرت", "ہمبستری", "جماع", "خلوت", "ازدواجی تعلق", "قربت"],
  "خلوت": ["خلوت", "تنہائی", "ہمبستری", "جماع", "مباشرت", "تعلق"],
  "تعلق": ["تعلق", "ازدواجی تعلق", "خلوت", "ہمبستری", "جماع"],
  "رخصتی": ["رخصتی", "وداعی", "قبل از رخصتی"],
  "شادی": ["شادی", "نکاح", "عقد"],
  "نکاح": ["نکاح", "عقد", "شادی"],
  "بیوی": ["بیوی", "اہلیہ", "زوجہ", "عورت"],
  "شوہر": ["شوہر", "خاوند", "زوج", "مرد"],
  "منگنی": ["منگنی", "منگیتر", "رشتہ"],
  "طلاق": ["طلاق", "علیحدگی", "تطلیق"],
  "خلع": ["خلع", "مخلوعہ"],
  "عدت": ["عدت", "سوگ"],
  "مہر": ["مہر", "حق مہر", "حقمہر", "صداق"],
  "ولیمہ": ["ولیمہ", "دعوت ولیمہ"],
  "دودھ": ["دودھ", "رضاعت", "چھاتی"],
  "رضاعت": ["رضاعت", "دودھ", "رضاعی"],

  // Taharah & Prayer
  "وضو": ["وضو", "طہارت", "پاکیزگی"],
  "غسل": ["غسل", "طہارت", "نہانا", "جنابت", "غسل جنابت"],
  "جنابت": ["جنابت", "ناپاکی", "غسل"],
  "ناپاکی": ["ناپاکی", "نجاست", "پلیدی", "جنابت"],
  "استنجاء": ["استنجاء", "طہارت", "پیشاب", "پاخانہ"],
  "تیمم": ["تیمم", "مٹی", "طہارت"],
  "موزے": ["موزے", "مسح", "جرابیں", "جوربین"],
  "مسح": ["مسح", "موزے", "جرابیں"],
  "نماز": ["نماز", "صلوۃ", "صلات"],
  "قصر": ["قصر", "مسافر", "سفر کی نماز"],
  "سجدہ": ["سجدہ", "سجدہ سہو", "سجدۂ تلاوت"],
  "تراویح": ["تراویح", "قیام رمضان"],
  "وتر": ["وتر", "دعائے قنوت"],
  "جنازہ": ["جنازہ", "نماز جنازہ", "تدفین", "میت"],

  // Fasting / Zakat / Hajj
  "روزہ": ["روزہ", "صوم", "صیام", "افطار", "سحری"],
  "افطار": ["افطار", "روزہ کھولنا", "روزہ"],
  "سحری": ["سحری", "سحر", "روزہ"],
  "کفارہ": ["کفارہ", "فدیہ"],
  "فدیہ": ["فدیہ", "کفارہ"],
  "زکوٰۃ": ["زکوٰۃ", "زکوۃ", "صدقہ واجبہ"],
  "صدقہ": ["صدقہ", "خیرات", "عطیہ"],
  "عشر": ["عشر", "پیداوار کی زکوٰۃ"],
  "قربانی": ["قربانی", "اضحیہ", "ذبیحہ"],
  "عقیقہ": ["عقیقہ", "بچے کی قربانی"],
  "حج": ["حج", "احرام", "طواف"],
  "عمرہ": ["عمرہ", "طواف", "سعی"],

  // Finance / Business
  "سود": ["سود", "ربا", "انٹرسٹ"],
  "قرض": ["قرض", "ادھار", "دین"],
  "قسط": ["قسط", "اقساط", "قسطوں", "انسٹالمنٹ"],
  "انشورنس": ["انشورنس", "بیمہ", "تکافل"],
  "بیمہ": ["بیمہ", "انشورنس", "تکافل"],
  "کرپٹو": ["کرپٹو", "بٹ کوائن", "ڈیجیٹل کرنسی"],
  "ٹریڈنگ": ["ٹریڈنگ", "فاریکس", "سٹاک", "شیئرز"],
  "جوا": ["جوا", "قمار", "لاٹری", "پرائز بانڈ"],
  "نوکری": ["نوکری", "ملازمت", "جاب"],

  // Daily Life / Halal / Haram
  "کھانا": ["کھانا", "غذا", "خوراک"],
  "پینا": ["پینا", "نوش کرنا"],
  "گوشت": ["گوشت", "ذبیحہ", "مرغی"],
  "داڑھی": ["داڑھی", "لحیہ", "خط بنوانا"],
  "تصویر": ["تصویر", "فوٹو", "ویڈیو"],
  "موسیقی": ["موسیقی", "گانا", "میوزک"],
  "خضاب": ["خضاب", "مہندی", "بال رنگنا"],
  "کتا": ["کتا", "کلب"],
  "بلی": ["بلی", "ہرہ"],
  "تولیہ": ["تولیہ", "خشک کرنا"],
  "انجکشن": ["انجکشن", "سوئی", "ڈرپ"],
};

function normalizeUrduText(text: string): string {
  if (!text) return "";
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u064B-\u065F\u0670]/g, "") // remove arabic diacritics
    .replace(/ہم\s+بستری/g, "ہمبستری")
    .replace(/حق\s+مہر/g, "حقمہر")
    .replace(/اہل\s+حدیث/g, "اہلحدیث")
    .replace(/قبل\s+از\s+رخصتی/g, "رخصتی سے پہلے")
    .toLowerCase();
}

function matchesWordOrSynonyms(target: string, word: string): boolean {
  if (target.includes(word)) return true;
  const synonyms = synonymDict[word] || [];
  return synonyms.some((syn) => target.includes(syn));
}

/**
 * Scores a candidate WordPress post strictly against extracted user topic keywords.
 * Checks post Title, Question section, and Content with full synonym expansion.
 */
function scoreCandidatePost(post: any, userQuery: string, topicKeywords: string[]): number {
  const normTitle = normalizeUrduText(post.title?.rendered || "");
  const rawContent = post.content?.rendered || "";
  const normContent = normalizeUrduText(rawContent);
  const normQuery = normalizeUrduText(userQuery);

  // Extract Question text (before 'جواب') from post content
  let questionSection = "";
  const jawabIdx = normContent.indexOf("جواب");
  if (jawabIdx !== -1) {
    questionSection = normContent.substring(0, jawabIdx);
  } else {
    questionSection = normContent.slice(0, 500);
  }

  const broadWords = new Set([
    "نماز", "روزہ", "وضو", "غسل", "اسلام", "دین", "مسئلہ", "حکم", "شرعی", "احکام", "بارے",
    "طلاق", "نکاح", "شادی",
    "حدیث", "احادیث", "روایت", "قرآن", "آیت", "سورت", "ترجمہ", "فضیلت", "بیان", "واقعہ", "قصہ"
  ]);
  const specificKeywords = topicKeywords.filter((w) => !broadWords.has(w));
  const primaryKeywords = specificKeywords.length > 0 ? specificKeywords : topicKeywords;

  // Conflict detection: If user query did NOT mention a sensitive status keyword, but candidate title is centered on it
  const conflictingWords = [
    "منگنی", "طلاق", "خلع", "عدت", "سود", "قرض", "انتقال", "وفات", "جنازہ",
    "بچے", "بچہ", "اولاد", "حمل", "پیدا" // child / pregnancy conflicts when user only asked about marital intimacy
  ];
  let conflictPenalty = 0;
  for (const cw of conflictingWords) {
    if (!normQuery.includes(cw) && normTitle.includes(cw)) {
      conflictPenalty += 60;
    }
  }

  // Pre-marital conflict: if user indicates nikah has happened, but candidate title says "نکاح سے قبل"
  if (normQuery.includes("نکاح") && !normQuery.includes("نکاح سے قبل") && normTitle.includes("نکاح سے قبل")) {
    conflictPenalty += 80;
  }

  let titleMatches = 0;
  let questionMatches = 0;
  let contentMatches = 0;

  for (const kw of primaryKeywords) {
    if (matchesWordOrSynonyms(normTitle, kw)) {
      titleMatches++;
    }
    if (matchesWordOrSynonyms(questionSection, kw)) {
      questionMatches++;
    }
    if (matchesWordOrSynonyms(normContent, kw)) {
      contentMatches++;
    }
  }

  // Either title OR the post's question section MUST match at least one specific keyword or direct synonym
  const strongMatches = Math.max(titleMatches, questionMatches);
  if (specificKeywords.length > 0 && strongMatches === 0) {
    return 0; // Reject false positives where neither title nor question relates to topic
  }

  // If multiple specific keywords exist, ensure they appear in title, question, or content
  if (specificKeywords.length >= 2) {
    const missingKeywords = specificKeywords.filter(
      (kw) =>
        !matchesWordOrSynonyms(normTitle, kw) &&
        !matchesWordOrSynonyms(questionSection, kw) &&
        !matchesWordOrSynonyms(normContent, kw)
    );
    if (missingKeywords.length > 0) {
      return 0; // Reject post if core distinguishing keywords are completely missing
    }
  }

  let score = titleMatches * 40 + questionMatches * 35;

  // High bonus if all specific keywords or synonyms appear in title or question section
  if (specificKeywords.length > 0 && strongMatches === specificKeywords.length) {
    score += 50;
  }

  // Modest bonus for general content matches
  score += Math.min(contentMatches * 5, 20);

  // Bonus for broad words if present in title or question
  for (const bw of broadWords) {
    if (normQuery.includes(bw) && (normTitle.includes(bw) || questionSection.includes(bw))) {
      score += 10;
    }
  }

  score -= conflictPenalty;
  return Math.max(0, score);
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

    // Build smart search terms: combined primary phrase, synonym-expanded phrases, and individual topic keywords
    const searchTerms: string[] = [];
    if (topicKeywords.length >= 2) {
      searchTerms.push(topicKeywords.slice(0, 3).join(" "));
    }

    // Synonym-expanded phrases (e.g. نکاح رخصتی ہمبستری -> نکاح رخصتی جماع)
    for (const kw of topicKeywords) {
      const syns = synonymDict[kw];
      if (syns && syns.length > 1) {
        for (const s of syns.slice(1, 3)) {
          const altPhrase = topicKeywords.map((k) => (k === kw ? s : k)).slice(0, 3).join(" ");
          searchTerms.push(altPhrase);
        }
      }
    }

    // Add individual topic keywords
    for (const kw of topicKeywords) {
      searchTerms.push(kw);
    }

    const finalSearchTerms = Array.from(new Set(searchTerms)).slice(0, 6);

    // Fetch candidate terms in parallel with 3.5s timeout
    const fetchPromises = finalSearchTerms.map(async (term) => {
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
      const score = scoreCandidatePost(post, userQuery, topicKeywords);
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
      searchKeywords: finalSearchTerms.join(" "),
    };

    fatwaCache.set(normalizedQuery, { fatwa: verifiedFatwa, expiresAt: Date.now() + CACHE_TTL_MS });
    return verifiedFatwa;
  } catch (error: any) {
    console.warn("AlUlama search error:", error?.message || error);
    return null;
  }
}
