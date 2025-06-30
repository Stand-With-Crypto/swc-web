'use client'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

import { ActionSpecificData } from './ActionSpecificData'

interface UserActionDetailsDialogProps {
  userAction: SensitiveDataClientUserAction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserActionDetailsDialog({
  userAction,
  open,
  onOpenChange,
}: UserActionDetailsDialogProps) {
  if (!userAction) return null

  const createdAt = new Date(userAction.datetimeCreated)

  return (
    <Dialog analytics="User Action Details Dialog" onOpenChange={onOpenChange} open={open}>
      <DialogContent a11yTitle="User Action Details" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Action Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">ID:</span> {userAction.id}
                </div>
                <div>
                  <span className="font-semibold">Action Type:</span> {userAction.actionType}
                </div>
                <div>
                  <span className="font-semibold">Campaign:</span> {userAction.campaignName}
                </div>
                <div>
                  <span className="font-semibold">Country:</span> {userAction.countryCode}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Created:</span> {createdAt.toLocaleString()}
                </div>
              </div>
            </div>

            {userAction.nftMint && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">NFT Mint</h3>
                <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
                  {JSON.stringify(userAction.nftMint, null, 2)}
                </pre>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Action-Specific Data</h3>
              <ActionSpecificData userAction={userAction} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Raw Data</h3>
              <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
                {JSON.stringify(userAction, null, 2)}
              </pre>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
