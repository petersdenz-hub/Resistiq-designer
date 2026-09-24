import type { GarmentDefinition } from './types'
import { hoodieMeta } from './hoodie/definition'
import { HoodieGarment } from './hoodie/HoodieGarment'

export const hoodieGarment: GarmentDefinition = {
  ...hoodieMeta,
  render: (props) => <HoodieGarment {...props} />,
}
