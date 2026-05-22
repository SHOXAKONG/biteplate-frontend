<script setup lang="ts">
import { Switch } from "@headlessui/vue";
defineProps<{ modelValue: boolean }>();
defineEmits<{ "update:modelValue": [boolean] }>();
</script>

<template>
  <Switch
    :model-value="modelValue"
    @update:model-value="(v) => $emit('update:modelValue', v)"
    :class="[
      modelValue ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700',
      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
    ]"
  >
    <span
      aria-hidden="true"
      :class="[
        modelValue ? 'translate-x-5' : 'translate-x-0',
        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
      ]"
    />
  </Switch>
</template>
