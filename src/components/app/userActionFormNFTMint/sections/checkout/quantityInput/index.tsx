import { Minus, Plus } from 'lucide-react'
import React from 'react'

import styles from './quantityInput.module.css'
import { Button, ButtonProps } from '@/components/ui/button'

interface QuantityInputProps {
  value: number
  onChange: (value: number) => void
  onIncrement: () => void
  onDecrement: () => void
}

export function QuantityInput({ value, onChange, onIncrement, onDecrement }: QuantityInputProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value)
    if (newValue > 0 && newValue <= 1000) {
      onChange(newValue)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <ControlButton disabled={value <= 1} onClick={onDecrement}>
        <Minus className="h-4 w-4" />
      </ControlButton>

      <div>
        <input
          className={styles.numberInput}
          onChange={handleInputChange}
          onFocus={event => event.target.select()}
          type="number"
          value={value}
        />
      </div>

      <ControlButton disabled={value > 1000} onClick={onIncrement}>
        <Plus className="h-4 w-4" />
      </ControlButton>
    </div>
  )
}

function ControlButton(props: ButtonProps) {
  return (
    <Button
      className="h-8 w-8 bg-white p-0 hover:bg-white/80"
      size="sm"
      variant="secondary"
      {...props}
    />
  )
}
