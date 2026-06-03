<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  BookOpenIcon,
  RectangleGroupIcon,
  UsersIcon,
  MapPinIcon,
  UserPlusIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import StatCard from "@/components/StatCard.vue";
import { api } from "@/lib/api";
import type { MenuItem, Table } from "@/types/api";

const router = useRouter();
const menu = ref<MenuItem[]>([]);
const tables = ref<Table[]>([]);

onMounted(async () => {
  [menu.value, tables.value] = await Promise.all([
    api.get<MenuItem[]>("/menu"),
    api.get<Table[]>("/tables"),
  ]);
});

const totalSeats = computed(() => tables.value.reduce((sum, t) => sum + t.seats, 0));

const actions = [
  { to: "/admin/menu", icon: BookOpenIcon, title: "Manage menu", desc: "Create dishes, combos, and decorators." },
  { to: "/admin/tables", icon: RectangleGroupIcon, title: "Manage tables", desc: "Add tables and seat counts." },
  { to: "/admin/users", icon: UserPlusIcon, title: "Onboard staff", desc: "Create waiters, chefs, cashiers, managers." },
];
</script>

<template>
  <DashboardLayout>
    <div class="mb-8">
      <h1 class="text-3xl font-semibold tracking-tight">Admin overview</h1>
      <p class="text-stone-500 mt-1">Set up the restaurant: menu, tables, and staff.</p>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Menu items" :value="menu.length" :icon="BookOpenIcon" accent="emerald" />
      <StatCard label="Tables" :value="tables.length" :icon="RectangleGroupIcon" accent="amber" />
      <StatCard label="Total seats" :value="totalSeats" :icon="UsersIcon" accent="emerald" />
      <StatCard label="Locations" value="1" :icon="MapPinIcon" accent="sky" />
    </div>

    <div class="mt-10 grid lg:grid-cols-3 gap-4">
      <button
        v-for="action in actions"
        :key="action.to"
        class="card card-body text-left hover:ring-emerald-500/40 hover:shadow-lg transition"
        @click="router.push(action.to)"
      >
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30"
          >
            <component :is="action.icon" class="w-6 h-6" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold">{{ action.title }}</h3>
            <p class="text-sm text-stone-500 mt-1">{{ action.desc }}</p>
          </div>
          <ArrowRightIcon class="w-5 h-5 text-slate-400" />
        </div>
      </button>
    </div>
  </DashboardLayout>
</template>
