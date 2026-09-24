import type { GarmentDefinition } from './types'
import { tshirtMeta } from './tshirt/definition'
import { TShirtGarment } from './tshirt/TShirtGarment'

export const tshirtGarment: GarmentDefinition = {
  ...tshirtMeta,
  render: (props) => <TShirtGarment {...props} />,
}
