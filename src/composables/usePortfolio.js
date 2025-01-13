import { ref, computed } from "vue";

const STORAGE_KEY = "crypto-portfolio-data";

export function usePortfolio() {
  const loadPortfoliosFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("LocalStorage verisi yüklenemedi:", e);
        return getDefaultPortfolios();
      }
    }
    return getDefaultPortfolios();
  };

  const portfolios = ref(loadPortfoliosFromStorage());
  const selectedPortfolio = ref(null);

  const totalValue = computed(() => {
    return portfolios.value.reduce((sum, portfolio) => sum + portfolio.value, 0);
  });

  const totalChange24h = computed(() => {
    return portfolios.value.reduce((sum, portfolio) => sum + portfolio.change24h, 0);
  });

  const savePortfoliosToStorage = () => {
    const portfoliosToSave = portfolios.value.map(portfolio => {
      portfolio.value = portfolio.coins.reduce((sum, coin) => sum + coin.value, 0);
      portfolio.change24h = portfolio.coins.reduce((sum, coin) => sum + (coin.value * coin.change24h) / 100, 0);
      return portfolio;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfoliosToSave));
  };

  const selectPortfolio = portfolio => {
    selectedPortfolio.value = portfolio;
  };

  const addPortfolio = portfolioData => {
    const newId = Math.max(...portfolios.value.map(p => p.id)) + 1;
    portfolios.value.push({
      id: newId,
      coins: [],
      ...portfolioData,
    });
    savePortfoliosToStorage();
  };

  const addCoinToPortfolio = (portfolioId, coinData) => {
    const portfolio = portfolios.value.find(p => p.id === portfolioId);
    if (portfolio) {
      portfolio.coins.push(coinData);
      savePortfoliosToStorage();
    }
  };

  const removeCoinFromPortfolio = (portfolioId, coinSymbol) => {
    const portfolio = portfolios.value.find(p => p.id === portfolioId);
    if (portfolio) {
      portfolio.coins = portfolio.coins.filter(c => c.symbol !== coinSymbol);
      savePortfoliosToStorage();
    }
  };

  return {
    portfolios,
    selectedPortfolio,
    totalValue,
    totalChange24h,
    selectPortfolio,
    addPortfolio,
    addCoinToPortfolio,
    removeCoinFromPortfolio,
    savePortfoliosToStorage,
  };
}
