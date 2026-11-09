// Extracts the SaintPhonie logo pieces from the brand board and builds the app icons.
// Run: node brand/build-brand.mjs
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const SRC = path.join(here, 'saintphonie-da.png')


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

// App icons are built by brand/icon-variants.mjs (chosen variant: stripes).
console.log('Now run: node brand/icon-variants.mjs stripes', path.basename(wordmark), path.basename(clef))
