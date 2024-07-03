<template>
  <main>
    <RadialLayout
      v-if="orbits.length"
      :orbits="orbits"
      @fetchMoreData="debouncedFetchMoreData"
    />
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import RadialLayout from "@/components/RadialLayout.vue";
import { getOrbits } from "./services/api";
import { debounce } from "lodash";
import { format, subDays } from "date-fns";

// Initialize currentDate with today's date in MM/DD/YYYY format
const currentDate = ref(format(new Date(), "MM/dd/yyyy"));
const orbits = ref([]);

const fetchOrbits = async () => {
  const newOrbits = await getOrbits(currentDate.value);
  orbits.value = [...newOrbits];
};

const fetchMoreData = async () => {
  // Decrement currentDate by 9 days
  currentDate.value = format(subDays(new Date(currentDate.value), 9), "MM/dd/yyyy");
  const newOrbits = await getOrbits(currentDate.value);
  orbits.value = [...newOrbits, ...orbits.value];
};

const debouncedFetchMoreData = debounce(fetchMoreData, 100);

onMounted(() => {
  fetchOrbits();
});
</script>

<style>
body {
  font-family: "Inter", sans-serif;
}
main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}
</style>
