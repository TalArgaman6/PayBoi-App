import { ilsAmount } from '../lib/format.js'
import { TokenMark } from './TokenMark.jsx'

/*
 * A price in both currencies. The shekel side already carries its symbol in
 * front of the figure; the pck side used to carry its name behind it, which
 * made the two halves of one price read in two different ways. The mark goes
 * where the symbol goes.
 */
export function Cost({ item }) {
  return (
    <span className="cost">
      ₪{ilsAmount(item)} /<TokenMark />
      {item?.pricePbs ?? 0}
    </span>
  )
}
