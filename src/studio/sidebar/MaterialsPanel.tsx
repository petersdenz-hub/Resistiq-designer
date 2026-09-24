import { resolveConstruction } from '@/design'
import { useDesign } from '@/design/useDesign'
import {
  controlValue,
  visibleConstructionControls,
} from '@/garments/constructionOptions'
import { MATERIAL_CATALOG } from '@/garments/materialCatalog'
import { getGarment } from '@/garments/registry'
import { Field } from '@/ui'

export function MaterialsPanel() {
  const { document, setGarmentMaterial, setConstructionStyle, setConstructionVariant } = useDesign()
  const garment = getGarment(document.garmentType)
  const resolved = resolveConstruction(document)
  const controls = visibleConstructionControls(document.garmentType, resolved)
  const materialId = document.construction?.materialId
  const source = document.construction ? 'document' : 'default'

  return (
    <div className="space-y-5" data-construction-editor="true" data-construction-source={source}>
      <p className="text-[12px] leading-5 text-mute">
        Fabric and construction live on the Design Document. Changes draw on this{' '}
        {garment.name.toLowerCase()} immediately.
      </p>

      <section className="space-y-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Fabric</div>
        <div className="grid grid-cols-2 gap-1.5">
          {MATERIAL_CATALOG.map((material) => {
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

      <section className="space-y-3">
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

      <p className="text-[11px] leading-4 text-mute">
        Construction is garment structure, not a design element. Panel colors stay on the panel.
      </p>
    </div>
  )
}
