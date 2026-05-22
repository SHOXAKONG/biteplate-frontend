<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { BanknotesIcon } from "@heroicons/vue/24/outline";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import UCard from "@/components/ui/UCard.vue";
import UButton from "@/components/ui/UButton.vue";
import UBadge from "@/components/ui/UBadge.vue";
import USelect from "@/components/ui/USelect.vue";
import UModal from "@/components/ui/UModal.vue";
import UFormGroup from "@/components/ui/UFormGroup.vue";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import type { Bill } from "@/types/api";

const bills = ref<Bill[]>([]);
const filter = ref("");
const toast = useToast();

const payDialog = ref(false);
const payTarget = ref<Bill | null>(null);
const payMethod = ref<"cash" | "card" | "online">("cash");

async function load() {
  const path = filter.value ? `/bills?status=${filter.value}` : "/bills";
  bills.value = await api.get<Bill[]>(path);
}
onMounted(load);

const totals = computed(() => ({
  unpaid: bills.value.filter((b) => b.status === "unpaid").reduce((s, b) => s + b.total, 0),
  paid: bills.value.filter((b) => b.status === "paid").reduce((s, b) => s + b.total, 0),
  count: bills.value.length,
}));

const statusColor: Record<string, "emerald" | "amber" | "rose" | "gray"> = {
  paid: "emerald",
  unpaid: "amber",
  void: "rose",
};

function openPay(b: Bill) {
  payTarget.value = b;
  payMethod.value = "cash";
  payDialog.value = true;
}

async function markPaid() {
  if (!payTarget.value) return;
  try {
    await api.patch(`/bills/${payTarget.value.id}`, {
      status: "paid",
      payment_method: payMethod.value,
    });
    toast.add({ title: "Bill marked paid", color: "emerald", icon: "check" });
    payDialog.value = false;
    await load();
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}

async function voidBill(b: Bill) {
  if (!confirm("Void this bill?")) return;
  await api.patch(`/bills/${b.id}`, { status: "void" });
  toast.add({ title: "Bill voided", color: "amber", icon: "warning" });
  await load();
}

async function updateFilter(v: string) {
  filter.value = v;
  await load();
}
</script>

<template>
  <DashboardLayout>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight">Bill history</h1>
        <p class="text-zinc-500 mt-1">All bills, paid and unpaid.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-sm" :class="filter === '' ? 'btn-soft' : 'btn-ghost'" @click="updateFilter('')">All</button>
        <button class="btn-sm" :class="filter === 'unpaid' ? 'btn-soft' : 'btn-ghost'" @click="updateFilter('unpaid')">Unpaid</button>
        <button class="btn-sm" :class="filter === 'paid' ? 'btn-soft' : 'btn-ghost'" @click="updateFilter('paid')">Paid</button>
        <button class="btn-sm" :class="filter === 'void' ? 'btn-soft' : 'btn-ghost'" @click="updateFilter('void')">Void</button>
      </div>
    </div>

    <div class="grid sm:grid-cols-3 gap-4 mb-8">
      <UCard>
        <div class="text-xs uppercase tracking-wider text-zinc-500">Outstanding</div>
        <div class="text-3xl font-semibold mt-1 text-amber-600 dark:text-amber-400">
          £{{ totals.unpaid.toFixed(2) }}
        </div>
      </UCard>
      <UCard>
        <div class="text-xs uppercase tracking-wider text-zinc-500">Collected</div>
        <div class="text-3xl font-semibold mt-1 text-emerald-600 dark:text-emerald-400">
          £{{ totals.paid.toFixed(2) }}
        </div>
      </UCard>
      <UCard>
        <div class="text-xs uppercase tracking-wider text-zinc-500">Bills shown</div>
        <div class="text-3xl font-semibold mt-1">{{ totals.count }}</div>
      </UCard>
    </div>

    <UCard no-padding>
      <table class="w-full text-sm">
        <thead class="border-b border-zinc-200/70 dark:border-zinc-800/70">
          <tr class="text-left text-xs uppercase tracking-wider text-zinc-500">
            <th class="px-5 py-3">When</th>
            <th class="px-5 py-3">Order</th>
            <th class="px-5 py-3">Subtotal</th>
            <th class="px-5 py-3">VAT</th>
            <th class="px-5 py-3">Total</th>
            <th class="px-5 py-3">Strategy</th>
            <th class="px-5 py-3">Status</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="bills.length === 0">
            <td colspan="8" class="px-5 py-10 text-center text-zinc-500">
              <BanknotesIcon class="w-10 h-10 mx-auto mb-2 text-zinc-400" />
              No bills.
            </td>
          </tr>
          <tr
            v-for="b in bills"
            :key="b.id"
            class="border-t border-zinc-200/40 dark:border-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
          >
            <td class="px-5 py-3 text-zinc-500">
              {{ b.created_at ? new Date(b.created_at).toLocaleString() : "—" }}
            </td>
            <td class="px-5 py-3 font-mono text-xs text-zinc-500">{{ b.order_id.slice(0, 8) }}</td>
            <td class="px-5 py-3">£{{ b.subtotal.toFixed(2) }}</td>
            <td class="px-5 py-3 text-zinc-500">£{{ b.tax.toFixed(2) }}</td>
            <td class="px-5 py-3 font-semibold">£{{ b.total.toFixed(2) }}</td>
            <td class="px-5 py-3 capitalize text-zinc-500">{{ b.pricing_strategy.replace("_", " ") }}</td>
            <td class="px-5 py-3">
              <UBadge :color="statusColor[b.status] || 'gray'">{{ b.status }}</UBadge>
              <span v-if="b.payment_method" class="ml-1 text-xs text-zinc-500">
                ({{ b.payment_method }})
              </span>
            </td>
            <td class="px-5 py-3 text-right">
              <div v-if="b.status === 'unpaid'" class="flex gap-1 justify-end">
                <UButton size="sm" @click="openPay(b)">Mark paid</UButton>
                <UButton size="sm" variant="soft-rose" @click="voidBill(b)">Void</UButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>

    <UModal :open="payDialog" title="Mark as paid" @close="payDialog = false">
      <div class="space-y-4">
        <div class="text-sm text-zinc-500">
          Bill total: <span class="font-semibold text-base text-zinc-900 dark:text-zinc-100">£{{ payTarget?.total.toFixed(2) }}</span>
        </div>
        <UFormGroup label="Payment method">
          <USelect
            v-model="payMethod"
            :options="[
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Card' },
              { value: 'online', label: 'Online' },
            ]"
          />
        </UFormGroup>
        <div class="flex justify-end gap-2 pt-2">
          <UButton variant="ghost" @click="payDialog = false">Cancel</UButton>
          <UButton @click="markPaid">Confirm payment</UButton>
        </div>
      </div>
    </UModal>
  </DashboardLayout>
</template>
