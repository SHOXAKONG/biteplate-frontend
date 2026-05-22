<script setup lang="ts">
import { reactive, ref } from "vue";
import { KeyIcon, UserCircleIcon } from "@heroicons/vue/24/outline";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import UCard from "@/components/ui/UCard.vue";
import UButton from "@/components/ui/UButton.vue";
import UInput from "@/components/ui/UInput.vue";
import UFormGroup from "@/components/ui/UFormGroup.vue";
import RoleBadge from "@/components/RoleBadge.vue";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/lib/toast";

const auth = useAuthStore();
const toast = useToast();

const form = reactive({
  current_password: "",
  new_password: "",
  confirm: "",
});
const saving = ref(false);

async function onChangePassword() {
  if (form.new_password !== form.confirm) {
    toast.add({ title: "Passwords don't match", color: "rose", icon: "x" });
    return;
  }
  if (form.new_password.length < 8) {
    toast.add({ title: "Password too short", description: "Minimum 8 characters", color: "rose", icon: "x" });
    return;
  }
  saving.value = true;
  try {
    await api.post("/auth/change-password", {
      current_password: form.current_password,
      new_password: form.new_password,
    });
    toast.add({
      title: "Password changed",
      description: "Next time you sign in, use the new one.",
      color: "emerald",
      icon: "check",
    });
    form.current_password = "";
    form.new_password = "";
    form.confirm = "";
  } catch (e: any) {
    toast.add({ title: "Failed", description: e?.detail, color: "rose", icon: "x" });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold tracking-tight">Profile</h1>
      <p class="text-zinc-500 mt-1">Your account.</p>
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
      <UCard class="lg:col-span-1">
        <div class="flex flex-col items-center text-center py-4">
          <div
            class="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center text-3xl font-semibold shadow-lg shadow-violet-500/30"
          >
            {{ (auth.user?.username || "?").charAt(0).toUpperCase() }}
          </div>
          <div class="mt-4 font-semibold text-lg">{{ auth.user?.username }}</div>
          <div class="text-sm text-zinc-500">{{ auth.user?.email }}</div>
          <div class="mt-3 flex flex-wrap gap-1 justify-center">
            <RoleBadge v-for="r in auth.roles" :key="r" :role="r" />
          </div>
        </div>

        <div class="pt-4 mt-4 border-t border-zinc-200/70 dark:border-zinc-800/70 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-zinc-500">User ID</span>
            <span class="font-mono text-xs truncate ml-2">{{ auth.user?.sub.slice(0, 8) }}…</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-500">Primary role</span>
            <span class="capitalize">{{ auth.primaryRole?.replace("_", " ") }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-500">Lands on</span>
            <span class="font-mono text-xs">{{ auth.homeRoute }}</span>
          </div>
        </div>
      </UCard>

      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center gap-2">
            <KeyIcon class="w-5 h-5 text-violet-500" />
            <h2 class="font-semibold">Change password</h2>
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="onChangePassword">
          <UFormGroup label="Current password">
            <UInput v-model="form.current_password" type="password" required autocomplete="current-password" />
          </UFormGroup>
          <div class="grid sm:grid-cols-2 gap-3">
            <UFormGroup label="New password" hint="Min 8 characters">
              <UInput v-model="form.new_password" type="password" required autocomplete="new-password" />
            </UFormGroup>
            <UFormGroup label="Confirm new password">
              <UInput v-model="form.confirm" type="password" required autocomplete="new-password" />
            </UFormGroup>
          </div>
          <div class="flex justify-end pt-2">
            <UButton type="submit" :loading="saving">Update password</UButton>
          </div>
        </form>

        <template #footer>
          <div class="text-xs text-zinc-500 flex items-center gap-2">
            <UserCircleIcon class="w-4 h-4" />
            Your password is verified by Keycloak via a password-grant login. Profile fields (name,
            email) are managed in the Keycloak admin console.
          </div>
        </template>
      </UCard>
    </div>
  </DashboardLayout>
</template>
