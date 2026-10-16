import { assetUrl } from '../lib/format.js'

/*
 * The wait on a payment. The eye off the feather — the same drawing the peck
 * button carries — breathing rather than turning.
 *
 * A spinner was tried twice before this: a plain ring, which said nothing,
 * and the whole curled feather, which at this size is a hundred hairlines
 * and turned itself into shimmer. The eye is three closed shapes and no fine
 * line anywhere in it, so it stays clean at any size, and a slow pulse reads
 * as waiting just as plainly as a rotation does without asking the artwork to
 * survive being spun.
 *
 * Painted as a mask, so the colour comes from the sheet it is standing on.
 *
 * Shared, because both sides of a deal wait — the buyer in the detail sheet
 * and the seller answering a request in the feed.
 */
export function Spinner() {
  return (
    <span className="spinner" aria-hidden="true">
      <span
        className="spinner-eye"
        style={{ '--icon': `url("${assetUrl('brand/peck-feather.png')}")` }}
      />
    </span>
  )
}
