'use client'
/*
Odometer animations are smoothest when we aren't going from a higher number to a lower number
so to create the desired initial loading effect, we want the animating numbers to always start at zero
To prevent not animating because the actual number is zero, we subtract one from the actual number
*/
export function roundDownNumberToAnimateIn(value: number, roundTo: number) {
  return Math.floor((value - 1) / roundTo) * roundTo
}
