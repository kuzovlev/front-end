import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const buttonVariants = {
  yellow: 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg shadow-yellow-500/20',
  yellowOutline: 'border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white',
  yellowGhost: 'text-yellow-500 hover:bg-yellow-500/20',
}
