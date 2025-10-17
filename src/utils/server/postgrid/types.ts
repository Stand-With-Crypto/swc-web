// PostGrid SDK Contact format (requires either firstName+lastName OR companyName)
export interface PostGridLetterAddress {
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  provinceOrState: string
  postalOrZip: string
  countryCode: string
}

export interface CreateLetterParams {
  to: PostGridLetterAddress
  from: PostGridLetterAddress
  html: string
  idempotencyKey: string
  metadata?: Record<string, string>
}

export interface CreateLetterResult {
  success: boolean
  letterId?: string
  status?: string
  error?: string
}

export interface PostGridWebhookEvent {
  id: string
  type: string
  data: {
    id: string
    status: string
    metadata?: Record<string, string>
    [key: string]: any
  }
}

