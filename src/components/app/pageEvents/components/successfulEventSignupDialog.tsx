'use client'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { useDialog } from '@/hooks/useDialog'

export function SuccessfulEventNotificationsSignupDialog() {
  const dialogProps = useDialog({ analytics: 'Successful Event Notifications Signup Dialog' })

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger>Sucessful Event Notification Signup Dialog</DialogTrigger>{' '}
      {/* This is temporary */}
      <DialogContent a11yTitle="Successful Event Notifications Signup" className="max-w-[578px]">
        <div className="flex flex-col items-center gap-2 pb-4">
          <NextImage
            alt="SWC shield"
            className="mb-2 lg:mb-0"
            height={120}
            src="/shields/purple.svg"
            width={120}
          />

          <h3 className="mt-6 font-sans text-xl font-bold">You signed up for updates!</h3>
          <p className="text-center font-mono text-base text-muted-foreground">
            We’ll send you text updates on this event and other similar events in your area.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
