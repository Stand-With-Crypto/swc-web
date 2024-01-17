export interface UseTabsProps<TabKey extends string> {
  tabs: TabKey[]
  initialTabId?: TabKey | (() => TabKey)
}

export interface UseTabsContextValue<TabKey extends string = string> {
  currentTab: TabKey
  gotoTab: (tabId: TabKey) => void
  onTabNotFound: () => void
}

export interface UseTabsReturn<TabKey extends string = string> extends UseTabsContextValue<TabKey> {
  TabsProvider: React.ComponentType<React.PropsWithChildren>
}
