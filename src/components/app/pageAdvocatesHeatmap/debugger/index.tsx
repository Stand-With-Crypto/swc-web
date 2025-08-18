'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

import {
  AreaCoordinates,
  AreaCoordinatesKey,
} from '@/components/app/pageAdvocatesHeatmap/constants'
import { cn } from '@/utils/web/cn'

import { AreasSelector } from './areasSelector'
import { CoordinatesJsonEditor } from './coordinatesJsonEditor'

interface MapDebuggerProps {
  isOpen: boolean
  onClose: () => void
  coordinates: AreaCoordinates
  onSaveCoordinates: (newCoordinates: AreaCoordinates) => void
  selectedAreas: AreaCoordinatesKey[]
  onAreasChange: (areas: AreaCoordinatesKey[]) => void
  isMockMode: boolean
  onMockModeChange: (enabled: boolean) => void
  actionsLimit: number
  onActionsLimitChange: (limit: number) => void
}

type DebuggerTab = 'coordinates' | 'areas'

export const MapDebugger = ({
  isOpen,
  onClose,
  coordinates,
  onSaveCoordinates,
  selectedAreas,
  onAreasChange,
  isMockMode,
  onMockModeChange,
  actionsLimit,
  onActionsLimitChange,
}: MapDebuggerProps) => {
  const [activeTab, setActiveTab] = useState<DebuggerTab>('coordinates')

  if (!isOpen) return null

  const tabs = [
    { id: 'coordinates' as const, label: 'Coordinates' },
    { id: 'areas' as const, label: 'Display Areas' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Semi-transparent backdrop */}
      <div className="flex-1 bg-black bg-opacity-20" onClick={onClose} />

      {/* Side panel */}
      <div className="flex h-screen w-96 flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Map debugger</h2>
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

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map(tab => (
            <button
              className={cn(
                'flex-1 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700',
              )}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {activeTab === 'coordinates' && (
            <CoordinatesJsonEditor coordinates={coordinates} onSave={onSaveCoordinates} />
          )}
          {activeTab === 'areas' && (
            <AreasSelector
              actionsLimit={actionsLimit}
              onActionsLimitChange={onActionsLimitChange}
              onAreasChange={onAreasChange}
              selectedAreas={selectedAreas}
            />
          )}
        </div>
      </div>
    </div>
  )
}
