import type { ConstructionKind, DesignConstruction, DesignConstructionPart } from '@/design/types'

/**
 * Read-time defaults that describe the current garment flats.
 * These are never written onto existing documents.
 */
export function defaultConstructionFor(garmentType: string): DesignConstruction {
  switch (garmentType) {
    case 'sweatshirt':
      return {
        collar: { id: 'collar', kind: 'collar', style: 'crew', present: true, panelId: 'collar' },
        hem: { id: 'hem', kind: 'hem', style: 'rib', present: true, panelId: 'front_body' },
        cuffs: [
          { id: 'cuff_right', kind: 'cuff', style: 'rib', present: true, panelId: 'cuff_right' },
          { id: 'cuff_left', kind: 'cuff', style: 'rib', present: true, panelId: 'cuff_left' },
        ],
      }
    case 'hoodie':
      return {
        hood: {
          id: 'hood',
          kind: 'hood',
          style: 'pullover',
          present: true,
          panelId: 'hood',
          variant: 'standard',
        },
        drawstring: { id: 'drawstring', kind: 'drawstring', style: 'cord', present: true },
        pockets: [
          {
            id: 'kangaroo_pocket',
            kind: 'pocket',
            style: 'kangaroo',
            present: true,
            panelId: 'front_body',
            slot: 'body',
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
        zipper: {
          id: 'zipper',
          kind: 'zipper',
          style: 'center_front',
          present: true,
          variant: 'metal',
        },
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
            id: 'front_pocket_left',
            kind: 'pocket',
            style: 'slash',
            present: true,
            panelId: 'left_leg',
            slot: 'front',
          },
          {
            id: 'front_pocket_right',
            kind: 'pocket',
            style: 'slash',
            present: true,
            panelId: 'right_leg',
            slot: 'front',
          },
          {
            id: 'back_pocket_left',
            kind: 'pocket',
            style: 'patch',
            present: true,
            panelId: 'left_leg_back',
            slot: 'back',
          },
          {
            id: 'back_pocket_right',
            kind: 'pocket',
            style: 'patch',
            present: true,
            panelId: 'right_leg_back',
            slot: 'back',
          },
        ],
        hem: { id: 'hem', kind: 'hem', style: 'coverstitch', present: true },
      }
    default:
      return {
        collar: { id: 'collar', kind: 'collar', style: 'crew', present: true, panelId: 'collar' },
        hem: { id: 'hem', kind: 'hem', style: 'coverstitch', present: true, panelId: 'front_body' },
        cuffs: [
          { id: 'sleeve_hem_right', kind: 'cuff', style: 'coverstitch', present: true },
          { id: 'sleeve_hem_left', kind: 'cuff', style: 'coverstitch', present: true },
        ],
      }
  }
}

function part(
  kind: ConstructionKind,
  id: string,
  style: string,
  extra: Partial<DesignConstructionPart> = {},
): DesignConstructionPart {
  return { id, kind, style, present: true, ...extra }
}

/** Parts written when the user picks a style. Not used for missing-data fallback. */
export function constructionPartsForStyle(
  garmentType: string,
  kind: ConstructionKind,
  style: string,
  slot?: string,
): DesignConstructionPart[] {
  switch (kind) {
    case 'collar':
      return [part('collar', 'collar', style, { panelId: 'collar' })]
    case 'hood':
      return [
        part('hood', 'hood', style, {
          panelId: garmentType === 'hoodie' ? 'hood' : undefined,
          variant: 'standard',
        }),
      ]
    case 'zipper':
      return [part('zipper', 'zipper', style, { variant: 'metal' })]
    case 'hem':
      return [
        part('hem', 'hem', style, {
          panelId: garmentType === 'pants' || garmentType === 'shorts' ? undefined : 'front_body',
        }),
      ]
    case 'waistband':
      return [part('waistband', 'waistband', style, { panelId: 'waistband' })]
    case 'drawstring':
      return [part('drawstring', 'drawstring', style)]
    case 'belt_loop':
      return [part('belt_loop', 'belt_loops', style, { panelId: 'waistband' })]
    case 'cuff':
      return garmentType === 'hoodie' || garmentType === 'sweatshirt'
        ? [
            part('cuff', 'cuff_right', style, { panelId: 'cuff_right' }),
            part('cuff', 'cuff_left', style, { panelId: 'cuff_left' }),
          ]
        : garmentType === 'tshirt'
          ? [
              part('cuff', 'sleeve_hem_right', style),
              part('cuff', 'sleeve_hem_left', style),
            ]
          : [part('cuff', 'cuff_right', style), part('cuff', 'cuff_left', style)]
    case 'pocket':
      return pocketsForStyle(garmentType, style, slot)
    default:
      return [part(kind, kind, style)]
  }
}

function pocketsForStyle(
  garmentType: string,
  style: string,
  slot?: string,
): DesignConstructionPart[] {
  if (garmentType === 'hoodie') {
    return [part('pocket', 'kangaroo_pocket', style, { panelId: 'front_body', slot: 'body' })]
  }
  if (garmentType === 'jacket') {
    return [
      part('pocket', 'jacket_pocket_left', style, { panelId: 'front_body_left', slot: 'body' }),
      part('pocket', 'jacket_pocket_right', style, { panelId: 'front_body_right', slot: 'body' }),
    ]
  }
  const group = slot ?? 'back'
  if (group === 'front') {
    return [
      part('pocket', 'front_pocket_left', style, { panelId: 'left_leg', slot: 'front' }),
      part('pocket', 'front_pocket_right', style, { panelId: 'right_leg', slot: 'front' }),
    ]
  }
  if (group === 'cargo') {
    return [
      part('pocket', 'cargo_left', style, { panelId: 'left_leg', slot: 'cargo' }),
      part('pocket', 'cargo_right', style, { panelId: 'right_leg', slot: 'cargo' }),
    ]
  }
  return [
    part('pocket', 'back_pocket_left', style, { panelId: 'left_leg_back', slot: 'back' }),
    part('pocket', 'back_pocket_right', style, { panelId: 'right_leg_back', slot: 'back' }),
  ]
}
