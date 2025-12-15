<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="bg-[#0d1421] rounded-2xl p-6 border border-gray-800">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">AI Kripto Analist</h1>
            <p class="text-gray-400 text-sm">Günlük piyasa analizi ve öngörüler</p>
          </div>
        </div>
      </div>
      
      <!-- Status Badge -->
      <div v-if="analysis" class="flex items-center gap-2 text-sm text-gray-400">
        <div class="w-2 h-2 rounded-full bg-green-500"></div>
        Son güncelleme: {{ formatDate(analysis.created_at || analysis.date) }}
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-400">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ error }}
      </div>
    </div>

    <!-- Analysis Content -->
    <div v-if="analysis" class="bg-[#0d1421] rounded-2xl p-6 border border-gray-800">
      <!-- Sentiment Badge -->
      <div class="flex items-center gap-3 mb-6">
        <span 
          class="px-3 py-1 rounded-full text-sm font-medium"
          :class="{
            'bg-green-500/20 text-green-400': analysis.sentiment === 'bullish',
            'bg-red-500/20 text-red-400': analysis.sentiment === 'bearish',
            'bg-gray-500/20 text-gray-400': analysis.sentiment === 'neutral'
          }"
        >
          {{ analysis.sentiment === 'bullish' ? '🐂 Boğa' : analysis.sentiment === 'bearish' ? '🐻 Ayı' : '⚖️ Nötr' }}
        </span>
        <span class="text-gray-500 text-sm">{{ analysis.date }}</span>
      </div>

      <!-- Analysis Text -->
      <div class="prose prose-invert max-w-none">
        <div v-html="formattedAnalysis" class="text-gray-300 leading-relaxed space-y-4"></div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="bg-[#0d1421] rounded-2xl p-6 border border-gray-800 animate-pulse">
      <div class="h-6 bg-gray-700 rounded w-32 mb-6"></div>
      <div class="space-y-3">
        <div class="h-4 bg-gray-700 rounded w-full"></div>
        <div class="h-4 bg-gray-700 rounded w-5/6"></div>
        <div class="h-4 bg-gray-700 rounded w-4/6"></div>
        <div class="h-4 bg-gray-700 rounded w-full"></div>
        <div class="h-4 bg-gray-700 rounded w-3/4"></div>
      </div>
    </div>

    <!-- Empty State - No Analysis Yet -->
    <div v-else class="bg-[#0d1421] rounded-2xl p-12 border border-gray-800 border-dashed text-center">
      <div class="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-white mb-2">Henüz güncel analiz yok</h3>
      <p class="text-gray-400">AI analistimiz her gün yeni bir piyasa analizi hazırlıyor. Lütfen daha sonra tekrar kontrol edin.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const analysis = ref(null);
const isLoading = ref(true);
const error = ref(null);

const formattedAnalysis = computed(() => {
  if (!analysis.value?.analysis) return '';
  
  return analysis.value.analysis
    .replace(/## /g, '<h2 class="text-xl font-bold text-white mt-6 mb-3">')
    .replace(/### /g, '<h3 class="text-lg font-semibold text-blue-400 mt-4 mb-2">')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/- /g, '<li class="ml-4">• ')
    .replace(/\n/g, '</li><br>')
    .replace(/<\/li><br><h/g, '</li><h')
    .replace(/<\/li><br><li/g, '</li><li');
});

async function loadLatestAnalysis() {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch('/api/get-analysis');
    const data = await response.json();

    if (data.success && data.data) {
      analysis.value = data.data;
    } else if (!data.data) {
      // No analysis yet - this is okay, show empty state
      analysis.value = null;
    } else {
      error.value = data.error || 'Analiz yüklenirken bir hata oluştu.';
    }
  } catch (e) {
    error.value = 'Bağlantı hatası. Lütfen sayfayı yenileyin.';
    console.error('Load analysis error:', e);
  } finally {
    isLoading.value = false;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(() => {
  loadLatestAnalysis();
});
</script>
