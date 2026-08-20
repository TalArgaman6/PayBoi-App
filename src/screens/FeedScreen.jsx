import { useEffect, useMemo, useRef, useState } from 'react'
import catalog from '../data/feed.json'
import events from '../data/events.json'
import wallet from '../data/wallet.json'
import { FilterTabs } from '../components/FilterTabs.jsx'
import { ScreenHeader } from '../components/ScreenHeader.jsx'
import { assetUrl } from '../lib/format.js'

const ME = {
  id: 'tal',
  name: wallet.nickname,
  photo: wallet.photo,
}

const PARTY_BY_ID = Object.fromEntries(
  events.items.map((item) => [item.id, item]),
)

const RATE_PARTIES = events.items.filter(
  (item) => item.type === 'party' && item.country === 'IL',
)

const MODES = [
  { id: 'looks', label: 'Look' },
  { id: 'clip', label: 'Clip' },
  { id: 'music', label: 'Music' },
  { id: 'ride', label: 'Ride' },
  { id: 'ticket', label: 'Ticket' },
  { id: 'ask', label: 'Ask' },
]

const PLACEHOLDERS = {
  looks: 'Looks, pre-drinks, the fit',
  clip: 'Short clip from the floor',
  music: 'DJ / song of the night',
  ride: 'Where, when, seats',
  ticket: 'Which night, how many',
  ask: 'Ask which night to pick',
}

function VoteMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5l7 9H5l7-9z" fill="currentColor" />
    </svg>
  )
}

function Heart({ on }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20s-7-4.4-9.2-8.6C1.4 8.6 3.2 5 6.8 5c2 0 3.3 1.1 4.2 2.4C12 6.1 13.2 5 15.2 5c3.6 0 5.4 3.6 4 6.4C19 15.6 12 20 12 20z"
        fill={on ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function kindLabel(kind) {
  if (kind === 'rating') return 'Live rating'
  if (kind === 'ride') return 'Ride request'
  if (kind === 'ticket') return 'Ticket request'
  if (kind === 'music') return 'Music set'
  if (kind === 'clip') return 'Event clip'
  if (kind === 'looks') return 'Looks'
  return 'Post'
}

function RatingOptions({ options, picked, onVote }) {
  const ranked = [...options].sort((left, right) => right.votes - left.votes)
  const live = ranked.reduce((sum, item) => sum + item.votes, 0)
  const avg = ranked.length ? Math.round(live / ranked.length) : 0

  return (
    <div>
      <p className="rate-kicker">
        Live rating · {live} live · avg {avg}
      </p>
      <ul className="party-rate">
        {ranked.map((entry) => {
          const party = PARTY_BY_ID[entry.id]
          if (!party) return null
          const on = picked === entry.id
          return (
            <li key={entry.id}>
              <img src={assetUrl(party.image)} alt="" />
              <div>
                <strong>{party.title}</strong>
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

function UserFeed({ posts, startId, onClose }) {
  const scroller = useRef(null)
  const media = posts.filter((post) => post.image || post.video)
  const person = media[0]?.user

  useEffect(() => {
    const root = scroller.current
    const node = root?.querySelector(`[data-post="${startId}"]`)
    if (root && node) {
      root.scrollLeft = node.offsetLeft
    }
  }, [startId])

  if (!person) return null

  return (
    <aside className="user-feed" role="dialog" aria-label={`${person.name}'s posts`}>
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
            className="user-feed-slide"
            data-post={post.id}
          >
            {post.video ? (
              <video src={assetUrl(post.video)} controls playsInline />
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

async function shareToInstagram(post) {
  const tags = (post.tags || []).map((tag) => `#${tag}`).join(' ')
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
  const [mode, setMode] = useState('looks')
  const [tag, setTag] = useState('all')
  const [caption, setCaption] = useState('')
  const [media, setMedia] = useState('')
  const [isVideo, setIsVideo] = useState(false)
  const [picks, setPicks] = useState([])
  const [hash, setHash] = useState([])
  const [viewer, setViewer] = useState(null)
  const [mine, setMine] = useState({})
  const [liked, setLiked] = useState(() => new Set())

  const album = useMemo(() => {
    if (!viewer) return []
    return posts.filter((post) => post.user.id === viewer.userId)
  }, [posts, viewer])

  const visible = useMemo(
    () =>
      posts.filter(
        (post) => tag === 'all' || (post.tags || []).includes(tag),
      ),
    [posts, tag],
  )

  const needsMedia = mode === 'looks' || mode === 'clip'
  const canPost =
    mode === 'ask'
      ? Boolean(caption.trim() && picks.length >= 2)
      : Boolean(caption.trim() && (!needsMedia || media))

  function openUser(userId, startId) {
    setViewer({ userId, startId })
  }

  function togglePick(id) {
    setPicks((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length >= 4) return current
      return [...current, id]
    })
  }

  function toggleHash(id) {
    setHash((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
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
    if (!file) return
    setIsVideo(file.type.startsWith('video/'))
    setMedia(URL.createObjectURL(file))
  }

  function publish() {
    const text = caption.trim()
    if (!canPost) return
    const tags = [...new Set([mode === 'ask' ? 'party' : mode, ...hash])]
    const base = {
      id: `mine-${Date.now()}`,
      user: ME,
      caption: text,
      when: 'now',
      tags,
      likes: 0,
    }
    const next =
      mode === 'ask'
        ? {
            ...base,
            kind: 'rating',
            options: picks.map((id) => ({ id, votes: 0 })),
          }
        : {
            ...base,
            kind: mode,
            image: media && !isVideo ? media : undefined,
            video: media && isVideo ? media : undefined,
            track: mode === 'music' ? text : undefined,
          }
    setPosts((current) => [next, ...current])
    setCaption('')
    setMedia('')
    setIsVideo(false)
    setPicks([])
    setHash([])
  }

  return (
    <section className="screen screen-feed">
      <ScreenHeader title="Feed" kicker="Looks, clips, rides, votes" />
      <div className="sheet">
        <form
          className="feed-composer"
          onSubmit={(event) => {
            event.preventDefault()
            publish()
          }}
        >
          <img className="feed-composer-face" src={assetUrl(ME.photo)} alt="" />
          <div className="feed-composer-body">
            <div className="feed-mode">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={mode === item.id ? 'is-active' : ''}
                  onClick={() => setMode(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <input
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              maxLength={90}
              placeholder={PLACEHOLDERS[mode]}
              aria-label="Caption"
            />
            {media && !isVideo ? (
              <img className="feed-preview" src={assetUrl(media)} alt="" />
            ) : null}
            {media && isVideo ? (
              <video className="feed-preview" src={assetUrl(media)} muted />
            ) : null}
            {mode === 'ask' ? (
              <div className="rate-picks">
                {RATE_PARTIES.map((party) => (
                  <button
                    key={party.id}
                    type="button"
                    className={picks.includes(party.id) ? 'is-on' : ''}
                    onClick={() => togglePick(party.id)}
                  >
                    {party.title}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="rate-picks">
              {catalog.tags
                .filter((item) => item.id !== 'all')
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={hash.includes(item.id) ? 'is-on' : ''}
                    onClick={() => toggleHash(item.id)}
                  >
                    #{item.label}
                  </button>
                ))}
            </div>
            <div className="feed-composer-actions">
              {needsMedia || mode === 'music' ? (
                <label className="feed-photo-btn">
                  {mode === 'clip' ? 'Video' : 'Photo'}
                  <input
                    type="file"
                    accept={mode === 'clip' ? 'video/*,image/*' : 'image/*'}
                    onChange={onFile}
                  />
                </label>
              ) : (
                <span className="rate-hint">
                  {mode === 'ask' ? 'Pick 2–4 nights' : 'No photo needed'}
                </span>
              )}
              <button type="submit" disabled={!canPost}>
                Post
              </button>
            </div>
          </div>
        </form>
        <FilterTabs
          filters={catalog.tags}
          active={tag}
          onChange={setTag}
        />
        <div className="feed-list">
          {visible.map((post) => (
            <article key={post.id} className="feed-card">
              {post.video ? (
                <video
                  className="feed-clip"
                  src={assetUrl(post.video)}
                  controls
                  playsInline
                />
              ) : post.image ? (
                <button
                  type="button"
                  className={`feed-photo${post.kind === 'clip' ? ' is-clip' : ''}`}
                  onClick={() => openUser(post.user.id, post.id)}
                >
                  <img src={assetUrl(post.image)} alt="" />
                  {post.kind === 'clip' ? <i>Clip</i> : null}
                </button>
              ) : post.kind !== 'rating' ? (
                <p className="rate-kicker">{kindLabel(post.kind)}</p>
              ) : null}
              <div className="feed-meta">
                <button
                  type="button"
                  className="feed-user"
                  onClick={() => openUser(post.user.id, post.id)}
                >
                  <img src={assetUrl(post.user.photo)} alt="" />
                  <strong>{post.user.name}</strong>
                </button>
                <span>{post.when}</span>
              </div>
              {post.track ? <p className="feed-track">{post.track}</p> : null}
              <p>{post.caption}</p>
              {post.tags?.length ? (
                <p className="feed-tags">
                  {post.tags.map((item) => `#${item}`).join(' ')}
                </p>
              ) : null}
              {post.kind === 'rating' ? (
                <RatingOptions
                  options={post.options}
                  picked={mine[post.id]}
                  onVote={(optionId) => vote(post.id, optionId)}
                />
              ) : null}
              <div className="feed-actions">
                <button
                  type="button"
                  className={liked.has(post.id) ? 'is-on' : ''}
                  aria-label="Like"
                  onClick={() => like(post.id)}
                >
                  <Heart on={liked.has(post.id)} />
                  {post.likes || 0}
                </button>
                <button
                  type="button"
                  onClick={() => shareToInstagram(post)}
                >
                  Story
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
      {viewer ? (
        <UserFeed
          posts={album}
          startId={viewer.startId}
          onClose={() => setViewer(null)}
        />
      ) : null}
    </section>
  )
}
