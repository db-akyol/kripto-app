<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        @click="$emit('close')"
      ></div>
  
      <!-- Modal Content -->
      <div class="relative w-full max-w-md bg-[#0f172a] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden transform transition-all">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <img v-if="coin?.icon" :src="coin.icon" :alt="coin.name" class="w-6 h-6 rounded-full" />
            {{ coin?.name }} Düzenle
          </h3>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
  
        <!-- Body -->
        <div class="p-6 space-y-6">
          <div>
             <label class="block text-sm font-medium text-gray-400 mb-2">Miktar</label>
             <div class="relative">
               <input 
                 type="number" 
                 v-model="newBalance"
                 placeholder="0.00"
                 class="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-lg"
                 ref="inputRef"
               />
               <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium font-mono">{{ coin?.symbol }}</span>
             </div>
          </div>
  
          <div>
             <label class="block text-sm font-medium text-gray-400 mb-2">Ortalama Alış Fiyatı ($)</label>
             <div class="relative">
               <input 
                 type="number" 
                 v-model="newBuyPrice"
                 placeholder="0.00"
                 class="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-lg"
                 @keyup.enter="handleSave"
               />
             </div>
             <div class="text-xs text-gray-500 mt-2">
               Mevcut Fiyat: ${{ formatNumber(coin?.price) }}
             </div>
          </div>
        </div>
  
        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-800/30 border-t border-gray-700 flex justify-end gap-3">
          <button 
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button 
            @click="handleSave"
            class="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-600/20 transition-all transform active:scale-95"
            :disabled="!isValid"
            :class="{ 'opacity-50 cursor-not-allowed': !isValid }"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  coin: Object
});

const emit = defineEmits(['close', 'save']);
const newBalance = ref('');
const newBuyPrice = ref('');
const inputRef = ref(null);

// Initialize input when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.coin) {
    newBalance.value = props.coin.balance;
    newBuyPrice.value = props.coin.buyPrice || props.coin.price; // Default to buyPrice or current price
    nextTick(() => {
      inputRef.value?.focus();
      inputRef.value?.select();
    });
  }
});

const isValid = computed(() => {
  return (
    newBalance.value !== '' && 
    !isNaN(parseFloat(newBalance.value)) && 
    parseFloat(newBalance.value) >= 0 &&
    newBuyPrice.value !== '' &&
    !isNaN(parseFloat(newBuyPrice.value)) &&
    parseFloat(newBuyPrice.value) >= 0
  );
});

function handleSave() {
  if (isValid.value) {
    emit('save', {
      balance: parseFloat(newBalance.value),
      buyPrice: parseFloat(newBuyPrice.value)
    });
    emit('close');
  }
}

function formatNumber(value) {
  if (!value) return '0.00';
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}
</script>
