'use client'

import { useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

interface PetitionsDataEditorProps {
  petitions: SWCPetition[]
  onPetitionsChange: (newPetitions: SWCPetition[]) => void
}

type PetitionState = 'idle' | 'closed'

interface PetitionMockData {
  goal: number
  signatures: number
  state: PetitionState
}

interface NewPetitionForm {
  title: string
  content: string
  slug: string
  countryCode: string
  goal: number
  signatures: number
  image?: string
}

export const PetitionsDataEditor = ({ petitions, onPetitionsChange }: PetitionsDataEditorProps) => {
  // Initialize local state for each petition
  const [localPetitionsData, setLocalPetitionsData] = useState<Record<string, PetitionMockData>>(
    () => {
      const initialData: Record<string, PetitionMockData> = {}
      petitions.forEach(petition => {
        initialData[petition.slug] = {
          goal: petition.countSignaturesGoal,
          signatures: petition.signaturesCount,
          state: petition.datetimeFinished ? 'closed' : 'idle', // Default state logic
        }
      })
      return initialData
    },
  )

  // State for new petition form
  const [showNewPetitionForm, setShowNewPetitionForm] = useState(false)
  const [newPetitionForm, setNewPetitionForm] = useState<NewPetitionForm>({
    title: '',
    content: '',
    slug: '',
    countryCode: 'US',
    goal: 1000,
    signatures: 0,
    image: '',
  })

  const handleSave = () => {
    const updatedPetitions = petitions.map(petition => {
      const mockData = localPetitionsData[petition.slug]
      if (!mockData) return petition

      return {
        ...petition,
        countSignaturesGoal: mockData.goal,
        signaturesCount: mockData.signatures,
        datetimeFinished: mockData.state === 'closed' ? new Date().toISOString() : null,
      } as SWCPetition
    })
    onPetitionsChange(updatedPetitions)
  }

  const handleReset = () => {
    const resetData: Record<string, PetitionMockData> = {}
    petitions.forEach(petition => {
      resetData[petition.slug] = {
        goal: petition.countSignaturesGoal,
        signatures: petition.signaturesCount,
        state: petition.datetimeFinished ? 'closed' : 'idle',
      }
    })
    setLocalPetitionsData(resetData)
  }

  const updatePetitionData = (slug: string, field: keyof PetitionMockData, value: any) => {
    setLocalPetitionsData(prev => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        [field]: value,
      },
    }))
  }

  const handleAddPetition = () => {
    if (!newPetitionForm.title || !newPetitionForm.content || !newPetitionForm.slug) {
      alert('Please fill in all required fields (title, content, slug)')
      return
    }

    // Check if slug already exists
    if (petitions.some(p => p.slug === newPetitionForm.slug)) {
      alert('A petition with this slug already exists')
      return
    }

    const newPetition: SWCPetition = {
      slug: newPetitionForm.slug,
      title: newPetitionForm.title,
      content: newPetitionForm.content,
      countryCode: newPetitionForm.countryCode,
      countSignaturesGoal: newPetitionForm.goal,
      signaturesCount: newPetitionForm.signatures,
      image: newPetitionForm.image || null,
      datetimeFinished: null,
      enableAutomaticMilestones: false,
      milestones: [],
    }

    const updatedPetitions = [...petitions, newPetition]
    onPetitionsChange(updatedPetitions)

    // Add to local data
    setLocalPetitionsData(prev => ({
      ...prev,
      [newPetition.slug]: {
        goal: newPetition.countSignaturesGoal,
        signatures: newPetition.signaturesCount,
        state: 'idle',
      },
    }))

    // Reset form
    setNewPetitionForm({
      title: '',
      content: '',
      slug: '',
      countryCode: 'US',
      goal: 1000,
      signatures: 0,
      image: '',
    })
    setShowNewPetitionForm(false)
  }

  const handleRemovePetition = (slug: string) => {
    const updatedPetitions = petitions.filter(p => p.slug !== slug)
    onPetitionsChange(updatedPetitions)

    // Remove from local data
    setLocalPetitionsData(prev => {
      const newData = { ...prev }
      delete newData[slug]
      return newData
    })
  }

  const updateNewPetitionForm = (field: keyof NewPetitionForm, value: string | number) => {
    setNewPetitionForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Add New Petition Button */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Petitions ({petitions.length})</h3>
          <Button
            onClick={() => setShowNewPetitionForm(!showNewPetitionForm)}
            size="sm"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Petition
          </Button>
        </div>

        {/* New Petition Form */}
        {showNewPetitionForm && (
          <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <h4 className="text-sm font-semibold text-green-900">Add New Petition</h4>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-title">Title *</Label>
                <Input
                  id="new-title"
                  onChange={e => updateNewPetitionForm('title', e.target.value)}
                  placeholder="Enter petition title"
                  value={newPetitionForm.title}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-slug">Slug *</Label>
                <Input
                  id="new-slug"
                  onChange={e => updateNewPetitionForm('slug', e.target.value)}
                  placeholder="Enter petition slug (URL-friendly)"
                  value={newPetitionForm.slug}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-content">Content *</Label>
                <Textarea
                  id="new-content"
                  onChange={e => updateNewPetitionForm('content', e.target.value)}
                  placeholder="Enter petition content/description"
                  rows={3}
                  value={newPetitionForm.content}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-goal">Signatures Goal</Label>
                  <Input
                    id="new-goal"
                    min="1"
                    onChange={e => updateNewPetitionForm('goal', parseInt(e.target.value) || 1000)}
                    type="number"
                    value={newPetitionForm.goal}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-signatures">Current Signatures</Label>
                  <Input
                    id="new-signatures"
                    min="0"
                    onChange={e =>
                      updateNewPetitionForm('signatures', parseInt(e.target.value) || 0)
                    }
                    type="number"
                    value={newPetitionForm.signatures}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-image">Image URL (optional)</Label>
                <Input
                  id="new-image"
                  onChange={e => updateNewPetitionForm('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  value={newPetitionForm.image}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleAddPetition} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Petition
              </Button>
              <Button onClick={() => setShowNewPetitionForm(false)} size="sm" variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Existing Petitions */}
        {petitions.map(petition => {
          const mockData = localPetitionsData[petition.slug]
          if (!mockData) return null

          return (
            <div className="space-y-4 rounded-lg border p-4" key={petition.slug}>
              <div className="flex items-start justify-between">
                <h3 className="line-clamp-2 flex-1 text-sm font-semibold text-gray-900">
                  {petition.title}
                </h3>
                <Button
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleRemovePetition(petition.slug)}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Signatures Goal */}
              <div className="space-y-2">
                <Label htmlFor={`goal-${petition.slug}`}>Signatures Goal</Label>
                <Input
                  id={`goal-${petition.slug}`}
                  min="1"
                  onChange={e =>
                    updatePetitionData(petition.slug, 'goal', parseInt(e.target.value) || 0)
                  }
                  placeholder="Enter signatures goal"
                  type="number"
                  value={mockData.goal}
                />
              </div>

              {/* Current Signatures */}
              <div className="space-y-2">
                <Label htmlFor={`signatures-${petition.slug}`}>Current Signatures</Label>
                <Input
                  id={`signatures-${petition.slug}`}
                  min="0"
                  onChange={e =>
                    updatePetitionData(petition.slug, 'signatures', parseInt(e.target.value) || 0)
                  }
                  placeholder="Enter current signatures"
                  type="number"
                  value={mockData.signatures}
                />
              </div>

              {/* Petition State */}
              <div className="space-y-2">
                <Label htmlFor={`state-${petition.slug}`}>Petition State</Label>
                <Select
                  onValueChange={(value: PetitionState) =>
                    updatePetitionData(petition.slug, 'state', value)
                  }
                  value={mockData.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idle">Idle (Active)</SelectItem>
                    <SelectItem value="closed">Closed (Finished)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )
        })}
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
