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

// Category → Unsplash image mapping (deterministic so categories always show the same hero)
const CATEGORY_IMAGES: Record<string, string> = {
  pizzas: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop",
  pasta: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80&auto=format&fit=crop",
  pastas: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80&auto=format&fit=crop",
  burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop",
  salads: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop",
  soups: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80&auto=format&fit=crop",
  desserts: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80&auto=format&fit=crop",
  cakes: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80&auto=format&fit=crop",
  ice_cream: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80&auto=format&fit=crop",
  steaks: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&auto=format&fit=crop",
  seafood: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800&q=80&auto=format&fit=crop",
  sushi: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80&auto=format&fit=crop",
  sandwiches: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80&auto=format&fit=crop",
  wraps: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80&auto=format&fit=crop",
  tacos: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80&auto=format&fit=crop",
  curry: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80&auto=format&fit=crop",
  rice_bowls: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop",
  noodles: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80&auto=format&fit=crop",
  vegan: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80&auto=format&fit=crop",
  vegetarian: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80&auto=format&fit=crop",
  kids_menu: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80&auto=format&fit=crop",
  sides: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80&auto=format&fit=crop",
  appetizers: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f6e?w=800&q=80&auto=format&fit=crop",
  pastries: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80&auto=format&fit=crop",
  hot_drinks: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop",
  cold_drinks: "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800&q=80&auto=format&fit=crop",
  smoothies: "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=800&q=80&auto=format&fit=crop",
  cocktails: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80&auto=format&fit=crop",
  wines: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80&auto=format&fit=crop",
  beers: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80&auto=format&fit=crop",
  mocktails: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=800&q=80&auto=format&fit=crop",
};
const FALLBACK = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&auto=format&fit=crop";
function imageFor(cat: string) {
  return CATEGORY_IMAGES[cat.toLowerCase()] || FALLBACK;
}
</script>

<template>
  <DashboardLayout>
    <!-- Hero banner -->
    <div class="relative mb-10 rounded-2xl overflow-hidden h-48 lg:h-56">
      <img
        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80&auto=format&fit=crop"
        alt="Restaurant interior"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 hero-overlay"></div>
      <div class="relative z-10 h-full flex items-end p-6 lg:p-8 text-white">
        <div>
          <h1 class="text-3xl lg:text-4xl font-semibold tracking-tight">Welcome back</h1>
          <p class="text-white/80 mt-2">Browse the menu, place an order, or book a table.</p>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4 mb-10">
      <button
        class="card card-body text-left hover:shadow-lg transition ring-1 ring-emerald-500/20"
        @click="router.push('/customer/reservations')"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-500 text-white flex items-center justify-center">
            <CalendarDaysIcon class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-semibold">Reservations</h3>
            <p class="text-sm text-stone-500">Book a table</p>
          </div>
        </div>
      </button>
    </div>

    <div v-for="(group, cat) in grouped" :key="cat" class="mb-10">
      <!-- Category header with hero image -->
      <div class="relative h-32 lg:h-40 rounded-xl overflow-hidden mb-4">
        <img
          :src="imageFor(String(cat))"
          :alt="String(cat)"
          class="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        <div class="relative z-10 h-full flex items-end p-4 text-white">
          <h2 class="text-2xl font-semibold capitalize tracking-tight">
            {{ String(cat).replace(/_/g, " ") }}
          </h2>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard v-for="m in group" :key="m.id">
          <div class="flex items-start justify-between">
            <div>
              <div class="font-medium">{{ m.name }}</div>
              <div class="text-sm text-stone-500 mt-1 line-clamp-2">{{ m.description }}</div>
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
