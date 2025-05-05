// we want to stable stringify the object so that the url is cached by next.js
import stringify from 'fast-json-stable-stringify'
import { isString } from 'lodash-es'

interface EncodedObject {
  [key: string]: string | number | boolean | null | undefined
}

/*
base64 encoding does not accept non-standard unicode characters and seo we encode all strings on the object before serializing/de-serializing
*/

export function encodeObjectForUrl(obj: EncodedObject) {
  // Encode object values with encodeURIComponent
  const encodedObj = Object.entries(obj).reduce((acc, [key, value]) => {
    if (isString(value)) {
      acc[key] = encodeURIComponent(value)
    } else {
      acc[key] = value
    }
    return acc
  }, {} as EncodedObject)

  // Stringify and base64 encode
  return btoa(stringify(encodedObj))
}

export function decodeObjectForUrl<T extends EncodedObject>(str: string) {
  // Base64 decode and parse string
  const decodedStr = JSON.parse(atob(str)) as T

  // Decode values with decodeURIComponent
  return Object.entries(decodedStr).reduce((acc, [key, value]) => {
    if (isString(value)) {
      acc[key] = decodeURIComponent(value)
    } else {
      acc[key] = value
    }

    return acc
  }, {} as EncodedObject) as T
}
