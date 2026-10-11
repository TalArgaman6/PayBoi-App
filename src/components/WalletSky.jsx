import { assetUrl } from '../lib/format.js'

export function WalletSky() {
  return (
    <div className="wallet-wash" aria-hidden="true">
      <img className="wallet-opal" src={assetUrl('wallet-crystal.png?v=darkfacets-nogleam')} alt="" />
    </div>
  )
}
