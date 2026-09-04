import { searchAlUlamaFatwa } from "./src/server/alUlamaService";

async function run() {
  const tests = [
    "سفر میں قصر نماز کی مدت",
    "کیا مریخ پر خلائی جہاز میں نماز پڑھنا جائز ہے",
    "امام سجدہ بھول جائے تو سجدہ سہو کا حکم",
    "What is the capital of Canada"
  ];

  for (const q of tests) {
    const r = await searchAlUlamaFatwa(q);
    console.log(`Q: "${q}" -> Result: ${r ? `FOUND: "${r.title}" (Link: ${r.link})` : "NULL (Not Found)"}`);
  }
}

run().catch(console.error);
