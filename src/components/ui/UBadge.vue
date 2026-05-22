<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    color?: "violet" | "emerald" | "amber" | "rose" | "sky" | "indigo" | "orange" | "gray";
  }>(),
  { color: "violet" },
);

const map: Record<string, string> = {
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  gray: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300",
};
const cls = computed(() => map[props.color] || map.violet);
</script>

<template>
  <span class="badge" :class="cls"><slot /></span>
</template>
