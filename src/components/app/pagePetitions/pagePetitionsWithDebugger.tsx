'use client'

import { useState } from 'react'
import { partition } from 'lodash-es'
import { Settings } from 'lucide-react'

import { PetitionsDebugger } from '@/components/app/pagePetitions/debugger'
import { PetitionsContent } from '@/components/app/pagePetitions/petitionsContent'
import { Button } from '@/components/ui/button'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

interface PagePetitionsWithDebuggerProps {
  title: string
  description: string
  petitions: SWCPetition[]
  countryCode: SupportedCountryCodes
}

const isProd = NEXT_PUBLIC_ENVIRONMENT === 'production'

export function PagePetitionsWithDebugger({
  title,
  description,
  petitions,
  countryCode,
}: PagePetitionsWithDebuggerProps) {
  // Debugger state
  const [mockedPetitions, setMockedPetitions] = useState<SWCPetition[]>(
    petitions.map(p => ({ ...p })),
  )
  const [isMockMode, setIsMockMode] = useState(false)
  const [isDebuggerOpen, setIsDebuggerOpen] = useState(false)

  // Use mocked petitions when in mock mode, otherwise use original petitions
  const currentPetitions = isMockMode ? mockedPetitions : petitions.map(p => ({ ...p }))

  // Get locale
  const locale = COUNTRY_CODE_TO_LOCALE[countryCode]

  // Partition petitions into current and past
  const [currentPetitionsList, pastPetitionsList] = partition(currentPetitions, petition => {
    return !petition.datetimeFinished
  })

  return (
    <>
      {/* Debugger Button */}
      {!isProd && (
        <Button
          className="fixed right-6 top-28 z-20 bg-yellow-500 text-black hover:bg-yellow-600 lg:right-8"
          onClick={() => setIsDebuggerOpen(true)}
          size="sm"
          variant="default"
        >
          <Settings className="mr-2 h-4 w-4" />
          Debugger
        </Button>
      )}

      {/* Main Content */}
      <PetitionsContent
        countryCode={countryCode}
        currentPetitions={currentPetitionsList}
        description={description}
        locale={locale}
        pastPetitions={pastPetitionsList}
        title={title}
      />

      {/* Petitions Debugger */}
      {!isProd && (
        <PetitionsDebugger
          isMockMode={isMockMode}
          isOpen={isDebuggerOpen}
          onClose={() => setIsDebuggerOpen(false)}
          onMockModeChange={setIsMockMode}
          onPetitionsChange={setMockedPetitions}
          petitions={mockedPetitions}
        />
      )}
    </>
  )
}
