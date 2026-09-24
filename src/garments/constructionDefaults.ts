import type { ConstructionKind, DesignConstruction, DesignConstructionPart } from '@/design/types'

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
        cuffs: [
          { id: 'cuff_right', kind: 'cuff', style: 'hem', present: true },
          { id: 'cuff_left', kind: 'cuff', style: 'hem', present: true },
        ],
        hem: { id: 'hem', kind: 'hem', style: 'coverstitch', present: true },
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

function part(
  kind: ConstructionKind,
  id: string,
  style: string,
  panelId?: string,
): DesignConstructionPart {
  return panelId
    ? { id, kind, style, present: true, panelId }
    : { id, kind, style, present: true }
}

/** Parts written when the user picks a style. Not used for missing-data fallback. */
export function constructionPartsForStyle(
  garmentType: string,
  kind: ConstructionKind,
  style: string,
): DesignConstructionPart[] {
  switch (kind) {
    case 'collar':
      return [part('collar', 'collar', style, 'collar')]
    case 'hood':
      return [part('hood', 'hood', style, garmentType === 'hoodie' ? 'hood' : undefined)]
    case 'zipper':
      return [part('zipper', 'zipper', style)]
    case 'hem':
      return [part('hem', 'hem', style, garmentType === 'pants' || garmentType === 'shorts' ? undefined : 'front_body')]
    case 'waistband':
      return [part('waistband', 'waistband', style, 'waistband')]
    case 'cuff':
      return garmentType === 'hoodie'
        ? [
            part('cuff', 'cuff_right', style, 'cuff_right'),
            part('cuff', 'cuff_left', style, 'cuff_left'),
          ]
        : [part('cuff', 'cuff_right', style), part('cuff', 'cuff_left', style)]
    case 'pocket':
      return pocketsForStyle(garmentType, style)
    default:
      return [part(kind, kind, style)]
  }
}

function pocketsForStyle(garmentType: string, style: string): DesignConstructionPart[] {
  if (garmentType === 'hoodie') {
    return [part('pocket', 'kangaroo_pocket', style, 'front_body')]
  }
  if (garmentType === 'jacket') {
    return [
      part('pocket', 'jacket_pocket_left', style, 'front_body_left'),
      part('pocket', 'jacket_pocket_right', style, 'front_body_right'),
    ]
  }
  return [
    part('pocket', 'back_pocket_left', style, 'left_leg_back'),
    part('pocket', 'back_pocket_right', style, 'right_leg_back'),
  ]
}
