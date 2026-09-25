import { resolveConstruction } from '@/design'
import { useDesign } from '@/design/useDesign'
import {
  colorRegionsFor,
  regionColor,
  regionForPanel,
} from '@/garments/colorRegions'
import {
  controlValue,
  visibleConstructionControls,
} from '@/garments/constructionOptions'
import { visualFinishCatalog } from '@/garments/materialCatalog'
import { getGarment } from '@/garments/registry'
import { MATERIAL_BLURBS } from '@/studio/editorChrome'
import { ZoneChips } from '@/studio/ZoneChips'
import { ColorPicker, Field } from '@/ui'
import { useRef, useState } from 'react'

export function GarmentCustomization() {
  const {
    document,
    setActivePanel,
    setBodyColor,
    setRegionColor,
    setRegionMaterial,
    setGarmentMaterial,
    setConstructionStyle,
    setConstructionVariant,
    commitGesture,
  } = useDesign()
  const garment = getGarment(document.garmentType)
  const resolved = resolveConstruction(document)
  const controls = visibleConstructionControls(document.garmentType, resolved)
  const regions = colorRegionsFor(document.garmentType)
  const selectedRegion = regionForPanel(document.garmentType, document.activePanelId)
  const [openPart, setOpenPart] = useState<string | null>(selectedRegion?.id ?? regions[0]?.id ?? null)
  const materialId =
    (selectedRegion
      ? selectedRegion.panelIds
          .map((panelId) => document.colors.find((color) => color.role === 'panel' && color.id === panelId)?.materialId)
          .find((value) => value)
      : undefined) ?? document.construction?.materialId
  const originRef = useRef(document)
  const body = document.colors.find((color) => color.role === 'body')?.value ?? garment.defaults.bodyColor
  const materials = garment.capabilities.materials ? visualFinishCatalog() : []

  return (
    <div className="space-y-5" data-properties-kind="garment" data-garment-customization="true">
      <section className="space-y-1">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Garment</div>
        <div className="text-[15px] font-medium text-ink" data-garment-type-label="true">
          {garment.name}
        </div>
      </section>

      <section className="space-y-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Color</div>
        <ColorPicker
          label="Garment color"
          value={body}
          onCommit={(value) => setBodyColor(value)}
          onLiveStart={() => {
            originRef.current = document
          }}
          onLiveChange={(value) => setBodyColor(value, 'replace')}
          onLiveEnd={() => commitGesture(originRef.current)}
        />
      </section>

      <section className="space-y-1.5" data-color-regions="true">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Parts</div>
        {selectedRegion ? (
          <div className="sr-only" data-selected-region={selectedRegion.id}>
            {selectedRegion.label}
          </div>
        ) : null}
        {regions.map((region) => {
          const selected = selectedRegion?.id === region.id
          const expanded = openPart === region.id
          return (
            <div
              key={region.id}
              data-color-region={region.id}
              data-color-region-panels={region.panelIds.join(',')}
              data-color-region-selected={selected ? 'true' : 'false'}
              className="rounded-md border border-line"
            >
              <button
                type="button"
                className="flex w-full items-center gap-2 px-2 py-1.5 text-left"
                onClick={() => {
                  if (region.panelIds[0]) {
                    setActivePanel(region.panelIds[0])
                  }
                  setOpenPart(expanded ? null : region.id)
                }}
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full border border-line"
                  style={{ backgroundColor: regionColor(document, region) }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-[12px] text-ink">{region.label}</span>
                <span className="text-[10px] text-mute">{expanded ? '▾' : '▸'}</span>
              </button>
              <div className={expanded ? 'border-t border-line px-2 py-2' : 'sr-only'}>
                <ColorPicker
                  label={region.label}
                  compact={!selected}
                  value={regionColor(document, region)}
                  onCommit={(value) => {
                    if (region.panelIds[0]) {
                      setActivePanel(region.panelIds[0])
                    }
                    setRegionColor(region.panelIds, value)
                  }}
                  onLiveStart={() => {
                    originRef.current = document
                  }}
                  onLiveChange={(value) => setRegionColor(region.panelIds, value, 'replace')}
                  onLiveEnd={() => commitGesture(originRef.current)}
                />
              </div>
            </div>
          )
        })}
      </section>

      {materials.length > 0 ? (
        <section className="space-y-2" data-garment-materials="true">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Material</div>
          <div className="space-y-1">
            {materials.map((material) => {
              const selected = materialId === material.id
              return (
                <button
                  key={material.id}
                  type="button"
                  data-material-option={material.id}
                  aria-pressed={selected}
                  onClick={() => {
                    setGarmentMaterial(material.id)
                    if (selectedRegion) {
                      setRegionMaterial(selectedRegion.panelIds, material.id)
                    }
                  }}
                  className={`flex w-full items-start gap-2 rounded-md border px-2.5 py-2 text-left ${
                    selected
                      ? 'border-accent/50 bg-accent/10 text-ink'
                      : 'border-line text-mute hover:border-accent/30 hover:text-ink'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                      selected ? 'border-accent' : 'border-line'
                    }`}
                  >
                    {selected ? <span className="h-1.5 w-1.5 rounded-full bg-accent" /> : null}
                  </span>
                  <span>
                    <span className="block text-[12px] text-ink">{material.name}</span>
                    {MATERIAL_BLURBS[material.id] ? (
                      <span className="mt-0.5 block text-[10px] text-mute">{MATERIAL_BLURBS[material.id]}</span>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Design area</div>
        <ZoneChips />
      </section>

      <details open className="space-y-3" data-garment-construction="true">
        <summary className="cursor-pointer text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
          Details
        </summary>
        <div className="mt-2 space-y-3">
          {controls.map((control) => {
            const value = controlValue(resolved, control)
            return (
              <Field key={control.id} label={control.label}>
                <div
                  className="flex flex-wrap gap-1"
                  data-construction-control={control.id}
                  data-construction-control-kind={control.kind}
                  data-construction-value={value}
                >
                  {control.options.map((option) => {
                    const selected = value === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        data-construction-option={`${control.id}:${option.value}`}
                        aria-pressed={selected}
                        onClick={() => {
                          if (
                            control.field === 'variant' &&
                            (control.kind === 'zipper' || control.kind === 'hood')
                          ) {
                            setConstructionVariant(control.kind, option.value)
                            return
                          }
                          setConstructionStyle(control.kind, option.value, 'record', control.slot)
                        }}
                        className={`h-7 rounded-md border px-2 text-[11px] ${
                          selected
                            ? 'border-accent/50 bg-accent/10 text-ink'
                            : 'border-line text-mute hover:text-ink'
                        }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </Field>
            )
          })}
        </div>
      </details>
    </div>
  )
}
