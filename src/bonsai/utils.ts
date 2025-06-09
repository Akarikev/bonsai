// bonsai/utils.ts

const pathCache = new Map<object, string[]>();

/**
 * Recursively walks the state tree and returns all paths as strings.
 * Uses Map for memoization to improve performance.
 */
export function getAllPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || obj === undefined) {
    return [];
  }

  if (typeof obj !== "object") {
    return [prefix];
  }

  // Check cache for object paths
  if (pathCache.has(obj as object)) {
    const cachedPaths = pathCache.get(obj as object)!;
    return prefix
      ? cachedPaths.map((path) => `${prefix}/${path}`)
      : cachedPaths;
  }

  const paths: string[] = [];

  // Add the current object's path if it's an object (including array)
  if (prefix) {
    paths.push(prefix);
  }

  const keys = Object.keys(obj as object);

  for (const key of keys) {
    const fullPath = prefix ? `${prefix}/${key}` : key;
    const value = (obj as any)[key];

    if (value === null || value === undefined) {
      paths.push(fullPath);
      continue;
    }

    if (typeof value === "object") {
      const childPaths = getAllPaths(value, fullPath);
      paths.push(...childPaths);
    } else {
      paths.push(fullPath);
    }
  }

  // Cache the paths for this object
  if (typeof obj === "object" && obj !== null) {
    pathCache.set(obj, paths);
  }

  return paths;
}

/**
 * Clears the path cache. Useful for testing or when memory usage needs to be managed.
 */
export function clearPathCache(): void {
  pathCache.clear();
}
