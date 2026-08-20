import { formatTokenBalance } from '../lib/format.js'
import { PboiLogo } from './Logo.jsx'

export function WalletCard({ wallet }) {
  return (
    <article className="pay-card" aria-label="pboi card">
      <div className="pay-card-glow" aria-hidden="true" />
      <header className="pay-card-top">
        <PboiLogo />
      </header>
      <div className="pay-card-foot">
        <p className="token-balance">
          <small>{wallet.token}</small>
          {formatTokenBalance(wallet.balance)}
        </p>
        <p className="fiat-balance">
          ₪{wallet.fiat.toLocaleString('en-US')}
        </p>
      </div>
    </article>
  )
}
