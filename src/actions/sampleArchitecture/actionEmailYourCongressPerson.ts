'use server'
import 'server-only'
import { z } from 'zod'
import { zodEmailYourCongressperson } from '@/validation/forms/zodEmailYourCongressperson'

export async function actionEmailYourCongressPerson(
  data: z.infer<typeof zodEmailYourCongressperson>,
) {
  const validatedFields = zodEmailYourCongressperson
    .extend({
      zipCode: z
        .string()
        .min(5, 'Please enter your zip code')
        .max(5, 'Please enter your zip code')
        .startsWith(
          '1',
          'Adding a weird validation thing to the server to QA returning server-side validation from zod',
        ),
    })
    .safeParse(data)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  if (validatedFields.data.firstName === 'throw') {
    throw new Error('throwing error to mock out server errors on client')
  }
  // TODO trigger actual logic

  return {
    data: validatedFields.data,
  }
}
