import React from 'react'
import * as Sentry from '@sentry/nextjs'

import { trackSectionVisible } from '@/utils/web/clientAnalytics'

import { UseSectionsProps, UseSectionsReturn } from './useSections.types'

export function useSections<SectionKeys extends readonly string[]>({
  sections,
  initialSectionId,
  analyticsName,
}: UseSectionsProps<SectionKeys>): UseSectionsReturn<SectionKeys[number]> {
  type Key = SectionKeys[number]

  if (!sections.length) {
    const err = new Error('useSections: sections must not be empty')
    Sentry.captureException(err)
    throw err
  }

  const [currentSection, setCurrentSection] = React.useState<Key>(initialSectionId ?? sections[0])
  const [history, setHistory] = React.useState<Key[]>([currentSection])

  const goToSection: UseSectionsReturn<Key>['goToSection'] = React.useCallback(
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

  const goBackSection: UseSectionsReturn<Key>['goBackSection'] = React.useCallback(() => {
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
