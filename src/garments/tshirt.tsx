import { TShirtArtwork } from './TShirtArtwork'
import type { GarmentDefinition } from './types'

export const tshirtGarment: GarmentDefinition = {
  id: 'tshirt',
  label: 'T-shirt',
  views: [
    { id: 'front', label: 'Front' },
    { id: 'back', label: 'Back' },
  ],
  viewBox: { width: 400, height: 520 },
  printArea: {
    front: { x: 142, y: 168, width: 116, height: 168 },
    back: { x: 142, y: 156, width: 116, height: 180 },
  },
  render: (props) => <TShirtArtwork {...props} />,
}
