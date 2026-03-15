import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Node 22+ has a built-in localStorage that conflicts with jsdom.
// Provide a proper Storage mock if localStorage.clear is missing.
if (typeof globalThis.localStorage === "undefined" || typeof globalThis.localStorage.clear !== "function") {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

afterEach(() => {
  cleanup();
});
