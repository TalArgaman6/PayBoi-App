/*
 * The wait on a payment. A plain ring did the job but said nothing; this is
 * the app's own feather, fourteen of them stood in a circle with their eyes
 * out, turning. Two layers moving at different speeds and in opposite
 * directions, which is what keeps it reading as motion rather than as a
 * picture being spun: the fan, and a ring of beads inside it going the other
 * way. There were arrowed arcs inside those too — a third thing turning in a
 * mark this size was noise around the feathers rather than motion.
 *
 * Shared, because both sides of a deal wait — the buyer in the detail sheet
 * and the seller answering a request in the feed.
 */

// The crest's own feather, tip up, drawn about its own origin.
const FEATHER = 'M0-6.2C1.7-4 3.4-2.4 3.4.3 3.4 3 1.9 4.8 0 4.8-1.9 4.8-3.4 3-3.4.3-3.4-2.4-1.7-4 0-6.2Z'
/*
 * The eye, cut out of the feather rather than drawn over it: a ring hole and
 * a pupil filled back in, as two more subpaths on the same path. With
 * evenodd the second winding opens a hole and the third closes it again, so
 * whatever the loader is standing on shows through the eye — which is what
 * makes it an eye and not a grey dot.
 */
const EYE = 'M0 .6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0Z'
const PUPIL = 'M.35 .95m-.95 0a.95 .95 0 1 0 1.9 0a.95 .95 0 1 0-1.9 0Z'

const FEATHERS = 14
const RING = 43

export function Spinner() {
  return (
    <svg className="spinner" viewBox="0 0 120 120" aria-hidden="true">
      <g className="spinner-fan" fill="currentColor" fillRule="evenodd">
        {Array.from({ length: FEATHERS }, (_, index) => (
          <path
            key={index}
            d={`${FEATHER}${EYE}${PUPIL}`}
            transform={`translate(60 60) rotate(${(index * 360) / FEATHERS}) translate(0 ${-RING}) scale(1.45)`}
          />
        ))}
      </g>

      {/* Beads, the other way round. A dash of nothing between round caps is
          a dotted line that stays round at any stroke width. */}
      <circle
        className="spinner-beads"
        cx="60"
        cy="60"
        r="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="0 7"
      />

    </svg>
  )
}
