import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/** Original line icons drawn to match Airbnb's current 32×32 stroke language. */

export function AirbnbMark({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true" {...props}>
      <path d="M16 1.5c-2.1 0-3.9 1.2-4.7 3.1-.3.6-.9 2.3-.9 2.3S8.8 5.2 7.2 5.2C4.2 5.2 2 7.6 2 10.8c0 5.3 6.2 11.4 14 19.2 7.8-7.8 14-13.9 14-19.2 0-3.2-2.2-5.6-5.2-5.6-1.6 0-3.2 1.7-3.2 1.7s-.6-1.7-.9-2.3C19.9 2.7 18.1 1.5 16 1.5zm0 8.3c1.7 0 3.1 1.5 3.1 3.3S17.7 16.4 16 16.4s-3.1-1.5-3.1-3.3 1.4-3.3 3.1-3.3z" />
    </svg>
  );
}

export function SearchGlyph({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true" {...props}>
      <circle cx="14" cy="14" r="8.5" stroke="currentColor" strokeWidth="2.5" />
      <path d="M20.5 20.5 27 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function GlobeIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 .5A7.5 7.5 0 1 0 8 15.5 7.5 7.5 0 0 0 8 .5ZM1.7 8a6.3 6.3 0 0 1 5-6.2v.7c0 .6.2 1 .5 1.3.3.2.8.3 1.5.3h.3v1.2c0 .5.2.8.5 1 .2.2.6.3 1.1.3h.4v.4c0 .7.2 1.2.5 1.6.4.4 1 .6 1.7.6h.3v.9A6.3 6.3 0 0 1 1.7 8Zm12.4 1.6v-.4h-.6c-.5 0-.8-.1-1-.4-.2-.2-.3-.5-.3-.9V7.4h-.6c-.7 0-1.2-.2-1.5-.5-.3-.4-.5-.9-.5-1.5V4.8h-.4c-.5 0-.8-.1-1-.3-.3-.3-.4-.7-.4-1.2v-.9A6.3 6.3 0 0 1 14.1 9.6Z" />
    </svg>
  );
}

export function HamburgerIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true" {...props}>
      <path d="M4 10h24M4 16h24M4 22h24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ProfileIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16 0a16 16 0 1 0 0 32 16 16 0 0 0 0-32Zm0 4.8a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 22.6a13.4 13.4 0 0 1-9.4-3.8 10.4 10.4 0 0 1 18.8 0A13.4 13.4 0 0 1 16 27.4Z" />
    </svg>
  );
}

export function StarIcon({ className, filled = true, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill={filled ? 'currentColor' : 'none'} aria-hidden="true" {...props}>
      <path
        d="M5.94.54 7.4 4.02l3.73.32a.3.3 0 0 1 .17.53L8.5 7.37l.9 3.64a.3.3 0 0 1-.45.33L6 9.4l-2.95 1.94a.3.3 0 0 1-.45-.33l.9-3.64L.2 4.87a.3.3 0 0 1 .17-.53l3.73-.32L5.56.54a.3.3 0 0 1 .38 0Z"
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1}
      />
    </svg>
  );
}

export function ShareIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="23" cy="7" r="3.2" />
        <circle cx="9" cy="16" r="3.2" />
        <circle cx="23" cy="25" r="3.2" />
        <path d="m12 14.4 6.6-5.2M12 17.6 18.6 22.8" />
      </g>
    </svg>
  );
}

export function HeartIcon({ className, filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill={filled ? 'currentColor' : 'none'} aria-hidden="true" {...props}>
      <path
        d="M16 28s-1.2-.9-3.2-2.5C8.4 22.3 4 18.2 4 13.2 4 9.6 6.8 7 10.2 7c2.1 0 4 1.1 5.1 2.8h.4C16.8 8.1 18.7 7 20.8 7 24.2 7 27 9.6 27 13.2c0 5-4.4 9.1-8.8 12.3C17.2 27.1 16 28 16 28Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GridDotsIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M1 1h6v6H1V1Zm8 0h6v6H9V1ZM1 9h6v6H1V9Zm8 0h6v6H9V9Z" />
    </svg>
  );
}

export function CloseIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true" {...props}>
      <path d="M6 6 26 26M26 6 6 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronLeftIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true" {...props}>
      <path d="M20 8 12 16l8 8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true" {...props}>
      <path d="m12 8 8 8-8 8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true" {...props}>
      <path d="m3 6 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SuperhostBadge({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 0 9.8 5.2 15.5 6 11.4 9.8 12.6 16 8 13.1 3.4 16l1.2-6.2L.5 6l5.7-.8L8 0Z" />
    </svg>
  );
}

export function MedalIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16 2 4 7v9c0 7.2 5.1 13.8 12 16 6.9-2.2 12-8.8 12-16V7L16 2Zm0 4.3 8 3.3v6.5c0 5.1-3.5 10-8 11.8-4.5-1.8-8-6.7-8-11.8V9.6l8-3.3Z" />
    </svg>
  );
}

export function KeyIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.6 10.4a6.4 6.4 0 1 0-3.5 11.7l.4 2.3h2.7v2.4h2.6v2.4H26v-4.4l-8.4-8.4a6.4 6.4 0 0 0 0-6Zm-6.4 6.4a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Z" />
    </svg>
  );
}

export function PinIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16 2a10 10 0 0 0-10 10c0 7.5 10 18 10 18s10-10.5 10-18A10 10 0 0 0 16 2Zm0 13.5A3.5 3.5 0 1 1 16 9a3.5 3.5 0 0 1 0 6.5Z" />
    </svg>
  );
}

export function CalendarBadgeIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M10 4V2h2.5v2H20V2h2.5v2H28v24H4V6h6Zm16 6H6v16h20V10Z" />
    </svg>
  );
}

export function FlagIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M2 1h1.5v14H2V1Zm2.5 1.2 4.1 2.3L13 1.5v8.2l-4.4 2.3-4.1-2.3V2.2Z" />
    </svg>
  );
}

export function TranslateIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4.5 1h2L9.8 10H7.6l-.6-1.8H3.7L3.1 10H1L4.5 1Zm.6 5.4h1.6L5.9 3.6 5.1 6.4ZM10 6h5v1.3h-1.9L10.8 15H9.2l2.3-7.7H10V6Z" />
    </svg>
  );
}

export function AmenityIcon({ name, className }: { name: string; className?: string }) {
  const common = className ?? 'h-6 w-6';
  switch (name) {
    case 'wifi':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M16 24.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm-6.2-5.2a8.8 8.8 0 0 1 12.4 0l-1.9 1.9a6.1 6.1 0 0 0-8.6 0l-1.9-1.9Zm-4.3-4.3a14.8 14.8 0 0 1 21 0l-1.9 1.9a12.1 12.1 0 0 0-17.2 0l-1.9-1.9ZM16 4.5a21 21 0 0 1 14.8 6.1l-1.9 1.9A18.3 18.3 0 0 0 16 7.2 18.3 18.3 0 0 0 3.1 12.5L1.2 10.6A21 21 0 0 1 16 4.5Z" />
        </svg>
      );
    case 'kitchen':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M27 3v10.5a3.5 3.5 0 0 1-3 3.46V29h-2.5V16.96a3.5 3.5 0 0 1-3-3.46V3h2.5v10.5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V3H27ZM9.5 3 12 14.5V29H9.5V16H7v13H4.5V14.5L7 3h2.5Z" />
        </svg>
      );
    case 'parking':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M16 1.5A14.5 14.5 0 1 0 30.5 16 14.5 14.5 0 0 0 16 1.5Zm0 26A11.5 11.5 0 1 1 27.5 16 11.5 11.5 0 0 1 16 27.5ZM13 10h5.2a4.6 4.6 0 0 1 0 9.2H15.5V22H13V10Zm2.5 2.3v4.6h2.7a2.3 2.3 0 0 0 0-4.6h-2.7Z" />
        </svg>
      );
    case 'pool':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M2 22.5c2.2-1.4 4.3-1.4 6.5 0s4.3 1.4 6.5 0 4.3-1.4 6.5 0 4.3 1.4 6.5 0V25c-2.2 1.4-4.3 1.4-6.5 0s-4.3-1.4-6.5 0-4.3 1.4-6.5 0-4.3-1.4-6.5 0v-2.5Zm0-5c2.2-1.4 4.3-1.4 6.5 0s4.3 1.4 6.5 0 4.3-1.4 6.5 0 4.3 1.4 6.5 0V20c-2.2 1.4-4.3 1.4-6.5 0s-4.3-1.4-6.5 0-4.3 1.4-6.5 0-4.3-1.4-6.5 0v-2.5ZM22 5.5V16h-2.5V8.2l-8.2 2.3V16H9V8.1L22 4.5v1Z" />
        </svg>
      );
    case 'hdtv':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M3 6h26v16H19.5l2 4H22v2H10v-2h.5l2-4H3V6Zm2.5 2.5v11h21v-11h-21Z" />
        </svg>
      );
    case 'washer':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M6 3h20v26H6V3Zm2.5 2.5v21h15v-21h-15ZM16 11.5A6.5 6.5 0 1 1 9.5 18 6.5 6.5 0 0 1 16 11.5Zm0 2.5a4 4 0 1 0 4 4 4 4 0 0 0-4-4ZM10 6.5h3V9h-3V6.5Z" />
        </svg>
      );
    case 'ac':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M16 2v6.2l3.2-3.2 1.8 1.8L16 12.8 10 6.8l1.8-1.8 3.2 3.2V2H16Zm0 28v-6.2l-3.2 3.2-1.8-1.8L16 19.2l6 6-1.8 1.8-3.2-3.2V30H16ZM2 16h6.2L5 12.8l1.8-1.8 6 6-6 6L5 21.2 8.2 18H2v-2Zm28 0h-6.2l3.2 3.2-1.8 1.8-6-6 6-6 1.8 1.8-3.2 3.2H30v2Z" />
        </svg>
      );
    case 'workspace':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M4 6h24v14h-9v2h4v2H9v-2h4v-2H4V6Zm2.5 2.5v9h19v-9h-19Z" />
        </svg>
      );
    case 'yard':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M16 3 3 14h4v15h7V20h4v9h7V14h4L16 3Zm0 4.2 8.5 6.6V26.5h-2V17.5h-9v9h-2V13.8L16 7.2Z" />
        </svg>
      );
    case 'fireplace':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M16 4c4 5 8 8 8 13a8 8 0 1 1-16 0c0-5 4-8 8-13Zm0 8c-2 2.4-3.5 4.2-3.5 6.5a3.5 3.5 0 0 0 7 0c0-2.3-1.5-4.1-3.5-6.5ZM4 28h24v2H4v-2Z" />
        </svg>
      );
    case 'ev':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M18.5 3 8 18h7l-1.5 11L24 14h-7L18.5 3Z" />
        </svg>
      );
    case 'alarm':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M16 3a11 11 0 0 1 11 11v7.2l2 3.3H3l2-3.3V14A11 11 0 0 1 16 3Zm0 2.5A8.5 8.5 0 0 0 7.5 14v7.5h17V14A8.5 8.5 0 0 0 16 5.5ZM12 27h8a4 4 0 0 1-8 0Z" />
        </svg>
      );
    case 'gym':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M3 12h3v8H3v-8Zm5-3h3v14H8V9Zm5 5h6v4h-6v-4Zm8-5h3v14h-3V9Zm5 3h3v8h-3v-8Z" />
        </svg>
      );
    case 'hot-tub':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M6 18h20v8a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-8Zm3.5 3.5v5.2a.8.8 0 0 0 1.6 0V21.5H13v5.2a.8.8 0 0 0 1.6 0V21.5h1.9v5.2a.8.8 0 0 0 1.6 0V21.5H20v5.2a.8.8 0 0 0 1.6 0V21.5h1.9V26a1.5 1.5 0 0 1-1.5 1.5H10A1.5 1.5 0 0 1 8.5 26v-4.5H9.5ZM12 6.5c0-1.4.8-2.2 1.8-2.2s1.7.8 1.7 2.2-.8 2.7-1.7 4.1c-.9-1.4-1.8-2.7-1.8-4.1Zm6 0c0-1.4.8-2.2 1.8-2.2s1.7.8 1.7 2.2-.8 2.7-1.7 4.1c-.9-1.4-1.8-2.7-1.8-4.1Z" />
        </svg>
      );
    case 'bbq':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M6 12h20a10 10 0 0 1-8.5 9.9V24h5v2.5h-13V24h5v-2.1A10 10 0 0 1 6 12Zm2.6-2.5h14.8l-1.4-5H10l-1.4 5Z" />
        </svg>
      );
    case 'coffee':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M6 10h16v8.5A6.5 6.5 0 0 1 15.5 25H12A6 6 0 0 1 6 19v-9Zm16 2.5h2.5A3.5 3.5 0 0 1 28 16a3.5 3.5 0 0 1-3.5 3.5H22V12.5ZM4 27.5h20V30H4v-2.5Z" />
        </svg>
      );
    case 'hair-dryer':
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <path d="M4 10h16a8 8 0 0 1 0 16H18v-5.5A4.5 4.5 0 0 0 13.5 16H4v-6Zm2.5 2.5v1H13a2 2 0 1 1 0 4H6.5v1H13a4.5 4.5 0 0 0 0-9H6.5ZM18 23.5h2a5.5 5.5 0 0 0 0-11h-2v11Z" />
        </svg>
      );
    case 'self-checkin':
      return <KeyIcon className={common} />;
    default:
      return (
        <svg viewBox="0 0 32 32" className={common} fill="currentColor" aria-hidden="true">
          <circle cx="16" cy="16" r="10" />
        </svg>
      );
  }
}
