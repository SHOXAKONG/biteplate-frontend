<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { UserIcon, LockClosedIcon } from "@heroicons/vue/24/outline";
import BrandLogo from "@/components/BrandLogo.vue";
import UCard from "@/components/ui/UCard.vue";
import UButton from "@/components/ui/UButton.vue";
import UInput from "@/components/ui/UInput.vue";
import UFormGroup from "@/components/ui/UFormGroup.vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/lib/toast";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const form = reactive({ username: "", password: "" });
const loading = ref(false);

async function onSubmit() {
  loading.value = true;
  try {
    await auth.login(form.username, form.password);
    const redirect = (route.query.redirect as string) || auth.homeRoute;
    router.push(redirect);
  } catch (e: any) {
    toast.add({
      title: "Sign in failed",
      description: e?.detail || "Check your username and password.",
      color: "rose",
      icon: "x",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="min-h-screen grid lg:grid-cols-2">
    <!-- Hero half — food photo with overlay -->
    <aside
      class="hidden lg:flex relative items-end p-12 text-white overflow-hidden"
      style="background-image: url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80&auto=format&fit=crop'); background-size: cover; background-position: center;"
    >
      <div class="absolute inset-0 hero-overlay"></div>
      <div class="relative z-10 max-w-md">
        <div class="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur ring-1 ring-white/20 text-xs uppercase tracking-wider font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Smart Restaurant Platform
        </div>
        <h2 class="text-4xl font-semibold leading-tight text-balance">
          Serve faster. Track everything. Delight every guest.
        </h2>
        <p class="mt-4 text-white/80 leading-relaxed">
          BitePlate unifies your menu, kitchen, tables, and billing — so your team can focus on the food.
        </p>
      </div>
    </aside>

    <!-- Form half -->
    <div class="flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="flex justify-center mb-6">
          <RouterLink to="/"><BrandLogo size="lg" /></RouterLink>
        </div>

        <UCard class="glass shadow-2xl shadow-emerald-500/10">
        <template #header>
          <div>
            <h1 class="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p class="text-sm text-stone-500 mt-1">Sign in to continue</p>
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <UFormGroup label="Username">
            <div class="relative">
              <UserIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
              <UInput
                v-model="form.username"
                placeholder="manager_alice"
                autocomplete="username"
                class="!pl-9"
                required
              />
            </div>
          </UFormGroup>
          <UFormGroup label="Password">
            <div class="relative">
              <LockClosedIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
              <UInput
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                autocomplete="current-password"
                class="!pl-9"
                required
              />
            </div>
          </UFormGroup>
          <UButton type="submit" block size="lg" :loading="loading">Sign in</UButton>
        </form>

        <template #footer>
          <div class="text-sm text-stone-500 text-center">
            Don't have an account?
            <RouterLink to="/register" class="text-emerald-600 dark:text-emerald-400 font-medium">
              Create one
            </RouterLink>
          </div>
        </template>
      </UCard>

        <div class="mt-6 text-center text-xs text-slate-400">
          Try a seeded user: <span class="font-mono">admin_root / admin123</span>
        </div>
      </div>
    </div>
  </section>
</template>
