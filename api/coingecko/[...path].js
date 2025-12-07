export default async function handler(req, res) {
  // Extract the path after /api/coingecko
  const { url } = req;
  const apiPath = url.replace(/^\/api\/coingecko/, '');
  
  const coingeckoUrl = `https://api.coingecko.com/api/v3${apiPath}`;
  
  try {
    const response = await fetch(coingeckoUrl, {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DenoWallet/1.0'
      }
    });

    // Forward rate limit headers
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    if (rateLimitRemaining) {
      res.setHeader('X-RateLimit-Remaining', rateLimitRemaining);
    }

    const data = await response.json();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('CoinGecko API Error:', error);
    res.status(500).json({ error: 'Failed to fetch from CoinGecko API' });
  }
}
