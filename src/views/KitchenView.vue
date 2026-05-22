<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { ArrowUturnLeftIcon, PlayIcon } from "@heroicons/vue/24/outline";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import UCard from "@/components/ui/UCard.vue";
import UButton from "@/components/ui/UButton.vue";
import UBadge from "@/components/ui/UBadge.vue";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import type { KitchenSnapshot } from "@/types/api";

const snap = ref<KitchenSnapshot>({ pending: [], in_progress: [], completed: [], history_size: 0 });
const toast = useToast();
let timer: number | undefined;

async function refresh() {
  try {
    snap.value = await api.get<KitchenSnapshot>("/kitchen/state");
  } catch {
    // swallow
  }
}

onMounted(async () => {
  await refresh();
  timer = window.setInterval(refresh, 4000);
});
onUnmounted(() => { if (timer) clearInterval(timer); });

async function startNext() {
  try {
    await api.post("/kitchen/start-next");
    await refresh();
  } catch (e: any) {
    toast.add({ title: "Could not start next", description: e?.detail, color: "rose", icon: "x" });
  }
}

async function undo() {
  await api.post("/kitchen/commands/undo");
  await refresh();
  toast.add({ title: "Undone", color: "amber", icon: "info" });
}

async function command(kind: string, order_id: string) {
  await api.post("/kitchen/commands", { kind, order_id });
  await refresh();
}

const cols = [
  { key: "pending" as const, title: "Pending", color: "amber" as const },
  { key: "in_progress" as const, title: "In progress", color: "violet" as const },
  { key: "completed" as const, title: "Completed", color: "emerald" as const },
];
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight">Kitchen</h1>
        <p class="text-zinc-500 mt-1">History: {{ snap.history_size }} commands</p>
      </div>
      <div class="flex gap-2">
        <UButton variant="soft-amber" @click="undo">
          <ArrowUturnLeftIcon class="w-4 h-4" /> Undo
        </UButton>
        <UButton @click="startNext">
          <PlayIcon class="w-4 h-4" /> Start next
        </UButton>
      </div>
    </div>

    <div class="grid md:grid-cols-3 gap-4">
      <UCard v-for="col in cols" :key="col.key">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">{{ col.title }}</h3>
            <UBadge :color="col.color">{{ (snap[col.key] as any[]).length }}</UBadge>
          </div>
        </template>
        <div v-if="(snap[col.key] as any[]).length === 0" class="py-6 text-center text-sm text-zinc-500">
          Empty
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="ticket in (snap[col.key] as any[])"
            :key="String(ticket.order_id)"
            class="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 ring-1 ring-zinc-100 dark:ring-zinc-800"
          >
            <div class="font-mono text-xs text-zinc-500">
              {{ String(ticket.order_id).slice(0, 8) }}
            </div>
            <div v-if="col.key === 'pending'" class="mt-2 flex flex-wrap gap-2">
              <button class="btn-soft-rose btn-sm" @click="command('cancel', String(ticket.order_id))">
                Cancel
              </button>
              <button class="btn-soft btn-sm" @click="command('expedite', String(ticket.order_id))">
                Expedite
              </button>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </DashboardLayout>
</template>
