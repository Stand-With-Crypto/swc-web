/* eslint-disable @next/next/no-img-element */
import { NextRequest } from 'next/server'

import { generateFrameImage } from '@/utils/server/generateFrameImage'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'

export const revalidate = 300 // 5 minutes
export const runtime = 'edge'

export async function GET(request: NextRequest, props: { params: Promise<{ index: number }> }) {
  const params = await props.params
  const hasAlreadyCompletedAction = !!request.nextUrl.searchParams.get('hasAlreadyCompletedAction')
  const registrationType = request.nextUrl.searchParams.get('registrationType')
  const shouldShowError = !!request.nextUrl.searchParams.get('shouldShowError')

  let image: ArrayBuffer
  switch (Number(params.index)) {
    case 0:
    case 6:
    case 7:
      image = await fetch(new URL('./nft.png', import.meta.url)).then(res => res.arrayBuffer())
      break
    case 1:
      image = await fetch(new URL('./email.png', import.meta.url)).then(res => res.arrayBuffer())
      break
    case 2:
      image = await fetch(new URL('./phone.png', import.meta.url)).then(res => res.arrayBuffer())
      break
    case 3:
    case 4:
    case 5:
      image = await fetch(new URL('./shield.png', import.meta.url)).then(res => res.arrayBuffer())
      break
    default:
      image = await fetch(new URL('./nft.png', import.meta.url)).then(res => res.arrayBuffer())
  }

  const images = [
    <div key="image0" tw="flex flex-col w-full h-full items-center justify-center bg-black">
      <div style={{ background: 'black' }} tw="flex w-full h-full text-white">
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img alt="" height={400} src={image as any} style={{ borderRadius: '15%' }} width={400} />
          <h2 tw="flex flex-col text-5xl font-bold tracking-tight text-left px-10">
            <span>Mint your free “I’m a Voter” NFT</span>
            <span tw="text-[#7a28ff] text-4xl mt-2 mb-4">by pplpleasr</span>
            <div tw="flex flex-col text-4xl text-[#a3abbb]">
              <span>Sign up to Stand With Crypto and</span>
              <span>check your voter registration to</span>
              <span>mint a free NFT from pplpleasr</span>
            </div>
          </h2>
        </div>
      </div>
    </div>,
    <div key="image1" tw="flex flex-col w-full h-full items-center justify-center bg-black">
      <div style={{ background: 'black' }} tw="flex w-full h-full text-white">
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img
            alt=""
            height={400}
            src={image as any}
            style={{ borderRadius: '15%', background: '#7a28ff' }}
            width={400}
          />
          <h2 tw="flex flex-col text-5xl font-bold tracking-normal text-left px-10">
            <span tw="mb-6">Join the fight</span>
            <div tw="flex flex-col text-4xl text-[#a3abbb]">
              <span>Enter your email to join over {TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME}</span>
              <span>advocates fighting to keep crypto in</span>
              <span>America and receive regular updates on</span>
              <span>how to influence change</span>
            </div>
            <div tw="flex flex-col text-3xl text-[#6b7589] mt-6">
              <span>Personal information subject to</span>
              <span>Stand With Crypto Privacy Policy.</span>
            </div>
            {shouldShowError ? (
              <div tw="flex flex-col text-3xl text-red-500 mt-2">
                <span>Invalid email - please try again.</span>
              </div>
            ) : null}
          </h2>
        </div>
      </div>
    </div>,
    <div key="image2" tw="flex flex-col w-full h-full items-center justify-center bg-black">
      <div style={{ background: 'black' }} tw="flex w-full h-full text-white">
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img
            alt=""
            height={400}
            src={image as any}
            style={{ borderRadius: '15%', background: '#7a28ff' }}
            width={400}
          />
          <h2 tw="flex flex-col text-5xl font-bold tracking-normal text-left px-10">
            <span tw="mb-6">Stay up to date</span>
            <div tw="flex flex-col text-4xl text-[#a3abbb]">
              <span>Enter your phone number to receive a</span>
              <span>limited number of SMS updates on the</span>
              <span>highest priority issues involving crypto</span>
              <span>policy, invites to local events, and more</span>
            </div>
            <div tw="flex flex-col text-2xl text-[#6b7589] mt-6">
              <span>By clicking Next, you consent to receive recurring texts</span>
              <span>from Stand With Crypto about its efforts to the number</span>
              <span>entered below. You can reply STOP to stop receiving texts.</span>
              <span>Message and data rates may apply.</span>
            </div>
            {shouldShowError ? (
              <div tw="flex flex-col text-3xl text-red-500 mt-2">
                <span>Invalid phone number - please try again.</span>
              </div>
            ) : null}
          </h2>
        </div>
      </div>
    </div>,
    <div key="image3" tw="flex flex-col w-full h-full items-center justify-center bg-black">
      <div style={{ background: 'black' }} tw="flex w-full h-full text-white">
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img
            alt=""
            height={400}
            src={image as any}
            style={{ borderRadius: '15%', background: '#7a28ff' }}
            width={400}
          />
          <h2 tw="flex flex-col text-5xl font-bold tracking-normal text-left px-10">
            <span tw="mb-6">Are you registered to vote?</span>
            <div tw="flex flex-col text-4xl text-[#a3abbb]">
              <span>Take a few steps to register, or claim</span>
              <span>your NFT if you’ve already registered</span>
            </div>
          </h2>
        </div>
      </div>
    </div>,
    <div key="image4" tw="flex flex-col w-full h-full items-center justify-center bg-black">
      <div style={{ background: 'black' }} tw="flex w-full h-full text-white">
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img
            alt=""
            height={400}
            src={image as any}
            style={{ borderRadius: '15%', background: '#7a28ff' }}
            width={400}
          />
          <h2 tw="flex flex-col text-5xl font-bold tracking-normal text-left px-10">
            {registrationType === 'checkRegistration' ? (
              <span tw="mb-6">Check your registration status</span>
            ) : (
              <span tw="mb-6">Register to vote</span>
            )}
            {registrationType === 'checkRegistration' ? (
              <div tw="flex flex-col text-4xl text-[#a3abbb]">
                <span>Enter your state code (CA, NY, etc.) below</span>
                <span>to check your registration status</span>
              </div>
            ) : (
              <div tw="flex flex-col text-4xl text-[#a3abbb]">
                <span>This should only take a few minutes.</span>
                <span>Enter your state code (CA, NY, etc.) below</span>
              </div>
            )}
            {shouldShowError ? (
              <div tw="flex flex-col text-4xl text-red-500 mt-2">
                <span>Invalid state code - please try again.</span>
              </div>
            ) : null}
          </h2>
        </div>
      </div>
    </div>,
    <div key="image5" tw="flex flex-col w-full h-full items-center justify-center bg-black">
      <div style={{ background: 'black' }} tw="flex w-full h-full text-white">
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img
            alt=""
            height={400}
            src={image as any}
            style={{ borderRadius: '15%', background: '#7a28ff' }}
            width={400}
          />
          <h2 tw="flex flex-col text-5xl font-bold tracking-normal text-left px-10">
            {registrationType === 'checkRegistration' ? (
              <span tw="mb-6">Check your registration status</span>
            ) : (
              <span tw="mb-6">Register to vote</span>
            )}
            {registrationType === 'checkRegistration' ? (
              <div tw="flex flex-col text-4xl text-[#a3abbb]">
                <span>Click “Check registration status” below to</span>
                <span>see if you’ve already registered to vote</span>
              </div>
            ) : (
              <div tw="flex flex-col text-4xl text-[#a3abbb]">
                <span>Click “Register to vote” below to</span>
                <span>complete your voter registration</span>
              </div>
            )}
          </h2>
        </div>
      </div>
    </div>,
    <div key="image6" tw="flex flex-col w-full h-full items-center justify-center bg-black">
      <div style={{ background: 'black' }} tw="flex w-full h-full text-white">
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img alt="" height={400} src={image as any} style={{ borderRadius: '15%' }} width={400} />
          <h2 tw="flex flex-col text-5xl font-bold tracking-tight text-left px-10">
            <span>Mint your free NFT</span>
            <span tw="text-[#7a28ff] text-4xl mt-2 mb-4">“I’m a voter” NFT by pplpleasr</span>
            <div tw="flex flex-col text-3xl text-[#a3abbb]">
              <span>The “I'm a Voter” NFT was created by</span>
              <span>pplpleasr, in partnership with Stand With</span>
              <span>Crypto, to highlight the power of the</span>
              <span>crypto community to mobilize and vote</span>
              <span>in the 2024 elections. You need ETH on</span>
              <span>Base to mint</span>
            </div>
          </h2>
        </div>
      </div>
    </div>,
    <div key="image7" tw="flex flex-col w-full h-full items-center justify-center bg-black">
      <div style={{ background: 'black' }} tw="flex w-full h-full text-white">
        <div tw="flex flex-row w-full p-15 items-center justify-center">
          <img alt="" height={400} src={image as any} style={{ borderRadius: '15%' }} width={400} />
          <h2 tw="flex flex-col text-5xl font-bold tracking-tight text-left px-10">
            {hasAlreadyCompletedAction ? (
              <div tw="flex flex-col">
                <span>You have already completed</span>
                <span>this action.</span>
              </div>
            ) : (
              <span>Thank you for registering!</span>
            )}
            <div tw="flex flex-col text-4xl text-[#a3abbb]">
              <span>Continue the fight via the link below</span>
            </div>
          </h2>
        </div>
      </div>
    </div>,
  ]

  return generateFrameImage(images[params.index])
}
