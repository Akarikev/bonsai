import type { Middleware, StateValue } from "./types";

// Shared error handler for middleware
const handleMiddlewareError = (path: string, error: unknown): false => {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Bonsai:Middleware] Error for path "${path}":`, error);
  }
  return false;
};

// Shared warning handler for middleware
const handleMiddlewareWarning = (message: string): void => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[Bonsai:Middleware] ${message}`);
  }
};

// Helper to create branded middleware functions
const createBrandedMiddleware = <T extends StateValue>(
  fn: (
    path: string,
    nextValue: T,
    prevValue: T
  ) => T | false | Promise<T | false>
): Middleware<T> => {
  const middleware = fn as Middleware<T>;
  middleware.__brand = Symbol("Middleware") as any;
  return middleware;
};

/**
 * Creates an async middleware that can handle promises and async operations
 * @param handler The async middleware handler function
 * @returns A middleware function that can be used with the state system
 */
export const createAsyncMiddleware = <T extends StateValue>(
  handler: (path: string, nextValue: T, prevValue: T) => Promise<T | false>
): Middleware<T> => {
  return createBrandedMiddleware(
    async (path: string, nextValue: T, prevValue: T) => {
      try {
        return await handler(path, nextValue, prevValue);
      } catch (error) {
        return handleMiddlewareError(path, error);
      }
    }
  );
};

/**
 * Creates a validation middleware that ensures state updates meet certain criteria
 * @param validator A function that validates the new state value
 * @returns A middleware function that validates updates
 */
export const createValidationMiddleware = <T extends StateValue>(
  validator: (path: string, nextValue: T, prevValue: T) => boolean | string
): Middleware<T> => {
  return createBrandedMiddleware((path: string, nextValue: T, prevValue: T) => {
    const result = validator(path, nextValue, prevValue);
    if (typeof result === "string") {
      handleMiddlewareWarning(result);
      return false;
    }
    return result ? nextValue : false;
  });
};

/**
 * Creates a middleware that logs all state updates
 * @param options Configuration options for logging
 */
export const createLoggingMiddleware = <T extends StateValue>(
  options: {
    readonly logPath?: boolean;
    readonly logValue?: boolean;
    readonly logPrevValue?: boolean;
  } = {}
): Middleware<T> => {
  if (process.env.NODE_ENV === "production") {
    return createBrandedMiddleware((_, nextValue) => nextValue);
  }

  const { logPath = true, logValue = true, logPrevValue = false } = options;

  return createBrandedMiddleware((path: string, nextValue: T, prevValue: T) => {
    console.group(`[Bonsai:Middleware] State Update`);
    if (logPath) console.log("Path:", path);
    if (logValue) console.log("New Value:", nextValue);
    if (logPrevValue) console.log("Previous Value:", prevValue);
    console.groupEnd();
    return nextValue;
  });
};

/**
 * Creates a middleware that debounces state updates
 * @param delay Delay in milliseconds
 */
export const createDebounceMiddleware = <T extends StateValue>(
  delay: number
): Middleware<T> => {
  const timeouts = new Map<string, NodeJS.Timeout>();

  return createBrandedMiddleware((path: string, nextValue: T) => {
    return new Promise((resolve) => {
      const existingTimeout = timeouts.get(path);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(() => {
        timeouts.delete(path);
        resolve(nextValue);
      }, delay);

      timeouts.set(path, timeout);
    });
  });
};

/**
 * Creates a middleware that throttles state updates
 * @param limit Maximum number of updates per second
 */
export const createThrottleMiddleware = <T extends StateValue>(
  limit: number
): Middleware<T> => {
  const lastUpdates = new Map<string, number>();
  const interval = 1000 / limit;

  return createBrandedMiddleware((path: string, nextValue: T, prevValue: T) => {
    const now = Date.now();
    const lastUpdate = lastUpdates.get(path) || 0;

    if (now - lastUpdate < interval) {
      return prevValue;
    }

    lastUpdates.set(path, now);
    return nextValue;
  });
};

/**
 * Creates a middleware that persists state to localStorage
 * @param key The localStorage key to use
 */
export const createPersistenceMiddleware = <T extends StateValue>(
  key: string
): Middleware<T> => {
  return createBrandedMiddleware(async (path: string, nextValue: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(nextValue));
    } catch (error) {
      handleMiddlewareError(path, error);
    }
    return nextValue;
  });
};

/**
 * Creates a middleware that only allows updates during specific time windows
 * @param allowedHours Array of hours (0-23) when updates are allowed
 */
export const createTimeWindowMiddleware = <T extends StateValue>(
  allowedHours: readonly number[]
): Middleware<T> => {
  return createBrandedMiddleware((path: string, nextValue: T, prevValue: T) => {
    const currentHour = new Date().getHours();
    if (!allowedHours.includes(currentHour)) {
      handleMiddlewareWarning(`Updates not allowed during hour ${currentHour}`);
      return prevValue;
    }
    return nextValue;
  });
};
