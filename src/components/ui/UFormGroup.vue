<script setup lang="ts">
defineProps<{ label: string; hint?: string }>();
</script>

<template>
  <label class="block space-y-1.5">
    <span class="block text-sm font-medium text-slate-700 dark:text-stone-300">{{ label }}</span>
    <slot />
    <span v-if="hint" class="block text-xs text-stone-500">{{ hint }}</span>
  </label>
</template>
