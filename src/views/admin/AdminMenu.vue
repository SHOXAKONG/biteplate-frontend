<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/vue/24/outline";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import UCard from "@/components/ui/UCard.vue";
import UButton from "@/components/ui/UButton.vue";
import UInput from "@/components/ui/UInput.vue";
import UTextarea from "@/components/ui/UTextarea.vue";
import USelect from "@/components/ui/USelect.vue";
import UToggle from "@/components/ui/UToggle.vue";
import UModal from "@/components/ui/UModal.vue";
import UFormGroup from "@/components/ui/UFormGroup.vue";
import UBadge from "@/components/ui/UBadge.vue";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import type { MenuItem, MenuItemCreate } from "@/types/api";

const items = ref<MenuItem[]>([]);
const showCreate = ref(false);
const showEdit = ref(false);
const editTarget = ref<MenuItem | null>(null);
const loading = ref(true);
const toast = useToast();

const createForm = reactive<MenuItemCreate>({
  name: "",
  description: "",
  base_price: 0,
  category: "main",
  is_combo: false,
  allergens: [],
});

const editForm = reactive({
  name: "",
  description: "",
  base_price: 0,
  category: "main",
  is_combo: false,
  available: true,
});

const categoryOptions = ["main", "starter", "side", "drink", "dessert"].map((c) => ({
  value: c,
  label: c,
}));

async function load() {
  loading.value = true;
  items.value = await api.get<MenuItem[]>("/menu");
  loading.value = false;
}

onMounted(load);

async function onCreate() {
  try {
    await api.post<MenuItem>("/menu", createForm);
    toast.add({ title: "Menu item created", color: "emerald", icon: "check" });
    showCreate.value = false;
    Object.assign(createForm, {
      name: "",
      description: "",
      base_price: 0,
      category: "main",
      is_combo: false,
      allergens: [],
    });
    await load();
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}

function openEdit(m: MenuItem) {
  editTarget.value = m;
  editForm.name = m.name;
  editForm.description = m.description || "";
  editForm.base_price = m.base_price;
  editForm.category = m.category;
  editForm.is_combo = m.is_combo;
  editForm.available = m.available;
  showEdit.value = true;
}

async function onEdit() {
  if (!editTarget.value) return;
  try {
    await api.patch<MenuItem>(`/menu/${editTarget.value.id}`, editForm);
    toast.add({ title: "Menu item updated", color: "emerald", icon: "check" });
    showEdit.value = false;
    await load();
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}

async function deleteItem(m: MenuItem) {
  if (!confirm(`Delete "${m.name}"?`)) return;
  try {
    await api.del(`/menu/${m.id}`);
    toast.add({ title: "Deleted", color: "amber", icon: "info" });
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
        <h1 class="text-3xl font-semibold tracking-tight">Menu</h1>
        <p class="text-stone-500 mt-1">All dishes and combos for this location.</p>
      </div>
      <UButton @click="showCreate = true">
        <PlusIcon class="w-4 h-4" /> New item
      </UButton>
    </div>

    <UCard no-padding>
      <table class="w-full">
        <thead class="border-b border-stone-200/70 dark:border-slate-800/70">
          <tr class="text-left text-xs uppercase tracking-wider text-stone-500">
            <th class="px-5 py-3">Name</th>
            <th class="px-5 py-3">Category</th>
            <th class="px-5 py-3">Price</th>
            <th class="px-5 py-3">Available</th>
            <th class="px-5 py-3">Type</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="px-5 py-10 text-center text-sm text-stone-500">Loading…</td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td colspan="6" class="px-5 py-10 text-center text-sm text-stone-500">
              No items yet. Click <span class="font-semibold">New item</span> to add one.
            </td>
          </tr>
          <tr
            v-for="m in items"
            :key="m.id"
            class="border-t border-stone-200/40 dark:border-slate-800/40 hover:bg-stone-50 dark:hover:bg-slate-900/40"
          >
            <td class="px-5 py-3 font-medium">{{ m.name }}</td>
            <td class="px-5 py-3 text-sm text-stone-500 capitalize">{{ m.category }}</td>
            <td class="px-5 py-3">£{{ m.base_price.toFixed(2) }}</td>
            <td class="px-5 py-3">
              <UBadge :color="m.available ? 'emerald' : 'gray'">
                {{ m.available ? "Yes" : "No" }}
              </UBadge>
            </td>
            <td class="px-5 py-3">
              <UBadge :color="m.is_combo ? 'amber' : 'sky'">
                {{ m.is_combo ? "Combo" : "Simple" }}
              </UBadge>
            </td>
            <td class="px-5 py-3 text-right">
              <div class="flex gap-1 justify-end">
                <UButton size="sm" variant="ghost" @click="openEdit(m)">
                  <PencilSquareIcon class="w-4 h-4" />
                </UButton>
                <UButton size="sm" variant="soft-rose" @click="deleteItem(m)">
                  <TrashIcon class="w-4 h-4" />
                </UButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>

    <UModal :open="showCreate" title="Create menu item" @close="showCreate = false">
      <form class="space-y-4" @submit.prevent="onCreate">
        <UFormGroup label="Name"><UInput v-model="createForm.name" required /></UFormGroup>
        <UFormGroup label="Description">
          <UTextarea v-model="createForm.description as string" />
        </UFormGroup>
        <div class="grid grid-cols-2 gap-3">
          <UFormGroup label="Price (£)">
            <UInput v-model="createForm.base_price" type="number" :step="0.01" :min="0" required />
          </UFormGroup>
          <UFormGroup label="Category">
            <USelect v-model="createForm.category as string" :options="categoryOptions" />
          </UFormGroup>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-700 dark:text-stone-300">Is a combo?</span>
          <UToggle v-model="createForm.is_combo as boolean" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <UButton type="button" variant="ghost" @click="showCreate = false">Cancel</UButton>
          <UButton type="submit">Create</UButton>
        </div>
      </form>
    </UModal>

    <UModal :open="showEdit" :title="`Edit ${editTarget?.name || ''}`" @close="showEdit = false">
      <form class="space-y-4" @submit.prevent="onEdit">
        <UFormGroup label="Name"><UInput v-model="editForm.name" required /></UFormGroup>
        <UFormGroup label="Description"><UTextarea v-model="editForm.description" /></UFormGroup>
        <div class="grid grid-cols-2 gap-3">
          <UFormGroup label="Price (£)">
            <UInput v-model="editForm.base_price" type="number" :step="0.01" :min="0" required />
          </UFormGroup>
          <UFormGroup label="Category">
            <USelect v-model="editForm.category" :options="categoryOptions" />
          </UFormGroup>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-700 dark:text-stone-300">Available</span>
          <UToggle v-model="editForm.available" />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-700 dark:text-stone-300">Is a combo?</span>
          <UToggle v-model="editForm.is_combo" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <UButton type="button" variant="ghost" @click="showEdit = false">Cancel</UButton>
          <UButton type="submit">Save</UButton>
        </div>
      </form>
    </UModal>
  </DashboardLayout>
</template>
