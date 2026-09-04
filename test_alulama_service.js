import { searchAlUlamaFatwa } from './src/server/alUlamaService.js';

async function test() {
  const tests = [
    'سفر میں قصر نماز کی مدت',
    'امام سجدہ بھول جائے تو سجدہ سہو',
    'کیا شادی شدہ بہن بھائی کو زکوۃ دی جا سکتی ہے',
    'What is photosynthesis' // non-fatwa question
  ];

  for (const q of tests) {
    console.log(`\n========================================`);
    console.log(`QUERY: "${q}"`);
    const fatwa = await searchAlUlamaFatwa(q);
    if (fatwa) {
      console.log(`✅ FOUND FATWA:`);
      console.log(`Title: ${fatwa.title}`);
      console.log(`Direct Link: ${fatwa.link}`);
      console.log(`Question Number: ${fatwa.questionNumber || 'N/A'}`);
      console.log(`Snippet:\n${fatwa.fullContent.substring(0, 250)}...`);
    } else {
      console.log(`❌ NO FATWA FOUND on alulama.org`);
    }
  }
}

test().catch(console.error);
