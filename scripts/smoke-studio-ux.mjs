import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const PORT = 5173
const BASE = `http://127.0.0.1:${PORT}`
const ARTIFACTS = '/opt/cursor/artifacts'
const SMOKE_PNG = join(tmpdir(), 'resistq-14-mark.png')

writeFileSync(
  SMOKE_PNG,
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  ),
)
mkdirSync(ARTIFACTS, { recursive: true })

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

async function shot(page, name) {
  await page.screenshot({ path: join(ARTIFACTS, name), fullPage: false })
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
  page.setDefaultTimeout(12000)
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(BASE, { waitUntil: 'networkidle0' })

  await clickText(page, 'New design').catch(() => clickText(page, 'Create your first design'))
  await page.waitForSelector('[data-garment-group="tops"]')
  await page.waitForSelector('[data-garment-group="bottoms"]')
  await page.waitForSelector('[data-garment-group="headwear"]')
  const pickerGroups = await page.$$eval('[data-garment-group]', (nodes) =>
    nodes.map((node) => node.getAttribute('data-garment-group')),
  )
  if (pickerGroups.join(',') !== 'tops,bottoms,headwear') {
    throw new Error(`Picker groups are wrong: ${pickerGroups.join(',')}`)
  }
  await shot(page, 'studio_picker_grouped.png')
  await clickText(page, 'T-shirt')
  await page.waitForSelector('#design-stage')
  await page.waitForSelector('[data-design-panel="true"]')
  await page.waitForSelector('[data-garment-selector="true"]')
  await page.waitForSelector('[data-empty-state="true"]')
  await page.waitForSelector('[data-garment-customization="true"]')
  await shot(page, 'studio_tshirt_empty.png')

  const sleeve = await page.$('[data-color-region="left-sleeve"] [data-color-preset="#8b3a3a"]')
  if (!sleeve) {
    throw new Error('T-shirt color swatches are missing')
  }
  await sleeve.click()
  await delay(80)

  await page.click('[data-material-option="fleece"]')
  await delay(80)
  if (!(await page.$('[data-material-option="fleece"][aria-pressed="true"]'))) {
    throw new Error('Fleece was not selected')
  }

  await page.click('[data-add-design-text="true"]')
  await delay(120)
  await page.waitForSelector('[data-properties-kind="design-object"]')
  await page.waitForSelector('[data-text-content="true"]')
  await page.$eval('[data-text-content="true"]', (node) => {
    node.focus()
    node.value = 'RESISTIQ'
    node.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await delay(80)

  const textBox = await page.$('[data-design-object]')
  if (!textBox) {
    throw new Error('Text object was not created and selected')
  }
  const box = await textBox.boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 24, box.y + box.height / 2 + 18)
    await page.mouse.up()
    const handle = await page.$('[data-selection-bounds="true"]')
    if (handle) {
      const handleBox = await handle.boundingBox()
      if (handleBox) {
        await page.mouse.move(handleBox.x + handleBox.width - 2, handleBox.y + handleBox.height - 2)
        await page.mouse.down()
        await page.mouse.move(handleBox.x + handleBox.width + 20, handleBox.y + handleBox.height + 16)
        await page.mouse.up()
      }
    }
  }
  await shot(page, 'studio_tshirt_text.png')

  const imageInput = await page.$('[data-design-panel="true"] input[type="file"]')
  if (!imageInput) {
    throw new Error('Logo / image input is missing')
  }
  await imageInput.uploadFile(SMOKE_PNG)
  await delay(200)
  const objects = await page.$$eval('[data-design-object]', (nodes) => nodes.length)
  if (objects < 2) {
    throw new Error(`Expected text and logo, found ${objects}`)
  }

  await page.click('[data-garment-view="back"]')
  await delay(80)
  await page.click('[data-garment-view="front"]')
  await delay(80)
  const textLayer = await page.$('[data-layer-row]')
  if (textLayer) {
    await textLayer.click()
    await delay(80)
  }
  await shot(page, 'studio_tshirt_artwork.png')

  await clickText(page, 'Preview')
  await page.waitForSelector('[data-preview-overlay="true"]')
  if (await page.$('[data-preview-overlay="true"] [data-selection-bounds]')) {
    throw new Error('Preview showed editor handles')
  }
  await shot(page, 'studio_tshirt_preview.png')
  await clickText(page, 'Close')
  await delay(80)

  await page.click('input[aria-label="Design name"]')
  await page.keyboard.down('Control')
  await page.keyboard.press('KeyA')
  await page.keyboard.up('Control')
  await page.keyboard.type('Phase 15 Tee')
  await page.keyboard.press('Enter')
  await delay(80)
  await clickText(page, 'Save')
  await delay(200)
  const saved = await page.$('[data-save-status="saved"]')
  if (!saved) {
    throw new Error('Save status did not become saved')
  }

  await page.reload({ waitUntil: 'networkidle0' })
  await page.waitForFunction(() =>
    [...document.querySelectorAll('button')].some((node) => node.textContent?.includes('Open')),
  )
  await clickText(page, 'Open')
  await page.waitForSelector('#design-stage')
  const reloaded = await page.$$eval('[data-design-object]', (nodes) => nodes.length)
  if (reloaded < 2) {
    throw new Error(`Reload lost artwork (${reloaded})`)
  }

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

  async function switchGarment(type) {
    await page.click('button[aria-label="Garment"]')
    await page.waitForSelector(`[data-garment-option="${type}"]`)
    await page.click(`[data-garment-option="${type}"]`)
    const dialog = await page.$('[data-dialog="true"]')
    if (dialog) {
      await clickText(page, 'Continue')
    }
    await page.waitForFunction(
      (next) => document.querySelector(`[data-garment-type="${next}"]`),
      {},
      type,
    )
    const front = await page.$('[data-zone-option="front"]')
    if (front) {
      await front.click()
    }
    await delay(80)
    const count = await page.$$eval('[data-design-object]', (nodes) => nodes.length)
    if (count < 2) {
      throw new Error(`Artwork was lost after switching to ${type} (${count})`)
    }
  }

  await switchGarment('cap')
  await clearSelection()
  await page.waitForSelector('[data-color-region="brim"]')
  const brim = await page.$('[data-color-region="brim"] [data-color-preset="#1e2a4a"]')
  if (brim) {
    await brim.click()
  }
  await page.click('[data-material-option="nylon"]')
  await delay(80)
  await shot(page, 'studio_cap.png')

  await switchGarment('beanie')
  await clearSelection()
  await page.waitForSelector('[data-color-region="cuff"]')
  const cuff = await page.$('[data-color-region="cuff"] [data-color-preset="#1e2a4a"]')
  if (cuff) {
    await cuff.evaluate((node) => node.scrollIntoView({ block: 'center' }))
    await cuff.click()
  }
  await page.click('[data-material-option="cotton"]')
  await delay(80)
  await shot(page, 'studio_beanie.png')

  await switchGarment('tshirt')
  await clearSelection()
  await page.waitForSelector('[data-color-region="front-body"]')
  const finalCount = await page.$$eval('[data-design-object]', (nodes) => nodes.length)
  if (finalCount < 2) {
    throw new Error(`Artwork disappeared after returning to T-shirt (${finalCount})`)
  }
  await shot(page, 'studio_tshirt_after_switch.png')

  await page.setViewport({ width: 1024, height: 768 })
  await delay(250)
  await shot(page, 'studio_tablet.png')

  await page.setViewport({ width: 390, height: 844 })
  await delay(250)
  await shot(page, 'studio_mobile.png')
  await page.click('button[aria-label="Design"]')
  await delay(200)
  await shot(page, 'studio_mobile_design.png')

  await browser.close()
  if (vite) {
    vite.kill('SIGTERM')
  }
  console.log('Phase 15 browser smoke passed')
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
