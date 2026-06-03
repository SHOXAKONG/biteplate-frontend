<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { PlusIcon, UserPlusIcon, KeyIcon } from "@heroicons/vue/24/outline";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import UCard from "@/components/ui/UCard.vue";
import UButton from "@/components/ui/UButton.vue";
import UInput from "@/components/ui/UInput.vue";
import UModal from "@/components/ui/UModal.vue";
import UFormGroup from "@/components/ui/UFormGroup.vue";
import USelect from "@/components/ui/USelect.vue";
import UToggle from "@/components/ui/UToggle.vue";
import UBadge from "@/components/ui/UBadge.vue";
import RoleBadge from "@/components/RoleBadge.vue";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import type { StaffUser } from "@/types/api";

const users = ref<StaffUser[]>([]);
const roleFilter = ref("");
const showCreate = ref(false);
const showReset = ref(false);
const resetTarget = ref<StaffUser | null>(null);
const resetPassword = ref("");
const toast = useToast();

const form = reactive({
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  role: "waiter",
});

const roleOptions = [
  { value: "", label: "All roles" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "head_chef", label: "Head chef" },
  { value: "waiter", label: "Waiter" },
  { value: "cashier", label: "Cashier" },
  { value: "customer", label: "Customer" },
];

const staffRoleOptions = [
  { value: "manager", label: "Manager" },
  { value: "head_chef", label: "Head chef" },
  { value: "waiter", label: "Waiter" },
  { value: "cashier", label: "Cashier" },
];

async function load() {
  const path = roleFilter.value ? `/admin/users?role=${roleFilter.value}` : "/admin/users";
  users.value = await api.get<StaffUser[]>(path);
}
onMounted(load);

const grouped = computed(() => {
  const out: Record<string, StaffUser[]> = {};
  for (const u of users.value) {
    const primary = u.roles[0] || "no role";
    (out[primary] ||= []).push(u);
  }
  return out;
});

async function onCreate() {
  try {
    await api.post("/admin/users", form);
    toast.add({ title: "Staff created", description: form.username, color: "emerald", icon: "check" });
    showCreate.value = false;
    Object.assign(form, {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      role: "waiter",
    });
    await load();
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}

async function toggleEnabled(u: StaffUser) {
  try {
    await api.patch(`/admin/users/${u.id}/enabled`, { enabled: !u.enabled });
    toast.add({
      title: u.enabled ? "User disabled" : "User enabled",
      color: u.enabled ? "amber" : "emerald",
      icon: "info",
    });
    await load();
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}

function openReset(u: StaffUser) {
  resetTarget.value = u;
  resetPassword.value = "";
  showReset.value = true;
}

async function doReset() {
  if (!resetTarget.value) return;
  try {
    await api.post(`/admin/users/${resetTarget.value.id}/reset-password`, {
      new_password: resetPassword.value,
    });
    toast.add({
      title: "Password reset",
      description: `New password set for ${resetTarget.value.username}`,
      color: "emerald",
      icon: "check",
    });
    showReset.value = false;
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  }
}

async function changeFilter(v: string) {
  roleFilter.value = v;
  await load();
}
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight">Staff</h1>
        <p class="text-stone-500 mt-1">Everyone in the Keycloak realm.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-44">
          <USelect :modelValue="roleFilter" :options="roleOptions" @update:modelValue="(v) => changeFilter(String(v))" />
        </div>
        <UButton @click="showCreate = true">
          <PlusIcon class="w-4 h-4" /> New staff
        </UButton>
      </div>
    </div>

    <div v-if="users.length === 0" class="py-16 text-center text-stone-500">
      <UserPlusIcon class="w-12 h-12 mx-auto mb-3 text-slate-400" />
      No users in this filter.
    </div>

    <div v-for="(group, role) in grouped" :key="role" class="mb-6">
      <div class="flex items-center gap-2 mb-3">
        <RoleBadge :role="String(role)" />
        <span class="text-xs text-stone-500">{{ group.length }} user(s)</span>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <UCard v-for="u in group" :key="u.id">
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br"
              :class="
                u.enabled
                  ? 'from-emerald-500 to-amber-500'
                  : 'from-slate-400 to-stone-500'
              "
            >
              {{ u.username.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{{ u.username }}</div>
              <div class="text-xs text-stone-500 truncate">{{ u.email || "—" }}</div>
              <div class="text-xs text-stone-500 truncate">
                {{ [u.first_name, u.last_name].filter(Boolean).join(" ") || "—" }}
              </div>
            </div>
            <UBadge :color="u.enabled ? 'emerald' : 'gray'">
              {{ u.enabled ? "active" : "disabled" }}
            </UBadge>
          </div>
          <div class="mt-3 flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-slate-800">
            <UButton size="sm" variant="ghost" @click="openReset(u)">
              <KeyIcon class="w-3 h-3" /> Reset pw
            </UButton>
            <UButton
              size="sm"
              :variant="u.enabled ? 'soft-rose' : 'soft'"
              @click="toggleEnabled(u)"
            >
              {{ u.enabled ? "Disable" : "Enable" }}
            </UButton>
          </div>
        </UCard>
      </div>
    </div>

    <UModal :open="showCreate" title="Create staff member" @close="showCreate = false">
      <form class="space-y-4" @submit.prevent="onCreate">
        <div class="grid grid-cols-2 gap-3">
          <UFormGroup label="First name"><UInput v-model="form.first_name" required /></UFormGroup>
          <UFormGroup label="Last name"><UInput v-model="form.last_name" required /></UFormGroup>
        </div>
        <UFormGroup label="Username"><UInput v-model="form.username" required /></UFormGroup>
        <UFormGroup label="Email"><UInput v-model="form.email" type="email" required /></UFormGroup>
        <UFormGroup label="Password" hint="Min 8 characters">
          <UInput v-model="form.password" type="password" required />
        </UFormGroup>
        <UFormGroup label="Role"><USelect v-model="form.role" :options="staffRoleOptions" /></UFormGroup>
        <div class="flex justify-end gap-2 pt-2">
          <UButton type="button" variant="ghost" @click="showCreate = false">Cancel</UButton>
          <UButton type="submit">Create</UButton>
        </div>
      </form>
    </UModal>

    <UModal :open="showReset" :title="`Reset password for ${resetTarget?.username || ''}`" @close="showReset = false">
      <form class="space-y-4" @submit.prevent="doReset">
        <UFormGroup label="New password" hint="Min 8 characters">
          <UInput v-model="resetPassword" type="password" :min="8" required />
        </UFormGroup>
        <div class="flex justify-end gap-2 pt-2">
          <UButton type="button" variant="ghost" @click="showReset = false">Cancel</UButton>
          <UButton type="submit">Reset</UButton>
        </div>
      </form>
    </UModal>
  </DashboardLayout>
</template>
