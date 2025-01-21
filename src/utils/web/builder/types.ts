export type BuilderComponentAttributes = Record<string, any>

export interface BuilderComponentBaseProps<State = unknown> {
  children?: React.ReactNode
  attributes?: BuilderComponentAttributes
  builderState?: {
    state: State
  }
}
