import { NextResponse } from 'next/server'

export function setResponseCookie({
  cookieName,
  cookieValue,
  response,
  maxAge,
}: {
  response: NextResponse
  cookieName: string
  cookieValue: string
  maxAge?: number
}) {
  response.cookies.set({
    name: cookieName,
    value: cookieValue,
    httpOnly: false,
    sameSite: 'lax',
    secure: true,
    ...(maxAge && { maxAge }),
  })
}
