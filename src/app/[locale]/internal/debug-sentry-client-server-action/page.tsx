'use client'
import { actionDebugSentry } from '@/actions/actionDebugSentry'
import { Button } from '@/components/ui/button'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const dynamic = 'error'

export default function DebugClientServerActionSentry() {
  if (NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return <div className="container max-w-lg">not enabled in production</div>
  }
  return (
    <div className="p-36 text-center">
      <Button
        onClick={() =>
          actionDebugSentry({
            num: 3,
            bool: true,
            str: 'test',
            nestedObject: { something: { deeply: { nested: 'for parsing' } } },
            arr: [1, 2, 3],
            date: new Date(),
          })
        }
      >
        Click to trigger erroring server action
      </Button>
    </div>
  )
}
