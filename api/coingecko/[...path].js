export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  const pathAfterApi = url.pathname.replace(/^\/api\/coingecko/, '');
  const queryString = url.search;
  
  const coingeckoUrl = `https://api.coingecko.com/api/v3${pathAfterApi}${queryString}`;
  
  console.log('Proxying to:', coingeckoUrl);
  
  try {
    const response = await fetch(coingeckoUrl, {
      method: request.method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; DenoWallet/1.0)'
      }
    });

    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 's-maxage=30, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error('CoinGecko API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch from CoinGecko API', details: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
