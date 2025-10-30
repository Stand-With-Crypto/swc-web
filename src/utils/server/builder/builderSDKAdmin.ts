import 'server-only'

import { createAdminApiClient } from '@builder.io/admin-sdk'

import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const BUILDER_IO_PRIVATE_KEY = requiredOutsideLocalEnv(
  process.env.BUILDER_IO_PRIVATE_KEY,
  'BUILDER_IO_PRIVATE_KEY',
  'all builder.io related',
)!

// Created these constants so that instead of just passing undefined,
// it becomes more readable for others.
// I also had to pass these undefined parameters to reach the AUTH_TOKEN and pass the private key.
// The private key is required to request private content on builder.io | e.g.: SWC Questionnaire answers
const AUTH_TOKEN = BUILDER_IO_PRIVATE_KEY

export const builderSDKAdmin = createAdminApiClient(AUTH_TOKEN)
