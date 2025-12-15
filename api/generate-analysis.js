// Gemini AI Analysis Generator
// Generates daily crypto market analysis using collected data

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    // 1. Collect all current data directly from external APIs
    const [btcDataRes, globalRes, onchainRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&order=market_cap_desc&sparkline=false', {
        headers: { 'Accept': 'application/json', 'User-Agent': 'DenoWallet/1.0' }
      }).then(r => r.json()).catch(() => null),
      fetch('https://api.coingecko.com/api/v3/global', {
        headers: { 'Accept': 'application/json', 'User-Agent': 'DenoWallet/1.0' }
      }).then(r => r.json()).catch(() => null),
      fetch('https://api.blockchain.info/stats', {
        headers: { 'Accept': 'application/json' }
      }).then(r => r.json()).catch(() => null)
    ]);

    const btc = btcDataRes?.find(c => c.id === 'bitcoin');
    const eth = btcDataRes?.find(c => c.id === 'ethereum');

    // 2. Build comprehensive prompt with collected data
    const marketData = {
      btc_price: btc?.current_price,
      btc_24h_change: btc?.price_change_percentage_24h,
      btc_market_cap: btc?.market_cap,
      btc_volume: btc?.total_volume,
      eth_price: eth?.current_price,
      total_market_cap: globalRes?.data?.total_market_cap?.usd
    };

    const onchainData = {
      hash_rate: onchainRes?.hash_rate,
      transaction_count: onchainRes?.n_tx,
      mempool_size: 0
    };

    const prompt = buildAnalysisPrompt({
      market: marketData,
      technicals: null, // Will be calculated in future
      news: [],
      onchain: onchainData,
      derivatives: null
    });

    // 3. Call Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY not configured'
      });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Analiz oluşturulamadı.';

    // 4. Parse the analysis
    const analysis = {
      date: new Date().toISOString().split('T')[0],
      analysis: analysisText,
      summary: extractSummary(analysisText),
      sentiment: extractSentiment(analysisText),
      timestamp: new Date().toISOString()
    };

    // 5. Save to Supabase if configured
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('ai_analyses').upsert({
        date: analysis.date,
        analysis: analysis.analysis,
        summary: analysis.summary,
        sentiment: analysis.sentiment
      }, { onConflict: 'date' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('AI Analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

function buildAnalysisPrompt(data) {
  const today = new Date().toLocaleDateString('tr-TR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `Sen deneyimli bir kripto para analistisin. Aşağıdaki verilere dayanarak bugünün (${today}) Bitcoin ve kripto piyasası hakkında kapsamlı bir Türkçe analiz yaz.

## PİYASA VERİLERİ
${data.market ? `
- Bitcoin Fiyatı: $${data.market.btc_price?.toLocaleString()}
- Bitcoin 24s Değişim: %${data.market.btc_24h_change?.toFixed(2)}
- Bitcoin Market Değeri: $${(data.market.btc_market_cap / 1e9)?.toFixed(2)}B
- Bitcoin Hacim: $${(data.market.btc_volume / 1e9)?.toFixed(2)}B
- Ethereum Fiyatı: $${data.market.eth_price?.toLocaleString()}
- Toplam Market Değeri: $${(data.market.total_market_cap / 1e12)?.toFixed(2)}T
` : 'Piyasa verileri mevcut değil.'}

## TEKNİK İNDİKATÖRLER
${data.technicals ? `
- RSI (14): ${data.technicals.rsi_14?.toFixed(2)} ${data.technicals.rsi_14 > 70 ? '(Aşırı Alım)' : data.technicals.rsi_14 < 30 ? '(Aşırı Satım)' : '(Nötr)'}
- MACD: ${data.technicals.macd?.toFixed(4)}
- EMA 20: $${data.technicals.ema_20?.toLocaleString()}
- EMA 50: $${data.technicals.ema_50?.toLocaleString()}
- EMA 200: $${data.technicals.ema_200?.toLocaleString()}
- Bollinger Üst: $${data.technicals.bb_upper?.toLocaleString()}
- Bollinger Alt: $${data.technicals.bb_lower?.toLocaleString()}
` : 'Teknik veriler mevcut değil.'}

## ON-CHAIN VERİLERİ
${data.onchain ? `
- Hash Rate: ${(data.onchain.hash_rate / 1e12)?.toFixed(2)} TH/s
- Mempool Boyutu: ${data.onchain.mempool_size} işlem
- Günlük İşlem: ${data.onchain.transaction_count?.toLocaleString()}
` : 'On-chain verileri mevcut değil.'}

## TÜREV VERİLERİ
${data.derivatives ? `
- Open Interest: $${data.derivatives.open_interest ? (data.derivatives.open_interest / 1e9)?.toFixed(2) + 'B' : 'N/A'}
- Funding Rate: ${data.derivatives.funding_rate ? (data.derivatives.funding_rate * 100)?.toFixed(4) + '%' : 'N/A'}
- Long/Short Oranı: ${data.derivatives.long_short_ratio?.toFixed(2) || 'N/A'}
` : 'Türev verileri mevcut değil.'}

## SON HABERLER
${data.news?.length > 0 ? data.news.slice(0, 5).map(n => `- ${n.title} (${n.sentiment})`).join('\n') : 'Haber verisi mevcut değil.'}

---

Lütfen şu formatta yanıt ver:

## 📊 GÜNLÜK ANALİZ

### Piyasa Özeti
[2-3 cümlelik genel piyasa özeti]

### Teknik Görünüm
[Teknik indikatörlere dayalı analiz]

### Kritik Seviyeler
- Destek: [seviyeler]
- Direnç: [seviyeler]

### Genel Değerlendirme
[BOĞA/AYI/NÖTR] - [Kısa açıklama]

### Dikkat Edilmesi Gerekenler
[Önemli noktalar listesi]`;
}

function extractSummary(text) {
  const lines = text.split('\n').filter(l => l.trim());
  return lines.slice(0, 3).join(' ').substring(0, 300);
}

function extractSentiment(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('boğa') || lowerText.includes('bullish') || lowerText.includes('yükseliş')) {
    return 'bullish';
  } else if (lowerText.includes('ayı') || lowerText.includes('bearish') || lowerText.includes('düşüş')) {
    return 'bearish';
  }
  return 'neutral';
}
