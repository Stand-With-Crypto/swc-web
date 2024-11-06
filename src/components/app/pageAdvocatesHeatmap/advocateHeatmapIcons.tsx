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

export function ViewKeyRacesIcon({
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
      <rect fill="#003049" height="40" rx="20" width="40" />
      <g clipPath="url(#clip0_5259_17615)">
        <path
          d="M13 14.2999V18.9999C13 23.5199 15.98 27.6899 20 28.9299C21.74 28.3999 23.28 27.3099 24.47 25.8899L22.75 24.1699C20.81 25.4599 18.17 25.2399 16.46 23.5299C14.51 21.5799 14.51 18.4099 16.46 16.4599C18.41 14.5099 21.58 14.5099 23.53 16.4599C25.24 18.1699 25.45 20.8099 24.17 22.7499L25.62 24.1999C26.49 22.6499 27 20.8499 27 18.9999V14.2999L20 11.1899L13 14.2999Z"
          fill="white"
          opacity="0.3"
        />
        <path
          d="M20 9L11 13V19C11 24.55 14.84 29.74 20 31C20.65 30.84 21.27 30.62 21.87 30.35C23.67 29.53 25.23 28.22 26.44 26.61C28.04 24.46 29 21.77 29 19V13L20 9ZM27 19C27 20.85 26.49 22.65 25.62 24.21L24.17 22.76C25.46 20.82 25.24 18.18 23.53 16.47C21.58 14.52 18.41 14.52 16.46 16.47C14.51 18.42 14.51 21.59 16.46 23.54C18.17 25.25 20.81 25.46 22.75 24.18L24.47 25.9C23.28 27.32 21.74 28.41 20 28.94C15.98 27.69 13 23.52 13 19V14.3L20 11.19L27 14.3V19ZM23 20C23 21.66 21.66 23 20 23C18.34 23 17 21.66 17 20C17 18.34 18.34 17 20 17C21.66 17 23 18.34 23 20Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_5259_17615">
          <rect fill="white" height="24" transform="translate(8 8)" width="24" />
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

export function VotedIcon({ isPulsing = false, height = 40, width = 40, ...rest }: IconProps) {
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
      <rect fill="#FFF2B2" height="40" rx="20" width="40" />
      <g clipPath="url(#clip0_5232_17227)">
        <path
          d="M15.8333 21.6667H18.3333V24.1667H15.8333V21.6667ZM15.8333 15.8334H18.3333V18.3334H15.8333V15.8334ZM14.1666 25.8334H25.8333V14.1667H14.1666V25.8334ZM20.8333 16.2501H25V17.9167H20.8333V16.2501ZM20.8333 22.0834H25V23.7501H20.8333V22.0834ZM15 15.0001H19.1666V19.1667H15V15.0001ZM15 20.8334H19.1666V25.0001H15V20.8334Z"
          fill="#4A2100"
          opacity="0.3"
        />
        <path
          d="M20.8333 16.25H25V17.9167H20.8333V16.25ZM20.8333 22.0833H25V23.75H20.8333V22.0833ZM25.8333 12.5H14.1667C13.25 12.5 12.5 13.25 12.5 14.1667V25.8333C12.5 26.75 13.25 27.5 14.1667 27.5H25.8333C26.75 27.5 27.5 26.75 27.5 25.8333V14.1667C27.5 13.25 26.75 12.5 25.8333 12.5ZM25.8333 25.8333H14.1667V14.1667H25.8333V25.8333ZM19.1667 15H15V19.1667H19.1667V15ZM18.3333 18.3333H15.8333V15.8333H18.3333V18.3333ZM19.1667 20.8333H15V25H19.1667V20.8333ZM18.3333 24.1667H15.8333V21.6667H18.3333V24.1667Z"
          fill="#4A2100"
        />
      </g>
      <defs>
        <clipPath id="clip0_5232_17227">
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
            stroke="#FFF2B2"
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
            stroke="#FFF2B2"
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

export function PrepareToVoteIcon({
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
      <rect fill="#D62828" height="40" rx="20" width="40.0007" />
      <g clipPath="url(#clip0_5259_17626)">
        <path
          d="M20 11C16.69 11 14 13.69 14 17C14 20.54 17.82 25.86 20 28.47C21.75 26.36 26 20.84 26 17C26 13.69 23.31 11 20 11ZM18.47 22L15.29 18.82L16.71 17.4L18.48 19.17L23.08 14.57L24.49 15.98L18.47 22Z"
          fill="white"
          opacity="0.3"
        />
        <path
          d="M20 9C15.59 9 12 12.59 12 17C12 22.57 18.96 30.34 19.26 30.67L20 31.49L20.74 30.67C21.04 30.34 28 22.57 28 17C28 12.59 24.41 9 20 9ZM20 28.47C17.82 25.86 14 20.54 14 17C14 13.69 16.69 11 20 11C23.31 11 26 13.69 26 17C26 20.83 21.75 26.36 20 28.47ZM23.07 14.57L18.47 19.17L16.71 17.4L15.29 18.82L18.47 22L24.48 15.99L23.07 14.57Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_5259_17626">
          <rect fill="white" height="24" transform="translate(8 8)" width="24" />
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

export function FollowOnXIcon({ isPulsing = false, height = 40, width = 40, ...rest }: IconProps) {
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
      <rect fill="#EEF0F3" height="40" rx="20" width="40.0007" />

      <path
        d="M21.3319 18.928L26.5437 13H25.3087L20.7833 18.1472L17.1688 13H13L18.4657 20.7835L13 27H14.2351L19.0141 21.5643L22.8312 27H27L21.3316 18.928H21.3319ZM19.6403 20.8521L19.0865 20.077L14.6801 13.9098H16.5772L20.1331 18.887L20.6869 19.662L25.3093 26.1316H23.4122L19.6403 20.8524V20.8521Z"
        fill="black"
      />
      <defs>
        <clipPath id="clip0_5259_17626">
          <rect fill="white" height="24" transform="translate(8 8)" width="24" />
        </clipPath>
      </defs>
      {isPulsing && (
        <>
          <circle
            cx="20"
            cy="20"
            fill="none"
            r="18"
            stroke="#EEF0F3"
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
            stroke="#EEF0F3"
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

export function DonateIcon({ isPulsing = false, height = 40, width = 40, ...rest }: IconProps) {
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
      <rect fill="#D3E1FF" height="40" rx="20" width="40.0007" />

      <g clip-path="url(#clip0_3808_560)">
        <path
          d="M13.332 24.1665H26.6654V25.8332H13.332V24.1665ZM24.1654 19.0248L22.8154 19.9998L20.832 17.2998L19.9987 16.1665L19.1654 17.2998L17.182 19.9998L15.832 19.0248L17.5654 16.6665H13.332V21.6665H26.6654V16.6665H22.432L24.1654 19.0248Z"
          fill="#003EC1"
          opacity="0.3"
        />
        <path
          d="M26.668 14.9998H24.8513C24.943 14.7415 25.0013 14.4582 25.0013 14.1665C25.0013 12.7832 23.8846 11.6665 22.5013 11.6665C21.6263 11.6665 20.868 12.1165 20.418 12.7915L20.0013 13.3498L19.5846 12.7832C19.1346 12.1165 18.3763 11.6665 17.5013 11.6665C16.118 11.6665 15.0013 12.7832 15.0013 14.1665C15.0013 14.4582 15.0596 14.7415 15.1513 14.9998H13.3346C12.4096 14.9998 11.6763 15.7415 11.6763 16.6665L11.668 25.8332C11.668 26.7582 12.4096 27.4998 13.3346 27.4998H26.668C27.593 27.4998 28.3346 26.7582 28.3346 25.8332V16.6665C28.3346 15.7415 27.593 14.9998 26.668 14.9998ZM22.5013 13.3332C22.9596 13.3332 23.3346 13.7082 23.3346 14.1665C23.3346 14.6248 22.9596 14.9998 22.5013 14.9998C22.043 14.9998 21.668 14.6248 21.668 14.1665C21.668 13.7082 22.043 13.3332 22.5013 13.3332ZM17.5013 13.3332C17.9596 13.3332 18.3346 13.7082 18.3346 14.1665C18.3346 14.6248 17.9596 14.9998 17.5013 14.9998C17.043 14.9998 16.668 14.6248 16.668 14.1665C16.668 13.7082 17.043 13.3332 17.5013 13.3332ZM26.668 25.8332H13.3346V24.1665H26.668V25.8332ZM26.668 21.6665H13.3346V16.6665H17.568L15.8346 19.0248L17.1846 19.9998L19.168 17.2998L20.0013 16.1665L20.8346 17.2998L22.818 19.9998L24.168 19.0248L22.4346 16.6665H26.668V21.6665Z"
          fill="#003EC1"
        />
      </g>
      <defs>
        <clipPath id="clip0_3808_560">
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
            stroke="#D3E1FF"
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
            stroke="#D3E1FF"
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
