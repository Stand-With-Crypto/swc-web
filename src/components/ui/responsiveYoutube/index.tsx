'use client'
import YouTube from 'react-youtube'

export const ResponsiveYoutube = (props: React.ComponentProps<typeof YouTube>) => {
  return <YouTube {...props} className="aspect-w-16 aspect-h-9" />
}
