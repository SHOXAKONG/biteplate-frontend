<script setup lang="ts">
import { onMounted } from "vue";
import { useColorMode } from "@vueuse/core";
import Toasts from "@/components/ui/Toasts.vue";

const mode = useColorMode({
  attribute: "class",
  selector: "html",
  modes: { light: "", dark: "dark" },
});

onMounted(() => {
  if (mode.value === "auto" || !mode.value) {
    mode.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
});
</script>

<template>
  <RouterView />
  <Toasts />
</template>
