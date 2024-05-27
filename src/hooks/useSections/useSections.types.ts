export interface UseSectionsProps<SectionKeys extends readonly string[]> {
  sections: SectionKeys
  initialSectionId: SectionKeys[number]
  analyticsName: string
}

export interface UseSectionsReturn<TabKey extends string = string> {
  currentSection: TabKey
  goToSection: (tabId: TabKey, options?: { disableAnalytics?: boolean }) => void
  onSectionNotFound: () => void
  goBackSection: () => void
}
