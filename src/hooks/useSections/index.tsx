import React from 'react'
import * as Sentry from '@sentry/nextjs'

import { UseSectionsProps, UseSectionsReturn } from './useSections.types'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'

export function useSections<SectionKey extends string>({
  sections,
  initialSectionId,
  analyticsName,
}: UseSectionsProps<SectionKey>): UseSectionsReturn<SectionKey> {
  if (!sections.length) {
    const err = new Error('useSections: sections must not be empty')
    Sentry.captureException(err)
    throw err
  }

  const [currentSection, setCurrentSection] = React.useState<SectionKey>(
    initialSectionId ?? sections[0],
  )

  const goToSection = React.useCallback(
    (section: SectionKey) => {
      setCurrentSection(section)
      trackClientAnalytic(`New Section Visible`, {
        Section: section,
        'Section Group': analyticsName,
      })
    },
    [setCurrentSection, analyticsName],
  )

  const handleSectionNotFound = React.useCallback(() => {
    const err = new Error(`useSections: section not found: ${currentSection}`)
    Sentry.captureException(err)
    throw err
  }, [currentSection])

  return React.useMemo<UseSectionsReturn<SectionKey>>(
    () => ({
      currentSection,
      goToSection,
      onSectionNotFound: handleSectionNotFound,
    }),
    [currentSection, goToSection, handleSectionNotFound],
  )
}

export * from './useSections.types'
