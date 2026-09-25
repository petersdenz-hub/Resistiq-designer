import type { GarmentDefinition } from './types'
import { beanieMeta } from './beanie/definition'
import { BeanieGarment } from './beanie/BeanieGarment'

export const beanieGarment: GarmentDefinition = {
  ...beanieMeta,
  render: (props) => <BeanieGarment {...props} />,
}
