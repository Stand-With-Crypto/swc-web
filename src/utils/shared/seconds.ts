/**
 * @note When defining `revalidate` in a NextJS Page, the value needs to be statically assigned.
 *
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate:~:text=function%20MyComponent()%20%7B%7D-,Good%20to%20know,-%3A | The values of the config options currently need be statically analyzable. For example revalidate = 600 is valid, but revalidate = 60 * 10 is not.}
 */
export const SECONDS_DURATION = {
  WEEK: 604800,
  DAY: 86400,
  HOUR: 3600,
  '30_MINUTES': 1800,
  '20_MINUTES': 1200,
  '15_MINUTES': 900,
  '10_MINUTES': 600,
  '5_MINUTES': 300,
  MINUTE: 60,
  '2_MINUTES': 120,
  '30_SECONDS': 30,
  SECOND: 1,
}
