<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string | number;
    type?: string;
    placeholder?: string;
    required?: boolean;
    min?: number | string;
    max?: number | string;
    step?: number | string;
    autocomplete?: string;
  }>(),
  { type: "text" },
);
defineEmits<{ "update:modelValue": [string | number] }>();
</script>

<template>
  <input
    :type="props.type"
    :value="modelValue"
    :placeholder="placeholder"
    :required="required"
    :min="min"
    :max="max"
    :step="step"
    :autocomplete="autocomplete"
    class="input"
    @input="
      $emit(
        'update:modelValue',
        props.type === 'number'
          ? Number(($event.target as HTMLInputElement).value)
          : ($event.target as HTMLInputElement).value,
      )
    "
  />
</template>
