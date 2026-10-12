import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import remix from '../data/remix.json'
import { assetUrl } from '../lib/format.js'

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

        const syncPlayback = () => {
          widget.isPaused((paused) => {
            if (!gone) setPlaying(!paused)
          })
        }

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
          window.setTimeout(syncPlayback, 400)
        })
        widget.bind(Events.PLAY, () => {
          if (gone) return
          setPlaying(true)
          window.setTimeout(syncPlayback, 400)
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
        widget.isPaused((paused) => {
          if (paused) widget.play()
          else widget.pause()
        })
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
      <path fill="currentColor" d="M4.2 3.1h2.3v9.8H4.2zm5.3 0h2.3v9.8H9.5z" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M5.1 3.1v9.8l7.1-4.9z" />
    </svg>
  )
}

/*
 * One mark, two states. While the sound is actually coming through it's four
 * bars dancing; silent, it falls back to a play triangle — which says what the
 * tap will do rather than what the track is already doing.
 */
function MuteMark({ muted, playing }) {
  if (muted || !playing) return <PlayMark playing={false} />

  return (
    <span className="eq" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="4.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  )
}

function SoundcloudMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2 11.4c.3 0 .5.2.5.5l.3 2.6-.3 2.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5L1.2 14.5l.3-2.6c0-.3.2-.5.5-.5zm2.4-1.3c.3 0 .5.2.6.5l.3 3.9-.3 3.8c0 .3-.3.5-.6.5s-.5-.2-.5-.5l-.3-3.8.3-3.9c0-.3.2-.5.5-.5zm2.5-.7c.3 0 .6.2.6.6l.3 4.5-.3 3.8c0 .3-.3.6-.6.6s-.6-.3-.6-.6l-.2-3.8.2-4.5c0-.4.3-.6.6-.6zm2.5-.4c.4 0 .6.3.7.6l.2 4.9-.2 3.8c0 .3-.3.6-.7.6-.3 0-.6-.3-.6-.6l-.2-3.8.2-4.9c0-.3.3-.6.6-.6zm2.6-.3c.4 0 .7.3.7.7l.2 5.1-.2 3.7c0 .4-.3.7-.7.7s-.7-.3-.7-.7l-.2-3.7.2-5.1c0-.4.3-.7.7-.7zm2.6 1.1c.4 0 .7.3.7.7l.2 4-.2 3.7c0 .4-.3.7-.7.7s-.7-.3-.7-.7l-.2-3.7.2-4c0-.4.3-.7.7-.7zM19 10a3.9 3.9 0 0 1 3.9 4 3.9 3.9 0 0 1-3.9 4h-2.4a.6.6 0 0 1-.6-.6V7.8c0-.3.1-.5.4-.6a4.3 4.3 0 0 1 1.5-.3c.5 0 .9.1 1.1.3v2.9c.1-.1.3-.1.6-.1z"
      />
    </svg>
  )
}

/*
 * The two off-app links under a name. Same row, same accent — the glyph is
 * what tells them apart, so neither needs the service spelled out.
 */
function Handles({ at, cloud }) {
  if (!at && !cloud) return null

  return (
    <span className="remix-links">
      {at ? (
        <a
          className="remix-ig"
          href={`https://instagram.com/${at}`}
          target="_blank"
          // Instagram opens in its own tab with no handle back to this one.
          rel="noreferrer noopener"
        >
          <InstagramMark />
          <span>{at}</span>
        </a>
      ) : null}
      {cloud ? (
        <a
          className="remix-ig"
          href={`https://soundcloud.com/${cloud}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          <SoundcloudMark />
          <span>{cloud}</span>
        </a>
      ) : null}
    </span>
  )
}

/*
 * Portrait, name and handle on one row, the paragraph beneath it. Keeping
 * the photo and the handle on the same line means the two cards read as a
 * pair of entries rather than two walls of text with a picture bolted on.
 */
function PlayLink() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        d="M3.2 8.1a3 3 0 0 1 2.5-2.5C7.6 5.3 9.8 5.2 12 5.2s4.4.1 6.3.4a3 3 0 0 1 2.5 2.5c.2 1.3.3 2.6.3 3.9s-.1 2.6-.3 3.9a3 3 0 0 1-2.5 2.5c-1.9.3-4.1.4-6.3.4s-4.4-.1-6.3-.4a3 3 0 0 1-2.5-2.5A25 25 0 0 1 2.9 12c0-1.3.1-2.6.3-3.9Z"
      />
      <path fill="currentColor" d="M10.2 9.3v5.4L14.9 12z" />
    </svg>
  )
}

/*
 * Full recorded sets, beneath the handles. They're a bigger ask than a profile
 * tap — an hour of someone's night — so each gets its own line with the
 * occasion and the room named, rather than hiding behind a bare link.
 */
function SetLinks({ sets }) {
  if (!sets || !sets.length) return null

  return (
    <div className="remix-sets">
      <span className="remix-sets-label">Recommended sets</span>
      {sets.map((set) => (
        <a
          key={set.url}
          className="remix-set"
          href={set.url}
          target="_blank"
          rel="noreferrer noopener"
        >
          <PlayLink />
          <span>{set.title}</span>
        </a>
      ))}
    </div>
  )
}

function AboutCard({ name, photo, bio, at, cloud, sets }) {
  if (!name || !bio) return null

  return (
    <section className="remix-card">
      <div className="remix-card-head">
        {photo ? <img src={assetUrl(photo)} alt="" /> : null}
        <div>
          <strong>{name}</strong>
        </div>
      </div>
      <p>{bio}</p>
      <Handles at={at} cloud={cloud} />
      <SetLinks sets={sets} />
    </section>
  )
}

/*
 * Who is playing and where. Opens from the cover art, slides in from the
 * right over the feed. Nothing in here is a control — it is just the two
 * paragraphs, so the music carries on untouched behind it.
 */
function RemixAbout({ open, onClose, dj, party }) {
  if (!open) return null

  return (
    <div className="drawer-root">
      <button
        type="button"
        className="drawer-scrim"
        onClick={onClose}
        aria-label="Close"
      />
      <aside className="drawer-panel" role="dialog" aria-label="About the set">
        <header className="drawer-head">
          {/* No title — the cards name themselves. The empty heading is kept
              so the head keeps its height and the Close button its position. */}
          <h2 aria-hidden="true">&nbsp;</h2>
          <button
            type="button"
            className="drawer-text drawer-x"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                d="M4 4l8 8M12 4l-8 8"
              />
            </svg>
          </button>
        </header>
        <div className="drawer-body remix-about">
          <AboutCard
            name={remix.dj || dj}
            photo={remix.djPhoto}
            bio={remix.djBio}
            at={remix.djInstagram}
            cloud={remix.djSoundcloud}
            sets={remix.djSets}
          />
          <AboutCard
            name={remix.party || party}
            photo={remix.partyPhoto}
            bio={remix.partyBio}
            at={remix.partyInstagram}
            cloud={remix.partySoundcloud}
            sets={remix.partySets}
          />
        </div>
      </aside>
    </div>
  )
}

/*
 * The feed's version of the Events/Market featured slide: same frame, but it
 * only ever holds one item — the track that's playing — so there are no dots.
 * Tapping the cover opens the set notes; play and mute are their own badges.
 */
export function RemixBanner() {
  const now = useContext(RemixContext)
  const [about, setAbout] = useState(false)
  if (!now || !remix.url) return null

  const line = [now.dj, now.party].filter(Boolean).join(' · ')

  return (
    <>
      <div className={`feature-banner is-remix${now.muted ? ' is-muted' : ''}`}>
        {/* The cover opens the notes; the equaliser in the corner is the only
            control, and it reads as its own state. */}
        <button
          type="button"
          className="feature-slide"
          onClick={() => setAbout(true)}
          aria-label={`About ${line || now.title}`}
        >
          {remix.cover ? (
            <img src={assetUrl(remix.cover)} alt="" />
          ) : null}
          <div className="feature-copy">
            <strong>{now.title}</strong>
            <em>{line}</em>
          </div>
        </button>
        <button
          type="button"
          className="remix-mute"
          onClick={now.toggleMute}
          aria-label={now.muted ? 'Unmute remix' : 'Mute remix'}
        >
          <MuteMark muted={now.muted} playing={now.playing} />
        </button>
      </div>
      {/* Outside the banner: it has overflow:hidden and its own positioning
          context, which would clip the drawer to the 140px slide. */}
      <RemixAbout
        open={about}
        onClose={() => setAbout(false)}
        dj={now.dj}
        party={now.party}
      />
    </>
  )
}

export function RemixNowPlaying() {
  const now = useContext(RemixContext)
  if (!now || (!now.title && !remix.url)) return null

  const line = [now.title, now.dj].filter(Boolean).join(' · ')

  return (
    <div className={`remix-now${now.muted ? ' is-muted' : ''}`}>
      <div className="remix-now-line">
        <span>{line}</span>
        <button
          type="button"
          onClick={now.togglePlay}
          aria-label={now.playing ? 'Pause remix' : 'Play remix'}
        >
          <PlayMark playing={now.playing} />
        </button>
        <button
          type="button"
          onClick={now.toggleMute}
          aria-label={now.muted ? 'Unmute remix' : 'Mute remix'}
        >
          <MuteMark muted={now.muted} playing={now.playing} />
        </button>
      </div>
    </div>
  )
}
