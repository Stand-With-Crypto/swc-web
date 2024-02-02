'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/utils/web/cn'
import * as React from 'react'

interface OTPInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    | 'ref'
    | 'value'
    | 'onFocus'
    | 'onBlur'
    | 'onKeyDown'
    | 'onPaste'
    | 'autoComplete'
    | 'maxLength'
    | 'onChange'
  > {
  value?: string
  onChange?: (otp: string) => void
  numInputs?: number
  onEnter?: () => void
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
  onEnter,
  ...rest
}: OTPInputProps) {
  const [otpValue, setOTPValue] = React.useState(value)
  const [activeInput, setActiveInput] = React.useState(0)
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([])

  const getOTPValue = () => (otpValue ? otpValue.toString().split('') : [])

  const isInputNum = type === 'number' || type === 'tel'

  React.useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, numInputs)
  }, [numInputs])

  React.useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus])

  const isInputValueValid = (inputValue: string) => {
    const isTypeValid = isInputNum ? !isNaN(Number(inputValue)) : typeof inputValue === 'string'
    return isTypeValid && inputValue.trim().length === 1
  }

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const otp = getOTPValue()
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
    } else if (event.code === 'Enter' && onEnter) {
      event.preventDefault()
      onEnter()
    }

    // React does not trigger onChange when the same value is entered
    // again. So we need to focus the next input manually in this case.
    else if (event.key === otp[activeInput]) {
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
  }

  const focusInput = (index: number) => {
    const currentActiveInput = Math.max(Math.min(numInputs - 1, index), 0)

    if (inputRefs.current[currentActiveInput]) {
      inputRefs.current[currentActiveInput]?.focus()
      inputRefs.current[currentActiveInput]?.select()
      setActiveInput(currentActiveInput)
    }
  }

  const changeCodeAtFocus = (newValue: string) => {
    const otp = getOTPValue()
    otp[activeInput] = newValue[0]
    handleOTPChange(otp)
  }

  const handleOTPChange = (otp: Array<string>) => {
    const newOtpValue = otp.join('')
    setOTPValue(newOtpValue)
    onChange?.(newOtpValue)
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()

    const otp = getOTPValue()
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
  }

  return (
    <div className="flex gap-2">
      {Array.from({ length: numInputs }, (_, index) => index).map(i => (
        <Input
          key={i}
          id={`${id ?? ''}-${i}`}
          name={`${name ?? ''}-${i}`}
          value={getOTPValue()[i] ?? ''}
          placeholder={placeholder}
          ref={element => (inputRefs.current[i] = element)}
          onChange={handleChange}
          onFocus={event => handleFocus(event)(i)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          autoComplete="off"
          maxLength={1}
          size={1}
          className={cn('text-center font-bold', className)}
          pattern={pattern}
          {...rest}
        />
      ))}
      <input type="hidden" id={id} name={name} value={otpValue} />
    </div>
  )
}
