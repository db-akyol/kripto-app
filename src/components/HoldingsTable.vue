<!-- Varlıklar tablosu bileşeni -->
<template>
  <div class="bg-gray-800 rounded-lg p-4">
    <h2 class="text-xl font-bold mb-4">Varlıklar</h2>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="text-left text-gray-400 text-sm">
            <th class="pb-4">İsim</th>
            <th class="pb-4">Fiyat</th>
            <th class="pb-4">1s%</th>
            <th class="pb-4">24s%</th>
            <th class="pb-4">7g%</th>
            <th class="pb-4">Miktar</th>
            <th class="pb-4">Ort. Alış</th>
            <th class="pb-4">Kâr/Zarar</th>
            <th class="pb-4">İşlemler</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="coin in selectedPortfolio?.coins" :key="coin.symbol" class="border-t border-gray-700">
            <td class="py-4">
              <div class="flex items-center">
                <img :src="coin.icon" :alt="coin.name" class="w-6 h-6 mr-2" />
                <div>
                  <div class="font-medium">{{ coin.name }}</div>
                  <div class="text-gray-400">{{ coin.symbol }}</div>
                </div>
              </div>
            </td>
            <td>${{ formatNumber(coin.price) }}</td>
            <td :class="getChangeColor(coin.change1h)">{{ formatNumber(coin.change1h) }}%</td>
            <td :class="getChangeColor(coin.change24h)">{{ formatNumber(coin.change24h) }}%</td>
            <td :class="getChangeColor(coin.change7d)">{{ formatNumber(coin.change7d) }}%</td>
            <td>
              <div>{{ formatNumber(coin.balance) }}</div>
              <div class="text-gray-400">${{ formatNumber(coin.value) }}</div>
            </td>
            <td>${{ formatNumber(coin.price) }}</td>
            <td :class="getChangeColor(coin.change24h)">
              ${{ formatNumber((coin.value * coin.change24h) / 100) }}
              <div class="text-xs">{{ formatNumber(coin.change24h) }}%</div>
            </td>
            <td>
              <div class="flex gap-2">
                <button
                  @click="handleRemoveCoin(coin.symbol)"
                  class="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700 transition-colors"
                  title="Coini Sil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
                <button class="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700 transition-colors" title="Daha Fazla">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { usePortfolios } from "../composables/usePortfolios";

const { selectedPortfolio, removeCoin } = usePortfolios();

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getChangeColor(change) {
  return change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-gray-400";
}

function handleRemoveCoin(symbol) {
  if (confirm(`${symbol} coinini silmek istediğinize emin misiniz?`)) {
    removeCoin(selectedPortfolio.value, symbol);
  }
}
</script>
