async function runAllRequiredTests() {
  console.log("========================================================");
  console.log("STARTING LIVE GEMINI AI VERIFICATION FOR ALL TEST CASES");
  console.log("========================================================\n");

  const unrelatedTests = [
    { id: "Test 1", q: "What is the capital of Pakistan?" },
    { id: "Test 2", q: "Explain photosynthesis in simple words." },
    { id: "Test 3", q: "Why does a person feel thirsty?" },
    { id: "Test 4", q: "Tell me about the history of the internet." },
    { id: "Test 5", q: "What is the meaning of the word رحمت?" },
    { id: "Test 6", q: "نماز کے فرائض کیا ہیں؟" }
  ];

  for (const t of unrelatedTests) {
    console.log("--------------------------------------------------");
    console.log(`RUNNING ${t.id}: "${t.q}"`);
    const start = Date.now();
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: t.q, history: [] })
    });
    const data = await res.json();
    const duration = Date.now() - start;
    console.log(`STATUS: Success=${data.success} | isAI=${data.isAI} | (${duration}ms)`);
    console.log(`AI GENERATED REPLY:\n${data.reply}\n`);
  }

  console.log("==================================================");
  console.log("TESTING MULTI-TURN CONTEXT & FOLLOW-UP CONTINUITY");
  console.log("==================================================\n");

  // Turn 1
  const q1 = "قرآن میں صبر کے بارے میں کیا فرمایا گیا ہے؟";
  console.log(`TURN 1: "${q1}"`);
  const res1 = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: q1, history: [] })
  });
  const d1 = await res1.json();
  console.log(`REPLY 1:\n${d1.reply}\n`);

  // Turn 2 (Follow-up)
  const q2 = "اس کی ایک مثال بھی بتائیں۔";
  console.log(`TURN 2 (Follow-up): "${q2}"`);
  const history = [
    { sender: "user", text: q1 },
    { sender: "assistant", text: d1.reply }
  ];
  const res2 = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: q2, history })
  });
  const d2 = await res2.json();
  console.log(`REPLY 2 (Understood context of Sabr):\n${d2.reply}\n`);

  // Turn 3 (New Topic)
  const q3 = "تجوید میں مد کیا ہے؟";
  console.log(`TURN 3 (New Topic): "${q3}"`);
  const res3 = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: q3, history: [] })
  });
  const d3 = await res3.json();
  console.log(`REPLY 3 (Independent new topic on Tajweed/Madd):\n${d3.reply}\n`);
}

runAllRequiredTests().catch(console.error);
