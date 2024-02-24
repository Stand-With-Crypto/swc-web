export const userFullName = (
  {
    firstName,
    lastName,
  }: {
    firstName?: string | null
    lastName?: string | null
  },
  { fallback = '' }: { fallback?: string } = {},
): string => {
  const firstNameTrimmed = firstName?.trim()
  const lastNameTrimmed = lastName?.trim()

  return (
    `${firstNameTrimmed ? firstNameTrimmed : ''} ${
      lastNameTrimmed ? lastNameTrimmed : ''
    }`.trim() || fallback
  )
}

export const userFirstNameWithLastInitial = (
  {
    firstName,
    lastName,
  }: {
    firstName?: string | null
    lastName?: string | null
  },
  { fallback = '' }: { fallback?: string } = {},
): string => {
  const firstNameTrimmed = firstName?.trim()
  const lastNameTrimmed = lastName?.trim()
  if (firstNameTrimmed) {
    return (
      `${firstNameTrimmed ? firstNameTrimmed : ''} ${
        lastNameTrimmed ? `${lastNameTrimmed.slice(0, 1)}.` : ''
      }`.trim() || fallback
    )
  }
  // if a user doesn't have a first name at all we should just return the last name
  return lastNameTrimmed?.trim() || fallback
}
