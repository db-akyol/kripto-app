<!-- Coin Ekleme Modal Bileşeni -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Arkaplan overlay -->
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" @click="close"></div>

    <!-- Modal içeriği -->
    <div class="relative bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-[500px] max-h-[90vh] flex flex-col shadow-2xl shadow-blue-900/20 overflow-hidden transform transition-all">
      <!-- Modal başlık -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700/50">
        <h2 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">{{ showCoinSelect ? "Coin Seç" : "İşlem Detayları" }}</h2>
        <button @click="close" class="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Coin seçme ekranı -->
      <div v-if="showCoinSelect" class="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <!-- Arama -->
        <div class="mb-6">
          <div class="relative">
            <span class="absolute left-4 top-3.5 text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Coin ara..."
              class="w-full bg-gray-800/50 border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-gray-500"
            />
          </div>
        </div>

        <!-- Yükleniyor -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
          <span class="text-gray-400">Veriler yükleniyor...</span>
        </div>

        <!-- Hata -->
        <div v-else-if="error" class="text-red-400 text-center py-8 bg-red-500/10 rounded-xl border border-red-500/20">
          {{ error }}
          <button @click="fetchCoins" class="block mx-auto mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors">Tekrar Dene</button>
        </div>

        <!-- Coin listesi -->
        <div v-else class="space-y-2">
          <button
            v-for="coin in filteredCoins"
            :key="coin.id"
            @click="selectCoin(coin)"
            class="w-full flex items-center p-3 rounded-xl hover:bg-gray-800 transition-all border border-transparent hover:border-gray-700 group"
          >
            <img :src="coin.icon" :alt="coin.name" class="w-10 h-10 mr-4 rounded-full" />
            <div class="flex-1 text-left">
              <div class="font-medium text-white group-hover:text-blue-400 transition-colors">{{ coin.name }}</div>
              <div class="text-sm text-gray-500 group-hover:text-gray-400">{{ coin.symbol }}</div>
            </div>
            <div class="text-right">
              <div class="font-medium text-white">${{ formatNumber(coin.price) }}</div>
              <div class="text-sm px-2 py-0.5 rounded-md inline-block mt-1" :class="coin.change24h >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'">
                {{ coin.change24h >= 0 ? '+' : '' }}{{ formatNumber(coin.change24h) }}%
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- İşlem detayları ekranı -->
      <div v-else class="flex flex-col flex-1 overflow-hidden">
        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <!-- Seçilen coin -->
          <div class="flex items-center justify-between mb-8 p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
            <div class="flex items-center">
              <img :src="selectedCoin.icon" :alt="selectedCoin.name" class="w-12 h-12 mr-4 rounded-full shadow-lg" />
              <div>
                <div class="font-bold text-lg text-white">{{ selectedCoin.name }}</div>
                <div class="text-sm text-gray-400">{{ selectedCoin.symbol }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-medium text-xl text-white">${{ formatNumber(selectedCoin.price) }}</div>
              <div class="text-sm font-medium" :class="selectedCoin.change24h >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ selectedCoin.change24h >= 0 ? '+' : '' }}{{ formatNumber(selectedCoin.change24h) }}%
              </div>
            </div>
          </div>

          <!-- İşlem türü -->
          <div class="grid grid-cols-3 gap-3 mb-6 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50">
            <button
              v-for="type in ['Al', 'Sat', 'Transfer']"
              :key="type"
              @click="transactionType = type"
              class="py-2.5 rounded-lg text-sm font-medium transition-all"
              :class="transactionType === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
            >
              {{ type }}
            </button>
          </div>

          <!-- Miktar ve fiyat -->
          <div class="space-y-5 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2 ml-1">Miktar</label>
              <div class="relative">
                 <input
                  type="number"
                  v-model="quantity"
                  placeholder="0.00"
                  class="w-full bg-gray-800/50 border border-gray-700 text-white pl-4 pr-16 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono"
                />
                <span class="absolute right-4 top-3.5 text-gray-500 font-medium">{{ selectedCoin.symbol }}</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2 ml-1">Birim Fiyat</label>
              <div class="relative">
                <span class="absolute left-4 top-3.5 text-gray-500">$</span>
                <input
                  type="number"
                  v-model="price"
                  :placeholder="selectedCoin.price.toFixed(4)"
                  class="w-full bg-gray-800/50 border border-gray-700 text-white pl-8 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Tarih, ücret ve notlar -->
          <div class="grid grid-cols-3 gap-3 mb-8">
            <button class="flex flex-col items-center justify-center gap-1 bg-gray-800/50 border border-gray-700/30 py-3 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-blue-400 mb-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs text-gray-400">{{ formatDate(date).split(' ')[0] }}</span>
            </button>
            <button class="flex flex-col items-center justify-center gap-1 bg-gray-800/50 border border-gray-700/30 py-3 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-purple-400 mb-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs text-gray-400">Ücret</span>
            </button>
            <button class="flex flex-col items-center justify-center gap-1 bg-gray-800/50 border border-gray-700/30 py-3 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-green-400 mb-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs text-gray-400">Not</span>
            </button>
          </div>

          <!-- Toplam -->
          <div class="mb-6 p-4 bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl border border-gray-700/50">
            <div class="text-sm text-gray-400 mb-1">Toplam Değer</div>
            <div class="text-2xl font-bold text-white tracking-tight">${{ formatNumber(quantity * price) }}</div>
          </div>
        </div>

        <!-- İşlem ekle butonu -->
        <div class="p-6 border-t border-gray-700/50 bg-gray-900/50">
          <button
            @click="addTransaction"
            class="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl text-lg font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.99]"
          >
            İşlem Ekle
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePortfolios } from "../composables/usePortfolios";
import { useCoins } from "../composables/useCoins";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close"]);

const { selectedPortfolio, addCoin } = usePortfolios();
const { coins, isLoading, error, fetchCoins } = useCoins();

// State
const showCoinSelect = ref(true);
const searchQuery = ref("");
const selectedCoin = ref(null);
const transactionType = ref("Al");
const quantity = ref(0);
const price = ref(0);
const date = ref(new Date());

// Filtrelenmiş coinler
const filteredCoins = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return coins.value.filter(coin => coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query));
});

// Metodlar
function close() {
  emit("close");
  setTimeout(() => {
     resetForm();
  }, 300); // Wait for transition
}

function selectCoin(coin) {
  selectedCoin.value = coin;
  price.value = coin.price;
  showCoinSelect.value = false;
}

function addTransaction() {
  if (transactionType.value === "Al") {
    addCoin(selectedPortfolio.value, {
      name: selectedCoin.value.name,
      symbol: selectedCoin.value.symbol,
      icon: selectedCoin.value.icon,
      coingeckoId: selectedCoin.value.coingeckoId,
      price: price.value,
      balance: quantity.value,
      value: quantity.value * price.value,
      change1h: 0,
      change24h: selectedCoin.value.change24h,
      change7d: 0,
    });
  }
  emit("close"); // Close immediately
  setTimeout(() => {
     resetForm();
  }, 300);
}

function resetForm() {
  showCoinSelect.value = true;
  searchQuery.value = "";
  selectedCoin.value = null;
  transactionType.value = "Al";
  quantity.value = 0;
  price.value = 0;
  date.value = new Date();
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5); 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5); 
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.8); 
}
</style>
