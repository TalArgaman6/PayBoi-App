import { formatTokenBalance } from '../lib/format.js'
import { TokenMark } from './TokenMark.jsx'
import {
  useBalance,
  useCounting,
  earnOver,
  spendOver,
  getFiat,
} from '../lib/balance.js'

/*
 * What a tap on either figure moves. The balance is the one number on the
 * card, so pressing it is the shortest possible top-up — no sheet, no amount
 * to pick, just a thousand rolling up the way a spend rolls down, and the
 * shekel line beside it takes the same thousand back.
 */
const TOP_UP = 1000

export function WalletCard({ wallet }) {
  // Read live rather than taken from the json, so a deal that goes through
  // on another screen is already counted when the wallet comes back up.
  const balance = useBalance()
  // Lit while the figure is walking down after a deal, so the roll reads as
  // something happening rather than as a number that can't make its mind up.
  const counting = useCounting()

  return (
    <article className="pay-card" aria-label="Peacock card">
      <div className="pay-card-foot">
        <p className={`token-balance${counting ? ' is-counting' : ''}`}>
          {/* The mark in place of the word. "pck" beside the figure was the
              unit spelled out; the eye is the unit, and on a card whose whole
              job is to be looked at, the drawn mark carries it. Painted as a
              mask so it takes the balance's own colour — which flips to ink
              on the bone ground, and would have left a white glyph stranded
              there. */}
          <TokenMark className="is-balance" />
          <span className="token-amount">
            <button
              type="button"
              className="token-top-up"
              onClick={() => earnOver(TOP_UP, 1500, 'Transfer in')}
              aria-label={`Add ${TOP_UP} ${wallet.token}`}
            >
              {formatTokenBalance(balance)}
            </button>
            {/* And what a tap on the shekel line does: takes the same
                thousand back off. The pair is a till with one step in each
                direction, so any balance on the ladder can be walked to
                without editing the json. */}
            <button
              type="button"
              className="fiat-balance token-top-up"
              onClick={() => spendOver(TOP_UP, 1500, 'Transfer out')}
              aria-label={`Take ${TOP_UP} ${wallet.token} off`}
            >
              ₪{getFiat().toLocaleString('en-US')}
            </button>
          </span>
        </p>
      </div>
    </article>
  )
}
