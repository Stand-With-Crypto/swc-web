export interface BuilderComponentBaseProps<State = unknown> {
  children: React.ReactNode
  attributes?: Record<string, any>
  builderState?: {
    state: State
  }
}
