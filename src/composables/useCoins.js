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
      // 250'şer coinlik 4 sayfa çekeceğiz (toplam 1000 coin)
      const pages = [1, 2, 3, 4];
      const allCoins = await Promise.all(
        pages.map(async page => {
          const response = await fetch(
            `/api/coingecko/coins/markets?` +
              new URLSearchParams({
                vs_currency: "usd",
                order: "market_cap_desc",
                per_page: "250",
                page: page.toString(),
                sparkline: "false",
                locale: "tr",
              })
          );

          if (!response.ok) {
            throw new Error(`Sayfa ${page} için coin verileri alınamadı`);
          }

          return response.json();
        })
      );

      // Tüm sayfalardan gelen verileri birleştir
      coins.value = allCoins.flat().map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        icon: coin.image,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
      }));
    } catch (e) {
      error.value = e.message;
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
