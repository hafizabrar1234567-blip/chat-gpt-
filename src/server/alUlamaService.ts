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
  aurton: "عورت",
  aurto: "عورت",
  khawateen: "خواتین",
  group: "گروپ",
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
  "سکتی", "سکتا", "سکتے", "چاہیے", "چاہئے", "یا", "نہ", "نہیں", "بھی", "ہی", "تک",
  "جب", "تب", "اب", "سب", "کہ", "کون", "کس", "کسے", "کیسے", "کیوں", "کتنا",
  "طور", "العلماء", "علماء", "لجنۃ", "alulama",
  "بعد", "پہلے", "قبل", "دوران", "درمیان",
  "ہوا", "ہوئی", "ہوئ", "ہوئے", "ہوے", "ہوتے", "ہوگا", "ہوگی", "ہوںگے", "ہوںگی", "ہوگیا",
  "گیا", "گئی", "گئے", "جا", "جائے", "جائیں", "جاتا", "جاتی", "جاتے",
  "رہا", "رہی", "رہے", "رہنا", "رہتا", "رہتی", "رہتے",
  "دیا", "دی", "دئے", "دیے", "دینا", "دیتے", "دیتی",
  "لیا", "لی", "لئے", "لیے", "لینا", "لیتے", "لیتی",
  "کرنا", "کرنی", "کرنے", "کرتے", "کرتی", "کرتا", "کرے", "کروں", "کرلوں", "کرسکتے", "کرسکتی",
  "ہونا", "ہونی", "ہونے", "ہوتا", "ہوتی", "ہوتے", "ساتھ", "ساتھوں",
  "وجہ", "وجوہات", "دن", "دنوں", "ماہ", "مہینے", "مہینوں", "سال", "سالوں", "وقت", "اوقات", "طرح", "طریقے", "طریقوں", "صورت", "صورتوں", "حال", "حالت", "باعث", "سبب", "اسباب", "بار", "دفعہ", "مرتبہ",
  "سکوں", "لیکن", "مگر", "بلکہ", "چونکہ", "حالانکہ",
  "جائز", "ناجائز", "حلال", "حرام", "مکروہ", "مستحب", "واجب", "حکم", "احکام", "مسئلہ", "مسائل", "شرعی", "فتوی", "فتویٰ", "فتوے", "فتاوی", "فتاویٰ",
  "مجھے", "ہمیں", "میرا", "میری", "میرے", "مجھ", "ہمارا", "ہماری", "ہمارے",
  "آپ", "آپکو", "آپکے", "آپکی", "تم", "تمہارا", "تمہاری", "تمہیں", "تجھ",
  "کیے", "کیئے",
  "پوچھنا", "چاہتا", "چاہتی", "چاہتے", "درکار", "ضرورت", "معلومات",
  "کم", "زیادہ", "بچنے", "بچنا", "لکھوانا", "لکھنا", "لکھا", "بتانا", "بتایا", "پوچھا",
  "کسی", "کوئی", "کچھ", "وغیرہ", "مثلا", "مثلاً", "دیں", "دے",
  "اسکا", "اسکی", "اسکے", "انکا", "انکی", "انکے",
  "kia", "kya", "he", "hai", "hain", "k", "ke", "ki", "ka", "ks", "kis", "kisi",
  "mein", "me", "se", "par", "pr", "ko", "apna", "apni", "apne", "wala", "wali", "wale",
  "jaiz", "najaiz", "halal", "haram", "hukm", "hukam", "masla", "maslah", "fatwa",
  "aur", "agr", "agar", "to", "yeh", "woh", "is", "us", "bhi", "hi", "krna", "karna", "sath",
  "baad", "bad", "pehle", "pehly", "qabl", "doran", "darmiyan",
  "lekin", "magar", "gya", "gaya", "gaye", "gai", "hua", "hui", "hue", "hoga", "hogi",
  "bataye", "batayein", "bataen", "plz", "please",
  "ایسا", "ایسی", "ایسے", "آدمی", "شخص", "انسان", "لوگ", "بندہ", "بندے", "جسے", "جس", "جن", "جنہیں", "جسکو", "جنکو",
  "کروائے", "کروائی", "کروایا", "کروا", "کروایں", "کروانا", "کرکے", "کر", "طریقے", "طریقہ", "طریقوں", "ہوجائے", "ہوجائےگی", "ہوجائےگا", "ہوگی", "ہوگا",
  "جانے", "جانا", "جاؤ", "آنے", "آنا", "آتے", "آتی", "آتا", "آئے", "آئی", "آیا",
  "پیتے", "پیتا", "پیتی", "کھاتے", "کھاتی", "کھاتا", "پڑھتے", "پڑھتی", "پڑھتا",
  "یک", "دو", "تین", "چار", "پانچ", "چھ", "سات", "آٹھ", "نو", "دس",
  "پہ", "نے", "جو", "خود", "اسی", "انہی", "وہی", "یہی", "پاس", "والے", "والی", "والا", "والوں",
  "کہا", "کہی", "کہے", "کہتے", "کہتی", "کہتا", "کہنا", "پھر", "پڑے", "پڑا", "پڑی", "پڑیں", "پڑتا", "پڑتی", "پڑتے", "گا", "گی", "گے",
  "ڈسکس", "دار", "حوالے", "حوالہ", "معاملات", "معاملہ", "پہلا", "دوسرا", "تیسرا", "جبکہ", "چونکہ", "حالانکہ", "البتہ", "لہذا", "لہٰذا",
  "اسے", "انہیں", "اسکو", "انکو", "تھیں"
]);

/**
 * Normalizes any query (Urdu, Roman Urdu, English) into clean Urdu keywords for search
 */
export function extractUrduTopicKeywords(query: string): string[] {
  if (!query || !query.trim()) return [];

  // 1. Tokenize query with Arabic/Urdu diacritics stripped and compound words normalized
  const cleanStr = query
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "") // strip all A'raab/diacritics (zer, zabar, pesh, tanween)
    .replace(/[؟?!\.,۔،:;'"()\/\\\[\]{}*#_`~<>+=|-]/g, " ")
    // Separate stuck prefixes & prepositions (e.g. کےطلاق -> کے طلاق, سےنکاح -> سے نکاح)
    .replace(/(^|\s)(کے|سے|کو|کا|کی|پر|میں|اور|یا|نہ|نا|بے)(طلاق|نکاح|سائن|دستخط|کاغذ|مجبور|وضو|نماز|روزہ|حکم|مسئلہ|فتوی|سود)/g, "$1$2 $3")
    .replace(/(طلاق|نکاح|حق|سجدہ|اہل)\s*(نامہ|مہر|سہو|حدیث)/g, "$1 $2")
    .replace(/طلاق\s*نامہ/g, "طلاق نامہ")
    .replace(/دست\s*خط/g, "دستخط")
    .replace(/ہم\s+بستری/g, "ہمبستری")
    .replace(/حق\s+مہر/g, "حقمہر")
    .replace(/اہل\s+حدیث/g, "اہلحدیث")
    .replace(/عورتوں/g, "عورت")
    .replace(/مردوں/g, "مرد")
    .replace(/بچوں/g, "بچہ")
    .replace(/کتوں/g, "کتا");

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
    /(حدیث|احادیث|روایت|hadees|hadith|سنن|بخاری|صحیح\s*مسلم|امام\s*مسلم|قرآن|آیت|سورت|تفسیر|quran|surah|ayah)/i.test(lower);

  const hasExplicitRulingWord =
    /(فتوی|فتویٰ|فتاوی|فتاویٰ|فتوے|fatwa|حکم|احکام|ruling|مسئلہ|مسائل|مسئلے|masla|maslah|جائز|ناجائز|jaiz|jayaz|najaiz|حلال|حرام|halal|haram|مکروہ|makrooh|واجب|wajib|بدعت|bidat|شرعی|sharia|shariah)/i.test(lower) ||
    /کیا.*(جائز|حلال|حرام|ہو سکتا|کر سکتے|منع|صحیح|درست)/i.test(lower);

  // If it's purely asking for a Hadith/Quran quote without asking for a ruling, do not treat as fatwa search
  if (isHadithOrQuranRequest && !hasExplicitRulingWord) {
    return false;
  }

  // 1. Direct Urdu ruling keywords & Islamic Shariah topics
  const urduFatwaWords = [
    // Rulings & Shariah
    "فتوی", "فتویٰ", "فتاوی", "فتاویٰ", "فتوے", "حکم", "احکام", "مسئلہ", "مسائل", "مسئلے",
    "شرعی", "شریعت", "فقہ", "فقہی", "جائز", "ناجائز", "حلال", "حرام", "مکروہ", "مستحب",
    "واجب", "فرض", "سنت", "بدعت", "شرک", "کفر", "گناہ", "ثواب", "کفارہ", "فدیہ", "مباح",

    // Medical, Pregnancy, Abortion & Embryology
    "حمل", "اسقاط", "ضائع", "ابارشن", "تھیلیسیمیا", "تھیلیسمیا", "جنین", "روح", "120 دن", "۱۲۰ دن",
    "بچہ گرانا", "پیدائش", "آپریشن", "حاملہ",

    // Taharat & Cleanliness
    "وضو", "غسل", "طہارت", "پاک", "ناپاک", "نجاست", "استنجاء", "تیمم", "مسح",
    "حیض", "نفاس", "استحاضہ", "منی", "مذی", "تولیہ", "خضاب",

    // Worship (Salah, Sawm, Zakat, Hajj)
    "نماز", "روزہ", "سجدہ", "سہو", "قصر", "تراویح", "جنازہ", "اذان", "اقامت", "امامت", "مقتدی",
    "جمعہ", "وتر", "تہجد", "اشراق", "چاشت", "سفر", "مسافر", "قضا", "اعتکاف",
    "زکوۃ", "زکوٰۃ", "عشر", "فطرانہ", "فطرہ", "صدقہ", "حج", "عمرہ", "طواف", "قربانی", "عقیقہ",

    // Family, Marriage & Relations
    "نکاح", "شادی", "طلاق", "خلع", "عدت", "رجوع", "حلالہ", "مہر", "ولیمہ", "وراثت", "ترکہ",
    "رضاعت", "دودھ", "محرم", "نامحرم", "ہمبستری", "جماع", "مباشرت", "خلوت", "بیوی", "شوہر",

    // Finance, Commerce, Civics & Modern Issues
    "سود", "ربا", "بینک", "انشورنس", "بیمہ", "کریڈٹ کارڈ", "قرض", "کرپٹو", "بٹ کوائن",
    "ٹریڈنگ", "سٹاک", "شیئرز", "لاٹری", "جوا", "پرائز بانڈ", "کمیٹی", "رشوت", "بیع", "خرید", "فروخت",
    "ٹیکس", "ٹیکسز", "رجسٹری", "دستاویزات", "دستاویز", "کاغذات", "غلط بیانی", "کم قیمت", "جھوٹ",
    "دھوکہ", "فریب", "چوری", "خیانت", "امانت", "معاہدہ", "نوکری", "ملازمت", "تنخواہ", "جاب",
    "کاروبار", "تجارت", "پراپرٹی", "جائیداد", "زمین", "پلاٹ", "قرضہ", "شراکت", "مضاربت", "قسط",
    "اقساط", "عدالت", "کیس", "گواہی", "جھوٹی گواہی", "حلف", "حق", "حقوق", "ایگریمنٹ", "سرکاری",

    // Food & Animals
    "ذبح", "ذبیحہ", "گوشت", "کتا", "بلی", "سور", "شراب", "نشہ", "سگریٹ",

    // Ethics & Appearance
    "پردہ", "حجاب", "داڑھی", "بال", "ناخن", "تصویر", "موسیقی", "گانا", "قسم", "نذر", "منت",
    "alulama", "العلماء", "لجنۃ"
  ];

  for (const w of urduFatwaWords) {
    if (lower.includes(w)) return true;
  }

  // Check question patterns like "کیا ... جائز ہے", "کیا ... کر سکتے ہیں" or roman "kia ... jaiz he"
  if (/(کیا|کیا.*(جائز|حلال|حرام|ہو سکتا|کر سکتے|منع|درست|صحیح|حکم|طریقہ|گناہ|ثواب|کفارہ|لکھوانا|کرنا))/i.test(lower)) {
    return true;
  }
  if (/(بچنے کے لیے|غرض سے|کرنا کیسا|کرنے کا حکم|کیا حکم|شریعت کا کیا حکم|شرعی رہنمائی|جھوٹ بولنا|دھوکہ دینا)/i.test(lower)) {
    return true;
  }
  if (/(حمل|اسقاط|بچہ|روح|تھیلیسیمیا).*(ضائع|گرانا|ختم|حکم|جائز)/i.test(lower)) {
    return true;
  }
  if (/(kia|kya|kis)\b.*(jaiz|najaiz|halal|haram|hukm|hukam|mana|kr sakty|kr sakte|peena|pina|doodh|dodh|hamal|zaya)/i.test(lower)) {
    return true;
  }

  // 2. Roman Urdu / English keywords
  const romanFatwaWords = [
    "fatwa", "fatwah", "fatawa", "hukam", "hukm", "masla", "maslah", "masail",
    "jaiz", "jayaz", "najaiz", "najayaz", "halal", "haram", "makrooh", "makruh",
    "wajib", "bidat", "talaq", "khula", "iddat", "toliya", "towel", "doodh", "dodh", "razaat", "sood", "riba",
    "crypto", "bitcoin", "sharia", "shariah", "ruling", "permissible", "tax", "registry",
    "hamal", "isqat", "abortion", "thalassemia", "zaya", "namaz", "wuzu", "ghusl", "roza", "zakat", "hajj",
    "umrah", "qurbani", "nikah", "rooh"
  ];

  const words = lower.replace(/[^\w\s]/g, " ").split(/\s+/);
  for (const rw of romanFatwaWords) {
    if (words.includes(rw) || lower.includes(rw)) return true;
  }

  // In an Islamic ChatGPT app, any Urdu/Arabic query asking a question or situation
  // that is not a pure greeting or technical code/math is treated as an Islamic guidance query
  const hasUrduArabic = /[\u0600-\u06FF]/.test(message);
  const isPureGreeting = /^(السلام\s*علیکم|سلام|ہیلو|ہائے|صبح\s*بخیر|شام\s*بخیر|آپ\s*کون\s*ہیں|تعارف|اپنا\s*تعارف|hello|hi|hey|aoa)[\s!?.]*$/i.test(message.trim());
  const isPureMathOrCode = /^(\d+[\s+\-*/^]+\d+|solve\s+\d+|function\s*\(|class\s+\w+|console\.log)/i.test(message.trim());

  if (hasUrduArabic && !isPureGreeting && !isPureMathOrCode) {
    return true;
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
  "طلاق": ["طلاق", "علیحدگی", "تطلیق", "طلاق نامہ", "طلاقنامہ", "تین طلاقیں", "تین طلاق", "ایک طلاق"],
  "سائن": ["سائن", "دستخط", "کاغذ", "کاغذات", "لکھنا", "لکھ کر", "لکھوایا", "طلاق نامہ"],
  "دستخط": ["دستخط", "سائن", "کاغذ", "کاغذات", "لکھنا", "لکھ کر", "لکھوایا", "طلاق نامہ"],
  "مجبور": ["مجبور", "زبردستی", "دباؤ", "اکراہ", "جبر", "دھمکی", "زور زبردستی", "تہدید"],
  "زبردستی": ["زبردستی", "مجبور", "دباؤ", "اکراہ", "جبر", "دھمکی", "زور زبردستی"],
  "دباؤ": ["دباؤ", "مجبور", "زبردستی", "اکراہ", "جبر", "خاندانی دباؤ", "اصرار"],
  "اکراہ": ["اکراہ", "مجبور", "زبردستی", "دباؤ", "جبر", "دھمکی"],
  "کاغذ": ["کاغذ", "کاغذات", "سائن", "دستخط", "طلاق نامہ", "نوٹس"],
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
  "کتا": ["کتا", "کتے", "کتوں", "کلب"],
  "کتے": ["کتے", "کتا", "کتوں", "کلب"],
  "کاٹنا": ["کاٹنا", "کاٹنے", "کاٹا", "کاٹ", "ڈسنا", "زخمی"],
  "کاٹنے": ["کاٹنے", "کاٹنا", "کاٹا", "کاٹ", "ڈسنا", "زخمی"],
  "ذبح": ["ذبح", "ذبیحہ", "نحر", "حلال"],
  "جانور": ["جانور", "حیوان", "مویشی"],
  "بلی": ["بلی", "ہرہ"],
  "تولیہ": ["تولیہ", "خشک کرنا"],
  "انجکشن": ["انجکشن", "سوئی", "ڈرپ"],

  // Medical, Pregnancy & Abortion
  "تھیلیسیمیا": ["تھیلیسیمیا", "تھیلیسمیا", "بیماری", "thalassemia"],
  "تھیلیسمیا": ["تھیلیسیمیا", "تھیلیسمیا", "بیماری"],
  "حمل": ["حمل", "جنین", "بچہ", "پیٹ", "پریگننسی", "حاملہ"],
  "ضائع": ["ضائع", "اسقاط", "ساقط", "گرانا", "ختم"],
  "اسقاط": ["اسقاط", "ضائع", "ساقط", "گرانا", "ختم", "حمل ضائع"],

  // Alcohol & Intoxicants
  "شراب": ["شراب", "شرابی", "نشہ", "خمر", "مے", "شراب نوشی"],
  "شرابی": ["شرابی", "شراب", "نشئی", "نشہ", "شراب نوشی"],
  "نشہ": ["نشہ", "شراب", "شرابی", "منشیات", "انجکشن", "چرس"],
};

export function cleanHtmlToMarkdown(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/(h[1-6]|p|div|li)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "* ")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8217;/g, "’")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#038;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

function normalizeUrduText(text: string): string {
  if (!text) return "";
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u064B-\u065F\u0670]/g, "") // remove arabic diacritics
    .replace(/تھیلیسیمیا\s*کی/g, "تھیلیسیمیا کی")
    .replace(/تھیلیسمیا/g, "تھیلیسیمیا")
    .replace(/اسقاط\s*حمل/g, "اسقاط حمل")
    .replace(/ہم\s+بستری/g, "ہمبستری")
    .replace(/حق\s+مہر/g, "حقمہر")
    .replace(/اہل\s+حدیث/g, "اہلحدیث")
    .replace(/قبل\s+از\s+رخصتی/g, "رخصتی سے پہلے")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function matchesWordOrSynonyms(target: string, word: string): boolean {
  if (!target || !word) return false;
  if (word.length <= 3) {
    const regex = new RegExp(`(^|[^\\p{L}\\p{N}])${word}([^\\p{L}\\p{N}]|$)`, "u");
    if (regex.test(target)) return true;
    const synonyms = synonymDict[word] || [];
    return synonyms.some((syn) => {
      if (syn.length <= 3) {
        const synRegex = new RegExp(`(^|[^\\p{L}\\p{N}])${syn}([^\\p{L}\\p{N}]|$)`, "u");
        return synRegex.test(target);
      }
      return target.includes(syn);
    });
  }

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

  // Mandatory Core Domain check:
  // If user asks about a specific Islamic domain/topic, reject candidate posts that do not belong to that domain
  const coreDomains: Array<{ queryTriggers: string[]; requiredCandidates: string[] }> = [
    {
      queryTriggers: ["روزہ", "روزے", "روزوں", "روزہ دار", "صوم", "صیام", "سحری", "افطار", "اعتکاف"],
      requiredCandidates: ["روزہ", "روزے", "روزوں", "صوم", "صیام", "سحری", "افطار", "اعتکاف"],
    },
    {
      queryTriggers: ["نماز", "نمازیں", "نمازوں", "نمازی", "صلوۃ", "صلات", "سجدہ", "تراویح", "جنازہ", "قصر", "وتر"],
      requiredCandidates: ["نماز", "نمازیں", "نمازوں", "صلوۃ", "صلات", "سجدہ", "تراویح", "جنازہ", "قصر", "وتر"],
    },
    {
      queryTriggers: ["وضو", "طہارت", "مسح", "موزے", "تیمم"],
      requiredCandidates: ["وضو", "طہارت", "مسح", "موزے", "تیمم"],
    },
    {
      queryTriggers: ["غسل", "جنابت", "ناپاکی", "احتلام"],
      requiredCandidates: ["غسل", "جنابت", "ناپاکی", "احتلام", "طہارت"],
    },
    {
      queryTriggers: ["عمرہ", "عمرے", "حج", "طواف", "احرام", "میقات", "منی", "مزدلفہ", "عرفات"],
      requiredCandidates: ["عمرہ", "عمرے", "حج", "طواف", "احرام", "میقات", "منی", "مزدلفہ", "عرفات"],
    },
    {
      queryTriggers: ["زکوۃ", "زکوٰۃ", "عشر", "فطرانہ", "فطرہ"],
      requiredCandidates: ["زکوۃ", "زکوٰۃ", "عشر", "فطرانہ", "فطرہ", "صدقہ"],
    },
    {
      queryTriggers: ["قربانی", "عقیقہ", "ذبیحہ", "اضحیہ"],
      requiredCandidates: ["قربانی", "عقیقہ", "ذبیحہ", "اضحیہ"],
    },
    {
      queryTriggers: ["نکاح", "شادی", "عقد", "رخصتی", "ولیمہ", "منگنی"],
      requiredCandidates: ["نکاح", "شادی", "عقد", "رخصتی", "ولیمہ", "منگنی"],
    },
    {
      queryTriggers: ["طلاق", "خلع", "عدت", "رجوع", "حلالہ"],
      requiredCandidates: ["طلاق", "خلع", "عدت", "رجوع", "حلالہ"],
    },
    {
      queryTriggers: ["وراثت", "ورثاء", "ترکہ", "میراث", "وارث"],
      requiredCandidates: ["وراثت", "ورثاء", "ترکہ", "میراث", "وارث"],
    },
    {
      queryTriggers: ["سود", "ربا", "سودی", "انشورنس", "بینک"],
      requiredCandidates: ["سود", "ربا", "سودی", "انشورنس", "بینک"],
    },
    {
      queryTriggers: ["انجکشن", "ٹیکہ", "ڈرپ"],
      requiredCandidates: ["انجکشن", "ٹیکہ", "ڈرپ"],
    },
    {
      queryTriggers: ["خون", "بلڈ"],
      requiredCandidates: ["خون", "بلڈ"],
    },
    {
      queryTriggers: ["تھیلیسیمیا", "تھیلیسمیا"],
      requiredCandidates: ["تھیلیسیمیا", "تھیلیسمیا"],
    },
    {
      queryTriggers: ["اسقاط", "حمل ضائع"],
      requiredCandidates: ["اسقاط", "حمل", "ساقط"],
    },
    {
      queryTriggers: ["خضاب", "مہندی"],
      requiredCandidates: ["خضاب", "مہندی"],
    },
    {
      queryTriggers: ["تولیہ"],
      requiredCandidates: ["تولیہ", "خشک"],
    },
    {
      queryTriggers: ["شراب", "شرابی", "نشہ"],
      requiredCandidates: ["شراب", "شرابی", "نشہ", "خمر"],
    },
  ];

  for (const domain of coreDomains) {
    const isDomainInQuery = domain.queryTriggers.some((t) => normQuery.includes(t));
    if (isDomainInQuery) {
      const hasDomainMatch = domain.requiredCandidates.some(
        (rc) => normTitle.includes(rc) || questionSection.includes(rc)
      );
      if (!hasDomainMatch) {
        return 0; // Strict rejection of completely unrelated domain false positives
      }
    }
  }

  // Specific idiosyncratic case / role conflict:
  // Reject posts centered on narrow, specific circumstances not asked by the user
  const specificTitleScenarios = [
    "دو بیٹوں", "تین بیٹوں", "تین بیٹیوں", "چار بھائی", "ایک بیٹا", "دو بیویاں",
    "لیڈی ڈاکٹر", "خفیہ نکاح", "نکاح سے قبل", "جھوٹی گواہی", "سائٹ ٹیسٹ", "پہلے فوت",
    "اولاد کا فوت", "اولاد فوت", "زندگی میں اولاد",
    "قبضہ", "کرایہ", "کرایے", "دکان", "مکان",
    "قبروں", "قبر", "حیات النبی"
  ];
  for (const scenario of specificTitleScenarios) {
    if (normTitle.includes(scenario) && !normQuery.includes(scenario)) {
      return 0; // Reject if user didn't ask for this specific scenario
    }
  }

  // Talaq sub-type conflicts:
  // If candidate post is about "تین طلاق" (Three divorces), but query does not mention "تین طلاق" / "تین", or query is about "صلح" / "رجوع" (reconciliation)
  if (normTitle.includes("تین طلاق") || normTitle.includes("تین طلاقیں")) {
    const isThreeTalaqQuery =
      normQuery.includes("تین طلاق") ||
      normQuery.includes("3 طلاق") ||
      normQuery.includes("تین طلاقیں") ||
      (normQuery.includes("تین") && normQuery.includes("طلاق"));
    if (!isThreeTalaqQuery || normQuery.includes("صلح") || normQuery.includes("رجوع")) {
      return 0; // Three divorces directly conflicts with reconciliation / general queries
    }
  }

  // Reconciliation conflict:
  // If query is about "صلح" or "رجوع" without mentioning "حلالہ", but post title contains "حلالہ"
  if ((normQuery.includes("صلح") || normQuery.includes("رجوع")) && !normQuery.includes("حلالہ") && normTitle.includes("حلالہ")) {
    return 0;
  }

  // Life vs Estate conflict: If user specifies living person / lifetime gift, but candidate is about deceased estate / heirs
  if ((normQuery.includes("زندہ") || normQuery.includes("حیات") || normQuery.includes("زندگی")) && (normTitle.includes("ترکہ") || normTitle.includes("ورثاء"))) {
    return 0;
  }

  const broadWords = new Set([
    "عورت", "عورتوں", "مرد", "مردوں", "لوگ", "شخص", "انسان",
    "باپ", "والد", "والدہ", "ماں", "بیٹا", "بیٹے", "بیٹی", "بیٹیاں", "بھائی", "بہن", "بہنوں", "اولاد", "بچے", "بچہ", "بچوں", "خاندان",
    "نماز", "نمازیں", "نمازوں", "روزہ", "روزے", "روزوں", "وضو", "غسل", "اسلام", "دین", "مسئلہ", "حکم", "شرعی", "احکام", "بارے",
    "طلاق", "نکاح", "شادی", "سفر", "مسافر", "تعین", "رخ",
    "وراثت", "ترکہ", "میراث", "جائیداد", "تقسیم", "زمین", "پلاٹ", "مال", "پیسہ", "پیسے", "حصہ", "حصے", "حصوں",
    "رقم", "رقمیں", "روپے", "روپیہ", "خرید", "خریدنا", "خریدا", "ادا", "نام", "ذاتی",
    "زندہ", "حیات", "زندگی",
    "جانور", "گوشت", "چیز", "بات", "کام", "طریقہ", "جلسے", "تبلیغی", "پروگرام",
    "وقت", "دن", "رات", "سال", "مہینہ", "فوت", "وفات", "انتقال", "مرنا", "مرنے",
    "ٹیسٹ", "سائٹ",
    "حدیث", "احادیث", "روایت", "قرآن", "آیت", "سورت", "ترجمہ", "فضیلت", "بیان", "واقعہ", "قصہ", "کہانی", "سائنسدان",
    "اپنا", "اپنے", "اپنی"
  ]);
  const specificKeywords = topicKeywords.filter((w) => !broadWords.has(w));
  const primaryKeywords = specificKeywords.length > 0 ? specificKeywords : topicKeywords;

  // Family role conflict: If candidate title specifies a family member the user never mentioned
  const familyRoles = ["بہنوں", "بہن", "بیوی", "بیویاں", "ساس", "سسر", "داماد", "بہو", "سوتیلی ماں", "سوتیلا باپ", "چچا", "ماموں", "خالہ", "پھوپھی", "یتیم"];
  for (const fr of familyRoles) {
    if (!normQuery.includes(fr) && normTitle.includes(fr)) {
      return 0; // Reject if user didn't ask about this specific family relation!
    }
  }

  // Action / ruling conflict:
  const actionConflicts = ["معاف", "ہبہ", "وصیت", "وقف", "عمرِ نکاح", "عمر نکاح", "کم عمری"];
  for (const ac of actionConflicts) {
    if (!normQuery.includes(ac) && normTitle.includes(ac)) {
      return 0; // Reject if user didn't ask about this specific action!
    }
  }

  // Conflict detection: If user query did NOT mention a sensitive status keyword, but candidate title is centered on it
  const conflictingWords = [
    "منگنی", "طلاق", "خلع", "عدت", "سود", "قرض", "انتقال", "وفات", "جنازہ",
    "نکاح", "رخصتی", "ولیمہ", "حیض", "نفاس", "عمر",
    "بچے", "بچہ", "اولاد", "حمل", "پیدا", // child / pregnancy conflicts when user only asked about marital intimacy
    "جلسے", "تبلیغی"
  ];
  let conflictPenalty = 0;
  for (const cw of conflictingWords) {
    if (!normQuery.includes(cw) && normTitle.includes(cw)) {
      conflictPenalty += 100;
    }
  }

  // Pre-marital conflict: if user indicates nikah has happened, but candidate title says "نکاح سے قبل"
  if (normQuery.includes("نکاح") && !normQuery.includes("نکاح سے قبل") && normTitle.includes("نکاح سے قبل")) {
    conflictPenalty += 80;
  }

  // Inheritance vs Lifetime dispute conflict:
  // If candidate title contains "ورثاء", "ترکہ", "میراث" but query does NOT mention inheritance/estate
  if (!normQuery.includes("ورثاء") && !normQuery.includes("ترکہ") && !normQuery.includes("میراث") && !normQuery.includes("وارث") && (normTitle.includes("ورثاء") || normTitle.includes("ترکہ") || normTitle.includes("میراث"))) {
    return 0;
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

  const strongMatches = Math.max(titleMatches, questionMatches);
  const specificTitleMatches = specificKeywords.filter((kw) => matchesWordOrSynonyms(normTitle, kw)).length;

  // Strict Specificity Guard:
  // 1. A verified fatwa MUST have at least 1 keyword match in the Title (titleMatches >= 1).
  // 2. If specific keywords exist, title MUST match at least 1 SPECIFIC keyword (cannot just rely on broad words like "حصہ" or "بھائی").
  // 3. For queries with 2 or more specific keywords, candidate title MUST match at least 2 keywords to prevent accidental 1-word matches!
  if (titleMatches === 0 || (specificKeywords.length > 0 && specificTitleMatches === 0)) {
    return 0; // Completely reject false positive candidate posts!
  }

  if (specificKeywords.length >= 2 && titleMatches < 2) {
    return 0; // Reject accidental 1-word title coincidences!
  }

  // If multiple specific keywords exist, ensure post is not completely unrelated
  if (specificKeywords.length >= 2 && titleMatches < 2) {
    const missingKeywords = specificKeywords.filter(
      (kw) =>
        !matchesWordOrSynonyms(normTitle, kw) &&
        !matchesWordOrSynonyms(questionSection, kw) &&
        !matchesWordOrSynonyms(normContent, kw)
    );
    if (missingKeywords.length > 0 && strongMatches < 2) {
      return 0; // Reject post if core distinguishing keywords are completely missing
    }
  }

  let score = titleMatches * 60 + questionMatches * 35;

  // High bonus if multiple specific keywords or synonyms appear in title
  if (titleMatches >= 2) {
    score += titleMatches * 40;
  }

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

    // Build smart search terms: combined primary phrase, specific core pairs, and topic keywords
    const searchTerms = new Set<string>();
    const cleanLowerQuery = normalizedQuery;

    // 1. Natural user query phrase (up to 45 chars)
    const cleanUserQuery = userQuery.trim().replace(/[؟?!.,،]/g, " ").replace(/\s+/g, " ").trim();
    if (cleanUserQuery.length >= 4) {
      searchTerms.add(cleanUserQuery.slice(0, 45).trim());
    }

    // 2. Primary topic phrases (top 3 and top 4 keywords)
    if (topicKeywords.length >= 2) {
      searchTerms.add(topicKeywords.slice(0, 3).join(" "));
    }
    if (topicKeywords.length >= 4) {
      searchTerms.add(topicKeywords.slice(0, 4).join(" "));
    }

    // 3. UNIVERSAL COMBINATORIAL PAIRS:
    // Generate all 2-combinations of core keywords automatically for ANY Islamic topic
    const maxCore = Math.min(topicKeywords.length, 6);
    for (let i = 0; i < maxCore; i++) {
      for (let j = i + 1; j < maxCore; j++) {
        searchTerms.add(`${topicKeywords[i]} ${topicKeywords[j]}`);
      }
    }

    // 4. Morphological Variations & Synonyms:
    // Automatically derive root stems and synonyms for extracted keywords
    for (const kw of topicKeywords.slice(0, 5)) {
      let stem = "";
      if (kw.endsWith("ی") && kw.length > 3) {
        stem = kw.slice(0, -1); // e.g. شرابی -> شراب, سودی -> سود, نمازی -> نماز
      } else if (kw.endsWith("وں") && kw.length > 3) {
        stem = kw.slice(0, -2); // e.g. قسطوں -> قسط, نمازوں -> نماز, پیسوں -> پیسہ
      } else if (kw.endsWith("یں") && kw.length > 3) {
        stem = kw.slice(0, -2); // e.g. طلاقیں -> طلاق, نمازیں -> نماز
      } else if (kw.endsWith("ے") && kw.length > 3) {
        stem = kw.slice(0, -1) + "ا"; // e.g. سوتیلے -> سوتیلا, روزے -> روزہ, کتے -> کتا
      }

      if (stem && stem.length >= 2) {
        searchTerms.add(stem);
        for (const other of topicKeywords.slice(0, 4)) {
          if (other !== kw) {
            searchTerms.add(`${stem} ${other}`);
          }
        }
      }

      // Dynamic synonym expansion
      const synonyms = synonymDict[kw] || [];
      for (const syn of synonyms.slice(0, 2)) {
        if (syn !== kw) {
          searchTerms.add(syn);
          for (const other of topicKeywords.slice(0, 3)) {
            if (other !== kw) {
              searchTerms.add(`${syn} ${other}`);
            }
          }
        }
      }

      // Individual distinctive words (length >= 4 or religious roots)
      if (kw.length >= 4 || ["حج", "دم", "عید", "حمل", "سود", "بیع", "خلع", "وتر", "قصر"].includes(kw)) {
        searchTerms.add(kw);
      }
    }

    // Bigrams of adjacent keywords (fallback)
    for (let i = 0; i < topicKeywords.length - 1; i++) {
      searchTerms.add(`${topicKeywords[i]} ${topicKeywords[i + 1]}`);
    }

    const finalSearchTerms = Array.from(searchTerms).slice(0, 15);

    // Fetch candidate terms in parallel with robust 4.0s timeout and per_page=15
    const fetchPromises = finalSearchTerms.map(async (term) => {
      const url = `https://alulama.org/wp-json/wp/v2/posts?search=${encodeURIComponent(term)}&per_page=15`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

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

    // Require strict minimum threshold score of 60 (must match specific primary topic keywords in the title)
    if (bestScore < 60 || !bestPost) {
      fatwaCache.set(normalizedQuery, { fatwa: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return null;
    }

    const rawTitle = bestPost.title?.rendered || "";
    const title = rawTitle
      .replace(/&#8217;/g, "'")
      .replace(/&#8211;/g, "-")
      .replace(/&#8220;/g, "“")
      .replace(/&#8221;/g, "”")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/<[^>]+>/g, "")
      .trim();

    const rawContent = bestPost.content?.rendered || "";
    const textContent = cleanHtmlToMarkdown(rawContent);

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
