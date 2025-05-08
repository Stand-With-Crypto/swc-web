export interface BaseUpsertAdvocateRequest {
  // Required information.
  campaigns?: number[]

  // Advocate information.
  email?: string
  phone?: string
  firstname?: string
  lastname?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  zip5?: string
  country?: string

  // Opt-in/out.
  smsOptin?: number
  smsOptinConfirmed?: number
  smsOptout?: number
  emailOptin?: number
  emailOptout?: number

  // Metadata for Capitol Canary.
  p2aSource?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  tags?: string[]
}
