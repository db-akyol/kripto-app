<!-- Varlıklar tablosu bileşeni -->
<template>
  <div class="bg-[#0d1421] rounded-2xl p-6 border border-gray-800">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-white">Assets</h2>
      <button 
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
            <th class="pb-4 font-medium">1h%</th>
            <th class="pb-4 font-medium">24h%</th>
            <th class="pb-4 font-medium">7d%</th>
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
            <td :class="getChangeColor(coin.change1h)">{{ formatNumber(coin.change1h) }}%</td>
            <td :class="getChangeColor(coin.change24h)">{{ formatNumber(coin.change24h) }}%</td>
            <td :class="getChangeColor(coin.change7d)">{{ formatNumber(coin.change7d) }}%</td>
            <td>
              <div class="text-white">{{ formatNumber(coin.balance) }} {{ coin.symbol }}</div>
            </td>
            <td class="font-medium text-white">${{ formatNumber(coin.value) }}</td>
            <td class="text-right pr-2">
              <div class="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="handleRemoveCoin(coin.symbol)"
                  class="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/10 rounded transition-all"
                  title="Remove Asset"
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
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePortfolios } from "../composables/usePortfolios";
import AddCoinModal from "./AddCoinModal.vue";

const { selectedPortfolio, removeCoin } = usePortfolios();
const showModal = ref(false);

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

function handleRemoveCoin(symbol) {
  if (confirm(`Are you sure you want to remove ${symbol}?`)) {
    removeCoin(selectedPortfolio.value, symbol);
  }
}
</script>
