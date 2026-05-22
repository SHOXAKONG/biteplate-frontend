<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ClipboardDocumentListIcon } from "@heroicons/vue/24/outline";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import UCard from "@/components/ui/UCard.vue";
import UBadge from "@/components/ui/UBadge.vue";
import UButton from "@/components/ui/UButton.vue";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import type { Order } from "@/types/api";

const orders = ref<Order[]>([]);
const filter = ref<string>("");
const toast = useToast();

async function load() {
  orders.value = await api.get<Order[]>("/orders/mine");
}
onMounted(load);

const filtered = computed(() =>
  filter.value ? orders.value.filter((o) => o.status === filter.value) : orders.value,
);

const statusColor: Record<string, "emerald" | "amber" | "violet" | "rose" | "sky" | "gray"> = {
  placed: "amber",
  confirmed: "violet",
  paid: "emerald",
  cancelled: "rose",
};

async function cancel(o: Order) {
  if (!confirm(`Cancel order ${o.id.slice(0, 8)}?`)) return;
  try {
    await api.del(`/orders/${o.id}`);
    toast.add({ title: "Order cancelled", color: "amber", icon: "info" });
    await load();
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight">My orders</h1>
        <p class="text-zinc-500 mt-1">Orders you've placed.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-sm" :class="filter === '' ? 'btn-soft' : 'btn-ghost'" @click="filter = ''">All</button>
        <button class="btn-sm" :class="filter === 'placed' ? 'btn-soft' : 'btn-ghost'" @click="filter = 'placed'">Placed</button>
        <button class="btn-sm" :class="filter === 'confirmed' ? 'btn-soft' : 'btn-ghost'" @click="filter = 'confirmed'">Confirmed</button>
        <button class="btn-sm" :class="filter === 'paid' ? 'btn-soft' : 'btn-ghost'" @click="filter = 'paid'">Paid</button>
        <button class="btn-sm" :class="filter === 'cancelled' ? 'btn-soft' : 'btn-ghost'" @click="filter = 'cancelled'">Cancelled</button>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="py-20 text-center text-zinc-500">
      <ClipboardDocumentListIcon class="w-12 h-12 mx-auto mb-3 text-zinc-400" />
      No orders to show.
    </div>

    <div v-else class="grid md:grid-cols-2 gap-4">
      <UCard v-for="o in filtered" :key="o.id">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-xs text-zinc-500 font-mono truncate">{{ o.id }}</div>
            <div class="text-lg font-semibold mt-1">£{{ o.total.toFixed(2) }}</div>
            <div class="text-xs text-zinc-500">
              Pricing: <span class="capitalize">{{ o.pricing_strategy.replace("_", " ") }}</span>
            </div>
          </div>
          <UBadge :color="statusColor[o.status] || 'gray'">{{ o.status }}</UBadge>
        </div>

        <div class="mt-3 space-y-1.5">
          <div
            v-for="i in o.items"
            :key="i.id"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-zinc-700 dark:text-zinc-300">
              {{ i.quantity }}× {{ i.menu_item_name }}
            </span>
            <span class="text-zinc-500">£{{ (i.unit_price * i.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <div v-if="o.notes" class="mt-3 text-xs text-zinc-500 italic">"{{ o.notes }}"</div>

        <div v-if="o.status === 'placed' || o.status === 'confirmed'" class="mt-3 flex justify-end">
          <UButton variant="soft-rose" size="sm" @click="cancel(o)">Cancel</UButton>
        </div>
      </UCard>
    </div>
  </DashboardLayout>
</template>
