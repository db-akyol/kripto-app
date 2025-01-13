<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <header class="bg-gray-800 border-b border-gray-700">
      <div class="container mx-auto px-8 py-6">
        <nav class="flex items-center justify-between">
          <div class="text-2xl font-bold">DenoWallet</div>
          <div class="flex space-x-8">
            <a href="#" class="text-lg hover:text-gray-300">Kripto Paralar</a>
            <a href="#" class="text-lg hover:text-gray-300">Borsalar</a>
            <a href="#" class="text-lg hover:text-gray-300">NFT</a>
            <a href="#" class="text-lg hover:text-gray-300">Portföy</a>
            <a href="#" class="text-lg hover:text-gray-300">Watchlist</a>
          </div>
        </nav>
      </div>
    </header>

    <main class="container mx-auto px-8 py-8">
      <div class="flex gap-8">
        <div class="w-1/4">
          <!-- Overview -->
          <div class="bg-gray-800 rounded-xl p-6 mb-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold">Overview</h2>
                <div class="text-2xl font-bold mt-1">${{ formatNumber(totalPortfolioValue) }}</div>
              </div>
            </div>
          </div>

          <!-- Portföylerim -->
          <div class="bg-gray-800 rounded-xl p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold">Portföylerim</h2>
              <button
                @click="resetPortfolios"
                class="p-3 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700 transition-colors"
                title="Portföyleri Sıfırla"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div class="space-y-3">
              <button
                v-for="portfolio in portfolios"
                :key="portfolio.id"
                @click="selectedPortfolio = portfolio"
                class="w-full flex items-center justify-between p-4 rounded-xl transition-colors"
                :class="selectedPortfolio?.id === portfolio.id ? 'bg-blue-600' : 'hover:bg-gray-700'"
              >
                <div class="flex items-center">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4" :class="portfolio.iconBg">
                    {{ portfolio.icon }}
                  </div>
                  <div class="text-left">
                    <div class="text-lg font-medium">{{ portfolio.name }}</div>
                    <div class="text-base text-gray-400">${{ formatNumber(portfolio.value) }}</div>
                  </div>
                </div>
                <div class="text-lg" :class="portfolio.change24h >= 0 ? 'text-green-400' : 'text-red-400'">
                  {{ formatNumber(portfolio.change24h) }}%
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1">
          <!-- Ana Panel -->
          <div class="bg-gray-800 rounded-xl p-8">
            <div class="flex justify-between items-center mb-8">
              <div>
                <h2 class="text-2xl font-bold mb-2">Toplam Değer</h2>
                <div class="text-4xl font-bold">${{ formatNumber(selectedPortfolio?.value || 0) }}</div>
                <div class="text-xl mt-2" :class="(selectedPortfolio?.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'">
                  {{ formatNumber(selectedPortfolio?.change24h || 0) }}%
                </div>
              </div>
              <button @click="showAddCoinModal = true" class="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">Coin Ekle</button>
            </div>

            <div class="grid grid-cols-2 gap-8">
              <!-- Portföy değer geçmişi -->
              <div class="bg-gray-700/50 rounded-xl p-6">
                <h3 class="text-xl font-bold mb-6">Portföy Değer Geçmişi</h3>
                <div class="h-[250px]">
                  <canvas ref="historyChartCanvas"></canvas>
                </div>
              </div>

              <!-- Varlık dağılımı -->
              <div class="bg-gray-700/50 rounded-xl p-6">
                <h3 class="text-xl font-bold mb-6">Varlık Dağılımı</h3>
                <div class="h-[250px]">
                  <canvas ref="allocationChartCanvas"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- Seçili Portföy Tablosu -->
          <div v-if="selectedPortfolio" class="mt-8">
            <div class="bg-gray-800 rounded-xl">
              <div class="p-6 border-b border-gray-700">
                <h2 class="text-xl font-bold">{{ selectedPortfolio.name }}</h2>
              </div>
              <table class="w-full">
                <thead class="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th class="text-left p-4">Coin</th>
                    <th class="text-right p-4">Fiyat</th>
                    <th class="text-right p-4">24s%</th>
                    <th class="text-right p-4">Miktar</th>
                    <th class="text-right p-4">Değer</th>
                    <th class="text-right p-4">Dağılım</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="coin in selectedPortfolio.coins" :key="coin.symbol" class="border-b border-gray-700 hover:bg-gray-700">
                    <td class="p-4">
                      <div class="flex items-center">
                        <img :src="coin.icon" :alt="coin.name" class="w-8 h-8 mr-3" />
                        <div>
                          <div class="font-medium">{{ coin.name }}</div>
                          <div class="text-sm text-gray-400">{{ coin.symbol }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="text-right p-4">${{ formatNumber(coin.price) }}</td>
                    <td class="text-right p-4" :class="coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'">
                      {{ formatNumber(coin.change24h) }}%
                    </td>
                    <td class="text-right p-4">{{ formatNumber(coin.balance) }}</td>
                    <td class="text-right p-4">${{ formatNumber(coin.value) }}</td>
                    <td class="text-right p-4">{{ formatNumber(coin.allocation) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AddCoinModal :is-open="showAddCoinModal" @close="showAddCoinModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onUnmounted, computed } from "vue";
import Chart from "chart.js/auto";
import { usePortfolios } from "./composables/usePortfolios";
import AddCoinModal from "./components/AddCoinModal.vue";

const { portfolios, selectedPortfolio, resetPortfolios } = usePortfolios();
const historyChartCanvas = ref(null);
const allocationChartCanvas = ref(null);
let historyChart = null;
let allocationChart = null;
const showAddCoinModal = ref(false);

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

// Tüm portföylerin toplam değeri
const totalPortfolioValue = computed(() => {
  return portfolios.value.reduce((sum, portfolio) => sum + portfolio.value, 0);
});
</script>

<style>
.bg-dark {
  background-color: rgb(17, 24, 39);
}
</style>
