/*
Some APIs we work with will return only return english characters. This function normalizes a string to only contain english characters so we can do comparisons
*/

export function convertToOnlyEnglishCharacters(word: string) {
  // Map of non-english characters to english
  const charMap: Record<string, string> = {
    á: 'a',
    à: 'a',
    â: 'a',
    ä: 'a',
    ã: 'a',

    é: 'e',
    è: 'e',
    ê: 'e',
    ë: 'e',

    í: 'i',
    ì: 'i',
    î: 'i',
    ï: 'i',

    ó: 'o',
    ò: 'o',
    ô: 'o',
    ö: 'o',
    õ: 'o',

    ú: 'u',
    ù: 'u',
    û: 'u',
    ü: 'u',

    ñ: 'n',

    ç: 'c',

    ā: 'a',
    ē: 'e',
    ī: 'i',
    ō: 'o',
    ū: 'u',

    ă: 'a',
    ĕ: 'e',
    ŏ: 'o',
    ŭ: 'u',

    ċ: 'c',
    ḋ: 'd',
    ġ: 'g',
    ḣ: 'h',

    å: 'a',

    ą: 'a',
    ę: 'e',
    į: 'i',
    ų: 'u',

    č: 'c',
    ḑ: 'd',
    ě: 'e',
    ḟ: 'f',
    ǧ: 'g',
    ḧ: 'h',
    ǐ: 'i',
    ǰ: 'j',
    ǩ: 'k',
    ḷ: 'l',
    ǹ: 'n',
    ň: 'n',
    ř: 'r',
    š: 's',
    ť: 't',
    ž: 'z',
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
