'use client'
import React, { useEffect, useState } from 'react'
import { useInterval } from 'react-use'
import * as Sentry from '@sentry/nextjs'

import { logger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const dynamic = 'error'

export default function DebugClientSentry() {
  const [val, setVal] = useState<any>(false)
  useEffect(() => {
    if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
      return
    }
    console.log('page debug-sentry-client log')
    logger.info('page debug-sentry-client logger')
    Sentry.captureException(new Error('testing sentry'), { tags: { domain: 'debug' } })
  }, [])
  useInterval(() => setVal(() => ({ foo: 'bar' })), 2000)
  if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return <div className="container max-w-lg">not enabled in production</div>
  }
  // eslint-disable-next-line
  return <div>foobar{`${val && val.foo.bar.baz}`}</div>
}
