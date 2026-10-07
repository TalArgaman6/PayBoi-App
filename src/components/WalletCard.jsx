import { formatTokenBalance } from '../lib/format.js'

export function WalletCard({ wallet }) {
  return (
    <article className="pay-card" aria-label="pboi card">
      <div className="pay-card-foot">
        <p className="token-balance">
          <small>{wallet.token}</small>
          <span className="token-amount">
            {formatTokenBalance(wallet.balance)}
            <span className="fiat-balance">
              ₪{wallet.fiat.toLocaleString('en-US')}
            </span>
          </span>
        </p>
      </div>
    </article>
  )
}
