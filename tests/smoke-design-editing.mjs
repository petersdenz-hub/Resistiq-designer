import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const SMOKE_PNG = join(tmpdir(), 'resistq-8-mark.png')
writeFileSync(
  SMOKE_PNG,
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  ),
)

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
    const match = nodes.find((node) => node.textContent?.replace(/\s+/g, ' ').includes(needle))
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
  await page.waitForFunction(() =>
    [...document.querySelectorAll('button')].some((node) => node.textContent?.includes('T-shirt')),
  )
  await clickText(page, 'T-shirt')
  await page.waitForSelector('#design-stage')
  await page.click('button[aria-label="Design"]')
  await page.waitForSelector('[data-design-panel="true"]')
  await page.waitForSelector('[data-toolbar-mode="empty"]')
  await page.waitForSelector('[data-empty-state="true"]')
  await page.waitForSelector('[data-zoom-fit="true"]')
  await page.waitForSelector('[data-design-breadcrumb="true"]')
  await page.waitForSelector('[data-garment-color-control="true"]')
  await page.waitForSelector('[data-garment-customization="true"]')

  const tshirtRegions = await page.$$eval('[data-color-region]', (nodes) =>
    nodes.map((node) => node.getAttribute('data-color-region')),
  )
  if (!tshirtRegions.includes('body') || !tshirtRegions.includes('sleeve-left') || !tshirtRegions.includes('collar')) {
    throw new Error(`T-shirt color regions are wrong: ${tshirtRegions.join(',')}`)
  }
  if (tshirtRegions.includes('hood') || tshirtRegions.includes('waistband')) {
    throw new Error('T-shirt showed unsupported color regions')
  }

  const sleeveRegion = await page.$('[data-color-region="sleeve-left"] [data-color-preset="#8b3a3a"]')
  if (!sleeveRegion) {
    throw new Error('Region color presets are missing')
  }
  await sleeveRegion.click()
  await delay(80)

  await page.click('[data-material-option="fleece"]')
  await delay(80)
  const fleece = await page.$('[data-material-option="fleece"][aria-pressed="true"]')
  if (!fleece) {
    throw new Error('Fleece material was not selected')
  }

  await page.waitForSelector('[data-construction-control="collar"]')
  const hoodControl = await page.$('[data-construction-control="hood"]')
  if (hoodControl) {
    throw new Error('T-shirt showed hoodie construction')
  }
  await page.click('[data-construction-option="collar:vneck"]')
  await delay(80)

  await page.click('[data-guide-toggle="print-area"]')
  await delay(40)
  await page.click('[data-guide-toggle="safe-area"]')
  await delay(40)
  await page.click('[data-guide-toggle="guides"]')
  await delay(80)
  const guides = await page.$eval('#design-stage', () => {
    const print = document.querySelector('[data-guide-toggle="print-area"]')
    const safe = document.querySelector('[data-guide-toggle="safe-area"]')
    const all = document.querySelector('[data-guide-toggle="guides"]')
    return {
      print: print?.getAttribute('aria-pressed'),
      safe: safe?.getAttribute('aria-pressed'),
      guides: all?.getAttribute('aria-pressed'),
    }
  })
  if (guides.print !== 'false' || guides.safe !== 'false' || guides.guides !== 'true') {
    throw new Error(`Guide toggles did not flip: ${JSON.stringify(guides)}`)
  }
  await page.click('[data-guide-toggle="print-area"]')
  await page.click('[data-guide-toggle="safe-area"]')
  await page.click('[data-guide-toggle="guides"]')
  await delay(60)

  await page.click('[data-add-design-text="true"]')
  await page.click('[data-add-design-shape="true"]')
  await delay(150)

  const objectCount = await page.$$eval('[data-design-object]', (nodes) => nodes.length)
  if (objectCount < 2) {
    throw new Error(`Expected 2 design objects, found ${objectCount}`)
  }
  const clipped = await page.$('[data-artwork-clip="true"]')
  if (!clipped) {
    throw new Error('Artwork clipping is not enabled on the canvas')
  }

  const addToolsAfterSelect = await page.$('[data-add-design-text="true"]')
  if (!addToolsAfterSelect) {
    throw new Error('Artwork add tools disappeared after selecting an object')
  }
  await page.waitForSelector('[data-action="duplicate"]')
  await page.waitForSelector('[data-action="lock"]')
  await page.waitForSelector('[data-selection-bounds="true"]')
  await page.waitForSelector('[data-artwork-properties="true"]')

  await page.click('[data-shape-menu="true"]')
  await page.waitForSelector('[data-shape-kind="circle"]')
  await page.click('[data-shape-kind="circle"]')
  await delay(120)
  const withCircle = await page.$$eval('[data-design-object]', (nodes) => nodes.length)
  if (withCircle < 3) {
    throw new Error(`Circle shape was not added, count=${withCircle}`)
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

  const toolbar = await page.$eval('[data-edit-toolbar="true"]', (node) => ({
    count: Number(node.getAttribute('data-selected-count')),
    mode: node.getAttribute('data-toolbar-mode'),
  }))
  if (toolbar.count < 2 || toolbar.mode !== 'multi') {
    throw new Error(`Toolbar did not show multi-selection, ${JSON.stringify(toolbar)}`)
  }
  const sections = await page.$eval('[data-properties-kind="multi-object"]', (node) =>
    node.getAttribute('data-property-sections'),
  )
  if (!sections?.includes('align')) {
    throw new Error('Multi-select properties are missing the align section')
  }

  await page.click('[data-action="group"]')
  await delay(100)
  const grouped = await page.$$eval('[data-layer-group]', (nodes) =>
    nodes.filter((node) => (node.getAttribute('data-layer-group') || '').length > 0).length,
  )
  if (grouped < 2) {
    throw new Error('Group did not mark both layers')
  }

  await page.waitForSelector('[data-align="left"]')
  await page.click('[data-align="left"]')
  await delay(100)

  await page.click('[data-action="duplicate"]')
  await delay(150)
  const afterDup = await page.$$eval('[data-design-object]', (nodes) => nodes.length)
  if (afterDup < 5) {
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
  if (frontCount < 5) {
    throw new Error('Front artwork was lost after switching zones')
  }

  const nameField = await page.$('[data-object-name="true"], [data-layer-name]')
  if (!nameField) {
    throw new Error('Object names are missing from the editor')
  }

  const imageInput = await page.$('[data-design-panel="true"] input[type="file"]')
  if (!imageInput) {
    throw new Error('Logo / image upload is missing')
  }
  await imageInput.uploadFile(SMOKE_PNG)
  await delay(400)
  const withImage = await page.$$eval('[data-design-object]', (nodes) => nodes.length)
  if (withImage < 6) {
    throw new Error(`Logo / image was not added, count=${withImage}`)
  }

  await page.click('[data-garment-color="#1a1a1a"]')
  await delay(80)

  await clickText(page, 'Preview')
  await page.waitForSelector('[data-preview-stage="true"]')
  const preview = await page.$eval('[data-preview-stage="true"]', (node) => ({
    garment: node.getAttribute('data-garment-type'),
    color: node.getAttribute('data-garment-color'),
    artwork: Number(node.getAttribute('data-preview-artwork')),
    handles: node.getAttribute('data-preview-handles'),
    seams: node.getAttribute('data-preview-seams'),
    guides: node.getAttribute('data-preview-guides'),
  }))
  if (
    preview.garment !== 'tshirt' ||
    preview.handles !== 'false' ||
    preview.seams !== 'true' ||
    preview.guides !== 'false'
  ) {
    throw new Error(`Preview chrome is wrong: ${JSON.stringify(preview)}`)
  }
  if (preview.artwork < 1) {
    throw new Error('Preview did not render artwork')
  }
  const previewHandles = await page.$('[data-preview-overlay="true"] [data-selection-bounds]')
  if (previewHandles) {
    throw new Error('Preview showed editing handles')
  }
  const previewGuides = await page.$('[data-preview-stage="true"] [data-editor-chrome="true"]')
  if (previewGuides) {
    throw new Error('Preview showed design guides')
  }
  await clickText(page, 'Close')
  await delay(80)

  await page.click('button[aria-label="Garment"]')
  await page.waitForSelector('[data-garment-selector="true"]')
  await page.waitForSelector('[data-garment-nav="true"]')

  async function clearSelection() {
    await page.evaluate(() => {
      const active = document.activeElement
      if (active instanceof HTMLElement) {
        active.blur()
      }
    })
    await page.keyboard.press('Escape')
    await delay(80)
  }

  async function switchGarment(type, extraCheck) {
    await page.click(`[data-garment-option="${type}"]`)
    await page.waitForSelector('[data-dialog="true"]')
    await clickText(page, 'Continue')
    await page.waitForFunction(
      (next) => document.querySelector(`[data-garment-type="${next}"]`),
      {},
      type,
    )
    if (extraCheck) {
      await extraCheck()
    }
    const frontButton = await page.$('[data-zone-option="front"]')
    if (frontButton) {
      await frontButton.click()
      await delay(80)
    }
    const count = await page.$$eval('[data-design-object]', (nodes) => nodes.length)
    if (count < 6) {
      throw new Error(`Artwork was lost after switching to ${type} (${count})`)
    }
  }

  await switchGarment('hoodie', async () => {
    await clearSelection()
    await page.waitForSelector('[data-garment-customization="true"]')
    const regions = await page.$$eval('[data-color-region]', (nodes) =>
      nodes.map((node) => node.getAttribute('data-color-region')),
    )
    if (!regions.includes('hood') || !regions.includes('cuffs') || regions.includes('waistband')) {
      throw new Error(`Hoodie regions are wrong: ${regions.join(',')}`)
    }
    await page.waitForSelector('[data-construction-control="hood"]')
    await page.waitForSelector('[data-construction-option="pocket:kangaroo"]')
  })
  await switchGarment('sweatshirt', async () => {
    await clearSelection()
    await page.waitForSelector('[data-garment-customization="true"]')
    const regions = await page.$$eval('[data-color-region]', (nodes) =>
      nodes.map((node) => node.getAttribute('data-color-region')),
    )
    if (!regions.includes('collar') || !regions.includes('cuffs') || regions.includes('hood')) {
      throw new Error(`Sweatshirt regions are wrong: ${regions.join(',')}`)
    }
  })
  await switchGarment('jacket', async () => {
    await clearSelection()
    await page.waitForSelector('[data-garment-customization="true"]')
    const regions = await page.$$eval('[data-color-region]', (nodes) =>
      nodes.map((node) => node.getAttribute('data-color-region')),
    )
    if (!regions.includes('front-left') || !regions.includes('front-right') || regions.includes('cuffs')) {
      throw new Error(`Jacket regions are wrong: ${regions.join(',')}`)
    }
    await page.waitForSelector('[data-construction-control="zipper"]')
  })
  await switchGarment('pants', async () => {
    await page.waitForSelector('[data-zone-option="left-leg"]')
    await clearSelection()
    await page.waitForSelector('[data-garment-customization="true"]')
    const regions = await page.$$eval('[data-color-region]', (nodes) =>
      nodes.map((node) => node.getAttribute('data-color-region')),
    )
    if (!regions.includes('leg-left') || !regions.includes('waistband')) {
      throw new Error(`Pants regions are wrong: ${regions.join(',')}`)
    }
  })
  await switchGarment('shorts', async () => {
    await page.waitForSelector('[data-zone-option="right-leg"]')
    await clearSelection()
    await page.waitForSelector('[data-garment-customization="true"]')
    const cargo = await page.$('[data-construction-control="cargo_pocket"]')
    if (cargo) {
      throw new Error('Shorts showed pants cargo pockets')
    }
  })
  await switchGarment('tshirt', async () => {
    await page.waitForSelector('[data-zone-option="left-sleeve"]')
    await clearSelection()
    await page.waitForSelector('[data-garment-customization="true"]')
    const regions = await page.$$eval('[data-color-region]', (nodes) =>
      nodes.map((node) => node.getAttribute('data-color-region')),
    )
    if (!regions.includes('body') || regions.includes('hood')) {
      throw new Error(`Returned T-shirt regions are wrong: ${regions.join(',')}`)
    }
  })

  await browser.close()
  if (vite) {
    vite.kill('SIGTERM')
  }
  console.log('Phase 8 browser smoke passed')
  process.exit(0)
}

run().catch((event) => {
  console.error(event)
  process.exit(1)
})
