import { useEffect, useMemo, useRef, useState } from 'react'
import catalog from '../data/feed.json'
import events from '../data/events.json'
import wallet from '../data/wallet.json'
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

function VoteMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5l7 9H5l7-9z" fill="currentColor" />
    </svg>
  )
}

function RatingOptions({ options, picked, onVote }) {
  const ranked = [...options].sort((left, right) => right.votes - left.votes)

  return (
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
  )
}

function UserFeed({ posts, startId, onClose }) {
  const scroller = useRef(null)
  const photos = posts.filter((post) => post.image)
  const person = photos[0]?.user

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
        {photos.map((post, index) => (
          <article
            key={post.id}
            className="user-feed-slide"
            data-post={post.id}
          >
            <img src={assetUrl(post.image)} alt="" />
            <div className="user-feed-copy">
              <span>
                {index + 1} / {photos.length}
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

export function FeedScreen() {
  const [posts, setPosts] = useState(catalog.posts)
  const [mode, setMode] = useState('photo')
  const [caption, setCaption] = useState('')
  const [photo, setPhoto] = useState('')
  const [picks, setPicks] = useState([])
  const [viewer, setViewer] = useState(null)
  const [mine, setMine] = useState({})

  const album = useMemo(() => {
    if (!viewer) return []
    return posts.filter((post) => post.user.id === viewer.userId)
  }, [posts, viewer])

  const canPost =
    mode === 'photo'
      ? Boolean(photo && caption.trim())
      : caption.trim() && picks.length >= 2

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

  function onPhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setPhoto(URL.createObjectURL(file))
  }

  function publish() {
    const text = caption.trim()
    if (!canPost) return
    const next =
      mode === 'photo'
        ? {
            id: `mine-${Date.now()}`,
            user: ME,
            image: photo,
            caption: text,
            when: 'now',
          }
        : {
            id: `rate-${Date.now()}`,
            kind: 'rating',
            user: ME,
            caption: text,
            when: 'now',
            options: picks.map((id) => ({ id, votes: 0 })),
          }
    setPosts((current) => [next, ...current])
    setCaption('')
    setPhoto('')
    setPicks([])
  }

  return (
    <section className="screen screen-feed">
      <ScreenHeader title="Feed" kicker="Stills and live votes" />
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
              <button
                type="button"
                className={mode === 'photo' ? 'is-active' : ''}
                onClick={() => setMode('photo')}
              >
                Photo
              </button>
              <button
                type="button"
                className={mode === 'ask' ? 'is-active' : ''}
                onClick={() => setMode('ask')}
              >
                Ask
              </button>
            </div>
            <input
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              maxLength={90}
              placeholder={
                mode === 'ask' ? 'Ask which night to pick' : 'Short caption'
              }
              aria-label={mode === 'ask' ? 'Rating question' : 'Caption'}
            />
            {mode === 'photo' && photo ? (
              <img className="feed-preview" src={assetUrl(photo)} alt="" />
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
            <div className="feed-composer-actions">
              {mode === 'photo' ? (
                <label className="feed-photo-btn">
                  Photo
                  <input type="file" accept="image/*" onChange={onPhoto} />
                </label>
              ) : (
                <span className="rate-hint">Pick 2–4 nights</span>
              )}
              <button type="submit" disabled={!canPost}>
                Post
              </button>
            </div>
          </div>
        </form>
        <div className="feed-list">
          {posts.map((post) => (
            <article key={post.id} className="feed-card">
              {post.image ? (
                <button
                  type="button"
                  className="feed-photo"
                  onClick={() => openUser(post.user.id, post.id)}
                >
                  <img src={assetUrl(post.image)} alt="" />
                </button>
              ) : (
                <p className="rate-kicker">Live rating</p>
              )}
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
              <p>{post.caption}</p>
              {post.kind === 'rating' ? (
                <RatingOptions
                  options={post.options}
                  picked={mine[post.id]}
                  onVote={(optionId) => vote(post.id, optionId)}
                />
              ) : null}
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
