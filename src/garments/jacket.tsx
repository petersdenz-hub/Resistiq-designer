import type { GarmentDefinition } from './types'
import { jacketMeta } from './jacket/definition'
import { JacketGarment } from './jacket/JacketGarment'

export const jacketGarment: GarmentDefinition = {
  ...jacketMeta,
  render: (props) => <JacketGarment {...props} />,
}
