'use server'
import 'server-only'
import { z } from 'zod'
import { zodUpdateUserProfile } from '@/validation/zodUpdateUserProfile'

// TODO error logging software

export async function actionUpdateUserProfile(data: z.infer<typeof zodUpdateUserProfile>) {
  const validatedFields = zodUpdateUserProfile.safeParse(data)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  return {
    data: validatedFields.data,
  }
}
