<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        @click="$emit('close')"
      ></div>
  
      <!-- Modal Content -->
      <div class="relative w-full max-w-sm bg-[#0f172a] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden transform transition-all">
        <!-- Body -->
        <div class="p-6 flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mb-4 border border-red-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
  
          <h3 class="text-xl font-bold text-white mb-2">{{ type === 'portfolio' ? 'Portföyü Sil' : 'Varlığı Sil' }}</h3>
          <p class="text-gray-400 mb-6">
            <span class="font-bold text-white">{{ data?.name }} {{ data?.symbol ? `(${data.symbol})` : '' }}</span> 
            {{ type === 'portfolio' ? 'portföyünü' : 'varlığını' }} silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
  
          <div class="flex gap-3 w-full">
            <button 
              @click="$emit('close')"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
            >
              İptal
            </button>
            <button 
              @click="$emit('confirm')"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-900/20 transition-all transform active:scale-95"
            >
              Evet, Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  type: {
    type: String,
    default: 'coin' // 'coin' or 'portfolio'
  },
  data: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['close', 'confirm']);
</script>
