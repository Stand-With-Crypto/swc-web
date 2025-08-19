/**
 * Formats a datetime string to a compact "time ago" format (e.g. "5m ago", "2h ago", "3d ago")
 *
 * @param datetimeSigned - ISO datetime string of when something occurred
 * @returns Compact relative time string
 *
 * @example
 * formatTimeAgo('2024-01-15T10:28:00Z') // "5m ago" (if current time is 5 minutes later)
 */
export function formatTimeAgo(datetimeSigned: string): string {
  const now = new Date()
  const signedDate = new Date(datetimeSigned)
  const diffInMinutes = Math.floor((now.getTime() - signedDate.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) {
    return 'just now'
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}
