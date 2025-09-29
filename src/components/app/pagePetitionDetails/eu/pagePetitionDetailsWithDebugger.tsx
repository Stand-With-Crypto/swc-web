'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'

import { PetitionDebugger } from '@/components/app/pagePetitionDetails/common/debugger'
import { useMockedPetitionData } from '@/components/app/pagePetitionDetails/common/debugger/useMockedPetitionData'
import { EuPagePetitionDetailsContent } from '@/components/app/pagePetitionDetails/eu/content'
import { Button } from '@/components/ui/button'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

interface PagePetitionDetailsWithDebuggerProps {
  petition: SWCPetition
  countryCode: SupportedCountryCodes
  recentSignatures: Array<{
    locale: string
    datetimeSigned: string
  }>
  language: SupportedLanguages
}

const isProd = NEXT_PUBLIC_ENVIRONMENT === 'production'

export function EuPagePetitionDetailsWithDebugger({
  petition,
  countryCode,
  recentSignatures,
  language,
}: PagePetitionDetailsWithDebuggerProps) {
  // Debugger state
  const [mockedPetition, setMockedPetition] = useState<SWCPetition>(petition)
  const [mockSignatures, setMockSignatures] = useState(petition.signaturesCount)
  const [mockRecentSignatoriesCount, setMockRecentSignatoriesCount] = useState(
    recentSignatures.length,
  )
  const [isMockMode, setIsMockMode] = useState(false)
  const [isDebuggerOpen, setIsDebuggerOpen] = useState(false)

  // Generate mock recent signatories
  const mockRecentSignatories = useMockedPetitionData({
    countryCode,
    mockRecentSignatoriesCount,
  })

  // Use mocked data when in mock mode, otherwise use real data
  const currentPetition = isMockMode
    ? { ...mockedPetition, signaturesCount: mockSignatures }
    : petition
  const currentRecentSignatures = isMockMode ? mockRecentSignatories : recentSignatures

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
      <EuPagePetitionDetailsContent
        countryCode={countryCode}
        language={language}
        petition={currentPetition}
        recentSignatures={currentRecentSignatures}
      />

      {/* Petition Debugger */}
      {!isProd && (
        <PetitionDebugger
          isMockMode={isMockMode}
          isOpen={isDebuggerOpen}
          mockRecentSignatoriesCount={mockRecentSignatoriesCount}
          mockSignatures={mockSignatures}
          onClose={() => setIsDebuggerOpen(false)}
          onMockModeChange={setIsMockMode}
          onMockRecentSignatoriesCountChange={setMockRecentSignatoriesCount}
          onMockSignaturesChange={setMockSignatures}
          onPetitionChange={setMockedPetition}
          petition={mockedPetition}
        />
      )}
    </>
  )
}
