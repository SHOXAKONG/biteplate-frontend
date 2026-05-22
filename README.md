## BitePlate Frontend

Vue 3 + Vite + TypeScript SPA. Tailwind CSS for styling, Headless UI for
accessible primitives (modal, switch), Heroicons for icons, Pinia for state,
vue-router for routing.

```
frontend/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── nginx.conf              SPA fallback config for the production image
├── Dockerfile              build → nginx static, serves on :80 (mapped to host :3000)
├── Dockerfile.dev          vite dev server on :3000
├── docker-compose.yml      production-style
├── docker-compose.dev.yml  hot-reload dev
└── src/
    ├── main.ts             entry; mounts App; hydrates auth from localStorage
    ├── App.vue             root: <RouterView /> + <Toasts />
    ├── style.css           Tailwind + component classes (.btn, .card, .input)
    ├── lib/
    │   ├── api.ts          fetch wrapper with bearer + auto-refresh on 401
    │   └── toast.ts        in-memory toast state
    ├── stores/auth.ts      Pinia auth store with role-based homeRoute
    ├── router/index.ts     beforeEach guard: public routes, role checks
    ├── types/api.ts        all backend DTO types
    ├── components/
    │   ├── ui/             UCard, UButton, UInput, UTextarea, USelect, UBadge,
    │   │                   UToggle, UModal, UFormGroup, Toasts
    │   ├── BrandLogo, AppSidebar, AppHeader, StatCard, RoleBadge
    └── views/
        ├── LandingView, LoginView, RegisterView
        ├── admin/          AdminDashboard, AdminMenu, AdminTables, AdminUsers
        ├── ManagerDashboard, WaiterView, KitchenView, CashierView
        └── customer/       CustomerDashboard, CustomerReservations
```

### Run

From the project root:

```bash
make dev
```

Opens at <http://localhost:3000>. Sign in as one of the seeded users:

| Username      | Password    | Lands on   |
| ------------- | ----------- | ---------- |
| admin_root    | admin123    | /admin     |
| manager_alice | manager123  | /manager   |
| chef_bob      | chef123     | /kitchen   |
| waiter_carol  | waiter123   | /waiter    |
| cashier_dan   | cashier123  | /cashier   |
| customer_eve  | customer123 | /customer  |

Or click **Get started** on the landing page to register as a new customer
via `POST /api/v1/auth/register`.

### Role routing

`stores/auth.ts` derives a `homeRoute` from the user's primary role.
`router/index.ts` runs a global `beforeEach`:

1. Public routes (`/`, `/login`, `/register`) skip the auth check; signed-in
   users are bounced from `/login` and `/register` to their home dashboard.
2. Private routes require an access token; if missing → `/login?redirect=…`.
3. Each route declares its allowed roles via `meta.roles`; mismatched users
   are sent to their own home dashboard.

The sidebar (`components/AppSidebar.vue`) filters nav items by
`auth.hasRole(...)`.

### Theme

- Tailwind with `darkMode: 'class'`.
- Primary violet, fuchsia → amber gradient as brand accent.
- Glass / blur on cards, subtle radial-gradient backgrounds.
- Dark mode toggle (`@vueuse/core` `useColorMode`), preference saved.

### CI/CD

`.github/workflows/ci-cd.yml`: `npm install && npm run build` on every push;
on push to `main`, builds the nginx image, pushes to GHCR, `kubectl set image`.

K8s manifests in `k8s/` — replace `REPLACE_OWNER` in `frontend.yaml` with your
GitHub user/org before first deploy.
