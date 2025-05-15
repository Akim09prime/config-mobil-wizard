
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely formats a number using toLocaleString
 * @param value The number to format
 * @param locale The locale to use (defaults to 'ro-RO')
 * @param fallback The fallback value if the input is null or undefined
 * @returns A formatted string
 */
export function formatNumber(value: number | null | undefined, locale: string = 'ro-RO', fallback: string = '0'): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  return value.toLocaleString(locale);
}
