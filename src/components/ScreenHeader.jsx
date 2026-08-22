import { PboiLogo } from './Logo.jsx'
import { RemixNowPlaying } from './RemixPlayer.jsx'

export function ScreenHeader({ title, kicker, remix = false }) {
  return (
    <header className={`screen-header${remix ? ' has-remix' : ''}`}>
      <div className="screen-header-copy">
        <h1>{title}</h1>
        {kicker ? <p>{kicker}</p> : null}
      </div>
      {remix ? <RemixNowPlaying /> : null}
      <PboiLogo />
    </header>
  )
}
