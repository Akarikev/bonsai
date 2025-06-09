/**
 * Recursively walks the state tree and returns all paths as strings.
 * Uses Map for memoization to improve performance.
 */
export declare function getAllPaths(obj: unknown, prefix?: string): string[];
/**
 * Clears the path cache. Useful for testing or when memory usage needs to be managed.
 */
export declare function clearPathCache(): void;
