<template>
  <div class="flex flex-col lg:flex-row gap-6">
    <!-- Sidebar -->
    <div class="w-full lg:w-[300px] flex-shrink-0">
      <PortfolioSidebar />
    </div>

    <!-- Main Content -->
    <div class="flex-1 min-w-0 space-y-6">
      <div v-if="selectedPortfolio">
        <!-- Top Section: Stats & Charts -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          
          <!-- History Chart (Wider - Takes 2 columns) -->
          <div class="xl:col-span-2 bg-[#0d1421] rounded-2xl p-6 border border-gray-800">
            <div class="flex justify-between items-start mb-6">
              <div>
                <div class="text-gray-400 text-sm mb-1">Total Balance</div>
                <div class="text-3xl font-bold text-white mb-2">
                  ${{ formatNumber(selectedPortfolio?.value || 0) }}
                </div>
                <div class="inline-flex items-center px-2 py-1 rounded bg-opacity-20 text-sm font-medium"
                  :class="periodPnLPercentage >= 0 ? 'bg-green-500 text-green-400' : 'bg-red-500 text-red-400'">
                  <span class="mr-1">{{ periodPnLPercentage >= 0 ? '▲' : '▼' }}</span>
                  {{ formatNumber(Math.abs(periodPnLPercentage)) }}% ({{ selectedPeriod }})
                </div>
              </div>
              
              <!-- Timeframe toggles -->
              <div class="flex bg-gray-800 rounded-lg p-1">
                <button 
                  v-for="period in ['24h', '7d', '30d', '90d', 'all']" 
                  :key="period"
                  @click="selectPeriod(period)"
                  class="px-3 py-1 text-xs font-medium rounded transition-all capitalize"
                  :class="selectedPeriod === period ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'"
                >
                  {{ period }}
                </button>
              </div>
            </div>
            
            <div class="h-[300px] w-full relative">
              <div v-if="isLoadingHistory" class="absolute inset-0 flex items-center justify-center bg-[#0d1421]/80 z-10 rounded-lg backdrop-blur-sm">
                 <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
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
        <HoldingsTable />
      </div>

      <!-- Empty State Welcome -->
      <div v-else class="flex flex-col items-center justify-center h-[500px] text-center p-8 bg-[#0d1421] rounded-2xl border border-gray-800 border-dashed">
        <div class="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
           </svg>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Hoşgeldiniz! 👋</h2>
        <p class="text-gray-400 max-w-md mb-8">
          Kripto varlıklarınızı takip etmek için soldaki menüden <strong>"Yeni Portföy"</strong> butonuna tıklayarak başlayın.
        </p>
      </div>
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

const { portfolios, selectedPortfolio, getPortfolioHistory } = usePortfolios();
const historyChartCanvas = ref(null);
const allocationChartCanvas = ref(null);
let historyChart = null;
let allocationChart = null;
const showAddCoinModal = ref(false);
const selectedPeriod = ref('7d');
const isLoadingHistory = ref(false);
const periodPnL = ref(0);
const periodPnLPercentage = ref(0);

const totalPortfolioValue = computed(() => {
  return portfolios.value.reduce((sum, portfolio) => sum + portfolio.value, 0);
});

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

let debounceTimer = null;
function selectPeriod(period) {
  if (selectedPeriod.value === period) return;
  selectedPeriod.value = period;
  
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
     createCharts();
  }, 500);
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
  
  // Always destroy existing charts first
  if (historyChart) {
    historyChart.destroy();
    historyChart = null;
  }
  if (allocationChart) {
    allocationChart.destroy();
    allocationChart = null;
  }

  // If no portfolio selected, stop here (canvases likely hidden by v-if)
  if (!selectedPortfolio.value) return;

  // History Chart
  const historyCtx = historyChartCanvas.value?.getContext("2d");
  if (historyCtx) {
      isLoadingHistory.value = true;
    const historyData = await getPortfolioHistory(selectedPortfolio.value, selectedPeriod.value);
    isLoadingHistory.value = false;
    
    // Extract chart data and period P&L
    const { labels, data } = historyData;
    periodPnL.value = historyData.periodPnL || 0;
    periodPnLPercentage.value = historyData.periodPnLPercentage || 0;
    
    // Check if component unmounted or canvas gone
    if (!historyChartCanvas.value) return;

    const gradient = historyCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

    historyChart = new Chart(historyCtx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          data: data,
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

  // Allocation Chart
  const allocationCtx = allocationChartCanvas.value?.getContext("2d");
  if (allocationCtx) {
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

watch(selectedPortfolio, () => {
  nextTick(createCharts);
}, { deep: true });

onMounted(() => {
  if (selectedPortfolio.value) createCharts();
});

onUnmounted(() => {
  if (historyChart) historyChart.destroy();
  if (allocationChart) allocationChart.destroy();
});
</script>
