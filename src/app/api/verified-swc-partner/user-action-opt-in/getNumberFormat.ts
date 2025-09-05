/**
 * Extracts the format pattern from a phone number by replacing digits with 'D'
 * while preserving formatting characters like dashes, spaces, parentheses, etc.
 *
 * This is useful for logging and analytics to understand what formats users
 * are submitting phone numbers in.
 *
 * @param phoneNumber - The phone number string to extract format from
 * @returns The format pattern (e.g., "DD-DDD-DDD-DDDD", "(DDD) DDD-DDDD")
 *
 * @example
 * getNumberFormat("123-456-7890") // returns "DDD-DDD-DDDD"
 * getNumberFormat("(123) 456-7890") // returns "(DDD) DDD-DDDD"
 * getNumberFormat("+1 (123) 456-7890") // returns "+D (DDD) DDD-DDDD"
 * getNumberFormat("1234567890") // returns "DDDDDDDDDD"
 */
export function getNumberFormat(phoneNumber: string): string {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return ''
  }

  return phoneNumber.replace(/\d/g, 'D')
}
