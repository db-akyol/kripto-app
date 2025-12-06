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
      <!-- Genel Bakış (Overview) Button -->
      <button
        v-if="portfolios.length > 0"
        @click="handlePortfolioSelect('overview')"
        class="w-full flex items-center p-4 rounded-xl transition-all duration-200 border group"
        :class="selectedPortfolio?.id === 'overview'
          ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-900/20' 
          : 'bg-gray-800/40 border-transparent hover:bg-gray-800/60 hover:border-gray-600'"
      >
        <div class="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500 text-white font-bold mr-4 shadow-inner shadow-indigo-400/50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <div class="flex-1 text-left">
          <div class="font-bold text-white group-hover:text-indigo-300 transition-colors">Genel Bakış</div>
           <div class="text-xs text-gray-400 group-hover:text-gray-300">
             {{ portfolios.length }} Portföy
           </div>
        </div>
      </button>

      <div class="w-full h-px bg-gray-700/50 my-2" v-if="portfolios.length > 0"></div>

      <div
        v-for="portfolio in portfolios"
        :key="portfolio.id"
        @click="handlePortfolioSelect(portfolio)"
        class="w-full flex items-center p-4 rounded-xl transition-all duration-200 border cursor-pointer relative group"
        :class="selectedPortfolio?.id === portfolio.id 
          ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-900/20' 
          : 'bg-gray-800/40 border-transparent hover:bg-gray-800/60 hover:border-gray-600'"
      >
        <!-- Icon Logic -->
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-inner overflow-hidden flex-shrink-0" 
          :class="(!portfolio.icon || !portfolio.icon.startsWith('http')) ? portfolio.iconBg || 'bg-blue-500' : 'bg-transparent'"
        >
          <img 
            v-if="portfolio.icon && portfolio.icon.startsWith('http')" 
            :src="portfolio.icon" 
            :alt="portfolio.name" 
            class="w-full h-full object-cover"
          />
          <span v-else>{{ portfolio.icon }}</span>
        </div>

        <div class="flex-1 text-left min-w-0">
          <div class="font-medium text-white truncate pr-6">{{ portfolio.name }}</div>
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

        <!-- Delete Button (Visible on Hover) -->
        <button 
          @click="handleDeleteClick(portfolio, $event)"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Portföyü Sil"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <div v-if="portfolios.length === 0" class="text-center py-6 text-gray-500 text-sm">
        Henüz hiç portföyünüz yok.<br>Yeni bir tane oluşturarak başlayın! 👇
      </div>

      <button 
        @click="showAddModal = true"
        class="group w-full mt-4 p-4 rounded-xl border border-dashed border-gray-600 hover:border-blue-400 hover:bg-blue-500/5 transition-all duration-200 flex items-center justify-center text-gray-400 hover:text-blue-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 transition-transform group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Yeni Portföy
      </button>
    </div>

    <!-- Modals -->
    <AddPortfolioModal 
      :is-open="showAddModal" 
      @close="showAddModal = false"
      @add="handleAddPortfolio" 
    />
    <DeleteConfirmModal
      :is-open="showDeleteConfirm"
      type="portfolio"
      :data="portfolioToDelete"
      @close="showDeleteConfirm = false"
      @confirm="confirmDelete"
    />
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePortfolios } from "../composables/usePortfolios";
import AddPortfolioModal from "./AddPortfolioModal.vue";
import DeleteConfirmModal from "./DeleteConfirmModal.vue";

const { portfolios, selectedPortfolio, selectPortfolio, updateCoinPrices, addPortfolio, deletePortfolio } = usePortfolios();
const isRefreshing = ref(false);
const showAddModal = ref(false);
const showDeleteConfirm = ref(false);
const portfolioToDelete = ref(null);

function handlePortfolioSelect(portfolio) {
  selectPortfolio(portfolio);
}

function handleDeleteClick(portfolio, event) {
  event.stopPropagation(); // Prevent selection when clicking delete
  portfolioToDelete.value = portfolio;
  showDeleteConfirm.value = true;
}

function confirmDelete() {
  if (portfolioToDelete.value) {
    deletePortfolio(portfolioToDelete.value.id);
    showDeleteConfirm.value = false;
    portfolioToDelete.value = null;
  }
}

async function handleAddPortfolio(exchange) {
  await addPortfolio(exchange);
  showAddModal.value = false;
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
