'use client'

import { useState } from 'react'
import { UserActionType } from '@prisma/client'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface UserActionsTableProps {
  userActions: SensitiveDataClientUserAction[]
  isLoading?: boolean
}

export function UserActionsTable({ userActions, isLoading }: UserActionsTableProps) {
  const [selectedAction, setSelectedAction] = useState<SensitiveDataClientUserAction | null>(null)
  const [sortField, setSortField] = useState<keyof SensitiveDataClientUserAction>('datetimeCreated')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: keyof SensitiveDataClientUserAction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedActions = [...userActions].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (sortField === 'datetimeCreated') {
      const dateA = new Date(aValue as string)
      const dateB = new Date(bValue as string)
      return sortDirection === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime()
    }

    const comparison = String(aValue).localeCompare(String(bValue))
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const renderActionSpecificData = (userAction: SensitiveDataClientUserAction) => {
    switch (userAction.actionType) {
      case UserActionType.EMAIL:
        if ('senderEmail' in userAction) {
          return (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Sender Email:</span> {userAction.senderEmail}
              </div>
              <div>
                <span className="font-semibold">First Name:</span> {userAction.firstName}
              </div>
              <div>
                <span className="font-semibold">Last Name:</span> {userAction.lastName}
              </div>
              <div>
                <span className="font-semibold">Recipients:</span>{' '}
                {userAction.userActionEmailRecipients.length}
              </div>
            </div>
          )
        }
        break
      case UserActionType.CALL:
        if ('recipientPhoneNumber' in userAction) {
          return (
            <div>
              <span className="font-semibold">Recipient Phone:</span>{' '}
              {userAction.recipientPhoneNumber}
            </div>
          )
        }
        break
      case UserActionType.DONATION:
        if ('amount' in userAction) {
          return (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Amount:</span> {userAction.amount}{' '}
                {userAction.amountCurrencyCode}
              </div>
              <div>
                <span className="font-semibold">Amount USD:</span> ${userAction.amountUsd}
              </div>
              <div>
                <span className="font-semibold">Recipient:</span> {userAction.recipient}
              </div>
            </div>
          )
        }
        break
      case UserActionType.POLL:
        if ('userActionPollAnswers' in userAction) {
          return (
            <div>
              <span className="font-semibold">Poll Answers:</span>
              <div className="mt-2 space-y-2">
                {userAction.userActionPollAnswers.map((answer, index) => (
                  <div key={index} className="rounded bg-gray-100 p-2 text-sm">
                    <div>
                      <span className="font-semibold">Answer:</span> {answer.answer}
                    </div>
                    <div>
                      <span className="font-semibold">Is Other:</span>{' '}
                      {answer.isOtherAnswer ? 'Yes' : 'No'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }
        break
      default:
        return <div className="text-gray-500">No specific data available for this action type.</div>
    }
    return <div className="text-gray-500">No specific data available for this action type.</div>
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full">
          <Skeleton className="h-full w-full" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('id')}
                  className="h-auto p-0 font-medium"
                >
                  ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('actionType')}
                  className="h-auto p-0 font-medium"
                >
                  Action Type {sortField === 'actionType' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('campaignName')}
                  className="h-auto p-0 font-medium"
                >
                  Campaign {sortField === 'campaignName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('countryCode')}
                  className="h-auto p-0 font-medium"
                >
                  Country {sortField === 'countryCode' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('datetimeCreated')}
                  className="h-auto p-0 font-medium"
                >
                  Created At{' '}
                  {sortField === 'datetimeCreated' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedActions.length ? (
              sortedActions.map(action => (
                <TableRow key={action.id}>
                  <TableCell>
                    <div className="font-mono text-sm">{action.id}</div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="h-auto p-0 font-normal text-primary underline"
                      onClick={() => setSelectedAction(action)}
                    >
                      {action.actionType}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate">{action.campaignName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm uppercase">{action.countryCode}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {new Date(action.datetimeCreated).toLocaleDateString()}{' '}
                      {new Date(action.datetimeCreated).toLocaleTimeString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No user actions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedAction}
        onOpenChange={(open: boolean) => !open && setSelectedAction(null)}
        analytics="User Action Details Dialog"
      >
        <DialogContent a11yTitle="User Action Details" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Action Details</DialogTitle>
          </DialogHeader>
          {selectedAction && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-semibold">ID:</span> {selectedAction.id}
                    </div>
                    <div>
                      <span className="font-semibold">Action Type:</span>{' '}
                      {selectedAction.actionType}
                    </div>
                    <div>
                      <span className="font-semibold">Campaign:</span> {selectedAction.campaignName}
                    </div>
                    <div>
                      <span className="font-semibold">Country:</span> {selectedAction.countryCode}
                    </div>
                    <div className="col-span-2">
                      <span className="font-semibold">Created:</span>{' '}
                      {new Date(selectedAction.datetimeCreated).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Action-Specific Data</h3>
                  {renderActionSpecificData(selectedAction)}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Raw Data</h3>
                  <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
                    {JSON.stringify(selectedAction, null, 2)}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
