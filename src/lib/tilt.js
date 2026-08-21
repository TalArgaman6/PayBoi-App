import { useEffect } from 'react'

function clamp(value) {
  return Math.max(-1, Math.min(1, value))
}

let motionOk = false

async function unlockMotion() {
  const orient = window.DeviceOrientationEvent
  const motion = window.DeviceMotionEvent
  try {
    if (orient && typeof orient.requestPermission === 'function') {
      const state = await orient.requestPermission()
      if (state === 'granted') motionOk = true
    } else if (orient) {
      motionOk = true
    }
  } catch {
    /* keep trying on later taps */
  }
  try {
    if (motion && typeof motion.requestPermission === 'function') {
      const state = await motion.requestPermission()
      if (state === 'granted') motionOk = true
    }
  } catch {
    /* ignore */
  }
  return motionOk
}

function paint(node, x, y) {
  if (!node) return
  node.style.setProperty('--header-angle', `${145 + x * 22}deg`)
  node.style.setProperty('--header-glow-x', `${8 + x * 16}%`)
  node.style.setProperty('--header-glow-y', `${110 + y * 12}%`)
  node.style.setProperty('--wallet-angle', `${172 + x * 38}deg`)
  node.style.setProperty('--wallet-top-x', `${86 + x * 26}%`)
  node.style.setProperty('--wallet-top-y', `${-6 + y * 18}%`)
  node.style.setProperty('--wallet-blue-x', `${14 + x * 28}%`)
  node.style.setProperty('--wallet-blue-y', `${104 + y * 20}%`)
  node.style.setProperty('--wallet-shine-angle', `${120 + x * 32}deg`)
}

export { unlockMotion }

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

    function apply(nextX, nextY) {
      targetX = clamp(nextX)
      targetY = clamp(nextY)
    }

    function fromTilt(gamma, beta) {
      if (gamma == null || beta == null) return
      if (restG === null) {
        samples.push({ gamma, beta })
        if (samples.length < 4) return
        restG = samples.reduce((sum, item) => sum + item.gamma, 0) / samples.length
        restB = samples.reduce((sum, item) => sum + item.beta, 0) / samples.length
      }
      apply((gamma - restG) / 18, (beta - restB) / 18)
    }

    function onOrient(event) {
      fromTilt(event.gamma, event.beta)
    }

    function onMotion(event) {
      const g = event.accelerationIncludingGravity
      if (!g || g.x == null) return
      apply(g.x / 7, (g.y + 6) / 8)
    }

    function onMouse(event) {
      const box = node.getBoundingClientRect()
      apply(
        ((event.clientX - box.left) / box.width - 0.5) * 2,
        ((event.clientY - box.top) / box.height - 0.5) * 2,
      )
    }

    function onLeave() {
      apply(0, 0)
    }

    function tick() {
      x += (targetX - x) * 0.18
      y += (targetY - y) * 0.18
      paint(node, x, y)
      if (live) raf = window.requestAnimationFrame(tick)
    }

    let bound = false

    function bindSensors() {
      if (bound) return
      bound = true
      window.addEventListener('deviceorientation', onOrient)
      window.addEventListener('deviceorientationabsolute', onOrient)
      window.addEventListener('devicemotion', onMotion)
    }

    async function listen() {
      await unlockMotion()
      bindSensors()
    }

    node.addEventListener('pointermove', onMouse)
    node.addEventListener('pointerleave', onLeave)
    node.addEventListener('pointerdown', listen)
    listen()
    raf = window.requestAnimationFrame(tick)

    return () => {
      live = false
      window.cancelAnimationFrame(raf)
      window.removeEventListener('deviceorientation', onOrient)
      window.removeEventListener('deviceorientationabsolute', onOrient)
      window.removeEventListener('devicemotion', onMotion)
      node.removeEventListener('pointermove', onMouse)
      node.removeEventListener('pointerleave', onLeave)
      node.removeEventListener('pointerdown', listen)
    }
  }, [ref, ready])
}
