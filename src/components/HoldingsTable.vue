<!-- Varlıklar tablosu bileşeni -->
<template>
  <div class="bg-[#0d1421] rounded-2xl p-6 border border-gray-800">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-white">Assets</h2>
      <button 
        v-if="!selectedPortfolio?.isOverview"
        @click="openAddModal"
        class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
      >
        <span>+</span> Add Asset
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="text-left text-gray-400 border-b border-gray-800">
            <th class="pb-4 font-medium pl-2">Name</th>
            <th class="pb-4 font-medium">Price</th>
            <th class="pb-4 font-medium">Avg Buy</th>
            <th class="pb-4 font-medium">24h%</th>
            <th class="pb-4 font-medium">Profit/Loss</th>
            <th class="pb-4 font-medium">Balance</th>
            <th class="pb-4 font-medium">Value</th>
            <th class="pb-4 font-medium text-right pr-2">Actions</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="coin in sortedCoins" :key="coin.symbol" class="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors group">
            <td class="py-4 pl-2">
              <div class="flex items-center">
                <img :src="coin.icon" :alt="coin.name" class="w-8 h-8 mr-3 rounded-full" />
                <div>
                  <div class="font-bold text-white">{{ coin.name }}</div>
                  <div class="text-gray-500 text-xs">{{ coin.symbol }}</div>
                </div>
              </div>
            </td>
            <td class="text-gray-200">${{ formatNumber(coin.price) }}</td>
            <td class="text-gray-400">${{ formatNumber(coin.buyPrice || coin.price) }}</td>
            <td :class="getChangeColor(coin.change24h || 0)">{{ formatNumber(coin.change24h || 0) }}%</td>
            <td>
               <div class="flex flex-col">
                  <span :class="getChangeColor(coin.pnl)">
                     {{ coin.pnl >= 0 ? '+' : '' }}${{ formatNumber(coin.pnl) }}
                  </span>
                  <span :class="getChangeColor(coin.pnlPercentage)" class="text-xs">
                     {{ coin.pnlPercentage >= 0 ? '+' : '' }}{{ formatNumber(coin.pnlPercentage) }}%
                  </span>
               </div>
            </td>
            <td>
              <div class="text-white">{{ formatNumber(coin.balance) }} {{ coin.symbol }}</div>
            </td>
            <td class="font-medium text-white">${{ formatNumber(coin.value) }}</td>
            <td class="text-right pr-2">
              <div v-if="!selectedPortfolio?.isOverview" class="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="handleEditCoin(coin)"
                  class="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/10 rounded-lg transition-all"
                  title="Miktarı ve Maliyeti Düzenle"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  @click="handleRemoveCoin(coin)"
                  class="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-all"
                  title="Varlığı Sil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AddCoinModal :is-open="showModal" @close="showModal = false" />
    <EditCoinModal 
      :is-open="showEditModal" 
      :coin="editingCoin" 
      @close="showEditModal = false"
      @save="saveCoinEdit" 
    />
    <DeleteConfirmModal
      :is-open="showDeleteModal"
      :data="coinToDelete"
      type="coin"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePortfolios } from "../composables/usePortfolios";
import AddCoinModal from "./AddCoinModal.vue";
import EditCoinModal from "./EditCoinModal.vue";
import DeleteConfirmModal from "./DeleteConfirmModal.vue";

const { selectedPortfolio, removeCoin, updateCoinBalance } = usePortfolios();
const showModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingCoin = ref(null);
const coinToDelete = ref(null);

const sortedCoins = computed(() => {
  if (!selectedPortfolio.value?.coins) return [];
  return [...selectedPortfolio.value.coins].sort((a, b) => b.value - a.value);
});

function openAddModal() {
  showModal.value = true;
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getChangeColor(change) {
  return change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-gray-500";
}

function handleEditCoin(coin) {
  editingCoin.value = coin;
  showEditModal.value = true;
}

function saveCoinEdit({ balance, buyPrice }) {
  if (editingCoin.value) {
    updateCoinBalance(selectedPortfolio.value, editingCoin.value.symbol, balance, buyPrice);
  }
}

function handleRemoveCoin(coin) {
  coinToDelete.value = coin;
  showDeleteModal.value = true;
}

function confirmDelete() {
  if (coinToDelete.value) {
    removeCoin(selectedPortfolio.value, coinToDelete.value.symbol);
    showDeleteModal.value = false;
    coinToDelete.value = null;
  }
}
</script>
