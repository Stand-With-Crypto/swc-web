'use client'

import {
  AREA_COORDS_BY_COUNTRY_CODE,
  AreaCoordinatesKey,
} from '@/components/app/pageAdvocatesHeatmap/constants'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useCountryCode } from '@/hooks/useCountryCode'

interface AreasSelectorProps {
  selectedAreas: AreaCoordinatesKey[]
  onAreasChange: (areas: AreaCoordinatesKey[]) => void
  actionsLimit: number
  onActionsLimitChange: (limit: number) => void
}

export const AreasSelector = ({
  selectedAreas,
  onAreasChange,
  actionsLimit,
  onActionsLimitChange,
}: AreasSelectorProps) => {
  const countryCode = useCountryCode()

  const allAreas = Object.keys(
    AREA_COORDS_BY_COUNTRY_CODE[countryCode] ?? {},
  ) as AreaCoordinatesKey[]

  const handleAreaToggle = (area: AreaCoordinatesKey, checked: boolean) => {
    if (checked) {
      onAreasChange([...selectedAreas, area])
    } else {
      onAreasChange(selectedAreas.filter(a => a !== area))
    }
  }

  const handleSelectAll = () => {
    onAreasChange(allAreas)
  }

  const handleDeselectAll = () => {
    onAreasChange([])
  }

  const handleActionsLimitChange = (value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0) {
      onActionsLimitChange(numValue)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Display Areas</h3>
        <div className="flex gap-2">
          <Button
            disabled={selectedAreas.length === allAreas.length}
            onClick={handleSelectAll}
            size="sm"
            variant="outline"
          >
            Select All
          </Button>
          <Button
            disabled={selectedAreas.length === 0}
            onClick={handleDeselectAll}
            size="sm"
            variant="outline"
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="whitespace-nowrap text-sm font-medium" htmlFor="actions-limit">
            Actions Limit:
          </label>
          <Input
            className="h-8 w-24"
            id="actions-limit"
            min="0"
            onChange={e => handleActionsLimitChange(e.target.value)}
            placeholder="0"
            type="number"
            value={actionsLimit}
          />
        </div>

        <div className="text-xs text-gray-600">
          Choose which areas should display action markers ({selectedAreas.length}/{allAreas.length}{' '}
          selected)
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-2">
          {allAreas.map(area => (
            <div className="flex items-center space-x-2" key={area}>
              <Checkbox
                checked={selectedAreas.includes(area)}
                id={`area-${area}`}
                onCheckedChange={checked => handleAreaToggle(area, checked as boolean)}
              />
              <label
                className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor={`area-${area}`}
              >
                {area}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
