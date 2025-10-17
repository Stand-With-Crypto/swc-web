'use server'
import 'server-only'

// NOTE: This is a stub for type safety on the frontend branch
// The actual implementation is in the letter/backend branch

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { zodUserActionFormLetterAction } from '@/validation/forms/zodUserActionFormLetter'
import { z } from 'zod'

type Input = z.infer<typeof zodUserActionFormLetterAction>

export async function actionCreateUserActionLetter(_input: Input): Promise<
  | { user: ReturnType<typeof getClientUser> }
  | {
      errors: Record<string, string[]>
      errorsMetadata?: Record<string, any>
    }
> {
  // Stub implementation - actual implementation in letter/backend branch
  throw new Error('actionCreateUserActionLetter not implemented on this branch')
}

