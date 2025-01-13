<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  portfolio: {
    type: Object,
    required: true,
  },
});

const chartInstance = ref(null);

const createChart = () => {
  const ctx = document.getElementById("allocationChart");
  if (!ctx || !props.portfolio.coins.length) return;

  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  chartInstance.value = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: props.portfolio.coins.map(coin => coin.symbol),
      datasets: [
        {
          data: props.portfolio.coins.map(coin => coin.allocation),
          backgroundColor: ["#3861FB", "#00C087", "#E84142", "#FF4C8B", "#00B8D9", "#9B51E0", "#36B37E", "#8993A4"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "#fff",
            padding: 20,
            font: {
              size: 12,
            },
          },
        },
      },
    },
  });
};

watch(
  () => props.portfolio,
  () => {
    createChart();
  },
  { deep: true }
);

onMounted(() => {
  createChart();
});

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
});
</script>

<template>
  <div class="bg-[#1B2230] p-4 rounded-lg">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-bold">Allocation</h2>
      <div class="flex space-x-2">
        <button class="px-3 py-1 rounded bg-gray-700">Token</button>
        <button class="px-3 py-1 rounded hover:bg-gray-700">Portfolio</button>
      </div>
    </div>
    <div style="position: relative; height: 300px; width: 100%">
      <canvas id="allocationChart"></canvas>
    </div>
  </div>
</template>
