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
import { Spinner } from '../components/Spinner.jsx'
import { earnOver } from '../lib/balance.js'

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
  // One order, shared with the filter row below the composer: what is
  // happening now, then what is on, then the two kinds of look, then the
  // things people ask each other for.
  { id: 'live', label: 'Live' },
  { id: 'featured', label: 'Featured' },
  { id: 'alternative', label: 'Alt' },
  { id: 'watchme', label: 'WM', title: 'Watch me' },
  { id: 'ask', label: 'Beatdown' },
  { id: 'ticket', label: 'Ticket' },
  { id: 'ride', label: 'Ride' },
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

/*
 * What the composer promises under the picks, and what the card will show.
 * It used to hand back the night's line, which for a one-off at a venue is
 * the word "party" — a tag that says nothing, and the one thing a post must
 * not come out with as its only room. It names the night now, the same way a
 * card does.
 */
function autoTags(mode, pickIds) {
  const tags = [typeTag(mode)]
  for (const id of pickIds || []) {
    const tag = partyTag(PARTY_BY_ID[id])
    if (tag && !tags.includes(tag)) tags.push(tag)
  }
  return tags
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
 * The peck. The drawn feather, used as a mask rather than as a picture: only
 * its alpha is read and the colour comes from the button, so the one file
 * serves both states — pewter at rest, white once pecked — and follows any
 * colour the row is ever given.
 *
 * The eye only — outline, ring and heart. The fan of barbs around it came off
 * with the artwork: at the size an action row gives this, a hundred hairlines
 * are a smudge with a shape in the middle of it, and the shape is the part
 * anyone reads.
 */
function Peck() {
  return (
    <span
      className="peck-mark"
      style={{ '--icon': `url("${assetUrl('brand/peck-feather.png')}")` }}
      aria-hidden="true"
    />
  )
}

// The given name on its own. shortName gives "Tal A." — an initial is what
// a list needs to keep two Tals apart, and is one character of noise on a
// button that is plainly about the person it sits under.
function firstName(person) {
  return String(person?.name || '').trim().split(/\s+/)[0] || ''
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
/*
 * What a post has left rather than how old it is. Three kinds of post are
 * really appointments: a battle closes a day after it opens, a ride leaves at
 * the hour it names, and a ticket request is only any use until the doors.
 * For those the meta line counts down to the moment instead of counting up
 * from the posting, because the hour of posting tells the reader nothing they
 * can act on.
 */
const COUNTDOWN_KINDS = ['rating', 'ask', 'ride', 'ticket']

const MINUTE_MS = 60000
const DAY_MS = 86400000

// A battle is open for a day.
const BATTLE_MS = DAY_MS

/*
 * When the session opened. The posts carry their age as a phrase — "2h" — so
 * the moment each was written is reckoned back from here once, rather than
 * from the current instant: reckoned live, "a day after it was posted" would
 * stay exactly a day away forever.
 */
const OPENED_AT = Date.now()

function agedMs(when) {
  const found = String(when || '').match(/^(\d+)\s*([mhd])$/)
  if (!found) return 0
  const unit = { m: MINUTE_MS, h: 60 * MINUTE_MS, d: DAY_MS }[found[2]]
  return Number(found[1]) * unit
}

/*
 * The next time the clock reads a given hour — today if it is still to come,
 * tomorrow if it has already gone. Nightlife hours are written without a date
 * and a ride at 23:20 means tonight, so the hour alone is enough to count to.
 */
function nextClock(text, from) {
  const found = String(text || '').match(/(\d{1,2}):(\d{2})/)
  if (!found) return 0
  const at = new Date(from)
  at.setHours(Number(found[1]), Number(found[2]), 0, 0)
  if (at.getTime() <= from) at.setTime(at.getTime() + DAY_MS)
  return at.getTime()
}

function deadlineFor(post) {
  if (post.kind === 'rating' || post.kind === 'ask') {
    return OPENED_AT - agedMs(post.when) + BATTLE_MS
  }
  // A ride leaves at the hour in its own caption; a ticket is wanted up to
  // the moment the night it is for opens its doors.
  if (post.kind === 'ride') return nextClock(post.caption, OPENED_AT)
  return nextClock(PARTY_BY_ID[post.nights?.[0]]?.time, OPENED_AT)
}

function formatLeft(ms) {
  // "Closed" is already the whole story; the others are a figure, and a figure
  // beside an hourglass still wants saying what it is.
  if (ms <= 0) return 'Closed'
  const minutes = Math.floor(ms / MINUTE_MS)
  const hours = Math.floor(minutes / 60)
  if (hours >= 1) {
    return `${hours}h ${String(minutes % 60).padStart(2, '0')}m left`
  }
  return `${Math.max(1, minutes)}m left`
}

/*
 * An hourglass, as a mark. The meta line carries one figure whether it counts
 * up or down, and nothing in "13h 16m" says which — the glass beside it does,
 * in the width of a character.
 */
function GlassMark() {
  return (
    <svg className="glass-mark" viewBox="4.6 2.1 14.8 20.4" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5 2.4h14v2.1h-1.1c0 3-1.3 5.6-3.4 7.5 2.1 1.9 3.4 4.5 3.4 7.5H19v2.1H5v-2.1h1.1c0-3 1.3-5.6 3.4-7.5C7.4 10.1 6.1 7.5 6.1 4.5H5zM8.2 4.5c0 2.6 1.2 4.8 3 6.2v2.6c-1.8 1.4-3 3.6-3 6.2h7.6c0-2.6-1.2-4.8-3-6.2v-2.6c1.8-1.4 3-3.6 3-6.2z"
      />
      {/* The sand: a heap run down into the lower bulb. */}
      <path
        fill="currentColor"
        d="M9.1 17.9c.5-1.3 1.5-2.3 2.9-2.9 1.4.6 2.4 1.6 2.9 2.9zM11.6 6.9h.8v4h-.8z"
      />
    </svg>
  )
}

/*
 * The figure, ticking. Half a minute between reads: the smallest thing shown
 * is a minute, so anything finer would redraw the feed for nothing.
 */
function Countdown({ post }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30 * 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <span className="feed-left">
      <GlassMark />
      {formatLeft(deadlineFor(post) - now)}
    </span>
  )
}

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
      Beatdown · {votes} voted
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
 * What a ride pays. One number for every ride in the app rather than a
 * haggle: the rider posts, whoever takes it is owed the same twenty, and the
 * fare moves the moment the ride is taken. Fixed price is the whole point —
 * it is what lets someone accept a stranger's ride without negotiating at
 * one in the morning.
 */
const RIDE_FARE = 20

/*
 * A rider, as a mark. A ride's caption ends by spelling out how many places it
 * has — "Two seats." — which on the offer line is three words for a number.
 * The figure and this head and shoulders say it in the width of two
 * characters, and a person reads as a place to sit more plainly than a chair.
 */
function SeatMark() {
  return (
    <svg className="seat-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.6c2.6 0 4.6 2.2 4.6 5s-2 5-4.6 5-4.6-2.2-4.6-5 2-5 4.6-5zM12 14.1c4.5 0 8.1 3.3 8.1 7.3H3.9c0-4 3.6-7.3 8.1-7.3z"
      />
    </svg>
  )
}

/*
 * How many seats a ride caption ends with, and the caption without it. The
 * count is written as a word in the posts, so the handful that occur are
 * mapped rather than parsed.
 */
const SEAT_WORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
}

/*
 * Where the ride goes, and when it goes. A caption states the route and then
 * the hour — "Florentin → Haoman, 23:20" — and on the sheet those are two
 * facts, not one sentence: the route is the headline and the clock belongs
 * with the seats and the fare on a line of numbers underneath it.
 */
function splitWhen(text) {
  const found = String(text || '').match(/^(.*?),\s*([^,]*\d{1,2}:\d{2}[^,]*)$/)
  if (!found) return { where: text, when: '' }
  return { where: found[1].trim(), when: found[2].trim() }
}

function splitSeats(caption) {
  const text = String(caption || '')
  const found = text.match(/\s*([A-Za-z]+|\d+)\s+seats?\.?\s*$/)
  if (!found) return { text, seats: 0 }
  const word = found[1].toLowerCase()
  const seats = SEAT_WORDS[word] || Number(word) || 0
  if (!seats) return { text, seats: 0 }
  return { text: text.slice(0, found.index).replace(/[.,\s]+$/, ''), seats }
}

/*
 * The ask, stripped to the thing itself. A request is written as a sentence —
 * "Need 1 Forever TLV at door price." — and on the sheet that answers it the
 * asking and the pricing are both said better by the button underneath, so
 * the opening verb and the trailing price clause come off and what's left is
 * "1 Forever TLV".
 */
function askLine(caption) {
  return String(caption || '')
    .replace(/^(need|looking for|after|want|wanted|searching for)\s+/i, '')
    .replace(/\s*(at|for)\s+(door|face|original|the original)\s+price\.?$/i, '')
    .replace(/\.$/, '')
    .trim()
}

/*
 * Answering a request. The same sheet the marketplace uses to message a
 * seller — a labelled field and the two familiar buttons — so a PM looks like
 * one thing wherever it starts from. On the two requests that are offers of
 * work rather than conversation, a ride and a ticket, the filled button is
 * the deal itself and the message is the quiet alternative beside it.
 */
function PmSheet({ post, onClose, onPaid }) {
  const [draft, setDraft] = useState('')
  const [sent, setSent] = useState(false)
  // 'pending' while the other side decides, 'done' once they have.
  const [deal, setDeal] = useState(null)
  // How many of the ride's places this offer takes. One by default: a driver
  // answering a request is far likelier to have room for one than to fill
  // the car, and the extras are a tap away.
  const [seats, setSeats] = useState(1)
  const sheet = useRef(null)
  useDismissOnOutside(sheet, Boolean(post), onClose)

  const isRide = post?.kind === 'ride'
  const isTicket = post?.kind === 'ticket'
  // What the ticket is worth: the night's own face price, never a number the
  // seller picks. A request asks for a ticket at door price and that is what
  // answering it offers — there is nothing here to haggle over.
  const party = isTicket ? PARTY_BY_ID[post.nights?.[0]] : null
  const fee = isRide ? RIDE_FARE : party?.pricePbs || 0
  const offers = isRide || Boolean(fee)
  // Rides say their seat count in words at the end of the caption; on the
  // offer line it reads as a figure and a chair instead.
  const seated = isRide ? splitSeats(post?.caption) : { text: post?.caption, seats: 0 }
  const ask = { ...seated, ...splitWhen(seated.text) }
  // The fare is per person, so a ride with room for two pays twice over. The
  // picked count is held back to what the ride actually has.
  const taken = isRide ? Math.min(seats, ask.seats || 1) : 1
  const total = fee * taken

  /*
   * The other side takes five seconds to say yes — the same wait a buyer
   * sits through on the detail sheet, seen from the selling end. The money
   * only arrives on the acceptance, and it arrives on the wallet: the sheet
   * closes and the card counts itself up.
   */
  useEffect(() => {
    if (deal !== 'pending') return undefined
    const timer = window.setTimeout(() => {
      setDeal('done')
      earnOver(total, 1500, isRide ? 'Ride paid by rider' : 'Ticket paid by buyer')
      onPaid?.()
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [deal, total])

  if (!post) return null

  const name = shortName(post.user?.name || '')

  return (
    <aside
      ref={sheet}
      className={`detail-sheet pm-sheet${deal === 'pending' ? ' is-wait' : ''}`}
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
          {/* An offer is one line: what is being asked for and what it pays.
              The kind was already in the kicker that opened this, the price
              clause in the caption is what the number replaces, and "from
              {name}" said the name a second time under the name itself. */}
          {offers ? (
            <>
              <span className="detail-pay">{askLine(ask.where)}</span>
              {/* The clock, the seats and the fare are all counts, so they
                  share a row of their own under the route. */}
              <span className="detail-pay">
                {ask.when ? `${ask.when} · ` : ''}
                {ask.seats ? (
                  <>
                    {ask.seats}
                    <SeatMark />
                    {' · '}
                  </>
                ) : null}
                {/* Fixed, and said so: the fare is the app's number rather
                    than something the two of them settle in the notes. */}
                {fee} pck fixed
              </span>
            </>
          ) : (
            <>
              <span>{kindLabel(post.kind)}</span>
              <span className="detail-pay">{post.caption}</span>
            </>
          )}
        </div>
      </div>
      {deal ? (
        <div className="deal-wait">
          <Spinner />
          <span>
            {deal === 'pending'
              ? `Waiting on ${name} to accept`
              : `${name} accepted · ${total} pck paid to you`}
          </span>
        </div>
      ) : sent ? (
        <p>Sent to {name}.</p>
      ) : (
        <>
        {/* How many places to take. One button rather than a row of them:
            a ride has two or three seats, so tapping through the counts and
            round to the start again is quicker than aiming at one of several
            pills, and it leaves a single object on the line. */}
        {isRide && ask.seats > 1 ? (
          <button
            type="button"
            className="seat-pick"
            aria-label={`${taken} of ${ask.seats} seats · tap to change`}
            onClick={() => setSeats(taken >= ask.seats ? 1 : taken + 1)}
          >
            {taken}
            <SeatMark />
            <em>of {ask.seats}</em>
          </button>
        ) : null}
        <label className={`sell-field${offers ? ' is-bare' : ''}`}>
          {/* An offer sheet's field needs no name: the placeholder already
              says what goes in it, and the word only pushed the button down. */}
          {offers ? null : (
            <span className="sell-field-row">
              Message
              <em className="sell-ratio">to {name}</em>
            </span>
          )}
          <textarea
            className="pm-draft"
            rows={3}
            placeholder={
              offers ? `Add a note to ${name}` : `Reply to ${name}`
            }
            value={draft}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
        </>
      )}
      {/* An offer sheet has one button, and it carries the note with it —
          the price is fixed, so there is nothing to send separately from
          the offer itself. */}
      {deal || sent ? null : offers ? (
        <button
          type="button"
          className="pay-btn"
          onClick={() => setDeal('pending')}
        >
          {isRide
            ? `Take the ride · ${total} pck`
            : `Offer ticket · ${total} pck`}
        </button>
      ) : (
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
        Cancel
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

/*
 * What a card says in words, capped at two lines: a title, and the tags under
 * it. A post used to carry a track line *and* a caption, which on a phone is
 * three rows of type under the picture before the actions — the card stopped
 * being a photograph with a label and became a paragraph. Whichever of the
 * two the post has is the title; if it has both, the track wins, because it
 * is the specific one.
 */
function cardTitle(post) {
  return post.track || post.caption || ''
}

/*
 * Tags that say nothing. #party on a feed where every post is a party, #music
 * on a music post that is already tagged #live — a tag earns its place by
 * narrowing, and these only restate the room they are standing in. They are
 * dropped wherever they turn up, including out of a poster's own list.
 */
const GENERAL_TAGS = ['party', 'music', 'bar', 'travel', 'sports', 'night', 'post']

/*
 * Every card gets the same two things under it: what kind of post this is,
 * and whose night it was. The kind comes off the post rather than its tags,
 * so a request and a rating carry one too — they used to show no tags at
 * all. The night comes off whatever the post picked, and failing that off
 * the tags the poster already wrote, which is where the line has always
 * lived. Posting used to mean typing the room into the caption; the caption
 * is gone, so the room comes down here instead, whether or not anyone
 * thought of it.
 */
/*
 * A night's tag. The line it belongs to if it has one — #forever, #gaze, the
 * name people actually use — and otherwise the night's own title run
 * together, because a one-off at a venue has no line to borrow. This is what
 * the chip row under a post used to say in full; said as a tag it is the
 * same information in one of the two rows a card gets rather than a third.
 */
function partyTag(party) {
  if (!party) return ''
  const line = lineTag(party)
  if (line && !GENERAL_TAGS.includes(line)) return line
  return party.title.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function cardTags(post) {
  const out = []
  const add = (tag) => {
    if (!tag || GENERAL_TAGS.includes(tag) || out.includes(tag)) return
    out.push(tag)
  }
  add(typeTag(post.kind))
  for (const id of post.nights || []) add(partyTag(PARTY_BY_ID[id]))
  for (const option of post.options || []) add(partyTag(PARTY_BY_ID[option.id]))
  for (const tag of post.tags || []) add(tag)
  return out
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

export function FeedScreen({ onPaid }) {
  const [posts, setPosts] = useState(catalog.posts)
  // Live is what the feed opens on: it's the first tab and the one that is
  // about tonight rather than about a look.
  const [mode, setMode] = useState('live')
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
      // The nights it was posted about, not just the tags they produced —
      // the card resolves names off these, the same as every seeded post.
      nights: picks,
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
              {/* A request leads with the ask, not with the asker. What it
                  wants and how long is left are the two things a reader
                  decides on, so they take the top line between them and the
                  person moves down beside the button that answers them. */}
              {REQUEST_KINDS.includes(post.kind) || post.kind === 'rating' ? (
                <div className="feed-meta is-request">
                  {/* A battle's own line counts the votes where a request's
                      names the night, but both are the headline of the card
                      and both sit opposite what time is left. */}
                  {post.kind === 'rating' ? (
                    <RatingKicker options={post.options} />
                  ) : (
                    <RequestKicker
                      ids={post.nights}
                      label={
                        post.kind === 'ride'
                          ? 'Looking for a ride'
                          : 'Looking for a ticket'
                      }
                      mark={
                        post.kind === 'ride' ? (
                          <WheelMark />
                        ) : (
                          <TicketRequestMark />
                        )
                      }
                      tone={post.kind === 'ride' ? 'ride' : 'ticket'}
                    />
                  )}
                </div>
              ) : (
                <div className="feed-meta">
                  <FeedPeople post={post} onOpen={openUser} />
                  {COUNTDOWN_KINDS.includes(post.kind) ? (
                    <Countdown post={post} />
                  ) : (
                    <span>{post.when}</span>
                  )}
                </div>
              )}
              {/* One line. A request says what it wants in its kicker — the
                  night, and which of the two things is being asked for — and
                  the free line under it only ever restated that, so a request
                  card is the kicker and the answer button, nothing between.
                  A rating card is its options. */}
              {cardTitle(post) &&
              !REQUEST_KINDS.includes(post.kind) &&
              post.kind !== 'rating' ? (
                <p className={post.track ? 'feed-track' : undefined}>{cardTitle(post)}</p>
              ) : null}
              {/* On every card, whatever kind it is. */}
              <p className="feed-tags">
                {cardTags(post).map((item) => formatTag(item)).join(' ')}
              </p>
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
                  compete with it. Whose battle it is still goes at the foot,
                  under the thing being decided, the way a request's asker
                  sits under the ask. */}
              {post.kind === 'rating' ? (
                <div className="feed-actions is-request is-battle">
                  <FeedPeople post={post} onOpen={openUser} />
                  {/* The same foot row a request has, minus the button: whose
                      battle it is, and how long is left to settle it. */}
                  <Countdown post={post} />
                </div>
              ) : (
              <div
                className={`feed-actions${REQUEST_KINDS.includes(post.kind) ? ' is-request' : ''}`}
              >
                {/* A request isn't something you agree with, it's something
                    you answer — so the peck gives way to a direct line to
                    whoever posted it. */}
                {/* Whose request it is comes first — the person, then the
                    way to answer them, which is the order the rest of the
                    feed reads in. */}
                {REQUEST_KINDS.includes(post.kind) ? (
                  <FeedPeople post={post} onOpen={openUser} />
                ) : null}
                {/* The clock reads with the name — how long this person has
                    left — and the button to answer them closes the row. */}
                {REQUEST_KINDS.includes(post.kind) ? (
                  <Countdown post={post} />
                ) : null}
                {REQUEST_KINDS.includes(post.kind) ? (
                  <button
                    type="button"
                    aria-label={`Message ${post.user?.name || 'poster'}`}
                    onClick={() => setPm(post)}
                  >
                    <EnvelopeMark />
                    {/* Named. A request is one person asking, and the button
                        that answers it is a message to that person — "PM"
                        alone made it look like a feature rather than like
                        writing to Tal. First name only: the row above it
                        already carries the full one. */}
                    PM {firstName(post.user)}
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
      <PmSheet
        key={pm?.id}
        post={pm}
        onClose={() => setPm(null)}
        onPaid={onPaid}
      />
    </section>
  )
}
