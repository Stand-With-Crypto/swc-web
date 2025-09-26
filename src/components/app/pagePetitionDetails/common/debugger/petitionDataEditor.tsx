'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

interface PetitionDataEditorProps {
  petition: SWCPetition
  onPetitionChange: (newPetition: SWCPetition) => void
  mockSignatures: number
  onMockSignaturesChange: (count: number) => void
  mockRecentSignatoriesCount: number
  onMockRecentSignatoriesCountChange: (count: number) => void
}

export const PetitionDataEditor = ({
  petition,
  onPetitionChange,
  mockSignatures,
  onMockSignaturesChange,
  mockRecentSignatoriesCount,
  onMockRecentSignatoriesCountChange,
}: PetitionDataEditorProps) => {
  const [localPetition, setLocalPetition] = useState<SWCPetition>(petition)
  const [localMockSignatures, setLocalMockSignatures] = useState(mockSignatures)
  const [localMockRecentSignatoriesCount, setLocalMockRecentSignatoriesCount] = useState(
    mockRecentSignatoriesCount,
  )

  const handleSave = () => {
    onPetitionChange(localPetition)
    onMockSignaturesChange(localMockSignatures)
    onMockRecentSignatoriesCountChange(localMockRecentSignatoriesCount)
  }

  const handleReset = () => {
    setLocalPetition(petition)
    setLocalMockSignatures(mockSignatures)
    setLocalMockRecentSignatoriesCount(mockRecentSignatoriesCount)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Petition Title */}
        <div className="space-y-2">
          <Label htmlFor="petition-title">Petition Title</Label>
          <Input
            id="petition-title"
            onChange={e =>
              setLocalPetition(prev => ({
                ...prev,
                title: e.target.value,
              }))
            }
            placeholder="Enter petition title"
            value={localPetition.title}
          />
        </div>

        {/* Petition Goal */}
        <div className="space-y-2">
          <Label htmlFor="petition-goal">Signatures Goal</Label>
          <Input
            id="petition-goal"
            min="1"
            onChange={e =>
              setLocalPetition(prev => ({
                ...prev,
                countSignaturesGoal: parseInt(e.target.value) || 0,
              }))
            }
            placeholder="Enter signatures goal"
            type="number"
            value={localPetition.countSignaturesGoal}
          />
        </div>

        {/* Mock Current Signatures */}
        <div className="space-y-2">
          <Label htmlFor="mock-signatures">Mock Current Signatures</Label>
          <Input
            id="mock-signatures"
            min="0"
            onChange={e => setLocalMockSignatures(parseInt(e.target.value) || 0)}
            placeholder="Enter current signatures count"
            type="number"
            value={localMockSignatures}
          />
          <p className="text-xs text-gray-500">
            Override the actual signatures count with this value in mock mode
          </p>
        </div>

        {/* Mock Recent Signatories Count */}
        <div className="space-y-2">
          <Label htmlFor="mock-recent-signatories">Mock Recent Signatories Count</Label>
          <Input
            id="mock-recent-signatories"
            min="0"
            onChange={e => setLocalMockRecentSignatoriesCount(parseInt(e.target.value) || 0)}
            placeholder="Enter recent signatories count"
            type="number"
            value={localMockRecentSignatoriesCount}
          />
          <p className="text-xs text-gray-500">
            Number of recent signatories to generate with mock cities/times
          </p>
        </div>

        {/* Petition Content */}
        <div className="space-y-2">
          <Label htmlFor="petition-content">Petition Content</Label>
          <Textarea
            className="min-h-[100px]"
            id="petition-content"
            onChange={e =>
              setLocalPetition(prev => ({
                ...prev,
                content: e.target.value,
              }))
            }
            placeholder="Enter petition content"
            value={localPetition.content}
          />
        </div>

        {/* Petition Image URL */}
        <div className="space-y-2">
          <Label htmlFor="petition-image">Petition Image URL</Label>
          <Input
            id="petition-image"
            onChange={e =>
              setLocalPetition(prev => ({
                ...prev,
                image: e.target.value || null,
              }))
            }
            placeholder="Enter image URL"
            type="url"
            value={localPetition.image || ''}
          />
        </div>

        {/* Datetime Finished */}
        <div className="space-y-2">
          <Label htmlFor="petition-finished">Petition Finished Date</Label>
          <Input
            id="petition-finished"
            onChange={e =>
              setLocalPetition(prev => ({
                ...prev,
                datetimeFinished: e.target.value || null,
              }))
            }
            placeholder="YYYY-MM-DD or leave empty"
            type="date"
            value={localPetition.datetimeFinished || ''}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Apply Changes
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
