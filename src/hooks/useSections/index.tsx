import React from 'react'
import * as Sentry from '@sentry/nextjs'

import { trackClientAnalytic } from '@/utils/web/clientAnalytics'

import { UseSectionsProps, UseSectionsReturn } from './useSections.types'

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

  const goToSection: UseSectionsReturn<SectionKey>['goToSection'] = React.useCallback(
    (section, options = {}) => {
      if (section === currentSection) {
        return
      }

      setCurrentSection(section)

      if (!options.disableAnalytics) {
        trackClientAnalytic(`New Section Visible`, {
          Section: section,
          'Section Group': analyticsName,
        })
      }
    },
    [currentSection, analyticsName],
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
