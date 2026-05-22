import { defineStore } from "pinia";
import { api, apiAnon } from "@/lib/api";
import type { CurrentUser, Role, TokenResponse } from "@/types/api";

const AT_KEY = "biteplate.access_token";
const RT_KEY = "biteplate.refresh_token";

const ROLE_PRIORITY: Role[] = ["admin", "manager", "head_chef", "cashier", "waiter", "customer"];
const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  manager: "/manager",
  head_chef: "/kitchen",
  waiter: "/waiter",
  cashier: "/cashier",
  customer: "/customer",
};

interface State {
  accessToken: string | null;
  refreshToken: string | null;
  user: CurrentUser | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): State => ({ accessToken: null, refreshToken: null, user: null }),
  getters: {
    isAuthenticated: (s) => !!s.accessToken,
    roles: (s): Role[] => (s.user?.roles || []) as Role[],
    primaryRole(): Role | null {
      for (const r of ROLE_PRIORITY) if (this.roles.includes(r)) return r;
      return null;
    },
    homeRoute(): string {
      return this.primaryRole ? ROLE_HOME[this.primaryRole] : "/login";
    },
  },
  actions: {
    hasRole(...required: Role[]) {
      return required.some((r) => this.roles.includes(r));
    },
    hydrate() {
      this.accessToken = localStorage.getItem(AT_KEY);
      this.refreshToken = localStorage.getItem(RT_KEY);
    },
    persistTokens(tokens: TokenResponse) {
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      localStorage.setItem(AT_KEY, tokens.access_token);
      localStorage.setItem(RT_KEY, tokens.refresh_token);
    },
    async login(username: string, password: string) {
      const tokens = await apiAnon.post<TokenResponse>("/auth/login", { username, password });
      this.persistTokens(tokens);
      await this.fetchMe();
      return tokens;
    },
    async register(payload: {
      username: string;
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    }) {
      await apiAnon.post("/auth/register", payload);
      return this.login(payload.username, payload.password);
    },
    async fetchMe() {
      this.user = await api.get<CurrentUser>("/auth/me");
    },
    async refresh() {
      if (!this.refreshToken) throw new Error("no refresh token");
      const tokens = await apiAnon.post<TokenResponse>("/auth/refresh", {
        refresh_token: this.refreshToken,
      });
      this.persistTokens(tokens);
      return tokens;
    },
    async logout() {
      const rt = this.refreshToken;
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem(AT_KEY);
      localStorage.removeItem(RT_KEY);
      if (rt) {
        try {
          await apiAnon.post("/auth/logout", { refresh_token: rt });
        } catch {
          // best-effort
        }
      }
    },
  },
});
