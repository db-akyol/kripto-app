<template>
  <div class="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30">
    <div class="fixed inset-0 z-0 pointer-events-none">
       <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[128px]"></div>
       <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[128px]"></div>
    </div>

    <AppHeader />
    
    <main class="relative z-10 container mx-auto px-6 py-8">
      <router-view v-slot="{ Component }">
        <transition 
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translateY-4"
          enter-to-class="opacity-100 translateY-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translateY-0"
          leave-to-class="opacity-0 translateY-4"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue'
</script>
