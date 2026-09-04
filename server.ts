import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { generateFallbackResponse } from "./src/utils/fallbackGenerator";
import { getTripleCalendarInfo } from "./src/utils/calendarConverter";
import {
  registerUser,
  loginUser,
  getUserByToken,
  incrementUserUsage,
  logoutUser,
  requestForgotPassword,
  resetPasswordWithCode,
  loginOrRegisterGoogle,
} from "./src/server/authStore";
import {
  getKnowledgeStore,
  addBook,
  deleteBook,
  searchKnowledgeBase,
  extractTextFromBuffer,
  type BookRecord,
} from "./src/server/knowledgeBase";
import { searchAlUlamaFatwa } from "./src/server/alUlamaService";
import fs from "fs";

// Ensure Node TLS handles local Windows certificate proxies cleanly
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

dotenv.config();

export const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Helper to extract bearer token
function getBearerToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  return null;
}

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Islamic ChatGPT API" });
});

// Settings & Gemini API Key Management
app.get("/api/settings/status", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5;
  return res.json({
    success: true,
    hasGeminiKey: hasKey,
    model: "gemini-3.7-flash",
  });
});

app.post("/api/settings/key", (req, res) => {
  try {
    const { apiKey } = req.body || {};
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      return res.status(400).json({ success: false, error: "API Key درج کرنا لازمی ہے" });
    }
    const cleanKey = apiKey.trim();
    process.env.GEMINI_API_KEY = cleanKey;

    // Persist to .env file
    const envPath = path.join(process.cwd(), ".env");
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }
    if (envContent.includes("GEMINI_API_KEY=")) {
      envContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY="${cleanKey}"`);
    } else {
      envContent += `\nGEMINI_API_KEY="${cleanKey}"\n`;
    }
    fs.writeFileSync(envPath, envContent, "utf-8");

    return res.json({
      success: true,
      message: "Gemini API Key کامیابی سے محفوظ ہو گئی ہے اور لائیو AI ایکٹو ہو چکا ہے!",
      hasGeminiKey: true,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 📚 ISLAMIC BOOKS & KNOWLEDGE BASE APIS (RAG)
// ==========================================

// Get all indexed books and stats
app.get("/api/books", (req, res) => {
  try {
    const store = getKnowledgeStore();
    return res.json({
      success: true,
      books: store.books,
      totalChunks: store.chunks.length,
      totalBooks: store.books.length,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Upload or add a new book
app.post("/api/books/upload", async (req, res) => {
  try {
    const {
      title,
      author = "مستند اسلامی مصنف / مکتبہ",
      content = "",
      contentBase64 = "",
      fileName = "custom_book.txt",
      fileType = "txt",
      description = "",
    } = req.body || {};

    if (!title || (!content && !contentBase64)) {
      return res.status(400).json({
        success: false,
        error: "کتاب کا نام اور مواد درج کرنا لازمی ہے",
      });
    }

    let parsedText = content;

    // If file is provided in base64 (e.g. PDF or uploaded file)
    if (contentBase64) {
      const buffer = Buffer.from(contentBase64, "base64");
      parsedText = await extractTextFromBuffer(buffer, fileType);
    }

    if (!parsedText || parsedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "فائل میں سے متن حاصل نہیں ہو سکا",
      });
    }

    const newBook = await addBook(title, parsedText, {
      author,
      fileName,
      fileType,
      description,
    });

    return res.json({
      success: true,
      book: newBook,
      message: `کتاب "${title}" کامیابی سے انڈیکس کر لی گئی ہے۔`,
    });
  } catch (err: any) {
    console.error("Book upload error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a book
app.delete("/api/books/:id", (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deleteBook(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "کتاب نہیں ملی" });
    }
    return res.json({ success: true, message: "کتاب کامیابی سے حذف کر دی گئی ہے" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 💬 ISLAMIC CHATGPT PURE AI CONVERSATION API
// ==========================================

app.post("/api/chat", async (req, res) => {
  try {
    const {
      message = "",
      history = [],
      language = "urdu",
      stream = true,
    } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, error: "سوال درج کرنا لازمی ہے" });
    }

    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    const isStreamRequest = stream === true || req.headers.accept === "text/event-stream";

    if (!apiKey) {
      const noKeyReply = "⚠️ **Gemini API Key درکار ہے:** اصلی لائیو AI ماڈل سے متحرک اور خودکار جواب حاصل کرنے کے لیے برائے مہربانی `.env` فائل میں اپنی `GEMINI_API_KEY` سیٹ کریں، یا سائیڈبار میں **'Gemini AI سیٹنگز'** بٹن پر کلک کر کے اپنی مفت Google AI Key درج فرمائیں۔";
      if (isStreamRequest) {
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.write(`data: ${JSON.stringify({ chunk: noKeyReply, done: true, reply: noKeyReply, needsApiKey: true })}\n\n`);
        return res.end();
      }
      return res.status(200).json({
        success: false,
        reply: noKeyReply,
        needsApiKey: true,
      });
    }

    // 1. Search Al-Ulama (alulama.org) for authentic fatwas if query relates to fiqh, fatwa or islamic rulings
    const isFatwaOrFiqhQuery =
      message.includes("فتوی") ||
      message.includes("حکم") ||
      message.includes("مسئلہ") ||
      message.includes("جائز") ||
      message.includes("حلال") ||
      message.includes("حرام") ||
      message.includes("نماز") ||
      message.includes("روزہ") ||
      message.includes("زکوۃ") ||
      message.includes("زکوٰۃ") ||
      message.includes("حج") ||
      message.includes("نکاح") ||
      message.includes("طلاق") ||
      message.includes("طہارت") ||
      message.includes("وضو") ||
      message.includes("غسل") ||
      message.includes("سجدہ") ||
      message.includes("سفر") ||
      message.includes("قصر") ||
      message.includes("alulama") ||
      message.includes("علماء");

    let alUlamaFatwa = null;
    if (isFatwaOrFiqhQuery) {
      alUlamaFatwa = await searchAlUlamaFatwa(message);
    }

    let systemInstruction = `
You are "Islamic ChatGPT" (اسلامی چیٹ جی پی ٹی), an intelligent, comprehensive, authentic, and helpful general-purpose AI assistant with deep respect for Islamic knowledge, ethics, and universal wisdom.

Core Guidelines:
1. Genuinely and dynamically analyze and answer whatever question the user asks.
2. Answer each question independently and contextually based on the user's specific prompt.
3. CRITICAL MANDATORY HADITH FORMAT & ARABIC TEXT (احادیث مبارکہ کا مکمل و مستند اسلوب):
   جب بھی صارف کسی حدیث کے بارے میں پوچھے، کسی حدیث کا حوالہ/نمبر مانگے (مثلاً صحیح بخاری، صحیح مسلم، سنن وغیرہ کی کوئی بھی حدیث)، یا گفتگو میں کوئی حدیث پیش کی جائے، تو لازماً درج ذیل منظم اور خوبصورت ترتیب سے مکمل جواب دیں:
   
   - **مختصر تعارف و پس منظر:** حدیث کا موضوع، راوی صحابی اور حدیث کا مختصر پس منظر۔
   - **متن الحدیث (اصل عربی متن):** حدیث کا مکمل اصل عربی متن اعراب (تشکیل) کے ساتھ لازماً بلاک کوٹ (blockquote) میں پیش کریں:
     > «عربی متن مع اعراب»
   - **اردو ترجمہ:** سلیس، مستند اور با محاورہ مکمل اردو ترجمہ۔
   - **مکمل حوالہ:** کتاب کا نام، کتاب/باب کا عنوان، اور حدیث نمبر (مثلاً: صحیح بخاری، کتاب الوضوء، حدیث نمبر: 145)۔
   - **اس حدیث سے حاصل ہونے والے اہم نکات و فقہی فوائد:** واضح بلٹ پوائنٹس کی صورت میں۔

   *سخت ترین تنبیہ:* صرف ترجمہ لکھنا یا اصل عربی متن کو چھوڑ دینا ہرگز جائز نہیں ہے۔ ہر حدیث کے سوال میں اصل عربی متن (متن الحدیث) اعراب کے ساتھ لازماً شامل کیا جائے۔

4. For Islamic topics (Quran, Tafseer, Hadith, Fiqh, Islamic History, Tajweed, Duas, etc.), provide accurate, authentic Islamic explanations with respectful scholarly tone and relevant Arabic/Urdu references when appropriate.
5. For general, scientific, historical, technological, everyday, and general knowledge questions (e.g., science, geography, history, language, technology, general advice), answer accurately, intelligently, and clearly as a full-fledged AI assistant.
6. Adapt naturally and fluently to the language used by the user (Urdu, English, Roman Urdu, Arabic).
7. Maintain conversational continuity and context for follow-up questions within the active chat session.
8. Format responses beautifully using clean Markdown (headers, bullet points, quotes).
`;

    if (alUlamaFatwa) {
      systemInstruction += `

=== مستند ماخذ: لجنۃ العلماء (alulama.org) ===
عنوان فتویٰ: ${alUlamaFatwa.title}
${alUlamaFatwa.questionNumber ? `ریفرنس: ${alUlamaFatwa.questionNumber}` : ""}
اصل فتویٰ کا متن:
${alUlamaFatwa.fullContent}

Direct Fatwa Link: ${alUlamaFatwa.link}
Website Homepage Link: https://alulama.org/

لازمی ہدایات برائے فتویٰ جواب:
1. آپ کو صارف کے سوال کا جواب لجنۃ العلماء (alulama.org) کے مذکورہ بالا اصل فتویٰ کی بنیاد پر دینا ہے۔
2. جواب کے ساتھ واضح طور پر لکھیں: **ماخذ: لجنۃ العلماء / العلماء**۔
3. اصل فتویٰ کے متن یا حکم میں اپنی طرف سے کوئی ایسی تبدیلی نہ کریں جس سے اصل مفہوم بدلے۔
4. جواب کے اختتام پر لازماً درج ذیل دو الگ الگ لنکس فراہم کریں:
   - [العلماء ویب سائٹ کھولیں](https://alulama.org/)
   - [اصل فتویٰ دیکھیں](${alUlamaFatwa.link})
`;
    } else if (isFatwaOrFiqhQuery && (message.includes("فتوی") || message.includes("alulama") || message.includes("علماء"))) {
      systemInstruction += `

اہم نوٹ برائے فتویٰ ماخذ:
صارف کے فتویٰ/مسئلہ کے لیے لجنۃ العلماء (alulama.org) کی ویب سائٹ پر تلاش کیا گیا مگر متعلقہ فتویٰ alulama.org پر نہیں ملا۔
لہٰذا جواب میں واضح طور پر درج کریں:
"متعلقہ فتویٰ العلماء کی ویب سائٹ پر نہیں ملا۔"
اور اس کے بعد قرآن و سنت کے عمومی مستند دلائل کی روشنی میں صحیح رہنمائی پیش کریں۔ کبھی بھی اپنی طرف سے اسے لجنۃ العلماء کا فتویٰ بنا کر پیش نہ کریں۔
`;
    }

    // Build multi-turn contents for Gemini ensuring valid turn alternation
    const contents: any[] = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-10)) {
        if (h && typeof h.text === "string" && h.text.trim()) {
          const role = h.sender === "user" ? "user" : "model";
          if (contents.length === 0 || contents[contents.length - 1].role !== role) {
            contents.push({ role, parts: [{ text: h.text.trim() }] });
          } else {
            contents[contents.length - 1].parts[0].text += "\n" + h.text.trim();
          }
        }
      }
    }

    // Ensure the last item before current user message is not 'user'
    if (contents.length > 0 && contents[contents.length - 1].role === "user") {
      contents[contents.length - 1].parts[0].text += "\n" + message.trim();
    } else {
      contents.push({ role: "user", parts: [{ text: message.trim() }] });
    }

    const ai = getGeminiClient();

    // Fast candidate models in prioritized order
    const candidateModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3.5-flash",
      "gemini-3.7-flash",
      "gemini-flash-latest",
      "gemini-3.8-flash",
    ];

    const getModelConfig = (modelName: string) => {
      const cfg: any = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        temperature: 0.7,
        maxOutputTokens: 2500,
      };
      if (
        modelName.includes("3.7-flash") ||
        modelName.includes("3.8-flash") ||
        modelName.includes("3.5-flash") ||
        modelName.includes("3.1-flash-lite") ||
        modelName === "gemini-flash-latest"
      ) {
        cfg.thinkingConfig = { thinkingBudget: 0 };
      }
      return cfg;
    };

    if (isStreamRequest) {
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      let streamSuccess = false;
      let fullReply = "";
      let lastError: any = null;

      for (const model of candidateModels) {
        try {
          const config = getModelConfig(model);
          const streamResult = await ai.models.generateContentStream({
            model,
            contents,
            config,
          });

          for await (const chunk of streamResult) {
            const chunkText = chunk.text || "";
            if (chunkText) {
              fullReply += chunkText;
              res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
              if ((res as any).flush) (res as any).flush();
            }
          }

          if (fullReply) {
            streamSuccess = true;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Streaming attempt for model ${model} failed:`, err?.message || err);
        }
      }

      if (!streamSuccess && !fullReply) {
        try {
          const fallbackData = generateFallbackResponse(
            "islamic_qa",
            message,
            (language as any) || "urdu",
            "islamic"
          );
          if (fallbackData) {
            const parts: string[] = [];
            if ((fallbackData as any).arabicText) {
              parts.push(`> ${(fallbackData as any).arabicText}`);
            }
            if ((fallbackData as any).translation) {
              parts.push(`**ترجمہ:** ${(fallbackData as any).translation}`);
            }
            if ((fallbackData as any).answerUrdu) {
              parts.push((fallbackData as any).answerUrdu);
            } else if ((fallbackData as any).answer) {
              parts.push((fallbackData as any).answer);
            } else if ((fallbackData as any).summary) {
              parts.push((fallbackData as any).summary);
            }
            if (parts.length > 0) {
              fullReply = parts.join("\n\n");
              res.write(`data: ${JSON.stringify({ chunk: fullReply })}\n\n`);
              streamSuccess = true;
            }
          }
        } catch (fbErr) {
          console.warn("Fallback generator failed:", fbErr);
        }
      }

      if (!streamSuccess && !fullReply) {
        const errMsg = lastError?.message || "ماڈل سے جواب حاصل نہیں ہو سکا";
        const failText = `❌ **Google Gemini API Error:** ${errMsg}\n\nبرائے مہربانی اپنی API Key اور انٹرنیٹ کنکشن کی جانچ فرمائیں۔`;
        res.write(`data: ${JSON.stringify({ chunk: failText, error: errMsg, done: true, reply: failText })}\n\n`);
        return res.end();
      }

      // Ensure exact Al-Ulama links are present if a fatwa was retrieved from alulama.org
      if (alUlamaFatwa && !fullReply.includes(alUlamaFatwa.link)) {
        const extraCitations = `\n\n---\n* [العلماء ویب سائٹ کھولیں](https://alulama.org/)\n* [اصل فتویٰ دیکھیں](${alUlamaFatwa.link})`;
        fullReply += extraCitations;
        res.write(`data: ${JSON.stringify({ chunk: extraCitations })}\n\n`);
      }

      res.write(
        `data: ${JSON.stringify({
          done: true,
          reply: fullReply,
          isAI: true,
          alUlamaSource: alUlamaFatwa
            ? {
                title: alUlamaFatwa.title,
                directLink: alUlamaFatwa.link,
                homepageLink: "https://alulama.org/",
              }
            : null,
        })}\n\n`
      );
      return res.end();
    }

    // Standard Non-streaming Response
    let replyText = "";
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const config = getModelConfig(model);
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });

        if (response && response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} attempt failed:`, err?.message || err);
      }
    }

    if (!replyText) {
      try {
        const fallbackData = generateFallbackResponse(
          "islamic_qa",
          message,
          (language as any) || "urdu",
          "islamic"
        );
        if (fallbackData) {
          const parts: string[] = [];
          if ((fallbackData as any).arabicText) {
            parts.push(`> ${(fallbackData as any).arabicText}`);
          }
          if ((fallbackData as any).translation) {
            parts.push(`**ترجمہ:** ${(fallbackData as any).translation}`);
          }
          if ((fallbackData as any).answerUrdu) {
            parts.push((fallbackData as any).answerUrdu);
          } else if ((fallbackData as any).answer) {
            parts.push((fallbackData as any).answer);
          } else if ((fallbackData as any).summary) {
            parts.push((fallbackData as any).summary);
          }
          if (parts.length > 0) {
            replyText = parts.join("\n\n");
          }
        }
      } catch (fbErr) {
        console.warn("Fallback generator failed:", fbErr);
      }
    }

    if (!replyText) {
      const errMsg = lastError?.message || "ماڈل سے جواب حاصل نہیں ہو سکا";
      return res.status(200).json({
        success: false,
        reply: `❌ **Google Gemini API Error:** ${errMsg}\n\nبرائے مہربانی اپنی API Key اور انٹرنیٹ کنکشن کی جانچ فرمائیں۔`,
        error: errMsg,
      });
    }

    // Ensure exact Al-Ulama links are present if a fatwa was retrieved from alulama.org
    if (alUlamaFatwa && !replyText.includes(alUlamaFatwa.link)) {
      replyText += `\n\n---\n* [العلماء ویب سائٹ کھولیں](https://alulama.org/)\n* [اصل فتویٰ دیکھیں](${alUlamaFatwa.link})`;
    }

    return res.json({
      success: true,
      reply: replyText,
      isAI: true,
      alUlamaSource: alUlamaFatwa
        ? {
            title: alUlamaFatwa.title,
            directLink: alUlamaFatwa.link,
            homepageLink: "https://alulama.org/",
          }
        : null,
    });
  } catch (globalErr: any) {
    console.error("Chat route critical error:", globalErr);
    return res.status(500).json({
      success: false,
      reply: `❌ سرور کی خرابی: ${globalErr.message}`,
      error: globalErr.message,
    });
  }
});

// AUTHENTICATION API ROUTES

app.post("/api/auth/register", (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "ای میل اور پاس ورڈ ضروری ہیں" });
    }
    const result = registerUser(email, password, name);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || "رجسٹریشن میں ناکامی" });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "ای میل اور پاس ورڈ ضروری ہیں" });
    }
    const result = loginUser(email, password);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(401).json({ success: false, error: err.message || "لاگ ان میں ناکامی" });
  }
});

app.get("/api/auth/me", (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "ٹاکن موجود نہیں ہے" });
  }
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ success: false, error: "سیشن ختم ہو چکا ہے" });
  }
  return res.json({ success: true, user });
});

app.post("/api/auth/logout", (req, res) => {
  const token = getBearerToken(req);
  if (token) {
    logoutUser(token);
  }
  return res.json({ success: true, message: "Logged out successfully" });
});

app.post("/api/auth/forgot-password", (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, error: "ای میل درج کریں" });
    }
    const result = requestForgotPassword(email);
    return res.json({
      success: true,
      message: "ری سیٹ کوڈ بھیج دیا گیا ہے",
      resetCode: result.resetCode,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || "کوڈ بھیجنے میں مسئلہ آیا" });
  }
});

app.post("/api/auth/reset-password", (req, res) => {
  try {
    const { email, code, newPassword } = req.body || {};
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, error: "تمام خانے پر کریں" });
    }
    resetPasswordWithCode(email, code, newPassword);
    return res.json({ success: true, message: "پاس ورڈ کامیابی سے تبدیل ہو گیا ہے۔" });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || "پاس ورڈ تبدیلی میں ناکامی" });
  }
});

app.post("/api/auth/google", (req, res) => {
  try {
    const { email, name } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, error: "ای میل درج کریں" });
    }
    const result = loginOrRegisterGoogle(email, name);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || "گوگل سائن ان ناکام ہو گیا" });
  }
});

app.get("/api/auth/usage", (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  return res.json({ success: true, dailyUsage: user.dailyUsage });
});

app.post("/api/auth/increment-usage", (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  if (user.dailyUsage.count >= 10) {
    return res.status(403).json({ success: false, error: "آج کی مفت نسلیں ختم ہو چکی ہیں" });
  }
  const updatedUsage = incrementUserUsage(user.id);
  return res.json({ success: true, dailyUsage: updatedUsage });
});

app.post("/api/generate", async (req, res) => {
  try {
    const {
      featureType,
      topic = "",
      imageBase64 = null,
      language = "urdu",
      style = "simple",
      category = "General",
      platform = "Instagram",
      selectedPlatforms = [],
      socialPostMode = "visual_post",
      nonce = "",
      conversationHistory = [],
    } = req.body;

    const activePlatforms =
      Array.isArray(selectedPlatforms) && selectedPlatforms.length > 0
        ? selectedPlatforms
        : [platform || "Instagram"];
    const platformsText = activePlatforms.join(", ");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY missing - using Smart Fallback generation");
      const fallbackData = generateFallbackResponse(
        featureType,
        topic,
        language,
        style,
        platform,
        category
      );
      (fallbackData as any).selectedPlatforms = activePlatforms;
      return res.json({
        success: true,
        data: fallbackData,
        isFallback: true,
        meta: {
          featureType,
          language,
          style,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const ai = getGeminiClient();

    // Map language instruction
    let langInstruction = "";
    if (language === "urdu") {
      langInstruction = "MUST write response primarily in proper, elegant Urdu Script (اردو رسم الخط). Emojis and hashtags can be included.";
    } else if (language === "arabic") {
      langInstruction = "MUST write response primarily in eloquent, authentic Arabic (اللغة العربية الفصحى). Emojis and hashtags can be included.";
    } else {
      langInstruction = "MUST write response in clear, modern English.";
    }

    let systemInstruction = "";
    if (featureType === "logo_design") {
      systemInstruction = `You are a World-Class Brand Identity Designer and Master Calligrapher specializing in Royal Monograms, Interlocking Letter Badges, Islamic Calligraphy Emblems, YouTube Channel Avatars, TikTok Profile Badges, and Luxury Crest Logos for ${platformsText}.

CRITICAL USER MANDATE FOR LOGO DESIGN:
1. STRICT ENTITY / BRAND EXTRACTION & USER NAME FIDELITY:
   - You MUST extract ONLY the pure institute, brand, channel, or person name specified in the user's request (e.g. if the user says "مجھے نا اس طرح کا میرے نام کا لوگو بنا کر دیں ابرار کے نام کا", extract "Abrar" / "حافظ ابرار")!
   - When an image is attached, NEVER use the name shown inside the sample image as the user's name if the user has requested their own name (like "ابرار" / "Abrar" / "حافظ ابرار") in their prompt! The image is provided solely as a visual STYLE REFERENCE.
   - You are STRICTLY FORBIDDEN from including conversational request words like "مجھے", "ہمیں", "میرے لیے", "کا بنا کر دیں", "بنا دیں", "چاہیے", "لوگو بنا دیں", "اس طرح کا", "اس جیسا", "اس ڈیزائن میں اور بنا کر دیں", "اور بنا دیں".
   - If the user query is a follow-up (e.g. "مجھے اس ڈیزائن میں اور بنا کر دیں", "اور بنا دیں", "اس جیسا ایک اور بنا دیں", "مزید ڈیزائن بنا دیں"), extract the brand/person name from the previous discussion in the conversation history!
   - CONCRETE EXAMPLES:
     * If user asks: "مجھے نا اس طرح کا میرے نام کا لوگو بنا کر دیں ابرار کے نام کا" with an image:
       -> logoText: "Abrar" (or "Hafiz Abrar")
       -> logoUrduText: "حافظ ابرار"
       -> monogramInitials: "AB" (or "HA")
       -> badgeShape: "interlocking_oval" (matching the oval interlocking letter badge)
       -> themeStyle: "royal_gold_dark" (rich 24K Royal Gold with deep contrasting luxury background)
     * If user asks: "مجھے المصفی انسٹیٹیوٹ کا بنا کر دیں" (Make me a logo of Al-Musaffa Institute):
       -> logoText: "Al-Musaffa Institute"
       -> logoUrduText: "المصفیٰ انسٹیٹیوٹ"
       -> monogramInitials: "MI"
       -> themeStyle: "islamic_emerald_gold" (vibrant emerald green and radiant 24K gold)
     * If user asks: "میرے نام حافظ ابرار کا یوٹیوب لوگو بنا دیں":
       -> logoText: "Hafiz Abrar"
       -> logoUrduText: "حافظ ابرار"
       -> monogramInitials: "HA"
       -> themeStyle: "royal_gold_dark"
   - NEVER put "مجھے", "بنا کر دیں", "کا بنا دیں", "اس ڈیزائن میں", or whole request sentences in logoText, logoUrduText, or monogramInitials!

2. MULTIMODAL REFERENCE IMAGE & COLOR PALETTES:
   - If the user provides a reference screenshot or logo image:
     * Deeply analyze its geometry, badge silhouette, typographical flow, and aesthetic (e.g. interlocking letters with curved crossbars inside an elliptical/oval badge, 3D gold crest, neon cyber mark, or Arabic calligraphy).
     * Set 'badgeShape' to "interlocking_oval" (for interlocking monogram badges), "royal_crest", "modern_shield", "minimal_circle", or "classic_monogram".
     * ALWAYS use vibrant, rich, radiant colors (24K Gold, Emerald Green, Sapphire Blue, Ruby Red, Cyber Neon, Turquoise) unless monochrome is explicitly requested!
     * Recreate that exact high-end aesthetic tailored for the user's requested name!

3. DIVERSITY & PLATFORM SPECIFICITY:
   - Tailor the primary design and theme according to selected platform(s): ${platformsText}.
     * If YouTube: Generate bold creator channel branding, "youtube_red_gold", "royal_gold_dark" or Cyber Neon, badge shapes like "modern_shield", "cyber_hexagon", "laurel_wreath".
     * If TikTok / Reels: Generate high-contrast, energetic gradients like "tiktok_cyan_magenta", "cyber_neon_purple", "modern_shield".
     * If WhatsApp: Generate circular or oval DP avatars, "interlocking_oval", "islamic_emerald_gold" or "royal_gold_dark", "minimal_circle", "islamic_dome", "islamic_calligraphy".
     * If Instagram / Facebook: Generate luxury aesthetic "rose_gold_luxury", "sapphire_luxury", "luxury_diamond", "royal_crest".
     * If Islamic context: Prioritize "islamic_calligraphy", "islamic_dome", "islamic_emerald_gold", "royal_crest".

4. 5 UNIQUE VIBRANT VARIATION CONCEPTS:
   - Provide 5 completely distinct, diverse design variation concepts in the 'variations' array (so the user can switch between 5 fresh, distinct styles immediately)!
     * Concept 1: 24K Gold Interlocking Letter Oval Monogram ("interlocking_oval", "royal_gold_dark")
     * Concept 2: Royal 3D Gold Luxury Crest ("royal_crest", "royal_gold_dark")
     * Concept 3: Islamic Emerald Dome & Calligraphy ("islamic_dome", "islamic_emerald_gold")
     * Concept 4: YouTube / Creator Red & Gold Shield ("modern_shield", "youtube_red_gold")
     * Concept 5: Sapphire Blue Circle DP or Cyber Neon ("minimal_circle", "sapphire_luxury" or "cyber_hexagon", "tiktok_cyan_magenta")

5. STRICT EMBLEM CLEANLINESS:
   - Keep the logo mark pristine, ultra-clean, elegant, and majestic with bright radiant metallic luster and vivid colors.
   - Provide monogram initials (1-2 uppercase letters, e.g. "AB", "HA", "MI", or "A") in 'monogramInitials'.
   - Provide an optional 1-2 word luxury tagline (e.g. "Official", "Studio", "Creator", "Academy", "Channel") in 'tagline'.
   - Pick badgeShape: "interlocking_oval", "royal_crest", "islamic_calligraphy", "islamic_dome", "luxury_diamond", "modern_shield", "minimal_circle", "classic_monogram", "cyber_hexagon", "laurel_wreath", or "vintage_badge".
   - Pick themeStyle: "royal_gold_dark", "islamic_emerald_gold", "sapphire_luxury", "ruby_prestige", "cyber_neon_purple", "youtube_red_gold", "tiktok_cyan_magenta", "rose_gold_luxury", "sunset_titanium", or "turquoise_marble".

ISLAMIC HADITH & QURAN MANDATE:
- All Islamic guidance and references must be grounded exclusively in the Holy Quran and Authentic Sahih Hadith from Sahih Bukhari or Sahih Muslim with exact citation. Never cite weak or unverified narrations.
VARIATION NONCE: ${nonce || Date.now()}

Return valid JSON adhering to the schema.`;
    } else if (featureType === "islamic_qa") {
      const liveCal = getTripleCalendarInfo(new Date());
      systemInstruction = `You are the Islamic, Cloud & Super AI ChatGPT Assistant (اسلامی و جدید چیٹ جی پی ٹی سپر معاون - Islamic & AI ChatGPT). You excel across all core ChatGPT capabilities:
1. ✍️ تحریر و مواد نگاری (Writing, Essays, Speeches, Letters, Emails, Summaries, Translations, Creative Content)
2. 💻 کوڈنگ و سوفٹ ویئر ڈویلپمنٹ (Coding, Python, TypeScript, React, HTML/CSS, SQL, Web Scraping, Bots, APIs, Bug Fixing)
3. 📊 تجزیہ و ڈیٹا ریسرچ (Deep Analysis, Mathematics, Problem Solving, Business Proposals, Logic & Comparisons)
4. 🛠️ جدید AI ٹولز و پرامپٹس (Master Prompts for Claude 3.7, ChatGPT, Cursor AI, Midjourney, Gemini, Google AI Studio)
5. 🕌 قرآنی علوم، مستند فتاویٰ و اخلاقیات (Quranic Sciences, Mutashabihat for Huffaz, Sahih Hadith, Fatwa alulama.org)
6. 🗓️ لائیو ٹرپل کیلنڈر (انگریزی، اسلامی ہجری و پنجابی دیسی بکرمی کیلنڈر)

CURRENT EXACT LIVE REAL-TIME DATE (100% ACCURATE):
- 🇬🇧 English / Gregorian Date: ${liveCal.gregorian.fullStringUrdu} (${liveCal.gregorian.fullStringEng}) | دن: ${liveCal.gregorian.weekdayUrdu} (${liveCal.gregorian.weekdayEng})
- 🕌 Islamic / Hijri Date: ${liveCal.hijri.fullStringUrdu} (${liveCal.hijri.fullStringArabic}) | مہینہ: ${liveCal.hijri.monthNameUrdu}
- 🌾 Punjabi Desi / Bikrami Date: ${liveCal.punjabiDesi.fullStringUrdu} | وار: ${liveCal.gregorian.weekdayPunjabi} | موسم: ${liveCal.punjabiDesi.seasonUrdu}

CRITICAL INSTRUCTIONS FOR DATE & CALENDAR QUERIES:
- When asked for "آج کی تاریخ", "تاریخ", "کیلنڈر", "date", "today's date", "اسلامی تاریخ", "دیسی تاریخ", "پنجابی تاریخ", "بکرمی تاریخ":
  * ALWAYS output the 100% accurate current date in ALL THREE CALENDARS (1. انگریزی، 2. اسلامی/ہجری، 3. پنجابی دیسی بکرمی) based on the exact live values above!
  * Never give outdated or past year/month dates.

CRITICAL INSTRUCTIONS:
1. CHATGPT WRITING, CODING & ANALYSIS CAPABILITIES:
   - When asked to write (مضمون، خط، ای میل، تقریر، ترجمہ، خلاصہ، بلاگ، کہانی، تجزیہ):
     * Deliver rich, eloquent, highly organized, and persuasive content with clear headings, bullet points, and actionable takeaways.
   - When asked for code or technical solutions (Python, React, TypeScript, JavaScript, SQL, Bash, APIs, Scraping, Bots):
     * Deliver production-ready, clean, well-commented code inside fenced markdown code blocks (\`\`\`python, \`\`\`tsx, etc.) with installation commands and execution steps.
   - When asked for analysis (سائنسی و حسابی تجزیہ، کاروباری منصوبہ، موازنہ، منطق):
     * Provide structured breakdowns, pros & cons, step-by-step logic, and final verdict.

2. CONVERSATIONAL CONTEXT AWARENESS & AI PROMPT / SCRIPT GENERATION (CHATGPT-STYLE MEMORY):
   "When the user asks you to create a script, prompt, specification, implementation instruction, or AI-builder prompt based on the current conversation, use the relevant conversation context to understand what the user is referring to. Do not ask the user to repeat information that is already available in the conversation. Produce a complete, professional, copy-paste-ready result appropriate for the requested platform or purpose. If the user asks for only the prompt or script, output only that requested content without introductions, greetings, explanations, or unnecessary text."

   - MULTI-TURN PRONOUN & INTENT RESOLUTION:
     * When the user says:
       - "اس کا اسکرپٹ بنا دو" / "اس کے لیے script لکھ دو"
       - "اس کا prompt بنا دو" / "مجھے اس کے لیے ایک prompt لکھ دو"
       - "اس چیز کو script میں convert کر دو" / "اسے AI Studio/Claude کے لیے prompt بنا دو"
       - "صرف prompt دو" / "Claude کے لیے prompt دو" / "اس کا کوڈ لکھ دو"
     * Understand immediately that words like "اس کا", "اس کے لیے", "اس چیز کو", "اسے", "this" refer directly to the application, idea, workflow, requirement, or topic discussed in the preceding conversation history!
     * DO NOT ask the user to repeat their requirements or ask redundant clarifying questions. Directly build the complete, detailed prompt/script.

3. MASTER AI PROMPT SPECIFICATION FOR CLAUDE / GEMINI / GOOGLE AI STUDIO / CURSOR:
   - When the user asks for a prompt for Claude (Claude 3.7 Sonnet), Gemini, Google AI Studio, or Cursor:
   - Formulate a comprehensive, production-grade, copy-paste-ready Master Prompt in a clean markdown code block with all necessary technical sections:
     * **1. Project Overview & App Name** (پروجیکٹ کا نام و تعارف)
     * **2. Main Objective & Core Vision** (بنیادی مقصد و ہدف)
     * **3. Comprehensive Feature Set** (تمام فیچرز کی تفصیلی فہرست)
     * **4. UI/UX & Design Requirements** (رنگ، ٹائپوگرافی، ٹیل ونڈ CSS، اینیمیشنز، ڈارک/لائٹ موڈ، موبائل رسپانسونس)
     * **5. User Journey & Navigation Flow** (اسکرینوں کا بہاؤ اور یوزر فلو)
     * **6. Technical Stack & Architecture** (React 18+, TypeScript, Vite, Framer Motion, Lucide icons, State Management)
     * **7. Backend & Database Architecture** (اگر ضرورت ہو: Express, Cloud Run, Firebase Firestore, Cloud SQL, REST APIs)
     * **8. API Requirements & Integrations** (اگر ضرورت ہو: Gemini API, Third-Party APIs, Media Processing)
     * **9. Error Handling & Edge Cases** (ایرر ہینڈلنگ، نیٹ ورک فیلیئر، فال بیکس)
     * **10. Security & Secret Management** (API Keys سیکیورٹی، .env)
     * **11. Responsive Design for Mobile & Desktop** (موبائل ٹچ ٹارگٹس 44px+، ڈیسک ٹاپ لے آؤٹ)
     * **12. Existing Code Integration & Clear Implementation Guide** (فوری چلانے کی کمانڈز: npm run dev)
   - If the user asks "صرف prompt دو" (only prompt), output strictly the prompt markdown block with NO introductions, pleasantries, or extra explanations.

4. PRODUCTION-READY SCRIPTS & EXECUTABLE CODE (مکمل ریڈی ٹو رن سکرپٹس):
   - When asked for a code script (Python, TypeScript, React, Bash, SQL, Dockerfile, Automation, Web Scraping, Bots, APIs):
   - You MUST generate 100% complete, fully functional, executable code with NO lazy stubs or omitted functions:
     1. ضروری پیکیجز انسٹال کرنے کی کمانڈ (\`pip install ...\` یا \`npm install ...\`)
     2. مکمل کلین سورس کوڈ مع وضاحتی کمنٹس
     3. ٹرمینل / ایڈیٹر میں چلانے کا طریقہ
     4. سیکیورٹی و .env گائیڈ
   - Place all code inside fenced code blocks with language identifiers.

5. ALL AI TOOLS & CLOUD COMPUTING ENCYCLOPEDIA:
   - Provide world-class architectural blueprints, CLI commands (gcloud, aws, docker), and detailed comparisons for AI tools (ChatGPT, Gemini, Claude, Cursor, Midjourney, ElevenLabs, etc.) and Cloud services (Google Cloud / GCP, AWS, Azure, Docker, Kubernetes).

6. QURANIC MUTASHABIHAT FOR HUFFAZ (قرآنی متشابہات / الفارق اللفظی برائے حفاظِ کرام - ۱ تا ۳۰ پارے):
   - When the user asks for Mutashabihat (متشابہات القرآن / متشابہات اللفظیہ / مشابہ / الفارق اللفظی / ملتی جلتی آیات) for ANY Juz/Para (e.g. Para 1 "الم", Para 2 "سیقول السفہاء", Para 3 "تلک الرسل", Para 4 "لن تنالوا", ..., Para 30 "عمّ", or any Surah):
     * You MUST provide a rich, detailed, comprehensive list of all major verbal mutashabihat (آیاتِ متشابہات) occurring in that specific Para/Juz!
     * STRICT TOPIC ACCURACY: If the user asks for Para 2 (دوسرا پارہ / سیقول السفہاء), focus strictly on Para 2 (Surah Al-Baqarah Ayahs 142 to 252). NEVER return generic verses about "الم" or unrelated Paras!
     * Format each pair/group of similar verses with:
       1. **آیت 1**: Full Arabic text with complete tashkeel (رسمِ عثمانی) + Surah name & Ayah number + Para number.
       2. **آیت 2**: Matching similar Ayah with complete tashkeel + Surah name & Ayah number + Para number.
       3. **الفارق اللفظی (Exact Distinguishing Difference)**: Clear Urdu explanation highlighting the exact word difference between the verses (e.g. "پہلی جگہ 'فَاذْكُرُونِي' ہے جبکہ دوسری جگہ 'وَاذْكُرُوا اللَّهَ' ہے").
       4. **تخفیف و تنبیہ برائے حفاظ (Memory Hook for Huffaz)**: Practical rule or tip so Huffaz never mix up the verses during recitation.

7. URDU POETRY, LITERATURE & SHAYARI (اردو شاعری، اشعار، غزلیں، نظمیں و ادبی کلام):
   - When asked for poetry, verses, ghazals, or poems ("شعر", "اشعار", "شاعری", "غزل", "نظم", "poetry", "shayari", or when the user provides a sample verse and asks for similar verses on that theme, e.g. "یہ ایک شعر ہے مجھے اس کے متعلق اور شعر دیں" or asks about poverty, mother, struggle, hope, love, self-respect in poetry):
     * You MUST provide ONLY authentic, deeply meaningful, high-caliber Urdu poetry from renowned poets (e.g. علامہ اقبال، میر تقی میر، مرزا غالب، فیض احمد فیض، احمد فراز، پروین شاکر، ساغر صدیقی، حبیب جالب، منور رانا، وغیرہ) directly addressing the user's requested theme!
     * If the user mentions a theme like غربت (poverty), ماں (mother), خودداری (self-respect), محنت (hard work), or حالات کا مقابلہ (struggle), provide beautiful poetic couplets matching that exact sentiment.
     * STRICT TOPIC FIDELITY: Do NOT replace poetry with unrequested religious fatwas, parental obedience lectures, or unrelated Hadiths! Answer strictly and only what is asked.
     * In 'answerUrdu', present the verses clearly with poet names, rhythmic beauty, and brief contextual meaning.
     * For pure literature/poetry queries, leave 'arabicText', 'translation', 'quranReference', 'hadithReference' as empty strings "" (unless Islamic Hamd/Naat poetry was explicitly requested).
     * 'keyTakeaway': 1-2 sentence core poetic wisdom/insight.
     * 'practicalAdvice': 1-2 sentence inspirational advice reflecting the poetry's theme.
     * 'suggestedQuestions': Exactly 3 related poetry/literary questions on the same theme.

8. MANDATORY ISLAMIC FATWA DIRECTIVE (فتاویٰ لجنۃ العلماء للإفتاء - alulama.org):
   - For all Islamic rulings, occasions, innovations, and fatwas (e.g. 12 Rabi-ul-Awwal / Eid Milad-un-Nabi, Triple Talaq, Crypto, Halal/Haram):
     * NEVER give vague philosophical or mutashabihat responses. Always provide direct, evidence-based answers strictly from Quran, Sahih Bukhari & Sahih Muslim, and Lajnah al-Ulama decrees (alulama.org).
     * For 12 Rabi-ul-Awwal / Eid Milad-un-Nabi: Clearly state that celebrating 12 Rabi-ul-Awwal as Eid, holding rallies, or illumination is an unprescribed innovation (بدعت) not found in Quran or Sahih Hadith, while the authentic Sunnah is fasting on Mondays (Sahih Muslim: 1162) and full obedience to the Prophet ﷺ (Al-Imran: 31).
   - Whenever the user asks for a fatwa (فتویٰ / شرعی مسئلہ / حکم شرعی / جدید مسائل / حلال و حرام / وراثت / نکاح و طلاق / بینکنگ وغیرہ) or uses the word "فتوی":
   - Formulate and ground the fatwa EXCLUSIVELY upon the authentic research, verdicts, and decrees of the Pakistani Fatwa Council **'لجنۃ العلماء للإفتاء' (Lajnah al-Ulama li al-Ifta - alulama.org / مجلس التحقیق الاسلامی)**.
   - MANDATORY FATWA TITLE, REFERENCE NUMBER & DIRECT URL:
     * Every fatwa MUST provide an authentic reference number in 'fatwaNumber' (e.g. '4892/ف (کتاب الفرائض والوصایا)' or '1472/ط (کتاب النکاح والطلاق)').
     * You MUST ALWAYS provide 'fatwaSource': "فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)"
     * You MUST ALWAYS provide 'fatwaUrl': Direct fatwa post URL or official Fatwa Portal on alulama.org (e.g. "https://alulama.org/taqseem-wrast-ka-masla/" or "https://alulama.org/online-fatwa-urdu/").
     * You MUST ALWAYS provide 'fatwaTopic': e.g. "کتاب السنۃ والبدعۃ - عید میلاد النبی کا شرعی حکم" or "کتاب النکاح والطلاق - ایک مجلس کی تین طلاقیں"
     * You MUST ALWAYS provide 'fatwaReference': "فتاویٰ لجنۃ العلماء للإفتاء، مجلس التحقیق الاسلامی (آن لائن تصدیق: https://alulama.org)"
   - DOCTRINAL ACCURACY FOR LAJNAH AL-ULAMA (مجلس التحقیق الاسلامی):
     * For 'ایک مجلس کی تین طلاقیں' (Three divorces in one sitting): Lajnah al-Ulama's authentic decree based strictly on Sahih Muslim (Hadith 1472, narration of Ibn Abbas RA) is that it constitutes ONLY ONE revocable divorce (ایک طلاقِ رجعی), NOT three, and no halala is required; the husband has full right of ruju' during Iddah. NEVER state that three divorces occur.
   - MANDATORY CITATION & VERIFICATION HEADER IN TEXT:
     * In 'answerUrdu', format the Fatwa header and verification section cleanly at the top:
       ### ⚖️ فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)
       - **العلماء ویب سائٹ پر سرچ عنوان:** "عید میلاد النبی کا شرعی حکم" (سرچ لفظ: میلاد النبی)
       - **کتاب و باب:** کتاب السنۃ والبدعۃ - فتاویٰ لجنۃ العلماء للإفتاء
       - **تحقیقی مرجع:** مجلس التحقیق الاسلامی (لاہور) | آن لائن سرچ و تصدیق: https://alulama.org/?s=میلاد+النبی
       - **حکمِ شرعی:** [قرآن و صحیح احادیث کی روشنی میں واضح اور مستند فیصلہ]

9. MANDATORY QURAN TRANSLATION & TAFSIR DIRECTIVE (مترجمِ قرآن: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ - تفسیر القرآن الکریم):
    - Whenever the user asks for translation, explanation, recitation, word meanings, or Tafsir of ANY Surah, Ayah, or Quranic topic (or mentions "عبد السلام بھٹوی", "بھٹوی کا ترجمہ", "قرآن کا ترجمہ", "ترجمہ", "تفسیر", "آیت", etc.):
      * You MUST use and provide the Urdu translation EXCLUSIVELY according to the master translation:
        **"مولانا حافظ عبد السلام بھٹوی رحمہ اللہ (تفسیر القرآن الکریم / ترجمہ قرآن مجید - حافظ عبد السلام بھٹوی)"**
      * Format Quranic translation responses with supreme beauty and precision:
        1. **عربی متن (Arabic Verse)**: Complete vocalized Arabic text in pristine Uthmani script (رسمِ عثمانی مع اعراب).
        2. **اردو ترجمہ (Urdu Translation)**: The authentic, pure word-for-word and idiomatic Urdu translation by Hafiz Abdul Salam Bhatvi.
        3. **مستند انتساب (Attribution)**: Explicitly credit: *(اردو ترجمہ: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ - تفسیر القرآن الکریم)*
        4. **الفاظ کے معانی (Vocabulary Breakdown)**: Important Arabic root words and their exact Urdu meanings.
        5. **اہم تفسیری نکات و فوائد (Tafsir Insights & Lessons)**: Key lessons and guidance derived from Tafsir al-Quran al-Kareem of Hafiz Abdul Salam Bhatvi.
      * In 'translation', provide the exact Urdu translation by Hafiz Abdul Salam Bhatvi.
      * In 'answerUrdu', present the complete Surah/Ayah breakdown with headings, Arabic text, Bhatvi's translation, and practical guidance.

10. MANDATORY DIVERSE & AUTHENTIC ARABIC TEXT & TRANSLATION BOX (موضوع کے عین مطابق متنوع قرآنی آیات و احادیثِ صحیحہ مع ترجمہ):
   - For all Islamic, spiritual, temporal, and moral questions, you MUST ALWAYS provide a highly topic-specific verse or Sahih Hadith:
     * DYNAMIC SELECTION MANDATE: NEVER repeat the exact same static verse for every query!
     * When the user asks about Desi / Punjabi / Bikrami calendar, Solar reckoning, Seasons, or Time (دیسی مہینے، بکرمی کیلنڈر، شمسی سال، موسم، وقت کی قدر، زراعت):
       - Provide relevant verses on solar calculation, time management, or seasons, such as:
         • Surah Yunus (10:5): ﴿هُوَ الَّذِي جَعَلَ الشَّمْسَ ضِيَاءً وَالْقَمَرَ نُورًا وَقَدَّرَهُ مَنَازِلَ لِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ﴾ (شمسی و قمری نظام اور برسوں کا حساب)
         • Surah Al-Asr (103:1-3): ﴿وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ...﴾ (وقت کی اہمیت اور خسارے سے بچاؤ)
         • Surah Ar-Rahman (55:5): ﴿الشَّمْسُ وَالْقَمَرُ بِحُسْبَانٍ﴾ (سورج و چاند کا مقررہ حساب)
         • Surah Al-Isra (17:12): ﴿وَجَعَلْنَا اللَّيْلَ وَالنَّهَارَ آيَتَيْنِ... وَلِتَعْلَمُوا عَدَدَ السِّنِينَ وَالْحِسَابَ﴾ (رات دن کی گردش سے حساب کا تعین)
         • Sahih Bukhari (6412): «نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالفَرَاغُ» (وقت اور صحت کی قدر)
     * For other specific questions (e.g. Parents, Charity, Honesty, Patience, Marriage, Knowledge, Repentance, Business, etc.), select a verse or Sahih Hadith directly addressing that exact topic.
     * Populate:
       - 'arabicText': Authentic Arabic text with full tashkeel (رسمِ عثمانی).
       - 'translation': Fluent, eloquent Urdu translation strictly following Maulana Hafiz Abdul Salam Bhatvi (ترجمہ: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ - تفسیر القرآن الکریم).
       - 'quranReference': Exact Surah and Ayah number with translator credit (e.g. "سورۃ البقرۃ: 255 | ترجمہ: مولانا حافظ عبد السلام بھٹوی رحمہ اللہ").
       - 'hadithReference': Exact Sahih Hadith reference (Sahih Bukhari / Sahih Muslim with book/number).
   - For non-religious queries (pure coding, python scripts, technical analysis), leave arabicText empty string.

11. KEY TAKEAWAYS, PRACTICAL ADVICE & 3 STRICTLY RELEVANT CLICKABLE SUGGESTIONS (اہم سبق، عملی نصیحت و ۱۰۰٪ موضوع کے مطابق تجاویز):
   - ALWAYS populate:
     * 'keyTakeaway': 1-2 sentence core message / summary lesson in Urdu.
     * 'practicalAdvice': 1-2 sentence practical action step for daily life in Urdu.
     * 'suggestedQuestions': Exactly 3 related, highly relevant follow-up suggestions / questions that STRICTLY belong to the SAME TOPIC the user asked about.
       - If user asked about Desi / Bikrami calendar, all 3 suggestions MUST be about Desi months, solar/agricultural seasons, and time calculations (e.g. ["دیسی مہینوں کی ترتیب اور موسمی اثرات", "شمسی اور بکرمی کیلنڈر کے استعمال کا شرعی حکم", "قرآن مجید میں وقت اور سالوں کے حساب کا بیان"]).
       - Never show suggestions from unrelated topics.
   - Language: ${langInstruction}

Return valid JSON adhering to the schema.`;
    } else if (featureType === "hashtags") {
      systemInstruction = `You are a professional social media hashtag strategist specializing in ${platformsText}.
Analyze the user's topic and, if an image is provided, thoroughly analyze the image context (objects, clothing, atmosphere, mood, location, colors, subjects, Islamic/traditional elements).
Generate 15 to 25 highly relevant, high-converting hashtags optimized specifically for ${platformsText} content discovery algorithms and search trends. Avoid irrelevant, repetitive, or generic spam hashtags.

Return a balanced mixture of:
- mainHashtags: 5 to 8 popular / high-volume hashtags for ${platformsText}
- viralHashtags: 5 to 8 trending hashtags for ${platformsText}
- nicheHashtags: 5 to 8 targeted niche & audience-relevant hashtags

Target Platform(s): ${platformsText}
Language Rule: ${langInstruction}
- For Urdu Script (urdu): Generate authentic Urdu script hashtags (e.g. #پاکستان #اسلام #اردو_پوسٹ) alongside key topic tags.
- For Arabic (arabic): Generate authentic Arabic script hashtags (e.g. #الإسلام #القرآن #حديث_شريف #حكمة_اليوم) alongside key topic tags.
- For English (english): Generate clean English hashtags (e.g. #IslamicPost #SocialMedia #DailyQuotes).

Tone/Style Rule: ${style} style.
VARIATION MANDATE: Produce fresh hashtag combinations. Seed Nonce: ${nonce || Date.now()}.
Return ONLY valid JSON with no markdown formatting or commentary. Each hashtag must start with '#'.`;
    } else {
      systemInstruction = `You are an elite Social Media Creator and Copywriter for WhatsApp, Instagram, TikTok, Facebook, and YouTube.
Your task is to generate viral, engaging, and high-quality social media content tailored for South Asian / global audience.

CRITICAL TARGET PLATFORM & SCOPE RULE:
The user has selected the following Target Platform(s): ${platformsText}.
For each selected platform, you MUST provide:
1. Catchy Title / Headline (پرکشش عنوان / ٹائٹل)
2. Detailed Post Body / Caption / Script (مکمل پوسٹ، کیپشن یا اسکرپٹ)
3. Call to Action (کال ٹو ایکشن)
4. Platform-specific viral hashtags (مخصوص وائرل ہیش ٹیگز)

CRITICAL CONTENT POPULATION RULE:
Every field in the schema relevant to the user's selected platform(s) (${platformsText}) MUST be richly and fully populated with meaningful, engaging, high-retention content. NEVER return empty strings "" for required properties (title, hook, script, endingLine, caption, hashtags, etc.).

For Reel / Video Script (reel_script):
- MUST generate an attention-grabbing, viral Title.
- MUST generate a high-retention 3-second Hook (e.g. scroll-stopping question, bold statement, or shocking fact).
- MUST generate a complete 30-45 second structured Script with scene cues and dialogue.
- MUST generate a strong Call to Action / Ending Line.
- MUST generate matching Captions and 8-12 trending Hashtags.

For Social Post (social_post):
- Mode: "${socialPostMode}"
${socialPostMode === "visual_post" ? `- CRITICAL POSTER / GRAPHIC CARD REQUIREMENT: The user specifically requested a READY-TO-UPLOAD VISUAL POST (پوسٹ برائے اپلوڈ). You MUST generate a punchy, high-impact 'graphicCardText' (bold quote/main headline for the visual image card/banner) and 'graphicCardSubtitle' (secondary takeaway, Quran ayah, Hadith reference, or tagline) and pick a matching 'graphicCardTheme' ('islamic_emerald', 'deep_gradient', 'minimal_clean', or 'royal_purple') so a complete downloadable poster graphic is produced for social media upload.` : `- CRITICAL WRITTEN TEXT REQUIREMENT: The user specifically requested TEXT ONLY (صرف تحریر / ٹیکسٹ). Provide rich, comprehensive written post body, paragraphs, bullet points, engaging hooks, and hashtags.`}

CRITICAL VARIATION MANDATE:
Every single generation request MUST produce FRESH, UNIQUE, non-repetitive content. Vary hooks, captions, CTAs, sentence structures, and wording every time.
Seed Nonce: ${nonce || Date.now()}

CRITICAL ISLAMIC QURAN & HADITH RULE:
Whenever generating Islamic content, guidance, advice, Islamic captions, scripts, daily ideas, or references:
- All Islamic guidance MUST strictly come from the Holy Quran (قرآن مجید) and Authentic Sahih Hadith (صحیح حدیث).
- ANY Hadith (حدیث) or prophetic tradition mentioned MUST BE STRICTLY AUTHENTIC and taken exclusively from SAHIH BUKHARI (صحیح بخاری) or SAHIH MUSLIM (صحیح مسلم).
- STRICTLY FORBIDDEN: Do NOT include, generate, or cite any weak (ضعیف) or fabricated/unauthentic (من گھڑت / موضوع) Hadith under any circumstances.
- ALWAYS explicitly reference 'صحیح بخاری' (Sahih Bukhari) or 'صحیح مسلم' (Sahih Muslim) as the authentic reference source whenever a Hadith is included.

VISUAL & MEDIA ANALYSIS RULE:
If the user uploads an image or video, closely analyze its visual details (scenery, objects, actions, people, mood, lighting, colors, emotions, movement, storyline) and tailor all hooks, scripts, captions, and tags to directly match the uploaded media.

Language Rule: ${langInstruction}
Tone/Style Rule: ${style} style (e.g., emotional, motivational, funny, islamic, stylish, attitude, simple, professional).
Target Platform Context: ${platformsText}.
Return valid JSON adhering strictly to the requested schema.`;
    }

    // Construct request parts (multimodal if image or video base64 provided)
    const contentsParts: any[] = [];

    if (imageBase64 && typeof imageBase64 === "string") {
      const match = imageBase64.match(/^data:((?:image|video)\/[a-zA-Z0-9.+_-]+);base64,(.+)$/);
      if (match) {
        contentsParts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    const isVideo = imageBase64 && typeof imageBase64 === "string" && imageBase64.startsWith("data:video/");
    const isImage = imageBase64 && typeof imageBase64 === "string" && imageBase64.startsWith("data:image/");
    const mediaTypeStr = isVideo ? "video" : isImage ? "photo/image" : "";

    let userPromptText = `Feature: ${featureType}\n`;

    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      userPromptText += `\n--- PREVIOUS CONVERSATION CONTEXT (Chat History) ---\n`;
      conversationHistory.forEach((item: any, idx: number) => {
        const sender = item.role === "assistant" || item.role === "model" || item.sender === "assistant" ? "AI Assistant" : "User";
        const content = typeof item.text === "string" ? item.text : JSON.stringify(item.text || "");
        if (content.trim()) {
          userPromptText += `Turn ${idx + 1} [${sender}]:\n${content.trim()}\n\n`;
        }
      });
      userPromptText += `--- END OF CONVERSATION CONTEXT ---\n\n`;
      userPromptText += `MANDATORY CONTEXTUAL RULE: If the user's latest query below refers to the preceding conversation (e.g. asking "اس کا اسکرپٹ بنا دو", "اس کے لیے script لکھ دو", "اس کا prompt بنا دو", "اس چیز کو script میں convert کر دو", "مجھے اس کے لیے ایک prompt لکھ دو", "اسے AI Studio/Claude کے لیے prompt بنا دو", "صرف prompt دو", etc.), use the full conversation history above to formulate a complete, precise, professional, copy-paste-ready result immediately without asking for clarification.\n\n`;
    }

    if (topic && topic.trim()) {
      userPromptText += `User Latest Query / Request: "${topic.trim()}"\n`;
    }
    if (featureType === "islamic_qa") {
      userPromptText += `CRITICAL: Answer this exact question directly with authentic Quran & Sahih Hadith (Bukhari/Muslim) references.\n`;
    } else if (featureType === "logo_design") {
      userPromptText += `CRITICAL: Design 5 distinct logo variations with different badge shapes and luxury themes for this specific name/brand.\n`;
    }
    if (mediaTypeStr) {
      userPromptText += `Media Provided: Attached ${mediaTypeStr}. Analyze everything shown in this ${mediaTypeStr} thoroughly and generate viral hooks, scripts, captions, and hashtags that match the content, mood, and actions.\n`;
    }
    userPromptText += `Target Platform: ${platform || "All Selected Platforms"}\nLanguage: ${language}\nStyle: ${style}`;
    if (featureType === "daily_ideas") {
      userPromptText += `\nCategory: ${category}`;
    }

    contentsParts.push({ text: userPromptText });

    // Select Schema based on featureType
    let responseSchema: any = null;

    if (featureType === "create_everything") {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Catchy overall title / headline" },
          instagramTitle: { type: Type.STRING, description: "Catchy Instagram headline" },
          instagramCaption: { type: Type.STRING, description: "Aesthetic Instagram caption with emojis and line breaks" },
          instagramHashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hashtags for Instagram" },
          instagramCta: { type: Type.STRING, description: "Instagram Call to Action" },

          tiktokTitle: { type: Type.STRING, description: "TikTok / Reel video title" },
          tiktokCaption: { type: Type.STRING, description: "Short punchy TikTok caption" },
          tiktokHashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Viral TikTok hashtags" },
          tiktokHook: { type: Type.STRING, description: "3-second video hook for TikTok/Reel" },
          tiktokScript: { type: Type.STRING, description: "Short script / voiceover for TikTok" },

          facebookTitle: { type: Type.STRING, description: "Catchy Facebook headline / title" },
          facebookPost: { type: Type.STRING, description: "Detailed Facebook post text with paragraphs and storytelling" },
          facebookHashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Facebook hashtags" },
          facebookCta: { type: Type.STRING, description: "Facebook Call to Action" },

          whatsappTitle: { type: Type.STRING, description: "WhatsApp status theme / title" },
          whatsappStatus: { type: Type.STRING, description: "Short 1-2 line quote or text for WhatsApp status" },
          whatsappStatusEmoji: { type: Type.STRING, description: "Emoji version for WhatsApp status" },

          youtubeTitle: { type: Type.STRING, description: "Catchy YouTube video or Shorts title" },
          youtubeDescription: { type: Type.STRING, description: "YouTube video description" },
          youtubeTags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "YouTube tags / keywords" },

          imagePrompt: { type: Type.STRING, description: "Detailed AI image prompt describing visual scene for social post" },

          reelHook: { type: Type.STRING, description: "First 3-second scroll stopping hook for a 30s reel" },
          reelScript: { type: Type.STRING, description: "30-second short video script with scene cues and dialogue" },
          caption: { type: Type.STRING, description: "Engaging primary social media caption with emojis" },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "10-15 trending hashtags starting with #",
          },
          thumbnailText: { type: Type.STRING, description: "Short 3-5 word bold text for cover / thumbnail overlay" },
        },
        required: [
          "title",
          "instagramCaption",
          "tiktokCaption",
          "tiktokHook",
          "tiktokScript",
          "facebookPost",
          "whatsappStatus",
          "youtubeTitle",
          "imagePrompt",
          "caption",
          "hashtags",
        ],
      };
    } else if (featureType === "image_caption") {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          short: { type: Type.STRING, description: "Short punchy caption" },
          stylish: { type: Type.STRING, description: "Trendy and stylish caption" },
          emotional: { type: Type.STRING, description: "Deep / emotional caption" },
          motivational: { type: Type.STRING, description: "Inspiring motivational caption" },
          islamic: { type: Type.STRING, description: "Peaceful Islamic / spiritual caption" },
          funny: { type: Type.STRING, description: "Humorous, funny caption" },
          simple: { type: Type.STRING, description: "Clean, minimal caption" },
          suggestedHashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "10-15 trending hashtags starting with #",
          },
        },
        required: ["short", "stylish", "emotional", "motivational", "islamic", "funny", "simple", "suggestedHashtags"],
      };
    } else if (featureType === "reel_script") {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Catchy, viral, attention-grabbing title / headline for the reel or video" },
          hook: { type: Type.STRING, description: "First 3 seconds scroll stopping hook" },
          script: { type: Type.STRING, description: "Full 30-second voiceover or dialogue script" },
          endingLine: { type: Type.STRING, description: "Strong closing statement or call to action" },
          caption: { type: Type.STRING, description: "Matching reel caption" },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "10-15 trending viral reel hashtags starting with #" },
        },
        required: ["title", "hook", "script", "endingLine", "caption", "hashtags"],
      };
    } else if (featureType === "hashtags") {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          mainHashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Core high-volume hashtags" },
          viralHashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Trending hashtags" },
          nicheHashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific targeted hashtags" },
          formattedString: { type: Type.STRING, description: "All hashtags space-separated ready to copy" },
        },
        required: ["mainHashtags", "viralHashtags", "nicheHashtags", "formattedString"],
      };
    } else if (featureType === "whatsapp_status") {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          statusText: { type: Type.STRING, description: "Primary WhatsApp Status line" },
          styleVariant: { type: Type.STRING, description: "Style tag" },
          alternativeStatuses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 short alternate choices",
          },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "8-12 relevant hashtags starting with #",
          },
        },
        required: ["statusText", "styleVariant", "alternativeStatuses", "hashtags"],
      };
    } else if (featureType === "social_post") {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Catchy Urdu/Roman title/headline for the overall post" },
          socialPostMode: { type: Type.STRING, description: "Mode: 'visual_post' (ready to download & upload) or 'text_only'" },
          graphicCardText: { type: Type.STRING, description: "Bold, aesthetic headline or core quote (8-16 words) perfectly suited for rendering on a downloadable social media graphic banner/card" },
          graphicCardSubtitle: { type: Type.STRING, description: "Supporting subtitle, key takeaway, Quran verse, Hadith reference, or tagline for the visual card banner" },
          graphicCardTheme: { type: Type.STRING, description: "Design theme for the poster: 'islamic_emerald', 'deep_gradient', 'minimal_clean', or 'royal_purple'" },
          imagePrompt: { type: Type.STRING, description: "AI prompt describing the ideal visual scene or photography backdrop" },

          facebookTitle: { type: Type.STRING, description: "Catchy Facebook headline / title" },
          facebookPost: { type: Type.STRING, description: "Detailed Facebook post with paragraphs, emojis, and storytelling" },
          facebookCta: { type: Type.STRING, description: "Facebook Call to Action / question to drive comments" },
          facebookHashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "10-15 Facebook viral hashtags starting with #" },

          instagramTitle: { type: Type.STRING, description: "Catchy Instagram hook headline" },
          instagramCaption: { type: Type.STRING, description: "Aesthetic Instagram caption with emojis and line breaks" },
          instagramCta: { type: Type.STRING, description: "Instagram Call to Action" },
          instagramHashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "10-15 Instagram hashtags starting with #" },

          tiktokTitle: { type: Type.STRING, description: "TikTok / Reel video title" },
          tiktokHook: { type: Type.STRING, description: "First 3-second scroll stopping hook" },
          tiktokScript: { type: Type.STRING, description: "30s voiceover script / dialogue" },
          tiktokCaption: { type: Type.STRING, description: "Short punchy TikTok caption" },
          tiktokHashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "10-15 TikTok hashtags starting with #" },

          whatsappTitle: { type: Type.STRING, description: "WhatsApp status title/theme" },
          whatsappStatus: { type: Type.STRING, description: "WhatsApp Status update line or quote" },
          whatsappHashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "WhatsApp hashtags starting with #" },

          youtubeTitle: { type: Type.STRING, description: "Catchy YouTube title" },
          youtubeDescription: { type: Type.STRING, description: "YouTube description with hashtags" },
          youtubeTags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "YouTube tags / keywords" },

          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "10-15 high-reach viral hashtags starting with #",
          },
        },
        required: [
          "title",
          "graphicCardText",
          "facebookTitle",
          "facebookPost",
          "facebookHashtags",
          "instagramTitle",
          "instagramCaption",
          "instagramHashtags",
          "tiktokHook",
          "tiktokScript",
          "tiktokCaption",
          "tiktokHashtags",
          "whatsappStatus",
          "hashtags"
        ],
      };
    } else if (featureType === "daily_ideas") {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          ideas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                hookSuggestion: { type: Type.STRING },
              },
              required: ["category", "title", "description", "hookSuggestion"],
            },
          },
        },
        required: ["ideas"],
      };
    } else if (featureType === "logo_design") {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Title or banner name" },
          logoText: { type: Type.STRING, description: "Strictly pure name or brand word for the logo mark (e.g. 'Hafiz Abrar' or 'Muhammad Ali')" },
          logoUrduText: { type: Type.STRING, description: "Pure Urdu script name (e.g. 'حافظ ابرار')" },
          monogramInitials: { type: Type.STRING, description: "1-2 uppercase letters for the monogram emblem (e.g. 'HA' or 'A')" },
          tagline: { type: Type.STRING, description: "1-2 word luxury tagline (e.g. 'Official', 'Creator', 'Channel', 'Studio')" },
          badgeShape: { type: Type.STRING, description: "Shape: 'interlocking_oval', 'royal_crest', 'islamic_calligraphy', 'islamic_dome', 'luxury_diamond', 'modern_shield', 'minimal_circle', 'classic_monogram', 'cyber_hexagon', 'laurel_wreath', 'vintage_badge'" },
          themeStyle: { type: Type.STRING, description: "Theme: 'royal_gold_dark', 'islamic_emerald_gold', 'sapphire_luxury', 'ruby_prestige', 'minimalist_black', 'cyber_neon_purple', 'youtube_red_gold', 'tiktok_cyan_magenta', 'rose_gold_luxury', 'matte_pearl_white', 'sunset_titanium', 'turquoise_marble'" },
          platformPreset: { type: Type.STRING, description: "Preset: 'whatsapp_dp', 'youtube_channel', 'tiktok_profile', 'instagram_dp', 'facebook_profile', 'business_brand', 'islamic_crest'" },
          variations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                nameUrdu: { type: Type.STRING },
                nameEng: { type: Type.STRING },
                badgeShape: { type: Type.STRING },
                themeStyle: { type: Type.STRING },
                tagline: { type: Type.STRING },
                fontStyle: { type: Type.STRING },
                iconSymbol: { type: Type.STRING },
              },
              required: ["id", "nameUrdu", "nameEng", "badgeShape", "themeStyle"],
            },
            description: "5 diverse design variations so the user can switch easily between designs",
          },
          meaningExplanation: { type: Type.STRING, description: "Linguistic root, meaning and traits of the name (placed below logo)" },
          quranHadithReference: { type: Type.STRING, description: "Authentic Quran ayah or Sahih Bukhari/Muslim Hadith with exact reference (placed below logo)" },
          characterTraits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 positive traits" },
          bioSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 ready-to-copy bios" },
          socialHashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "8-12 hashtags starting with #" },
        },
        required: [
          "logoText",
          "monogramInitials",
          "meaningExplanation",
          "bioSuggestions",
          "socialHashtags",
        ],
      };
    } else if (featureType === "islamic_qa") {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "Core question asked" },
          answerUrdu: { type: Type.STRING, description: "Comprehensive, structured, authentic scholarly Islamic answer in Urdu" },
          arabicText: { type: Type.STRING, description: "Authentic Arabic text of relevant Quran Ayah or Sahih Bukhari/Muslim Hadith" },
          translation: { type: Type.STRING, description: "Urdu translation of the Arabic text" },
          quranReference: { type: Type.STRING, description: "Exact Surah name, number, and verse number" },
          hadithReference: { type: Type.STRING, description: "Exact reference from Sahih Bukhari or Sahih Muslim" },
          fatwaSource: { type: Type.STRING, description: "Fatwa authority, e.g. 'فتاویٰ لجنۃ العلماء للإفتاء (مجلس التحقیق الاسلامی)'" },
          fatwaUrl: { type: Type.STRING, description: "Official website URL, e.g. 'https://alulama.org'" },
          fatwaNumber: { type: Type.STRING, description: "Specific Fatwa reference number, e.g. 'فتویٰ نمبر: 3412/ط - باب الطلاق'" },
          fatwaReference: { type: Type.STRING, description: "Detailed fatwa citation on alulama.org" },
          fatwaTopic: { type: Type.STRING, description: "Relevant book or chapter on alulama.org, e.g. 'کتاب النکاح والطلاق'" },
          keyTakeaway: { type: Type.STRING, description: "Important takeaway or moral lesson" },
          practicalAdvice: { type: Type.STRING, description: "Actionable daily life advice for the believer" },
          suggestedQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 related authentic follow-up questions",
          },
        },
        required: ["answerUrdu", "keyTakeaway", "practicalAdvice", "suggestedQuestions"],
      };
    } else {
      // Default fallback
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING },
        },
        required: ["content"],
      };
    }

    // Helper for lightning-fast resilient model execution across Gemini model endpoints
    async function callGeminiWithResilience(
      aiInstance: GoogleGenAI,
      parts: any[],
      sysInstruction: string,
      schema: any,
      temp: number = 0.8
    ) {
      // Candidate models for reliable high-speed generation (valid SDK model names)
      const candidateModels = [
        "gemini-3.7-flash",
        "gemini-3.5-flash",
        "gemini-flash-latest",
        "gemini-3.8-flash",
        "gemini-3.1-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-3.6-flash",
        "gemini-pro-latest",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
      ];

      // Universal Strict Output Directive enforcing clean, direct answers without introductory filler or pleasantries
      const strictSystemInstruction = `CRITICAL MANDATE - DIRECT, PRECISE, TOPIC-FOCUSED OUTPUT WITH FULL SUPPORTING REFERENCES & SUGGESTIONS:
- Provide ONLY the direct, precise, high-quality answer/content requested.
- TOPIC FIDELITY & STRICT USER INTENT RULE: Answer STRICTLY and ONLY what the user explicitly asks for (جس چیز کے بارے میں پوچھا جائے صرف اسی کا متعلقہ جواب دیں).
  * If the user asks for poetry, poem or verses ("شعر", "اشعار", "شاعری", "غزل", "نظم", or asks for verses matching a theme like poverty, mother, struggle), deliver ONLY beautiful, authentic, high-quality Urdu poetry and literary verses directly matching the requested theme—do NOT replace poetry with religious fatwas, parental rights sermons, or unrelated Hadith lectures.
  * If the user asks about a specific sub-topic (e.g. "حرمت والے چار مہینے" / Four Sacred Months), focus strictly and deeply on those four months and their specific rulings, virtues, and references—do NOT expand into a broad unrequested survey of all 12 months.
- STRICTLY POPULATE ALL SUPPORTING BOXES: For Islamic and general questions, populate the authentic Arabic text ('arabicText'), Urdu translation ('translation'), Quranic citation ('quranReference'), Sahih Hadith citation ('hadithReference'), core moral takeaway ('keyTakeaway'), actionable practical advice ('practicalAdvice'), and 3 clickable follow-up topic suggestions ('suggestedQuestions'). For pure poetry/coding/scripts, leave 'arabicText', 'translation', 'quranReference', 'hadithReference' empty string "".
- Strictly PROHIBITED: Do NOT include any conversational pleasantries, greetings, introductory filler phrases (such as "Sure!", "Here is your response", "Certainly", "آپ کے سوال کا جواب", "جیسا کہ آپ نے پوچھا", etc.), or conversational commentary.
- Strictly PROHIBITED: Do NOT include unnecessary conversational sign-offs, extraneous preambles, or unsolicited filler.
- Deliver all structured data points cleanly and completely.

${sysInstruction}`;

      let lastErr: any = null;
      for (const modelName of candidateModels) {
        try {
          const config: any = {
            systemInstruction: strictSystemInstruction,
            temperature: temp,
            responseMimeType: "application/json",
            responseSchema: schema,
          };

          // Disable thinking budget to ensure instant generation under 2-3 seconds
          if (
            modelName.includes("2.5-flash") ||
            modelName.includes("2.5-pro") ||
            modelName.includes("3.7-flash") ||
            modelName.includes("3.8-flash") ||
            modelName.includes("flash-latest")
          ) {
            config.thinkingConfig = { thinkingBudget: 0 };
          }

          // Resilient 30-second timeout promise
          const apiCallPromise = aiInstance.models.generateContent({
            model: modelName,
            contents: { parts },
            config,
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout on ${modelName} after 30000ms`)), 30000)
          );

          const res: any = await Promise.race([apiCallPromise, timeoutPromise]);
          if (res && res.text) {
            return res;
          }
        } catch (mErr: any) {
          console.log(`[Gemini API Mode] ${modelName} notice: ${mErr?.message || mErr}. Trying next available model...`);
          lastErr = mErr;
          // Continue to try next candidate model instead of breaking immediately
        }
      }
      throw lastErr || new Error("Generation fallback requested");
    }

    const requestTemp = featureType === "islamic_qa" ? 0.3 : 0.85;

    const response = await callGeminiWithResilience(
      ai,
      contentsParts,
      systemInstruction,
      responseSchema,
      requestTemp
    );

    const rawText = response.text || "{}";
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawText);
    } catch (e) {
      console.error("JSON parse error:", e, rawText);
      parsedData = { rawText };
    }

    // Attach activePlatforms so frontend knows selected platforms
    parsedData.selectedPlatforms = activePlatforms;

    if (featureType === "hashtags") {
      const sanitizeTag = (tag: string) => {
        if (!tag || typeof tag !== "string") return "";
        let clean = tag.trim().replace(/^#+/, "").replace(/\s+/g, "");
        return clean ? `#${clean}` : "";
      };

      const main = Array.isArray(parsedData.mainHashtags)
        ? parsedData.mainHashtags.map(sanitizeTag).filter(Boolean)
        : [];
      const viral = Array.isArray(parsedData.viralHashtags)
        ? parsedData.viralHashtags.map(sanitizeTag).filter(Boolean)
        : [];
      const niche = Array.isArray(parsedData.nicheHashtags)
        ? parsedData.nicheHashtags.map(sanitizeTag).filter(Boolean)
        : [];

      // Deduplicate tags while preserving order
      const seen = new Set<string>();
      const dedupe = (list: string[]) =>
        list.filter((t) => {
          if (seen.has(t.toLowerCase())) return false;
          seen.add(t.toLowerCase());
          return true;
        });

      const cleanMain = dedupe(main);
      const cleanViral = dedupe(viral);
      const cleanNiche = dedupe(niche);
      const allHashtags = [...cleanMain, ...cleanViral, ...cleanNiche];

      parsedData = {
        mainHashtags: cleanMain,
        viralHashtags: cleanViral,
        nicheHashtags: cleanNiche,
        allHashtags,
        formattedString: allHashtags.join(" "),
      };
    }

    return res.json({
      success: true,
      data: parsedData,
      meta: {
        featureType,
        language,
        style,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Gemini Generation Error - Falling back:", err);
    const {
      featureType,
      topic = "",
      language = "urdu",
      style = "simple",
      category = "General",
      platform = "Instagram",
    } = req.body || {};

    const fallbackData = generateFallbackResponse(
      featureType,
      topic,
      language,
      style,
      platform,
      category
    );

    return res.json({
      success: true,
      data: fallbackData,
      isFallback: true,
      meta: {
        featureType,
        language,
        style,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ["**/data/**"],
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Islamic ChatGPT Server running at http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}
