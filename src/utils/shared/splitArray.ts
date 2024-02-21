import { chunk } from 'lodash-es'

export function splitArray<A extends object[]>(flatArray: A, num: number) {
  const maxColLength = Math.ceil(flatArray.length / num)
  const nestedArray = chunk(flatArray, maxColLength) as A[]
  const newArray: A[] = []
  for (let i = 0; i < num; i++) {
    newArray[i] = nestedArray[i] || []
  }
  return newArray
}
