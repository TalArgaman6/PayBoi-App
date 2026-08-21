import { useEffect } from 'react'

function clamp(value) {
  return Math.max(-1, Math.min(1, value))
}

function paint(node, x, y) {
  if (!node) return
  node.style.setProperty('--header-angle', `${145 + x * 22}deg`)
  node.style.setProperty('--header-glow-x', `${8 + x * 16}%`)
  node.style.setProperty('--header-glow-y', `${110 + y * 12}%`)
  node.style.setProperty('--wallet-angle', `${172 + x * 22}deg`)
  node.style.setProperty('--wallet-blue-x', `${8 + x * 16}%`)
  node.style.setProperty('--wallet-blue-y', `${110 + y * 12}%`)
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
    let listening = false

    function apply(nextX, nextY) {
      targetX = clamp(nextX)
      targetY = clamp(nextY)
    }

    function fromTilt(gamma, beta) {
      if (restG === null) {
        samples.push({ gamma, beta })
        if (samples.length < 6) return
        restG = samples.reduce((sum, item) => sum + item.gamma, 0) / samples.length
        restB = samples.reduce((sum, item) => sum + item.beta, 0) / samples.length
      }
      apply((gamma - restG) / 26, (beta - restB) / 26)
    }

    function onOrient(event) {
      if (event.gamma == null || event.beta == null) return
      fromTilt(event.gamma, event.beta)
    }

    function onMouse(event) {
      if (event.target.closest('.sheet')) return
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
      x += (targetX - x) * 0.14
      y += (targetY - y) * 0.14
      paint(node, x, y)
      if (live) raf = window.requestAnimationFrame(tick)
    }

    async function listen() {
      if (listening) return
      const Sensor = window.DeviceOrientationEvent
      if (Sensor && typeof Sensor.requestPermission === 'function') {
        try {
          const state = await Sensor.requestPermission()
          if (state !== 'granted') return
        } catch {
          return
        }
      }
      listening = true
      window.addEventListener('deviceorientation', onOrient)
    }

    node.addEventListener('pointermove', onMouse)
    node.addEventListener('pointerleave', onLeave)
    listen()
    raf = window.requestAnimationFrame(tick)
    node.addEventListener('pointerdown', listen)

    return () => {
      live = false
      window.cancelAnimationFrame(raf)
      window.removeEventListener('deviceorientation', onOrient)
      node.removeEventListener('pointermove', onMouse)
      node.removeEventListener('pointerleave', onLeave)
      node.removeEventListener('pointerdown', listen)
    }
  }, [ref, ready])
}
