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

    <!-- Tab Navigation -->
    <div class="flex gap-2 bg-[#0d1421] rounded-xl p-1 border border-gray-800">
      <button 
        @click="activeTab = 'analysis'"
        class="flex-1 py-3 px-4 rounded-lg font-medium transition-all"
        :class="activeTab === 'analysis' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'text-gray-400 hover:text-white'"
      >
        📊 Günlük Analiz
      </button>
      <button 
        @click="activeTab = 'chat'"
        class="flex-1 py-3 px-4 rounded-lg font-medium transition-all"
        :class="activeTab === 'chat' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'text-gray-400 hover:text-white'"
      >
        💬 Soru Sor
      </button>
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

    <!-- Analysis Tab -->
    <div v-if="activeTab === 'analysis'">
      <!-- Analysis Content -->
      <div v-if="analysis" class="space-y-4">
        <div v-for="(section, index) in parsedSections" :key="index" 
             class="bg-[#0d1421] rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
          <div class="px-6 py-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-800/30 to-transparent">
            <h2 class="text-lg font-bold text-white flex items-center gap-3">
              <span class="text-xl">{{ section.icon }}</span>
              {{ section.title }}
            </h2>
          </div>
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
        <p class="text-gray-400 max-w-md mx-auto">AI analistimiz her gün yeni bir piyasa analizi hazırlıyor.</p>
      </div>
    </div>

    <!-- Chat Tab -->
    <div v-if="activeTab === 'chat'" class="space-y-4">
      <!-- Chat Messages -->
      <div class="bg-[#0d1421] rounded-2xl border border-gray-800 min-h-[400px] max-h-[500px] overflow-y-auto p-4 space-y-4" ref="chatContainer">
        <!-- Welcome Message -->
        <div v-if="chatMessages.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">🤖</span>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">AI Analist'e Soru Sor</h3>
          <p class="text-gray-400 text-sm max-w-sm mx-auto mb-6">
            Bitcoin, Ethereum veya kripto piyasası hakkında sorularınızı sorabilirsiniz.
          </p>
          <div class="flex flex-wrap justify-center gap-2">
            <button 
              v-for="suggestion in suggestions" 
              :key="suggestion"
              @click="askQuestion(suggestion)"
              class="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div v-for="(msg, index) in chatMessages" :key="index">
          <!-- User Message -->
          <div v-if="msg.role === 'user'" class="flex justify-end">
            <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[80%]">
              {{ msg.content }}
            </div>
          </div>
          <!-- AI Message -->
          <div v-else class="flex justify-start gap-3">
            <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-sm">🤖</span>
            </div>
            <div class="bg-gray-800 text-gray-200 px-4 py-3 rounded-2xl rounded-bl-md max-w-[80%] leading-relaxed">
              <div v-html="formatMessage(msg.content)"></div>
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isChatLoading" class="flex justify-start gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span class="text-sm">🤖</span>
          </div>
          <div class="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="bg-[#0d1421] rounded-2xl border border-gray-800 p-4">
        <form @submit.prevent="sendMessage" class="flex gap-3">
          <input 
            v-model="chatInput"
            type="text"
            placeholder="Kripto hakkında bir soru sorun..."
            class="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            :disabled="isChatLoading"
          >
          <button 
            type="submit"
            :disabled="!chatInput.trim() || isChatLoading"
            class="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';

const analysis = ref(null);
const isLoading = ref(true);
const error = ref(null);
const activeTab = ref('analysis');

// Chat state
const chatMessages = ref([]);
const chatInput = ref('');
const isChatLoading = ref(false);
const chatContainer = ref(null);

const suggestions = [
  'Bitcoin yükselir mi?',
  'ETH almalı mıyım?',
  'Piyasa ne zaman düzelir?',
  'Altcoin sezonu gelir mi?'
];

const sectionIcons = {
  'bugünün özeti': '🎯',
  'piyasa özeti': '📊',
  'teknik analiz': '📈',
  'teknik görünüm': '📈',
  'kritik seviyeler': '💰',
  'benim tahminim': '🔮',
  'sonuç': '⚡',
  'piyasa duyarlılığı': '📰',
  'riskler ve fırsatlar': '⚠️',
  'default': '💡'
};

const parsedSections = computed(() => {
  if (!analysis.value?.analysis) return [];
  
  const text = analysis.value.analysis;
  const sections = [];
  const parts = text.split(/#{2,3}\s*/);
  
  for (const part of parts) {
    if (!part.trim()) continue;
    
    const lines = part.trim().split('\n');
    const titleLine = lines[0].replace(/[#*]/g, '').trim();
    
    if (titleLine.length < 3) continue;
    
    const title = titleLine.replace(/^[📊📈🎯⚡⚠️💡📋🐂🐻💰🔮📰]+\s*/, '').trim();
    const titleLower = title.toLowerCase();
    
    let icon = sectionIcons.default;
    for (const [key, value] of Object.entries(sectionIcons)) {
      if (titleLower.includes(key)) {
        icon = value;
        break;
      }
    }
    
    const contentLines = lines.slice(1).join('\n').trim();
    
    const bullets = [];
    const bulletRegex = /[-•*]\s*(.+)/g;
    let match;
    while ((match = bulletRegex.exec(contentLines)) !== null) {
      const bullet = match[1].replace(/\*\*/g, '').trim();
      if (bullet.length > 5) {
        bullets.push(bullet);
      }
    }
    
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

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

async function askQuestion(question) {
  chatInput.value = question;
  await sendMessage();
}

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message || isChatLoading.value) return;

  // Add user message
  chatMessages.value.push({ role: 'user', content: message });
  chatInput.value = '';
  isChatLoading.value = true;

  // Scroll to bottom
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }

  try {
    // Build context from current analysis
    const context = analysis.value?.analysis?.substring(0, 1000) || '';

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });

    const data = await response.json();

    if (data.success) {
      chatMessages.value.push({ role: 'assistant', content: data.reply });
    } else {
      chatMessages.value.push({ role: 'assistant', content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' });
    }
  } catch (e) {
    chatMessages.value.push({ role: 'assistant', content: 'Bağlantı hatası. Lütfen tekrar deneyin.' });
    console.error('Chat error:', e);
  } finally {
    isChatLoading.value = false;
    await nextTick();
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  }
}

onMounted(() => {
  loadLatestAnalysis();
});
</script>
