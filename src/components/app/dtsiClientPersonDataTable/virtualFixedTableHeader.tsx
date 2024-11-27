import { forwardRef } from 'react'
import { flexRender, Table as TableType } from '@tanstack/react-table'
import { motion } from 'framer-motion'

import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/utils/web/cn'

interface FixedTableHeaderProps<TData> {
  shouldShowFixedHeader: boolean
  table: TableType<TData>
  className?: string
  style?: React.CSSProperties
}

export const VirtualFixedTableHeader = forwardRef<HTMLDivElement, FixedTableHeaderProps<any>>(
  ({ shouldShowFixedHeader, table, className, style }, ref) => {
    return (
      <motion.div
        animate={
          shouldShowFixedHeader
            ? { height: 'auto', opacity: 1, y: 0, zIndex: 20 }
            : { height: 0, opacity: 0, y: -50, zIndex: 0 }
        }
        className="overflow-hidden"
        initial={{ height: 0, opacity: 0, y: -50, zIndex: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <Table
          className={cn(
            'z-20 w-full caption-bottom border-t pt-2 text-sm lg:table-fixed',
            className,
          )}
          refTableContainer={ref}
          style={style}
        >
          <TableHeader className={cn('w-full bg-secondary text-gray-400')}>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
      </motion.div>
    )
  },
)
VirtualFixedTableHeader.displayName = 'VirtualFixedTableHeader'
