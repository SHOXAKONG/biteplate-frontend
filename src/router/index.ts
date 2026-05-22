import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import type { Role } from "@/types/api";

declare module "vue-router" {
  interface RouteMeta {
    public?: boolean;
    roles?: Role[];
  }
}

const routes: RouteRecordRaw[] = [
  { path: "/", name: "landing", component: () => import("@/views/LandingView.vue"), meta: { public: true } },
  { path: "/login", name: "login", component: () => import("@/views/LoginView.vue"), meta: { public: true } },
  { path: "/register", name: "register", component: () => import("@/views/RegisterView.vue"), meta: { public: true } },

  { path: "/admin", name: "admin", component: () => import("@/views/admin/AdminDashboard.vue"), meta: { roles: ["admin"] } },
  { path: "/admin/menu", name: "admin-menu", component: () => import("@/views/admin/AdminMenu.vue"), meta: { roles: ["admin"] } },
  { path: "/admin/tables", name: "admin-tables", component: () => import("@/views/admin/AdminTables.vue"), meta: { roles: ["admin"] } },
  { path: "/admin/users", name: "admin-users", component: () => import("@/views/admin/AdminUsers.vue"), meta: { roles: ["admin"] } },

  { path: "/manager", name: "manager", component: () => import("@/views/ManagerDashboard.vue"), meta: { roles: ["manager"] } },
  { path: "/manager/orders", name: "manager-orders", component: () => import("@/views/ManagerOrders.vue"), meta: { roles: ["manager"] } },

  { path: "/waiter", name: "waiter", component: () => import("@/views/WaiterView.vue"), meta: { roles: ["waiter", "manager"] } },
  { path: "/waiter/orders", name: "waiter-orders", component: () => import("@/views/WaiterOrders.vue"), meta: { roles: ["waiter", "manager"] } },
  { path: "/waiter/place-order/:tableId", name: "waiter-place-order", component: () => import("@/views/WaiterPlaceOrder.vue"), meta: { roles: ["waiter", "manager"] }, props: true },

  { path: "/kitchen", name: "kitchen", component: () => import("@/views/KitchenView.vue"), meta: { roles: ["head_chef", "manager"] } },

  { path: "/cashier", name: "cashier", component: () => import("@/views/CashierView.vue"), meta: { roles: ["cashier", "manager"] } },
  { path: "/cashier/history", name: "cashier-history", component: () => import("@/views/CashierHistory.vue"), meta: { roles: ["cashier", "manager"] } },

  { path: "/customer", name: "customer", component: () => import("@/views/customer/CustomerDashboard.vue"), meta: { roles: ["customer"] } },
  { path: "/customer/reservations", name: "customer-reservations", component: () => import("@/views/customer/CustomerReservations.vue"), meta: { roles: ["customer"] } },

  { path: "/profile", name: "profile", component: () => import("@/views/ProfileView.vue") },

  { path: "/:pathMatch(.*)*", redirect: "/" },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  const isPublic = !!to.meta.public;

  if (isPublic) {
    if (auth.isAuthenticated && !auth.user) {
      try {
        await auth.fetchMe();
      } catch {
        await auth.logout();
      }
    }
    if (auth.isAuthenticated && (to.name === "login" || to.name === "register")) {
      return auth.homeRoute;
    }
    return true;
  }

  if (!auth.isAuthenticated) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  if (!auth.user) {
    try {
      await auth.fetchMe();
    } catch {
      await auth.logout();
      return "/login";
    }
  }

  const required = to.meta.roles || [];
  if (required.length && !auth.hasRole(...required)) {
    return auth.homeRoute;
  }
  return true;
});
