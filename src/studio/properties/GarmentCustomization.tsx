import { resolveConstruction } from '@/design'
import { useDesign } from '@/design/useDesign'
import {
  colorRegionsFor,
  regionColor,
} from '@/garments/colorRegions'
import {
  controlValue,
  visibleConstructionControls,
} from '@/garments/constructionOptions'
import { visualFinishCatalog } from '@/garments/materialCatalog'
import { getGarment } from '@/garments/registry'
import { ColorPicker, Field } from '@/ui'
import { useRef } from 'react'

export function GarmentCustomization() {
  const {
    document,
    setBodyColor,
    setRegionColor,
    setGarmentMaterial,
    setConstructionStyle,
    setConstructionVariant,
    commitGesture,
  } = useDesign()
  const garment = getGarment(document.garmentType)
  const resolved = resolveConstruction(document)
  const controls = visibleConstructionControls(document.garmentType, resolved)
  const regions = colorRegionsFor(document.garmentType)
  const materialId = document.construction?.materialId
  const originRef = useRef(document)
  const body = document.colors.find((color) => color.role === 'body')?.value ?? garment.defaults.bodyColor

  return (
    <div className="space-y-5" data-properties-kind="garment" data-garment-customization="true">
      <section className="space-y-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Garment</div>
        <div className="text-[13px] font-medium text-ink" data-garment-type-label="true">
          {garment.name}
        </div>
        <p className="text-[11px] leading-4 text-mute">
          Color, material, and construction belong to the garment — not to artwork.
        </p>
      </section>

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

      <section className="space-y-2" data-color-regions="true">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Regions</div>
        {regions.map((region) => (
          <div key={region.id} data-color-region={region.id} data-color-region-panels={region.panelIds.join(',')}>
            <ColorPicker
              label={region.label}
              value={regionColor(document, region)}
              onCommit={(value) => setRegionColor(region.panelIds, value)}
              onLiveStart={() => {
                originRef.current = document
              }}
              onLiveChange={(value) => setRegionColor(region.panelIds, value, 'replace')}
              onLiveEnd={() => commitGesture(originRef.current)}
            />
          </div>
        ))}
      </section>

      <section className="space-y-2" data-garment-materials="true">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Material</div>
        <div className="grid grid-cols-2 gap-1.5">
          {visualFinishCatalog().map((material) => {
            const selected = materialId === material.id
            return (
              <button
                key={material.id}
                type="button"
                data-material-option={material.id}
                aria-pressed={selected}
                onClick={() => setGarmentMaterial(material.id)}
                className={`rounded-md border px-2.5 py-2 text-left ${
                  selected
                    ? 'border-accent/50 bg-accent/10 text-ink'
                    : 'border-line text-mute hover:text-ink'
                }`}
              >
                <span className="block text-[12px] text-ink">{material.name}</span>
                <span className="mt-0.5 block text-[10px] capitalize">{material.finish}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-3" data-garment-construction="true">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
          Construction
        </div>
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
      </section>
    </div>
  )
}
