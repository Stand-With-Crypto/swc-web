import { string } from 'zod'

const phoneRegex = new RegExp(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/)

export const zodPhoneNumber = string().regex(phoneRegex, 'Please enter a valid phone number')
