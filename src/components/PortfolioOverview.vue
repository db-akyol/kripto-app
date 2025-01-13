<!-- Portföy genel bakış bileşeni -->
<template>
  <div class="flex-1 p-6" v-if="selectedPortfolio">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Sol panel -->
      <div class="space-y-6">
        <!-- Toplam değer -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-400 mb-2">Toplam Değer</h3>
          <div class="text-3xl font-bold text-white">${{ selectedPortfolio.value.toFixed(2) }}</div>
          <div
            class="mt-2 text-sm"
            :class="{
              'text-green-400': selectedPortfolio.change24h > 0,
              'text-red-400': selectedPortfolio.change24h < 0,
            }"
          >
            {{ selectedPortfolio.change24h > 0 ? "+" : "" }}{{ selectedPortfolio.change24h.toFixed(2) }}%
            <span class="text-gray-400">24s değişim</span>
          </div>
        </div>

        <!-- Portföy geçmişi grafiği -->
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-gray-400">Portföy Geçmişi</h3>
            <div class="flex space-x-2">
              <button
                v-for="period in ['24s', '7g', '30g', '90g', 'Tümü']"
                :key="period"
                class="px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                :class="{
                  'bg-gray-700 text-white': selectedPeriod === period,
                  'text-gray-400': selectedPeriod !== period,
                }"
                @click="selectedPeriod = period"
              >
                {{ period }}
              </button>
            </div>
          </div>
          <div class="h-[300px]">
            <canvas ref="historyChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Sağ panel -->
      <div class="space-y-6">
        <!-- Varlık dağılımı grafiği -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-400 mb-6">Varlık Dağılımı</h3>
          <div class="h-[300px]">
            <canvas ref="allocationChartCanvas"></canvas>
          </div>
        </div>

        <!-- Varlık listesi -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-400 mb-4">Varlıklar</h3>
          <div class="space-y-4">
            <div v-for="coin in selectedPortfolio.coins" :key="coin.symbol" class="flex items-center">
              <img :src="coin.icon" :alt="coin.name" class="w-8 h-8 rounded-full mr-3" />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-white">{{ coin.name }}</div>
                    <div class="text-sm text-gray-400">{{ coin.balance }} {{ coin.symbol }}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-medium text-white">${{ coin.value.toFixed(2) }}</div>
                    <div
                      class="text-sm"
                      :class="{
                        'text-green-400': coin.change24h > 0,
                        'text-red-400': coin.change24h < 0,
                      }"
                    >
                      {{ coin.change24h > 0 ? "+" : "" }}{{ coin.change24h.toFixed(2) }}%
                    </div>
                  </div>
                </div>
                <div class="mt-2 h-1 bg-gray-700 rounded-full">
                  <div class="h-full bg-blue-500 rounded-full" :style="{ width: coin.allocation + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { usePortfolios } from "../composables/usePortfolios";
import Chart from "chart.js/auto";

const { selectedPortfolio } = usePortfolios();
const selectedPeriod = ref("24s");
const historyChartCanvas = ref(null);
const allocationChartCanvas = ref(null);
let historyChart = null;
let allocationChart = null;

// Grafikleri oluştur
onMounted(() => {
  if (selectedPortfolio.value) {
    nextTick(() => {
      createCharts();
    });
  }
});

// Grafikleri temizle
onUnmounted(() => {
  destroyCharts();
});

// Seçili portföy değiştiğinde grafikleri güncelle
watch(
  selectedPortfolio,
  newPortfolio => {
    if (newPortfolio) {
      nextTick(() => {
        destroyCharts();
        createCharts();
      });
    }
  },
  { deep: true }
);

function createCharts() {
  // Portföy geçmişi grafiği
  const historyCtx = historyChartCanvas.value?.getContext("2d");
  if (historyCtx) {
    historyChart = new Chart(historyCtx, {
      type: "line",
      data: {
        labels: ["1g", "2g", "3g", "4g", "5g", "6g", "7g"],
        datasets: [
          {
            label: "Portföy Değeri",
            data: generateHistoryData(selectedPortfolio.value.value),
            borderColor: "rgb(59, 130, 246)",
            tension: 0.4,
            pointRadius: 0,
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
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.5)",
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.5)",
            },
          },
        },
      },
    });
  }

  // Varlık dağılımı grafiği
  const allocationCtx = allocationChartCanvas.value?.getContext("2d");
  if (allocationCtx && selectedPortfolio.value.coins.length > 0) {
    allocationChart = new Chart(allocationCtx, {
      type: "doughnut",
      data: {
        labels: selectedPortfolio.value.coins.map(coin => coin.name),
        datasets: [
          {
            data: selectedPortfolio.value.coins.map(coin => coin.allocation),
            backgroundColor: ["rgb(59, 130, 246)", "rgb(16, 185, 129)", "rgb(245, 158, 11)", "rgb(239, 68, 68)", "rgb(139, 92, 246)"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "right",
            labels: {
              color: "white",
            },
          },
        },
      },
    });
  }
}

function generateHistoryData(currentValue) {
  const volatility = 0.02; // %2 dalgalanma
  return Array.from({ length: 7 }, () => {
    const randomChange = 1 + (Math.random() - 0.5) * volatility;
    return +(currentValue * randomChange).toFixed(2);
  });
}

function destroyCharts() {
  if (historyChart) {
    historyChart.destroy();
    historyChart = null;
  }
  if (allocationChart) {
    allocationChart.destroy();
    allocationChart = null;
  }
}
</script>
