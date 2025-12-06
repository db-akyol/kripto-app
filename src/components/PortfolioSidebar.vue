<!-- Kenar çubuğu bileşeni -->
<template>
  <aside class="w-full lg:w-80 bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 p-6 rounded-2xl h-fit">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Portföylerim</h2>
      <button
        @click="handleRefresh"
        class="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200"
        :class="{ 'animate-pulse text-blue-400': isRefreshing }"
        title="Fiyatları Yenile"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          :class="{ 'animate-spin': isRefreshing }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
    
    <div class="space-y-3">
      <button
        v-for="portfolio in portfolios"
        :key="portfolio.id"
        @click="handlePortfolioSelect(portfolio)"
        class="w-full flex items-center p-4 rounded-xl transition-all duration-200 border"
        :class="selectedPortfolio?.id === portfolio.id 
          ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-900/20' 
          : 'bg-gray-800/40 border-transparent hover:bg-gray-800/60 hover:border-gray-600'"
      >
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-inner" :class="portfolio.iconBg">
          {{ portfolio.icon }}
        </div>
        <div class="flex-1 text-left">
          <div class="font-medium text-white">{{ portfolio.name }}</div>
          <div class="text-sm flex items-center gap-2">
            <span class="text-gray-300">${{ formatNumber(portfolio.value) }}</span>
            <span
              class="text-xs px-1.5 py-0.5 rounded"
              :class="portfolio.change24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
            >
              {{ portfolio.change24h > 0 ? "+" : "" }}{{ formatNumber(portfolio.change24h) }}%
            </span>
          </div>
        </div>
      </button>

      <button class="group w-full mt-4 p-4 rounded-xl border border-dashed border-gray-600 hover:border-blue-400 hover:bg-blue-500/5 transition-all duration-200 flex items-center justify-center text-gray-400 hover:text-blue-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 transition-transform group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Yeni Portföy
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { usePortfolios } from "../composables/usePortfolios";
import { onMounted } from "vue";

const { portfolios, selectedPortfolio, selectPortfolio, updateCoinPrices } = usePortfolios();
const isRefreshing = ref(false);

function handlePortfolioSelect(portfolio) {
  selectPortfolio(portfolio);
}

async function handleRefresh() {
  if (isRefreshing.value) return;
  
  isRefreshing.value = true;
  try {
    await updateCoinPrices();
  } finally {
    setTimeout(() => {
      isRefreshing.value = false;
    }, 500);
  }
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Sayfa yüklendiğinde ilk portföyü seç
onMounted(() => {
  if (portfolios.value.length > 0 && !selectedPortfolio.value) {
    selectPortfolio(portfolios.value[0]);
  }
});
</script>
