<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  MinusIcon,
  PlusIcon,
  PlusCircleIcon,
  TrashIcon,
  ChevronLeftIcon,
  SparklesIcon,
} from "@heroicons/vue/24/outline";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import UCard from "@/components/ui/UCard.vue";
import UButton from "@/components/ui/UButton.vue";
import UInput from "@/components/ui/UInput.vue";
import UTextarea from "@/components/ui/UTextarea.vue";
import UBadge from "@/components/ui/UBadge.vue";
import UModal from "@/components/ui/UModal.vue";
import UFormGroup from "@/components/ui/UFormGroup.vue";
import USelect from "@/components/ui/USelect.vue";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import type { MenuItem, Order, Table } from "@/types/api";

const props = defineProps<{ tableId: string }>();

const router = useRouter();
const toast = useToast();

const table = ref<Table | null>(null);
const menu = ref<MenuItem[]>([]);

interface DecoratorSpec {
  kind: "extra_cheese" | "allergen_flag" | "substitution";
  payload?: Record<string, unknown>;
}

interface DraftLine {
  menu_item_id: string;
  name: string;
  base_price: number;
  quantity: number;
  decorators: DecoratorSpec[];
}

const draft = reactive<{ items: DraftLine[]; notes: string }>({ items: [], notes: "" });
const submitting = ref(false);
const categoryFilter = ref("");

const showDecoratorModal = ref(false);
const decoratorTargetIdx = ref<number | null>(null);
const decoratorForm = reactive({
  kind: "extra_cheese" as DecoratorSpec["kind"],
  allergen: "nuts",
  swap_from: "",
  swap_to: "",
  price_delta: 0,
});

onMounted(async () => {
  const [t, m] = await Promise.all([
    api.get<Table>(`/tables/${props.tableId}`).catch(() => null),
    api.get<MenuItem[]>("/menu"),
  ]);
  if (!t) {
    const tables = await api.get<Table[]>("/tables");
    table.value = tables.find((x) => x.id === props.tableId) || null;
  } else {
    table.value = t;
  }
  menu.value = m.filter((i) => i.available);
});

const categories = computed(() =>
  Array.from(new Set(menu.value.map((m) => m.category))).sort(),
);

const filteredMenu = computed(() =>
  categoryFilter.value
    ? menu.value.filter((m) => m.category === categoryFilter.value)
    : menu.value,
);

const subtotal = computed(() =>
  draft.items.reduce((sum, line) => {
    const dec = line.decorators.reduce(
      (s, d) => s + (d.kind === "extra_cheese" ? 0.5 : Number(d.payload?.price_delta || 0)),
      0,
    );
    return sum + (line.base_price + dec) * line.quantity;
  }, 0),
);

function addItem(m: MenuItem) {
  const existing = draft.items.find(
    (l) => l.menu_item_id === m.id && l.decorators.length === 0,
  );
  if (existing) {
    existing.quantity += 1;
  } else {
    draft.items.push({
      menu_item_id: m.id,
      name: m.name,
      base_price: m.base_price,
      quantity: 1,
      decorators: [],
    });
  }
}

function changeQty(idx: number, delta: number) {
  const line = draft.items[idx];
  line.quantity = Math.max(1, line.quantity + delta);
}

function removeLine(idx: number) {
  draft.items.splice(idx, 1);
}

function openDecoratorModal(idx: number) {
  decoratorTargetIdx.value = idx;
  Object.assign(decoratorForm, {
    kind: "extra_cheese",
    allergen: "nuts",
    swap_from: "",
    swap_to: "",
    price_delta: 0,
  });
  showDecoratorModal.value = true;
}

function applyDecorator() {
  if (decoratorTargetIdx.value === null) return;
  const spec: DecoratorSpec = { kind: decoratorForm.kind, payload: {} };
  if (decoratorForm.kind === "allergen_flag") {
    spec.payload = { allergen: decoratorForm.allergen };
  } else if (decoratorForm.kind === "substitution") {
    spec.payload = {
      from: decoratorForm.swap_from,
      to: decoratorForm.swap_to,
      price_delta: decoratorForm.price_delta,
    };
  }
  draft.items[decoratorTargetIdx.value].decorators.push(spec);
  showDecoratorModal.value = false;
}

function removeDecorator(lineIdx: number, decIdx: number) {
  draft.items[lineIdx].decorators.splice(decIdx, 1);
}

async function submit() {
  if (draft.items.length === 0) {
    toast.add({ title: "Add at least one item", color: "amber", icon: "warning" });
    return;
  }
  submitting.value = true;
  try {
    const order = await api.post<Order>("/orders", {
      table_id: props.tableId,
      items: draft.items.map((l) => ({
        menu_item_id: l.menu_item_id,
        quantity: l.quantity,
        decorators: l.decorators,
      })),
      notes: draft.notes || undefined,
    });
    await api.post(`/orders/${order.id}/confirm`);
    toast.add({
      title: "Order placed",
      description: `£${order.total.toFixed(2)} via ${order.pricing_strategy}`,
      color: "emerald",
      icon: "check",
    });
    router.push("/waiter");
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  } finally {
    submitting.value = false;
  }
}

function describeDecorator(d: DecoratorSpec): string {
  if (d.kind === "extra_cheese") return "+ extra cheese (+£0.50)";
  if (d.kind === "allergen_flag") return `⚠ allergen: ${d.payload?.allergen}`;
  if (d.kind === "substitution") {
    const delta = Number(d.payload?.price_delta || 0);
    return `swap ${d.payload?.from} → ${d.payload?.to} (${delta >= 0 ? "+" : ""}£${delta.toFixed(2)})`;
  }
  return d.kind;
}
</script>

<template>
  <DashboardLayout>
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="btn-ghost btn-sm" @click="router.push('/waiter')">
          <ChevronLeftIcon class="w-4 h-4" /> Tables
        </button>
        <div>
          <h1 class="text-3xl font-semibold tracking-tight">
            Place order
            <span v-if="table" class="text-zinc-500 font-normal">— Table #{{ table.number }}</span>
          </h1>
          <p class="text-zinc-500 mt-1 text-sm">Pick items, add decorators, confirm.</p>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
      <!-- Menu picker -->
      <div class="lg:col-span-2 space-y-4">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-semibold">Menu</h2>
              <div class="flex items-center gap-2">
                <button
                  class="btn-sm"
                  :class="categoryFilter === '' ? 'btn-soft' : 'btn-ghost'"
                  @click="categoryFilter = ''"
                >
                  All
                </button>
                <button
                  v-for="c in categories"
                  :key="c"
                  class="btn-sm capitalize"
                  :class="categoryFilter === c ? 'btn-soft' : 'btn-ghost'"
                  @click="categoryFilter = c"
                >
                  {{ c }}
                </button>
              </div>
            </div>
          </template>

          <div v-if="filteredMenu.length === 0" class="py-10 text-center text-sm text-zinc-500">
            No items in this category yet.
          </div>
          <div class="grid sm:grid-cols-2 gap-2">
            <button
              v-for="m in filteredMenu"
              :key="m.id"
              class="text-left p-3 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-violet-400 dark:hover:ring-violet-500 hover:shadow-sm transition bg-white dark:bg-zinc-900"
              @click="addItem(m)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="font-medium truncate">{{ m.name }}</div>
                  <div class="text-xs text-zinc-500 mt-0.5 line-clamp-1">{{ m.description }}</div>
                  <div v-if="m.allergens.length" class="mt-1 flex flex-wrap gap-1">
                    <UBadge v-for="a in m.allergens" :key="a" color="rose">{{ a }}</UBadge>
                  </div>
                </div>
                <div class="text-sm font-semibold text-violet-600 dark:text-violet-400 shrink-0">
                  £{{ m.base_price.toFixed(2) }}
                </div>
              </div>
            </button>
          </div>
        </UCard>
      </div>

      <!-- Order summary -->
      <div class="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-semibold">Your order</h2>
              <UBadge color="violet">{{ draft.items.length }} line(s)</UBadge>
            </div>
          </template>

          <div v-if="draft.items.length === 0" class="py-10 text-center text-sm text-zinc-500">
            <SparklesIcon class="w-8 h-8 mx-auto mb-2 text-zinc-400" />
            Tap an item to add it.
          </div>

          <div class="space-y-3 max-h-[60vh] overflow-y-auto -mx-2 px-2">
            <div
              v-for="(line, idx) in draft.items"
              :key="idx"
              class="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 ring-1 ring-zinc-100 dark:ring-zinc-800"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="font-medium truncate">{{ line.name }}</div>
                  <div class="text-xs text-zinc-500">£{{ line.base_price.toFixed(2) }} each</div>
                </div>
                <button class="text-rose-500 hover:text-rose-600" @click="removeLine(idx)">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
              <div class="mt-2 flex items-center gap-2">
                <button class="btn-soft btn-sm" @click="changeQty(idx, -1)">
                  <MinusIcon class="w-3 h-3" />
                </button>
                <span class="font-mono text-sm w-6 text-center">{{ line.quantity }}</span>
                <button class="btn-soft btn-sm" @click="changeQty(idx, 1)">
                  <PlusIcon class="w-3 h-3" />
                </button>
                <button class="btn-ghost btn-sm ml-auto" @click="openDecoratorModal(idx)">
                  <PlusCircleIcon class="w-3 h-3" /> Modify
                </button>
              </div>
              <div v-if="line.decorators.length" class="mt-2 flex flex-wrap gap-1">
                <span
                  v-for="(d, di) in line.decorators"
                  :key="di"
                  class="badge bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                >
                  {{ describeDecorator(d) }}
                  <button class="ml-1 text-violet-500" @click="removeDecorator(idx, di)">×</button>
                </span>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="space-y-3">
              <UFormGroup label="Notes (optional)">
                <UTextarea v-model="draft.notes" :rows="2" placeholder="Allergies, prefs, etc." />
              </UFormGroup>
              <div class="flex items-center justify-between text-sm">
                <span class="text-zinc-500">Pre-pricing subtotal</span>
                <span class="font-semibold text-lg">£{{ subtotal.toFixed(2) }}</span>
              </div>
              <p class="text-xs text-zinc-400">
                Final total may differ — backend applies the current pricing strategy (happy hour,
                loyalty, group, weekend, standard).
              </p>
              <UButton
                block
                size="lg"
                :loading="submitting"
                :disabled="draft.items.length === 0"
                @click="submit"
              >
                Place & confirm
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </div>

    <UModal :open="showDecoratorModal" title="Add modifier" @close="showDecoratorModal = false">
      <div class="space-y-4">
        <UFormGroup label="Type">
          <USelect
            v-model="decoratorForm.kind"
            :options="[
              { value: 'extra_cheese', label: 'Extra cheese (+£0.50)' },
              { value: 'allergen_flag', label: 'Allergen warning' },
              { value: 'substitution', label: 'Substitution' },
            ]"
          />
        </UFormGroup>

        <UFormGroup v-if="decoratorForm.kind === 'allergen_flag'" label="Allergen">
          <USelect
            v-model="decoratorForm.allergen"
            :options="[
              { value: 'nuts', label: 'Nuts' },
              { value: 'dairy', label: 'Dairy' },
              { value: 'gluten', label: 'Gluten' },
              { value: 'shellfish', label: 'Shellfish' },
              { value: 'eggs', label: 'Eggs' },
            ]"
          />
        </UFormGroup>

        <template v-if="decoratorForm.kind === 'substitution'">
          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="From">
              <UInput v-model="decoratorForm.swap_from" placeholder="bun" />
            </UFormGroup>
            <UFormGroup label="To">
              <UInput v-model="decoratorForm.swap_to" placeholder="lettuce wrap" />
            </UFormGroup>
          </div>
          <UFormGroup label="Price delta (£)">
            <UInput v-model="decoratorForm.price_delta" type="number" :step="0.5" />
          </UFormGroup>
        </template>

        <div class="flex justify-end gap-2 pt-2">
          <UButton variant="ghost" @click="showDecoratorModal = false">Cancel</UButton>
          <UButton @click="applyDecorator">Add modifier</UButton>
        </div>
      </div>
    </UModal>
  </DashboardLayout>
</template>
