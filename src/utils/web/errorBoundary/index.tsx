'use client'

import { ReactNode } from 'react'
import * as Sentry from '@sentry/react'
import { Extras, Primitive } from '@sentry/types'

import { getUserSessionIdOnClient } from '@/utils/web/clientUserSessionId'
import { ErrorFallbackComponent } from '@/utils/web/errorBoundary/fallback'

interface ErrorBoundaryProps extends Sentry.ErrorBoundaryProps {
  children: ReactNode
  tags?: { [key: string]: Primitive }
  extras?: Extras
  fallback?: Sentry.ErrorBoundaryProps['fallback']
  severityLevel?: Sentry.SeverityLevel
}

export function ErrorBoundary({
  children,
  tags,
  extras,
  fallback,
  severityLevel,
}: ErrorBoundaryProps) {
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

        scope.setLevel(severityLevel ?? 'warning')

        return scope
      }}
      fallback={fallback ?? ErrorFallbackComponent}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
