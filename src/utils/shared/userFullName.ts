export function userFullName(
  {
    firstName,
    lastName,
  }: {
    firstName?: string | null
    lastName?: string | null
  },
  { fallback = '' }: { fallback?: string } = {},
): string {
  const firstNameTrimmed = firstName?.trim()
  const lastNameTrimmed = lastName?.trim()

  return (
    `${firstNameTrimmed ? firstNameTrimmed : ''} ${
      lastNameTrimmed ? lastNameTrimmed : ''
    }`.trim() || fallback
  )
}
