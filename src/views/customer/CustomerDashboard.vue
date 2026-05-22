<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { CalendarDaysIcon } from "@heroicons/vue/24/outline";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import UCard from "@/components/ui/UCard.vue";
import UBadge from "@/components/ui/UBadge.vue";
import { api } from "@/lib/api";
import type { MenuItem } from "@/types/api";

const items = ref<MenuItem[]>([]);
const router = useRouter();

onMounted(async () => {
  items.value = await api.get<MenuItem[]>("/menu");
});

const grouped = computed(() => {
  const out: Record<string, MenuItem[]> = {};
  for (const m of items.value) (out[m.category] ||= []).push(m);
  return out;
});
</script>

<template>
  <DashboardLayout>
    <div class="mb-8">
      <h1 class="text-3xl font-semibold tracking-tight">Welcome</h1>
      <p class="text-zinc-500 mt-1">Browse the menu, or jump to reservations.</p>
    </div>

    <div class="grid lg:grid-cols-3 gap-4 mb-10">
      <button
        class="card card-body text-left hover:shadow-lg transition ring-1 ring-violet-500/20"
        @click="router.push('/customer/reservations')"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center">
            <CalendarDaysIcon class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-semibold">Reservations</h3>
            <p class="text-sm text-zinc-500">Book a table</p>
          </div>
        </div>
      </button>
    </div>

    <div v-for="(group, cat) in grouped" :key="cat" class="mb-8">
      <h2 class="text-lg font-semibold capitalize mb-4">{{ cat }}</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard v-for="m in group" :key="m.id">
          <div class="flex items-start justify-between">
            <div>
              <div class="font-medium">{{ m.name }}</div>
              <div class="text-sm text-zinc-500 mt-1 line-clamp-2">{{ m.description }}</div>
              <div v-if="m.allergens.length" class="mt-2 flex flex-wrap gap-1">
                <UBadge v-for="a in m.allergens" :key="a" color="rose">{{ a }}</UBadge>
              </div>
            </div>
            <div class="text-lg font-semibold">£{{ m.base_price.toFixed(2) }}</div>
          </div>
        </UCard>
      </div>
    </div>
  </DashboardLayout>
</template>
