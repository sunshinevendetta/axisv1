import { promises as fs } from "node:fs";
import path from "node:path";

type ReadJsonFileOptions<T> = {
  fallback: T;
  validate?: (value: unknown) => value is T;
  onError?: (error: unknown) => void;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function readJsonFile<T>(filePath: string, options: ReadJsonFileOptions<T>): Promise<T> {
  try {
    const fileContents = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(fileContents) as unknown;

    if (options.validate && !options.validate(parsed)) {
      throw new Error(`Invalid JSON structure in ${path.basename(filePath)}.`);
    }

    return parsed as T;
  } catch (error) {
    options.onError?.(error);
    return options.fallback;
  }
}

export async function writeJsonFile(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
