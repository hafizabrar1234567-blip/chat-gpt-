import fs from "fs";
import path from "path";

export interface BookRecord {
  id: string;
  title: string;
  author?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  chunkCount: number;
  status: "indexed" | "processing" | "error";
  description?: string;
}

export interface KnowledgeChunk {
  id: string;
  bookId: string;
  bookTitle: string;
  chapter?: string;
  pageNumber?: number;
  content: string;
  keywords: string[];
}

interface KnowledgeStore {
  books: BookRecord[];
  chunks: KnowledgeChunk[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const BOOKS_DIR = path.join(DATA_DIR, "books");
const STORE_PATH = path.join(DATA_DIR, "knowledge_base.json");

// Ensure directories exist
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BOOKS_DIR)) {
    fs.mkdirSync(BOOKS_DIR, { recursive: true });
  }
}

// Extract text from buffer (supports PDF, TXT, JSON)
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  const type = fileType.toLowerCase();
  if (type === "pdf" || type === "application/pdf") {
    try {
      const pdfModule = await import("pdf-parse");
      const pdf = (pdfModule as any).default || pdfModule;
      const data = await pdf(buffer);
      return data.text || "";
    } catch (err) {
      console.error("PDF Parsing error, falling back to raw text:", err);
      return buffer.toString("utf-8");
    }
  }

  return buffer.toString("utf-8");
}

// Read store
export function getKnowledgeStore(): KnowledgeStore {
  ensureDirs();
  if (!fs.existsSync(STORE_PATH)) {
    // Seed with initial authentic starter knowledge
    const defaultStore: KnowledgeStore = {
      books: [
        {
          id: "starter-bukhari-essentials",
          title: "صحیح بخاری - منتخب ابواب (Sahih Bukhari Selection)",
          author: "امام محمد بن اسماعیل بخاری رحمہ اللہ",
          fileName: "sahih_bukhari_essentials.txt",
          fileType: "txt",
          fileSize: 10240,
          uploadedAt: new Date().toISOString(),
          chunkCount: 8,
          status: "indexed",
          description: "ایمان، نماز، علم، اخلاق اور روزمرہ زندگی کے بنیادی اور مستند احکام",
        },
        {
          id: "starter-fatawa-basics",
          title: "فتاویٰ بنیادی ارکانِ اسلام (Fatawa Pillars of Islam)",
          author: "کمیٹی برائے علمی تحقیقات و افتاء",
          fileName: "fatawa_pillars.txt",
          fileType: "txt",
          fileSize: 12400,
          uploadedAt: new Date().toISOString(),
          chunkCount: 10,
          status: "indexed",
          description: "طہارت، وضو، غسل، نمازِ قصر و قضا، زکوٰۃ، رمضان کے روزے اور حج کے فقہی احکام",
        },
        {
          id: "starter-tafseer-selected",
          title: "خلاصۃ القرآن و قرآنی ہدایات (Quranic Guidance)",
          author: "مستند اہل سنت تفاسیر",
          fileName: "quran_essentials.txt",
          fileType: "txt",
          fileSize: 9600,
          uploadedAt: new Date().toISOString(),
          chunkCount: 6,
          status: "indexed",
          description: "اہم سورتوں کی تفسیر، مضامینِ قرآن اور قرآنی اوامر و نواہی",
        },
      ],
      chunks: [
        {
          id: "bukhari-1",
          bookId: "starter-bukhari-essentials",
          bookTitle: "صحیح بخاری - منتخب ابواب",
          chapter: "کتاب بدء الوحی و الایمان",
          pageNumber: 1,
          content: "عَنْ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى». تمام اعمال کا دارومدار نیتوں پر ہے اور ہر انسان کو وہی ملے گا جس کی اس نے نیت کی۔ (صحیح بخاری: 1)",
          keywords: ["نیت", "اعمال", "بخاری", "حدیث", "اخلاص", "niyyat", "amal", "intentions"],
        },
        {
          id: "bukhari-2",
          bookId: "starter-bukhari-essentials",
          bookTitle: "صحیح بخاری - منتخب ابواب",
          chapter: "کتاب العلم",
          pageNumber: 15,
          content: "قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ». اللہ تعالیٰ جس کے ساتھ بھلائی کا ارادہ فرماتا ہے اسے دین کی گہری سمجھ اور فہم عطا فرماتا ہے۔ (صحیح بخاری: 71)",
          keywords: ["علم", "دین", "فقہ", "بخاری", "فضیلت", "ilm", "deen", "knowledge"],
        },
        {
          id: "fatawa-1",
          bookId: "starter-fatawa-basics",
          bookTitle: "فتاویٰ بنیادی ارکانِ اسلام",
          chapter: "طہارت اور وضو کے فرائض",
          pageNumber: 12,
          content: "وضو کے چار بنیادی فرائض قرآن مجید (سورۃ المائدہ: 6) میں بیان ہوئے ہیں: 1. چہرہ دھونا (پیشانی کے بالوں سے ٹھوڑی کے نیچے تک اور ایک کان کی لو سے دوسرے کان تک)۔ 2. دونوں ہاتھ کہنیوں سمیت دھونا۔ 3. پورے سر کا مسح کرنا۔ 4. دونوں پاؤں ٹخنوں سمیت دھونا۔ مسواک، بسم اللہ، اور تین تین بار دھونا سنتِ مؤکدہ ہے۔",
          keywords: ["وضو", "طہارت", "فرائض وضو", "wudu", "wudhu", "taharat", "farz"],
        },
        {
          id: "fatawa-2",
          bookId: "starter-fatawa-basics",
          bookTitle: "فتاویٰ بنیادی ارکانِ اسلام",
          chapter: "نمازِ قصر کے احکام",
          pageNumber: 45,
          content: "جب کوئی شخص اپنے شہر یا بستی کی حدود سے باہر سفر کی نیت سے نکلے اور مسافت تقریباً 77-78 کلومیٹر (یا 48 میل شرعی) ہو، تو وہ مسافر شمار ہوگا۔ مسافر پر 4 رکعت والی فرض نمازیں (ظہر، عصر، عشاء) قصر کر کے 2 رکعت پڑھنا سنتِ نبوی اور رخصت ہے۔ فجر اور مغرب میں کوئی قصر نہیں ہوتی۔",
          keywords: ["نماز قصر", "سفر", "مسافر", "namaz qasr", "safar", "musafir", "prayer travel"],
        },
        {
          id: "fatawa-3",
          bookId: "starter-fatawa-basics",
          bookTitle: "فتاویٰ بنیادی ارکانِ اسلام",
          chapter: "زکوٰۃ کے شرائط و نصاب",
          pageNumber: 80,
          content: "زکوٰۃ اسلام کا تیسرا اہم رکن ہے۔ سونے کا نصاب ساڑھے سات تولے (87.48 گرام) اور چاندی کا نصاب ساڑھے باون تولے (612.36 گرام) یا اس کے برابر نقدی/مالِ تجارت ہے۔ جب مال نصاب تک پہنچ جائے اور اس پر ایک قمری سال گزر جائے تو 2.5% (ڈھائی فیصد یا چالیسواں حصہ) زکوٰۃ ادا کرنا فرض ہے۔",
          keywords: ["زکوٰۃ", "نصاب", "سونا", "چاندی", "zakat", "nisab", "gold", "silver"],
        },
        {
          id: "fatawa-4",
          bookId: "starter-fatawa-basics",
          bookTitle: "فتاویٰ بنیادی ارکانِ اسلام",
          chapter: "روزہ کے احکام اور مفسدات",
          pageNumber: 110,
          content: "روزہ فجرِ صادق سے لے کر غروبِ آفتاب تک نیت کے ساتھ کھانے، پینے اور نفسانی خواہشات سے رکنے کا نام ہے۔ جان بوجھ کر کھانا پینا یا جماع کرنا روزے کو توڑ دیتا ہے۔ بھول کر کھانے پینے سے روزہ نہیں ٹوٹتا کیونکہ حدیث میں ہے: 'اسے اللہ نے کھلایا اور پلایا ہے'۔ سرمہ لگانا، غسل کرنا اور انجکشن لگوانا (جو غذائیت نہ ہو) سے روزہ نہیں ٹوٹتا۔",
          keywords: ["روزہ", "رمضان", "مفسدات روزہ", "سحری", "افطاری", "roza", "fasting", "ramadan", "sehri", "iftar"],
        },
        {
          id: "tafseer-1",
          bookId: "starter-tafseer-selected",
          bookTitle: "خلاصۃ القرآن و قرآنی ہدایات",
          chapter: "سورۃ الفاتحہ کی فضیلت اور مضامین",
          pageNumber: 1,
          content: "سورۃ الفاتحہ قرآن مجید کی سب سے عظیم سورت ہے، اسے 'ام الکتاب'، 'السبع المثانی' اور 'سورۃ الشفاء' بھی کہا جاتا ہے۔ یہ دعا، توحید، ربوبیت، قیامت کے فیصلے اور صراطِ مستقیم پر چلنے کی جامع ترین التجا ہے۔ ہر نماز کی ہر رکعت میں اس کا پڑھنا لازم ہے۔",
          keywords: ["فاتحہ", "سورۃ الفاتحہ", "ام الکتاب", "صراط مستقیم", "surah fatiha", "fatiha"],
        },
        {
          id: "tafseer-2",
          bookId: "starter-tafseer-selected",
          bookTitle: "خلاصۃ القرآن و قرآنی ہدایات",
          chapter: "آیت الکرسی کی عظمت",
          pageNumber: 25,
          content: "آیت الکرسی (سورۃ البقرہ: 255) قرآن کریم کی سب سے افضل ترین آیت ہے۔ اس میں اللہ تعالیٰ کی وحدانیت، حی و قیوم ہونے، کبھی نیند یا اونگھ نہ آنے، زمین و آسمان کی مکمل بادشاہت اور وسعتِ کرسی کا پرشکوہ بیان ہے۔ ہر فرض نماز کے بعد آیت الکرسی پڑھنے والے کے لیے جنت کی بشارت وارد ہوئی ہے۔",
          keywords: ["آیت الکرسی", "بقرہ", "توحید", "ayatul kursi", "kursi", "protection"],
        },
      ],
    };
    saveKnowledgeStore(defaultStore);
    return defaultStore;
  }

  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading knowledge base store:", err);
    return { books: [], chunks: [] };
  }
}

// Save store
export function saveKnowledgeStore(store: KnowledgeStore) {
  ensureDirs();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

// Tokenize text for Islamic keyword search (supports Urdu, Arabic, English, Roman Urdu)
function extractKeywords(text: string): string[] {
  if (!text) return [];
  const cleaned = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'۔،؍؛]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(" ").filter((w) => w.length > 2);
  return Array.from(new Set(words));
}

// Smart chunking function for large text
export function chunkText(
  text: string,
  bookId: string,
  bookTitle: string,
  chunkSize: number = 800,
  overlap: number = 150
): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  if (!text || text.trim().length === 0) return chunks;

  // Split by double newlines or major section headers if available
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = "";
  let pageNum = 1;
  let chunkIndex = 1;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length <= chunkSize) {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
    } else {
      if (currentChunk) {
        chunks.push({
          id: `${bookId}-chunk-${chunkIndex++}`,
          bookId,
          bookTitle,
          pageNumber: pageNum,
          content: currentChunk,
          keywords: extractKeywords(currentChunk),
        });
        if (chunkIndex % 3 === 0) pageNum++;
      }
      // Overlap context
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = (overlapText ? overlapText + "\n\n" : "") + trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      id: `${bookId}-chunk-${chunkIndex++}`,
      bookId,
      bookTitle,
      pageNumber: pageNum,
      content: currentChunk.trim(),
      keywords: extractKeywords(currentChunk),
    });
  }

  return chunks;
}

// Add a new book from text / uploaded file
export async function addBook(
  title: string,
  content: string,
  options?: {
    author?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    description?: string;
  }
): Promise<BookRecord> {
  const store = getKnowledgeStore();
  const bookId = "book-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

  const chunks = chunkText(content, bookId, title);

  const newBook: BookRecord = {
    id: bookId,
    title,
    author: options?.author || "مستند اسلامی مصنف / مکتبہ",
    fileName: options?.fileName || `${title.replace(/\s+/g, "_")}.txt`,
    fileType: options?.fileType || "txt",
    fileSize: options?.fileSize || Buffer.byteLength(content, "utf-8"),
    uploadedAt: new Date().toISOString(),
    chunkCount: chunks.length,
    status: "indexed",
    description: options?.description || `کتاب کے ${chunks.length} ابواب اور مضامین انڈیکس ہو چکے ہیں`,
  };

  store.books.unshift(newBook);
  store.chunks.push(...chunks);
  saveKnowledgeStore(store);

  // Also save raw text in data/books/
  try {
    const safeName = `${bookId}_${newBook.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    fs.writeFileSync(path.join(BOOKS_DIR, safeName), content, "utf-8");
  } catch (err) {
    console.error("Could not write raw book file:", err);
  }

  return newBook;
}

// Delete a book
export function deleteBook(bookId: string): boolean {
  const store = getKnowledgeStore();
  const bookIndex = store.books.findIndex((b) => b.id === bookId);
  if (bookIndex === -1) return false;

  store.books.splice(bookIndex, 1);
  store.chunks = store.chunks.filter((c) => c.bookId !== bookId);
  saveKnowledgeStore(store);
  return true;
}

// Search Knowledge Base for relevant excerpts
export interface SearchResult {
  chunk: KnowledgeChunk;
  score: number;
  highlightText: string;
}

export function searchKnowledgeBase(query: string, topK: number = 4): SearchResult[] {
  const store = getKnowledgeStore();
  if (!query || store.chunks.length === 0) return [];

  const queryKeywords = extractKeywords(query);
  const normalizedQuery = query.toLowerCase().trim();

  const results: SearchResult[] = [];

  for (const chunk of store.chunks) {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();
    const titleLower = chunk.bookTitle.toLowerCase();

    // Direct phrase match
    if (contentLower.includes(normalizedQuery)) {
      score += 15;
    }

    // Book title match
    if (titleLower.includes(normalizedQuery)) {
      score += 8;
    }

    // Keyword overlap
    for (const qk of queryKeywords) {
      if (chunk.keywords.includes(qk)) {
        score += 3;
      }
      if (contentLower.includes(qk)) {
        score += 2;
      }
      if (chunk.chapter && chunk.chapter.toLowerCase().includes(qk)) {
        score += 4;
      }
    }

    if (score > 0) {
      results.push({
        chunk,
        score,
        highlightText: chunk.content.slice(0, 300) + (chunk.content.length > 300 ? "..." : ""),
      });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}
