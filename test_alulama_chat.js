async function testAlUlamaChatIntegration() {
  console.log("=================================================");
  console.log("TESTING AL-ULAMA.ORG FATWA INTEGRATION IN CHAT");
  console.log("=================================================\n");

  // Test 1: Fatwa found on alulama.org
  const q1 = "سفر میں قصر نماز کی مدت اور رشتہ دار کے گھر قیام کا کیا حکم ہے؟";
  console.log(`TEST 1 (Fatwa Found): "${q1}"`);
  const res1 = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: q1, history: [] })
  });
  const d1 = await res1.json();
  console.log("AI REPLY 1:\n" + d1.reply + "\n");
  console.log("-------------------------------------------------\n");

  // Test 2: Fatwa not on alulama.org
  const q2 = "اس مسئلے پر علماء کا فتوی بتائیں کہ کیا روبوٹ کی امامت میں نماز ہو سکتی ہے؟";
  console.log(`TEST 2 (Fatwa Not Found): "${q2}"`);
  const res2 = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: q2, history: [] })
  });
  const d2 = await res2.json();
  console.log("AI REPLY 2:\n" + d2.reply + "\n");
  console.log("-------------------------------------------------\n");

  // Test 3: Non-fatwa general query
  const q3 = "What is the capital of Japan?";
  console.log(`TEST 3 (General Query): "${q3}"`);
  const res3 = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: q3, history: [] })
  });
  const d3 = await res3.json();
  console.log("AI REPLY 3:\n" + d3.reply + "\n");
}

testAlUlamaChatIntegration().catch(console.error);
