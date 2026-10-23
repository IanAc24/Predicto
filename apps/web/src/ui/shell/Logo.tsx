import { cx } from '../../lib/cx'

/** Three rising bars with a trend arrow. Colours come from the theme tokens (see index.css). */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cx('logo', className)}
      viewBox="10 7 124 124"
      aria-hidden="true"
      focusable="false"
    >
      <rect className="logo-bar logo-bar-1" x="30" y="94" width="20" height="28" rx="10" />
      <rect className="logo-bar logo-bar-2" x="58" y="74" width="20" height="48" rx="10" />
      <rect className="logo-bar logo-bar-3" x="86" y="62" width="20" height="60" rx="10" />
      <path
        className="logo-line"
        d="M24 62 L50 44 L70 54 L106 24"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="logo-arrow"
        d="M93 24 L106 24 L106 37"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
