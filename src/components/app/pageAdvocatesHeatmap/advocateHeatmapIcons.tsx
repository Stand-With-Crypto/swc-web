import { SVGAttributes } from 'react'

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  isPulsing?: boolean
  height?: number
  width?: number
}

export function CallIcon({ isPulsing = false, height = 40, width = 40, ...rest }: IconProps) {
  return (
    <svg
      fill="none"
      height={height}
      style={{
        position: 'relative',
        overflow: 'visible',
      }}
      viewBox="0 0 40 40"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <circle cx="20" cy="20" fill="#003049" r="20" />
      <g clipPath="url(#clip0_4101_15867)">
        <path d="M15.832 13.3335H23.332V25.0002H15.832V13.3335Z" fill="white" opacity="0.3" />
        <path
          d="M22.918 10.8335H16.2513C15.1013 10.8335 14.168 11.7668 14.168 12.9168V27.0835C14.168 28.2335 15.1013 29.1668 16.2513 29.1668H22.918C24.068 29.1668 25.0013 28.2335 25.0013 27.0835V12.9168C25.0013 11.7668 24.068 10.8335 22.918 10.8335ZM19.5846 28.3335C18.893 28.3335 18.3346 27.7752 18.3346 27.0835C18.3346 26.3918 18.893 25.8335 19.5846 25.8335C20.2763 25.8335 20.8346 26.3918 20.8346 27.0835C20.8346 27.7752 20.2763 28.3335 19.5846 28.3335ZM23.3346 25.0002H15.8346V13.3335H23.3346V25.0002Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_4101_15867">
          <rect fill="white" height="20" transform="translate(10 10)" width="20" />
        </clipPath>
      </defs>
      {isPulsing && (
        <>
          <circle
            cx="20"
            cy="20"
            fill="none"
            r="18"
            stroke="#003049"
            strokeLinecap="round"
            strokeWidth="8"
          >
            <animate attributeName="r" begin="0s" dur="1s" fill="freeze" from="18" to="22" />
            <animate attributeName="opacity" begin="1s" dur="1s" fill="freeze" from="1" to="0" />
          </circle>

          <circle
            cx="20"
            cy="20"
            fill="none"
            r="18"
            stroke="#003049"
            strokeLinecap="round"
            strokeWidth="4"
          >
            <animate
              attributeName="r"
              begin="2s"
              dur="2s"
              repeatCount="indefinite"
              values="18;22;18"
            />
            <animate
              attributeName="opacity"
              begin="2s"
              dur="2s"
              repeatCount="indefinite"
              values="1;0;1"
            />
          </circle>
        </>
      )}
    </svg>
  )
}

export function EmailIcon({ isPulsing = false, height = 40, width = 40, ...rest }: IconProps) {
  return (
    <svg
      fill="none"
      height={height}
      style={{
        position: 'relative',
        overflow: 'visible',
      }}
      viewBox="0 0 40 40"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect fill="#D62828" height="40" rx="20" width="40.0007" />
      <g clipPath="url(#clip0_4101_15872)">
        <path
          d="M26.6654 16.6667L19.9987 20.8333L13.332 16.6667V25H26.6654V16.6667ZM26.6654 15H13.332L19.9987 19.1583L26.6654 15Z"
          fill="white"
          opacity="0.3"
        />
        <path
          d="M13.3346 26.6668H26.668C27.5846 26.6668 28.3346 25.9168 28.3346 25.0002V15.0002C28.3346 14.0835 27.5846 13.3335 26.668 13.3335H13.3346C12.418 13.3335 11.668 14.0835 11.668 15.0002V25.0002C11.668 25.9168 12.418 26.6668 13.3346 26.6668ZM26.668 15.0002L20.0013 19.1585L13.3346 15.0002H26.668ZM13.3346 16.6668L20.0013 20.8335L26.668 16.6668V25.0002H13.3346V16.6668Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_4101_15872">
          <rect fill="white" height="20" transform="translate(10 10)" width="20" />
        </clipPath>
      </defs>
      {isPulsing && (
        <>
          <circle
            cx="20"
            cy="20"
            fill="none"
            r="18"
            stroke="#D62828"
            strokeLinecap="round"
            strokeWidth="8"
          >
            <animate attributeName="r" begin="0s" dur="1s" fill="freeze" from="18" to="22" />
            <animate attributeName="opacity" begin="1s" dur="1s" fill="freeze" from="1" to="0" />
          </circle>

          <circle
            cx="20"
            cy="20"
            fill="none"
            r="18"
            stroke="#D62828"
            strokeLinecap="round"
            strokeWidth="4"
          >
            <animate
              attributeName="r"
              begin="2s"
              dur="2s"
              repeatCount="indefinite"
              values="18;22;18"
            />
            <animate
              attributeName="opacity"
              begin="2s"
              dur="2s"
              repeatCount="indefinite"
              values="1;0;1"
            />
          </circle>
        </>
      )}
    </svg>
  )
}

export function JoinIcon({ isPulsing = false, height = 40, width = 40, ...rest }: IconProps) {
  return (
    <svg
      fill="none"
      height={height}
      style={{
        position: 'relative',
        overflow: 'visible',
      }}
      viewBox="0 0 40 40"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect fill="#6100FF" height="40" rx="20" width="40" />
      <g clipPath="url(#clip0_4101_15877)">
        <path
          d="M15 15.3247V19.2414C15 22.5747 17.125 25.658 20 26.5997C22.875 25.658 25 22.583 25 19.2414V15.3247L20 13.4497L15 15.3247Z"
          fill="white"
          opacity="0.3"
        />
        <path
          d="M19.9987 11.6665L13.332 14.1665V19.2415C13.332 23.4498 16.1737 27.3748 19.9987 28.3332C23.8237 27.3748 26.6654 23.4498 26.6654 19.2415V14.1665L19.9987 11.6665ZM24.9987 19.2415C24.9987 22.5748 22.8737 25.6582 19.9987 26.5998C17.1237 25.6582 14.9987 22.5832 14.9987 19.2415V15.3248L19.9987 13.4498L24.9987 15.3248V19.2415Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_4101_15877">
          <rect fill="white" height="20" transform="translate(10 10)" width="20" />
        </clipPath>
      </defs>
      {isPulsing && (
        <>
          <circle
            cx="20"
            cy="20"
            fill="none"
            r="18"
            stroke="#6100FF"
            strokeLinecap="round"
            strokeWidth="8"
          >
            <animate attributeName="r" begin="0s" dur="1s" fill="freeze" from="18" to="22" />
            <animate attributeName="opacity" begin="1s" dur="1s" fill="freeze" from="1" to="0" />
          </circle>

          <circle
            cx="20"
            cy="20"
            fill="none"
            r="18"
            stroke="#6100FF"
            strokeLinecap="round"
            strokeWidth="4"
          >
            <animate
              attributeName="r"
              begin="2s"
              dur="2s"
              repeatCount="indefinite"
              values="18;22;18"
            />
            <animate
              attributeName="opacity"
              begin="2s"
              dur="2s"
              repeatCount="indefinite"
              values="1;0;1"
            />
          </circle>
        </>
      )}
    </svg>
  )
}

export function VoterRegIcon({ isPulsing = false, height = 40, width = 40, ...rest }: IconProps) {
  return (
    <svg
      fill="none"
      height={height}
      style={{
        position: 'relative',
        overflow: 'visible',
      }}
      viewBox="0 0 40 40"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect fill="#2A9D8F" height="40" rx="20" width="40" />
      <g clipPath="url(#clip0_4101_15885)">
        <path d="M14.168 25.8335H25.8346V26.6668H14.168V25.8335Z" fill="white" opacity="0.3" />
        <path
          d="M25 20.8335H24.4333L22.7667 22.5002H24.3583L25.8333 24.1668H14.1667L15.65 22.5002H17.3583L15.6917 20.8335H15L12.5 23.3335V26.6668C12.5 27.5835 13.2417 28.3335 14.1583 28.3335H25.8333C26.75 28.3335 27.5 27.5918 27.5 26.6668V23.3335L25 20.8335ZM25.8333 26.6668H14.1667V25.8335H25.8333V26.6668Z"
          fill="white"
        />
        <path
          d="M20.0384 20.7543L17.0859 17.8018L21.2109 13.6768L24.1634 16.6293L20.0384 20.7543Z"
          fill="white"
          opacity="0.3"
        />
        <path
          d="M25.9258 16.0416L21.8008 11.9166C21.4841 11.5832 20.9591 11.5832 20.6341 11.9082L15.3258 17.2166C15.0008 17.5416 15.0008 18.0666 15.3258 18.3916L19.4508 22.5166C19.7758 22.8416 20.3008 22.8416 20.6258 22.5166L25.9258 17.2166C26.2508 16.8916 26.2508 16.3666 25.9258 16.0416ZM20.0424 20.7499L17.0924 17.7999L21.2174 13.6749L24.1674 16.6249L20.0424 20.7499Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_4101_15885">
          <rect fill="white" height="20" transform="translate(10 10)" width="20" />
        </clipPath>
      </defs>
      {isPulsing && (
        <>
          <circle
            cx="20"
            cy="20"
            fill="none"
            r="18"
            stroke="#2A9D8F"
            strokeLinecap="round"
            strokeWidth="8"
          >
            <animate attributeName="r" begin="0s" dur="1s" fill="freeze" from="18" to="22" />
            <animate attributeName="opacity" begin="1s" dur="1s" fill="freeze" from="1" to="0" />
          </circle>

          <circle
            cx="20"
            cy="20"
            fill="none"
            r="18"
            stroke="#2A9D8F"
            strokeLinecap="round"
            strokeWidth="4"
          >
            <animate
              attributeName="r"
              begin="2s"
              dur="2s"
              repeatCount="indefinite"
              values="18;22;18"
            />
            <animate
              attributeName="opacity"
              begin="2s"
              dur="2s"
              repeatCount="indefinite"
              values="1;0;1"
            />
          </circle>
        </>
      )}
    </svg>
  )
}

export function VoterAttestationIcon({
  isPulsing = false,
  height = 40,
  width = 40,
  ...rest
}: IconProps) {
  return (
    <svg
      fill="none"
      height={height}
      style={{
        position: 'relative',
        overflow: 'visible',
      }}
      viewBox="0 0 40 40"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect fill="#0851AA" height="40" rx="20" width="40" />
      <g clipPath="url(#clip0_76_1072)">
        <path
          d="M20 10.8333L12.5 14.1666V19.1666C12.5 23.7916 15.7 28.1166 20 29.1666C24.3 28.1166 27.5 23.7916 27.5 19.1666V14.1666L20 10.8333ZM25.8333 19.1666C25.8333 22.9333 23.35 26.4083 20 27.4416C16.65 26.4083 14.1667 22.9333 14.1667 19.1666V15.2499L20 12.6583L25.8333 15.2499V19.1666ZM16.175 19.6583L15 20.8333L18.3333 24.1666L25 17.4999L23.825 16.3166L18.3333 21.8083L16.175 19.6583Z"
          fill="white"
        />
        <path
          d="M14.1665 15.2501V19.1668C14.1665 22.9334 16.6498 26.4084 19.9998 27.4418C23.3498 26.4168 25.8332 22.9334 25.8332 19.1668V15.2501L19.9998 12.6584L14.1665 15.2501ZM24.9998 17.5001L18.3332 24.1668L14.9998 20.8334L16.1748 19.6584L18.3332 21.8084L23.8248 16.3168L24.9998 17.5001Z"
          fill="white"
          opacity="0.3"
        />
      </g>
      <defs>
        <clipPath id="clip0_76_1072">
          <rect fill="white" height="20" transform="translate(10 10)" width="20" />
        </clipPath>
      </defs>
      {isPulsing && (
        <>
          <circle
            cx="20"
            cy="20"
            fill="none"
            r="18"
            stroke="#0851AA"
            strokeLinecap="round"
            strokeWidth="8"
          >
            <animate attributeName="r" begin="0s" dur="1s" fill="freeze" from="18" to="22" />
            <animate attributeName="opacity" begin="1s" dur="1s" fill="freeze" from="1" to="0" />
          </circle>

          <circle
            cx="20"
            cy="20"
            fill="none"
            r="18"
            stroke="#0851AA"
            strokeLinecap="round"
            strokeWidth="4"
          >
            <animate
              attributeName="r"
              begin="2s"
              dur="2s"
              repeatCount="indefinite"
              values="18;22;18"
            />
            <animate
              attributeName="opacity"
              begin="2s"
              dur="2s"
              repeatCount="indefinite"
              values="1;0;1"
            />
          </circle>
        </>
      )}
    </svg>
  )
}
