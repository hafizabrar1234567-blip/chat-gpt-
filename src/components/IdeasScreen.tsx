import React, { useState } from "react";
import { Lightbulb, Sparkles, ArrowRight } from "lucide-react";
import { CATEGORIES } from "../utils/constants";

interface IdeasScreenProps {
  onSelectIdeaTopic: (topic: string) => void;
}

const SEED_IDEAS = [
  {
    category: "Islamic",
    title: "جمعہ المبارک اور صحیح بخاری کی سنتیں",
    description: "جمعتہ المبارک کے دن کی مسنون سنتیں اور احادیثِ مبارکہ جو صحیح بخاری سے ثابت ہیں۔",
    hookSuggestion: "کیا آپ جانتے ہیں صحیح بخاری کے مطابق جمعہ کے دن کی یہ 3 سنتیں کون سی ہیں؟",
  },
  {
    category: "Islamic",
    title: "صبر اور شکر کی فضیلت (صحیح بخاری)",
    description: "زندگی کی مشکل گھڑیوں میں صبر اور اللہ پر توکل کے بارے میں صحیح بخاری کی مبارک احادیث۔",
    hookSuggestion: "صحیح بخاری کی یہ حدیث مبارکہ آپ کو ہر مشکل میں حوصلہ دے گی...",
  },
  {
    category: "Islamic",
    title: "حسنِ اخلاق اور ایمان (صحیح بخاری)",
    description: "نبی کریم ﷺ کے بہترین اخلاق اور ایمان کی علامت پر صحیح بخاری کی حدیث مبارکہ۔",
    hookSuggestion: "صحیح بخاری کی اس حدیث میں بہترین مسلمان کی پہچان بتائی گئی ہے...",
  },
  {
    category: "Motivation",
    title: "ناکامی سے کامیابی کا سفر",
    description: "لوگوں کی باتوں کی پرواہ کیے بغیر اپنے خوابوں کی طرف پہلا قدم کیسے۔",
    hookSuggestion: "اگر لوگ تم پر ہنس رہے ہیں، تو مبارک ہو!",
  },
  {
    category: "Motivation",
    title: "صبح جلدی اٹھنے کے 3 حیرت انگیز فائدے",
    description: "5 AM کلپ اور اس کے آپ کی ذہنی صحت پر مثبت اثرات۔",
    hookSuggestion: "صرف 7 دن صبح 5 بجے اٹھ کر دیکھو، زندگی بدل جائے گی!",
  },
  {
    category: "Education",
    title: "موبائل کا صحیح استعمال اور ٹائم مینجمنٹ",
    description: "سوشل میڈیا پر وقت ضائع کرنے کی بجائے انکم کے ذرائع کیسے سیکھیں۔",
    hookSuggestion: "آپ کا موبائل فون یا تو پیسے کمانے کا ذریعہ ہے یا وقت ضائع کرنے کا...",
  },
  {
    category: "Lifestyle",
    title: "کم بجٹ میں سٹائلش اور سمارٹ لک",
    description: "سادگی اور نفاست سے اپنے اچھے پہناوے اور پرسنالٹی کا انتخاب۔",
    hookSuggestion: "سستے کپڑوں میں بھی ہینڈسم اور سٹائلش کیسے نظر آئیں؟",
  },
  {
    category: "Funny",
    title: "دیسی گھروں میں مہمان نوازی کے دلچسپ قصے",
    description: "جب گھر میں اچانک مہمان آ جائیں تو بچوں کے مزاحیہ ردِعمل!",
    hookSuggestion: "دیسی امیاں جب مہمانوں کے سامنے بسکٹ لاتی ہیں...",
  },
  {
    category: "Personal",
    title: "نئی تصویر / DP کے لیے زبردست Attitude Status",
    description: "اپنی نئی پروفائل پکچر کے لیے پُراعتماد اور شاندار کیپشن۔",
    hookSuggestion: "ہم وہ ہیں جو خاموشی سے آتے ہیں اور گفتگو بدل دیتے ہیں۔",
  },
  {
    category: "Business",
    title: "آن لائن بزنس شروع کرنے کا سب سے آسان طریقہ",
    description: "بغیر بڑی انویسٹمنٹ کے انسٹاگرام سے سیلز کیسے لائیں۔",
    hookSuggestion: "اگر آپ کے پاس صرف 5000 روپے ہیں تو یہ بزنس شروع کریں...",
  },
  {
    category: "General",
    title: "صحت مند زندگی کے 4 سنہری اصول",
    description: "روزانہ پانی پینا، اچھی نیند اور مثبت ماحول کی اہمیت۔",
    hookSuggestion: "آپ کی صحت بدلنے والا ایک منٹ کا مشورہ...",
  },
];

export const IdeasScreen: React.FC<IdeasScreenProps> = ({ onSelectIdeaTopic }) => {
  const [activeCategory, setActiveCategory] = useState("Islamic");

  const filteredIdeas = SEED_IDEAS.filter((idea) =>
    activeCategory === "All" ? true : idea.category === activeCategory
  );

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-1">
        <h2 className="text-xl font-black text-[#111827] flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500 fill-amber-500/20" />
          <span>Content Ideas ✨</span>
        </h2>
        <p className="text-xs text-[#6B7280] font-medium">
          "Never run out of content ideas."
        </p>
      </div>

      {/* Category Pills Slider */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === cat.id
                ? "bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/25"
                : "bg-white hover:bg-[#F5F3FF] text-[#111827] hover:text-[#111827] border border-slate-200/80 hover:border-[#4F46E5]/40"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.id}</span>
          </button>
        ))}
      </div>

      {/* Ideas List */}
      <div className="space-y-3.5">
        {filteredIdeas.map((idea, idx) => (
          <div
            key={idx}
            className="bg-white hover:bg-[#F5F3FF] border border-slate-200/80 hover:border-[#4F46E5]/40 rounded-3xl p-5 space-y-3.5 shadow-xs transition-all duration-180 hover:-translate-y-[2px] group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#4F46E5] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {idea.category}
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-[#111827] group-hover:text-[#111827] font-urdu leading-snug">
                {idea.title}
              </h3>
              <p className="text-xs text-[#6B7280] group-hover:text-[#4B5563] font-urdu mt-1 leading-relaxed">
                {idea.description}
              </p>
            </div>

            {/* Hook Suggestion */}
            <div className="bg-slate-50 group-hover:bg-white/80 p-3.5 rounded-2xl border border-slate-200/80 transition-colors">
              <span className="text-[10px] text-[#4F46E5] font-black uppercase block mb-0.5">
                Suggested Hook:
              </span>
              <p className="text-xs text-[#111827] font-urdu italic">"{idea.hookSuggestion}"</p>
            </div>

            {/* Create Script / Use Idea CTA */}
            <button
              onClick={() => onSelectIdeaTopic(idea.title + " - " + idea.hookSuggestion)}
              style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-sm text-white shadow-md shadow-green-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer hover:bg-[#15803d]"
            >
              <Sparkles className="w-4 h-4 text-white fill-white shrink-0" />
              <span className="text-white font-black text-sm whitespace-nowrap">
                Create Script (اس پر اسکرپٹ بنائیں)
              </span>
              <ArrowRight className="w-4 h-4 text-white stroke-[2.5] shrink-0" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
