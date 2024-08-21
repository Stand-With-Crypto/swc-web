import React from 'react'
import { Minus, Plus } from 'lucide-react'

import { Button, ButtonProps } from '@/components/ui/button'

import styles from './quantityInput.module.css'

interface QuantityInputProps {
  value: number
  onChange: (value: number) => void
  onIncrement: () => void
  onDecrement: () => void
}

// TODO UI to show the user what is the max quantity
const MAX_QUANTITY = 36

export function QuantityInput({ value, onChange, onIncrement, onDecrement }: QuantityInputProps) {
  const handleInputChange = ({
    target: { value: _value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (_value.includes('.') || _value.includes(',')) return

    const newValue = Number(_value)
    if (newValue > 0 && newValue < MAX_QUANTITY) {
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

      <ControlButton disabled={value >= MAX_QUANTITY} onClick={onIncrement}>
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
