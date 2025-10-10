import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function for merging class names with Tailwind CSS deduplication
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function noop() {}
