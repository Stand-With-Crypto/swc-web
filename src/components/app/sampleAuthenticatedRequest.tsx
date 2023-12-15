'use client'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { fetchReq } from '@/utils/web/fetchReq'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import { useUser } from '@thirdweb-dev/react'

export function SampleAuthenticatedRequest() {
  const { toast } = useToast()
  const { user, isLoggedIn, isLoading } = useUser()
  console.log({ user })
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
