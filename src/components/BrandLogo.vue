<script setup lang="ts">
import { SparklesIcon } from "@heroicons/vue/24/solid";
withDefaults(
  defineProps<{ size?: "sm" | "md" | "lg"; tagline?: boolean }>(),
  { size: "md", tagline: false },
);
</script>

<template>
  <div class="flex items-center gap-2.5">
    <div
      class="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-amber-500 to-amber-400 text-white shadow-lg shadow-emerald-500/30"
      :class="{
        'w-8 h-8': size === 'sm',
        'w-10 h-10': size === 'md',
        'w-12 h-12': size === 'lg',
      }"
    >
      <SparklesIcon
        :class="{
          'w-4 h-4': size === 'sm',
          'w-5 h-5': size === 'md',
          'w-6 h-6': size === 'lg',
        }"
      />
    </div>
    <div class="leading-tight">
      <div
        class="font-semibold tracking-tight"
        :class="{
          'text-sm': size === 'sm',
          'text-base': size === 'md',
          'text-xl': size === 'lg',
        }"
      >
        BitePlate
      </div>
      <div v-if="tagline" class="text-xs text-stone-500">Smart Restaurant OS</div>
    </div>
  </div>
</template>
