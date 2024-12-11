import { ReactNode } from 'react'
import * as Sentry from '@sentry/react'
import { Extras, Primitive } from '@sentry/types'

import { ErrorFallbackComponent } from '@/components/app/errorBoundary/fallback'

interface ErrorBoundaryProps extends Sentry.ErrorBoundaryProps {
  children: ReactNode
  sessionId?: string
  tags?: { [key: string]: Primitive }
  extras?: Extras
  fallback?: Sentry.ErrorBoundaryProps['fallback']
  severityLevel?: Sentry.SeverityLevel
}

export function ErrorBoundary({
  children,
  sessionId,
  tags,
  extras,
  fallback,
  severityLevel,
}: ErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      beforeCapture={scope => {
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
