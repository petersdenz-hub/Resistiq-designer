import type { GarmentDefinition } from './types'
import { sweatshirtMeta } from './sweatshirt/definition'
import { SweatshirtGarment } from './sweatshirt/SweatshirtGarment'

export const sweatshirtGarment: GarmentDefinition = {
  ...sweatshirtMeta,
  render: (props) => <SweatshirtGarment {...props} />,
}
