import { useEffect } from 'react'

function clamp(value) {
  return Math.max(-1, Math.min(1, value))
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function screenAngle() {
  const angle = window.screen?.orientation?.angle
  if (typeof angle === 'number') return angle
  const legacy = window.orientation
  return typeof legacy === 'number' ? legacy : 0
}

let motionOk = false
let motionDenied = false
let pendingUnlock = null
let sensorsBound = false
let sawOrient = false
const tiltListeners = new Set()

export function needsMotionPrompt() {
  if (typeof window === 'undefined') return false
  const orient = window.DeviceOrientationEvent
  const motion = window.DeviceMotionEvent
  return Boolean(
    (orient && typeof orient.requestPermission === 'function')
    || (motion && typeof motion.requestPermission === 'function'),
  )
}

function emit(reading) {
  for (const listener of tiltListeners) listener(reading)
}

function onOrient(event) {
  if (event.gamma == null || event.beta == null) return
  if (event.type === 'deviceorientationabsolute' && sawOrient) return
  sawOrient = true
  emit({ kind: 'orient', gamma: event.gamma, beta: event.beta })
}

function onMotion(event) {
  if (sawOrient) return
  const g = event.accelerationIncludingGravity
  if (!g || g.x == null || g.y == null) return
  emit({ kind: 'motion', x: g.x, y: g.y })
}

function bindSensors(prefer) {
  if (sensorsBound || typeof window === 'undefined') return
  sensorsBound = true
  if (prefer === 'motion') {
    window.addEventListener('devicemotion', onMotion)
    return
  }
  window.addEventListener('deviceorientation', onOrient)
  window.addEventListener('deviceorientationabsolute', onOrient)
  window.setTimeout(() => {
    if (!sawOrient) window.addEventListener('devicemotion', onMotion)
  }, 1200)
}

export function subscribeTilt(listener) {
  tiltListeners.add(listener)
  return () => tiltListeners.delete(listener)
}

function askPermission(api) {
  if (!api || typeof api.requestPermission !== 'function') return null
  try {
    return api.requestPermission()
  } catch {
    return Promise.reject(new Error('motion-request-failed'))
  }
}

// iOS only shows the motion dialog from a click, and it rejects the same
// call made on pointerdown. A rejected attempt must stay retryable, or the
// following click can never ask again.
export function unlockMotion() {
  if (motionOk) return Promise.resolve(true)
  if (motionDenied) return Promise.resolve(false)
  if (pendingUnlock) return pendingUnlock

  const asks = [
    askPermission(window.DeviceOrientationEvent),
    askPermission(window.DeviceMotionEvent),
  ].filter(Boolean)

  if (asks.length === 0) {
    motionOk = true
    bindSensors('orient')
    return Promise.resolve(true)
  }

  pendingUnlock = Promise.all(
    asks.map((request) => Promise.resolve(request).then(
      (state) => state,
      () => 'error',
    )),
  )
    .then((states) => {
      if (states.includes('granted')) {
        motionOk = true
        bindSensors('orient')
        return true
      }
      if (states.includes('denied')) motionDenied = true
      return false
    })
    .finally(() => {
      pendingUnlock = null
    })

  return pendingUnlock
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', () => {
    unlockMotion()
  }, true)
}

function paint(node, x, y, rush) {
  if (!node) return
  node.style.setProperty('--tilt-rush', rush.toFixed(3))
  node.style.setProperty('--header-angle', `${145 + x * 22}deg`)
  node.style.setProperty('--header-glow-x', `${8 + x * 16}%`)
  node.style.setProperty('--header-glow-y', `${110 + y * 12}%`)
  node.style.setProperty('--tilt-x', x.toFixed(3))
  node.style.setProperty('--tilt-y', y.toFixed(3))
  node.style.setProperty('--wallet-shift-x', `${(x * 22).toFixed(2)}px`)
  node.style.setProperty('--wallet-shift-y', `${(y * 14).toFixed(2)}px`)
  node.style.setProperty('--wallet-teal-x', `${16 + x * 14}%`)
  node.style.setProperty('--wallet-teal-y', `${48 + y * 8}%`)
  node.style.setProperty('--wallet-gold-x', `${50 + x * 12}%`)
  node.style.setProperty('--wallet-gold-y', `${50 + y * 6}%`)
  node.style.setProperty('--wallet-pink-x', `${84 + x * 12}%`)
  node.style.setProperty('--wallet-pink-y', `${48 + y * 8}%`)
}

export function useWalletTilt(ref, ready = true) {
  useEffect(() => {
    if (!ready) return undefined
    const node = ref.current
    if (!node) return undefined

    let restG = null
    let restB = null
    const samples = []
    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0
    let raf = 0
    let live = true
    let warmup = 4
    const armAt = performance.now() + 400

    function apply(nextX, nextY) {
      targetX = clamp(nextX)
      targetY = clamp(nextY)
    }

    function fromTilt(gamma, beta) {
      const angle = screenAngle()
      let g = gamma
      let b = beta
      if (angle === 90) {
        g = beta
        b = -gamma
      } else if (angle === 270 || angle === -90) {
        g = -beta
        b = gamma
      } else if (angle === 180) {
        g = -gamma
        b = -beta
      }

      if (performance.now() < armAt || warmup > 0) {
        warmup -= 1
        apply(g / 22, (b - 55) / 28)
        return
      }

      if (restG === null) {
        samples.push({ g, b })
        apply(g / 22, (b - 55) / 28)
        if (samples.length < 8) return
        const recent = samples.slice(-6)
        const gs = recent.map((sample) => sample.g)
        const bs = recent.map((sample) => sample.b)
        const spread = (Math.max(...gs) - Math.min(...gs)) + (Math.max(...bs) - Math.min(...bs))
        if (spread > 14 && samples.length < 24) return
        restG = median(gs)
        restB = median(bs)
      }
      apply((g - restG) / 12, (b - restB) / 12)
    }

    function onReading(reading) {
      if (reading.kind === 'motion') {
        apply(-reading.x / 6, (-reading.y - 4) / 6)
        return
      }
      fromTilt(reading.gamma, reading.beta)
    }

    /*
     * The pointer no longer drives any of this. Dragging across the screen
     * used to swing the backdrop as if the mouse were gravity, which on a
     * phone meant a scroll could move the light; the device's own tilt is the
     * only input now, and with no sensor the backdrop simply rests centred.
     */

    // How much the device is moving right now: it rises the instant the light
    // starts travelling and falls away over a few frames once it stops. It
    // used to be multiplied by a pulse that kept beating on its own, so the
    // glass flashed whether or not anything had happened. The level is the
    // whole of it now — held still, it settles to zero and stays there.
    let level = 0

    function tick() {
      const dx = (targetX - x) * 0.28
      const dy = (targetY - y) * 0.28
      x += dx
      y += dy

      const speed = Math.min(Math.hypot(dx, dy) * 11, 1)
      // Ease up to the peak rather than snapping to it, and fall away slowly,
      // so the light swells instead of striking.
      level += (speed - level) * (speed > level ? 0.22 : 0.07)

      paint(node, x, y, level)
      if (live) raf = window.requestAnimationFrame(tick)
    }

    const unsubscribe = subscribeTilt(onReading)
    if (!needsMotionPrompt()) bindSensors('orient')

    raf = window.requestAnimationFrame(tick)

    return () => {
      live = false
      window.cancelAnimationFrame(raf)
      unsubscribe()
    }
  }, [ref, ready])
}
