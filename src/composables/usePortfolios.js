import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { getDefaultPortfolios } from "./useDefaultPortfolios";

const STORAGE_KEY = "crypto-portfolios";
const UPDATE_INTERVAL = 30000; // 30 saniye
const historyCache = new Map(); // Singleton cache for history

// Singleton state
const portfolios = ref([]);
const selectedPortfolio = ref(null);
let priceUpdateInterval = null;

// Helper to find coingeckoId from defaults
function findCoingeckoId(symbol, name) {
  const defaults = getDefaultPortfolios();
  for (const p of defaults) {
    const coin = p.coins.find(c => c.symbol === symbol || c.name === name);
    if (coin && coin.coingeckoId) return coin.coingeckoId;
  }
  // Fallback for common coins if not in defaults
  const commonMap = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'AVAX': 'avalanche-2',
    'AAVE': 'aave',
    'FTM': 'fantom',
    'ARKM': 'arkham',
    'FET': 'fetch-ai',
    'PEPE': 'pepe',
    'RNDR': 'render-token',
    'PIXEL': 'pixels',
    'WLD': 'worldcoin-wld',
    'PNG': 'pangolin',
    'TAI': 'tars-ai',
    'WOJAK': 'wojak',
    'POPCAT': 'popcat',
    'CHILLGUY': 'just-a-chill-guy',
    'NST': 'ninja-squad-token'
  };
  return commonMap[symbol] || null;
}

function loadPortfoliosFromStorage() {
  try {
    const storedPortfolios = localStorage.getItem(STORAGE_KEY);
    if (storedPortfolios) {
      const parsed = JSON.parse(storedPortfolios);
      
      // MIGRATION: Check for missing coingeckoIds and backfill
      let updated = false;
      parsed.forEach(portfolio => {
        portfolio.coins.forEach(coin => {
          if (!coin.coingeckoId) {
             const id = findCoingeckoId(coin.symbol, coin.name);
             if (id) {
               coin.coingeckoId = id;
               updated = true;
             }
          }
        });
      });
      
      if (updated) {
        console.log("Eski veriler güncellendi (Migration uygulandı).");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      
      return parsed;
    }
  } catch (error) {
    console.error("Portföyler yüklenirken hata oluştu:", error);
  }
  return getDefaultPortfolios();
}

function savePortfoliosToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios.value));
  } catch (error) {
    console.error("Portföyler kaydedilirken hata oluştu:", error);
  }
}

  function updatePortfolioValues(portfolio) {
    if (!portfolio || !portfolio.coins) return;

    portfolio.value = 0;
    portfolio.totalCost = 0;
    portfolio.change24h = 0;

    portfolio.coins.forEach(coin => {
      // Ensure specific numeric fields exist
      coin.buyPrice = coin.buyPrice || coin.price; // Fallback to current price if no history
      
      coin.value = coin.balance * coin.price;
      coin.totalCost = coin.balance * coin.buyPrice;
      
      coin.pnl = coin.value - coin.totalCost;
      coin.pnlPercentage = coin.totalCost > 0 ? (coin.pnl / coin.totalCost) * 100 : 0;
      
      // Ensure change24h is a valid number
      coin.change24h = typeof coin.change24h === 'number' && !isNaN(coin.change24h) ? coin.change24h : 0;

      portfolio.value += coin.value;
      portfolio.totalCost += coin.totalCost;
      
      // Weighted 24h change calculation
      portfolio.change24h += (coin.value * coin.change24h) / 100;
    });

    portfolio.totalPnl = portfolio.value - portfolio.totalCost;
    portfolio.totalPnlPercentage = portfolio.totalCost > 0 ? (portfolio.totalPnl / portfolio.totalCost) * 100 : 0;

    const totalValue = portfolio.value;
    if (totalValue > 0) {
      portfolio.coins.forEach(coin => {
        coin.allocation = (coin.value / totalValue) * 100;
      });
    } else {
      portfolio.coins.forEach(coin => coin.allocation = 0);
    }
  }

  async function updateCoinPrices() {
    if (portfolios.value.length === 0) return;

    try {
      const uniqueCoins = new Set();
      portfolios.value.forEach(portfolio => {
        portfolio.coins.forEach(coin => {
          if(coin.coingeckoId) uniqueCoins.add(coin.coingeckoId);
        });
      });

      if (uniqueCoins.size === 0) return;

      // CoinGecko API request
      const response = await fetch(
        `/api/coingecko/simple/price?` +
          new URLSearchParams({
            ids: Array.from(uniqueCoins).join(","),
            vs_currencies: "usd",
            include_24h_change: "true",
          })
      );

      if (!response.ok) throw new Error(`API Hatası: ${response.status}`);

      const prices = await response.json();
      let changesMade = false;

      portfolios.value.forEach(portfolio => {
        portfolio.coins.forEach(coin => {
          const priceData = prices[coin.coingeckoId];
          if (priceData) {
            if (coin.price !== priceData.usd) {
               coin.price = priceData.usd;
               coin.change24h = priceData.usd_24h_change;
               changesMade = true;
            }
          }
        });
        updatePortfolioValues(portfolio);
      });
      
      if(changesMade) savePortfoliosToStorage();

    } catch (error) {
      console.error("Fiyat güncelleme hatası:", error);
    }
  }

  function initializePortfolios() {
    portfolios.value = loadPortfoliosFromStorage();
    
    if (portfolios.value.length > 0 && !selectedPortfolio.value) {
      // ID kontrolü yap ve yoksa ilki seç
      const currentId = selectedPortfolio.value?.id;
      if (!currentId || !portfolios.value.find(p => p.id === currentId)) {
          selectedPortfolio.value = portfolios.value[0];
      }
    }

    // Initial calculation to ensure fields are populated
    portfolios.value.forEach(updatePortfolioValues);
    updateCoinPrices();
  }

  export function usePortfolios() {
    watch(
      portfolios,
      () => {
        savePortfoliosToStorage();
      },
      { deep: true }
    );

    onMounted(() => {
      if (portfolios.value.length === 0) {
          initializePortfolios();
      }
      if (priceUpdateInterval) clearInterval(priceUpdateInterval);
      priceUpdateInterval = setInterval(updateCoinPrices, UPDATE_INTERVAL);
    });

    const aggregatedPortfolio = computed(() => {
      const allCoins = {};
      let totalPortfolioValue = 0;
      let totalPortfolioCost = 0;
      let totalPortfolioChange = 0;

      portfolios.value.forEach(portfolio => {
        portfolio.coins.forEach(coin => {
           if (!allCoins[coin.symbol]) {
             allCoins[coin.symbol] = { 
               ...coin, 
               balance: 0, 
               totalCost: 0, 
               value: 0 
             };
           }
           
           // Accumulate balance and cost
           allCoins[coin.symbol].balance += coin.balance;
           allCoins[coin.symbol].totalCost += (coin.balance * (coin.buyPrice || coin.price));
           allCoins[coin.symbol].value += coin.value;
           
           // PnL calculated later
        });
      });

      const coins = Object.values(allCoins).map(coin => {
        // Calculate weighted avg buy price
        const buyPrice = coin.balance > 0 ? coin.totalCost / coin.balance : 0;
        const pnl = coin.value - coin.totalCost;
        const pnlPercentage = coin.totalCost > 0 ? (pnl / coin.totalCost) * 100 : 0;
        
        return {
          ...coin,
          buyPrice,
          pnl,
          pnlPercentage
        };
      });

      // Calculate portfolio totals from coins
      coins.forEach(coin => {
         totalPortfolioValue += coin.value;
         totalPortfolioCost += coin.totalCost;
         totalPortfolioChange += (coin.value * coin.change24h) / 100;
      });
      
      coins.forEach(coin => {
         coin.allocation = totalPortfolioValue > 0 ? (coin.value / totalPortfolioValue) * 100 : 0;
      });
      
      coins.sort((a,b) => b.value - a.value);

      return {
         id: 'overview',
         name: 'Genel Bakış',
         value: totalPortfolioValue,
         totalCost: totalPortfolioCost,
         change24h: totalPortfolioChange,
         totalPnl: totalPortfolioValue - totalPortfolioCost,
         totalPnlPercentage: totalPortfolioCost > 0 ? ((totalPortfolioValue - totalPortfolioCost) / totalPortfolioCost) * 100 : 0,
         coins: coins,
         isOverview: true // Flag to identify
      };
    });

    const totalValue = computed(() => {
      return portfolios.value.reduce((sum, portfolio) => sum + portfolio.value, 0);
    });

    const totalChange24h = computed(() => {
      return portfolios.value.reduce((sum, portfolio) => sum + portfolio.change24h, 0);
    });

    function selectPortfolio(portfolio) {
      if (portfolio === 'overview') {
        selectedPortfolio.value = aggregatedPortfolio.value;
      } else {
        selectedPortfolio.value = portfolio;
      }
    }

    async function addCoin(portfolio, coin) {
      const existingCoin = portfolio.coins.find(c => c.symbol === coin.symbol);
      
      const newBalance = parseFloat(coin.balance);
      const newPrice = parseFloat(coin.buyPrice || coin.price);
      const newDate = coin.date || new Date().toISOString().split('T')[0];
      
      const newTransaction = {
        amount: newBalance,
        price: newPrice,
        date: newDate
      };

      if (existingCoin) {
        const oldCost = existingCoin.balance * (existingCoin.buyPrice || existingCoin.price);
        const newCost = newBalance * newPrice;
        const totalNewBalance = existingCoin.balance + newBalance;
        
        existingCoin.buyPrice = (oldCost + newCost) / totalNewBalance;
        existingCoin.balance = totalNewBalance;
        
        if (!existingCoin.transactions) existingCoin.transactions = [];
        existingCoin.transactions.push(newTransaction);
        
      } else {
        portfolio.coins.push({
          ...coin,
          balance: newBalance, // Ensure number
          buyPrice: newPrice,
          transactions: [ newTransaction ]
        });
      }
      
      updatePortfolioValues(portfolio);
      savePortfoliosToStorage();
      await updateCoinPrices();
    }

    function removeCoin(portfolio, coinSymbol) {
      portfolio.coins = portfolio.coins.filter(c => c.symbol !== coinSymbol);
      updatePortfolioValues(portfolio);
      savePortfoliosToStorage();
    }

    function updateCoinBalance(portfolio, coinSymbol, newBalance, newBuyPrice) {
      const coin = portfolio.coins.find(c => c.symbol === coinSymbol);
      if (coin) {
        coin.balance = parseFloat(newBalance);
        if (newBuyPrice !== undefined) {
             coin.buyPrice = parseFloat(newBuyPrice);
        }
        updatePortfolioValues(portfolio);
        savePortfoliosToStorage();
      }
    }

    function resetPortfolios() {
      localStorage.removeItem(STORAGE_KEY);
      portfolios.value = getDefaultPortfolios();
      if (portfolios.value.length > 0) {
         selectedPortfolio.value = portfolios.value[0];
      } else {
         selectedPortfolio.value = null;
      }
      // Re-populate helper fields
      portfolios.value.forEach(updatePortfolioValues);
      
      savePortfoliosToStorage();
      updateCoinPrices();
    }

    watch(aggregatedPortfolio, (newVal) => {
      if (selectedPortfolio.value?.id === 'overview') {
        selectedPortfolio.value = newVal;
      }
    });

    function addPortfolio(exchange) {
      const newPortfolio = {
        id: Date.now(),
        name: exchange.name,
        type: 'exchange',
        icon: exchange.icon, // Store the URL
        coins: [],
        value: 0,
        change24h: 0,
        totalCost: 0,
        totalPnl: 0,
        totalPnlPercentage: 0
      };
      
      portfolios.value.push(newPortfolio);
      selectedPortfolio.value = newPortfolio;
      savePortfoliosToStorage();
    }

    function deletePortfolio(id) {
      const index = portfolios.value.findIndex(p => p.id === id);
      if (index === -1) return;

      const wasSelected = selectedPortfolio.value?.id === id;
      
      portfolios.value.splice(index, 1);
      
      if (wasSelected) {
        if (portfolios.value.length > 0) {
          selectedPortfolio.value = portfolios.value[0];
        } else {
          selectedPortfolio.value = null;
        }
      }
      savePortfoliosToStorage();
    }


    async function getPortfolioHistory(portfolio, period = '7d') {
      if (!portfolio || !portfolio.coins.length) return { labels: [], data: [] };

      // 1. Determine timeline
      const now = Math.floor(Date.now() / 1000); // seconds
      let from = now - (7 * 24 * 60 * 60); // Default 7d

      // Calculate `from` based on period
      if (period === '24h') from = now - (24 * 60 * 60);
      else if (period === '30d') from = now - (30 * 24 * 60 * 60);
      else if (period === '90d') from = now - (90 * 24 * 60 * 60);
      else if (period === 'all') {
        const earliestTx = portfolio.coins.reduce((min, c) => {
           if (!c.transactions) return min;
           const txMin = c.transactions.reduce((m, t) => {
             const tTime = new Date(t.date).getTime() / 1000;
             return tTime < m ? tTime : m;
           }, min);
           return txMin < min ? txMin : min;
        }, now);
        
        // If earliest tx is "now" (no history found), default to 1 year or 1 month
        if (earliestTx === now) from = now - (30 * 24 * 60 * 60); 
        else from = earliestTx;
      }
      
      from -= 3600; // Buffer

      // 2. Fetch History
      const coinHistories = {};
      const uniqueCoinIds = [...new Set(portfolio.coins.map(c => c.coingeckoId))].filter(id => id);

      // Log for debugging
      console.log(`Fetching history for period: ${period}, from: ${new Date(from * 1000).toISOString()} to ${new Date(now * 1000).toISOString()}`);

      try {
        const promises = uniqueCoinIds.map(async (id) => {
           const cacheKey = `${id}_${period}`;
           if (historyCache.has(cacheKey)) {
             return { id, prices: historyCache.get(cacheKey) };
           }

           const fromTs = Math.floor(from);
           const toTs = Math.floor(now);
           const url = `/api/coingecko/coins/${id}/market_chart/range?vs_currency=usd&from=${fromTs}&to=${toTs}`;
           
           // Retry logic (3 attempts)
           for (let attempt = 0; attempt < 3; attempt++) {
             try {
                // Console log for debugging
                if (attempt === 0) console.log(`Fetching history: ${url}`);
                
                const res = await fetch(url, { 
                  headers: { 'Accept': 'application/json' } 
                });
                
                // Handle Rate Limiting
                if (res.status === 429) {
                  console.warn(`Rate limit hit for ${id}, retrying...`);
                  await new Promise(r => setTimeout(r, 1500 * (attempt + 1))); // Incremental backoff
                  continue; 
                }
                
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                
                const data = await res.json();
                
                if (!data.prices || !Array.isArray(data.prices)) {
                   throw new Error("Invalid price data format");
                }

                historyCache.set(cacheKey, data.prices);
                return { id, prices: data.prices };
             } catch (e) {
                console.error(`Fetch error ${id} (Attempt ${attempt+1}):`, e);
                if (attempt === 2) return null; 
                await new Promise(r => setTimeout(r, 1000));
             }
           }
           return null;
        });

        const results = await Promise.all(promises);
        results.forEach(r => {
          if (r) coinHistories[r.id] = r.prices;
        });

      } catch (e) {
        console.error("Error fetching history", e);
      }

      // 3. Aggregate
      // Use time points
      const timePoints = [];
      const duration = now - from;
      const steps = 50; 
      const stepSize = duration / steps;
      
      for(let i = 0; i <= steps; i++) {
        timePoints.push((from + (i * stepSize)) * 1000); // milliseconds for interpolation
      }

      const chartData = timePoints.map(t => {
         let totalVal = 0;
         
         portfolio.coins.forEach(coin => {
            // Price at time t
            let price = coin.price; // Default to current
            
            if (coin.coingeckoId && coinHistories[coin.coingeckoId]) {
               const prices = coinHistories[coin.coingeckoId];
               if (prices.length > 0) {
                  // Find closest price
                  const closest = prices.reduce((prev, curr) => {
                    return (Math.abs(curr[0] - t) < Math.abs(prev[0] - t) ? curr : prev);
                  });
                  price = closest[1];
               }
            }

            // Balance at time t
            let balance = 0;
            if (coin.transactions && coin.transactions.length > 0) {
               coin.transactions.forEach(tx => {
                 // Check date
                 // t is current point in loop (ms). tx.date is YYYY-MM-DD.
                 // Parse tx.date to ms. Note: "2025-01-01" parses to UTC midnight.
                 // t is driven by `now` (local -> epoch).
                 // Comparison should be fine.
                 const txTime = new Date(tx.date).getTime();
                 if (txTime <= t) {
                   balance += parseFloat(tx.amount);
                 }
               });
            } else {
               // Fallback: if no transactions, assume current balance was held for entire period?
               // Or at least since 'from' if it's recent?
               // User feedback: "1 ocak added". If existing coin (no tx recorded yet), assume balance exists.
               balance = parseFloat(coin.balance);
            }
            
            totalVal += (price * balance);
         });
         return totalVal;
      });

      // Calculate period P&L
      // Find first non-zero value for start (handles buffer time before first transaction)
      let periodStartValue = 0;
      for (let i = 0; i < chartData.length; i++) {
        if (chartData[i] > 0) {
          periodStartValue = chartData[i];
          break;
        }
      }
      const periodEndValue = chartData.length > 0 ? chartData[chartData.length - 1] : 0;
      const periodPnL = periodEndValue - periodStartValue;
      const periodPnLPercentage = periodStartValue > 0 ? (periodPnL / periodStartValue) * 100 : 0;

      return {
        labels: timePoints.map(t => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        data: chartData,
        periodStartValue,
        periodEndValue,
        periodPnL,
        periodPnLPercentage
      };
    }

    return {
      portfolios,
      selectedPortfolio,
      totalValue,
      totalChange24h,
      selectPortfolio,
      addCoin,
      removeCoin,
      updateCoinBalance,
      updatePortfolioValues,
      resetPortfolios,
      updateCoinPrices,
      addPortfolio,
      deletePortfolio,
      getPortfolioHistory
    };
  }
