import { reactive } from "vue";

export type ToastColor = "emerald" | "emerald" | "amber" | "rose" | "sky";

export interface Toast {
  id: number;
  title: string;
  description?: string;
  color?: ToastColor;
  icon?: "check" | "x" | "info" | "warning";
}

const state = reactive<{ items: Toast[] }>({ items: [] });
let nextId = 1;

export function useToast() {
  function add(t: Omit<Toast, "id">) {
    const id = nextId++;
    state.items.push({ id, ...t });
    setTimeout(() => remove(id), 5000);
    return id;
  }
  function remove(id: number) {
    const idx = state.items.findIndex((t) => t.id === id);
    if (idx >= 0) state.items.splice(idx, 1);
  }
  return { add, remove };
}

export function toasts() {
  return state.items;
}
