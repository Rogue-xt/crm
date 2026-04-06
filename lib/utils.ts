import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateEmployeeId(prefix: string, number: number) {
  // Pads the number to 4 digits: 1 -> 0001
  const sequence = number.toString().padStart(4, "0");
  return `${prefix.toUpperCase()}${sequence}`;
}