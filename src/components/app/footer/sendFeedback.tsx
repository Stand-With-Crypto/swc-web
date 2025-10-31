'use client'

import Balancer from 'react-wrap-balancer'
import Link from 'next/link'

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
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

export function SendFeedbackButton({
  href,
  countryCode,
}: {
  href: string
  countryCode: SupportedCountryCodes
}) {
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
          {countryCode !== SupportedCountryCodes.US && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              <Balancer>
                This email address is monitored by SWC International Ltd. and its service providers.
                Any information submitted to this email is subject to SWC International Ltd.'s
                <Link href={getIntlUrls(countryCode).privacyPolicy()}>Privacy Policy</Link>.
              </Balancer>
            </p>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
