import type { Middleware } from "./types";

/**
 * Creates an async middleware that can handle promises and async operations
 * @param handler The async middleware handler function
 * @returns A middleware function that can be used with the state system
 */
export function createAsyncMiddleware<T>(
  handler: (path: string, nextValue: T, prevValue: T) => Promise<T | false>
): Middleware<T> {
  return async (path: string, nextValue: T, prevValue: T) => {
    try {
      return await handler(path, nextValue, prevValue);
    } catch (error) {
      console.error(
        `[Bonsai:AsyncMiddleware] Error in middleware for path "${path}":`,
        error
      );
      return false; // Block the update on error
    }
  };
}

/**
 * Creates a validation middleware that ensures state updates meet certain criteria
 * @param validator A function that validates the new state value
 * @returns A middleware function that validates updates
 */
export function createValidationMiddleware<T>(
  validator: (path: string, nextValue: T, prevValue: T) => boolean | string
): Middleware<T> {
  return (path: string, nextValue: T, prevValue: T) => {
    const result = validator(path, nextValue, prevValue);
    if (typeof result === "string") {
      console.warn(`[Bonsai:Validation] ${result}`);
      return false;
    }
    return result ? nextValue : false;
  };
}

/**
 * Creates a middleware that logs all state updates
 * @param options Configuration options for logging
 */
export function createLoggingMiddleware<T>(
  options: {
    logPath?: boolean;
    logValue?: boolean;
    logPrevValue?: boolean;
  } = {}
): Middleware<T> {
  return async (path: string, nextValue: T, prevValue: T) => {
    const { logPath = true, logValue = true, logPrevValue = false } = options;

    console.group(`[Bonsai:Middleware] State Update`);
    if (logPath) console.log("Path:", path);
    if (logValue) console.log("New Value:", nextValue);
    if (logPrevValue) console.log("Previous Value:", prevValue);
    console.groupEnd();

    return nextValue;
  };
}

/**
 * Creates a middleware that debounces state updates
 * @param delay Delay in milliseconds
 */
export function createDebounceMiddleware<T>(delay: number): Middleware<T> {
  let timeout: NodeJS.Timeout | null = null;

  return async (path: string, nextValue: T, prevValue: T) => {
    return new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        resolve(nextValue);
        timeout = null;
      }, delay);
    });
  };
}

/**
 * Creates a middleware that throttles state updates
 * @param limit Maximum number of updates per second
 */
export function createThrottleMiddleware<T>(limit: number): Middleware<T> {
  let lastUpdate = 0;
  const interval = 1000 / limit;

  return async (path: string, nextValue: T, prevValue: T) => {
    const now = Date.now();
    if (now - lastUpdate < interval) {
      return prevValue;
    }

    lastUpdate = now;
    return nextValue;
  };
}

/**
 * Creates a middleware that persists state to localStorage
 * @param key The localStorage key to use
 */
export function createPersistenceMiddleware<T>(key: string): Middleware<T> {
  return async (path: string, nextValue: T, prevValue: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(nextValue));
    } catch (error) {
      console.error("[Bonsai:Middleware] Failed to persist state:", error);
    }
    return nextValue;
  };
}

/**
 * Creates a middleware that only allows updates during specific time windows
 * @param allowedHours Array of hours (0-23) when updates are allowed
 */
export function createTimeWindowMiddleware<T>(
  allowedHours: number[]
): Middleware<T> {
  return async (path: string, nextValue: T, prevValue: T) => {
    const currentHour = new Date().getHours();
    if (!allowedHours.includes(currentHour)) {
      console.warn(
        `[Bonsai:Middleware] Updates not allowed during hour ${currentHour}`
      );
      return prevValue;
    }
    return nextValue;
  };
}
