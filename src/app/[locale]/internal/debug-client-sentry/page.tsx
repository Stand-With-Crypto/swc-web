'use client'
import React, { useEffect, useState } from 'react'
import { useInterval } from 'react-use'
import * as Sentry from '@sentry/nextjs'

export const dynamic = 'error'

export default function DebugClientSentry() {
  const [val, setVal] = useState<any>(false)
  useEffect(() => {
    Sentry.captureException(new Error('testing sentry'), { tags: { domain: 'debug' } })
  }, [])
  useInterval(() => setVal(() => ({ foo: 'bar' })), 2000)
  // eslint-disable-next-line
  return <div>foobar{`${val && val.foo.bar.baz}`}</div>
}
