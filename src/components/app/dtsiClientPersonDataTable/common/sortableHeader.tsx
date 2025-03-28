import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Column } from '@tanstack/react-table'
import { ReactNode } from 'react'
import { Person } from '@/components/app/dtsiClientPersonDataTable/common/columns'

export const SortableHeader = <TData extends Person = Person>({
  column,
  children,
}: {
  column: Column<TData>
  children: ReactNode
}) => {
  const sortVal = column.getIsSorted()

  return (
    <Button
      className="p-0"
      onClick={() =>
        !sortVal || sortVal === 'desc'
          ? column.toggleSorting(sortVal !== 'desc')
          : column.clearSorting()
      }
      variant="ghost"
    >
      {children}
      {!sortVal ? (
        <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />
      ) : sortVal === 'asc' ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUp className="ml-2 h-4 w-4" />
      )}
    </Button>
  )
}
