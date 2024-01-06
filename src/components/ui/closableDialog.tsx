'use client'
/*
Simple wrapper around dialog that makes it easy for children of the DialogContent to dismiss.
*/

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import React from 'react'

interface ChildProps {
  onClose: React.Dispatch<React.SetStateAction<boolean>>
  open: boolean
}

export function ClosableDialog<C>({
  ContentComponent,
  dialogTriggerChildren,
  contentProps,
}: {
  dialogTriggerChildren: React.ReactNode
  ContentComponent: React.FC<C & ChildProps>
  contentProps: C
}) {
  const [open, onClose] = React.useState(false)
  return (
    <Dialog>
      <DialogTrigger asChild>{dialogTriggerChildren}</DialogTrigger>
      <DialogContent>
        <ContentComponent {...contentProps} open={open} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}

const Bar = (props: { foo: string }) => null

const foo = (
  <ClosableDialog dialogTriggerChildren={null} ContentComponent={Bar} contentProps={{ foo: '' }} />
)
