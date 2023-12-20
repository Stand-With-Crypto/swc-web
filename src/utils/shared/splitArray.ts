import _ from 'lodash'

export function splitArray<A extends object[]>(flatArray: A, num: number) {
  const maxColLength = Math.ceil(flatArray.length / num)
  const nestedArray = _.chunk(flatArray, maxColLength) as A[]
  const newArray: A[] = []
  for (let i = 0; i < num; i++) {
    newArray[i] = nestedArray[i] || []
  }
  return newArray
}
