import React from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog'
import { Button } from '../components/ui/button'

export const CTAJoinTheFight = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Join The Fight</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Help us defend your crypto in America</DialogTitle>
          <DialogDescription>
            Lawmakers and regulators are threatening the crypto industry. You can fight back and ask
            for sensible rules. Join the Stand with Crypto movement to make your voice heard in D.C.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
