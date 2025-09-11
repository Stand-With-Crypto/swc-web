'use client'

import { X } from 'lucide-react'

import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'
import { cn } from '@/utils/web/cn'

import { PetitionsDataEditor } from './petitionsDataEditor'

interface PetitionsDebuggerProps {
  isOpen: boolean
  onClose: () => void
  petitions: SWCPetition[]
  onPetitionsChange: (newPetitions: SWCPetition[]) => void
  isMockMode: boolean
  onMockModeChange: (enabled: boolean) => void
}

export const PetitionsDebugger = ({
  isOpen,
  onClose,
  petitions,
  onPetitionsChange,
  isMockMode,
  onMockModeChange,
}: PetitionsDebuggerProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Semi-transparent backdrop */}
      <div className="flex-1 bg-black bg-opacity-20" onClick={onClose} />

      {/* Side panel */}
      <div className="flex h-screen w-96 flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Petitions debugger</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Mock Mode Toggle */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900" htmlFor="mock-toggle">
                Mock Mode
              </label>
              <p className="text-xs text-gray-500">Show simulated test data</p>
            </div>
            <button
              aria-checked={isMockMode}
              className={cn(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
                isMockMode ? 'bg-blue-600' : 'bg-gray-200',
              )}
              id="mock-toggle"
              onClick={() => onMockModeChange(!isMockMode)}
              role="switch"
              type="button"
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  isMockMode ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <PetitionsDataEditor onPetitionsChange={onPetitionsChange} petitions={petitions} />
        </div>
      </div>
    </div>
  )
}
