const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{3}$/i

export function isMockReferralId(referralId: string) {
  return referralId.length === 12 && uuidRegex.test(referralId)
}
