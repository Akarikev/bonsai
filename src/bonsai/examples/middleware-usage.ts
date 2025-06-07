import { initTreeState } from "../tree";
import {
  createAsyncMiddleware,
  createValidationMiddleware,
  createLoggingMiddleware,
  createDebounceMiddleware,
  createThrottleMiddleware,
  createPersistenceMiddleware,
  createTimeWindowMiddleware,
} from "../middleware";

// Example 1: Basic middleware composition
// This example shows how to combine validation, logging, and persistence
const basicExample = () => {
  // Create a validation middleware that ensures numbers are positive
  const positiveNumberValidator = createValidationMiddleware<number>(
    (path, nextValue) => {
      if (typeof nextValue !== "number") {
        return "Value must be a number";
      }
      if (nextValue < 0) {
        return "Value must be positive";
      }
      return true;
    }
  );

  // Create a logging middleware that logs all updates
  const logger = createLoggingMiddleware<number>({
    logPath: true,
    logValue: true,
    logPrevValue: true,
  });

  // Create a persistence middleware that saves to localStorage
  const persister = createPersistenceMiddleware<number>("counter");

  // Initialize the state system with the middleware chain
  initTreeState({
    initialState: { counter: 0 },
    middleware: [positiveNumberValidator, logger, persister],
  });
};

// Example 2: Async operations with debouncing
// This example shows how to handle async operations with debouncing
const asyncDebounceExample = () => {
  // Create an async middleware that simulates an API call
  const apiMiddleware = createAsyncMiddleware<number>(
    async (path, nextValue) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`[API] Updating ${path} to ${nextValue}`);
      return nextValue;
    }
  );

  // Create a debounced middleware that waits 500ms between updates
  const debouncer = createDebounceMiddleware<number>(500);

  // Initialize the state system with the middleware chain
  initTreeState({
    initialState: { searchQuery: "" },
    middleware: [debouncer, apiMiddleware],
  });
};

// Example 3: Rate limiting with time windows
// This example shows how to implement rate limiting and time-based restrictions
const rateLimitExample = () => {
  // Create a throttled middleware that limits updates to 1 per second
  const throttler = createThrottleMiddleware<number>(1);

  // Create a time window middleware that only allows updates during business hours
  const timeWindow = createTimeWindowMiddleware<number>([
    9, 10, 11, 12, 13, 14, 15, 16, 17,
  ]);

  // Initialize the state system with the middleware chain
  initTreeState({
    initialState: { apiCalls: 0 },
    middleware: [throttler, timeWindow],
  });
};

// Example 4: Complex validation with async operations
// This example shows how to combine complex validation with async operations
const complexValidationExample = () => {
  // Create a validation middleware for user data
  const userValidator = createValidationMiddleware<{
    name: string;
    age: number;
    email: string;
  }>((path, nextValue) => {
    if (!nextValue.name || nextValue.name.length < 2) {
      return "Name must be at least 2 characters long";
    }
    if (nextValue.age < 18) {
      return "User must be at least 18 years old";
    }
    if (!nextValue.email.includes("@")) {
      return "Invalid email address";
    }
    return true;
  });

  // Create an async middleware that simulates user data validation
  const asyncValidator = createAsyncMiddleware<{
    name: string;
    age: number;
    email: string;
  }>(async (path, nextValue) => {
    // Simulate API validation
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`[Validation] Checking user data for ${nextValue.name}`);
    return nextValue;
  });

  // Initialize the state system with the middleware chain
  initTreeState({
    initialState: {
      user: {
        name: "",
        age: 0,
        email: "",
      },
    },
    middleware: [userValidator, asyncValidator],
  });
};

// Example 5: Form handling with debouncing and persistence
// This example shows how to handle form state with debouncing and persistence
const formHandlingExample = () => {
  // Create a debounced middleware for form updates
  const formDebouncer = createDebounceMiddleware<{
    username: string;
    password: string;
    email: string;
  }>(300);

  // Create a persistence middleware for form state
  const formPersister = createPersistenceMiddleware<{
    username: string;
    password: string;
    email: string;
  }>("formState");

  // Create a logging middleware for form changes
  const formLogger = createLoggingMiddleware<{
    username: string;
    password: string;
    email: string;
  }>({
    logPath: true,
    logValue: false, // Don't log sensitive data
    logPrevValue: false,
  });

  // Initialize the state system with the middleware chain
  initTreeState({
    initialState: {
      form: {
        username: "",
        password: "",
        email: "",
      },
    },
    middleware: [formDebouncer, formLogger, formPersister],
  });
};

// Export all examples
export {
  basicExample,
  asyncDebounceExample,
  rateLimitExample,
  complexValidationExample,
  formHandlingExample,
};
