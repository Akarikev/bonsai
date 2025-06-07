// bonsai/devlog.ts
/**
 * Development logging system for Bonsai.
 * Provides a simple in-memory logging mechanism for debugging and development purposes.
 * Logs are stored with timestamps and automatically trimmed to prevent memory issues.
 *
 * @example
 * ```typescript
 * // Add a log entry
 * addLog("User state updated");
 *
 * // Get all logs
 * const logs = getLogs();
 * console.log(logs);
 * ```
 */

type DevLogEntry = string;

const logs: DevLogEntry[] = [];

/**
 * Add a new log entry with a timestamp.
 * Logs are automatically trimmed to the last 100 entries to prevent memory issues.
 *
 * @param entry - The log message to add
 *
 * @example
 * ```typescript
 * addLog("State changed: user/name");
 * addLog("Middleware blocked update");
 * ```
 */
export const addLog = (entry: DevLogEntry) => {
  logs.push(`[${new Date().toLocaleTimeString()}] ${entry}`);
  if (logs.length > 100) logs.shift(); // Trim to last 100 logs
};

/**
 * Get a copy of all current log entries.
 * Returns a shallow copy of the logs array to prevent external modification.
 *
 * @returns Array of log entries with timestamps
 *
 * @example
 * ```typescript
 * const logs = getLogs();
 * logs.forEach(log => console.log(log));
 * ```
 */
export const getLogs = () => logs.slice(); // Return shallow copy
