<script setup lang="ts">
defineProps<{ modelValue: string; placeholder?: string; rows?: number }>();
defineEmits<{ "update:modelValue": [string] }>();
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows || 3"
    class="input"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
