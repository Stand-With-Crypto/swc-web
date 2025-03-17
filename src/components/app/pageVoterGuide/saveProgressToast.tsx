'use client'

import { X } from 'lucide-react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { Button } from '@/components/ui/button'
import { Portal } from '@/components/ui/portal'

interface SaveProgressToastProps {
  isOpen: boolean
  onClose: () => void
}

export function SaveProgressToast(props: SaveProgressToastProps) {
  const { isOpen, onClose } = props

  return (
    <Portal className="fixed bottom-0 right-0 z-50 flex justify-end sm:bottom-4 sm:right-4">
      {isOpen ? (
        <div className="w-full space-y-4 bg-purple-200 p-4 sm:max-w-[375px] sm:rounded-xl">
          <div className="flex justify-between">
            <p className="font-semibold">Save your progress</p>
            <button onClick={onClose}>
              <div className="rounded-full p-1 transition-all hover:bg-gray-400">
                <X className="h-4 w-4" />
              </div>
            </button>
          </div>
          <p className="text-muted-foreground">
            Sign up or log in to Stand With Crypto to save your progress.
          </p>
          <LoginDialogWrapper onLoginCallback={onClose}>
            <Button className="min-w-[100px]" variant="primary-cta">
              Sign Up
            </Button>
          </LoginDialogWrapper>
        </div>
      ) : null}
    </Portal>
  )
}
