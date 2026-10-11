import { assetUrl } from '../lib/format.js'

/*
 * Six renders of the same crystal, each lit from a key light 60 degrees
 * further around the circle. Crossfading between them moves the light source
 * rather than sliding a highlight over a static picture: individual triangles
 * brighten and fall off as the source swings, and because the lights ring the
 * full circle the highlight can travel anywhere. App.css does the weighting.
 */
const LIGHT_FRAMES = [
  'wallet-crystal-1.webp?v=facet4',
  'wallet-crystal-2.webp?v=facet4',
  'wallet-crystal-3.webp?v=facet4',
  'wallet-crystal-4.webp?v=facet4',
  'wallet-crystal-5.webp?v=facet4',
  'wallet-crystal-6.webp?v=facet4',
]

/*
 * Masks cut to the crystal's own facets. Each holds a handful of whole,
 * separate panes, so fading one in lights those panes and nothing else —
 * the light picks out pieces of the puzzle rather than sweeping across it.
 * The cycle lengths share no common factor, so which combination is lit at
 * any moment keeps changing instead of looping.
 */
const SHARDS = [
  { dur: '19s', delay: '-2s', peak: 0.42 },
  { dur: '23s', delay: '-9s', peak: 0.34 },
  { dur: '29s', delay: '-16s', peak: 0.46 },
  { dur: '31s', delay: '-25s', peak: 0.3 },
  { dur: '37s', delay: '-6s', peak: 0.4 },
  { dur: '41s', delay: '-31s', peak: 0.36 },
  { dur: '43s', delay: '-13s', peak: 0.44 },
  { dur: '47s', delay: '-38s', peak: 0.32 },
]

export function WalletSky() {
  return (
    <div className="wallet-wash" aria-hidden="true">
      {LIGHT_FRAMES.map((frame, index) => (
        <img
          key={frame}
          className={`wallet-opal wallet-opal-${index + 1}`}
          src={assetUrl(frame)}
          alt=""
          loading="eager"
          decoding="async"
        />
      ))}
      {SHARDS.map((shard, index) => (
        <span
          key={index}
          className="wallet-shard"
          style={{
            '--shard': `url("${assetUrl(`wallet-shard-${index + 1}.png?v=1`)}")`,
            '--dur': shard.dur,
            '--delay': shard.delay,
            '--peak': shard.peak,
          }}
        />
      ))}
    </div>
  )
}
