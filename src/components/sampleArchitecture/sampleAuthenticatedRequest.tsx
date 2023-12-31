'use client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { fetchReq } from '@/utils/shared/fetchReq'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'

export function SampleAuthenticatedRequest() {
  return (
    <div>
      <Button
        onClick={() =>
          fetchReq('/api/sample-authenticated-endpoint', { method: 'POST' })
            .then(() =>
              toast.success('Success!', {
                description: 'Successfully returned because you are authenticated',
                duration: 5000,
              }),
            )
            .catch(catchUnexpectedServerErrorAndTriggerToast)
        }
      >
        Trigger Authenticated API Request
      </Button>
    </div>
  )
}
