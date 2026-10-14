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
        d="M3.8 13v6.2A1.8 1.8 0 0 0 5.6 21h12.8a1.8 1.8 0 0 0 1.8-1.8V13"
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
 * A peck, not a like. The mark never fills — casting only turns it white,
 * which the button's own colour does, so the shape and its weight are the
 * same either way and the count beside it never shifts.
 *
 * The crest itself: the same three feathers that stand over every profile
 * circle and sit in the header lockup, drawn here at the same proportions so
 * the app only ever has the one mark. The single plume it replaces read as a
 * shape of its own beside the brand's.
 */
function Peck() {
  return (
    /* The lockup's crest exactly: the same three feathers at the same lean,
       -18° about the foot of the middle quill, and the same splayed eyes.
       The viewBox is the leaning art's bounds, not the upright 36 x 26 box,
       so the top-right feather and the bottom-left stem both clear it. */
    <svg className="peck-mark" viewBox="-5 -2 39 34" aria-hidden="true">
      <g fill="currentColor" transform="rotate(-18 18 26)">
        <path d="M18 26c-.5-4.2-.6-8.2-.2-12.1h1.2c.4 3.9.3 7.9-.2 12.1z" />
        <path d="M14.4 26c-1.9-3.8-3.3-7.4-4.2-11l1.1-.4c1.5 3.6 2.6 7.3 3.4 11.4z" />
        <path d="M21.6 26c1.9-3.8 3.3-7.4 4.2-11l-1.1-.4c-1.5 3.6-2.6 7.3-3.4 11.4z" />
        <g transform="translate(18 8.6) rotate(-15)">
          <path d="M0-6.2C1.7-4 3.4-2.4 3.4.3 3.4 3 1.9 4.8 0 4.8-1.9 4.8-3.4 3-3.4.3-3.4-2.4-1.7-4 0-6.2Z" />
        </g>
        <g transform="translate(8.6 10.3) rotate(-40)">
          <path d="M0-6.2C1.7-4 3.4-2.4 3.4.3 3.4 3 1.9 4.8 0 4.8-1.9 4.8-3.4 3-3.4.3-3.4-2.4-1.7-4 0-6.2Z" />
        </g>
        <g transform="translate(27.4 10.3) rotate(7)">
          <path d="M0-6.2C1.7-4 3.4-2.4 3.4.3 3.4 3 1.9 4.8 0 4.8-1.9 4.8-3.4 3-3.4.3-3.4-2.4-1.7-4 0-6.2Z" />
        </g>
      </g>
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
 * The night a request is about, named in a word. The full title runs too long
 * beside the name — "Looking for a ride · Gaze @ Haoman 17" wraps the row where
 * "Looking for a ride · Gaze" does not. Parties go by their line, which is the
 * name people use for them anyway; a venue night with no line falls back to
 * the head of its own title, cut at the @ and held to two words.
 */
const LINE_NAMES = {
  forever: 'Forever',
  shirazi: 'FFF',
  gaze: 'Gaze',
  drek: 'Drek',
  crush: 'Crush',
  beef: 'Beef',
  arisa: 'Arisa',
  pboi: 'PCK',
  offer: 'Offer',
}

function lineName(party) {
  if (!party) return ''
  if (party.line) return LINE_NAMES[party.line] || party.line
  return party.title.split('@')[0].trim().split(/\s+/).slice(0, 2).join(' ')
}

/*
 * The one line a request card leads with: a mark, what the post is asking
 * for, and the night it's about. Rides and ticket requests share it, and it
 * is built like the rating kicker — which is what the hashtags underneath
 * used to say, only quieter.
 */
function RequestKicker({ ids, label, mark, tone }) {
  const party = PARTY_BY_ID[ids?.[0]]

  /*
   * A bare <p> now that it rides in the meta row beside the name. It used to
   * need a wrapping div, because `.feed-card > p` sets the caption's larger
   * size and outranks `.rate-kicker`; inside the row it is no longer a direct
   * child of the card, so the rule never reaches it.
   */
  return (
    <p className={`rate-kicker is-live feed-kicker is-${tone}`}>
      {mark}
      {label}
      {party ? ` · ${lineName(party)}` : ''}
    </p>
  )
}

/*
 * The rating's own kicker, lifted out of the options list so it can sit under
 * the poster's name like a request card's does. Same markup, and bare for the
 * same reason as above.
 *
 * It counted how many people were on the post; it counts the votes cast now.
 * Who is watching is the poster's business, how many have answered is the
 * reader's — and the number moves as they vote, which "4 live" never did.
 */
function RatingKicker({ options }) {
  const votes = (options || []).reduce(
    (total, option) => total + (option.votes || 0),
    0,
  )

  return (
    <p className="rate-kicker is-live feed-kicker is-battle">
      <LiveHeartMark />
      Live battle · {votes} voted
    </p>
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
          Send
        </button>
      )}
      <button type="button" className="ghost-btn" onClick={onClose}>
        Go Back
      </button>
    </aside>
  )
}

/*
 * The one post you tapped, opened large. It used to be the poster's whole
 * run of posts on a horizontal swipe, numbered 1 / n — which turned a single
 * shot into a deck and made a post feel like an album it isn't. A post is one
 * photo or one clip, here as in the feed, so the drawer shows that one.
 */
function UserFeed({ posts, startId, userId, onClose }) {
  const panel = useRef(null)
  useDismissOnOutside(panel, true, onClose)
  const media = posts.filter((post) => post.image || post.video)
  const shown = media.find((post) => post.id === startId) || media[0]
  const person =
    media.flatMap(peopleOn).find((item) => item.id === userId) || shown?.user

  if (!person || !shown) return null

  return (
    <aside
      ref={panel}
      className="user-feed"
      role="dialog"
      aria-label={`${person.name}'s posts`}
    >
      <header className="user-feed-head">
        <div className="feed-user">
          <span className="avatar-crest">
            <img src={assetUrl(person.photo)} alt="" />
          </span>
          <strong>{person.name}</strong>
        </div>
        <button type="button" className="drawer-text" onClick={onClose}>
          Close
        </button>
      </header>
      <div className="user-feed-track">
        <article
          className={`user-feed-slide${shown.frame === 'faces' ? ' is-faces' : ''}${shown.frame === 'bottom' ? ' is-bottom' : ''}`}
        >
          {shown.video ? (
            <FeedClip src={assetUrl(shown.video)} />
          ) : (
            <img src={assetUrl(shown.image)} alt="" />
          )}
          <div className="user-feed-copy">
            <p>{shown.caption}</p>
          </div>
        </article>
      </div>
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
  const text = [post.caption, tags, '#peacock'].filter(Boolean).join(' ')
  try {
    if (post.image && navigator.share && navigator.canShare) {
      const response = await fetch(assetUrl(post.image))
      const blob = await response.blob()
      const file = new File([blob], 'pboi.jpg', { type: blob.type || 'image/jpeg' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ text, title: 'Peacock', files: [file] })
        return
      }
    }
    if (navigator.share) {
      await navigator.share({ text, title: 'Peacock' })
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

  /*
   * The count used to be moved from inside the setLiked updater. Updaters have
   * to be pure — React runs them twice in development to prove it — so every
   * peck was counted twice. The two sets are separate calls now, and the
   * direction is read off the current set rather than from inside it.
   */
  function like(id) {
    const on = liked.has(id)
    setLiked((current) => {
      const next = new Set(current)
      if (on) next.delete(id)
      else next.add(id)
      return next
    })
    setPosts((list) =>
      list.map((post) =>
        post.id === id
          ? { ...post, likes: Math.max(0, (post.likes || 0) + (on ? -1 : 1)) }
          : post,
      ),
    )
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
          {/* The wrapper is only there to hang the crest on — a bare <img>
              has no pseudo-element to put it in. */}
          <span className="avatar-crest">
            <img className="feed-composer-face" src={assetUrl(ME.photo)} alt="" />
          </span>
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
                <div
                  className={`feed-photo is-clip${post.frame === 'bottom' ? ' is-bottom' : ''}`}
                >
                  <FeedClip className="feed-clip" src={assetUrl(post.video)} />
                  {/* The badge goes by what the post is, not by whether it
                      moves. Most clips were live posts when this was written,
                      so the two were the same thing; now that look and
                      featured posts carry clips too, a "Live" stamp on a look
                      would be claiming something the post isn't. */}
                  {isLivePost(post) ? <i>Live</i> : null}
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
              {/* Back under the name. Beside it the line competed with the
                  person for the top of the card; under it, it reads as what
                  that person is asking for. `.feed-kicker` carries the gap,
                  which the meta row's own spacing used to swallow. */}
              {REQUEST_KINDS.includes(post.kind) ? (
                <RequestKicker
                  ids={post.nights}
                  label={
                    post.kind === 'ride'
                      ? 'Looking for a ride'
                      : 'Looking for a ticket'
                  }
                  mark={post.kind === 'ride' ? <WheelMark /> : <TicketRequestMark />}
                  tone={post.kind === 'ride' ? 'ride' : 'ticket'}
                />
              ) : null}
              {post.kind === 'rating' ? <RatingKicker options={post.options} /> : null}
              {post.track ? <p className="feed-track">{post.track}</p> : null}
              {/* A request says what it wants in its kicker — the night, and
                  which of the two things is being asked for. The free line
                  under it only ever restated that, so a request card is the
                  kicker and the answer button, nothing between. */}
              {post.caption && !REQUEST_KINDS.includes(post.kind) && post.kind !== 'rating' ? (
                <p>{post.caption}</p>
              ) : null}
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
                    <Peck />
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
