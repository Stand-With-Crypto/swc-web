// The library doesn't have a type definition file, so we need to create one
declare module 'odometer' {
  export interface OdometerOptions {
    el: HTMLElement
    auto: boolean
    value: number
    animation?: 'count'
    duration?: number
    format?: string
    theme?: string
  }

  declare class Odometer {
    constructor(options: OdometerOptions)
    update(value: OdometerOptions['value']): void
  }
  export default Odometer
}
