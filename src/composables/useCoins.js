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
      // CoinGecko API'si sayfa başına maksimum 250 coin veriyor.
      // 1000 coin için 4 sayfayı sırayla çekiyoruz.
      const pages = [1, 2, 3, 4];
      
      const responses = await Promise.all(
        pages.map(page => 
          fetch(
            `/api/coingecko/coins/markets?` +
              new URLSearchParams({
                vs_currency: "usd",
                order: "market_cap_desc",
                per_page: "250",
                page: page.toString(),
                sparkline: "false",
                locale: "tr",
              })
          )
        )
      );

      // Sırayı koruyarak yanıtları işle
      const validResponses = [];
      for (let i = 0; i < responses.length; i++) {
        const res = responses[i];
        if (res.ok) {
          const data = await res.json();
          validResponses.push(...data);
        }
      }

      if (validResponses.length === 0) {
         throw new Error("Hiçbir coin verisi alınamadı.");
      }

      // Verileri işle ve market cap'e göre sırala
      coins.value = validResponses
        .map(coin => ({
          id: coin.id,
          coingeckoId: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          icon: coin.image,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h,
          marketCap: coin.market_cap,
        }))
        .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
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
