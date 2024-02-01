import { Input } from '@/components/ui/input'
import React, { useState, Fragment, useRef, useEffect } from 'react'

import styles from './otpInput.module.css'
import { cn } from '@/utils/web/cn'

type OtpInputProps = {
  length: number
  onChange: (otp: string) => void
  onEnter?: () => void
  disabled?: boolean
}

export function OTPInput({
  length,
  onChange,
  onEnter,
  disabled = false,
}: OtpInputProps): JSX.Element {
  const [value, setValue] = useState<string[]>(Array.from({ length }, () => ''))
  const [activeOtpIndex, setActiveOtpIndex] = useState<number>(0)
  const activeInputRef = useRef<HTMLInputElement>(null)
  const currentOtpIndexRef = useRef(0)

  const handleOnchange = ({ target }: React.ChangeEvent<HTMLInputElement>): void => {
    const newOtp: string[] = [...value]
    newOtp[currentOtpIndexRef.current] = target.value.substring(target.value.length - 1)

    if (!target.value) {
      setActiveOtpIndex(currentOtpIndexRef.current - 1)
    } else {
      setActiveOtpIndex(currentOtpIndexRef.current + 1)
    }

    onChange(newOtp.join(''))
    setValue(newOtp)
  }

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const { key } = event
    currentOtpIndexRef.current = index
    const isFirstDigit = index === 0
    const isLastDigit = index === length - 1

    if (key === 'Backspace' && !isFirstDigit) {
      setActiveOtpIndex(currentOtpIndexRef.current - 1)
    }

    if (key === 'ArrowLeft' && !isFirstDigit) {
      setActiveOtpIndex(currentOtpIndexRef.current - 1)
    }

    if (key === 'ArrowRight' && !isLastDigit) {
      setActiveOtpIndex(currentOtpIndexRef.current + 1)
    }

    // Suppressing changing the value with arrow keys
    // That causes a conflict with changing focus on type
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
    }

    if (key === 'Enter' && onEnter) {
      onEnter()
    }
  }

  useEffect(() => {
    activeInputRef.current?.focus()
  }, [activeOtpIndex])

  return (
    <div className="flex w-fit items-center space-x-4">
      {value.map((digit, index) => {
        return (
          <Fragment key={index}>
            <Input
              ref={index === activeOtpIndex ? activeInputRef : null}
              onChange={handleOnchange}
              onKeyDown={e => handleOnKeyDown(e, index)}
              onFocus={e => e.target.select()}
              className={cn('w-10 text-center', styles.numberInput)}
              type="number"
              value={digit}
              disabled={disabled}
            />
          </Fragment>
        )
      })}
    </div>
  )
}
