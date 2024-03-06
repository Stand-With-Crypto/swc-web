import Head from 'next/head'

const videoUrl =
  'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/shield/stand-with-crypto-h8EMnIjlCFnMREravQ2irnktkh6egS.mp4'

export default function ShieldCampaign() {
  return (
    <div>
      <Head>
        <title>Stand With Crypto</title>

        <meta property="og:title" content="Stand With Cyrpto" />
        <meta property="og:type" content="video" />
        <meta property="og:url" content="https://standwithcrypto.org/campaign/shield" />
        <meta property="og:video" content={videoUrl} />
        <meta property="og:video:secure_url" content={videoUrl} />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:description" content="Stand with Crypto" />
      </Head>

      <video controls src={videoUrl} />
    </div>
  )
}
