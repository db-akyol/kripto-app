<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  portfolios: {
    type: Array,
    required: true,
  },
  selectedPortfolio: {
    type: Object,
    default: null,
  },
  totalValue: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["select-portfolio"]);

const handlePortfolioSelect = portfolio => {
  emit("select-portfolio", portfolio);
};
</script>

<template>
  <aside class="w-72 bg-[#1B2230] p-4 border-r border-gray-700">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-bold">Overview</h2>
        <p class="text-gray-400">${{ totalValue.toFixed(2) }}</p>
      </div>
      <button class="text-gray-400 hover:text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
        </svg>
      </button>
    </div>

    <div class="mb-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-sm text-gray-400">My portfolios({{ portfolios.length }})</h3>
      </div>
      <ul class="space-y-3">
        <li
          v-for="portfolio in portfolios"
          :key="portfolio.id"
          @click="handlePortfolioSelect(portfolio)"
          class="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
          :class="{ 'bg-gray-700': selectedPortfolio?.id === portfolio.id }"
        >
          <div class="flex items-center space-x-3">
            <div :class="portfolio.iconBg" class="w-8 h-8 rounded-full flex items-center justify-center">
              {{ portfolio.icon }}
            </div>
            <div>
              <div class="font-medium">{{ portfolio.name }}</div>
              <div class="text-sm text-gray-400">${{ portfolio.value.toFixed(2) }}</div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <button class="w-full mt-4 bg-[#3861FB] text-white py-2 px-4 rounded hover:bg-blue-600">+ Create portfolio</button>
  </aside>
</template>
