process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testWpRestApi() {
  const queries = ['روزہ', 'سجدہ سہو', 'قصر نماز', 'زکوۃ', 'طلاق'];

  for (const q of queries) {
    console.log(`\n========================================`);
    console.log(`SEARCHING: "${q}" on alulama.org REST API`);
    const url = `https://alulama.org/wp-json/wp/v2/posts?search=${encodeURIComponent(q)}&per_page=3`;
    const res = await fetch(url);
    if (res.status === 200) {
      const posts = await res.json();
      console.log(`Found ${posts.length} posts.`);
      for (const p of posts) {
        const title = p.title?.rendered?.replace(/&#8217;/g, "'").replace(/&#8211;/g, "-").replace(/<[^>]+>/g, '').trim();
        const link = p.link;
        const cleanContent = p.content?.rendered?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200);
        console.log(`- Title: ${title}`);
        console.log(`  Direct Link: ${link}`);
        console.log(`  Content: ${cleanContent}...`);
      }
    } else {
      console.log('API returned status:', res.status);
    }
  }
}

testWpRestApi().catch(console.error);
