// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn – a tiny helper that merges Tailwind classes safely
 * (handles conflicts like "p-4 p-2" → "p-2")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}