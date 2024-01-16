'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/utils/web/cn'
import { useResizeObserver } from '@/hooks/useResizeObserver'

export interface ComboBoxProps<T>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  inputValue: string
  onChangeInputValue: (val: string) => void
  options: T[]
  value: T | null
  onChange: (val: T | null) => void
  formatPopoverTrigger: (val: T | null) => React.ReactNode
  getOptionLabel: (val: T) => string
  getOptionKey: (val: T) => string
  popoverContentClassName?: string
  isLoading: boolean
  popoverFullWidth?: boolean
}

export function Combobox<T>({
  value,
  onChange,
  formatPopoverTrigger,
  options,
  getOptionLabel,
  getOptionKey,
  popoverContentClassName,
  isLoading,
  popoverFullWidth = true,
  ...inputProps
}: ComboBoxProps<T>) {
  const parentRef = React.useRef<HTMLButtonElement>(null)
  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile({ defaultState: false })
  const size = useResizeObserver(parentRef)

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{formatPopoverTrigger(value)}</DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 min-h-[260px] border-t">
            <StatusList
              setOpen={setOpen}
              {...{
                value,
                isLoading,
                onChange,
                options,
                getOptionLabel,
                getOptionKey,
                ...inputProps,
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger ref={parentRef} asChild>
        {formatPopoverTrigger(value)}
      </PopoverTrigger>
      <PopoverContent
        avoidCollisions={false}
        className={cn('p-0', popoverContentClassName)}
        align="start"
        style={{ width: size.width }}
      >
        <StatusList
          setOpen={setOpen}
          {...{ value, isLoading, onChange, options, getOptionLabel, getOptionKey, ...inputProps }}
        />
      </PopoverContent>
    </Popover>
  )
}

function StatusList<T>({
  setOpen,
  onChange,
  options,
  getOptionLabel,
  getOptionKey,
  value,
  inputValue,
  onChangeInputValue,
  isLoading,
  ...inputProps
}: {
  setOpen: (open: boolean) => void
} & Pick<
  ComboBoxProps<T>,
  | 'inputValue'
  | 'onChangeInputValue'
  | 'options'
  | 'value'
  | 'onChange'
  | 'getOptionLabel'
  | 'getOptionKey'
  | 'isLoading'
>) {
  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Filter status..."
        onValueChange={onChangeInputValue}
        value={inputValue}
        {...inputProps}
      />
      <CommandList>
        {!options.length && (
          <p className={cn('py-6 text-center text-sm', isLoading && 'invisible')}>
            {inputValue ? 'No results found.' : 'Enter address to see results'}
          </p>
        )}
        <CommandGroup>
          {options.map(option => {
            const key = getOptionKey(option)
            const isSelected = value && getOptionKey(value) === key
            return (
              <CommandItem
                className={cn(isSelected && 'border border-blue-500')}
                key={key}
                value={key}
                onSelect={() => {
                  onChange(options.find(x => getOptionKey(x) === key) || null)
                  setOpen(false)
                }}
              >
                {getOptionLabel(option)}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
