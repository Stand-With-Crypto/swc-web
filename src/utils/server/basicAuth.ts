export function createBasicAuthHeader({
  username,
  password,
}: {
  username: string
  password: string
}) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
}

export function decodeBasicAuthHeader(basicAuthHeader: string) {
  const [authType, encodedAuthSecret] = basicAuthHeader.split(' ')
  if (authType !== 'Basic') {
    return { failReason: 'Invalid authorization type' }
  }
  try {
    const [username, password] = Buffer.from(encodedAuthSecret, 'base64')
      .toString('utf-8')
      .split(':')
    return { password, username }
  } catch (e) {
    return { failReason: 'Could not decode' }
  }
}
