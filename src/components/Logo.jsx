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
// tinted the same way later. Kept for anywhere still pointing at the old art.
export function PeacockLogo() {
  return (
    <img className="peacock-logo" src={assetUrl('peacock-logo.png')} alt="Peacock" />
  )
}

/*
 * The crest, three feathers leaning into a gale. Drawn once here and shared by
 * both lockups rather than duplicated, so the lean only has to be tuned in one
 * place. It inherits `fill` from the <g> each lockup wraps it in.
 */
function CrestFeathers() {
  return (
    <g transform="rotate(-18 18 26)">
      <path d="M18 26c-.5-4.2-.6-8.2-.2-12.1h1.2c.4 3.9.3 7.9-.2 12.1z" />
      <path d="M14.4 26c-1.9-3.8-3.3-7.4-4.2-11l1.1-.4c1.5 3.6 2.6 7.3 3.4 11.4z" />
      <path d="M21.6 26c1.9-3.8 3.3-7.4 4.2-11l-1.1-.4c-1.5 3.6-2.6 7.3-3.4 11.4z" />
      <g transform="translate(18 8.6) rotate(-15)">
        <path d="M0-6.2C1.7-4 3.4-2.4 3.4.3 3.4 3 1.9 4.8 0 4.8-1.9 4.8-3.4 3-3.4.3-3.4-2.4-1.7-4 0-6.2Z" />
      </g>
      <g transform="translate(8.6 10.3) rotate(-40)">
        <path d="M0-6.2C1.7-4 3.4-2.4 3.4.3 3.4 3 1.9 4.8 0 4.8-1.9 4.8-3.4 3-3.4.3-3.4-2.4-1.7-4 0-6.2Z" />
      </g>
      <g transform="translate(27.4 10.3) rotate(7)">
        <path d="M0-6.2C1.7-4 3.4-2.4 3.4.3 3.4 3 1.9 4.8 0 4.8-1.9 4.8-3.4 3-3.4.3-3.4-2.4-1.7-4 0-6.2Z" />
      </g>
    </g>
  )
}

/*
 * Horizontal lockup — the mark tucked into the shoulder of the P. Written as
 * inline SVG rather than loaded from public/brand/pck-crest-lockup.svg because
 * a webfont never loads inside an SVG referenced as <img src>, and the wordmark
 * has to be the same Cormorant Garamond as the screen titles beside it.
 */
export function CrestLockup({ className = 'header-lockup' }) {
  return (
    <svg className={className} viewBox="0 0 106 36" role="img" aria-label="PCK">
      {/* Sat on the wordmark's baseline, not floating over it. The crest is
          drawn with its stems ending at y=26 and the gale rotation swings the
          outermost one down to about y=32, so a y-offset of 0 brings that
          lowest stem to the text's baseline at y=27 — the feathers stand on
          the same line the letters do. */}
      <g className="lockup-crest" transform="translate(8 0)" fill="currentColor">
        <CrestFeathers />
      </g>
      <text
        x="40"
        y="27"
        fill="currentColor"
        fontSize="30"
        fontWeight="600"
        letterSpacing="0.9"
      >
        PCK
      </text>
    </svg>
  )
}

/*
 * Vertical lockup — crest centred over the wordmark. Same construction and the
 * same reason for being inline; the splash is the one place with room for it.
 */
export function CrestStack({ className = 'splash-lockup' }) {
  return (
    <svg className={className} viewBox="0 0 96 69" role="img" aria-label="PCK">
      <g transform="translate(30 2)" fill="currentColor">
        <CrestFeathers />
      </g>
      {/* The gale swings the lowest stem to about y=34 and the cap of a 36-unit
          Cormorant sits 23.8 above its baseline, so a baseline of 63 leaves
          roughly five units of air between the feathers and the letters. The
          viewBox ends just under the baseline to match. */}
      <text
        x="48"
        y="63"
        fill="currentColor"
        textAnchor="middle"
        fontSize="36"
        fontWeight="600"
        letterSpacing="1.08"
      >
        PCK
      </text>
    </svg>
  )
}
