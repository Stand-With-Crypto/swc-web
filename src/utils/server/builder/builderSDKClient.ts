import 'server-only'

import { builder } from '@builder.io/sdk'

import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const NEXT_PUBLIC_BUILDER_IO_PUBLIC_KEY = requiredOutsideLocalEnv(
  process.env.NEXT_PUBLIC_BUILDER_IO_PUBLIC_KEY,
  'NEXT_PUBLIC_BUILDER_IO_PUBLIC_KEY',
  'all builder.io related features',
)!

const BUILDER_IO_PRIVATE_KEY = requiredOutsideLocalEnv(
  process.env.BUILDER_IO_PRIVATE_KEY,
  'BUILDER_IO_PRIVATE_KEY',
  'all builder.io related',
)!

// Created these constants so that instead of just passing undefined,
// it becomes more readable for others.
// I also had to pass these undefined parameters to reach the AUTH_TOKEN and pass the private key.
// The private key is required to request private content on builder.io | e.g.: SWC Questionnaire answers
const CAN_TRACK = undefined
const REQUEST = undefined
const RESPONSE = undefined
const AUTH_TOKEN = BUILDER_IO_PRIVATE_KEY

export const builderSDKClient = builder.init(
  NEXT_PUBLIC_BUILDER_IO_PUBLIC_KEY,
  CAN_TRACK,
  REQUEST,
  RESPONSE,
  AUTH_TOKEN,
)
