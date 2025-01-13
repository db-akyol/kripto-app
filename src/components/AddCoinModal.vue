<!-- Coin Ekleme Modal Bileşeni -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Arkaplan overlay -->
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="close"></div>

    <!-- Modal içeriği -->
    <div class="relative bg-gray-800 rounded-xl w-[500px] max-h-[90vh] flex flex-col">
      <!-- Modal başlık -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <h2 class="text-xl font-bold">{{ showCoinSelect ? "Coin Seç" : "İşlem Detayları" }}</h2>
        <button @click="close" class="text-gray-400 hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Coin seçme ekranı -->
      <div v-if="showCoinSelect" class="p-6 overflow-y-auto flex-1">
        <!-- Arama -->
        <div class="mb-6">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Coin ara..."
            class="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Yükleniyor -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>

        <!-- Hata -->
        <div v-else-if="error" class="text-red-500 text-center py-8">
          {{ error }}
          <button @click="fetchCoins" class="block mx-auto mt-4 text-blue-500 hover:text-blue-400">Tekrar Dene</button>
        </div>

        <!-- Coin listesi -->
        <div v-else class="space-y-2">
          <button
            v-for="coin in filteredCoins"
            :key="coin.id"
            @click="selectCoin(coin)"
            class="w-full flex items-center p-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <img :src="coin.icon" :alt="coin.name" class="w-8 h-8 mr-4" />
            <div class="flex-1 text-left">
              <div class="font-medium">{{ coin.name }}</div>
              <div class="text-sm text-gray-400">{{ coin.symbol }}</div>
            </div>
            <div class="text-right">
              <div class="font-medium">${{ formatNumber(coin.price) }}</div>
              <div class="text-sm" :class="coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'">{{ formatNumber(coin.change24h) }}%</div>
            </div>
          </button>
        </div>
      </div>

      <!-- İşlem detayları ekranı -->
      <div v-else class="flex flex-col flex-1 overflow-hidden">
        <div class="p-6 overflow-y-auto flex-1">
          <!-- Seçilen coin -->
          <div class="flex items-center justify-between mb-6 p-4 bg-gray-700 rounded-lg">
            <div class="flex items-center">
              <img :src="selectedCoin.icon" :alt="selectedCoin.name" class="w-8 h-8 mr-4" />
              <div>
                <div class="font-medium">{{ selectedCoin.name }}</div>
                <div class="text-sm text-gray-400">{{ selectedCoin.symbol }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-medium">${{ formatNumber(selectedCoin.price) }}</div>
              <div class="text-sm" :class="selectedCoin.change24h >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ formatNumber(selectedCoin.change24h) }}%
              </div>
            </div>
          </div>

          <!-- İşlem türü -->
          <div class="flex gap-2 mb-6">
            <button
              v-for="type in ['Al', 'Sat', 'Transfer']"
              :key="type"
              @click="transactionType = type"
              class="flex-1 py-2 rounded-lg transition-colors"
              :class="transactionType === type ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
            >
              {{ type }}
            </button>
          </div>

          <!-- Miktar ve fiyat -->
          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-sm text-gray-400 mb-2">Miktar</label>
              <input
                type="number"
                v-model="quantity"
                placeholder="0.00"
                class="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">Birim Fiyat</label>
              <div class="relative">
                <span class="absolute left-4 top-3 text-gray-400">$</span>
                <input
                  type="number"
                  v-model="price"
                  :placeholder="selectedCoin.price.toFixed(4)"
                  class="w-full bg-gray-700 text-white pl-8 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Tarih, ücret ve notlar -->
          <div class="flex gap-4 mb-6">
            <button class="flex-1 flex items-center justify-center gap-2 bg-gray-700 px-4 py-3 rounded-lg hover:bg-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ formatDate(date) }}
            </button>
            <button class="flex items-center justify-center gap-2 bg-gray-700 px-4 py-3 rounded-lg hover:bg-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                  clip-rule="evenodd"
                />
              </svg>
              Ücret
            </button>
            <button class="flex items-center justify-center gap-2 bg-gray-700 px-4 py-3 rounded-lg hover:bg-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                  clip-rule="evenodd"
                />
              </svg>
              Not
            </button>
          </div>

          <!-- Toplam -->
          <div class="mb-6 p-4 bg-gray-700 rounded-lg">
            <div class="text-sm text-gray-400">Toplam</div>
            <div class="text-xl font-bold">${{ formatNumber(quantity * price) }}</div>
          </div>
        </div>

        <!-- İşlem ekle butonu -->
        <div class="p-6 border-t border-gray-700">
          <button
            @click="addTransaction"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg text-lg font-medium transition-colors"
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
  resetForm();
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
      price: price.value,
      balance: quantity.value,
      value: quantity.value * price.value,
      change1h: 0,
      change24h: selectedCoin.value.change24h,
      change7d: 0,
    });
  }
  close();
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
