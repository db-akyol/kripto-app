<!-- Kenar çubuğu bileşeni -->
<template>
  <aside class="w-72 bg-gray-800 p-4 rounded-lg">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Portföylerim</h2>
      <button
        @click="handleReset"
        class="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
        title="Portföyleri Sıfırla"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
    <div class="space-y-2">
      <button
        v-for="portfolio in portfolios"
        :key="portfolio.id"
        @click="handlePortfolioSelect(portfolio)"
        class="w-full flex items-center p-3 rounded-lg transition-colors"
        :class="{
          'bg-gray-700 hover:bg-gray-600': selectedPortfolio?.id === portfolio.id,
          'hover:bg-gray-700': selectedPortfolio?.id !== portfolio.id,
        }"
      >
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3" :class="portfolio.iconBg">
          {{ portfolio.icon }}
        </div>
        <div class="flex-1">
          <div class="font-medium">{{ portfolio.name }}</div>
          <div class="text-sm text-gray-400">
            ${{ formatNumber(portfolio.value) }}
            <span
              :class="{
                'text-green-400': portfolio.change24h > 0,
                'text-red-400': portfolio.change24h < 0,
              }"
            >
              {{ portfolio.change24h > 0 ? "+" : "" }}{{ formatNumber(portfolio.change24h) }}%
            </span>
          </div>
        </div>
      </button>

      <button class="w-full mt-4 p-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Yeni Portföy
      </button>
    </div>
  </aside>
</template>

<script setup>
import { usePortfolios } from "../composables/usePortfolios";
import { onMounted } from "vue";

const { portfolios, selectedPortfolio, selectPortfolio, resetPortfolios } = usePortfolios();

function handlePortfolioSelect(portfolio) {
  selectPortfolio(portfolio);
}

function handleReset() {
  resetPortfolios();
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
