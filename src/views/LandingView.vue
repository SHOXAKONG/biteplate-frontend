<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  RectangleGroupIcon,
  FireIcon,
  BanknotesIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";
import BrandLogo from "@/components/BrandLogo.vue";
import UBadge from "@/components/ui/UBadge.vue";

const cards = [
  {
    icon: RectangleGroupIcon,
    title: "Live floor plan",
    desc: "Reserve, seat, request bill — every table state in real time.",
  },
  {
    icon: FireIcon,
    title: "Kitchen queue",
    desc: "Prepare, expedite, cancel — with undo. Waste tracked automatically.",
  },
  {
    icon: BanknotesIcon,
    title: "Smart pricing",
    desc: "Happy hour, loyalty, weekend, group — strategies pick themselves.",
  },
];
</script>

<template>
  <section class="relative min-h-screen overflow-hidden">
    <div class="absolute inset-0 -z-10">
      <div class="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-400/20 blur-3xl" />
      <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-400/20 blur-3xl" />
    </div>

    <header class="px-6 lg:px-12 py-6 flex items-center justify-between">
      <BrandLogo size="md" tagline />
      <div class="flex items-center gap-2">
        <RouterLink to="/login" class="btn-ghost btn-md">Sign in</RouterLink>
        <RouterLink to="/register" class="btn-primary btn-md">Get started</RouterLink>
      </div>
    </header>

    <main class="px-6 lg:px-12 pt-16 lg:pt-24 max-w-6xl mx-auto">
      <UBadge color="violet">
        <SparklesIcon class="w-3 h-3" />
        Smart Restaurant Management
      </UBadge>
      <h1
        class="mt-6 text-5xl lg:text-7xl font-semibold tracking-tight leading-[1.05] text-balance bg-gradient-to-br from-zinc-900 via-zinc-700 to-violet-600 dark:from-white dark:via-zinc-200 dark:to-violet-300 bg-clip-text text-transparent"
      >
        Run your restaurant the way it should be run.
      </h1>
      <p class="mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl text-balance">
        Tables, orders, kitchen, billing, reservations — one beautiful interface, six tailored
        dashboards, real-time SMS reminders, and a pricing engine that adapts to every shift.
      </p>
      <div class="mt-10 flex flex-wrap items-center gap-3">
        <RouterLink to="/login" class="btn-primary btn-lg">
          Sign in
          <ArrowRightIcon class="w-4 h-4" />
        </RouterLink>
        <RouterLink to="/register" class="btn-ghost btn-lg">Create an account</RouterLink>
      </div>

      <div class="mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="c in cards" :key="c.title" class="card card-body">
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shrink-0"
            >
              <component :is="c.icon" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-semibold">{{ c.title }}</h3>
              <p class="text-sm text-zinc-500 mt-1">{{ c.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </section>
</template>
