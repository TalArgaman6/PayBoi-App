import { PboiLogo } from './Logo.jsx'
import { RemixNowPlaying } from './RemixPlayer.jsx'

export function ScreenHeader({ title, kicker, pin = false, remix = false }) {
  return (
    <header className={`screen-header${remix ? ' has-remix' : ''}`}>
      <div className="screen-header-copy">
        <h1>{title}</h1>
        {kicker ? (
          <p>
            {pin ? <LocationPin /> : null}
            {kicker}
          </p>
        ) : null}
      </div>
      {remix ? <RemixNowPlaying /> : null}
      <PboiLogo />
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
