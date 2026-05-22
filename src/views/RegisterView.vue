<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import BrandLogo from "@/components/BrandLogo.vue";
import UCard from "@/components/ui/UCard.vue";
import UButton from "@/components/ui/UButton.vue";
import UInput from "@/components/ui/UInput.vue";
import UFormGroup from "@/components/ui/UFormGroup.vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/lib/toast";

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const form = reactive({
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
});
const loading = ref(false);

async function onSubmit() {
  loading.value = true;
  try {
    await auth.register(form);
    toast.add({
      title: "Welcome to BitePlate!",
      description: "Your customer account is ready.",
      color: "emerald",
      icon: "check",
    });
    router.push(auth.homeRoute);
  } catch (e: any) {
    toast.add({
      title: "Could not register",
      description: e?.detail || "Please try a different username or email.",
      color: "rose",
      icon: "x",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="flex justify-center mb-6">
        <RouterLink to="/"><BrandLogo size="lg" /></RouterLink>
      </div>

      <UCard class="glass shadow-2xl shadow-violet-500/10">
        <template #header>
          <div>
            <h1 class="text-2xl font-semibold tracking-tight">Create your account</h1>
            <p class="text-sm text-zinc-500 mt-1">You'll join as a customer.</p>
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="First name">
              <UInput v-model="form.first_name" required />
            </UFormGroup>
            <UFormGroup label="Last name">
              <UInput v-model="form.last_name" required />
            </UFormGroup>
          </div>
          <UFormGroup label="Username">
            <UInput v-model="form.username" placeholder="shohruh" required />
          </UFormGroup>
          <UFormGroup label="Email">
            <UInput v-model="form.email" type="email" placeholder="you@example.com" required />
          </UFormGroup>
          <UFormGroup label="Password" hint="At least 8 characters">
            <UInput v-model="form.password" type="password" required />
          </UFormGroup>
          <UButton type="submit" block size="lg" :loading="loading">Create account</UButton>
        </form>

        <template #footer>
          <div class="text-sm text-zinc-500 text-center">
            Already have an account?
            <RouterLink to="/login" class="text-violet-600 dark:text-violet-400 font-medium">
              Sign in
            </RouterLink>
          </div>
        </template>
      </UCard>
    </div>
  </section>
</template>
