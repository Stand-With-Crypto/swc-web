'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogProps } from '@/components/ui/dialog'

interface CountryCodeDialogProps {
  dialogProps: DialogProps
  handleUserAcceptance: () => void
}

export function CountryCodeDisclaimerDialog({
  dialogProps,
  handleUserAcceptance,
}: CountryCodeDialogProps) {
  return (
    <Dialog {...dialogProps} open={dialogProps.open}>
      <DialogContent
        a11yTitle="Country Code Disclaimer"
        className="max-w-xl p-6"
        closeClassName="hidden"
        onEscapeKeyDown={e => {
          e.preventDefault()
        }}
        padding={false}
        preventCloseOnEscapeKeyDown
        preventCloseOnInteractOutside
      >
        <div className="flex flex-col gap-4">
          <p>You are about to change your country based on the address you have selected.</p>
          <Button onClick={handleUserAcceptance} variant="primary-cta">
            I understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
