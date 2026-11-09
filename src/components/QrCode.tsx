import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function QrCode({ text, className = '' }: { text: string; className?: string }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    QRCode.toDataURL(text, { margin: 1, width: 320, color: { dark: '#142849', light: '#ffffff' } })
      .then(setSrc)
      .catch(() => setSrc(''))
  }, [text])
  return src ? <img src={src} alt="Access QR code (demo)" className={className} /> : <div className={`${className} bg-sand`} />
}
