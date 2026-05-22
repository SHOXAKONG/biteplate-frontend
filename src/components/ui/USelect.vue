<script setup lang="ts">
defineProps<{
  modelValue: string | number;
  options: Array<{ value: string | number; label: string }>;
  required?: boolean;
}>();
defineEmits<{ "update:modelValue": [string | number] }>();
</script>

<template>
  <select
    :value="modelValue"
    :required="required"
    class="input pr-10"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
  </select>
</template>
