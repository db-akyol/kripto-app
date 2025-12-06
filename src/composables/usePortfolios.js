import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { getDefaultPortfolios } from "./useDefaultPortfolios";

const STORAGE_KEY = "crypto-portfolios";
const UPDATE_INTERVAL = 30000; // 30 saniye

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

      portfolio.value += coin.value;
      portfolio.totalCost += coin.totalCost;
      
      // Weighted 24h change calculation could be improved, but summing value change is simpler
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
      // We are adding a new lot. For simplicity in this app, we will average the cost basis.
      // New Avg Price = ((Old Bal * Old Price) + (New Bal * New Buy Price)) / Total Bal
      
      const newBalance = coin.balance;
      const newCost = coin.balance * (coin.buyPrice || coin.price);

      if (existingCoin) {
        const oldCost = existingCoin.balance * (existingCoin.buyPrice || existingCoin.price);
        const totalNewBalance = existingCoin.balance + newBalance;
        
        existingCoin.buyPrice = (oldCost + newCost) / totalNewBalance;
        existingCoin.balance = totalNewBalance;
      } else {
        portfolio.coins.push({
          ...coin,
          buyPrice: coin.buyPrice || coin.price, // Ensure buyPrice is set
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
      deletePortfolio
    };
  }
