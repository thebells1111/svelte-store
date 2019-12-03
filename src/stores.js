import { writable } from "svelte/store";

function createCount() {
  const { subscribe, set, update } = writable({ n: 0 });

  return {
    subscribe,
    increment: () =>
      update(n => {
        let x = { ...n };
        x.n++;
        return x;
      }),
    decrement: () =>
      update(n => {
        let x = { ...n };
        x.n--;
        return x;
      }),
    reset: () => set({ n: 0 })
  };
}

export const count = createCount();
