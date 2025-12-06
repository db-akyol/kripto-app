<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Modal Content -->
      <div class="relative w-full max-w-lg bg-[#0f172a] rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/30">
          <h2 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Yeni Portföy Ekle
          </h2>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="p-6 pb-2">
          <div class="relative">
            <span class="absolute left-4 top-3.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Borsa veya Cüzdan Ara..."
              class="w-full bg-gray-900/50 border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium placeholder-gray-500"
              autofocus
            />
          </div>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar space-y-2">
          <button
            v-for="exchange in filteredExchanges"
            :key="exchange.id"
            @click="selectExchange(exchange)"
            class="w-full flex items-center p-3 rounded-xl hover:bg-gray-800/80 border border-transparent hover:border-gray-700 transition-all group"
          >
            <div class="w-10 h-10 rounded-full bg-white/5 p-1.5 mr-4 flex items-center justify-center border border-gray-700/50 group-hover:border-gray-600">
              <img :src="exchange.icon" :alt="exchange.name" class="w-full h-full object-contain rounded-full" />
            </div>
            <div class="flex-1 text-left">
              <div class="font-medium text-white group-hover:text-blue-400 transition-colors">{{ exchange.name }}</div>
            </div>
            <div class="text-gray-500 group-hover:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </button>
          
          <div v-if="filteredExchanges.length === 0" class="text-center py-8 text-gray-500">
            Sonuç bulunamadı.
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { exchanges } from '../data/exchanges';

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(['close', 'add']);

const searchQuery = ref('');

const filteredExchanges = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return exchanges.filter(ex => ex.name.toLowerCase().includes(query));
});

function selectExchange(exchange) {
  emit('add', exchange);
  searchQuery.value = ''; // Reset search
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.4); 
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.6); 
}
</style>
