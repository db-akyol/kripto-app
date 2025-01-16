import { ref, onMounted } from "vue";

const coins = ref([]);
const isLoading = ref(false);
const error = ref(null);

export function useCoins() {
  async function fetchCoins() {
    isLoading.value = true;
    error.value = null;
    coins.value = []; // Önceki verileri temizle

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?` +
          new URLSearchParams({
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: "50", // Sadece ilk 50 coin
            page: "1",
            sparkline: "false",
            locale: "tr",
          })
      );

      if (!response.ok) {
        throw new Error(`Coin verileri alınamadı (${response.status})`);
      }

      const data = await response.json();

      // Verileri işle
      coins.value = data.map(coin => ({
        id: coin.id,
        coingeckoId: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        icon: coin.image,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
      }));
    } catch (e) {
      error.value = "Coin verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
      console.error("Coin verileri çekilirken hata oluştu:", e);
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(() => {
    fetchCoins();
  });

  return {
    coins,
    isLoading,
    error,
    fetchCoins,
  };
}
