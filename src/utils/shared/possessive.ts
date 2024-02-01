export const possessive = (str: string) => {
  if (str === '') {
    return str
  }
  const lastChar = str.slice(-1)
  const endOfWord = lastChar.toLowerCase() === 's' ? "'" : `${"'"}s`
  return `${str}${endOfWord}`
}
