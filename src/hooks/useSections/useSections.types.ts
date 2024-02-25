export interface UseSectionsProps<SectionKey extends string> {
  sections: SectionKey[]
  initialSectionId?: SectionKey | (() => SectionKey)
  analyticsName: string
}

export interface UseSectionsReturn<TabKey extends string = string> {
  currentSection: TabKey
  goToSection: (tabId: TabKey, options?: { disableAnalytics?: boolean }) => void
  onSectionNotFound: () => void
}
