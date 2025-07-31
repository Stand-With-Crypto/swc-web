'use client'

import { useState } from 'react'

import { AreaCoordinates } from '@/components/app/pageAdvocatesHeatmap/constants'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/web/cn'

interface CoordinatesJsonEditorProps {
  coordinates: AreaCoordinates
  onSave: (newCoordinates: AreaCoordinates) => void
}

export const CoordinatesJsonEditor = ({ coordinates, onSave }: CoordinatesJsonEditorProps) => {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(coordinates, null, 2))
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleApplyPreview = () => {
    try {
      const parsed = JSON.parse(jsonText)
      setError(null)
      onSave(parsed as AreaCoordinates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format')
    }
  }

  const handleReset = () => {
    setJsonText(JSON.stringify(coordinates, null, 2))
    setError(null)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  return (
    <>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 text-sm text-gray-600">
          Edit coordinates in real-time. Format: {`{"AREA": [lng, lat]}`}
        </div>

        <textarea
          className={cn(
            'w-full flex-1 resize-none rounded border p-3 font-mono text-xs',
            error ? 'border-red-500' : 'border-gray-300',
          )}
          onChange={e => {
            setJsonText(e.target.value)
            setError(null)
          }}
          placeholder="Enter coordinates JSON..."
          value={jsonText}
        />

        {error && <div className="mt-2 text-sm text-red-600">Error: {error}</div>}
      </div>

      <div className="flex flex-col gap-2 border-t p-4">
        <div className="rounded border border-blue-200 bg-blue-50 p-2">
          <div className="flex items-center gap-2">
            <svg
              className="h-3 w-3 flex-shrink-0 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                clipRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                fillRule="evenodd"
              />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-blue-800">
                <span className="font-medium">Testing mode:</span> Changes won't persist. Edit{' '}
                <code className="rounded bg-blue-100 px-1 font-mono">constants.ts</code> for
                permanent changes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleReset} variant="outline">
            Reset
          </Button>
          <Button className="flex-1" onClick={handleCopy} variant="outline">
            {copySuccess ? 'Copied!' : 'Copy'}
          </Button>
          <Button className="flex-1" onClick={handleApplyPreview} variant="default">
            Apply Preview
          </Button>
        </div>
      </div>
    </>
  )
}
