'use client'

import * as React from 'react'

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useIsMobile } from '@/hooks/useIsMobile'
import { usePreventMobileKeyboardOffset } from '@/hooks/usePreventMobileKeyboardOffset'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { cn } from '@/utils/web/cn'
import {
  PrimitiveComponentAnalytics,
  trackPrimitiveComponentAnalytics,
} from '@/utils/web/primitiveComponentAnalytics'

export interface ComboBoxProps<T>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>,
    PrimitiveComponentAnalytics<boolean> {
  inputValue: string
  onChangeInputValue: (val: string) => void
  options: T[]
  value: T | null
  onChange: (val: T | null) => void
  formatPopoverTrigger: (args: { value: T | null; open: boolean }) => React.ReactNode
  getOptionLabel: (val: T) => string
  getOptionKey: (val: T) => string
  popoverContentClassName?: string
  isLoading: boolean
  open: boolean
  setOpen: (open: boolean) => void
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
  analytics,
  open,
  setOpen,
  ...inputProps
}: ComboBoxProps<T>) {
  usePreventMobileKeyboardOffset(open)
  const parentRef = React.useRef<HTMLButtonElement>(null)
  const isMobile = useIsMobile({ defaultState: false })
  const size = useResizeObserver(parentRef)
  const wrappedAnalytics = React.useCallback(
    (newOpen: boolean) =>
      trackPrimitiveComponentAnalytics(
        ({ properties }) => {
          trackClientAnalytic(`Combobox ${newOpen ? 'Opened' : 'Closed'}`, {
            ...properties,
          })
        },
        { args: newOpen, analytics },
      ),
    [analytics],
  )

  if (isMobile) {
    return (
      <Dialog analytics={wrappedAnalytics} onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>{formatPopoverTrigger({ value, open })}</DialogTrigger>
        <DialogContent className="min-h-[260px] p-0 pt-10" forceAutoFocus>
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
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Popover analytics={wrappedAnalytics} onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild ref={parentRef}>
        {formatPopoverTrigger({ value, open })}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        avoidCollisions={false}
        className={cn('p-0', popoverContentClassName)}
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
        autoFocus
        commandValue={value}
        containerClassName="border-t"
        onClear={() => {
          onChange(null)
          onChangeInputValue('')
        }}
        onValueChange={onChangeInputValue}
        placeholder="Filter status..."
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
                className={cn(isSelected && 'border border-purple-500')}
                key={key}
                onSelect={() => {
                  onChange(options.find(x => getOptionKey(x) === key) || null)
                  setOpen(false)
                }}
                value={key}
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
