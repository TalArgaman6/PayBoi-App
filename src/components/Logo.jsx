import { assetUrl } from '../lib/format.js'

// The logo art is pure white on transparent, so it doubles as its own mask.
// `tinted` swaps the <img> for a masked box that takes `currentColor`,
// which lets CSS recolor the mark without a second asset.
export function PboiLogo({ tinted = false }) {
  if (tinted) {
    return (
      <span
        className="pboi-logo is-tinted"
        style={{ '--logo': `url("${assetUrl('pboi-logo.png')}")` }}
        role="img"
        aria-label="Peacock"
      />
    )
  }

  return (
    <img className="pboi-logo" src={assetUrl('pboi-logo.png')} alt="Peacock" />
  )
}

// The peacock mark — white on transparent like the wordmark, so it can be
// tinted the same way later. For now it only stands in the screen headers.
export function PeacockLogo() {
  return (
    <img className="peacock-logo" src={assetUrl('peacock-logo.png')} alt="Peacock" />
  )
}
