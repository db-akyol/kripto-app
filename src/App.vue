<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <header class="bg-gray-800 border-b border-gray-700">
      <div class="container mx-auto px-4 py-4">
        <nav class="flex items-center justify-between">
          <div class="text-xl font-bold">Kripto Portföyüm</div>
          <div class="flex space-x-4">
            <a href="#" class="hover:text-gray-300">Kripto Paralar</a>
            <a href="#" class="hover:text-gray-300">Borsalar</a>
            <a href="#" class="hover:text-gray-300">NFT</a>
            <a href="#" class="hover:text-gray-300">Portföy</a>
            <a href="#" class="hover:text-gray-300">Watchlist</a>
          </div>
        </nav>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <div class="flex gap-8">
        <div class="w-1/4">
          <div class="bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">Portföylerim</h2>
              <button
                @click="resetPortfolios"
                class="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700 transition-colors"
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
                @click="selectedPortfolio = portfolio"
                class="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
                :class="selectedPortfolio?.id === portfolio.id ? 'bg-blue-600' : 'hover:bg-gray-700'"
              >
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3" :class="portfolio.iconBg">
                    {{ portfolio.icon }}
                  </div>
                  <div class="text-left">
                    <div class="font-medium">{{ portfolio.name }}</div>
                    <div class="text-sm text-gray-400">${{ formatNumber(portfolio.value) }}</div>
                  </div>
                </div>
                <div class="text-sm" :class="portfolio.change24h >= 0 ? 'text-green-400' : 'text-red-400'">
                  {{ formatNumber(portfolio.change24h) }}%
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 space-y-8">
          <div class="bg-gray-800 rounded-lg p-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <h2 class="text-xl font-bold mb-2">Toplam Değer</h2>
                <div class="text-3xl font-bold">${{ formatNumber(selectedPortfolio?.value || 0) }}</div>
                <div class="text-lg" :class="(selectedPortfolio?.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'">
                  {{ formatNumber(selectedPortfolio?.change24h || 0) }}%
                </div>
              </div>
              <div class="flex justify-end items-center">
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">İşlem Yap</button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="bg-gray-800 rounded-lg p-4">
              <h3 class="text-lg font-bold mb-4">Portföy Değer Geçmişi</h3>
              <div class="h-[400px]">
                <div class="h-[300px]">
                  <canvas ref="historyChartCanvas"></canvas>
                </div>
              </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-4">
              <h3 class="text-lg font-bold mb-4">Varlık Dağılımı</h3>
              <div class="h-[400px]">
                <div class="h-[300px]">
                  <canvas ref="allocationChartCanvas"></canvas>
                </div>
              </div>
            </div>
          </div>

          <HoldingsTable />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onUnmounted } from "vue";
import Chart from "chart.js/auto";
import { usePortfolios } from "./composables/usePortfolios";
import HoldingsTable from "./components/HoldingsTable.vue";

const { portfolios, selectedPortfolio, resetPortfolios } = usePortfolios();
const historyChartCanvas = ref(null);
const allocationChartCanvas = ref(null);
let historyChart = null;
let allocationChart = null;

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

async function createCharts() {
  await nextTick();

  if (historyChart) historyChart.destroy();
  if (allocationChart) allocationChart.destroy();

  const historyCtx = historyChartCanvas.value?.getContext("2d");
  if (historyCtx) {
    historyChart = new Chart(historyCtx, {
      type: "line",
      data: {
        labels: ["1 Hafta", "6 Gün", "5 Gün", "4 Gün", "3 Gün", "2 Gün", "1 Gün", "Bugün"],
        datasets: [
          {
            label: "Portföy Değeri",
            data: generateHistoryData(),
            borderColor: "#3B82F6",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            grid: {
              color: "#374151",
            },
            ticks: {
              callback: value => "$" + value.toLocaleString(),
            },
          },
          x: {
            grid: {
              color: "#374151",
            },
          },
        },
      },
    });
  }

  const allocationCtx = allocationChartCanvas.value?.getContext("2d");
  if (allocationCtx && selectedPortfolio.value) {
    allocationChart = new Chart(allocationCtx, {
      type: "doughnut",
      data: {
        labels: selectedPortfolio.value.coins.map(coin => coin.name),
        datasets: [
          {
            data: selectedPortfolio.value.coins.map(coin => coin.allocation),
            backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              padding: 15,
            },
          },
        },
      },
    });
  }
}

function generateHistoryData() {
  if (!selectedPortfolio.value) return [];

  const currentValue = selectedPortfolio.value.value;
  const volatility = 0.02;

  return Array(8)
    .fill(currentValue)
    .map((value, i) => {
      const daysAgo = 7 - i;
      const dailyChange = (Math.random() - 0.5) * 2 * volatility;
      return value * (1 - dailyChange * daysAgo);
    });
}

watch(selectedPortfolio, () => {
  nextTick(() => {
    createCharts();
  });
});

onMounted(() => {
  if (selectedPortfolio.value) {
    createCharts();
  }
});

onUnmounted(() => {
  if (historyChart) historyChart.destroy();
  if (allocationChart) allocationChart.destroy();
});
</script>

<style>
.bg-dark {
  background-color: rgb(17, 24, 39);
}
</style>
