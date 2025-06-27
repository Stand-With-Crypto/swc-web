'use client'

import { useState } from 'react'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { UserActionsDebugTableSkeleton } from '@/components/app/pageInternal/userActionsDebugTable/userActionsDebugTableSkeleton'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { ActionSpecificData } from './renderActionSpecificData'

interface UserActionsDebugTableProps {
  userActions: SensitiveDataClientUserAction[]
  isLoading?: boolean
}

export function UserActionsDebugTable({ userActions, isLoading }: UserActionsDebugTableProps) {
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

  if (isLoading) {
    return <UserActionsDebugTableSkeleton />
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort('id')}
                  variant="ghost"
                >
                  ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort('actionType')}
                  variant="ghost"
                >
                  Action Type {sortField === 'actionType' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort('campaignName')}
                  variant="ghost"
                >
                  Campaign {sortField === 'campaignName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort('countryCode')}
                  variant="ghost"
                >
                  Country {sortField === 'countryCode' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort('datetimeCreated')}
                  variant="ghost"
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
                      className="h-auto p-0 font-normal text-primary underline"
                      onClick={() => setSelectedAction(action)}
                      variant="link"
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
                <TableCell className="h-24 text-center" colSpan={5}>
                  No user actions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        analytics="User Action Details Dialog - Internal Page"
        onOpenChange={(open: boolean) => !open && setSelectedAction(null)}
        open={!!selectedAction}
      >
        <DialogContent a11yTitle="User Action Details - Internal Page" className="max-w-2xl">
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
                  <ActionSpecificData userAction={selectedAction} />
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
