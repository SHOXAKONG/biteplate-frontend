<script setup lang="ts">
import { useRouter } from "vue-router";
import { useColorMode } from "@vueuse/core";
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/stores/auth";
import RoleBadge from "@/components/RoleBadge.vue";

const auth = useAuthStore();
const router = useRouter();
const mode = useColorMode({ attribute: "class", selector: "html", modes: { light: "", dark: "dark" } });

defineEmits<{ "toggle-sidebar": [] }>();

async function logout() {
  await auth.logout();
  router.push("/login");
}

function toggleTheme() {
  mode.value = mode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <header
    class="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-950/70 glass"
  >
    <div class="flex items-center gap-3">
      <button
        class="lg:hidden p-2 -ml-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        @click="$emit('toggle-sidebar')"
      >
        <Bars3Icon class="w-5 h-5" />
      </button>
      <div class="flex items-center gap-2">
        <RoleBadge v-for="r in auth.roles" :key="r" :role="r" />
      </div>
    </div>

    <div class="flex items-center gap-1">
      <button
        class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
        @click="toggleTheme"
      >
        <SunIcon v-if="mode === 'dark'" class="w-5 h-5" />
        <MoonIcon v-else class="w-5 h-5" />
      </button>
      <button
        class="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/10 text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-300"
        @click="logout"
        title="Sign out"
      >
        <ArrowRightOnRectangleIcon class="w-5 h-5" />
      </button>
    </div>
  </header>
</template>
