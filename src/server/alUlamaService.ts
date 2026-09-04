process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export interface AlUlamaFatwa {
  id: number;
  title: string;
  link: string;
  questionNumber?: string;
  questionText?: string;
  answerText?: string;
  fullContent: string;
}

// In-memory cache for fatwa queries (TTL: 1 hour)
const fatwaCache = new Map<string, { fatwa: AlUlamaFatwa | null; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Searches https://alulama.org using its official REST API.
 * Returns the most relevant fatwa ONLY if it genuinely matches the user's question topic.
 * Optimized with in-memory caching and parallel searches.
 */
export async function searchAlUlamaFatwa(userQuery: string): Promise<AlUlamaFatwa | null> {
  try {
    if (!userQuery || !userQuery.trim()) return null;

    const normalizedQuery = userQuery.trim().toLowerCase();
    const cached = fatwaCache.get(normalizedQuery);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.fatwa;
    }

    // 1. Clean words and filter generic domain words and stopwords
    const cleanRaw = userQuery.replace(/[؟?!\.,۔،:;'"()\/\\\[\]]/g, " ");
    const words = cleanRaw
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 1);

    const genericWords = new Set([
      "کیا", "ہے", "ہیں", "ہو", "ہوتی", "ہوتا", "تھا", "تھی", "تھے", "حکم", "احکام",
      "مسئلہ", "مسئلے", "مسائل", "فتویٰ", "فتوی", "بتائیں", "بتائیے", "وضاحت", "کریں",
      "فرمائیں", "کے", "کی", "کا", "میں", "سے", "پر", "کو", "اور", "اگر", "تو",
      "اس", "یہ", "وہ", "ان", "اپنے", "اپنی", "ایک", "بارے", "متعلق", "علماء",
      "لجنۃ", "alulama", "org", "ویب", "سائٹ", "پوچھا", "سوال", "معتبر", "مفتی",
      "شیخ", "رہنمائی", "کیجئے", "شکریہ", "جائز", "ناجائز", "حلال", "حرام", "نماز",
      "دین", "اسلام", "اسلامی", "ثواب", "گناہ", "ثابت", "جواب", "سکتی", "سکتا"
    ]);

    const topicKeywords = words.filter((w) => !genericWords.has(w) && w.length >= 3);

    if (topicKeywords.length === 0) {
      fatwaCache.set(normalizedQuery, { fatwa: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return null;
    }

    // Primary search term: top topic keywords
    const primaryTerm = topicKeywords.slice(0, 3).join(" ");
    const searchTerms = Array.from(new Set([primaryTerm, ...topicKeywords])).slice(0, 3);

    // Fetch candidate terms in parallel with 2.5s timeout
    const fetchPromises = searchTerms.map(async (term) => {
      const url = `https://alulama.org/wp-json/wp/v2/posts?search=${encodeURIComponent(term)}&per_page=3`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) IslamicChatGPT/1.0",
            "Accept": "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) return null;

        const posts: any[] = await response.json();
        if (!Array.isArray(posts) || posts.length === 0) return null;

        for (const post of posts) {
          const rawTitle = post.title?.rendered || "";
          const title = rawTitle
            .replace(/&#8217;/g, "'")
            .replace(/&#8211;/g, "-")
            .replace(/&amp;/g, "&")
            .replace(/<[^>]+>/g, "")
            .trim();

          const rawContent = post.content?.rendered || "";
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

          if (textContent.length < 30) continue;

          // STRICT RELEVANCE:
          // The title of the post MUST match at least one specific topic keyword of the query!
          const titleTokens = title.split(/\s+/).map((t) => t.trim());
          const hasTitleTopicMatch = topicKeywords.some((kw) =>
            titleTokens.some((t) => t === kw || (kw.length >= 4 && t.includes(kw)))
          );

          if (!hasTitleTopicMatch) {
            continue;
          }

          const link = post.link || `https://alulama.org/?p=${post.id}`;

          let questionNumber = "";
          const qNumMatch = textContent.match(/سوال\s*[:\s]*(\d+)/i);
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

          return {
            id: post.id,
            title,
            link,
            questionNumber,
            questionText,
            answerText,
            fullContent: textContent,
          };
        }
      } catch (termErr) {
        clearTimeout(timeoutId);
      }
      return null;
    });

    const results = await Promise.allSettled(fetchPromises);
    for (const res of results) {
      if (res.status === "fulfilled" && res.value) {
        fatwaCache.set(normalizedQuery, { fatwa: res.value, expiresAt: Date.now() + CACHE_TTL_MS });
        return res.value;
      }
    }

    fatwaCache.set(normalizedQuery, { fatwa: null, expiresAt: Date.now() + CACHE_TTL_MS });
    return null;
  } catch (error: any) {
    console.warn("AlUlama search error:", error?.message || error);
    return null;
  }
}
