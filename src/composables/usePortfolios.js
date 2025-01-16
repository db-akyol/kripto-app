import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { getDefaultPortfolios } from "./useDefaultPortfolios";

const STORAGE_KEY = "crypto-portfolios";
const UPDATE_INTERVAL = 60000; // 1 dakika

// Singleton state
const portfolios = ref([]);
const selectedPortfolio = ref(null);
let priceUpdateInterval = null;

function loadPortfoliosFromStorage() {
  try {
    const storedPortfolios = localStorage.getItem(STORAGE_KEY);
    return storedPortfolios ? JSON.parse(storedPortfolios) : getDefaultPortfolios();
  } catch (error) {
    console.error("Portföyler yüklenirken hata oluştu:", error);
    return getDefaultPortfolios();
  }
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

  // Yüzdelik dağılımları güncelle
  const totalValue = portfolio.value;
  portfolio.coins.forEach(coin => {
    coin.allocation = (coin.value / totalValue) * 100;
  });
}

async function updateCoinPrices() {
  try {
    // Tüm portföylerdeki benzersiz coinleri bul
    const uniqueCoins = new Set();
    portfolios.value.forEach(portfolio => {
      portfolio.coins.forEach(coin => {
        uniqueCoins.add(coin.coingeckoId);
      });
    });

    // CoinGecko'dan fiyatları çek
    const response = await fetch(
      `/api/coingecko/simple/price?` +
        new URLSearchParams({
          ids: Array.from(uniqueCoins).join(","),
          vs_currencies: "usd",
          include_24h_change: "true",
        })
    );

    if (!response.ok) {
      throw new Error(`Fiyat güncellemesi başarısız oldu (${response.status})`);
    }

    const prices = await response.json();

    // Portföylerdeki coin fiyatlarını güncelle
    portfolios.value.forEach(portfolio => {
      portfolio.coins.forEach(coin => {
        const priceData = prices[coin.coingeckoId];
        if (priceData) {
          coin.price = priceData.usd;
          coin.change24h = priceData.usd_24h_change;
          coin.value = coin.balance * coin.price;
        }
      });
      updatePortfolioValues(portfolio);
    });
  } catch (error) {
    console.error("Fiyatlar güncellenirken hata oluştu:", error);
  }
}

// Sayfa yüklendiğinde portföyleri yükle ve fiyat güncellemesini başlat
function initializePortfolios() {
  portfolios.value = loadPortfoliosFromStorage();
  if (portfolios.value.length > 0 && !selectedPortfolio.value) {
    selectedPortfolio.value = portfolios.value[0];
  }

  // İlk fiyat güncellemesini yap
  updateCoinPrices();
}

export function usePortfolios() {
  // Portföylerdeki değişiklikleri izle
  watch(
    portfolios,
    () => {
      savePortfoliosToStorage();
    },
    { deep: true }
  );

  onMounted(() => {
    initializePortfolios();
    // Periyodik güncellemeyi başlat
    priceUpdateInterval = setInterval(updateCoinPrices, UPDATE_INTERVAL);
  });

  // Component unmount olduğunda interval'i temizle
  onUnmounted(() => {
    if (priceUpdateInterval) {
      clearInterval(priceUpdateInterval);
    }
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

  function addCoin(portfolio, coin) {
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
  }

  function removeCoin(portfolio, coinSymbol) {
    portfolio.coins = portfolio.coins.filter(c => c.symbol !== coinSymbol);
    updatePortfolioValues(portfolio);
    savePortfoliosToStorage();
  }

  function resetPortfolios() {
    localStorage.removeItem(STORAGE_KEY);
    initializePortfolios();
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
