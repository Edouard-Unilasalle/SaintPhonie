// Builds candidate app icons and a preview sheet showing them as Android would (squircle mask).
// Run: node brand/icon-variants.mjs [variant]   (with a variant name, also writes the final icons to public/)
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const CLEF = path.join(root, 'src/assets/clef.png')
const C = { lav: '#8799c6', plum: '#7d0f43', coral: '#e07673', sage: '#b8d895', black: '#121212', cream: '#f5f4f0' }

const stripes = (s) =>
  [C.lav, C.plum, C.coral, C.sage].map((c, i) => `<rect x="${(i * s) / 4}" width="${s / 4 + 1}" height="${s}" fill="${c}"/>`).join('')
const oval = (s, fill, h = 0.66) => {
  const ry = (s * h) / 2
  return `<ellipse cx="${s / 2}" cy="${s / 2}" rx="${ry * 0.77}" ry="${ry}" fill="${fill}"/>`
}

/** Each variant: full-bleed background (maskable safe), clef colour and clef height (share of icon). */
const VARIANTS = {
  stripes: { bg: (s) => stripes(s) + oval(s, C.black), clef: C.cream, h: 0.46 },
  plum: { bg: (s) => `<rect width="${s}" height="${s}" fill="${C.plum}"/>` + oval(s, C.sage), clef: C.black, h: 0.46 },
  lavender: { bg: (s) => `<rect width="${s}" height="${s}" fill="${C.lav}"/>`, clef: C.cream, h: 0.6 },
  night: {
    bg: (s) =>
      `<rect width="${s}" height="${s}" fill="${C.black}"/>` +
      [C.lav, C.plum, C.coral, C.sage].map((c, i) => `<rect x="${s * 0.2 + (i * s * 0.6) / 4}" y="${s * 0.76}" width="${(s * 0.6) / 4 + 1}" height="${s * 0.05}" fill="${c}"/>`).join(''),
    clef: C.cream,
    h: 0.5,
    dy: -0.04,
  },
}

async function render(name, size, { rounded = 0 } = {}) {
  const v = VARIANTS[name]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${v.bg(size)}</svg>`
  const shape = await sharp(CLEF).resize({ height: Math.round(size * v.h) }).toBuffer()
  const meta = await sharp(shape).metadata()
  // Solid colour cut out by the clef shape, so any colour works (black included).
  const clef = await sharp({ create: { width: meta.width, height: meta.height, channels: 4, background: v.clef } })
    .composite([{ input: shape, blend: "dest-in" }])
    .png()
    .toBuffer()
  const left = Math.round((size - meta.width) / 2 + size * 0.02)
  const top = Math.round((size - meta.height) / 2 + size * (v.dy ?? 0))
  let img = sharp(Buffer.from(svg)).composite([{ input: clef, left, top }]).png()
  if (rounded) {
    const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size * rounded}" fill="#fff"/></svg>`)
    img = sharp(await img.toBuffer()).composite([{ input: mask, blend: 'dest-in' }]).png()
  }
  return img.toBuffer()
}

const pick = process.argv[2]
if (pick) {
  if (!VARIANTS[pick]) throw new Error(`Unknown variant ${pick}`)
  const pub = (f) => path.join(root, 'public', f)
  // Same artwork everywhere: full-bleed for Android (maskable), rounded corners for browsers.
  await sharp(await render(pick, 512)).toFile(pub('maskable-icon-512x512.png'))
  await sharp(await render(pick, 512, { rounded: 0.22 })).toFile(pub('pwa-512x512.png'))
  await sharp(await render(pick, 192, { rounded: 0.22 })).toFile(pub('pwa-192x192.png'))
  await sharp(await render(pick, 64, { rounded: 0.22 })).toFile(pub('pwa-64x64.png'))
  await sharp(await render(pick, 48, { rounded: 0.22 })).toFile(pub('favicon-48x48.png'))
  await sharp(await render(pick, 180)).toFile(pub('apple-touch-icon-180x180.png'))
  console.log('icons written for', pick)
} else {
  // Preview sheet: each variant in an Android-like squircle on a dark blue wallpaper.
  const S = 220, gap = 60, names = Object.keys(VARIANTS)
  const W = names.length * (S + gap) + gap, H = S + 120
  const tiles = []
  for (const [i, n] of names.entries()) {
    tiles.push({ input: await render(n, S, { rounded: 0.32 }), left: gap + i * (S + gap), top: 40 })
  }
  const labels = names
    .map((n, i) => `<text x="${gap + i * (S + gap) + S / 2}" y="${S + 90}" font-family="Arial" font-size="26" fill="#fff" text-anchor="middle">${i + 1}. ${n}</text>`)
    .join('')
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#4a5a72"/>${labels}</svg>`
  const out = path.join(here, 'icon-variants-preview.png')
  await sharp(Buffer.from(bg)).composite(tiles).png().toFile(out)
  console.log(out)
}
