// These opt-in/out information can be provided when creating or updating an advocate in Capitol Canary.
export interface CapitolCanaryOpts {
  isSmsOptin?: boolean
  isSmsOptinConfirmed?: boolean // Set to true to NOT sent a confirmation SMS.
  isSmsOptout?: boolean
  isEmailOptin?: boolean
  isEmailOptout?: boolean
}
