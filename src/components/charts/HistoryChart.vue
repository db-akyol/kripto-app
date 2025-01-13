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

const generateHistoryData = currentValue => {
  const volatility = 0.02;
  return Array.from({ length: 24 }, () => {
    const randomChange = 1 + (Math.random() - 0.5) * volatility;
    return +(currentValue * randomChange).toFixed(2);
  });
};

const createChart = () => {
  const ctx = document.getElementById("historyChart");
  if (!ctx) return;

  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  chartInstance.value = new Chart(ctx, {
    type: "line",
    data: {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: "Portfolio Value",
          data: generateHistoryData(props.portfolio.value),
          borderColor: "#3861FB",
          backgroundColor: "rgba(56, 97, 251, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
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
        legend: { display: false },
      },
      scales: {
        y: {
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          ticks: {
            callback: value => `$${value}`,
            color: "#fff",
          },
        },
        x: {
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          ticks: { color: "#fff" },
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
  <div class="col-span-2 bg-[#1B2230] p-4 rounded-lg">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-bold">History</h2>
      <div class="flex space-x-2">
        <button class="px-3 py-1 rounded bg-gray-700 text-white">24h</button>
        <button class="px-3 py-1 rounded hover:bg-gray-700">7d</button>
        <button class="px-3 py-1 rounded hover:bg-gray-700">30d</button>
        <button class="px-3 py-1 rounded hover:bg-gray-700">90d</button>
        <button class="px-3 py-1 rounded hover:bg-gray-700">All</button>
      </div>
    </div>
    <div style="position: relative; height: 300px; width: 100%">
      <canvas id="historyChart"></canvas>
    </div>
  </div>
</template>
