'use client'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/useToast'
import { fetchReq } from '@/utils/shared/fetchReq'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import { useUser } from '@thirdweb-dev/react'

export function SampleAuthenticatedRequest() {
  const { toast } = useToast()
  return (
    <div>
      <Button
        onClick={() =>
          fetchReq('/api/sample-authenticated-endpoint', { method: 'POST' })
            .then(() =>
              toast({
                title: 'Success!',
                description: 'Successfully returned because you are authenticated',
              }),
            )
            .catch(catchUnexpectedServerErrorAndTriggerToast(toast))
        }
      >
        Trigger Authenticated API Request
      </Button>
    </div>
  )
}
