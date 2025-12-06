<template>
  <div class="flex flex-col lg:flex-row gap-6">
    <!-- Sidebar -->
    <div class="w-full lg:w-[300px] flex-shrink-0">
      <PortfolioSidebar />
    </div>

    <!-- Main Content -->
    <div class="flex-1 min-w-0 space-y-6">
      <!-- Top Section: Stats & Charts -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <!-- History Chart (Wider - Takes 2 columns) -->
        <div class="xl:col-span-2 bg-[#0d1421] rounded-2xl p-6 border border-gray-800">
          <div class="flex justify-between items-start mb-6">
            <div>
              <div class="text-gray-400 text-sm mb-1">Total Balance</div>
              <div class="text-3xl font-bold text-white mb-2">
                ${{ formatNumber(selectedPortfolio?.value || 0) }}
              </div>
              <div class="inline-flex items-center px-2 py-1 rounded bg-opacity-20 text-sm font-medium"
                :class="(selectedPortfolio?.change24h || 0) >= 0 ? 'bg-green-500 text-green-400' : 'bg-red-500 text-red-400'">
                <span class="mr-1">{{ (selectedPortfolio?.change24h || 0) >= 0 ? '▲' : '▼' }}</span>
                {{ formatNumber(Math.abs(selectedPortfolio?.change24h || 0)) }}% (24h)
              </div>
            </div>
            
            <!-- Timeframe toggles (Visual only for now) -->
            <div class="flex bg-gray-800 rounded-lg p-1">
              <button class="px-3 py-1 text-xs font-medium rounded text-gray-400 hover:text-white">24h</button>
              <button class="px-3 py-1 text-xs font-medium rounded bg-gray-700 text-white shadow">7d</button>
              <button class="px-3 py-1 text-xs font-medium rounded text-gray-400 hover:text-white">30d</button>
              <button class="px-3 py-1 text-xs font-medium rounded text-gray-400 hover:text-white">All</button>
            </div>
          </div>
          
          <div class="h-[300px] w-full">
            <canvas ref="historyChartCanvas"></canvas>
          </div>
        </div>

        <!-- Allocation Chart (Takes 1 column) -->
        <div class="bg-[#0d1421] rounded-2xl p-6 border border-gray-800 flex flex-col">
          <h3 class="text-lg font-bold text-white mb-6">Allocation</h3>
          <div class="flex-1 min-h-[250px] relative flex items-center justify-center">
            <canvas ref="allocationChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Holdings Table -->
      <HoldingsTable v-if="selectedPortfolio" />
    </div>

    <!-- Modals -->
    <AddCoinModal :is-open="showAddCoinModal" @close="showAddCoinModal = false" />
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted, computed } from "vue";
import Chart from "chart.js/auto";
import { usePortfolios } from "../composables/usePortfolios";
import AddCoinModal from "../components/AddCoinModal.vue";
import HoldingsTable from "../components/HoldingsTable.vue";
import PortfolioSidebar from "../components/PortfolioSidebar.vue";

const { portfolios, selectedPortfolio } = usePortfolios();
const historyChartCanvas = ref(null);
const allocationChartCanvas = ref(null);
let historyChart = null;
let allocationChart = null;
const showAddCoinModal = ref(false);

const totalPortfolioValue = computed(() => {
  return portfolios.value.reduce((sum, portfolio) => sum + portfolio.value, 0);
});

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Chart Configuration
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
};

async function createCharts() {
  await nextTick();

  if (historyChart) historyChart.destroy();
  if (allocationChart) allocationChart.destroy();

  const historyCtx = historyChartCanvas.value?.getContext("2d");
  if (historyCtx) {
    const gradient = historyCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

    historyChart = new Chart(historyCtx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // Placeholder labels
        datasets: [{
          data: generateHistoryData(),
          borderColor: "#3b82f6",
          backgroundColor: gradient,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
        }],
      },
      options: {
        ...commonOptions,
        scales: {
          x: { display: false },
          y: {
            display: true,
            position: 'right',
            grid: { color: '#1f2937' },
            ticks: { color: '#9ca3af', callback: (val) => '$' + val }
          }
        },
        interaction: { mode: 'index', intersect: false },
      },
    });
  }

  const allocationCtx = allocationChartCanvas.value?.getContext("2d");
  if (allocationCtx && selectedPortfolio.value) {
    // Sort coins by value for better allocation chart
    const sortedCoins = [...selectedPortfolio.value.coins].sort((a, b) => b.value - a.value);
    
    allocationChart = new Chart(allocationCtx, {
      type: "doughnut",
      data: {
        labels: sortedCoins.map(coin => coin.name),
        datasets: [{
          data: sortedCoins.map(coin => coin.allocation),
          backgroundColor: [
            "#3b82f6", "#10b981", "#f59e0b", "#ef4444", 
            "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6",
            "#f472b6", "#fb923c"
          ],
          borderWidth: 0,
          hoverOffset: 10
        }],
      },
      options: {
        ...commonOptions,
        cutout: '80%',
        plugins: {
          legend: { 
            display: true, 
            position: 'right',
            labels: { color: '#e5e7eb', usePointStyle: true, pointStyle: 'circle' }
          }
        }
      },
    });
  }
}

function generateHistoryData() {
  if (!selectedPortfolio.value) return [];
  const currentValue = selectedPortfolio.value.value;
  // Generate a slightly more realistic looking fake curve ending at current value
  return Array(7).fill(0).map((_, i) => {
      const noise = (Math.random() - 0.5) * currentValue * 0.1;
      return i === 6 ? currentValue : currentValue * (0.9 + Math.random() * 0.2); 
  });
}

watch(selectedPortfolio, () => {
  nextTick(createCharts);
});

onMounted(() => {
  if (selectedPortfolio.value) createCharts();
});

onUnmounted(() => {
  if (historyChart) historyChart.destroy();
  if (allocationChart) allocationChart.destroy();
});
</script>
