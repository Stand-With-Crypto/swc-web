'use client'

import { useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PetitionMilestone, SWCPetition } from '@/utils/shared/zod/getSWCPetitions'
import { cn } from '@/utils/web/cn'

interface PetitionMilestonesEditorProps {
  petition: SWCPetition
  onPetitionChange: (newPetition: SWCPetition) => void
}

export const PetitionMilestonesEditor = ({
  petition,
  onPetitionChange,
}: PetitionMilestonesEditorProps) => {
  const [localPetition, setLocalPetition] = useState<SWCPetition>(petition)

  const handleSave = () => {
    onPetitionChange(localPetition)
  }

  const handleReset = () => {
    setLocalPetition(petition)
  }

  const handleToggleAutomaticMilestones = () => {
    setLocalPetition(prev => ({
      ...prev,
      enableAutomaticMilestones: !prev.enableAutomaticMilestones,
    }))
  }

  const handleAddMilestone = () => {
    const newMilestone: PetitionMilestone = {
      title: 'New Milestone',
      datetimeCompleted: new Date(),
    }

    setLocalPetition(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), newMilestone],
    }))
  }

  const handleUpdateMilestone = (index: number, updatedMilestone: PetitionMilestone) => {
    setLocalPetition(prev => ({
      ...prev,
      milestones: prev.milestones?.map((milestone, i) =>
        i === index ? updatedMilestone : milestone,
      ),
    }))
  }

  const handleDeleteMilestone = (index: number) => {
    setLocalPetition(prev => ({
      ...prev,
      milestones: prev.milestones?.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Automatic Milestones Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-milestones">Enable Automatic Milestones</Label>
              <p className="text-xs text-gray-500">
                Generate milestones at 10%, 25%, 50%, and 100% of goal
              </p>
            </div>
            <button
              aria-checked={localPetition.enableAutomaticMilestones}
              className={cn(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
                localPetition.enableAutomaticMilestones ? 'bg-blue-600' : 'bg-gray-200',
              )}
              id="auto-milestones"
              onClick={handleToggleAutomaticMilestones}
              role="switch"
              type="button"
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  localPetition.enableAutomaticMilestones ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>
        </div>

        {/* Manual Milestones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Manual Milestones</Label>
            <Button onClick={handleAddMilestone} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Milestone
            </Button>
          </div>

          {localPetition.milestones && localPetition.milestones.length > 0 ? (
            <div className="space-y-4">
              {localPetition.milestones.map((milestone, index) => (
                <MilestoneEditor
                  key={index}
                  milestone={milestone}
                  onDelete={() => handleDeleteMilestone(index)}
                  onUpdate={updatedMilestone => handleUpdateMilestone(index, updatedMilestone)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No manual milestones added yet.</p>
          )}
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

interface MilestoneEditorProps {
  milestone: PetitionMilestone
  onUpdate: (milestone: PetitionMilestone) => void
  onDelete: () => void
}

const MilestoneEditor = ({ milestone, onUpdate, onDelete }: MilestoneEditorProps) => {
  const [isFinished, setIsFinished] = useState(true)

  const handleTitleChange = (title: string) => {
    onUpdate({
      ...milestone,
      title,
    })
  }

  const handleDateChange = (dateString: string) => {
    onUpdate({
      ...milestone,
      datetimeCompleted: new Date(dateString),
    })
  }

  const handleToggleFinished = () => {
    const newIsFinished = !isFinished
    setIsFinished(newIsFinished)

    // If marking as unfinished, we could set a future date or keep current
    // For now, we'll just toggle the visual state
    // The actual completion logic would be handled elsewhere in the app
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex justify-between">
        <h4 className="text-sm font-medium">Milestone #{milestone.title}</h4>
        <Button onClick={onDelete} size="sm" variant="ghost">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor={`milestone-title-${milestone.title}`}>Title</Label>
          <Input
            id={`milestone-title-${milestone.title}`}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Milestone title"
            value={milestone.title}
          />
        </div>

        <div>
          <Label htmlFor={`milestone-date-${milestone.title}`}>Completion Date</Label>
          <Input
            id={`milestone-date-${milestone.title}`}
            onChange={e => handleDateChange(e.target.value)}
            type="datetime-local"
            value={milestone.datetimeCompleted.toISOString().slice(0, 16)}
          />
        </div>

        <div className="flex justify-between">
          <div>
            <Label htmlFor={`milestone-finished-${milestone.title}`}>Mark as Finished</Label>
            <p className="text-xs text-gray-500">Toggle completion status</p>
          </div>
          <button
            aria-checked={isFinished}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
              isFinished ? 'bg-green-600' : 'bg-gray-200',
            )}
            id={`milestone-finished-${milestone.title}`}
            onClick={handleToggleFinished}
            role="switch"
            type="button"
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                isFinished ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
