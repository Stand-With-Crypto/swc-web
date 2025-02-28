export interface BuilderComponentAttributes {
  key?: string
  className?: string
  style?: React.CSSProperties
  ['builder-id']?: string
  [key: string]: unknown
}

interface BuilderBlock {
  id: string
  component: {
    name: string
    options: unknown
  }
  children: Array<BuilderBlock>
}

export interface BuilderState {
  /** This prop should only be used in the context of the Builder.io editor when editing or previewing */
  mockIsAuthenticated: boolean
}

export interface BuilderComponentBaseProps {
  children?: React.ReactNode
  attributes?: BuilderComponentAttributes
  builderState?: {
    state: BuilderState & {
      locale?: string
    }
  }
  builderBlock?: BuilderBlock
}

export interface BuilderInputTypeOptions {
  set: (key: string, value: any) => void
  get: (key: string) => any
}
