import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createAsyncMiddleware,
  createValidationMiddleware,
  createLoggingMiddleware,
  createDebounceMiddleware,
  createThrottleMiddleware,
  createPersistenceMiddleware,
  createTimeWindowMiddleware,
} from "../bonsai/middleware";

describe("Middleware Performance Benchmarks", () => {
  const testValue = { count: 1, data: { nested: { value: "test" } } };
  const testPath = "data/nested/value";
  const iterations = 1000;

  it("should benchmark async middleware", async () => {
    const middleware = createAsyncMiddleware(async (path, value) => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      return value;
    });

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await middleware(testPath, testValue, testValue);
    }
    const end = performance.now();
    const avgTime = (end - start) / iterations;

    expect(avgTime).toBeLessThan(10); // Average time should be less than 10ms
  });

  it("should benchmark validation middleware", () => {
    const middleware = createValidationMiddleware((path, value) => {
      return typeof value === "object";
    });

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      middleware(testPath, testValue, testValue);
    }
    const end = performance.now();
    const avgTime = (end - start) / iterations;

    expect(avgTime).toBeLessThan(1); // Average time should be less than 1ms
  });

  it("should benchmark debounce middleware", async () => {
    const middleware = createDebounceMiddleware(50);

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await middleware(testPath, testValue, testValue);
    }
    const end = performance.now();
    const avgTime = (end - start) / iterations;

    expect(avgTime).toBeLessThan(100); // Average time should be less than 100ms
  });

  it("should benchmark throttle middleware", async () => {
    const middleware = createThrottleMiddleware(100);

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await middleware(testPath, testValue, testValue);
    }
    const end = performance.now();
    const avgTime = (end - start) / iterations;

    expect(avgTime).toBeLessThan(10); // Average time should be less than 10ms
  });

  it("should benchmark persistence middleware", async () => {
    const middleware = createPersistenceMiddleware("test-key");

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await middleware(testPath, testValue, testValue);
    }
    const end = performance.now();
    const avgTime = (end - start) / iterations;

    expect(avgTime).toBeLessThan(5); // Average time should be less than 5ms
  });

  it("should benchmark time window middleware", () => {
    const middleware = createTimeWindowMiddleware([0, 1, 2, 3, 4, 5]);

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      middleware(testPath, testValue, testValue);
    }
    const end = performance.now();
    const avgTime = (end - start) / iterations;

    expect(avgTime).toBeLessThan(1); // Average time should be less than 1ms
  });
});
