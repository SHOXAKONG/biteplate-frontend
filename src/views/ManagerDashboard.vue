<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  ClipboardDocumentListIcon,
  BanknotesIcon,
  FireIcon,
  RectangleGroupIcon,
} from "@heroicons/vue/24/outline";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import StatCard from "@/components/StatCard.vue";
import UCard from "@/components/ui/UCard.vue";
import { api } from "@/lib/api";
import type { Order, Table, TopItem } from "@/types/api";

const orders = ref<Order[]>([]);
const tables = ref<Table[]>([]);
const topItems = ref<TopItem[]>([]);

onMounted(async () => {
  [orders.value, tables.value] = await Promise.all([
    api.get<Order[]>("/orders"),
    api.get<Table[]>("/tables"),
  ]);
  try {
    topItems.value = await api.get<TopItem[]>("/history/top-items", { query: { limit: 5 } });
  } catch {
    // empty history
  }
});

const revenue = computed(() =>
  orders.value.reduce((sum, o) => sum + Number(o.total || 0), 0).toFixed(2),
);
const activeTables = computed(() => tables.value.filter((t) => t.status === "occupied").length);
</script>

<template>
  <DashboardLayout>
    <div class="mb-8">
      <h1 class="text-3xl font-semibold tracking-tight">Manager dashboard</h1>
      <p class="text-zinc-500 mt-1">Today's operations at a glance.</p>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard label="Open orders" :value="orders.length" :icon="ClipboardDocumentListIcon" accent="violet" />
      <StatCard label="Revenue (current)" :value="`£${revenue}`" :icon="BanknotesIcon" accent="emerald" />
      <StatCard label="Tables in use" :value="activeTables" :icon="FireIcon" accent="amber" />
      <StatCard label="Total tables" :value="tables.length" :icon="RectangleGroupIcon" accent="sky" />
    </div>

    <UCard>
      <template #header><h2 class="font-semibold">Top items</h2></template>
      <div v-if="topItems.length === 0" class="text-sm text-zinc-500 py-6 text-center">
        Once orders are confirmed, top items appear here.
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="(item, idx) in topItems"
          :key="item.name"
          class="flex items-center gap-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900"
        >
          <div
            class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center font-semibold"
          >
            {{ idx + 1 }}
          </div>
          <div class="flex-1">
            <div class="font-medium">{{ item.name }}</div>
            <div class="text-xs text-zinc-500">
              {{ item.times_ordered }} ordered · £{{ item.revenue.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </DashboardLayout>
</template>
