import type { GarmentDefinition } from './types'
import { capMeta } from './cap/definition'
import { CapGarment } from './cap/CapGarment'

export const capGarment: GarmentDefinition = {
  ...capMeta,
  render: (props) => <CapGarment {...props} />,
}
