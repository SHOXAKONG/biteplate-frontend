<script setup lang="ts">
defineProps<{ noPadding?: boolean }>();
const slots = defineSlots<{
  header?: () => unknown;
  default: () => unknown;
  footer?: () => unknown;
}>();
</script>

<template>
  <div class="card">
    <div v-if="slots.header" class="card-header"><slot name="header" /></div>
    <div :class="noPadding ? '' : 'card-body'"><slot /></div>
    <div v-if="slots.footer" class="card-footer"><slot name="footer" /></div>
  </div>
</template>
