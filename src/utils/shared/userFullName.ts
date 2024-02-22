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

  return (
    `${firstNameTrimmed ? firstNameTrimmed : ''} ${
      lastNameTrimmed ? `${lastNameTrimmed.slice(0, 1)}.` : ''
    }`.trim() || fallback
  )
}
