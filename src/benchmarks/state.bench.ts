import { describe, it, expect, beforeAll } from "vitest";
import { initTreeState, set } from "../bonsai/tree";
import { useBonsai, setState } from "../bonsai/flat";

describe("State Management Performance Benchmarks", () => {
  const iterations = 1000;
  const initialState = {
    count: 0,
    user: {
      name: "test",
      preferences: {
        theme: "light",
        notifications: true,
      },
    },
  };

  describe("Tree State", () => {
    beforeAll(() => {
      initTreeState({ initialState });
    });

    it("should benchmark state updates", () => {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        set("count", i);
      }
      const end = performance.now();
      const avgTime = (end - start) / iterations;

      expect(avgTime).toBeLessThan(1); // Average time should be less than 1ms
    });

    it("should benchmark nested state updates", () => {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        set("user/preferences/theme", i % 2 === 0 ? "light" : "dark");
      }
      const end = performance.now();
      const avgTime = (end - start) / iterations;

      expect(avgTime).toBeLessThan(1); // Average time should be less than 1ms
    });

    it("should benchmark state subscriptions", () => {
      let updates = 0;
      const unsubscribe = useBonsai((state) => {
        updates++;
        return state.count;
      });

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        set("count", i);
      }
      const end = performance.now();
      const avgTime = (end - start) / iterations;

      unsubscribe();
      expect(avgTime).toBeLessThan(1); // Average time should be less than 1ms
      expect(updates).toBe(iterations);
    });
  });

  describe("Flat State", () => {
    it("should benchmark state updates", () => {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        setState({ count: i });
      }
      const end = performance.now();
      const avgTime = (end - start) / iterations;

      expect(avgTime).toBeLessThan(1); // Average time should be less than 1ms
    });

    it("should benchmark state subscriptions", () => {
      let updates = 0;
      const unsubscribe = useBonsai((state) => {
        updates++;
        return state.count;
      });

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        setState({ count: i });
      }
      const end = performance.now();
      const avgTime = (end - start) / iterations;

      unsubscribe();
      expect(avgTime).toBeLessThan(1); // Average time should be less than 1ms
      expect(updates).toBe(iterations);
    });
  });
});
