import { FeatureType, LanguageOption, StyleOption } from "../types";

export interface ToolConfig {
  id: FeatureType;
  titleUrdu: string;
  titleEng: string;
  descriptionUrdu: string;
  descriptionEng: string;
  iconName: string;
  badge?: string;
  color: string;
}

export const TOOLS_CONFIG: ToolConfig[] = [
  {
    id: "create_everything",
    titleUrdu: "✨ Create Everything",
    titleEng: "✨ Create Everything All-in-One",
    descriptionUrdu: "ایک ہی بار میں Hook, Script, Caption, Hashtags, WhatsApp Status اور Post تیار کریں!",
    descriptionEng: "Generate Hook, Script, Caption, Hashtags & Status all in 1 click!",
    iconName: "Sparkles",
    badge: "Most Popular 🔥",
    color: "from-amber-500 to-rose-600",
  },
  {
    id: "image_caption",
    titleUrdu: "📸 Image → Caption",
    titleEng: "📸 Image to Caption",
    descriptionUrdu: "تصویر اپلوڈ کریں اور 7 مختلف انداز میں Captions حاصل کریں۔",
    descriptionEng: "Upload image & get 7 unique styled captions instantly.",
    iconName: "Camera",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "reel_script",
    titleUrdu: "🎬 Reel Script Generator",
    titleEng: "🎬 Reel / TikTok Script",
    descriptionUrdu: "30 سیکنڈ Reel کا Hook, Voiceover Script, Caption اور Hashtags۔",
    descriptionEng: "30s Reel hook, scene script, ending line & hashtags.",
    iconName: "Video",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "hashtags",
    titleUrdu: "#️⃣ Viral Hashtags",
    titleEng: "#️⃣ Hashtag Generator",
    descriptionUrdu: "اپنی پوسٹ کے لیے وائرل اور متعلقہ ہیش ٹیگز تیار کریں۔",
    descriptionEng: "Generate viral, trending & niche hashtags.",
    iconName: "Hash",
    color: "from-teal-500 to-emerald-600",
  },
  {
    id: "whatsapp_status",
    titleUrdu: "📱 WhatsApp Status",
    titleEng: "📱 WhatsApp Status Maker",
    descriptionUrdu: "مختصر اور پُراثر Status (اسلامک، ایموشنل، موٹیویشنل وغیرہ)۔",
    descriptionEng: "Short impactful lines for your WhatsApp status.",
    iconName: "MessageCircle",
    color: "from-green-500 to-emerald-700",
  },
  {
    id: "logo_design",
    titleUrdu: "🎨 لوگو و ڈی پی ڈیزائنر",
    titleEng: "🎨 Logo & DP Maker",
    descriptionUrdu: "نام، مونوگرام اور خطاطی کا شاہی لوگو — خالص نام، خوبصورت ڈیزائن اور نیچے معنی و حوالہ!",
    descriptionEng: "Design pure luxury name logos, calligraphy emblems & DP badges.",
    iconName: "Palette",
    badge: "New 💎",
    color: "from-amber-600 via-yellow-500 to-amber-700",
  },
  {
    id: "social_post",
    titleUrdu: "📝 Social Media Post",
    titleEng: "📝 Complete Social Post",
    descriptionUrdu: "Instagram, Facebook, TikTok اور WhatsApp کے لیے تیار پوسٹ۔",
    descriptionEng: "Tailored posts for IG, FB, TikTok & WhatsApp.",
    iconName: "FileText",
    color: "from-sky-500 to-blue-700",
  },
  {
    id: "daily_ideas",
    titleUrdu: "💡 Today's Content Idea",
    titleEng: "💡 Content Ideas",
    descriptionUrdu: "روزانہ نئے آئیڈیاز جن پر فوراً اسکرپٹ یا پوسٹ بنائیں۔",
    descriptionEng: "Fresh daily content ideas for all categories.",
    iconName: "Lightbulb",
    color: "from-yellow-500 to-amber-600",
  },
];

export const LANGUAGES: { id: LanguageOption; labelUrdu: string; labelEng: string }[] = [
  { id: "urdu", labelUrdu: "اردو (Urdu)", labelEng: "اردو (Urdu)" },
  { id: "english", labelUrdu: "English (انگلش)", labelEng: "English" },
  { id: "arabic", labelUrdu: "العربية (عربی)", labelEng: "العربية (Arabic)" },
];

export const STYLES: { id: StyleOption; labelUrdu: string; labelEng: string; icon: string }[] = [
  { id: "simple", labelUrdu: "سادہ (Simple)", labelEng: "Simple", icon: "✨" },
  { id: "stylish", labelUrdu: "سٹائلش (Stylish)", labelEng: "Stylish", icon: "💎" },
  { id: "motivational", labelUrdu: "موٹیویشنل (Motivational)", labelEng: "Motivational", icon: "🚀" },
  { id: "emotional", labelUrdu: "ایموشنل (Emotional)", labelEng: "Emotional", icon: "❤️" },
  { id: "islamic", labelUrdu: "اسلامک (Islamic)", labelEng: "Islamic", icon: "🌙" },
  { id: "funny", labelUrdu: "مزاحیہ (Funny)", labelEng: "Funny", icon: "😂" },
  { id: "attitude", labelUrdu: "ایٹی ٹیوڈ (Attitude)", labelEng: "Attitude", icon: "🔥" },
  { id: "professional", labelUrdu: "پیشہ ورانہ (Professional)", labelEng: "Professional", icon: "💼" },
];

export const CATEGORIES = [
  { id: "Islamic", labelUrdu: "اسلامک (Islamic)", icon: "🌙" },
  { id: "Motivation", labelUrdu: "موٹیویشن (Motivation)", icon: "🚀" },
  { id: "Lifestyle", labelUrdu: "لائف سٹائل (Lifestyle)", icon: "📸" },
  { id: "Education", labelUrdu: "ایجوکیشن (Education)", icon: "📚" },
  { id: "Funny", labelUrdu: "مزاحیہ (Funny)", icon: "😂" },
  { id: "Personal", labelUrdu: "پرسنل / DP (Personal)", icon: "😎" },
  { id: "Business", labelUrdu: "بزنس (Business)", icon: "💼" },
  { id: "General", labelUrdu: "جنرل (General)", icon: "🔥" },
];

export const TOPIC_PROMPTS = [
  { urdu: "نئی DP / تصویر کے لیے Caption", eng: "New DP Caption" },
  { urdu: "جمعہ مبارک پوسٹ", eng: "Jummah Mubarak" },
  { urdu: "صبح کا سلام / Morning Motivation", eng: "Morning Motivation" },
  { urdu: "سفر / Travel Vlog Video Script", eng: "Travel Vlog Reel" },
  { urdu: "کاروبار / Business Success Tip", eng: "Business Growth Tip" },
  { urdu: "دوستی / Best Friends status", eng: "Friendship Status" },
];
