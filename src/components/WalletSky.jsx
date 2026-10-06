function unit(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function buildSpecks(count, salt, kind, band = 'all') {
  return Array.from({ length: count }, (_, i) => {
    const a = unit(i + 1 + salt)
    const b = unit(i + 19 + salt * 3.1)
    const c = unit(i + 37 + salt * 7.7)
    const d = unit(i + 53 + salt * 13.3)
    const e = unit(i + 71 + salt * 19.1)
    const y =
      band === 'sky' ? b * 46 : band === 'low' ? 42 + b * 58 : b * 100
    const chip = (kind === 'near' || kind === 'glow') && c > 0.62
    const size =
      kind === 'far'
        ? 1.4 + a * 1.8
        : kind === 'mid'
          ? 2.6 + a * 2.4
          : kind === 'glow'
            ? 9 + a * 10
            : 5 + a * 5
    const travel = kind === 'near' ? 1 : kind === 'glow' ? 0.45 : kind === 'mid' ? 0.6 : 0.28

    return {
      id: `${kind}-${band}-${i}`,
      x: a * 100,
      y,
      w: chip ? size * (kind === 'glow' ? 1.7 : 1.85) : size,
      h: chip ? size * (kind === 'glow' ? 0.55 : 0.58) : size,
      rot: e * 170 - 85,
      chip,
      opacity:
        kind === 'far'
          ? 0.45 + c * 0.5
          : kind === 'glow'
            ? 0.35 + c * 0.3
            : kind === 'mid'
              ? 0.7 + c * 0.3
              : 0.9,
      blur: kind === 'glow' ? 1.4 + a * 1.8 : kind === 'far' && c > 0.7 ? 0.5 : 0,
      dur: (kind === 'far' ? 20 : kind === 'glow' ? 16 : kind === 'mid' ? 13 : 9) + d * 12,
      delay: -e * 24,
      dx: (c - 0.5) * 22 * travel,
      dy: -(8 + d * 26) * travel,
    }
  })
}

const FAR = [...buildSpecks(90, 2.2, 'far', 'sky'), ...buildSpecks(70, 3.6, 'far')]
const MID = [...buildSpecks(22, 5.8, 'mid', 'sky'), ...buildSpecks(18, 6.4, 'mid', 'low')]
const GLOW = [...buildSpecks(6, 15.1, 'glow', 'sky'), ...buildSpecks(5, 16.4, 'glow', 'low')]
const NEAR = [...buildSpecks(7, 9.4, 'near', 'sky'), ...buildSpecks(8, 11.2, 'near', 'low')]

function SpeckLayer({ name, specks }) {
  return (
    <div className={`wallet-dust wallet-dust-${name}`}>
      {specks.map((speck) => (
        <span
          key={speck.id}
          className={speck.chip ? 'wallet-speck is-chip' : 'wallet-speck'}
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
      <div className="wallet-wash-blur" />
      <div className="wallet-beam" />
      <div className="wallet-sky">
        <div className="wallet-field">
          <SpeckLayer name="far" specks={FAR} />
          <SpeckLayer name="mid" specks={MID} />
          <SpeckLayer name="glow" specks={GLOW} />
          <SpeckLayer name="near" specks={NEAR} />
        </div>
      </div>
    </div>
  )
}
