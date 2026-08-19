import { BrandRing } from './BrandRing.jsx'
import { PboiLogo } from './Logo.jsx'

export function ScreenHeader({ title, kicker }) {
  return (
    <header className="screen-header">
      <div>
        <h1>{title}</h1>
        {kicker ? <p>{kicker}</p> : null}
      </div>
      <div className="screen-header-brand">
        <PboiLogo />
        <BrandRing className="header-ring" />
      </div>
    </header>
  )
}
