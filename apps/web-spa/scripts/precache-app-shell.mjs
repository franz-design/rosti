import { createHash } from 'node:crypto'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'

const serviceWorkerPath = 'build/client/sw.js'
const shellPath = 'build/client/index.html'

rmSync('build/client/sw.mjs', { force: true })
const serviceWorker = readFileSync(serviceWorkerPath, 'utf8')

if (serviceWorker.includes('"url":"index.html"') || serviceWorker.includes('"url": "/index.html"')) {
  process.stdout.write('App shell is already in the precache.\n')
  process.exit(0)
}

const revision = createHash('sha256').update(readFileSync(shellPath)).digest('hex').slice(0, 20)
const entry = JSON.stringify({ url: 'index.html', revision })
const pattern = /precacheAndRoute\(\s*\[/
if (!pattern.test(serviceWorker)) {
  throw new Error('Could not find precacheAndRoute([ in build/client/sw.js')
}

writeFileSync(serviceWorkerPath, serviceWorker.replace(pattern, `precacheAndRoute([${entry},`))
process.stdout.write(`Precached index.html (${revision}).\n`)
