import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function excerpt(value: string, length = 130) {
  return value.length > length ? `${value.slice(0, length).trim()}...` : value;
}
