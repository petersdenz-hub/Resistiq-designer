import { BottomsGarment } from './bottoms/BottomsGarment'
import { shortsMeta } from './bottoms/definition'
import type { GarmentDefinition } from './types'

export const shortsGarment: GarmentDefinition = {
  ...shortsMeta,
  render: (props) => <BottomsGarment {...props} kind="shorts" />,
}
