import { flatten, times } from 'lodash-es'

/**
 * Generates static params for Next.js pagination routes with [[...page]] pattern.
 *
 * @param totalPregeneratedPages - The total number of pages to pregenerate
 * @returns Array of static params where first page is [] and subsequent pages are [page_number]
 *
 * @example
 * // For totalPregeneratedPages = 3, returns:
 * // [
 * //   { page: [] },          // for /route (page 1)
 * //   { page: ["2"] },       // for /route/2 (page 2)
 * //   { page: ["3"] }        // for /route/3 (page 3)
 * // ]
 */
export function generatePaginationStaticParams(totalPregeneratedPages: number) {
  return flatten(times(totalPregeneratedPages).map(i => ({ page: i ? [`${i + 1}`] : [] })))
}
