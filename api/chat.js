// Chat API endpoint for asking questions to AI
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Build system prompt with crypto context
    const systemPrompt = `Sen deneyimli bir kripto para analistisin. Kullanıcıların sorularını Türkçe olarak yanıtlıyorsun.

ÖNEMLİ KURALLAR:
- Kısa ve öz cevaplar ver (maksimum 3-4 paragraf)
- Somut fiyat seviyeleri ve yüzdeler kullan
- "Belki", "muhtemelen" yerine kararlı ifadeler kullan
- Yatırım tavsiyesi olmadığını hatırlat ama yine de net görüşünü bildir

${context ? `GÜNCEL PİYASA DURUMU:\n${context}` : ''}`;

    // Call Groq API
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      return res.status(500).json({ success: false, error: 'GROQ_API_KEY not configured' });
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      throw new Error(`Groq API error: ${groqResponse.status} - ${errorText}`);
    }

    const groqData = await groqResponse.json();
    const reply = groqData.choices?.[0]?.message?.content || 'Yanıt oluşturulamadı.';

    return res.status(200).json({
      success: true,
      reply: reply
    });

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
