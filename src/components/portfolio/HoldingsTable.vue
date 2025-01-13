<script setup>
const props = defineProps({
  coins: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="bg-[#1B2230] rounded-lg mt-6">
    <h2 class="text-lg font-bold p-4 border-b border-gray-700">Holdings</h2>
    <table class="w-full">
      <thead class="text-gray-400 border-b border-gray-700">
        <tr>
          <th class="text-left p-4">Assets</th>
          <th class="text-left p-4">Portfolio Allocation</th>
          <th class="text-right p-4">Price</th>
          <th class="text-right p-4">1h%</th>
          <th class="text-right p-4">24h%</th>
          <th class="text-right p-4">7d%</th>
          <th class="text-right p-4">Balance</th>
          <th class="text-right p-4">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="coin in coins" :key="coin.symbol" class="border-b border-gray-700 hover:bg-gray-800">
          <td class="p-4">
            <div class="flex items-center space-x-2">
              <img :src="coin.icon" class="w-8 h-8" />
              <span>{{ coin.name }}</span>
              <span class="text-gray-400">{{ coin.symbol }}</span>
            </div>
          </td>
          <td class="p-4">{{ coin.allocation.toFixed(2) }}%</td>
          <td class="text-right p-4">${{ coin.price.toFixed(2) }}</td>
          <td class="text-right p-4" :class="coin.change1h > 0 ? 'text-green-400' : 'text-red-400'">
            {{ coin.change1h > 0 ? "+" : "" }}{{ coin.change1h.toFixed(2) }}%
          </td>
          <td class="text-right p-4" :class="coin.change24h > 0 ? 'text-green-400' : 'text-red-400'">
            {{ coin.change24h > 0 ? "+" : "" }}{{ coin.change24h.toFixed(2) }}%
          </td>
          <td class="text-right p-4" :class="coin.change7d > 0 ? 'text-green-400' : 'text-red-400'">
            {{ coin.change7d > 0 ? "+" : "" }}{{ coin.change7d.toFixed(2) }}%
          </td>
          <td class="text-right p-4">{{ coin.balance }}</td>
          <td class="text-right p-4">${{ coin.value.toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
