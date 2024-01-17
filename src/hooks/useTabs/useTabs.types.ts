export interface UseTabsProps<TabKey extends string> {
  tabs: TabKey[]
  initialTabId?: TabKey | (() => TabKey)
}

export interface UseTabsReturn<TabKey extends string = string> {
  currentTab: TabKey
  gotoTab: (tabId: TabKey) => void
  onTabNotFound: () => void
}
