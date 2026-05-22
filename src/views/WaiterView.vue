<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { UsersIcon, PlusIcon } from "@heroicons/vue/24/outline";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import UCard from "@/components/ui/UCard.vue";
import UBadge from "@/components/ui/UBadge.vue";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import type { Table } from "@/types/api";

const tables = ref<Table[]>([]);
const toast = useToast();
const router = useRouter();

async function load() {
  tables.value = await api.get<Table[]>("/tables");
}
onMounted(load);

async function act(table: Table, action: string) {
  try {
    await api.post(`/tables/${table.id}/actions`, { action });
    toast.add({
      title: `Table #${table.number}: ${action.replace("_", " ")}`,
      color: "emerald",
      icon: "check",
    });
    await load();
  } catch (e: any) {
    toast.add({ title: "Action rejected", description: e?.detail, color: "rose", icon: "x" });
  }
}

function legalActions(status: string): string[] {
  switch (status) {
    case "free":
      return ["reserve", "seat"];
    case "reserved":
      return ["seat", "free"];
    case "occupied":
      return ["request_bill"];
    case "awaiting_bill":
      return ["clear"];
    case "cleared":
      return ["free"];
    default:
      return [];
  }
}

const statusColor: Record<string, "emerald" | "amber" | "violet" | "rose" | "sky" | "gray"> = {
  free: "emerald",
  reserved: "amber",
  occupied: "violet",
  awaiting_bill: "rose",
  cleared: "sky",
};
</script>

<template>
  <DashboardLayout>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold tracking-tight">Floor plan</h1>
      <p class="text-zinc-500 mt-1">Tap a table to change its state.</p>
    </div>

    <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <UCard v-for="t in tables" :key="t.id">
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs text-zinc-500 uppercase tracking-wider">Table</div>
          <UBadge :color="statusColor[t.status] || 'gray'">{{ t.status.replace("_", " ") }}</UBadge>
        </div>
        <div class="text-3xl font-semibold">#{{ t.number }}</div>
        <div class="mt-1 text-sm text-zinc-500 flex items-center gap-1">
          <UsersIcon class="w-4 h-4" /> {{ t.seats }} seats
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="a in legalActions(t.status)"
            :key="a"
            :class="a === 'request_bill' ? 'btn-soft-rose btn-sm' : 'btn-soft btn-sm'"
            @click="act(t, a)"
          >
            {{ a.replace("_", " ") }}
          </button>
          <button
            v-if="t.status === 'occupied'"
            class="btn-primary btn-sm"
            @click="router.push(`/waiter/place-order/${t.id}`)"
          >
            <PlusIcon class="w-3 h-3" /> Order
          </button>
          <div v-if="legalActions(t.status).length === 0" class="text-xs text-zinc-400">
            No actions
          </div>
        </div>
      </UCard>
    </div>
  </DashboardLayout>
</template>
