// These opt-in/out information can be provided when creating or updating an advocate in Capitol Canary.
export interface CapitolCanaryOpts {
  isSmsOptin?: boolean
  shouldSendSmsOptinConfirmation?: boolean
  isSmsOptout?: boolean
  isEmailOptin?: boolean
  isEmailOptout?: boolean
}
