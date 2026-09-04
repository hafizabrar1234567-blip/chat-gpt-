/**
 * Triple Calendar Converter Utility
 * Provides accurate Gregorian (انگریزی), Islamic Hijri (اسلامی/ہجری), and Punjabi Desi Bikrami (پنجابی دیسی بکرمی) calendar dates.
 */

export interface CalendarDateInfo {
  gregorian: {
    day: number;
    monthIndex: number; // 0-11
    monthNameUrdu: string;
    monthNameEng: string;
    year: number;
    weekdayUrdu: string;
    weekdayPunjabi: string;
    weekdayEng: string;
    fullStringUrdu: string;
    fullStringEng: string;
  };
  hijri: {
    day: number;
    monthIndex: number; // 1-12
    monthNameUrdu: string;
    monthNameArabic: string;
    year: number;
    fullStringUrdu: string;
    fullStringArabic: string;
  };
  punjabiDesi: {
    day: number;
    monthIndex: number; // 1-12
    monthNameUrdu: string;
    monthNameGurmukhi: string;
    bikramiYear: number;
    seasonUrdu: string;
    fullStringUrdu: string;
  };
}

// Urdu Gregorian Months
export const GREGORIAN_MONTHS_URDU = [
  "جنوری",
  "فروری",
  "مارچ",
  "اپریل",
  "مئی",
  "جون",
  "جولائی",
  "اگست",
  "ستمبر",
  "اکتوبر",
  "نومبر",
  "دسمبر",
];

// Weekdays in Urdu
export const WEEKDAYS_URDU = [
  "اتوار",
  "پیر",
  "منگل",
  "بدھ",
  "جمعرات",
  "جمعہ",
  "ہفتہ",
];

// Weekdays in Punjabi
export const WEEKDAYS_PUNJABI = [
  "ایتوار (اتوار)",
  "سوموار (پیر)",
  "منگل وار (منگل)",
  "بدھ وار (بدھ)",
  "ویروار (جمعرات)",
  "جمعہ (شکر وار)",
  "چھنچھروار (ہفتہ)",
];

// Islamic Hijri Months
export const HIJRI_MONTHS_URDU = [
  "محرم الحرام",
  "صفر المظفر",
  "ربیع الاول",
  "ربیع الثانی (ربیع الآخر)",
  "جمادی الاول",
  "جمادی الثانی (جمادی الآخر)",
  "رجب المرجب",
  "شعبان المعظم",
  "رمضان المبارک",
  "شوال المکرم",
  "ذوالقعدۃ الحرام",
  "ذوالحجۃ الحرام",
];

export const HIJRI_MONTHS_ARABIC = [
  "المحرّم",
  "صفر",
  "ربيع الأول",
  "ربيع الثاني",
  "جمادى الأولى",
  "جمادى الثانية",
  "رجب",
  "شعبان",
  "رمضان",
  "شوّال",
  "ذو القعدة",
  "ذو الحجة",
];

// Punjabi Desi Solar Months (Bikrami / Desi Calendar)
// Dates for start of months in Gregorian (typical non-leap year mapping):
// 1. Chet (چیت) starts ~14 March
// 2. Vaisakh (ویساکھ) starts ~14 April
// 3. Jeth (جیٹھ) starts ~15 May
// 4. Harh (ہاڑ) starts ~15 June
// 5. Sawan (ساون) starts ~16 July
// 6. Bhadon (بھادوں) starts ~16 August
// 7. Assu (اسو) starts ~16 September
// 8. Kattak (کاتک) starts ~16 October
// 9. Maghar (مگھر) starts ~15 November
// 10. Poh (پوہ) starts ~15 December
// 11. Magh (ماگھ) starts ~14 January
// 12. Phaggan (پھگن) starts ~13 February

export const PUNJABI_DESI_MONTHS = [
  { nameUrdu: "چیت", nameGurmukhi: "ਚੇਤ", season: "بہار (Spring)", startMonth: 2, startDay: 14, days: 31 }, // Mar 14 - Apr 13
  { nameUrdu: "ویساکھ", nameGurmukhi: "ਵੈਸਾਖ", season: "گرما / کٹائی (Harvest)", startMonth: 3, startDay: 14, days: 31 }, // Apr 14 - May 14
  { nameUrdu: "جیٹھ", nameGurmukhi: "ਜੇਠ", season: "شدید گرمی (Summer)", startMonth: 4, startDay: 15, days: 31 }, // May 15 - Jun 14
  { nameUrdu: "ہاڑ (ہاڑھ)", nameGurmukhi: "ਹਾੜ", season: "شدید گرمی (Mid-Summer)", startMonth: 5, startDay: 15, days: 31 }, // Jun 15 - Jul 15
  { nameUrdu: "ساون", nameGurmukhi: "ਸਾਵਣ", season: "برسات (Monsoon)", startMonth: 6, startDay: 16, days: 31 }, // Jul 16 - Aug 15
  { nameUrdu: "بھادوں", nameGurmukhi: "ਭਾਦੋਂ", season: "برسات (Late Monsoon)", startMonth: 7, startDay: 16, days: 31 }, // Aug 16 - Sep 15
  { nameUrdu: "اسُو (اسوج)", nameGurmukhi: "ਅੱਸੂ", season: "خزاں (Autumn)", startMonth: 8, startDay: 16, days: 30 }, // Sep 16 - Oct 15
  { nameUrdu: "کاتک (کتک)", nameGurmukhi: "ਕੱਤਕ", season: "خزاں (Mid-Autumn)", startMonth: 9, startDay: 16, days: 30 }, // Oct 16 - Nov 14
  { nameUrdu: "مگھر", nameGurmukhi: "ਮੱਘਰ", season: "سردی (Early Winter)", startMonth: 10, startDay: 15, days: 30 }, // Nov 15 - Dec 14
  { nameUrdu: "پوہ", nameGurmukhi: "ਪੋਹ", season: "شدید سردی (Peak Winter)", startMonth: 11, startDay: 15, days: 30 }, // Dec 15 - Jan 13
  { nameUrdu: "ماگھ", nameGurmukhi: "ਮਾਘ", season: "سردی (Late Winter)", startMonth: 0, startDay: 14, days: 30 }, // Jan 14 - Feb 12
  { nameUrdu: "پھگن (پھگݨ)", nameGurmukhi: "ਫੱਗਣ", season: "بہار کی آمد (Late Winter/Pre-Spring)", startMonth: 1, startDay: 13, days: 30 }, // Feb 13 - Mar 13
];

/**
 * Calculates Hijri Date accurately using Intl Umm al-Qura API with fallback
 */
export function getHijriDate(date: Date = new Date()): { day: number; monthIndex: number; monthNameUrdu: string; monthNameArabic: string; year: number } {
  try {
    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

    const parts = formatter.formatToParts(date);
    let day = 1;
    let month = 1;
    let year = 1446;

    for (const part of parts) {
      if (part.type === "day") day = parseInt(part.value, 10);
      if (part.type === "month") month = parseInt(part.value, 10);
      if (part.type === "year") year = parseInt(part.value, 10);
    }

    const safeMonthIdx = Math.max(1, Math.min(12, month));
    return {
      day,
      monthIndex: safeMonthIdx,
      monthNameUrdu: HIJRI_MONTHS_URDU[safeMonthIdx - 1],
      monthNameArabic: HIJRI_MONTHS_ARABIC[safeMonthIdx - 1],
      year,
    };
  } catch (e) {
    // Standard mathematical astronomical approximation (Kuwaiti algorithm fallback)
    const epoch = 1948439.5;
    const jd = Math.floor(date.getTime() / 86400000) + 2440587.5;
    const l = Math.floor(jd - epoch) + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
    const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    const m = Math.floor((24 * l3) / 709);
    const d = l3 - Math.floor((709 * m) / 24);
    const y = 30 * n + j - 30;

    const safeM = Math.max(1, Math.min(12, m));
    return {
      day: Math.max(1, Math.min(30, d)),
      monthIndex: safeM,
      monthNameUrdu: HIJRI_MONTHS_URDU[safeM - 1],
      monthNameArabic: HIJRI_MONTHS_ARABIC[safeM - 1],
      year: y,
    };
  }
}

/**
 * Calculates Punjabi Desi (Bikrami Samvat) Date
 */
export function getPunjabiDesiDate(date: Date = new Date()): { day: number; monthIndex: number; monthNameUrdu: string; monthNameGurmukhi: string; bikramiYear: number; seasonUrdu: string } {
  const gMonth = date.getMonth(); // 0 to 11
  const gDay = date.getDate();
  const gYear = date.getFullYear();

  // Bikrami Year is +57 years (or +56 before Chet 1, i.e., mid March)
  let bikramiYear = gYear + 57;

  // Find corresponding Punjabi Desi month
  let desiMonthIndex = 0; // 0 = Chet, 1 = Vaisakh ... 11 = Phaggan
  let desiDay = 1;

  // Dates mapping
  // Chet (Mar 14 to Apr 13)
  if (gMonth === 2 && gDay >= 14) {
    desiMonthIndex = 0; // Chet
    desiDay = gDay - 14 + 1;
  } else if (gMonth === 3 && gDay < 14) {
    desiMonthIndex = 0; // Chet
    desiDay = 31 - 14 + 1 + gDay; // 18 + gDay
  }
  // Vaisakh (Apr 14 to May 14)
  else if (gMonth === 3 && gDay >= 14) {
    desiMonthIndex = 1; // Vaisakh
    desiDay = gDay - 14 + 1;
  } else if (gMonth === 4 && gDay < 15) {
    desiMonthIndex = 1; // Vaisakh
    desiDay = 30 - 14 + 1 + gDay;
  }
  // Jeth (May 15 to Jun 14)
  else if (gMonth === 4 && gDay >= 15) {
    desiMonthIndex = 2; // Jeth
    desiDay = gDay - 15 + 1;
  } else if (gMonth === 5 && gDay < 15) {
    desiMonthIndex = 2; // Jeth
    desiDay = 31 - 15 + 1 + gDay;
  }
  // Harh (Jun 15 to Jul 15)
  else if (gMonth === 5 && gDay >= 15) {
    desiMonthIndex = 3; // Harh
    desiDay = gDay - 15 + 1;
  } else if (gMonth === 6 && gDay < 16) {
    desiMonthIndex = 3; // Harh
    desiDay = 30 - 15 + 1 + gDay;
  }
  // Sawan (Jul 16 to Aug 15)
  else if (gMonth === 6 && gDay >= 16) {
    desiMonthIndex = 4; // Sawan
    desiDay = gDay - 16 + 1;
  } else if (gMonth === 7 && gDay < 16) {
    desiMonthIndex = 4; // Sawan
    desiDay = 31 - 16 + 1 + gDay;
  }
  // Bhadon (Aug 16 to Sep 15)
  else if (gMonth === 7 && gDay >= 16) {
    desiMonthIndex = 5; // Bhadon
    desiDay = gDay - 16 + 1;
  } else if (gMonth === 8 && gDay < 16) {
    desiMonthIndex = 5; // Bhadon
    desiDay = 31 - 16 + 1 + gDay;
  }
  // Assu (Sep 16 to Oct 15)
  else if (gMonth === 8 && gDay >= 16) {
    desiMonthIndex = 6; // Assu
    desiDay = gDay - 16 + 1;
  } else if (gMonth === 9 && gDay < 16) {
    desiMonthIndex = 6; // Assu
    desiDay = 30 - 16 + 1 + gDay;
  }
  // Kattak (Oct 16 to Nov 14)
  else if (gMonth === 9 && gDay >= 16) {
    desiMonthIndex = 7; // Kattak
    desiDay = gDay - 16 + 1;
  } else if (gMonth === 10 && gDay < 15) {
    desiMonthIndex = 7; // Kattak
    desiDay = 31 - 16 + 1 + gDay;
  }
  // Maghar (Nov 15 to Dec 14)
  else if (gMonth === 10 && gDay >= 15) {
    desiMonthIndex = 8; // Maghar
    desiDay = gDay - 15 + 1;
  } else if (gMonth === 11 && gDay < 15) {
    desiMonthIndex = 8; // Maghar
    desiDay = 30 - 15 + 1 + gDay;
  }
  // Poh (Dec 15 to Jan 13)
  else if (gMonth === 11 && gDay >= 15) {
    desiMonthIndex = 9; // Poh
    desiDay = gDay - 15 + 1;
  } else if (gMonth === 0 && gDay < 14) {
    desiMonthIndex = 9; // Poh
    desiDay = 31 - 15 + 1 + gDay;
    bikramiYear = gYear + 56; // Jan before Chet
  }
  // Magh (Jan 14 to Feb 12)
  else if (gMonth === 0 && gDay >= 14) {
    desiMonthIndex = 10; // Magh
    desiDay = gDay - 14 + 1;
    bikramiYear = gYear + 56;
  } else if (gMonth === 1 && gDay < 13) {
    desiMonthIndex = 10; // Magh
    desiDay = 31 - 14 + 1 + gDay;
    bikramiYear = gYear + 56;
  }
  // Phaggan (Feb 13 to Mar 13)
  else if (gMonth === 1 && gDay >= 13) {
    desiMonthIndex = 11; // Phaggan
    const febDays = new Date(gYear, 2, 0).getDate(); // 28 or 29
    desiDay = gDay - 13 + 1;
    bikramiYear = gYear + 56;
  } else if (gMonth === 2 && gDay < 14) {
    desiMonthIndex = 11; // Phaggan
    const febDays = new Date(gYear, 2, 0).getDate();
    desiDay = febDays - 13 + 1 + gDay;
    bikramiYear = gYear + 56;
  }

  const monthObj = PUNJABI_DESI_MONTHS[desiMonthIndex] || PUNJABI_DESI_MONTHS[0];

  return {
    day: Math.max(1, desiDay),
    monthIndex: desiMonthIndex + 1,
    monthNameUrdu: monthObj.nameUrdu,
    monthNameGurmukhi: monthObj.nameGurmukhi,
    bikramiYear,
    seasonUrdu: monthObj.season,
  };
}

/**
 * Returns comprehensive info for all 3 calendars (English, Islamic Hijri, Punjabi Desi)
 */
export function getTripleCalendarInfo(date: Date = new Date()): CalendarDateInfo {
  const gDay = date.getDate();
  const gMonth = date.getMonth();
  const gYear = date.getFullYear();
  const gDayOfWeek = date.getDay();

  const weekdayUrdu = WEEKDAYS_URDU[gDayOfWeek];
  const weekdayPunjabi = WEEKDAYS_PUNJABI[gDayOfWeek];
  const weekdayEng = date.toLocaleDateString("en-US", { weekday: "long" });
  const monthNameUrdu = GREGORIAN_MONTHS_URDU[gMonth];
  const monthNameEng = date.toLocaleDateString("en-US", { month: "long" });

  const hijri = getHijriDate(date);
  const punjabi = getPunjabiDesiDate(date);

  return {
    gregorian: {
      day: gDay,
      monthIndex: gMonth,
      monthNameUrdu,
      monthNameEng,
      year: gYear,
      weekdayUrdu,
      weekdayPunjabi,
      weekdayEng,
      fullStringUrdu: `${weekdayUrdu}، ${gDay} ${monthNameUrdu} ${gYear}ء`,
      fullStringEng: `${weekdayEng}, ${monthNameEng} ${gDay}, ${gYear}`,
    },
    hijri: {
      day: hijri.day,
      monthIndex: hijri.monthIndex,
      monthNameUrdu: hijri.monthNameUrdu,
      monthNameArabic: hijri.monthNameArabic,
      year: hijri.year,
      fullStringUrdu: `${hijri.day} ${hijri.monthNameUrdu} ${hijri.year}ھ`,
      fullStringArabic: `${hijri.day} ${hijri.monthNameArabic} ${hijri.year} هـ`,
    },
    punjabiDesi: {
      day: punjabi.day,
      monthIndex: punjabi.monthIndex,
      monthNameUrdu: punjabi.monthNameUrdu,
      monthNameGurmukhi: punjabi.monthNameGurmukhi,
      bikramiYear: punjabi.bikramiYear,
      seasonUrdu: punjabi.seasonUrdu,
      fullStringUrdu: `${punjabi.day} ${punjabi.monthNameUrdu} ${punjabi.bikramiYear} بکرمی`,
    },
  };
}

/**
 * Returns a formatted, ready-to-display Markdown response with all 3 calendars
 */
export function generateTripleCalendarCardResponse(date: Date = new Date()): string {
  const info = getTripleCalendarInfo(date);

  return `### 🗓️ آج کی مکمل تاریخ (انگریزی، اسلامی و پنجابی دیسی تقویم)

آج **${info.gregorian.weekdayUrdu}** کا دن ہے اور تینوں تقاویم کے مطابق تاریخیں درج ذیل ہیں:

---

#### 1. 🇬🇧 انگریزی تقویم (Gregorian Calendar):
* **تاریخ:** **${info.gregorian.fullStringUrdu}**
* **English:** **${info.gregorian.fullStringEng}**
* **دن:** **${info.gregorian.weekdayUrdu}** (${info.gregorian.weekdayEng})

---

#### 2. 🕌 اسلامی / ہجری تقویم (Islamic Hijri Calendar):
* **تاریخ:** **${info.hijri.fullStringUrdu}**
* **بالعربية:** **${info.hijri.fullStringArabic}**
* **مہینہ:** **${info.hijri.monthNameUrdu}** (ہجری سال: ${info.hijri.year}ھ)
*(نوٹ: اسلامی قمری تاریخ چاند کی رویت کے مطابق ایک دن کے فرق سے ہو سکتی ہے)*

---

#### 3. 🌾 پنجابی دیسی بکرمی تقویم (Punjabi / Desi Bikrami Calendar):
* **دیسی تاریخ:** **${info.punjabiDesi.fullStringUrdu}**
* **پنجابی وار:** **${info.gregorian.weekdayPunjabi}**
* **مہینہ:** **${info.punjabiDesi.monthNameUrdu}** (${info.punjabiDesi.monthNameGurmukhi})
* **موسم:** **${info.punjabiDesi.seasonUrdu}**
* **بکرمی سال:** **${info.punjabiDesi.bikramiYear} بکرمی**

---
> 💡 *وقت کی قدر کرنا مومن کا شیوہ ہے۔ اللہ تعالیٰ نے قرآنِ مجید میں وقت اور زمانے کی قسم کھا کر اس کی اہمیت واضح فرمائی ہے۔*`;
}
