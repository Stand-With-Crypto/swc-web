// Helper function for base64 decoding (atob) in Node.js and browser
export function base64Decode(input: string) {
  if (typeof atob === 'function') {
    // Browser environment
    return atob(input)
  } else if (typeof Buffer === 'function') {
    // Node.js environment
    return Buffer.from(input, 'base64').toString('binary')
  } else {
    throw new Error('Base64 decoding is not supported in this environment.')
  }
}

// Helper function for base64 encoding (btoa) in Node.js and browser
export function base64Encode(input: string) {
  if (typeof btoa === 'function') {
    // Browser environment
    return btoa(input)
  } else if (typeof Buffer === 'function') {
    // Node.js environment
    return Buffer.from(input, 'binary').toString('base64')
  } else {
    throw new Error('Base64 encoding is not supported in this environment.')
  }
}
