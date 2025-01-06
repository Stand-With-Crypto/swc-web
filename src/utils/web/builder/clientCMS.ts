'use client'

import { builder } from '@builder.io/react'

import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const NEXT_PUBLIC_BUILDER_IO_PUBLIC_KEY = requiredOutsideLocalEnv(
  process.env.NEXT_PUBLIC_BUILDER_IO_PUBLIC_KEY,
  'NEXT_PUBLIC_BUILDER_IO_PUBLIC_KEY',
  'all builder.io related features',
)!

let init = false
export function maybeInitCMSClient() {
  if (!init) {
    builder.init(NEXT_PUBLIC_BUILDER_IO_PUBLIC_KEY)
    init = true
  }
}
