export interface PostGridLetterAddress {
  firstName: string
  lastName: string
  addressLine1: string
  city: string
  provinceOrState: string
  postalOrZip: string
  country: string
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

