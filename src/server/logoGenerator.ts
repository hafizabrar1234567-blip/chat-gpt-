/**
 * 👑 LUXURY 3D ISLAMIC EMBLEM LOGO GENERATOR
 * Generates ultra-crisp, 100% legible, authentic 3D gold embossed Arabic/Urdu calligraphy medallions.
 * Solves the critical issue where generic AI image generators produce illegible squiggles.
 */

export function cleanLogoSubject(raw: string): string {
  if (!raw || typeof raw !== "string") return "اسلامی خطاطی و مونوگرام";

  let text = raw.trim();

  // Strip wrapping and inline quotation marks and brackets
  text = text.replace(/["'“”‘’«»()[\]]/g, " ").replace(/\s+/g, " ").trim();

  // Targeted pattern matching for Urdu and English/Roman Urdu logo queries
  const patterns: RegExp[] = [
    // 1. "میرا نام X ہے" / "میرا نام ہے X"
    /میرا\s*نام\s*(?:ہے\s*)?([^\n\r,،۔!؟]+?)(?:\s*ہے|\s*کا\s*لوگو|\s*لوگو|\s*بنا|\s*$)/i,

    // 2. "مجھے میرے نام X کا لوگو" / "میرے نام X کا لوگو"
    /(?:مجھے\s*)?(?:میرے|ہمارے|اپنے)\s*نام\s*(?:کا\s*)?([^\n\r,،۔!؟]+?)(?:\s*کا\s*(?:لوگو|مونوگرام|تصویر|ڈی\s*پی|ڈیزائن)|$|\s*(?:بنا|تیار|چاہیے|لکھ))/i,

    // 3. "لوگو بنائیں نام: X" / "نام: X" / "Name: X"
    /(?:نام|name|title)\s*[:：\-]\s*([^\n\r,،۔!؟]+)/i,

    // 4. "جس پر X لکھا ہو"
    /(?:جس\s*پر\s*|جس\s*میں\s*)(?:نام\s*)?([^\n\r,،۔!؟]+?)\s*(?:لکھا\s*ہو|لکھیں)/i,

    // 5. "X نام کا شاہکار لگژری لوگو" / "X کے نام کا لوگو"
    /([^\n\r,،۔!؟]+?)\s*(?:کے\s*نام\s*کا|کے\s*نام|کا\s*نام|نام\s*کا|نام\s*پر)\s*(?:لوگو|مونوگرام|تصویر|ڈی\s*پی|ڈیزائن|شاہکار|3d|لگژری)/i,

    // 6. "X کا لوگو بنا دیں" / "X کا لوگو"
    /([^\n\r,،۔!؟]+?)\s*کا\s*(?:شاہکار\s*)?(?:لگژری\s*)?(?:3d\s*)?(?:تھری\s*ڈی\s*)?(?:اسلامی\s*)?(?:لوگو|مونوگرام|تصویر|ڈیزائن)/i,

    // 7. "لوگو بنا کر دیں مجھے میرے نام X" / "لوگو بنا دیں ابرار" / "میرے نام کا لوگو بنا دیں ابرار"
    /(?:لوگو|مونوگرام|تصویر)\s*(?:بنا\s*دیں|بنا\s*کر\s*دیں|بنائیں|بناؤ|تیار\s*کریں|ڈیزائن\s*کریں)\s*(?:برائے\s*|نام\s*[:：\-]?\s*|جس\s*پر\s*لکھا\s*ہو\s*|مجھے\s*میرے\s*نام\s*|میرے\s*نام\s*کا\s*|میرے\s*نام\s*|میرا\s*نام\s*|کے\s*نام\s*کا\s*|کا\s*)?([^\n\r,،۔!؟]+)/i,

    // 8. "میرے نام کا لوگو ... [NAME]"
    /(?:میرے|ہمارے|اپنے)\s*نام\s*کا\s*(?:لوگو|مونوگرام|تصویر)[^\n\r,،۔!؟]*?\s+([^\n\r,،۔!؟\s]+)$/i,

    // 9. "make logo for X" / "logo for X" / "logo of X"
    /(?:logo|monogram|design)\s*(?:for|of)\s+([a-zA-Z\s]+)/i,

    // 10. Roman Urdu: "Abrar logo bana dein"
    /([a-zA-Z\s]+?)\s+(?:ka\s+)?(?:logo|monogram)/i,
  ];

  const isInvalidCandidate = (str: string): boolean => {
    if (!str) return true;
    const s = str.trim();
    if (s.length < 2) return true;
    const stopWords = /^(?:کا|کے|کی|کو|سے|میں|پر|اور|ایک|یہ|وہ|لوگو|تصویر|مونوگرام|ڈیزائن|نام|میرے\s*نام|ہمارے\s*نام|اپنے\s*نام|میرے|ہمارے|اپنے|میرا|میری|مجھے|ہمیں|بنا|بنائیں|بناؤ|دیں|کریں|چاہیے|چاہئیے|شاہکار|لگژری|logo|image|picture)$/i;
    return stopWords.test(s);
  };

  let candidate = "";
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m && m[1] && m[1].trim()) {
      const testVal = m[1].trim();
      if (!isInvalidCandidate(testVal)) {
        candidate = testVal;
        break;
      }
    }
  }

  // Fallback to text if no pattern matched
  if (!candidate) {
    candidate = text;
  }

  // Deep clean candidate to strip any remaining noise words
  candidate = candidate
    .replace(/^(?:براہ\s*مہربانی|برائے\s*مہربانی|مہربانی\s*فرما\s*کر|پلیز|please)\s*/gi, "")
    .replace(/(?:براہ\s*مہربانی|برائے\s*مہربانی|مہربانی\s*فرما\s*کر|پلیز|please)\s*$/gi, "")
    .replace(/(?:مجھے\s*)?(?:میرے|ہمارے|اپنے)\s*نام\s*(?:کا|پر)?\s*/gi, "")
    .replace(/^(?:مجھے|ہمیں|میرے\s*لیے|ہماری\s*لیے|میرا|میری)\s*/gi, "")
    .replace(/(?:میرا\s*نام\s*ہے|میرا\s*نام)\s*/gi, "")
    .replace(/(?:اس\s*طرح\s*کا\s*)?(?:ایک\s*)?(?:شاہکار\s*)?(?:لگژری\s*)?(?:تھری\s*ڈی\s*)?(?:3d\s*)?(?:اسلامی\s*)?(?:لوگو|تصویر|مونوگرام|ڈی\s*پی|نام\s*کا\s*ڈیزائن|نام\s*کی\s*خطاطی|خطاطی)\s*(?:بنا\s*دیں|بنا\s*کر\s*دیں|بنائیں|بناؤ|تیار\s*کریں|ڈیزائن\s*کریں|لکھ\s*کر\s*دیں|لکھیں|چاہیے|چاہئیے)\s*(?:جس\s*پر\s*لکھا\s*ہو)?/gi, "")
    .replace(/(?:بنا\s*دیں|بنا\s*کر\s*دیں|بنائیں|تیار\s*کریں|ڈیزائن\s*کریں|لکھ\s*کر\s*دیں|بناؤ)\s*$/gi, "")
    .replace(/^(?:بنا\s*دیں|بنا\s*کر\s*دیں|بنائیں|تیار\s*کریں|ڈیزائن\s*کریں|لکھ\s*کر\s*دیں)\s*/gi, "")
    .replace(/(?:شاہکار\s*)?(?:لگژری\s*)?(?:3d\s*)?(?:تھری\s*ڈی\s*)?(?:اسلامی\s*)?(?:لوگو|مونوگرام|تصویر)\s*$/gi, "")
    .replace(/\s*(?:کے\s*نام\s*کا|کے\s*نام|کا\s*نام|نام\s*کا|نام\s*پر|نام)\s*$/gi, "")
    .replace(/(?:کا\s*لوگو|کے\s*نام\s*کا|کے\s*نام|نام\s*کا|کا\s*مونوگرام|کی\s*خطاطی)\s*/gi, "")
    .replace(/\s*(?:چاہیے|چاہئیے)\s*$/gi, "")
    .replace(/\s*(?:کا|کے|کی)\s*$/gi, "")
    .replace(/^\s*(?:کا|کے|کی)\s*/gi, "")
    .replace(/^(?:نام|title|name)\s*[:：\-]?\s*/gi, "")
    .replace(/(?:جس\s*پر\s*لکھا\s*ہو|جس\s*میں|جس\s*کا\s*نام)\s*/gi, "")
    .replace(/^(?:ہے|اس\s*کا|ایک|یہ)\s*/gi, "")
    .replace(/\s*(?:ہے|اس\s*کا)\s*$/gi, "")
    .replace(/\b(?:logo|bana|dein|karen|chahiye|image|picture)\b/gi, "")
    .replace(/["'“”‘’«»()[\]]/g, "")
    .trim();

  // Final sanity check
  if (!candidate || candidate.length < 2) {
    candidate = "اسلامی خطاطی و مونوگرام";
  }

  return candidate;
}

export function generateIslamicEmblemSvg(rawName: string): string {
  const name = cleanLogoSubject(rawName || "سلمان");

  // Dynamic font sizing based on character count so long or short names fit with perfection
  let fontSize = 150;
  if (name.length <= 4) {
    fontSize = 170;
  } else if (name.length <= 8) {
    fontSize = 140;
  } else if (name.length <= 12) {
    fontSize = 115;
  } else {
    fontSize = 90;
  }

  // Pre-generate 48 radiant sunbeam rays for divine sacred backdrop
  const rays = Array.from({ length: 48 })
    .map((_, i) => {
      const angle = (i * 7.5 * Math.PI) / 180;
      const x2 = (512 + 475 * Math.cos(angle)).toFixed(1);
      const y2 = (512 + 475 * Math.sin(angle)).toFixed(1);
      return `<line x1="512" y1="512" x2="${x2}" y2="${y2}"/>`;
    })
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" dir="rtl">
  <defs>
    <!-- Deep Royal Emerald Velvet Radial -->
    <radialGradient id="emeraldBase" cx="50%" cy="50%" r="68%">
      <stop offset="0%" stop-color="#0a4630"/>
      <stop offset="35%" stop-color="#052c1e"/>
      <stop offset="70%" stop-color="#02170f"/>
      <stop offset="100%" stop-color="#000805"/>
    </radialGradient>

    <!-- Inner Medallion Gradient -->
    <radialGradient id="innerPlate" cx="45%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#0b3f2c"/>
      <stop offset="50%" stop-color="#042016"/>
      <stop offset="100%" stop-color="#010d08"/>
    </radialGradient>

    <!-- 24K Polished Metallic Gold Gradient (Multi-Stop Reflections) -->
    <linearGradient id="gold24k" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF8D6"/>
      <stop offset="15%" stop-color="#F9C650"/>
      <stop offset="30%" stop-color="#FFE888"/>
      <stop offset="50%" stop-color="#BD7E12"/>
      <stop offset="70%" stop-color="#FFDD68"/>
      <stop offset="85%" stop-color="#8E5404"/>
      <stop offset="100%" stop-color="#FFF2B8"/>
    </linearGradient>

    <linearGradient id="goldLight" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#FFFBEB"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <!-- 3D Bevel & Emboss Shadow Filter -->
    <filter id="gold3dFilter" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000000" flood-opacity="0.95"/>
      <feDropShadow dx="0" dy="-2" stdDeviation="2" flood-color="#FFFCE6" flood-opacity="0.65"/>
    </filter>

    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#FBBF24" flood-opacity="0.5"/>
    </filter>

    <filter id="text3dShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.95"/>
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000000" flood-opacity="0.75"/>
      <feDropShadow dx="0" dy="-1" stdDeviation="1.5" flood-color="#FFFDE0" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1024" height="1024" fill="url(#emeraldBase)"/>

  <!-- Radiant Golden Sacred Sunbeam Rays -->
  <g opacity="0.07" stroke="url(#gold24k)" stroke-width="1.8">
    ${rays}
  </g>

  <!-- Corner Islamic Arabesque Ornaments -->
  <g opacity="0.45" stroke="url(#gold24k)" stroke-width="2.5" fill="none">
    <!-- Top-Left Corner -->
    <path d="M 40 140 C 40 85 85 40 140 40 L 140 70 C 100 70 70 100 70 140 Z"/>
    <circle cx="95" cy="95" r="8" fill="url(#gold24k)"/>
    <!-- Top-Right Corner -->
    <path d="M 984 140 C 984 85 939 40 884 40 L 884 70 C 924 70 954 100 954 140 Z"/>
    <circle cx="929" cy="95" r="8" fill="url(#gold24k)"/>
    <!-- Bottom-Left Corner -->
    <path d="M 40 884 C 40 939 85 984 140 984 L 140 954 C 100 954 70 924 70 884 Z"/>
    <circle cx="95" cy="929" r="8" fill="url(#gold24k)"/>
    <!-- Bottom-Right Corner -->
    <path d="M 984 884 C 984 939 939 984 884 984 L 884 954 C 924 954 954 924 954 884 Z"/>
    <circle cx="929" cy="929" r="8" fill="url(#gold24k)"/>
  </g>

  <!-- Outer Concentric Borders -->
  <circle cx="512" cy="512" r="485" fill="none" stroke="url(#gold24k)" stroke-width="7" filter="url(#gold3dFilter)"/>
  <circle cx="512" cy="512" r="468" fill="none" stroke="url(#goldLight)" stroke-width="2" stroke-dasharray="8 6"/>
  <circle cx="512" cy="512" r="452" fill="none" stroke="url(#gold24k)" stroke-width="3"/>

  <!-- Islamic 8-Point Rub El Hizb Star Interlace -->
  <g transform="translate(512,512)" fill="none" stroke="url(#gold24k)" stroke-width="3" opacity="0.8" filter="url(#subtleGlow)">
    <rect x="-355" y="-355" width="710" height="710" rx="36"/>
    <rect x="-355" y="-355" width="710" height="710" rx="36" transform="rotate(45)"/>
  </g>

  <!-- Main Medallion Central Plate -->
  <circle cx="512" cy="512" r="335" fill="url(#innerPlate)" stroke="url(#gold24k)" stroke-width="6.5" filter="url(#gold3dFilter)"/>
  <circle cx="512" cy="512" r="312" fill="none" stroke="url(#goldLight)" stroke-width="1.8" stroke-dasharray="4 6" opacity="0.6"/>

  <!-- Decorative Top Islamic Inscription: Bismillah -->
  <text x="512" y="278" font-family="'Amiri Quran', 'Amiri', 'Scheherazade New', serif" font-size="30" fill="url(#goldLight)" text-anchor="middle" letter-spacing="4" filter="url(#subtleGlow)">
    ﷽
  </text>

  <!-- Top Golden Crescent & Crown Ornament -->
  <g transform="translate(512, 322)" fill="none" stroke="url(#gold24k)" stroke-width="2.5" filter="url(#subtleGlow)">
    <path d="M -110 -5 Q 0 15 110 -5"/>
    <circle cx="0" cy="9" r="5" fill="url(#gold24k)"/>
    <polygon points="0,-18 5,-8 15,-8 7,-2 10,8 0,2 -10,8 -7,-2 -15,-8 -5,-8" fill="url(#gold24k)"/>
  </g>

  <!-- 👑 MAIN USER NAME CALLIGRAPHY (Crystal Clear, Bold, Majestic 3D Gold) -->
  <text x="512" y="555" font-family="'Noto Nastaliq Urdu', 'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif" font-size="${fontSize}" font-weight="bold" fill="url(#gold24k)" text-anchor="middle" filter="url(#text3dShadow)">
    ${name}
  </text>

  <!-- Bottom Arch & Rosette Divider -->
  <g transform="translate(512, 622)" fill="none" stroke="url(#gold24k)" stroke-width="2.5" filter="url(#subtleGlow)">
    <path d="M -120 5 Q 0 -15 120 5"/>
    <circle cx="0" cy="-9" r="5" fill="url(#gold24k)"/>
    <polygon points="0,-15 4,-9 10,-9 5,-5 7,1 0,-3 -7,1 -5,-5 -10,-9 -4,-9" fill="url(#gold24k)"/>
  </g>

  <!-- Subtitle Ribbon Badge with Royal Golden Border -->
  <g transform="translate(512, 698)" filter="url(#gold3dFilter)">
    <rect x="-210" y="-24" width="420" height="48" rx="24" fill="#01130b" stroke="url(#gold24k)" stroke-width="2.5"/>
    <text x="0" y="8" font-family="'Noto Nastaliq Urdu', 'Amiri', sans-serif" font-size="22" font-weight="bold" fill="url(#goldLight)" text-anchor="middle">
      شاہکار خطاطی و مونوگرام
    </text>
  </g>

  <!-- Bottom Luxury Hallmark Stamp -->
  <text x="512" y="812" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="bold" fill="url(#gold24k)" text-anchor="middle" letter-spacing="5" opacity="0.85">
    24K GOLD 3D EMBOSSED • ISLAMIC EMBLEM
  </text>
</svg>`;
}
