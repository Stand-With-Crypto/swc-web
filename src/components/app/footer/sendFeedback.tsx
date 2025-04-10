'use client'

import Balancer from 'react-wrap-balancer'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard'
import { useDialog } from '@/hooks/useDialog'

export function SendFeedbackButton({ href }: { href: string }) {
  const dialogProps = useDialog({ analytics: 'Send-Feedback-Dialog' })
  const [copiedValue, handleCopyToClipboard] = useCopyTextToClipboard()

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger className="block text-gray-400 hover:underline">Send feedback</DialogTrigger>
      <DialogContent a11yTitle="Send Feedback" className="pb-4 pt-0">
        <DialogBody className="flex flex-col justify-between">
          <div>
            <DialogTitle className="text-center text-2xl">Send Feedback</DialogTitle>
            <p className="py-6 text-center text-muted-foreground">
              <Balancer>
                We’d love to hear from you! If you have any thoughts, suggestions, or comments, feel
                free to share them with us at the email below.
              </Balancer>
            </p>
            <div className="rounded-md bg-muted p-4 text-center font-semibold">{href}</div>
          </div>
          <Button
            className="mt-4"
            onClick={() => handleCopyToClipboard(href)}
            size="lg"
            variant="primary-cta"
          >
            {copiedValue ? 'Copied!' : 'Copy email to clipboard'}
          </Button>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
