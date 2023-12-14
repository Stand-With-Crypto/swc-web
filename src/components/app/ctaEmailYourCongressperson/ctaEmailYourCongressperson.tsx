import React, { Suspense } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormEmailYourCongressperson } from './formEmailYourCongressperson'

export const CTAEmailYourCongressperson = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Email Congressperson</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tell your representative to support pro-crypto policies</DialogTitle>
          <Suspense fallback={null}>
            <FormEmailYourCongressperson />
          </Suspense>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
