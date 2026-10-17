import { CrestLockup } from './Logo.jsx'

export function ScreenHeader({
  title,
  kicker,
  pin = false,
  // The wallet carries the mark beside its balance, a thumb's width below —
  // a second one in the corner is the same drawing twice on one screen. Its
  // header takes the letters alone, on the same baseline and cap height.
  bareMark = false,
  onLogo = null,
  onTitle = null,
}) {
  return (
    <header className="screen-header">
      <div className="screen-header-copy">
        {/* The two ends of the header are the two directions through the
            backdrops — the name steps back, the mark steps on. Wrapped in a
            button rather than given a click handler so it is reachable from
            the keyboard and announces itself. */}
        {onTitle ? (
          <button
            type="button"
            className="header-title-btn"
            onClick={onTitle}
            aria-label="Previous backdrop"
          >
            <h1>{title}</h1>
          </button>
        ) : (
          <h1>{title}</h1>
        )}
        {kicker ? (
          <p>
            {pin ? <LocationPin /> : null}
            {kicker}
          </p>
        ) : null}
      </div>
      {/* The mark is decoration everywhere except where a screen hands it a
          job — the wallet uses it to flick between backdrops while we're
          still choosing one. */}
      {onLogo ? (
        <button
          type="button"
          className="header-logo-btn"
          onClick={onLogo}
          aria-label="Change backdrop"
        >
          <CrestLockup bare={bareMark} />
        </button>
      ) : (
        <CrestLockup bare={bareMark} />
      )}
    </header>
  )
}

export function LocationPin() {
  return (
    <svg className="kicker-pin" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 1.4a4.4 4.4 0 0 0-4.4 4.4c0 3.1 4.4 8.4 4.4 8.4s4.4-5.3 4.4-8.4A4.4 4.4 0 0 0 8 1.4zm0 6a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2z"
      />
    </svg>
  )
}
