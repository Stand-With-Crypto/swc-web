'use client'
import YouTube from 'react-youtube'

export function ResponsiveYoutube(props: React.ComponentProps<typeof YouTube>) {
  return <YouTube {...props} className="aspect-h-9 aspect-w-16" />
}
