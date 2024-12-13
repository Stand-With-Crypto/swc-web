'use client'

import { ReactNode } from 'react'
import * as Sentry from '@sentry/react'
import { Extras, Primitive } from '@sentry/types'

import { getUserSessionIdOnClient } from '@/utils/web/clientUserSessionId'

interface ErrorBoundaryProps extends Sentry.ErrorBoundaryProps {
  children: ReactNode
  tags?: { [key: string]: Primitive }
  extras?: Extras
  severityLevel?: Sentry.SeverityLevel
}

export function ErrorBoundary({ children, tags, extras, severityLevel }: ErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      beforeCapture={scope => {
        const sessionId = getUserSessionIdOnClient()

        if (sessionId) {
          scope.setUser({
            id: sessionId,
            idType: 'session',
          })
        }

        if (tags) {
          scope.setTags(tags)
        }

        if (extras) {
          scope.setExtras(extras)
        }

        if (severityLevel) {
          scope.setLevel(severityLevel)
        }

        return scope
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
