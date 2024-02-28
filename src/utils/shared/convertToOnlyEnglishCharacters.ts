/*
Some APIs we work with will return only return english characters. This function normalizes a string to only contain english characters so we can do comparisons
*/

export function convertToOnlyEnglishCharacters(word: string) {
  // Map of non-english characters to english
  const charMap: Record<string, string> = {
    á: 'a',
    é: 'e',
    í: 'i',
    ó: 'o',
    ú: 'u',
  }

  // Split name into array of characters
  const characters = word.split('')

  // Loop through characters
  for (let i = 0; i < characters.length; i++) {
    // Check if character is in charMap
    if (charMap[word[i]]) {
      // Replace character with english equivalent
      characters[i] = charMap[word[i]]
    }
  }

  // Join characters back into a string
  return characters.join('')
}
