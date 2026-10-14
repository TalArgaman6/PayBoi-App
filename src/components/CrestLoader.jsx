/*
 * The crest, blinking. A deal that waits on another person is the one kind
 * that has nothing to show — so instead of a code the sheet shows the app's
 * own mark with its three feathers lighting in turn, the way three dots stand
 * for a message being typed. It is the brand doing the waiting rather than a
 * borrowed spinner. Shared, because both sides of a deal wait: the buyer in
 * the detail sheet and the seller answering a request in the feed.
 */
export function CrestLoader() {
  return (
    <svg className="crest-loader" viewBox="-5 -2 39 34" aria-hidden="true">
      <g fill="currentColor" transform="rotate(-18 18 26)">
        <g className="crest-dot">
          <path d="M14.4 26c-1.9-3.8-3.3-7.4-4.2-11l1.1-.4c1.5 3.6 2.6 7.3 3.4 11.4z" />
          <g transform="translate(8.6 10.3) rotate(-40)">
            <path d="M0-6.2C1.7-4 3.4-2.4 3.4.3 3.4 3 1.9 4.8 0 4.8-1.9 4.8-3.4 3-3.4.3-3.4-2.4-1.7-4 0-6.2Z" />
          </g>
        </g>
        <g className="crest-dot">
          <path d="M18 26c-.5-4.2-.6-8.2-.2-12.1h1.2c.4 3.9.3 7.9-.2 12.1z" />
          <g transform="translate(18 8.6) rotate(-15)">
            <path d="M0-6.2C1.7-4 3.4-2.4 3.4.3 3.4 3 1.9 4.8 0 4.8-1.9 4.8-3.4 3-3.4.3-3.4-2.4-1.7-4 0-6.2Z" />
          </g>
        </g>
        <g className="crest-dot">
          <path d="M21.6 26c1.9-3.8 3.3-7.4 4.2-11l-1.1-.4c-1.5 3.6-2.6 7.3-3.4 11.4z" />
          <g transform="translate(27.4 10.3) rotate(7)">
            <path d="M0-6.2C1.7-4 3.4-2.4 3.4.3 3.4 3 1.9 4.8 0 4.8-1.9 4.8-3.4 3-3.4.3-3.4-2.4-1.7-4 0-6.2Z" />
          </g>
        </g>
      </g>
    </svg>
  )
}
