import { ref, computed, onMounted, watch } from "vue";
import { getDefaultPortfolios } from "./useDefaultPortfolios";

const STORAGE_KEY = "crypto-portfolios";

// Singleton state
const portfolios = ref([]);
const selectedPortfolio = ref(null);

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

// Portföyleri yükle ve ilk portföyü seç
function initializePortfolios() {
  portfolios.value = loadPortfoliosFromStorage();
  if (portfolios.value.length > 0 && !selectedPortfolio.value) {
    selectedPortfolio.value = portfolios.value[0];
  }
}

// Sayfa yüklendiğinde portföyleri yükle
initializePortfolios();

// Portföylerdeki değişiklikleri izle
watch(
  portfolios,
  () => {
    savePortfoliosToStorage();
  },
  { deep: true }
);

export function usePortfolios() {
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
  };
}
