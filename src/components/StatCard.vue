<script setup lang="ts">
import { computed, type Component } from "vue";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/vue/24/outline";

const props = withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    icon?: Component;
    trend?: string;
    trendUp?: boolean;
    accent?: "emerald" | "amber" | "emerald" | "sky" | "rose";
  }>(),
  { accent: "emerald" },
);

const accentGradient = computed(
  () =>
    ({
      violet: "from-emerald-500 to-amber-500",
      amber: "from-amber-400 to-orange-500",
      emerald: "from-emerald-400 to-teal-500",
      sky: "from-sky-400 to-blue-500",
      rose: "from-rose-400 to-pink-500",
    })[props.accent],
);
const blurColor = computed(
  () =>
    ({
      violet: "bg-emerald-400",
      amber: "bg-amber-400",
      emerald: "bg-emerald-400",
      sky: "bg-sky-400",
      rose: "bg-rose-400",
    })[props.accent],
);
</script>

<template>
  <div class="card relative overflow-hidden">
    <div
      aria-hidden="true"
      class="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-25"
      :class="blurColor"
    />
    <div class="card-body relative flex items-start justify-between">
      <div>
        <div class="text-xs uppercase tracking-wider text-stone-500 dark:text-slate-400 font-medium">
          {{ label }}
        </div>
        <div class="mt-2 text-3xl font-semibold tracking-tight">{{ value }}</div>
        <div
          v-if="trend"
          class="mt-1 text-xs flex items-center gap-1"
          :class="trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
        >
          <component :is="trendUp ? ArrowTrendingUpIcon : ArrowTrendingDownIcon" class="w-3.5 h-3.5" />
          {{ trend }}
        </div>
      </div>
      <div
        v-if="icon"
        class="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br"
        :class="accentGradient"
      >
        <component :is="icon" class="w-5 h-5" />
      </div>
    </div>
  </div>
</template>
