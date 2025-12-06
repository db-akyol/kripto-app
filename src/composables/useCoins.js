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
      // 1000 coin için 4 sayfayı paralel olarak çekiyoruz.
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

      // Tüm yanıtların başarılı olup olmadığını kontrol et
      const validResponses = await Promise.all(
        responses.map(async (res) => {
           if (!res.ok) return [];
           return res.json();
        })
      );

      // Tüm sayfaların verilerini tek bir dizide birleştir
      const allCoins = validResponses.flat();

      if (allCoins.length === 0) {
         throw new Error("Hiçbir coin verisi alınamadı.");
      }

      // Verileri işle
      coins.value = allCoins.map(coin => ({
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
