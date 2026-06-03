<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { CalendarDaysIcon, PlusIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import UCard from "@/components/ui/UCard.vue";
import UButton from "@/components/ui/UButton.vue";
import UInput from "@/components/ui/UInput.vue";
import UModal from "@/components/ui/UModal.vue";
import USelect from "@/components/ui/USelect.vue";
import UFormGroup from "@/components/ui/UFormGroup.vue";
import UBadge from "@/components/ui/UBadge.vue";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/lib/toast";
import type { Reservation, Table } from "@/types/api";

const tables = ref<Table[]>([]);
const mine = ref<Reservation[]>([]);
const showCreate = ref(false);
const showEdit = ref(false);
const editTarget = ref<Reservation | null>(null);
const auth = useAuthStore();
const toast = useToast();

const form = reactive({
  table_id: "",
  customer_name: auth.user?.username || "",
  customer_phone: "",
  party_size: 2,
  booking_time: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
});

const editForm = reactive({
  party_size: 2,
  customer_phone: "",
  booking_time: "",
});

async function load() {
  tables.value = await api.get<Table[]>("/tables");
  mine.value = await api.get<Reservation[]>("/reservations/mine");
}
onMounted(load);

async function onCreate() {
  try {
    await api.post<Reservation>("/reservations", {
      ...form,
      booking_time: new Date(form.booking_time).toISOString(),
    });
    toast.add({
      title: "Reservation confirmed",
      description: "You'll get an SMS reminder 2 hours before.",
      color: "emerald",
      icon: "check",
    });
    showCreate.value = false;
    await load();
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}

function openEdit(r: Reservation) {
  editTarget.value = r;
  editForm.party_size = r.party_size;
  editForm.customer_phone = r.customer_phone;
  editForm.booking_time = r.booking_time.slice(0, 16);
  showEdit.value = true;
}

async function onEdit() {
  if (!editTarget.value) return;
  try {
    await api.patch(`/reservations/${editTarget.value.id}`, {
      party_size: editForm.party_size,
      customer_phone: editForm.customer_phone,
      booking_time: new Date(editForm.booking_time).toISOString(),
    });
    toast.add({ title: "Reservation updated", color: "emerald", icon: "check" });
    showEdit.value = false;
    await load();
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}

async function cancelReservation(r: Reservation) {
  if (!confirm(`Cancel reservation for ${new Date(r.booking_time).toLocaleString()}?`)) return;
  try {
    await api.del(`/reservations/${r.id}`);
    toast.add({ title: "Cancelled", color: "amber", icon: "info" });
    await load();
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}

function statusColor(s: string) {
  if (s === "confirmed") return "emerald" as const;
  if (s === "cancelled") return "rose" as const;
  return "gray" as const;
}

function isUpcoming(r: Reservation) {
  return new Date(r.booking_time).getTime() > Date.now() && r.status !== "cancelled";
}
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight">Reservations</h1>
        <p class="text-stone-500 mt-1">Your bookings — past, upcoming, cancelled.</p>
      </div>
      <UButton @click="showCreate = true">
        <PlusIcon class="w-4 h-4" /> Book a table
      </UButton>
    </div>

    <div v-if="mine.length === 0" class="py-16 text-center text-stone-500">
      <CalendarDaysIcon class="w-12 h-12 mx-auto mb-4 text-slate-400" />
      <p>No reservations yet</p>
    </div>

    <div v-else class="space-y-3">
      <UCard v-for="r in mine" :key="r.id">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-lg text-white flex items-center justify-center bg-gradient-to-br"
            :class="
              r.status === 'cancelled'
                ? 'from-slate-400 to-stone-500'
                : 'from-emerald-500 to-amber-500'
            "
          >
            <CalendarDaysIcon class="w-6 h-6" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium">{{ new Date(r.booking_time).toLocaleString() }}</div>
            <div class="text-sm text-stone-500">
              {{ r.party_size }} guests · table
              {{ tables.find((t) => t.id === r.table_id)?.number || "?" }} · {{ r.customer_phone }}
            </div>
          </div>
          <UBadge :color="statusColor(r.status)">{{ r.status }}</UBadge>
          <div v-if="isUpcoming(r)" class="flex gap-1">
            <UButton size="sm" variant="ghost" @click="openEdit(r)">Edit</UButton>
            <UButton size="sm" variant="soft-rose" @click="cancelReservation(r)">
              <XMarkIcon class="w-3 h-3" /> Cancel
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <UModal :open="showCreate" title="Book a table" @close="showCreate = false">
      <form class="space-y-4" @submit.prevent="onCreate">
        <UFormGroup label="Table">
          <USelect
            v-model="form.table_id"
            :options="tables.map((t) => ({ value: t.id, label: `Table #${t.number} (${t.seats} seats)` }))"
            required
          />
        </UFormGroup>
        <div class="grid grid-cols-2 gap-3">
          <UFormGroup label="Name"><UInput v-model="form.customer_name" required /></UFormGroup>
          <UFormGroup label="Phone"><UInput v-model="form.customer_phone" placeholder="+998..." required /></UFormGroup>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <UFormGroup label="Party size">
            <UInput v-model="form.party_size" type="number" :min="1" :max="20" required />
          </UFormGroup>
          <UFormGroup label="When">
            <UInput v-model="form.booking_time" type="datetime-local" required />
          </UFormGroup>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <UButton type="button" variant="ghost" @click="showCreate = false">Cancel</UButton>
          <UButton type="submit">Book</UButton>
        </div>
      </form>
    </UModal>

    <UModal :open="showEdit" title="Edit reservation" @close="showEdit = false">
      <form class="space-y-4" @submit.prevent="onEdit">
        <div class="grid grid-cols-2 gap-3">
          <UFormGroup label="Party size">
            <UInput v-model="editForm.party_size" type="number" :min="1" :max="20" required />
          </UFormGroup>
          <UFormGroup label="Phone">
            <UInput v-model="editForm.customer_phone" required />
          </UFormGroup>
        </div>
        <UFormGroup label="When">
          <UInput v-model="editForm.booking_time" type="datetime-local" required />
        </UFormGroup>
        <div class="flex justify-end gap-2 pt-2">
          <UButton type="button" variant="ghost" @click="showEdit = false">Cancel</UButton>
          <UButton type="submit">Save changes</UButton>
        </div>
      </form>
    </UModal>
  </DashboardLayout>
</template>
