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

  portfolio.value = portfolio.coins.reduce((sum, coin) => sum + coin.value, 0);
  portfolio.change24h = portfolio.coins.reduce((sum, coin) => sum + (coin.value * coin.change24h) / 100, 0);

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
             coin.value = coin.balance * coin.price;
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

  const totalValue = computed(() => {
    return portfolios.value.reduce((sum, portfolio) => sum + portfolio.value, 0);
  });

  const totalChange24h = computed(() => {
    return portfolios.value.reduce((sum, portfolio) => sum + portfolio.change24h, 0);
  });

  function selectPortfolio(portfolio) {
    selectedPortfolio.value = portfolio;
  }

  async function addCoin(portfolio, coin) {
    const existingCoin = portfolio.coins.find(c => c.symbol === coin.symbol);
    if (existingCoin) {
      existingCoin.balance += coin.balance;
      existingCoin.value = existingCoin.balance * existingCoin.price;
    } else {
      portfolio.coins.push({
        ...coin,
        value: coin.balance * coin.price,
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

  function resetPortfolios() {
    localStorage.removeItem(STORAGE_KEY);
    portfolios.value = getDefaultPortfolios();
    if (portfolios.value.length > 0) {
       selectedPortfolio.value = portfolios.value[0];
    }
    savePortfoliosToStorage();
    updateCoinPrices();
  }

  return {
    portfolios,
    selectedPortfolio,
    totalValue,
    totalChange24h,
    selectPortfolio,
    addCoin,
    removeCoin,
    updatePortfolioValues,
    resetPortfolios,
    updateCoinPrices,
  };
}
