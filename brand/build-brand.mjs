// Extracts the SaintPhonie logo pieces from the brand board and builds the app icons.
// Run: node brand/build-brand.mjs
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const SRC = path.join(here, 'saintphonie-da.png')

const GREEN = '#b8d895'
const BLACK = '#121212'

/** Crops a region and turns it into a single-colour glyph with alpha taken from brightness. */
async function glyph({ left, top, width, height }, mode, out) {
  const { data, info } = await sharp(SRC).extract({ left, top, width, height }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const px = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0; i < info.width * info.height; i++) {
    const L = 0.299 * data[i * 3] + 0.587 * data[i * 3 + 1] + 0.114 * data[i * 3 + 2]
    const a = mode === 'dark-on-light' ? (235 - L) / (235 - 30) : (L - 40) / (225 - 40)
    const v = mode === 'dark-on-light' ? 18 : 255
    px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = v
    px[i * 4 + 3] = Math.round(Math.max(0, Math.min(1, a)) * 255)
  }
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } }).trim().png().toFile(out)
  return out
}

const wordmark = await glyph({ left: 125, top: 75, width: 790, height: 315 }, 'dark-on-light', path.join(root, 'src/assets/wordmark.png'))
const clef = await glyph({ left: 345, top: 1145, width: 445, height: 395 }, 'light-on-dark', path.join(root, 'src/assets/clef.png'))
console.log('wordmark and clef extracted')

/** App icon: sage green tile, black rounded square, cream treble clef (as on the brand board). */
async function icon(size, { maskable = false } = {}) {
  const pad = maskable ? 0.2 : 0.1
  const inner = Math.round(size * (1 - pad * 2))
  const off = Math.round(size * pad)
  const r = Math.round(inner * 0.16)
  const tile = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${maskable ? 0 : Math.round(size * 0.18)}" fill="${GREEN}"/>
      <rect x="${off}" y="${off}" width="${inner}" height="${inner}" rx="${r}" fill="${BLACK}"/>
    </svg>`,
  )
  const g = await sharp(clef).resize({ height: Math.round(inner * 0.72), width: Math.round(inner * 0.72), fit: 'inside' }).tint('#f5f4f0').toBuffer()
  return sharp(tile).composite([{ input: g, gravity: 'center' }]).png()
}

const pub = (f) => path.join(root, 'public', f)
await (await icon(64)).toFile(pub('pwa-64x64.png'))
await (await icon(192)).toFile(pub('pwa-192x192.png'))
await (await icon(512)).toFile(pub('pwa-512x512.png'))
await (await icon(512, { maskable: true })).toFile(pub('maskable-icon-512x512.png'))
await (await icon(180, { maskable: true })).flatten({ background: GREEN }).toFile(pub('apple-touch-icon-180x180.png'))
await (await icon(48)).toFile(pub('favicon-48x48.png'))
console.log('icons written', path.basename(wordmark))
