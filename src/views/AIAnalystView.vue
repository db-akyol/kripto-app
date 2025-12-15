<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-[#0d1421] to-[#1a1f35] rounded-2xl p-6 border border-gray-800 shadow-xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">AI Kripto Analist</h1>
            <p class="text-gray-400 text-sm">Günlük piyasa analizi ve öngörüler</p>
          </div>
        </div>
        
        <!-- Sentiment Badge -->
        <div v-if="analysis" class="flex flex-col items-end gap-2">
          <span 
            class="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg"
            :class="{
              'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30': analysis.sentiment === 'bullish',
              'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/30': analysis.sentiment === 'bearish',
              'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-400 border border-gray-500/30': analysis.sentiment === 'neutral'
            }"
          >
            <span class="text-lg">{{ analysis.sentiment === 'bullish' ? '🐂' : analysis.sentiment === 'bearish' ? '🐻' : '⚖️' }}</span>
            {{ analysis.sentiment === 'bullish' ? 'BOĞA' : analysis.sentiment === 'bearish' ? 'AYI' : 'NÖTR' }}
          </span>
          <span class="text-gray-500 text-xs">{{ formatDate(analysis.created_at || analysis.date) }}</span>
        </div>
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
    <div v-if="analysis" class="space-y-4">
      <!-- Sections from parsed analysis -->
      <div v-for="(section, index) in parsedSections" :key="index" 
           class="bg-[#0d1421] rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
        <!-- Section Header -->
        <div class="px-6 py-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-800/30 to-transparent">
          <h2 class="text-lg font-bold text-white flex items-center gap-3">
            <span class="text-xl">{{ section.icon }}</span>
            {{ section.title }}
          </h2>
        </div>
        <!-- Section Content -->
        <div class="px-6 py-5">
          <div v-if="section.bullets.length > 0" class="space-y-3">
            <div v-for="(bullet, bIndex) in section.bullets" :key="bIndex" 
                 class="flex items-start gap-3 text-gray-300">
              <span class="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
              <span class="leading-relaxed">{{ bullet }}</span>
            </div>
          </div>
          <p v-else class="text-gray-300 leading-relaxed">{{ section.content }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-[#0d1421] rounded-2xl p-6 border border-gray-800 animate-pulse">
        <div class="h-5 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div class="space-y-3">
          <div class="h-4 bg-gray-700 rounded w-full"></div>
          <div class="h-4 bg-gray-700 rounded w-5/6"></div>
          <div class="h-4 bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-[#0d1421] rounded-2xl p-12 border border-gray-800 border-dashed text-center">
      <div class="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-white mb-2">Henüz güncel analiz yok</h3>
      <p class="text-gray-400 max-w-md mx-auto">AI analistimiz her gün yeni bir piyasa analizi hazırlıyor. Lütfen daha sonra tekrar kontrol edin.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const analysis = ref(null);
const isLoading = ref(true);
const error = ref(null);

const sectionIcons = {
  'piyasa özeti': '📊',
  'teknik görünüm': '📈',
  'kritik seviyeler': '🎯',
  'genel değerlendirme': '⚡',
  'dikkat edilmesi gerekenler': '⚠️',
  'günlük analiz': '📋',
  'default': '💡'
};

const parsedSections = computed(() => {
  if (!analysis.value?.analysis) return [];
  
  const text = analysis.value.analysis;
  const sections = [];
  
  // Split by ## or ### headers
  const parts = text.split(/#{2,3}\s*/);
  
  for (const part of parts) {
    if (!part.trim()) continue;
    
    const lines = part.trim().split('\n');
    const titleLine = lines[0].replace(/[#*]/g, '').trim();
    
    // Skip emoji-only lines
    if (titleLine.length < 3) continue;
    
    const title = titleLine.replace(/^[📊📈🎯⚡⚠️💡📋🐂🐻]+\s*/, '').trim();
    const titleLower = title.toLowerCase();
    
    // Find matching icon
    let icon = sectionIcons.default;
    for (const [key, value] of Object.entries(sectionIcons)) {
      if (titleLower.includes(key)) {
        icon = value;
        break;
      }
    }
    
    // Extract content
    const contentLines = lines.slice(1).join('\n').trim();
    
    // Parse bullets
    const bullets = [];
    const bulletRegex = /[-•*]\s*(.+)/g;
    let match;
    while ((match = bulletRegex.exec(contentLines)) !== null) {
      const bullet = match[1].replace(/\*\*/g, '').trim();
      if (bullet.length > 5) {
        bullets.push(bullet);
      }
    }
    
    // Get plain content if no bullets
    const plainContent = contentLines
      .replace(/[-•*]\s*.+/g, '')
      .replace(/\*\*/g, '')
      .trim();
    
    if (title && (bullets.length > 0 || plainContent)) {
      sections.push({
        title: title.toUpperCase(),
        icon,
        bullets,
        content: plainContent
      });
    }
  }
  
  return sections;
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
