import type { DesignConstruction } from '@/design/types'

/**
 * Read-time defaults that describe the current hardcoded garment flats.
 * These are never written onto existing documents.
 */
export function defaultConstructionFor(garmentType: string): DesignConstruction {
  switch (garmentType) {
    case 'hoodie':
      return {
        hood: { id: 'hood', kind: 'hood', style: 'pullover', present: true, panelId: 'hood' },
        pockets: [
          {
            id: 'kangaroo_pocket',
            kind: 'pocket',
            style: 'kangaroo',
            present: true,
            panelId: 'front_body',
          },
        ],
        cuffs: [
          { id: 'cuff_right', kind: 'cuff', style: 'rib', present: true, panelId: 'cuff_right' },
          { id: 'cuff_left', kind: 'cuff', style: 'rib', present: true, panelId: 'cuff_left' },
        ],
        hem: { id: 'hem', kind: 'hem', style: 'rib', present: true, panelId: 'front_body' },
      }
    case 'jacket':
      return {
        zipper: { id: 'zipper', kind: 'zipper', style: 'center_front', present: true },
        collar: { id: 'collar', kind: 'collar', style: 'stand', present: true, panelId: 'collar' },
      }
    case 'pants':
    case 'shorts':
      return {
        waistband: {
          id: 'waistband',
          kind: 'waistband',
          style: 'faced',
          present: true,
          panelId: 'waistband',
        },
        pockets: [
          {
            id: 'back_pocket_left',
            kind: 'pocket',
            style: 'patch',
            present: true,
            panelId: 'left_leg_back',
          },
          {
            id: 'back_pocket_right',
            kind: 'pocket',
            style: 'patch',
            present: true,
            panelId: 'right_leg_back',
          },
        ],
        hem: { id: 'hem', kind: 'hem', style: 'coverstitch', present: true },
      }
    default:
      return {
        collar: { id: 'collar', kind: 'collar', style: 'crew', present: true, panelId: 'collar' },
        hem: { id: 'hem', kind: 'hem', style: 'coverstitch', present: true, panelId: 'front_body' },
      }
  }
}
