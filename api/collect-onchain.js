// On-chain data collector - fetches Bitcoin blockchain metrics
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    // Fetch from blockchain.info API (free, no auth)
    const [statsResponse, mempoolResponse] = await Promise.all([
      fetch('https://api.blockchain.info/stats', {
        headers: { 'Accept': 'application/json' }
      }),
      fetch('https://api.blockchain.info/mempool?format=json', {
        headers: { 'Accept': 'application/json' }
      })
    ]);

    const stats = statsResponse.ok ? await statsResponse.json() : {};
    const mempool = mempoolResponse.ok ? await mempoolResponse.json() : {};

    const onchainData = {
      date: new Date().toISOString().split('T')[0],
      hash_rate: stats.hash_rate || 0, // TH/s
      difficulty: stats.difficulty || 0,
      active_addresses: stats.n_btc_mined ? Math.round(stats.n_btc_mined / 6.25) : 0, // Approximation
      transaction_count: stats.n_tx || 0,
      avg_transaction_value: stats.total_btc_sent ? (stats.total_btc_sent / 100000000) / (stats.n_tx || 1) : 0,
      mempool_size: mempool.count || 0,
      mempool_bytes: mempool.size || 0,
      blocks_mined_24h: stats.n_blocks_mined || 0,
      btc_mined_24h: stats.n_btc_mined ? stats.n_btc_mined / 100000000 : 0
    };

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');

    return res.status(200).json({
      success: true,
      data: onchainData
    });

  } catch (error) {
    console.error('On-chain data collection error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
