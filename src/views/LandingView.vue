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
      <div class="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-400/20 blur-3xl" />
      <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-400/20 blur-3xl" />
    </div>

    <header class="px-6 lg:px-12 py-6 flex items-center justify-between">
      <BrandLogo size="md" tagline />
      <div class="flex items-center gap-2">
        <RouterLink to="/login" class="btn-ghost btn-md">Sign in</RouterLink>
        <RouterLink to="/register" class="btn-primary btn-md">Get started</RouterLink>
      </div>
    </header>

    <main class="px-6 lg:px-12 pt-12 lg:pt-16 max-w-6xl mx-auto">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <UBadge color="emerald">
            <SparklesIcon class="w-3 h-3" />
            Smart Restaurant Management
          </UBadge>
          <h1
            class="mt-6 text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-balance bg-gradient-to-br from-slate-900 via-slate-700 to-emerald-600 dark:from-white dark:via-stone-200 dark:to-emerald-300 bg-clip-text text-transparent"
          >
            Run your restaurant the way it should be run.
          </h1>
          <p class="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl text-balance">
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
        </div>

        <!-- Hero image collage -->
        <div class="relative aspect-[5/6] lg:aspect-square">
          <div class="absolute top-0 left-0 w-3/5 aspect-[4/5] rounded-2xl overflow-hidden ring-1 ring-stone-200 dark:ring-slate-800 shadow-xl shadow-emerald-500/10">
            <img
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&auto=format&fit=crop"
              alt="Beautifully plated dish"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="absolute bottom-0 right-0 w-3/5 aspect-square rounded-2xl overflow-hidden ring-1 ring-stone-200 dark:ring-slate-800 shadow-xl shadow-amber-500/10">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format&fit=crop"
              alt="Restaurant interior"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="absolute top-1/3 right-4 w-32 h-32 rounded-xl overflow-hidden ring-2 ring-white dark:ring-slate-900 shadow-lg hidden sm:block">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80&auto=format&fit=crop"
              alt="Healthy bowl"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div class="mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="c in cards" :key="c.title" class="card card-body">
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-amber-500 text-white flex items-center justify-center shrink-0"
            >
              <component :is="c.icon" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-semibold">{{ c.title }}</h3>
              <p class="text-sm text-stone-500 mt-1">{{ c.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Visual showcase strip -->
      <div class="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="aspect-square rounded-xl overflow-hidden ring-1 ring-stone-200 dark:ring-slate-800">
          <img
            src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80&auto=format&fit=crop"
            alt="Pizza"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div class="aspect-square rounded-xl overflow-hidden ring-1 ring-stone-200 dark:ring-slate-800">
          <img
            src="https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80&auto=format&fit=crop"
            alt="Burger"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div class="aspect-square rounded-xl overflow-hidden ring-1 ring-stone-200 dark:ring-slate-800">
          <img
            src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80&auto=format&fit=crop"
            alt="Dessert"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div class="aspect-square rounded-xl overflow-hidden ring-1 ring-stone-200 dark:ring-slate-800">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80&auto=format&fit=crop"
            alt="Steak"
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </div>

      <footer class="mt-24 pb-12 text-center text-sm text-slate-500">
        BitePlate · Built with Vue 3, FastAPI &amp; Keycloak
      </footer>
    </main>
  </section>
</template>
