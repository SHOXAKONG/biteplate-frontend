<script setup lang="ts">
import { onMounted, ref } from "vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import UCard from "@/components/ui/UCard.vue";
import UInput from "@/components/ui/UInput.vue";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import type { Bill, Order } from "@/types/api";

const orders = ref<Order[]>([]);
const generated = ref<Bill | null>(null);
const splitCount = ref(1);
const toast = useToast();

onMounted(async () => {
  orders.value = await api.get<Order[]>("/orders");
});

async function generate(orderId: string) {
  try {
    generated.value = await api.post<Bill>("/bills", {
      order_id: orderId,
      split_count: splitCount.value,
    });
    toast.add({ title: "Bill generated", color: "emerald", icon: "check" });
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold tracking-tight">Cashier</h1>
      <p class="text-zinc-500 mt-1">Generate bills, split among guests.</p>
    </div>

    <div class="grid lg:grid-cols-2 gap-4">
      <UCard>
        <template #header><h2 class="font-semibold">Open orders</h2></template>
        <div v-if="orders.length === 0" class="py-6 text-center text-sm text-zinc-500">
          No open orders
        </div>
        <div class="space-y-2">
          <div
            v-for="o in orders"
            :key="o.id"
            class="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center gap-3"
          >
            <div class="flex-1 min-w-0">
              <div class="font-mono text-xs text-zinc-500 truncate">{{ o.id }}</div>
              <div class="text-sm font-medium">
                £{{ o.total.toFixed(2) }} · {{ o.pricing_strategy }}
              </div>
            </div>
            <div class="w-16">
              <UInput v-model="splitCount" type="number" :min="1" :max="20" />
            </div>
            <button class="btn-primary btn-sm" @click="generate(o.id)">Bill</button>
          </div>
        </div>
      </UCard>

      <UCard v-if="generated">
        <template #header><h2 class="font-semibold">Latest bill</h2></template>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-zinc-500">Subtotal</span>
            <span>£{{ generated.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-500">VAT</span>
            <span>£{{ generated.tax.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-base font-semibold pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span>Total</span>
            <span>£{{ generated.total.toFixed(2) }}</span>
          </div>
          <div class="pt-2">
            <div class="text-xs text-zinc-500 uppercase tracking-wider mb-2">Splits</div>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="s in generated.splits"
                :key="s.index"
                class="px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-900 flex justify-between"
              >
                <span class="text-zinc-500">Guest {{ s.index + 1 }}</span>
                <span class="font-medium">£{{ s.amount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </DashboardLayout>
</template>
