// Data aggregator - combines all data sources and saves to Supabase
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const baseUrl = req.headers.host?.includes('localhost') 
    ? 'http://localhost:3000' 
    : `https://${req.headers.host}`;

  try {
    // Fetch all data in parallel
    const [marketRes, techRes, newsRes, onchainRes, derivRes] = await Promise.all([
      fetch(`${baseUrl}/api/collect-market`).then(r => r.json()).catch(() => ({ success: false })),
      fetch(`${baseUrl}/api/collect-technicals`).then(r => r.json()).catch(() => ({ success: false })),
      fetch(`${baseUrl}/api/collect-news`).then(r => r.json()).catch(() => ({ success: false })),
      fetch(`${baseUrl}/api/collect-onchain`).then(r => r.json()).catch(() => ({ success: false })),
      fetch(`${baseUrl}/api/collect-derivatives`).then(r => r.json()).catch(() => ({ success: false }))
    ]);

    const aggregatedData = {
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      market: marketRes.success ? marketRes.data : null,
      technicals: techRes.success ? techRes.data : null,
      news: newsRes.success ? newsRes.data : [],
      onchain: onchainRes.success ? onchainRes.data : null,
      derivatives: derivRes.success ? derivRes.data : null
    };

    // Save to Supabase if configured
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Upsert market data
      if (aggregatedData.market) {
        await supabase.from('market_data').upsert(aggregatedData.market, { onConflict: 'date' });
      }

      // Upsert technical indicators
      if (aggregatedData.technicals) {
        await supabase.from('technical_indicators').upsert(aggregatedData.technicals, { onConflict: 'date' });
      }

      // Insert news (multiple rows)
      if (aggregatedData.news.length > 0) {
        const newsRows = aggregatedData.news.map(n => ({
          date: aggregatedData.date,
          title: n.title,
          source: n.source,
          url: n.url,
          sentiment: n.sentiment,
          currencies: n.currencies
        }));
        await supabase.from('news_data').insert(newsRows);
      }

      // Upsert on-chain data
      if (aggregatedData.onchain) {
        await supabase.from('onchain_data').upsert(aggregatedData.onchain, { onConflict: 'date' });
      }

      // Upsert derivatives data
      if (aggregatedData.derivatives) {
        await supabase.from('derivatives_data').upsert(aggregatedData.derivatives, { onConflict: 'date' });
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json({
      success: true,
      message: 'Data aggregated successfully',
      data: aggregatedData,
      saved_to_db: !!(supabaseUrl && supabaseKey)
    });

  } catch (error) {
    console.error('Data aggregation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
