import { PboiLogo } from './Logo.jsx'

export function ScreenHeader({ title, kicker }) {
  return (
    <header className="screen-header">
      <div>
        <h1>{title}</h1>
        {kicker ? <p>{kicker}</p> : null}
      </div>
      <PboiLogo />
    </header>
  )
}
