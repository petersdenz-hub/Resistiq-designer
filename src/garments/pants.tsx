import { BottomsGarment } from './bottoms/BottomsGarment'
import { pantsMeta } from './bottoms/definition'
import type { GarmentDefinition } from './types'

export const pantsGarment: GarmentDefinition = {
  ...pantsMeta,
  render: (props) => <BottomsGarment {...props} kind="pants" />,
}
