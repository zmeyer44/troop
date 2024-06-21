import { uniq } from "ramda";

// Define overloads
export function getTag(
  tags: string[][],
  key: string,
  index: number,
): string | undefined;
export function getTag<T>(
  tags: string[][],
  key: string,
  index: number,
  callback: (v: string) => T,
): T | undefined;
export function getTag(tags: string[][], key: string): string[] | undefined;

// Implementation
export function getTag(
  tags: string[][],
  key: string,
  index?: number,
  callback?: (v: string) => any,
): string | string[] | undefined {
  const foundTag = tags.find((t) => t[0] === key);
  if (!foundTag) return undefined; // Explicitly return undefined for clarity
  if (index !== undefined) {
    if (callback && foundTag[index] !== undefined) {
      return callback(foundTag[index] as string); // Will return a string or undefined if index is out of bounds
    }
    return foundTag[index]; // Will return a string or undefined if index is out of bounds
  }
  return foundTag; // Will return the entire array
}

// Define overloads
export function getTags(tags: string[][], key: string, index: number): string[];
export function getTags<T>(
  tags: string[][],
  key: string,
  index: number,
  callback: (v: string) => T,
): T[];
export function getTags(tags: string[][], key: string): string[][];
export function getTags(
  tags: string[][],
  key: string,
  index?: number,
  callback?: (v: string) => any,
) {
  const foundTags = tags.filter((t) => t[0] === key);
  if (index !== undefined) {
    const data = foundTags.map((t) => t[index]).filter((t) => t !== undefined);
    if (callback) {
      return data.map((t) => callback(t!));
    }
    return data;
  }
  return foundTags;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const slugify = (...args: string[]): string => {
  const value = args.join(" ");

  return value
    .normalize("NFD") // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, "") // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "") // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, "-"); // separator
};
export function removeDuplicates<T>(list: readonly T[]): T[] {
  return uniq(list);
}
export function unixTimeNowInSeconds() {
  return Math.floor(new Date().getTime() / 1000);
}
