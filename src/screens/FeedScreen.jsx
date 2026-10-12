import { useEffect, useMemo, useRef, useState } from 'react'
import catalog from '../data/feed.json'
import events from '../data/events.json'
import wallet from '../data/wallet.json'
import { FilterTabs } from '../components/FilterTabs.jsx'
import { RemixBanner } from '../components/RemixPlayer.jsx'
import { ScreenHeader } from '../components/ScreenHeader.jsx'
import { ALT_EVENT_TYPES } from '../lib/filters.js'
import { assetUrl, shortName } from '../lib/format.js'
import { useDismissOnOutside } from '../lib/dismiss.js'

const ME = {
  id: 'tal',
  name: shortName(wallet.user || wallet.nickname),
  photo: wallet.photo || 'photos/sellers/toulouse.jpg',
}

const PARTY_BY_ID = Object.fromEntries(
  events.items.map((item) => [item.id, item]),
)

const RATE_PARTIES = events.items.filter(
  (item) => item.type === 'party' && item.country === 'IL',
)

const ALT_EVENTS = events.items.filter(
  (item) => ALT_EVENT_TYPES.includes(item.type) && item.country === 'IL',
)

const MODES = [
  { id: 'live', label: 'Live' },
  { id: 'featured', label: 'Featured' },
  { id: 'watchme', label: 'WM', title: 'Watch me' },
  { id: 'ticket', label: 'Ticket' },
  { id: 'ask', label: 'Vote' },
  { id: 'ride', label: 'Ride' },
  { id: 'alternative', label: 'Alt' },
]

const PLACEHOLDERS = {
  watchme: 'Watch me, the fit',
  live: 'From the floor, live',
  featured: "What's featured",
  ride: 'Where, when, seats',
  ticket: 'Which night, how many',
  ask: 'Which night should it be',
  alternative: 'Sports, gala, karaoke, theater',
}

const LINE_TAGS = {
  forever: 'forever',
  shirazi: 'fff',
  gaze: 'gaze',
  drek: 'drek',
  crush: 'crush',
  beef: 'beef',
  arisa: 'arisa',
  pboi: 'pboi',
  offer: 'offer',
}

function typeTag(mode) {
  if (mode === 'rating' || mode === 'ask') return 'ask'
  if (mode === 'clip' || mode === 'music') return 'live'
  return mode
}

function lineTag(party) {
  if (!party) return 'party'
  if (party.line && LINE_TAGS[party.line]) return LINE_TAGS[party.line]
  if (party.line) return party.line
  if (ALT_EVENT_TYPES.includes(party.type)) return party.type
  return 'party'
}

function autoTags(mode, pickIds) {
  const party = PARTY_BY_ID[pickIds?.[0]]
  return [typeTag(mode), lineTag(party)]
}

const FEED_FILTERS = catalog.tags.filter(
  (item) => !['music', 'party', 'bar', 'travel', 'sports'].includes(item.id),
)

const SORT_FILTERS = [
  { id: 'new', label: 'New' },
  { id: 'top', label: 'Top' },
]

function UploadMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 15.5V5M8 9l4-4 4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 16v2.2A1.8 1.8 0 0 0 6.8 20h10.4A1.8 1.8 0 0 0 19 18.2V16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function VoteMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5l7 9H5l7-9z" fill="currentColor" />
    </svg>
  )
}

function ShareMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4v11M8.2 7.5 12 3.8l3.8 3.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 13v6.2A1.8 1.8 0 0 0 7.8 21h8.4A1.8 1.8 0 0 0 18 19.2V13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FeedClip({ src, className }) {
  function keepMuted(event) {
    if (!event.currentTarget.muted) event.currentTarget.muted = true
    if (event.currentTarget.volume !== 0) event.currentTarget.volume = 0
  }

  return (
    <video
      className={className}
      src={src}
      playsInline
      muted
      defaultMuted
      autoPlay
      loop
      preload="metadata"
      controls={false}
      controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
      disablePictureInPicture
      disableRemotePlayback
      onVolumeChange={keepMuted}
      onContextMenu={(event) => event.preventDefault()}
    />
  )
}

/*
 * A peck, not a like. One outline that fills in once it is cast, so the
 * cast and uncast states are the same shape at the same weight and only the
 * fill changes — the count beside it never shifts.
 */
function Peck({ on }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {/* A peacock feather, upright: the plume is a teardrop with the eye cut
          out of it as a second subpath, so evenodd leaves a ring rather than
          needing a second colour to punch the hole. The quill curls off the
          bottom. Cast fills the plume; the quill is drawn either way, so the
          weight never changes. */}
      <path
        d="M12 2.4c3.5 2.9 5.4 6.2 5.4 9.1 0 3.5-2.4 5.8-5.4 5.8s-5.4-2.3-5.4-5.8c0-2.9 1.9-6.2 5.4-9.1z
           M12 8.3a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 1 0 0-5.4z"
        fillRule="evenodd"
        fill={on ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 17.3c-.3 2-1.6 3.5-3.9 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function peopleOn(post) {
  return [post.user, ...(post.with || [])].map((person) => ({
    ...person,
    name: shortName(person),
  }))
}

function CollabName({ people }) {
  if (people.length < 2) return people[0]?.name || ''
  const rest = people.length === 2 ? people[1].name : people.length - 1
  return (
    <>
      {people[0].name}{' '}
      <span
        className="feed-feat"
        role="img"
        aria-label="feat."
        style={{ '--mark': `url("${assetUrl('icons/peacock-amp.png')}")` }}
      />{' '}
      {rest}
    </>
  )
}

function onPost(post, userId) {
  return (
    post.user.id === userId ||
    (post.with || []).some((person) => person.id === userId)
  )
}

function FeedPeople({ post, onOpen }) {
  const people = peopleOn(post)
  const collab = people.length > 1

  return (
    <div className={`feed-user${collab ? ' is-collab' : ''}`}>
      <span className="feed-faces">
        {people.slice(0, 4).map((person) => (
          <button
            key={person.id}
            type="button"
            onClick={() => onOpen(person.id, post.id)}
            aria-label={person.name}
          >
            <img src={assetUrl(person.photo)} alt="" />
          </button>
        ))}
      </span>
      <button
        type="button"
        className="feed-user-copy"
        onClick={() => onOpen(post.user.id, post.id)}
      >
        <strong>
          <CollabName people={people} />
        </strong>
      </button>
    </div>
  )
}

// Cards that lead with a kicker line instead of a top label and hashtags.
const REQUEST_KINDS = ['ride', 'ticket']

function kindLabel(kind) {
  if (kind === 'rating') return 'Live rating'
  if (kind === 'ride') return 'Ride request'
  if (kind === 'ticket') return 'Ticket request'
  if (kind === 'live' || kind === 'clip' || kind === 'music') return 'Live'
  if (kind === 'watchme') return 'Watch me'
  if (kind === 'featured') return 'Featured'
  if (kind === 'alternative') return 'Alt'
  return 'Post'
}

function cardTone(post) {
  if (post.kind === 'watchme') return 'watchme'
  if (post.kind === 'featured') return 'featured'
  if (post.kind === 'ticket') return 'ticket'
  if (post.kind === 'rating' || post.kind === 'ask') return 'ask'
  if (post.kind === 'ride') return 'ride'
  if (post.kind === 'alternative') return 'alt'
  return 'live'
}

function peckLine(entry, picked, me) {
  const votes = entry.votes || 0
  if (votes <= 0) return null
  const lead = shortName(picked === entry.id ? me : entry.upvoters?.[0] || 'Someone')
  if (votes === 1) return `${lead} pecked`
  return `${lead} pecked +${votes - 1} more`
}

/*
 * A heart with a level meter cut out of it. The bars are not drawn on top —
 * they are strokes in the sheet's own colour, so they read as gaps punched
 * through the heart and the mark stays a single solid shape at 14px.
 */
function LiveHeartMark() {
  return (
    <svg className="live-heart" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 21.1 3.5 12.6a5.5 5.5 0 0 1 7.8-7.8l.7.7.7-.7a5.5 5.5 0 0 1 7.8 7.8z"
      />
      <g
        stroke="var(--sheet)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M6.6 10.1v2.6" />
        <path d="M9 7.6v7.3" />
        <path d="M12 6.4v10.2" />
        <path d="M15 7.6v7.3" />
        <path d="M17.4 10.1v2.6" />
      </g>
    </svg>
  )
}

/*
 * A steering wheel, cut the same way as the heart above: the spokes are
 * strokes in the sheet's colour punched through a solid disc, so it holds
 * together at 14px instead of turning into a grey smudge.
 */
function WheelMark() {
  return (
    <svg className="live-heart is-wheel" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 2.2a9.8 9.8 0 1 0 0 19.6 9.8 9.8 0 0 0 0-19.6zm0 2.1a7.7 7.7 0 1 1 0 15.4 7.7 7.7 0 0 1 0-15.4z"
      />
      <circle cx="12" cy="12" r="3.1" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M12 4.3v4.6" />
        <path d="M5.4 15.8l4-2.3" />
        <path d="M18.6 15.8l-4-2.3" />
      </g>
    </svg>
  )
}

/*
 * A ticket, cut like the wheel: one solid shape with the perforation and the
 * notches punched through it, so it survives being 14px tall.
 */
function TicketRequestMark() {
  return (
    <svg className="live-heart is-ticket" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M3.4 6.2h17.2c.6 0 1.1.5 1.1 1.1v2.4a2.3 2.3 0 0 0 0 4.6v2.4c0 .6-.5 1.1-1.1 1.1H3.4c-.6 0-1.1-.5-1.1-1.1v-2.4a2.3 2.3 0 0 0 0-4.6V7.3c0-.6.5-1.1 1.1-1.1zm5.4 1.9a.7.7 0 0 0-.7.7v1.3a.7.7 0 0 0 1.4 0V8.8a.7.7 0 0 0-.7-.7zm0 3.9a.7.7 0 0 0-.7.7v1.3a.7.7 0 0 0 1.4 0v-1.3a.7.7 0 0 0-.7-.7zm0 3.9a.7.7 0 0 0-.7.7v1.3a.7.7 0 0 0 1.4 0v-1.3a.7.7 0 0 0-.7-.7z"
      />
    </svg>
  )
}

/*
 * An envelope at the weight of the peck it stands in for: outline only, so
 * the action row still reads as two quiet controls rather than one shouting.
 */
function EnvelopeMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="2.8"
        y="5.4"
        width="18.4"
        height="13.2"
        rx="2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.6 7.4 12 13.1l8.4-5.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/*
 * The one line a request card leads with: a mark, what the post is asking
 * for, and the night it's about. Rides and ticket requests share it, and it
 * is built like the rating kicker — which is what the hashtags underneath
 * used to say, only quieter.
 */
function RequestKicker({ ids, label, mark }) {
  const party = PARTY_BY_ID[ids?.[0]]

  /*
   * Wrapped in a div on purpose: `.feed-card > p` sets the caption's larger
   * size and outranks `.rate-kicker`, so a bare <p> here would come out
   * bigger than the identical line on a rating card. The rating kicker is
   * nested the same way, inside RatingOptions.
   */
  return (
    <div>
      <p className="rate-kicker is-live">
        {mark}
        {label}
        {party ? ` · ${party.title}` : ''}
      </p>
    </div>
  )
}

/*
 * The rating's own kicker, lifted out of the options list so it can sit
 * directly under the poster's name like a request card's does. Same markup,
 * same <div> wrapper for the `.feed-card > p` specificity reason above.
 */
function RatingKicker({ live = 4 }) {
  return (
    <div>
      <p className="rate-kicker is-live">
        <LiveHeartMark />
        Live rating · {live} live
      </p>
    </div>
  )
}

function RatingOptions({ options, picked, onVote, me }) {
  const ranked = [...options].sort((left, right) => right.votes - left.votes)

  return (
    <div>
      <ul className="party-rate">
        {ranked.map((entry) => {
          const party = PARTY_BY_ID[entry.id]
          if (!party) return null
          const on = picked === entry.id
          const fans = peckLine(entry, picked, me)
          return (
            <li key={entry.id}>
              <img src={assetUrl(party.image)} alt="" />
              <div>
                <strong>
                  {party.title}
                  {fans ? <b>{fans}</b> : null}
                </strong>
                <span>{party.venue}</span>
              </div>
              <button
                type="button"
                className={on ? 'is-on' : ''}
                aria-pressed={on}
                aria-label={`Vote ${party.title}`}
                onClick={() => onVote(entry.id)}
              >
                <VoteMark />
                {entry.votes}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/*
 * Answering a request. The same sheet the marketplace uses to message a
 * seller — a labelled field and the two familiar buttons — so a PM looks like
 * one thing wherever it starts from.
 */
function PmSheet({ post, onClose }) {
  const [draft, setDraft] = useState('')
  const [sent, setSent] = useState(false)
  const sheet = useRef(null)
  useDismissOnOutside(sheet, Boolean(post), onClose)

  if (!post) return null

  const name = shortName(post.user?.name || '')

  return (
    <aside
      ref={sheet}
      className="detail-sheet"
      role="dialog"
      aria-label={`Message ${name}`}
    >
      <div className="detail-handle" />
      <div className="detail-head">
        <div className="item-thumb">
          <img src={assetUrl(post.user?.photo)} alt="" />
        </div>
        <div>
          <strong>{name}</strong>
          <span>{kindLabel(post.kind)}</span>
          <span className="detail-pay">{post.caption}</span>
        </div>
      </div>
      {sent ? (
        <p>Sent to {name}.</p>
      ) : (
        <label className="sell-field">
          <span className="sell-field-row">
            Message
            <em className="sell-ratio">to {name}</em>
          </span>
          <textarea
            className="pm-draft"
            rows={3}
            placeholder={`Reply to ${name}`}
            value={draft}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
      )}
      {sent ? null : (
        <button
          type="button"
          className="pay-btn"
          disabled={!draft.trim()}
          onClick={() => setSent(true)}
        >
          SEND
        </button>
      )}
      <button type="button" className="ghost-btn" onClick={onClose}>
        GO BACK
      </button>
    </aside>
  )
}

function UserFeed({ posts, startId, userId, onClose }) {
  const scroller = useRef(null)
  const panel = useRef(null)
  useDismissOnOutside(panel, true, onClose)
  const media = posts.filter((post) => post.image || post.video)
  const person =
    media.flatMap(peopleOn).find((item) => item.id === userId) || media[0]?.user

  useEffect(() => {
    const root = scroller.current
    const node = root?.querySelector(`[data-post="${startId}"]`)
    if (root && node) {
      root.scrollLeft = node.offsetLeft
    }
  }, [startId])

  if (!person) return null

  return (
    <aside
      ref={panel}
      className="user-feed"
      role="dialog"
      aria-label={`${person.name}'s posts`}
    >
      <header className="user-feed-head">
        <div className="feed-user">
          <img src={assetUrl(person.photo)} alt="" />
          <strong>{person.name}</strong>
        </div>
        <button type="button" className="drawer-text" onClick={onClose}>
          Close
        </button>
      </header>
      <div className="user-feed-track" ref={scroller}>
        {media.map((post, index) => (
          <article
            key={post.id}
            className={`user-feed-slide${post.frame === 'faces' ? ' is-faces' : ''}`}
            data-post={post.id}
          >
            {post.video ? (
              <FeedClip src={assetUrl(post.video)} />
            ) : (
              <img src={assetUrl(post.image)} alt="" />
            )}
            <div className="user-feed-copy">
              <span>
                {index + 1} / {media.length}
              </span>
              <p>{post.caption}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="user-feed-hint">Swipe for {person.name}'s posts</p>
    </aside>
  )
}

function formatTag(tag) {
  if (tag === 'clip') return '#live'
  if (tag === 'alternative') return '#alt'
  return `#${String(tag || '').toLowerCase()}`
}

function NightChips({ ids }) {
  if (!ids?.length) return null
  return (
    <div className="rate-picks is-locked">
      {ids.map((id) => {
        const party = PARTY_BY_ID[id]
        if (!party) return null
        return (
          <span key={id} className="is-on">
            {party.title}
          </span>
        )
      })}
    </div>
  )
}

function isLivePost(post) {
  return post.kind === 'live' || post.kind === 'clip' || post.kind === 'music'
}

function matchesFilter(post, tag) {
  if (tag === 'all') return true
  const tags = post.tags || []
  if (tag === 'live') {
    return (
      tags.includes('live') ||
      tags.includes('clip') ||
      tags.includes('music') ||
      isLivePost(post)
    )
  }
  if (tag === 'alternative') {
    return tags.includes('alternative') || post.kind === 'alternative'
  }
  return tags.includes(tag)
}

async function shareToInstagram(post) {
  const tags = (post.tags || []).map((tag) => formatTag(tag)).join(' ')
  const text = [post.caption, tags, '#pboi'].filter(Boolean).join(' ')
  try {
    if (post.image && navigator.share && navigator.canShare) {
      const response = await fetch(assetUrl(post.image))
      const blob = await response.blob()
      const file = new File([blob], 'pboi.jpg', { type: blob.type || 'image/jpeg' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ text, title: 'pboi', files: [file] })
        return
      }
    }
    if (navigator.share) {
      await navigator.share({ text, title: 'pboi' })
      return
    }
  } catch (error) {
    if (error?.name === 'AbortError') return
  }
  window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
}

export function FeedScreen() {
  const [posts, setPosts] = useState(catalog.posts)
  const [mode, setMode] = useState('watchme')
  const [tag, setTag] = useState('all')
  const [sort, setSort] = useState('new')
  const [caption, setCaption] = useState('')
  const [media, setMedia] = useState('')
  const [isVideo, setIsVideo] = useState(false)
  const [picks, setPicks] = useState([])
  const [tagOpen, setTagOpen] = useState(false)
  const [viewer, setViewer] = useState(null)
  // The request whose PM composer is open, if any.
  const [pm, setPm] = useState(null)
  const [mine, setMine] = useState({})
  const [liked, setLiked] = useState(() => new Set())

  const album = useMemo(() => {
    if (!viewer) return []
    return posts.filter((post) => onPost(post, viewer.userId))
  }, [posts, viewer])

  const visible = useMemo(() => {
    const filtered = posts.filter((post) => matchesFilter(post, tag))
    if (sort !== 'top') return filtered
    return [...filtered].sort((left, right) => (right.likes || 0) - (left.likes || 0))
  }, [posts, tag, sort])

  const isAskFlow = mode === 'ask' || mode === 'ride' || mode === 'ticket'
  const canPost = picks.length === 1 && (isAskFlow || Boolean(media))
  const eventPicks = mode === 'alternative' ? ALT_EVENTS : RATE_PARTIES

  function chooseMode(id) {
    setMode(id)
    if ((id === 'alternative') !== (mode === 'alternative')) {
      setPicks([])
    }
    if (id !== 'live' && isVideo) {
      setMedia('')
      setIsVideo(false)
    }
  }

  function openUser(userId, startId) {
    setViewer({ userId, startId })
  }

  function togglePick(id) {
    setPicks((current) => (current[0] === id ? [] : [id]))
  }

  function vote(postId, optionId) {
    const current = mine[postId]
    const nextPick = current === optionId ? null : optionId
    setMine((votes) => ({ ...votes, [postId]: nextPick }))
    setPosts((list) =>
      list.map((post) => {
        if (post.id !== postId || post.kind !== 'rating') return post
        return {
          ...post,
          options: post.options.map((option) => {
            let votes = option.votes
            if (option.id === current) votes -= 1
            if (option.id === nextPick) votes += 1
            return { ...option, votes: Math.max(0, votes) }
          }),
        }
      }),
    )
  }

  function like(id) {
    setLiked((current) => {
      const next = new Set(current)
      const on = next.has(id)
      if (on) next.delete(id)
      else next.add(id)
      setPosts((list) =>
        list.map((post) =>
          post.id === id
            ? { ...post, likes: Math.max(0, (post.likes || 0) + (on ? -1 : 1)) }
            : post,
        ),
      )
      return next
    })
  }

  function onFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const video = file.type.startsWith('video/')
    if (video && mode !== 'live') return
    setIsVideo(video)
    setMedia(URL.createObjectURL(file))
  }

  function publish() {
    if (!canPost) return
    const text = caption.trim()
    const tags = autoTags(mode, picks)
    const photo = media && !isVideo ? media : undefined
    const clip = media && isVideo ? media : undefined
    const base = {
      id: `mine-${Date.now()}`,
      user: ME,
      caption: text,
      when: 'now',
      tags,
      likes: 0,
      image: photo,
      video: clip,
    }
    const next =
      mode === 'ask'
        ? {
            ...base,
            kind: 'rating',
            live: 1,
            options: picks.map((id) => ({ id, votes: 0 })),
          }
        : isAskFlow
          ? {
              ...base,
              kind: mode,
              nights: picks,
            }
          : {
              ...base,
              kind: mode,
              nights: picks.length ? picks : undefined,
            }
    setPosts((current) => [next, ...current])
    setCaption('')
    setMedia('')
    setIsVideo(false)
    setPicks([])
    setTagOpen(false)
  }

  return (
    <section className="screen screen-feed">
      <ScreenHeader title="Feed" />
      <div className="sheet">
        <RemixBanner />
        <form
          className="feed-composer"
          onSubmit={(event) => {
            event.preventDefault()
            publish()
          }}
        >
          <img className="feed-composer-face" src={assetUrl(ME.photo)} alt="" />
          <div
            className="feed-composer-body"
            onBlur={(event) => {
              if (event.currentTarget.contains(event.relatedTarget)) return
              setTagOpen(false)
            }}
          >
            <div className="feed-mode">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={mode === item.id ? 'is-active' : ''}
                  title={item.title}
                  onClick={() => chooseMode(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <input
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              onFocus={() => setTagOpen(true)}
              maxLength={30}
              placeholder={PLACEHOLDERS[mode]}
              aria-label="Caption"
            />
            {media && !isVideo ? (
              <img className="feed-preview" src={assetUrl(media)} alt="" />
            ) : null}
            {media && isVideo ? (
              <video className="feed-preview" src={assetUrl(media)} muted />
            ) : null}
            {tagOpen || picks.length ? (
              <>
                <div className={`rate-picks${tagOpen ? '' : ' is-locked'}`}>
                  {(tagOpen
                    ? eventPicks
                    : eventPicks.filter((party) => picks.includes(party.id))
                  ).map((party) =>
                    tagOpen ? (
                      <button
                        key={party.id}
                        type="button"
                        className={picks.includes(party.id) ? 'is-on' : ''}
                        onClick={() => togglePick(party.id)}
                      >
                        {party.title}
                      </button>
                    ) : (
                      <span key={party.id} className="is-on">
                        {party.title}
                      </span>
                    ),
                  )}
                </div>
                {picks.length ? (
                  <p className="feed-auto-tags">
                    {autoTags(mode, picks).map((item) => formatTag(item)).join(' ')}
                  </p>
                ) : null}
              </>
            ) : null}
            <div className="feed-composer-actions">
              <div className="feed-composer-tools">
                <label
                  className="feed-photo-btn"
                  aria-label={mode === 'live' ? 'Upload photo or video' : 'Upload photo'}
                >
                  <UploadMark />
                  <input
                    type="file"
                    accept={mode === 'live' ? 'image/*,video/*' : 'image/*'}
                    onChange={onFile}
                  />
                </label>
              </div>
              <button type="submit" disabled={!canPost}>
                Post
              </button>
            </div>
          </div>
        </form>
        <div className="feed-tools">
          <div className="feed-sort" role="tablist" aria-label="Sort feed">
            {SORT_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={sort === item.id}
                className={sort === item.id ? 'is-active' : ''}
                onClick={() => setSort(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <FilterTabs
          filters={FEED_FILTERS}
          active={tag}
          onChange={setTag}
        />
        <div className="feed-list">
          {visible.map((post) => (
            <article key={post.id} className={`feed-card is-${cardTone(post)}`}>
              {post.video ? (
                <div className="feed-photo is-clip">
                  <FeedClip className="feed-clip" src={assetUrl(post.video)} />
                  <i>Live</i>
                </div>
              ) : post.image ? (
                <div
                  className={`feed-photo${isLivePost(post) ? ' is-clip' : ''}${post.frame === 'faces' ? ' is-faces' : ''}`}
                >
                  <img src={assetUrl(post.image)} alt="" />
                  {isLivePost(post) ? <i>Live</i> : null}
                </div>
              ) : !REQUEST_KINDS.includes(post.kind) && post.kind !== 'rating' ? (
                /* Ride posts carry their kicker at the foot instead, next to
                   the night, the way a rating does. */
                <p className="rate-kicker">{kindLabel(post.kind)}</p>
              ) : null}
              <div className="feed-meta">
                <FeedPeople post={post} onOpen={openUser} />
                <span>{post.when}</span>
              </div>
              {/* On a request, the kicker sits directly under the name —
                  you read what is being asked for before the detail. */}
              {REQUEST_KINDS.includes(post.kind) ? (
                <RequestKicker
                  ids={post.nights}
                  label={kindLabel(post.kind)}
                  mark={post.kind === 'ride' ? <WheelMark /> : <TicketRequestMark />}
                />
              ) : null}
              {post.kind === 'rating' ? <RatingKicker live={post.live ?? 4} /> : null}
              {post.track ? <p className="feed-track">{post.track}</p> : null}
              {post.caption ? <p>{post.caption}</p> : null}
              {REQUEST_KINDS.includes(post.kind) ? null : <NightChips ids={post.nights} />}
              {post.tags?.length && post.kind !== 'rating' && !REQUEST_KINDS.includes(post.kind) ? (
                <p className="feed-tags">
                  {post.tags.map((item) => formatTag(item)).join(' ')}
                </p>
              ) : null}
              {post.kind === 'rating' ? (
                <RatingOptions
                  options={post.options}
                  picked={mine[post.id]}
                  me={ME.name}
                  onVote={(optionId) => vote(post.id, optionId)}
                />
              ) : null}
              {/* A rating card already is the vote — the row of options is the
                  action, so a second peck and a share underneath it only
                  compete with it. */}
              {post.kind === 'rating' ? null : (
              <div className="feed-actions">
                {/* A request isn't something you agree with, it's something
                    you answer — so the peck gives way to a direct line to
                    whoever posted it. */}
                {REQUEST_KINDS.includes(post.kind) ? (
                  <button
                    type="button"
                    aria-label={`Message ${post.user?.name || 'poster'}`}
                    onClick={() => setPm(post)}
                  >
                    <EnvelopeMark />
                    PM
                  </button>
                ) : (
                  <button
                    type="button"
                    className={liked.has(post.id) ? 'is-on' : ''}
                    aria-label="Peck"
                    onClick={() => like(post.id)}
                  >
                    <Peck on={liked.has(post.id)} />
                    {post.likes || 0}
                  </button>
                )}
                {/* Nothing to share on a request — it's one person asking one
                    room for a favour, not a night worth passing on. */}
                {REQUEST_KINDS.includes(post.kind) ? null : (
                  <button
                    type="button"
                    aria-label="Share"
                    onClick={() => shareToInstagram(post)}
                  >
                    <ShareMark />
                  </button>
                )}
              </div>
              )}
            </article>
          ))}
        </div>
      </div>
      {viewer ? (
        <UserFeed
          posts={album}
          startId={viewer.startId}
          userId={viewer.userId}
          onClose={() => setViewer(null)}
        />
      ) : null}
      {/* Keyed on the post so a second request opens a clean draft rather
          than inheriting the last one's half-written message. */}
      <PmSheet key={pm?.id} post={pm} onClose={() => setPm(null)} />
    </section>
  )
}
