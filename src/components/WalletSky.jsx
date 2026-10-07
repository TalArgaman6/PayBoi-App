function unit(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function buildStars(count, salt, kind) {
  return Array.from({ length: count }, (_, i) => {
    const a = unit(i + 1 + salt)
    const b = unit(i + 19 + salt * 3.1)
    const c = unit(i + 37 + salt * 7.7)
    const d = unit(i + 53 + salt * 13.3)
    const e = unit(i + 71 + salt * 19.1)
    const size =
      kind === 'near'
        ? 7 + a * 9
        : kind === 'glow'
          ? 5 + a * 8
          : kind === 'star'
            ? 1.8 + a * 2.2
            : 1 + a * 1.1
    const travel = kind === 'near' ? 1.15 : kind === 'glow' ? 0.9 : kind === 'star' ? 1 : 0.55
    const opacity =
      kind === 'near'
        ? 0.55 + c * 0.4
        : kind === 'glow'
          ? 0.3 + c * 0.35
          : kind === 'star'
            ? 0.6 + c * 0.4
            : 0.4 + c * 0.45

    return {
      id: `${kind}-${i}`,
      x: a * 100,
      y: b * 100,
      size,
      opacity,
      blur: kind === 'near' ? 0.6 : kind === 'glow' ? 1.6 + a * 1.4 : 0,
      dur: (kind === 'near' ? 5.5 : kind === 'glow' ? 8 : kind === 'star' ? 6.5 : 11) + d * 3,
      delay: -e * 14,
      shine: (kind === 'near' ? 1.7 : kind === 'star' ? 2.1 : kind === 'glow' ? 3.4 : 4.6) + a * 1.8,
      shineDelay: -b * 6,
      dim: opacity * (kind === 'dust' ? 0.45 : 0.2),
      bright: Math.min(1, opacity + (kind === 'dust' ? 0.2 : 0.55)),
      dx: (c - 0.5) * 72 * travel,
      dy: (d - 0.5) * 58 * travel,
    }
  })
}

const DUST = buildStars(70, 2.4, 'dust')
const GLOW = buildStars(12, 15.2, 'glow')
const STARS = buildStars(40, 8.6, 'star')
const NEAR = buildStars(8, 21.4, 'near')

function SpeckLayer({ name, specks }) {
  return (
    <div className={`wallet-dust wallet-dust-${name}`}>
      {specks.map((speck) => (
        <span
          key={speck.id}
          className="wallet-speck"
          style={{
            left: `${speck.x}%`,
            top: `${speck.y}%`,
            '--dur': `${speck.dur}s`,
            '--delay': `${speck.delay}s`,
            '--shine': `${speck.shine}s`,
            '--shine-delay': `${speck.shineDelay}s`,
            '--dim': speck.dim,
            '--bright': speck.bright,
            '--dx': `${speck.dx}px`,
            '--dy': `${speck.dy}px`,
          }}
        >
          <i
            style={{
              width: speck.size,
              height: speck.size,
              opacity: speck.opacity,
              filter: speck.blur ? `blur(${speck.blur}px)` : undefined,
            }}
          />
        </span>
      ))}
    </div>
  )
}

export function WalletSky() {
  return (
    <div className="wallet-wash" aria-hidden="true">
      <div className="wallet-sky">
        <div className="wallet-field">
          <div className="wallet-plane wallet-plane-far" />
          <div className="wallet-plane wallet-plane-mid" />
          <div className="wallet-plane wallet-plane-near" />
          <SpeckLayer name="dust" specks={DUST} />
          <SpeckLayer name="glow" specks={GLOW} />
          <SpeckLayer name="star" specks={STARS} />
          <SpeckLayer name="near" specks={NEAR} />
        </div>
      </div>
    </div>
  )
}
