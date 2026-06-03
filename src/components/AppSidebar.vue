<script setup lang="ts">
import { computed, type Component } from "vue";
import { RouterLink } from "vue-router";
import {
  Squares2X2Icon,
  BookOpenIcon,
  RectangleGroupIcon,
  UserPlusIcon,
  ChartBarIcon,
  FireIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  UserCircleIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/stores/auth";
import type { Role } from "@/types/api";
import BrandLogo from "@/components/BrandLogo.vue";

const auth = useAuthStore();

interface NavItem {
  label: string;
  to: string;
  icon: Component;
  roles: Role[];
}

const items: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: Squares2X2Icon, roles: ["admin"] },
  { label: "Menu", to: "/admin/menu", icon: BookOpenIcon, roles: ["admin"] },
  { label: "Tables", to: "/admin/tables", icon: RectangleGroupIcon, roles: ["admin"] },
  { label: "Staff", to: "/admin/users", icon: UserPlusIcon, roles: ["admin"] },

  { label: "Dashboard", to: "/manager", icon: ChartBarIcon, roles: ["manager"] },
  { label: "All orders", to: "/manager/orders", icon: ClipboardDocumentListIcon, roles: ["manager"] },

  { label: "Tables", to: "/waiter", icon: RectangleGroupIcon, roles: ["waiter"] },
  { label: "My orders", to: "/waiter/orders", icon: ClipboardDocumentListIcon, roles: ["waiter"] },

  { label: "Kitchen", to: "/kitchen", icon: FireIcon, roles: ["head_chef"] },

  { label: "New bill", to: "/cashier", icon: BanknotesIcon, roles: ["cashier"] },
  { label: "Bill history", to: "/cashier/history", icon: ClockIcon, roles: ["cashier"] },

  { label: "Browse", to: "/customer", icon: BookOpenIcon, roles: ["customer"] },
  { label: "Reservations", to: "/customer/reservations", icon: CalendarDaysIcon, roles: ["customer"] },
];

const profileItem: NavItem = {
  label: "Profile",
  to: "/profile",
  icon: UserCircleIcon,
  roles: ["admin", "manager", "head_chef", "waiter", "cashier", "customer"],
};

const visible = computed(() => items.filter((i) => auth.hasRole(...i.roles)));
</script>

<template>
  <aside
    class="hidden lg:flex w-64 flex-col border-r border-stone-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 glass"
  >
    <div class="px-5 py-5 border-b border-stone-200/70 dark:border-slate-800/70">
      <BrandLogo size="md" tagline />
    </div>

    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <RouterLink
        v-for="item in visible"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800/60 transition"
        active-class="!bg-gradient-to-r from-emerald-500/10 to-amber-500/10 !text-emerald-700 dark:!text-emerald-300 ring-1 ring-emerald-500/20"
      >
        <component :is="item.icon" class="w-5 h-5 shrink-0" />
        {{ item.label }}
      </RouterLink>

      <div class="my-3 border-t border-stone-200/70 dark:border-slate-800/70" />

      <RouterLink
        :to="profileItem.to"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800/60 transition"
        active-class="!bg-gradient-to-r from-emerald-500/10 to-amber-500/10 !text-emerald-700 dark:!text-emerald-300 ring-1 ring-emerald-500/20"
      >
        <component :is="profileItem.icon" class="w-5 h-5 shrink-0" />
        {{ profileItem.label }}
      </RouterLink>
    </nav>

    <div class="p-3 border-t border-stone-200/70 dark:border-slate-800/70">
      <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-stone-50 dark:bg-slate-900">
        <div
          class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 text-white flex items-center justify-center text-sm font-semibold"
        >
          {{ (auth.user?.username || "?").charAt(0).toUpperCase() }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium truncate">{{ auth.user?.username }}</div>
          <div class="text-xs text-stone-500 truncate">{{ auth.user?.email }}</div>
        </div>
      </div>
    </div>
  </aside>
</template>
