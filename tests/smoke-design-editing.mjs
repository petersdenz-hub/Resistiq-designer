import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const PORT = 5173
const BASE = `http://127.0.0.1:${PORT}`

async function waitForServer() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(BASE)
      if (response.ok) {
        return
      }
    } catch {
      // keep waiting
    }
    await delay(250)
  }
  throw new Error('Vite did not start')
}

async function clickText(page, text) {
  const found = await page.evaluate((needle) => {
    const nodes = [...document.querySelectorAll('button, [role="button"]')]
    const match = nodes.find((node) => node.textContent?.trim() === needle)
    if (!match) {
      return false
    }
    match.click()
    return true
  }, text)
  if (!found) {
    throw new Error(`Could not click "${text}"`)
  }
}

async function run() {
  const puppeteer = await import('puppeteer-core')
  let vite = null
  if (!(await fetch(BASE).then((response) => response.ok).catch(() => false))) {
    vite = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
      stdio: 'pipe',
    })
  }
  await waitForServer()

  const browser = await puppeteer.default.launch({
    executablePath: process.env.CHROME_PATH || '/usr/local/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  })
  const page = await browser.newPage()
  page.setDefaultTimeout(8000)
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(BASE, { waitUntil: 'networkidle0' })

  const newDesign = await page.$('button')
  if (!newDesign) {
    throw new Error('No buttons on dashboard')
  }
  await clickText(page, 'New design').catch(() => clickText(page, 'Create your first design'))
  await delay(200)
  await clickText(page, 'T-shirt')
  await page.waitForSelector('#design-stage')
  await page.click('button[aria-label="Design"]')
  await page.waitForSelector('[data-design-panel="true"]')
  await page.click('[data-add-design-text="true"]')
  await page.click('[data-add-design-shape="true"]')
  await delay(150)

  const objectCount = await page.$$eval('[data-design-object]', (nodes) => nodes.length)
  if (objectCount < 2) {
    throw new Error(`Expected 2 design objects, found ${objectCount}`)
  }

  const layerRows = await page.$$('[data-layer-row]')
  if (layerRows.length < 2) {
    throw new Error('Layers did not list both objects')
  }
  await layerRows[0].click()
  await page.keyboard.down('Shift')
  await layerRows[1].click()
  await page.keyboard.up('Shift')
  await delay(150)

  const selectedCount = await page.$eval('[data-edit-toolbar="true"]', (node) =>
    Number(node.getAttribute('data-selected-count')),
  )
  if (selectedCount < 2) {
    throw new Error(`Toolbar did not show multi-selection, count=${selectedCount}`)
  }

  await page.click('[data-action="group"]')
  await delay(100)
  const grouped = await page.$$eval('[data-layer-group]', (nodes) =>
    nodes.filter((node) => (node.getAttribute('data-layer-group') || '').length > 0).length,
  )
  if (grouped < 2) {
    throw new Error('Group did not mark both layers')
  }

  await page.click('[data-action="align"]')
  await page.waitForSelector('[data-align="left"]')
  await page.click('[data-align="left"]')
  await delay(100)

  await page.click('[data-action="duplicate"]')
  await delay(150)
  const afterDup = await page.$$eval('[data-design-object]', (nodes) => nodes.length)
  if (afterDup < 4) {
    throw new Error(`Duplicate did not keep relative copies, count=${afterDup}`)
  }

  const lockButtons = await page.$$('[data-layer-lock]')
  await lockButtons[0].click()
  await delay(80)
  const locked = await page.$('[data-object-locked="true"]')
  if (!locked) {
    throw new Error('Locking from layers did not mark an object locked')
  }

  await page.click('[data-zone-option="back"]')
  await delay(100)
  const backCount = await page.$$eval('[data-design-object]', (nodes) => nodes.length)
  if (backCount !== 0) {
    throw new Error(`Back zone showed front artwork (${backCount})`)
  }
  await page.click('[data-zone-option="front"]')
  await delay(100)
  const frontCount = await page.$$eval('[data-design-object]', (nodes) => nodes.length)
  if (frontCount < 4) {
    throw new Error('Front artwork was lost after switching zones')
  }

  const nameField = await page.$('[data-object-name="true"], [data-layer-name]')
  if (!nameField) {
    throw new Error('Object names are missing from the editor')
  }

  await browser.close()
  if (vite) {
    vite.kill('SIGTERM')
  }
  console.log('Phase 7B.7 browser smoke passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
