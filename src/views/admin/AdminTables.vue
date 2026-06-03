<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { PencilSquareIcon, PlusIcon, TrashIcon, UsersIcon } from "@heroicons/vue/24/outline";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import UCard from "@/components/ui/UCard.vue";
import UButton from "@/components/ui/UButton.vue";
import UInput from "@/components/ui/UInput.vue";
import UModal from "@/components/ui/UModal.vue";
import UFormGroup from "@/components/ui/UFormGroup.vue";
import UBadge from "@/components/ui/UBadge.vue";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import type { Table } from "@/types/api";

const tables = ref<Table[]>([]);
const showCreate = ref(false);
const showEdit = ref(false);
const editTarget = ref<Table | null>(null);
const toast = useToast();

const createForm = reactive({ number: 1, seats: 4 });
const editForm = reactive({ number: 1, seats: 4 });

async function load() {
  tables.value = await api.get<Table[]>("/tables");
}
onMounted(load);

async function onCreate() {
  try {
    await api.post<Table>("/tables", createForm);
    toast.add({ title: "Table added", color: "emerald", icon: "check" });
    showCreate.value = false;
    await load();
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}

function openEdit(t: Table) {
  editTarget.value = t;
  editForm.number = t.number;
  editForm.seats = t.seats;
  showEdit.value = true;
}

async function onEdit() {
  if (!editTarget.value) return;
  try {
    await api.patch(`/tables/${editTarget.value.id}`, editForm);
    toast.add({ title: "Table updated", color: "emerald", icon: "check" });
    showEdit.value = false;
    await load();
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}

async function deleteTable(t: Table) {
  if (!confirm(`Delete table #${t.number}?`)) return;
  try {
    await api.del(`/tables/${t.id}`);
    toast.add({ title: "Deleted", color: "amber", icon: "info" });
    await load();
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}

const statusColor: Record<string, "emerald" | "amber" | "emerald" | "rose" | "sky" | "gray"> = {
  free: "emerald",
  reserved: "amber",
  occupied: "emerald",
  awaiting_bill: "rose",
  cleared: "sky",
};
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight">Tables</h1>
        <p class="text-stone-500 mt-1">The floor plan.</p>
      </div>
      <UButton @click="showCreate = true">
        <PlusIcon class="w-4 h-4" /> New table
      </UButton>
    </div>

    <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <UCard v-for="t in tables" :key="t.id">
        <div class="flex items-center justify-between">
          <div class="text-xs text-stone-500 uppercase tracking-wider">Table</div>
          <UBadge :color="statusColor[t.status] || 'gray'">{{ t.status.replace("_", " ") }}</UBadge>
        </div>
        <div class="mt-2 text-3xl font-semibold">#{{ t.number }}</div>
        <div class="mt-1 text-sm text-stone-500 flex items-center gap-1">
          <UsersIcon class="w-4 h-4" /> {{ t.seats }} seats
        </div>
        <div class="mt-3 flex justify-end gap-1 pt-2 border-t border-stone-100 dark:border-slate-800">
          <UButton size="sm" variant="ghost" @click="openEdit(t)">
            <PencilSquareIcon class="w-3 h-3" />
          </UButton>
          <UButton size="sm" variant="soft-rose" @click="deleteTable(t)">
            <TrashIcon class="w-3 h-3" />
          </UButton>
        </div>
      </UCard>
    </div>

    <UModal :open="showCreate" title="Create table" @close="showCreate = false">
      <form class="space-y-4" @submit.prevent="onCreate">
        <div class="grid grid-cols-2 gap-3">
          <UFormGroup label="Number">
            <UInput v-model="createForm.number" type="number" :min="1" required />
          </UFormGroup>
          <UFormGroup label="Seats">
            <UInput v-model="createForm.seats" type="number" :min="1" required />
          </UFormGroup>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <UButton type="button" variant="ghost" @click="showCreate = false">Cancel</UButton>
          <UButton type="submit">Create</UButton>
        </div>
      </form>
    </UModal>

    <UModal
      :open="showEdit"
      :title="`Edit Table #${editTarget?.number || ''}`"
      @close="showEdit = false"
    >
      <form class="space-y-4" @submit.prevent="onEdit">
        <div class="grid grid-cols-2 gap-3">
          <UFormGroup label="Number">
            <UInput v-model="editForm.number" type="number" :min="1" required />
          </UFormGroup>
          <UFormGroup label="Seats">
            <UInput v-model="editForm.seats" type="number" :min="1" required />
          </UFormGroup>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <UButton type="button" variant="ghost" @click="showEdit = false">Cancel</UButton>
          <UButton type="submit">Save</UButton>
        </div>
      </form>
    </UModal>
  </DashboardLayout>
</template>
