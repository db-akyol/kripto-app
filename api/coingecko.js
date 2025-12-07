export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Extract the path after /api/coingecko
  const fullUrl = req.url;
  const apiPath = fullUrl.replace(/^\/api\/coingecko/, '');
  
  const coingeckoUrl = `https://api.coingecko.com/api/v3${apiPath}`;
  
  console.log('Proxying to:', coingeckoUrl);
  
  try {
    const response = await fetch(coingeckoUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const data = await response.json();
    
    // Set CORS and cache headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('CoinGecko API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch from CoinGecko API', 
      details: error.message 
    });
  }
}
