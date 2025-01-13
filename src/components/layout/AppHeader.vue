<script setup>
// Header component
</script>

<template>
  <header class="bg-[#1B2230] p-4 flex justify-between items-center border-b border-gray-700">
    <div class="flex items-center space-x-8">
      <div class="text-xl font-bold">CoinMarketCap</div>
      <nav>
        <ul class="flex space-x-6">
          <li><a href="#" class="hover:text-blue-400">Cryptocurrencies</a></li>
          <li><a href="#" class="hover:text-blue-400">DexScan</a></li>
          <li><a href="#" class="hover:text-blue-400">Exchanges</a></li>
          <li><a href="#" class="hover:text-blue-400">Community</a></li>
          <li><a href="#" class="hover:text-blue-400">Products</a></li>
        </ul>
      </nav>
    </div>
    <div class="flex items-center space-x-4">
      <button class="bg-gray-700 p-2 rounded-lg">Portfolio</button>
      <button class="bg-gray-700 p-2 rounded-lg">Watchlist</button>
      <div class="relative">
        <input type="text" placeholder="Search" class="bg-gray-700 p-2 rounded-lg pl-8 w-64" />
        <svg class="w-4 h-4 absolute left-2 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </div>
  </header>
</template>
