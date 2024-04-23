/* eslint-disable eqeqeq */
import { isNumber } from 'lodash-es'

export const withOrdinalSuffix = (val: number | string) => {
  const num = isNumber(val) ? val : parseInt(val, 10)
  const j = num % 10,
    k = num % 100
  if (j == 1 && k != 11) {
    return num + 'st'
  }
  if (j == 2 && k != 12) {
    return num + 'nd'
  }
  if (j == 3 && k != 13) {
    return num + 'rd'
  }
  return num + 'th'
}
