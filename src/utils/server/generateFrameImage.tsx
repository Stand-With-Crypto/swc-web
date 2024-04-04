import { ImageResponse } from '@vercel/og'

export const FRAME_IMAGE_DIMENSIONS = {
  width: 1200,
  height: 630,
}

export const generateFrameImage = async (content: React.ReactNode) => {
  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          width: '100%',
          height: '100vh',
          backgroundColor: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            lineHeight: 1.2,
            fontSize: 36,
            color: 'black',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {content}
        </div>
      </div>
    ),
    FRAME_IMAGE_DIMENSIONS,
  )
  return imageResponse
}
