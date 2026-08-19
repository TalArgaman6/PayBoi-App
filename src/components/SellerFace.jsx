import { assetUrl } from '../lib/format.js'

export function SellerFace({ seller, size = 'row' }) {
  if (!seller?.photo) return null

  return (
    <span className={`seller-face seller-face-${size}`}>
      <img src={assetUrl(seller.photo)} alt="" />
      <em>
        {seller.name}
        <svg className="seller-ig" viewBox="0 0 24 24" aria-hidden="true">
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="12"
            cy="12"
            r="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
        </svg>
      </em>
    </span>
  )
}
