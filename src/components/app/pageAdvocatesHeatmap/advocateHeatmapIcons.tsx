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
      <rect fill="#D62828" height="40" rx="20" width="40.0007" />
      <g clipPath="url(#clip0_5328_1095)">
        <path d="M13.002 27H27.002V28H13.002V27Z" fill="white" opacity="0.3" />
        <path
          d="M26 21H25.32L23.32 23H25.23L27 25H13L14.78 23H16.83L14.83 21H14L11 24V28C11 29.1 11.89 30 12.99 30H27C28.1 30 29 29.11 29 28V24L26 21ZM27 28H13V27H27V28Z"
          fill="white"
        />
        <path
          d="M20.0469 20.9049L16.5039 17.3619L21.4539 12.4119L24.9969 15.9549L20.0469 20.9049Z"
          fill="white"
          opacity="0.3"
        />
        <path
          d="M27.1102 15.25L22.1602 10.3C21.7802 9.90004 21.1502 9.90004 20.7602 10.29L14.3902 16.66C14.0002 17.05 14.0002 17.68 14.3902 18.07L19.3402 23.02C19.7302 23.41 20.3602 23.41 20.7502 23.02L27.1102 16.66C27.5002 16.27 27.5002 15.64 27.1102 15.25ZM20.0502 20.9L16.5102 17.36L21.4602 12.41L25.0002 15.95L20.0502 20.9Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_5328_1095">
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
      <rect fill="#000000" height="40" rx="20" width="40.0007" />

      <path
        d="M21.3319 18.928L26.5437 13H25.3087L20.7833 18.1472L17.1688 13H13L18.4657 20.7835L13 27H14.2351L19.0141 21.5643L22.8312 27H27L21.3316 18.928H21.3319ZM19.6403 20.8521L19.0865 20.077L14.6801 13.9098H16.5772L20.1331 18.887L20.6869 19.662L25.3093 26.1316H23.4122L19.6403 20.8524V20.8521Z"
        fill="#FFFFFF"
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
            stroke="#000000"
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
            stroke="#000000"
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
      <rect fill="#2A9D8F" height="40" rx="20" width="40" />
      <g clipPath="url(#clip0_5328_1112)">
        <path
          d="M12 24.9999H28V26.9999H12V24.9999ZM25 18.8299L23.38 19.9999L20 15.3999L16.62 19.9999L15 18.8299L17.08 15.9999H12V21.9999H28V15.9999H22.92L25 18.8299Z"
          fill="white"
          opacity="0.3"
        />
        <path
          d="M28 14H25.82C25.93 13.69 26 13.35 26 13C26 11.34 24.66 10 23 10C21.95 10 21.04 10.54 20.5 11.35L20 12.02L19.5 11.34C18.96 10.54 18.05 10 17 10C15.34 10 14 11.34 14 13C14 13.35 14.07 13.69 14.18 14H12C10.89 14 10.01 14.89 10.01 16L10 27C10 28.11 10.89 29 12 29H28C29.11 29 30 28.11 30 27V16C30 14.89 29.11 14 28 14ZM23 12C23.55 12 24 12.45 24 13C24 13.55 23.55 14 23 14C22.45 14 22 13.55 22 13C22 12.45 22.45 12 23 12ZM17 12C17.55 12 18 12.45 18 13C18 13.55 17.55 14 17 14C16.45 14 16 13.55 16 13C16 12.45 16.45 12 17 12ZM28 27H12V25H28V27ZM28 22H12V16H17.08L15 18.83L16.62 20L20 15.4L23.38 20L25 18.83L22.92 16H28V22Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_5328_1112">
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
