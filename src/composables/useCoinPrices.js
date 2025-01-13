import axios from "axios";
import { ref } from "vue";

const API_BASE = "/api/coingecko";
const RETRY_DELAY = 55000; // 55 saniye bekle
const MAX_COINS_PER_REQUEST = 2; // Her seferde en fazla 2 coin
let lastFetchTime = 0;

export function useCoinPrices() {
  const prices = ref({});
  const loading = ref(false);
  const error = ref(null);

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function fetchWithRetry(url, config, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        // API çağrıları arasında en az 55 saniye bekle
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTime;
        if (timeSinceLastFetch < RETRY_DELAY) {
          const waitTime = RETRY_DELAY - timeSinceLastFetch;
          console.log(`API çağrısı için ${waitTime}ms bekleniyor...`);
          await sleep(waitTime);
        }

        const response = await axios.get(url, config);
        lastFetchTime = Date.now();
        return response;
      } catch (err) {
        console.log(`Deneme ${i + 1}/${retries} başarısız:`, err.message);

        if (err.response?.status === 429) {
          const waitTime = RETRY_DELAY * (i + 1); // Her denemede bekleme süresini artır
          console.log(`API limit aşıldı, ${waitTime}ms bekleniyor...`);
          await sleep(waitTime);
          continue;
        }

        if (i === retries - 1) throw err;
        await sleep(RETRY_DELAY);
      }
    }
    throw new Error("Maximum retry attempts reached");
  }

  async function fetchPrices(coins) {
    if (!coins || coins.length === 0) return;

    loading.value = true;
    error.value = null;

    try {
      // Coinleri daha küçük gruplar halinde işle
      const coinGroups = [];
      for (let i = 0; i < coins.length; i += MAX_COINS_PER_REQUEST) {
        coinGroups.push(coins.slice(i, i + MAX_COINS_PER_REQUEST));
      }

      console.log(`${coinGroups.length} grup halinde fiyat çekilecek`);

      const allPrices = {};
      for (const group of coinGroups) {
        const ids = group
          .filter(coin => coin.id)
          .map(coin => coin.id)
          .join(",");

        if (!ids) continue;

        console.log("Fiyat çekiliyor:", group.map(c => c.symbol).join(", "));

        try {
          const response = await fetchWithRetry(`${API_BASE}/simple/price`, {
            params: {
              ids: ids,
              vs_currencies: "usd",
              include_24h_change: true,
            },
          });

          Object.assign(allPrices, response.data);
          console.log("Başarıyla alınan fiyatlar:", Object.keys(response.data).join(", "));
        } catch (err) {
          console.error(`${group.map(c => c.symbol).join(", ")} için fiyat alınamadı:`, err.message);
          continue; // Bir grup başarısız olsa bile diğerlerine devam et
        }
      }

      if (Object.keys(allPrices).length === 0) {
        throw new Error("Hiçbir coin için fiyat alınamadı");
      }

      prices.value = allPrices;
      return allPrices;
    } catch (err) {
      error.value = "Fiyatlar alınırken bir hata oluştu";
      console.error("Fiyat çekme hatası:", {
        message: err.message,
        response: err.response?.data,
      });
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    prices,
    loading,
    error,
    fetchPrices,
  };
}
