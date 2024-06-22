import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stopPropagation(e: React.MouseEvent) {
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
  e.preventDefault();
}
export function cleanUrl(url?: string) {
  if (!url) return "";
  if (url.slice(-1) === ".") {
    return url.slice(0, -1);
  }
  return url;
}

export function formatNumber(number: number) {
  if (typeof number === "number") {
    return number.toLocaleString("en-US");
  } else return "not a number";
}
export function formatCount(number: number) {
  if (number < 1000) {
    return number.toString();
  } else if (number < 1_000_000) {
    return `${Number((number / 1000).toFixed(1))}K`;
  } else {
    return `${Number((number / 1_000_000).toFixed(1))}M`;
  }
}
export function log(
  type: "info" | "error" | "warn" | "func",
  ...args: unknown[]
) {
  const isOn = process.env.NODE_ENV === "development";
  if (!isOn) return;
  const consoleType = type === "func" ? "info" : type;
  const items = [...args].map((a) => `%c${a}`);
  console[consoleType](
    ...items,
    type === "info"
      ? "color: aqua;"
      : type === "warn"
        ? "color: yellow;"
        : type === "func"
          ? "color: green;"
          : "color: red;",
  );
}

export function validateUrl(value: string) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    value,
  );
}
export function btcToSats(amount: number) {
  return parseInt((amount * 100_000_000).toFixed());
}
export function satsToBtc(amount: number) {
  return amount / 100_000_000;
}
export function formatMoney(amount: number, currency?: string) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "USD",
  });
  return formatter.format(amount);
}

export function truncateText(text: string, size?: number) {
  let length = size ?? 5;
  return text.slice(0, length) + "..." + text.slice(-length);
}
export function getNameToShow(user: {
  npub: string;
  profile?: {
    displayName?: string;
    name?: string;
  };
}) {
  return (
    user.profile?.displayName ?? user.profile?.name ?? truncateText(user.npub)
  );
}
export function getLettersPlain(text?: string) {
  if (!text) return "";
  const splitString = text
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .join(" ");
  return splitString;
}
export function getTwoLetters(user: {
  npub: string;
  profile?: {
    displayName?: string;
    name?: string;
  };
}) {
  if (user.profile) {
    if (user.profile.displayName) {
      const firstLetter = user.profile.displayName.at(0);
      const secondLetter =
        user.profile.displayName.split(" ")[1]?.at(0) ??
        user.profile.displayName.at(1) ??
        "";
      return firstLetter + secondLetter;
    }
    if (user.profile.name) {
      const firstLetter = user.profile.name.at(0);
      const secondLetter =
        user.profile.name.split(" ")[1]?.at(0) ?? user.profile.name.at(1) ?? "";
      return firstLetter + secondLetter;
    }
  }
  return (user.npub.at(5) ?? "") + (user.npub.at(6) ?? "");
}
export async function copyText(text: string) {
  return await navigator.clipboard.writeText(text);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
