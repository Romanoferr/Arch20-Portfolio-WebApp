import sharp from 'sharp'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
  <rect width="180" height="180" fill="#8b7355"/>
</svg>`

const buf = Buffer.from(svg)

await sharp(buf).resize(180, 180).png().toFile('public/apple-touch-icon.png')
await sharp(buf).resize(32, 32).png().toFile('public/favicon.png')

// OG Image placeholder (1200x630) - substituir pela arte do cliente.
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#8b7355"/>
  <text x="600" y="320" font-family="Georgia, serif" font-size="56" fill="#fafaf8"
        text-anchor="middle" dominant-baseline="middle">Arquitetura &amp; Design</text>
</svg>`
await sharp(Buffer.from(og)).jpeg({ quality: 90 }).toFile('public/images/og-image.jpg')

console.log('OK')