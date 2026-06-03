<script setup lang="ts">
import { computed } from "vue";
import {
  ShieldCheckIcon,
  BriefcaseIcon,
  FireIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  UserIcon,
} from "@heroicons/vue/24/outline";
import UBadge from "@/components/ui/UBadge.vue";

const props = defineProps<{ role: string }>();

const meta = computed(() => {
  switch (props.role) {
    case "admin":
      return { color: "emerald" as const, icon: ShieldCheckIcon };
    case "manager":
      return { color: "indigo" as const, icon: BriefcaseIcon };
    case "head_chef":
      return { color: "orange" as const, icon: FireIcon };
    case "waiter":
      return { color: "emerald" as const, icon: ClipboardDocumentListIcon };
    case "cashier":
      return { color: "amber" as const, icon: BanknotesIcon };
    case "customer":
      return { color: "sky" as const, icon: UserIcon };
    default:
      return { color: "gray" as const, icon: UserIcon };
  }
});
</script>

<template>
  <UBadge :color="meta.color">
    <component :is="meta.icon" class="w-3 h-3" />
    <span class="capitalize">{{ role.replace("_", " ") }}</span>
  </UBadge>
</template>
