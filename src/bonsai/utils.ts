// bonsai/utils.ts

/**
 * Recursively walks the state tree and returns all paths as strings.
 */
export function getAllPaths(obj: any, prefix = ""): string[] {
  if (obj === null || obj === undefined) {
    return [];
  }

  if (typeof obj !== "object") {
    return [prefix];
  }

  const paths: string[] = [];

  for (const key of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}/${key}` : key;
    const childPaths = getAllPaths(obj[key], fullPath);
    if (childPaths.length > 0) {
      paths.push(...childPaths);
    } else {
      // If child is primitive, push this path
      paths.push(fullPath);
    }
  }

  return paths;
}
