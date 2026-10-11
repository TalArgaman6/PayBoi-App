import { assetUrl } from '../lib/format.js'

export function PboiLogo() {
  return (
    <img className="pboi-logo" src={assetUrl('pboi-logo.png')} alt="pboi" />
  )
}
