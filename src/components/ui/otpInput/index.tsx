'use client'

import React from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/utils/web/cn'

interface OTPInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'ref' | 'value' | 'onFocus' | 'onBlur' | 'onPaste' | 'autoComplete' | 'maxLength' | 'onChange'
  > {
  value?: string
  onChange?: (otp: string) => void
  numInputs?: number
}

export function OTPInput({
  value = '',
  numInputs = 6,
  onChange,
  type = 'text',
  placeholder = '_',
  pattern = '[0-9]',
  autoFocus = true,
  className,
  id,
  name,
  onKeyDown,
  ...rest
}: OTPInputProps) {
  const [otpValue, setOTPValue] = React.useState(value)
  const [activeInput, setActiveInput] = React.useState(0)
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([])

  const otpValueArray = React.useMemo(
    () => (otpValue ? otpValue.toString().split('') : []),
    [otpValue],
  )

  const isInputNum = React.useMemo(() => type === 'number' || type === 'tel', [type])

  React.useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, numInputs)
  }, [numInputs])

  React.useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus])

  const isInputValueValid = React.useCallback(
    (inputValue: string) => {
      const isTypeValid = isInputNum ? !isNaN(Number(inputValue)) : typeof inputValue === 'string'
      return isTypeValid && inputValue.trim().length === 1
    },
    [isInputNum],
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value: newValue } = event.target

    if (isInputValueValid(newValue)) {
      changeCodeAtFocus(newValue)
      focusInput(activeInput + 1)
    }
  }

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => (index: number) => {
    setActiveInput(index)
    event.target.select()
  }

  const handleBlur = () => {
    setActiveInput(activeInput - 1)
  }

  const focusInput = React.useCallback(
    (index: number) => {
      const currentActiveInput = Math.max(Math.min(numInputs - 1, index), 0)

      if (inputRefs.current[currentActiveInput]) {
        inputRefs.current[currentActiveInput]?.focus()
        inputRefs.current[currentActiveInput]?.select()
        setActiveInput(currentActiveInput)
      }
    },
    [numInputs],
  )

  const handleOTPChange = React.useCallback(
    (otp: Array<string>) => {
      const newOtpValue = otp.join('')
      setOTPValue(newOtpValue)
      onChange?.(newOtpValue)
    },
    [onChange],
  )

  const changeCodeAtFocus = React.useCallback(
    (newValue: string) => {
      const otp = [...otpValueArray]
      otp[activeInput] = newValue[0]
      handleOTPChange(otp)
    },
    [activeInput, handleOTPChange, otpValueArray],
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)

      if ([event.code, event.key].includes('Backspace')) {
        event.preventDefault()
        changeCodeAtFocus('')
        focusInput(activeInput - 1)
      } else if (event.code === 'Delete') {
        event.preventDefault()
        changeCodeAtFocus('')
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault()
        focusInput(activeInput - 1)
      } else if (event.code === 'ArrowRight') {
        event.preventDefault()
        focusInput(activeInput + 1)
      }

      // React does not trigger onChange when the same value is entered
      // again. So we need to focus the next input manually in this case.
      else if (event.key === otpValueArray[activeInput]) {
        event.preventDefault()
        focusInput(activeInput + 1)
      } else if (
        event.code === 'Spacebar' ||
        event.code === 'Space' ||
        event.code === 'ArrowUp' ||
        event.code === 'ArrowDown'
      ) {
        event.preventDefault()
      } else if (isInputNum && !isInputValueValid(event.key)) {
        event.preventDefault()
      }
    },
    [
      activeInput,
      changeCodeAtFocus,
      focusInput,
      isInputNum,
      isInputValueValid,
      onKeyDown,
      otpValueArray,
    ],
  )

  const handlePaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault()

      const otp = [...otpValueArray]
      let nextActiveInput = activeInput

      // Get pastedData in an array of max size (num of inputs - current position)
      const pastedData = event.clipboardData
        .getData('text/plain')
        .slice(0, numInputs - activeInput)
        .split('')

      // Prevent pasting if the clipboard data contains non-numeric values for number inputs
      if (isInputNum && pastedData.some(v => isNaN(Number(v)))) {
        return
      }

      // Paste data from focused input onwards
      for (let pos = 0; pos < numInputs; ++pos) {
        if (pos >= activeInput && pastedData.length > 0) {
          otp[pos] = pastedData.shift() ?? ''
          nextActiveInput++
        }
      }

      focusInput(nextActiveInput)
      handleOTPChange(otp)
    },
    [activeInput, focusInput, handleOTPChange, isInputNum, numInputs, otpValueArray],
  )

  return (
    <div className="flex gap-2">
      {Array.from({ length: numInputs }, (_, index) => index).map(i => (
        <Input
          autoComplete="off"
          className={cn('text-center font-bold', className)}
          id={`${id ?? ''}-${i}`}
          key={i}
          maxLength={1}
          name={`${name ?? ''}-${i}`}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={event => handleFocus(event)(i)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          pattern={pattern}
          placeholder={placeholder}
          ref={element => (inputRefs.current[i] = element)}
          size={1}
          value={otpValueArray[i] ?? ''}
          {...rest}
        />
      ))}
      <input id={id} name={name} type="hidden" value={otpValue} />
    </div>
  )
}
