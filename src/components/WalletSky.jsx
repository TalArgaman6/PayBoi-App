function unit(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function buildCoins(count, salt, kind) {
  return Array.from({ length: count }, (_, i) => {
    const a = unit(i + 1 + salt)
    const b = unit(i + 19 + salt * 3.1)
    const c = unit(i + 37 + salt * 7.7)
    const d = unit(i + 53 + salt * 13.3)
    const e = unit(i + 71 + salt * 19.1)
    const alongBrush = c > 0.34
    const x = alongBrush ? 58 + a * 40 : 18 + a * 70
    const y = 11 + b * 9
    const dab = kind !== 'haze' && e > 0.48
    const size =
      kind === 'haze' ? 22 + a * 18 : kind === 'coin' ? 11 + a * 10 : 4 + a * 3
    const travel = kind === 'coin' ? 0.7 : kind === 'haze' ? 0.25 : 0.4

    return {
      id: `${kind}-${i}`,
      x,
      y,
      w: dab ? size * 2.1 : size,
      h: dab ? size * 0.62 : size * (0.72 + e * 0.4),
      rot: e * 140 - 70,
      dab,
      opacity: kind === 'haze' ? 0.28 + c * 0.28 : 0.55 + c * 0.4,
      blur: kind === 'haze' ? 2.4 : kind === 'coin' ? 0.4 : 0.2,
      dur: (kind === 'haze' ? 18 : kind === 'coin' ? 12 : 16) + d * 10,
      delay: -e * 20,
      dx: (c - 0.5) * 14 * travel,
      dy: -(4 + d * 12) * travel,
    }
  })
}

const HAZE = buildCoins(5, 4.2, 'haze')
const COINS = buildCoins(14, 8.6, 'coin')
const FAR = buildCoins(10, 2.4, 'far')

function SpeckLayer({ name, specks }) {
  return (
    <div className={`wallet-dust wallet-dust-${name}`}>
      {specks.map((speck) => (
        <span
          key={speck.id}
          className={speck.dab ? 'wallet-speck is-dab' : 'wallet-speck'}
          style={{
            left: `${speck.x}%`,
            top: `${speck.y}%`,
            '--dur': `${speck.dur}s`,
            '--delay': `${speck.delay}s`,
            '--dx': `${speck.dx}px`,
            '--dy': `${speck.dy}px`,
          }}
        >
          <i
            style={{
              width: speck.w,
              height: speck.h,
              opacity: speck.opacity,
              transform: `rotate(${speck.rot}deg)`,
              filter: `blur(${speck.blur}px)`,
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
      <div className="wallet-wash-blur" />
      <div className="wallet-rainbow" />
      <div className="wallet-gold-brush" />
      <div className="wallet-sky">
        <div className="wallet-field">
          <SpeckLayer name="haze" specks={HAZE} />
          <SpeckLayer name="far" specks={FAR} />
          <SpeckLayer name="coin" specks={COINS} />
        </div>
      </div>
    </div>
  )
}
