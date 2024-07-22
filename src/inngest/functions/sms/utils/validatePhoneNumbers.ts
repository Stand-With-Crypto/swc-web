import { validatePhoneNumber as basicPhoneNumberValidation } from '@/utils/shared/phoneNumber'
import { sleep } from '@/utils/shared/sleep'

const VALIDATION_MAX_RETRIES = 3

type PhoneNumberValidationFunction = (phoneNumber: string) => Promise<boolean> | boolean

export async function validatePhoneNumbers(
  phoneNumbers: string[],
  validation: PhoneNumberValidationFunction = basicPhoneNumberValidation,
) {
  const validateBatch = (batch: string[]) => {
    const validatePhoneNumbersPromises = batch.map(async phoneNumber => {
      try {
        const isValid = await validation(phoneNumber)

        return {
          phoneNumber,
          isValid,
        }
      } catch (error) {
        return {
          phoneNumber,
          isValid: null,
        }
      }
    })

    return Promise.all(validatePhoneNumbersPromises)
  }

  let unidentifiedPhoneNumbers: string[] = []
  const invalidPhoneNumbers: string[] = []
  const validPhoneNumbers: string[] = []

  // Validate phone number with exponential retries
  for (let i = 0; i < VALIDATION_MAX_RETRIES; i += 1) {
    // At first, all phone numbers are unidentified
    const validatedPhoneNumbers = await validateBatch(
      i === 0 ? phoneNumbers : unidentifiedPhoneNumbers,
    )
    unidentifiedPhoneNumbers = []

    validatedPhoneNumbers.forEach(({ isValid, phoneNumber }) => {
      if (isValid) {
        validPhoneNumbers.push(phoneNumber)
      } else if (isValid === false) {
        invalidPhoneNumbers.push(phoneNumber)
      } else {
        unidentifiedPhoneNumbers.push(phoneNumber)
      }
    })

    if (unidentifiedPhoneNumbers.length > 0) {
      await sleep(10000 * i + 1)
    } else {
      break
    }
  }

  return {
    invalid: invalidPhoneNumbers,
    valid: validPhoneNumbers,
    unidentified: unidentifiedPhoneNumbers,
  }
}
