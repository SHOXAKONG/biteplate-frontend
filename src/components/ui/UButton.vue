<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    type?: "button" | "submit";
    variant?: "primary" | "ghost" | "soft" | "soft-rose" | "soft-amber";
    size?: "sm" | "md" | "lg";
    block?: boolean;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  { type: "button", variant: "primary", size: "md", block: false, loading: false, disabled: false },
);

defineEmits<{ click: [MouseEvent] }>();

const classes = computed(() => [
  props.variant === "primary"
    ? "btn-primary"
    : props.variant === "ghost"
      ? "btn-ghost"
      : props.variant === "soft"
        ? "btn-soft"
        : props.variant === "soft-rose"
          ? "btn-soft-rose"
          : "btn-soft-amber",
  props.size === "sm" ? "btn-sm" : props.size === "lg" ? "btn-lg" : "btn-md",
  props.block ? "w-full" : "",
]);
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25" />
      <path
        fill="currentColor"
        class="opacity-75"
        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
      />
    </svg>
    <slot />
  </button>
</template>
