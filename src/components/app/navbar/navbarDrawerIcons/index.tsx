import { SVGAttributes } from 'react'

interface IconProps extends SVGAttributes<SVGSVGElement> {
  height?: number
  width?: number
}

export function MissionIcon({ height = 24, width = 24, ...rest }: IconProps) {
  return (
    <svg
      fill="none"
      height={height}
      viewBox="0 0 24 12"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M4 7C5.1 7 6 6.1 6 5C6 3.9 5.1 3 4 3C2.9 3 2 3.9 2 5C2 6.1 2.9 7 4 7ZM5.13 8.1C4.76 8.04 4.39 8 4 8C3.01 8 2.07 8.21 1.22 8.58C0.48 8.9 0 9.62 0 10.43V12H4.5V10.39C4.5 9.56 4.73 8.78 5.13 8.1ZM20 7C21.1 7 22 6.1 22 5C22 3.9 21.1 3 20 3C18.9 3 18 3.9 18 5C18 6.1 18.9 7 20 7ZM24 10.43C24 9.62 23.52 8.9 22.78 8.58C21.93 8.21 20.99 8 20 8C19.61 8 19.24 8.04 18.87 8.1C19.27 8.78 19.5 9.56 19.5 10.39V12H24V10.43ZM16.24 7.65C15.07 7.13 13.63 6.75 12 6.75C10.37 6.75 8.93 7.14 7.76 7.65C6.68 8.13 6 9.21 6 10.39V12H18V10.39C18 9.21 17.32 8.13 16.24 7.65ZM8.07 10C8.16 9.77 8.2 9.61 8.98 9.31C9.95 8.93 10.97 8.75 12 8.75C13.03 8.75 14.05 8.93 15.02 9.31C15.79 9.61 15.83 9.77 15.93 10H8.07ZM12 2C12.55 2 13 2.45 13 3C13 3.55 12.55 4 12 4C11.45 4 11 3.55 11 3C11 2.45 11.45 2 12 2ZM12 0C10.34 0 9 1.34 9 3C9 4.66 10.34 6 12 6C13.66 6 15 4.66 15 3C15 1.34 13.66 0 12 0Z"
        fill="#6100FF"
      />
    </svg>
  )
}

export function CommunityIcon({ height = 24, width = 24, ...rest }: IconProps) {
  return (
    <svg
      fill="none"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <g clipPath="url(#clip0_4907_3381)">
        <path
          d="M18 11C18 11.67 18 12.33 18 13C19.2 13 20.76 13 22 13C22 12.33 22 11.67 22 11C20.76 11 19.2 11 18 11Z"
          fill="#B53606"
        />
        <path
          d="M16 17.61C16.96 18.32 18.21 19.26 19.2 20C19.6 19.47 20 18.93 20.4 18.4C19.41 17.66 18.16 16.72 17.2 16C16.8 16.54 16.4 17.08 16 17.61Z"
          fill="#B53606"
        />
        <path
          d="M20.4 5.6C20 5.07 19.6 4.53 19.2 4C18.21 4.74 16.96 5.68 16 6.4C16.4 6.93 16.8 7.47 17.2 8C18.16 7.28 19.41 6.35 20.4 5.6Z"
          fill="#B53606"
        />
        <path
          d="M4 9C2.9 9 2 9.9 2 11V13C2 14.1 2.9 15 4 15H5V19H7V15H8L13 18V6L8 9H4ZM9.03 10.71L11 9.53V14.47L9.03 13.29L8.55 13H8H4V11H8H8.55L9.03 10.71Z"
          fill="#B53606"
        />
        <path
          d="M15.5 11.9999C15.5 10.6699 14.92 9.4699 14 8.6499V15.3399C14.92 14.5299 15.5 13.3299 15.5 11.9999Z"
          fill="#B53606"
        />
        <path
          d="M9.03 10.7098L11 9.52979V14.4698L9.03 13.2898L8.55 12.9998H8H4V10.9998H8H8.55L9.03 10.7098Z"
          fill="#B53606"
          opacity="0.3"
        />
      </g>
      <defs>
        <clipPath id="clip0_4907_3381">
          <rect fill="white" height={height} width={width} />
        </clipPath>
      </defs>
    </svg>
  )
}

export function BillsIcon({ height = 24, width = 24, ...rest }: IconProps) {
  return (
    <svg
      fill="none"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <g clipPath="url(#clip0_4907_3401)">
        <g opacity="0.3">
          <path
            d="M11.3399 9.75988L9.92995 8.33988C8.97995 7.39988 7.72995 6.87988 6.38995 6.87988C5.75995 6.87988 5.13995 6.99988 4.56995 7.21988L5.60995 8.25988H7.88995V10.3999C8.28995 10.6299 8.74995 10.7499 9.21995 10.7499C9.94995 10.7499 10.6299 10.4699 11.1399 9.94988L11.3399 9.75988Z"
            fill="#047043"
          />
        </g>
        <g opacity="0.3">
          <path
            d="M11 6.62L17 12.59V14H15.59L12.76 11.17L12.56 11.37C12.1 11.83 11.57 12.17 11 12.4V15H17V17C17 17.55 17.45 18 18 18C18.55 18 19 17.55 19 17V6H11V6.62Z"
            fill="#047043"
          />
        </g>
        <path
          d="M8.99994 4V5.38C8.16994 5.05 7.27994 4.88 6.38994 4.88C4.59994 4.88 2.80994 5.56 1.43994 6.93L4.76994 10.26H5.87994V11.37C6.73994 12.23 7.85994 12.68 8.98994 12.73V15H5.99994V18C5.99994 19.1 6.89994 20 7.99994 20H17.9999C19.6599 20 20.9999 18.66 20.9999 17V4H8.99994ZM7.88994 10.41V8.26H5.60994L4.56994 7.22C5.13994 7 5.75994 6.88 6.38994 6.88C7.72994 6.88 8.97994 7.4 9.92994 8.34L11.3399 9.75L11.1399 9.95C10.6299 10.46 9.94994 10.75 9.21994 10.75C8.74994 10.75 8.28994 10.63 7.88994 10.41ZM18.9999 17C18.9999 17.55 18.5499 18 17.9999 18C17.4499 18 16.9999 17.55 16.9999 17V15H10.9999V12.41C11.5699 12.18 12.0999 11.84 12.5599 11.38L12.7599 11.18L15.5899 14H16.9999V12.59L10.9999 6.62V6H18.9999V17Z"
          fill="#047043"
        />
      </g>
      <defs>
        <clipPath id="clip0_4907_3401">
          <rect fill="white" height={height} width={width} />
        </clipPath>
      </defs>
    </svg>
  )
}

export function ResourcesIcon({ height = 24, width = 24, ...rest }: IconProps) {
  return (
    <svg
      fill="none"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <g clipPath="url(#clip0_4907_3414)">
        <path
          d="M13 4H6V20H18V9H13V4ZM16 18H8V16H16V18ZM16 12V14H8V12H16Z"
          fill="#004BEB"
          opacity="0.3"
        />
        <path
          d="M8 16H16V18H8V16ZM8 12H16V14H8V12ZM14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"
          fill="#004BEB"
        />
      </g>
      <defs>
        <clipPath id="clip0_4907_3414">
          <rect fill="white" height={height} width={width} />
        </clipPath>
      </defs>
    </svg>
  )
}

export function DonateIcon({ height = 24, width = 24, ...rest }: IconProps) {
  return (
    <svg
      fill="none"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <g clipPath="url(#clip0_4907_3427)">
        <path
          d="M18 6H6C4.89 6 4 6.89 4 8V16C4 17.11 4.89 18 6 18H18C19.11 18 20 17.11 20 16V8C20 6.89 19.11 6 18 6ZM18 16H6V8H18V16Z"
          fill="#FF6200"
        />
        <path
          d="M13 4H11V6H13V4ZM13 8H11V16H13V8ZM9 4H7V6H9V4ZM9 8H7V16H9V8ZM15 4H17V6H15V4ZM15 8H17V16H15V8Z"
          fill="#FF6200"
          opacity="0.3"
        />
      </g>
      <defs>
        <clipPath id="clip0_4907_3427">
          <rect fill="white" height={height} width={width} />
        </clipPath>
      </defs>
    </svg>
  )
}

export function AdvocacyToolkitIcon({ height = 24, width = 24, ...rest }: IconProps) {
  return (
    <svg
      fill="none"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <g clipPath="url(#clip0_5059_2327)">
        <path
          d="M12 4C7.59 4 4 7.59 4 12C4 16.41 7.59 20 12 20C16.41 20 20 16.41 20 12C20 7.59 16.41 4 12 4Z"
          fill="#952785"
          opacity="0.3"
        />
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
          fill="#952785"
        />
        <path
          d="M12.6798 7.75984C11.5698 6.64984 9.88984 6.45984 8.57984 7.16984L10.9298 9.51984L9.51984 10.9298L7.16984 8.57984C6.45984 9.89984 6.64984 11.5698 7.75984 12.6798C8.73984 13.6598 10.1598 13.9198 11.3798 13.4898L14.7898 16.8998C14.9898 17.0998 15.2998 17.0998 15.4998 16.8998L16.8998 15.4998C17.0998 15.2998 17.0998 14.9898 16.8998 14.7898L13.4898 11.3798C13.9198 10.1498 13.6598 8.73984 12.6798 7.75984Z"
          fill="#952785"
        />
      </g>
      <defs>
        <clipPath id="clip0_5059_2327">
          <rect fill="white" height={height} width={width} />
        </clipPath>
      </defs>
    </svg>
  )
}
