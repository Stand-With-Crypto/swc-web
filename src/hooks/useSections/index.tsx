import React from 'react'
import * as Sentry from '@sentry/nextjs'

import { trackSectionVisible } from '@/utils/web/clientAnalytics'

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
  const [history, setHistory] = React.useState<SectionKey[]>([currentSection])

  const goToSection: UseSectionsReturn<SectionKey>['goToSection'] = React.useCallback(
    (section, options = {}) => {
      if (section === currentSection) {
        return
      }

      setCurrentSection(section)
      setHistory(prev => [section, ...prev])

      if (!options.disableAnalytics) {
        trackSectionVisible({ section, sectionGroup: analyticsName })
      }
    },
    [currentSection, analyticsName],
  )

  const goBackSection: UseSectionsReturn<SectionKey>['goBackSection'] = React.useCallback(() => {
    if (!history.length) {
      return
    }
    const newHistory = history.slice(1)

    const initialSection = initialSectionId ?? sections[0]

    setCurrentSection(newHistory[0] ?? initialSection)
    setHistory(newHistory)
  }, [history, initialSectionId, sections])

  const handleSectionNotFound = React.useCallback(() => {
    const err = new Error(`useSections: section not found: ${currentSection}`)
    Sentry.captureException(err)
    throw err
  }, [currentSection])

  return {
    currentSection,
    goToSection,
    onSectionNotFound: handleSectionNotFound,
    goBackSection,
  }
}

export * from './useSections.types'
