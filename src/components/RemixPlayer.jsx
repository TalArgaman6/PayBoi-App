import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import remix from '../data/remix.json'

const RemixContext = createContext(null)
const LIVE_VOL = 80
const API_SRC = 'https://w.soundcloud.com/player/api.js'

function widgetSrc(url) {
  const params = new URLSearchParams({
    url,
    auto_play: 'true',
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'false',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'false',
    buying: 'false',
    sharing: 'false',
    download: 'false',
    liking: 'false',
    show_artwork: 'false',
    show_playcount: 'false',
  })
  return `https://w.soundcloud.com/player/?${params}`
}

function loadApi() {
  if (window.SC?.Widget) return Promise.resolve()
  if (window.__pboiScApi) return window.__pboiScApi
  window.__pboiScApi = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = API_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('SoundCloud'))
    document.head.appendChild(script)
  })
  return window.__pboiScApi
}

function tidyTitle(title, dj) {
  if (!title) return ''
  let text = title.replace(/\s+by\s+.+$/i, '').trim()
  if (dj) {
    const prefix = new RegExp(
      `^${dj.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[-–—:]\\s*`,
      'i',
    )
    text = text.replace(prefix, '')
  }
  return text
}

export function RemixProvider({ children }) {
  const iframeRef = useRef(null)
  const widgetRef = useRef(null)
  const mutedRef = useRef(true)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [meta, setMeta] = useState({
    title: remix.title || '',
    dj: remix.dj || '',
    party: remix.party || '',
  })

  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !remix.url) return undefined
    let gone = false

    loadApi()
      .then(() => {
        if (gone || !iframeRef.current) return
        const widget = window.SC.Widget(iframe)
        widgetRef.current = widget
        const { Events } = window.SC.Widget

        widget.bind(Events.READY, () => {
          if (gone) return
          widget.getCurrentSound((sound) => {
            if (gone || !sound) return
            const dj =
              remix.dj || sound.user?.username || sound.user?.full_name || ''
            setMeta({
              title:
                remix.title || tidyTitle(sound.title, dj) || sound.title || '',
              dj,
              party: remix.party || '',
            })
          })
          widget.setVolume(0)
          widget.play()
        })
        widget.bind(Events.PLAY, () => {
          if (!gone) setPlaying(true)
        })
        widget.bind(Events.PAUSE, () => {
          if (!gone) setPlaying(false)
        })
        widget.bind(Events.FINISH, () => {
          if (gone) return
          widget.seekTo(0)
          widget.play()
        })
      })
      .catch(() => {})

    return () => {
      gone = true
      widgetRef.current = null
    }
  }, [])

  const api = useMemo(
    () => ({
      ...meta,
      playing,
      muted,
      togglePlay() {
        const widget = widgetRef.current
        if (!widget) return
        if (playing) widget.pause()
        else widget.play()
      },
      toggleMute() {
        const widget = widgetRef.current
        const next = !muted
        setMuted(next)
        widget?.setVolume(next ? 0 : LIVE_VOL)
        if (!next && !playing) widget?.play()
      },
    }),
    [meta, muted, playing],
  )

  return (
    <RemixContext.Provider value={api}>
      {children}
      {remix.url ? (
        <iframe
          ref={iframeRef}
          className="remix-frame"
          title="Featured remix"
          allow="autoplay; encrypted-media"
          src={widgetSrc(remix.url)}
        />
      ) : null}
    </RemixContext.Provider>
  )
}

function PlayMark({ playing }) {
  return playing ? (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M5 3.5h2.2v9H5zm3.8 0H11v9H8.8z" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M5 3.2v9.6L13 8z" />
    </svg>
  )
}

function MuteMark({ muted }) {
  return muted ? (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2.2 6.1h2.1L7.6 3.4v9.2L4.3 9.9H2.2zm8.2 1.9 1.5-1.5.9.9-1.5 1.5 1.5 1.5-.9.9-1.5-1.5-1.5 1.5-.9-.9 1.5-1.5-1.5-1.5.9-.9z"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2.2 6.1h2.1L7.6 3.4v9.2L4.3 9.9H2.2zm7.2.4c.7.5 1.1 1.2 1.1 1.5s-.4 1-.1 1.5l-.8.5c-.2-.4-.5-.8-.5-2s.3-1.6.5-2zm1.9-1.4c1.1.9 1.8 2 1.8 2.9s-.7 2-1.8 2.9l-.7-.7c.9-.7 1.4-1.5 1.4-2.2s-.5-1.5-1.4-2.2z"
      />
    </svg>
  )
}

export function RemixNowPlaying() {
  const now = useContext(RemixContext)
  if (!now || (!now.title && !remix.url)) return null

  return (
    <div className={`remix-now${now.muted ? ' is-muted' : ''}`}>
      <button
        type="button"
        className="remix-copy"
        onClick={now.toggleMute}
        aria-label={now.muted ? 'Unmute remix' : 'Mute remix'}
      >
        <strong>{now.title}</strong>
      </button>
      <div className="remix-now-line">
        <span>
          {[now.dj, now.party].filter(Boolean).join(' · ')}
        </span>
        <button
          type="button"
          onClick={now.toggleMute}
          aria-label={now.muted ? 'Unmute remix' : 'Mute remix'}
        >
          <MuteMark muted={now.muted} />
        </button>
        <button
          type="button"
          onClick={now.togglePlay}
          aria-label={now.playing ? 'Pause remix' : 'Play remix'}
        >
          <PlayMark playing={now.playing} />
        </button>
      </div>
    </div>
  )
}
