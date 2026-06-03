<script setup lang="ts">
import { computed } from "vue";
import { toasts, useToast } from "@/lib/toast";
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

const list = computed(() => toasts());
const { remove } = useToast();

const colorMap: Record<string, string> = {
  emerald: "from-emerald-500 to-teal-500",
  rose: "from-rose-500 to-pink-500",
  amber: "from-amber-500 to-orange-500",
  violet: "from-emerald-500 to-amber-500",
  sky: "from-sky-500 to-blue-500",
};

function iconFor(icon?: string) {
  if (icon === "x") return XCircleIcon;
  if (icon === "warning") return ExclamationTriangleIcon;
  if (icon === "info") return InformationCircleIcon;
  return CheckCircleIcon;
}
</script>

<template>
  <div class="fixed top-4 right-4 z-[60] space-y-2 max-w-sm">
    <transition-group name="toast" tag="div">
      <div
        v-for="t in list"
        :key="t.id"
        class="card overflow-hidden flex items-start gap-3 p-3 shadow-xl shadow-slate-900/10 animate-slide-up"
      >
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center text-white bg-gradient-to-br shrink-0"
          :class="colorMap[t.color || 'violet']"
        >
          <component :is="iconFor(t.icon)" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold">{{ t.title }}</div>
          <div v-if="t.description" class="text-xs text-stone-500 mt-0.5">
            {{ t.description }}
          </div>
        </div>
        <button class="text-slate-400 hover:text-slate-600" @click="remove(t.id)">
          <XCircleIcon class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 200ms ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
