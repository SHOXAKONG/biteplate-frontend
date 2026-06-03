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
const filter = ref("");
const toast = useToast();

async function load() {
  orders.value = await api.get<Order[]>("/orders");
}
onMounted(load);

const filtered = computed(() =>
  filter.value ? orders.value.filter((o) => o.status === filter.value) : orders.value,
);

const totals = computed(() => ({
  count: filtered.value.length,
  revenue: filtered.value.reduce((s, o) => s + o.total, 0),
  avg: filtered.value.length
    ? filtered.value.reduce((s, o) => s + o.total, 0) / filtered.value.length
    : 0,
}));

const statusColor: Record<string, "emerald" | "amber" | "emerald" | "rose" | "gray"> = {
  placed: "amber",
  confirmed: "emerald",
  paid: "emerald",
  cancelled: "rose",
};

async function cancel(o: Order) {
  if (!confirm(`Cancel order ${o.id.slice(0, 8)}?`)) return;
  try {
    await api.del(`/orders/${o.id}`);
    toast.add({ title: "Cancelled", color: "amber", icon: "info" });
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
        <h1 class="text-3xl font-semibold tracking-tight">All orders</h1>
        <p class="text-stone-500 mt-1">Restaurant-wide order activity.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-sm" :class="filter === '' ? 'btn-soft' : 'btn-ghost'" @click="filter = ''">All</button>
        <button class="btn-sm" :class="filter === 'placed' ? 'btn-soft' : 'btn-ghost'" @click="filter = 'placed'">Placed</button>
        <button class="btn-sm" :class="filter === 'confirmed' ? 'btn-soft' : 'btn-ghost'" @click="filter = 'confirmed'">Confirmed</button>
        <button class="btn-sm" :class="filter === 'paid' ? 'btn-soft' : 'btn-ghost'" @click="filter = 'paid'">Paid</button>
        <button class="btn-sm" :class="filter === 'cancelled' ? 'btn-soft' : 'btn-ghost'" @click="filter = 'cancelled'">Cancelled</button>
      </div>
    </div>

    <div class="grid sm:grid-cols-3 gap-4 mb-8">
      <UCard>
        <div class="text-xs uppercase tracking-wider text-stone-500">Orders</div>
        <div class="text-3xl font-semibold mt-1">{{ totals.count }}</div>
      </UCard>
      <UCard>
        <div class="text-xs uppercase tracking-wider text-stone-500">Revenue</div>
        <div class="text-3xl font-semibold mt-1">£{{ totals.revenue.toFixed(2) }}</div>
      </UCard>
      <UCard>
        <div class="text-xs uppercase tracking-wider text-stone-500">Avg / order</div>
        <div class="text-3xl font-semibold mt-1">£{{ totals.avg.toFixed(2) }}</div>
      </UCard>
    </div>

    <div v-if="filtered.length === 0" class="py-16 text-center text-stone-500">
      <ClipboardDocumentListIcon class="w-12 h-12 mx-auto mb-2 text-slate-400" />
      No orders.
    </div>

    <div v-else class="grid md:grid-cols-2 gap-4">
      <UCard v-for="o in filtered" :key="o.id">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="min-w-0">
            <div class="text-xs text-stone-500 font-mono truncate">{{ o.id }}</div>
            <div class="text-lg font-semibold mt-1">£{{ o.total.toFixed(2) }}</div>
            <div class="text-xs text-stone-500">
              {{ o.items.length }} item(s) ·
              <span class="capitalize">{{ o.pricing_strategy.replace("_", " ") }}</span>
            </div>
          </div>
          <UBadge :color="statusColor[o.status] || 'gray'">{{ o.status }}</UBadge>
        </div>

        <div class="space-y-1 mb-3">
          <div
            v-for="i in o.items.slice(0, 3)"
            :key="i.id"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-slate-700 dark:text-stone-300 truncate">
              {{ i.quantity }}× {{ i.menu_item_name }}
            </span>
            <span class="text-stone-500">£{{ (i.unit_price * i.quantity).toFixed(2) }}</span>
          </div>
          <div v-if="o.items.length > 3" class="text-xs text-slate-400">
            + {{ o.items.length - 3 }} more
          </div>
        </div>

        <div v-if="o.status === 'placed' || o.status === 'confirmed'" class="flex justify-end pt-2 border-t border-stone-100 dark:border-slate-800">
          <UButton size="sm" variant="soft-rose" @click="cancel(o)">Cancel</UButton>
        </div>
      </UCard>
    </div>
  </DashboardLayout>
</template>
