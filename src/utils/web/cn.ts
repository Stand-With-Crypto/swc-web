import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/*
see this fn referenced in .vscode/setting.json -> tailwindCSS.experimental.classRegex
This fn does nothing. We use it where we reference tailwind styles outside jsx className calls
to get vscode syntax highlighting working
*/
export const twNoop = <T>(args: T) => args
