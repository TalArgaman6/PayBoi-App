import { formatTokenBalance } from '../lib/format.js'

export function WalletCard({ wallet }) {
  return (
    <article className="pay-card" aria-label="pboi card">
      <div className="pay-card-glow" aria-hidden="true" />
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
