export interface BuilderComponentAttributes {
  key?: string
  className?: string
  style?: React.CSSProperties
  ['builder-id']?: string
  [key: string]: unknown
}

export interface BuilderComponentBaseProps<State = unknown> {
  children?: React.ReactNode
  attributes?: BuilderComponentAttributes
  builderState?: {
    state: State
  }
}
