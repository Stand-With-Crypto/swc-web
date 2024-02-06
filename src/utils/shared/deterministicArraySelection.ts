export function deterministicArraySelection<T>(arr: T[], seed: string) {
  seed = (seed || '') + 'xx' // ensure a seed that can be reduced
  const charCodes = seed.split('').reduce((a, b, i) => {
    return `${(i === 1 ? a.charCodeAt(0) : +a) + b.charCodeAt(0)}`
  })
  return arr[Number(charCodes) % arr.length]
}
