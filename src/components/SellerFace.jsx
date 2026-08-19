import { assetUrl } from '../lib/format.js'

export function SellerFace({ seller, size = 'row' }) {
  if (!seller?.photo) return null

  return (
    <span className={`seller-face seller-face-${size}`}>
      <img src={assetUrl(seller.photo)} alt="" />
      <em>{seller.name}</em>
    </span>
  )
}
