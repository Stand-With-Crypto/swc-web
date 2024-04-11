/* eslint-disable @next/next/no-img-element */
import { NextRequest } from 'next/server'

import { generateFrameImage } from '@/utils/server/generateFrameImage'
import { getLogger } from '@/utils/shared/logger'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION.HOUR
export const runtime = 'edge'

const logger = getLogger(`registerToVoteGetImage`)

export async function GET(
  _request: NextRequest,
  { params }: { params: { index: number; interactorType: string; walletAddress: string } },
) {
  logger.info('query parameters', params)

  const nftImage = await fetch(new URL('./nft.png', import.meta.url)).then(res => res.arrayBuffer())

  const shieldImage = await fetch(new URL('./shield.png', import.meta.url)).then(res =>
    res.arrayBuffer(),
  )

  const images = [
    <div key="image0" tw="flex flex-col w-full h-full items-center justify-center bg-white">
      <div
        style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}
        tw="flex w-full h-full text-white"
      >
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img
            alt=""
            height={300}
            src={nftImage as any}
            style={{ borderRadius: '50%' }}
            width={300}
          />
          <h2 tw="flex flex-col text-7xl font-bold tracking-tight text-left px-10">
            <span>Register to vote</span>
            <span tw="text-[#9e62ff] text-6xl">Mint an NFT</span>
          </h2>
        </div>
      </div>
    </div>,
    <div key="image1" tw="flex flex-col w-full h-full items-center justify-center bg-white">
      <div
        style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}
        tw="flex w-full h-full text-white"
      >
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img alt="" height={200} src={shieldImage as any} width={200} />
          <h2 tw="flex flex-col text-7xl font-bold tracking-tight text-left px-10">
            <span>Join Stand With Crypto</span>
            <div tw="flex flex-col text-5xl text-[#9e62ff] mt-4">
              <span>Enter your email and join over</span>
              <span>300,000 advocates fighting to</span>
              <span>keep crypto in America.</span>
            </div>
            <div tw="flex flex-col text-3xl text-gray-400 mt-2">
              <span>Personal information subject to Privacy Policy.</span>
            </div>
          </h2>
        </div>
      </div>
    </div>,
    <div key="image2" tw="flex flex-col w-full h-full items-center justify-center bg-white">
      <div
        style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}
        tw="flex w-full h-full text-white"
      >
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img alt="" height={200} src={shieldImage as any} width={200} />
          <h2 tw="flex flex-col text-7xl font-bold tracking-tight text-left px-10">
            <span>Join Stand With Crypto</span>
            <div tw="flex flex-col text-5xl text-[#9e62ff] mt-4">
              <span>Enter your phone number and</span>
              <span>make your voice heard in Washington D.C.</span>
            </div>
            <div tw="flex flex-col text-3xl text-gray-400 mt-2">
              <span>Personal information subject to Privacy Policy.</span>
            </div>
          </h2>
        </div>
      </div>
    </div>,
    <div key="image3" tw="flex flex-col w-full h-full items-center justify-center bg-white">
      <div
        style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}
        tw="flex w-full h-full text-white"
      >
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img alt="" height={200} src={shieldImage as any} width={200} />
          <h2 tw="flex flex-col text-7xl font-bold tracking-tight text-left px-10">
            <span>Are you registered to vote?</span>
          </h2>
        </div>
      </div>
    </div>,
    <div key="image4" tw="flex flex-col w-full h-full items-center justify-center bg-white">
      <div
        style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}
        tw="flex w-full h-full text-white"
      >
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img alt="" height={200} src={shieldImage as any} width={200} />
          <h2 tw="flex flex-col text-6xl font-bold tracking-tight text-left px-10">
            <span>Register to vote</span>
            <div tw="flex flex-col text-4xl text-gray-400 mt-4">
              <span>Enter your state code below.</span>
              <span>(CA, NY, etc.)</span>
            </div>
          </h2>
        </div>
      </div>
    </div>,
    <div key="image5" tw="flex flex-col w-full h-full items-center justify-center bg-white">
      <div
        style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}
        tw="flex w-full h-full text-white"
      >
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img alt="" height={200} src={shieldImage as any} width={200} />
          <h2 tw="flex flex-col text-6xl font-bold tracking-tight text-left px-10">
            <span>Register to vote</span>
            <div tw="flex flex-col text-4xl text-gray-400 mt-4">
              <span>Click the link below to complete your</span>
              <span>voter registration.</span>
            </div>
          </h2>
        </div>
      </div>
    </div>,
    <div key="image6" tw="flex flex-col w-full h-full items-center justify-center bg-white">
      <div
        style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}
        tw="flex w-full h-full text-white"
      >
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img alt="" height={200} src={shieldImage as any} width={200} />
          <h2 tw="flex flex-col text-6xl font-bold tracking-tight text-left px-10">
            <span>Check your registration status</span>
            <div tw="flex flex-col text-4xl text-gray-400 mt-4">
              <span>Enter your state code below.</span>
              <span>(CA, NY, etc.)</span>
            </div>
          </h2>
        </div>
      </div>
    </div>,
    <div key="image7" tw="flex flex-col w-full h-full items-center justify-center bg-white">
      <div
        style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}
        tw="flex w-full h-full text-white"
      >
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img alt="" height={200} src={shieldImage as any} width={200} />
          <h2 tw="flex flex-col text-6xl font-bold tracking-tight text-left px-10">
            <span>Check your registration status</span>
            <div tw="flex flex-col text-4xl text-gray-400 mt-4">
              <span>Click the link below to check your</span>
              <span>voter registration status.</span>
            </div>
          </h2>
        </div>
      </div>
    </div>,
    <div key="image8" tw="flex flex-col w-full h-full items-center justify-center bg-white">
      <div
        style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}
        tw="flex w-full h-full text-white"
      >
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img
            alt=""
            height={300}
            src={nftImage as any}
            style={{ borderRadius: '50%' }}
            width={300}
          />
          <h2 tw="flex flex-col text-7xl font-bold tracking-tight text-left px-10">
            <span>Mint your NFT</span>
            <span tw="text-[#9e62ff] text-6xl">"I'm a Voter" by pplpleasr</span>
          </h2>
        </div>
      </div>
    </div>,
    <div key="image9" tw="flex flex-col w-full h-full items-center justify-center bg-white">
      <div
        style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}
        tw="flex w-full h-full text-white"
      >
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img
            alt=""
            height={300}
            src={nftImage as any}
            style={{ borderRadius: '50%' }}
            width={300}
          />
          <h2 tw="flex flex-col text-6xl font-bold tracking-tight text-left px-10">
            <span>Thank you for registering!</span>
            <span tw="text-4xl">Continue the fight via the link below.</span>
          </h2>
        </div>
      </div>
    </div>,
    <div key="image10" tw="flex flex-col w-full h-full items-center justify-center bg-white">
      <div
        style={{ background: 'linear-gradient(180deg, #130032 0%, #000 100%)' }}
        tw="flex w-full h-full text-white"
      >
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img
            alt=""
            height={300}
            src={nftImage as any}
            style={{ borderRadius: '50%' }}
            width={300}
          />
          <h2 tw="flex flex-col text-6xl font-bold tracking-tight text-left px-10">
            <span>You have already completed.</span>
            <span>this action.</span>
            <span tw="text-4xl">Continue the fight via the link below.</span>
          </h2>
        </div>
      </div>
    </div>,
  ]

  return generateFrameImage(images[params.index])
}
