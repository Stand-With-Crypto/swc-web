export function CallIcon({ isPulsing = false, height = 40, width = 40 }) {
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
    >
      <circle cx="20" cy="20" fill="#2B9D74" r="20" />
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
        <circle
          cx="20"
          cy="20"
          fill="none"
          r="18"
          stroke="#7FDFBD"
          strokeLinecap="round"
          strokeWidth="4"
        >
          <animate attributeName="r" dur="2s" repeatCount="indefinite" values="18;22;18" />
          <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="1;0;1" />
        </circle>
      )}
    </svg>
  )
}

export function EmailIcon({ isPulsing = false, height = 40, width = 40 }) {
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
    >
      <rect fill="#9E00FF" height="40" rx="20" width="40.0007" />
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
        <circle
          cx="20"
          cy="20"
          fill="none"
          r="18"
          stroke="#DA9DFF"
          strokeLinecap="round"
          strokeWidth="4"
        >
          <animate attributeName="r" dur="2s" repeatCount="indefinite" values="18;22;18" />
          <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="1;0;1" />
        </circle>
      )}
    </svg>
  )
}

export function JoinIcon({ isPulsing = false, height = 40, width = 40 }) {
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
        <circle
          cx="20"
          cy="20"
          fill="none"
          r="18"
          stroke="#C09AFF"
          strokeLinecap="round"
          strokeWidth="4"
        >
          <animate attributeName="r" dur="2s" repeatCount="indefinite" values="18;22;18" />
          <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="1;0;1" />
        </circle>
      )}
    </svg>
  )
}

export function VoterRegIcon({ isPulsing = false, height = 40, width = 40 }) {
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
    >
      <rect fill="#7F2BFF" height="40" rx="20" width="40" />
      <g clipPath="url(#clip0_4101_15882)">
        <path d="M15.832 13.3335H23.332V25.0002H15.832V13.3335Z" fill="white" opacity="0.3" />
        <path
          d="M22.918 10.8335H16.2513C15.1013 10.8335 14.168 11.7668 14.168 12.9168V27.0835C14.168 28.2335 15.1013 29.1668 16.2513 29.1668H22.918C24.068 29.1668 25.0013 28.2335 25.0013 27.0835V12.9168C25.0013 11.7668 24.068 10.8335 22.918 10.8335ZM19.5846 28.3335C18.893 28.3335 18.3346 27.7752 18.3346 27.0835C18.3346 26.3918 18.893 25.8335 19.5846 25.8335C20.2763 25.8335 20.8346 26.3918 20.8346 27.0835C20.8346 27.7752 20.2763 28.3335 19.5846 28.3335ZM23.3346 25.0002H15.8346V13.3335H23.3346V25.0002Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_4101_15882">
          <rect fill="white" height="20" transform="translate(10 10)" width="20" />
        </clipPath>
      </defs>
      {isPulsing && (
        <circle
          cx="20"
          cy="20"
          fill="none"
          r="18"
          stroke="#D5B7FF"
          strokeLinecap="round"
          strokeWidth="4"
        >
          <animate attributeName="r" dur="2s" repeatCount="indefinite" values="18;22;18" />
          <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="1;0;1" />
        </circle>
      )}
    </svg>
  )
}
