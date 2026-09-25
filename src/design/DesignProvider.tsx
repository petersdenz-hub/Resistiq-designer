import { persistAsset } from '@/persistence/assetCache'
import { normalizeDocument } from '@/persistence/validateDocument'
import {
  addDesignObject,
  createImageObject,
  createShapeObject,
  createTextObject,
  getDesignObjectById,
  removeDesignObject,
  defaultPanelIdForZone,
  resolveActiveZone,
  setActiveZone as writeSetActiveZone,
  updateDesignObject,
} from './designObjects'
import {
  alignDesignObjects,
  distributeDesignObjects,
  duplicateDesignObjects,
  expandGroupIds,
  groupDesignObjects,
  moveDesignObjectsLayer,
  nudgeDesignObjects,
  removeDesignObjects,
  selectableObjectIds,
  selectionForEdit,
  toggleSelectedIds,
  ungroupDesignObjects,
  updateDesignObjects,
} from './objectEditing'
import {
  assignDesignObjectZone,
  attachObjectToZonePanel,
  setDesignObjectAnchor,
  setDesignObjectPanel,
} from './objectPlacement'
import { createId } from './ids'
import { useCallback, useLayoutEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { DesignContext, type DesignContextValue, type HistoryMode } from './context'
import { createNewDesign } from './createDesign'
import { switchGarment as writeSwitchGarment } from './garmentSwitch'
import { ingestImageError, ingestImageFile } from './ingestImage'
import {
  addElement,
  clearConstructionPart as writeClearConstructionPart,
  createGraphicElement,
  createImageElement,
  createTextElement,
  moveElementLayer,
  patchConstruction as writePatchConstruction,
  removeElement,
  setActivePanel,
  setActiveView,
  setColorValue,
  setConstructionPart as writeSetConstructionPart,
  setConstructionStyle as writeSetConstructionStyle,
  setConstructionVariant as writeSetConstructionVariant,
  setGarmentMaterial as writeSetGarmentMaterial,
  setPanelColor as writePanelColor,
  setDesignName,
  updateElement,
  upsertMaterial as writeUpsertMaterial,
} from './operations'
import { getElementById } from './selectors'
import type { DesignDocument } from './types'

const HISTORY_LIMIT = 100

interface DesignState {
  document: DesignDocument
  selectedElementId: string | null
  selectedObjectId: string | null
  selectedObjectIds: string[]
  past: DesignDocument[]
  future: DesignDocument[]
}

type DesignAction =
  | { type: 'select'; elementId: string | null }
  | { type: 'selectObject'; objectId: string | null }
  | { type: 'selectObjects'; objectIds: string[] }
  | { type: 'setActiveView'; viewId: string }
  | { type: 'setActivePanel'; panelId: string }
  | { type: 'apply'; document: DesignDocument; history: HistoryMode }
  | { type: 'commitGesture'; previous: DesignDocument }
  | { type: 'hydrate'; document: DesignDocument }
  | { type: 'undo' }
  | { type: 'redo' }

function primaryObjectId(ids: string[]): string | null {
  return ids[ids.length - 1] ?? null
}

function withObjectSelection(state: DesignState, objectIds: string[]): DesignState {
  const selectedObjectIds = [...new Set(objectIds)]
  return {
    ...state,
    selectedObjectIds,
    selectedObjectId: primaryObjectId(selectedObjectIds),
    selectedElementId: selectedObjectIds.length > 0 ? null : state.selectedElementId,
  }
}

function withHistory(state: DesignState, nextDocument: DesignDocument): DesignState {
  return {
    ...state,
    document: nextDocument,
    past: [...state.past, state.document].slice(-HISTORY_LIMIT),
    future: [],
  }
}

function reducer(state: DesignState, action: DesignAction): DesignState {
  switch (action.type) {
    case 'select':
      return {
        ...state,
        selectedElementId: action.elementId,
        selectedObjectId: null,
        selectedObjectIds: [],
      }
    case 'selectObject':
      return withObjectSelection(state, action.objectId ? [action.objectId] : [])
    case 'selectObjects':
      return withObjectSelection(state, action.objectIds)
    case 'setActiveView': {
      const next = setActiveView(state.document, action.viewId)
      const selected = getElementById(next, state.selectedElementId)
      const selectedPanel = selected
        ? next.panels.find((panel) => panel.id === selected.panelId)
        : null
      const zone = next.activeZone ?? next.activeView
      const selectedObjectIds = keepObjectIds(next, state.selectedObjectIds).filter((id) => {
        const object = getDesignObjectById(next, id)
        return object?.zone === zone
      })
      return {
        ...state,
        document: next,
        selectedElementId:
          selected && selectedPanel?.viewId === next.activeView ? selected.id : null,
        selectedObjectIds,
        selectedObjectId: primaryObjectId(selectedObjectIds),
      }
    }
    case 'setActivePanel':
      return {
        ...state,
        selectedElementId: null,
        selectedObjectId: null,
        selectedObjectIds: [],
        document: setActivePanel(state.document, action.panelId),
      }
    case 'apply':
      if (action.history === 'replace') {
        return { ...state, document: action.document }
      }
      return withHistory(state, action.document)
    case 'hydrate':
      return {
        ...state,
        document: normalizeDocument(action.document),
      }
    case 'commitGesture':
      if (action.previous.updatedAt === state.document.updatedAt) {
        return state
      }
      return {
        ...state,
        past: [...state.past, action.previous].slice(-HISTORY_LIMIT),
        future: [],
      }
    case 'undo': {
      const previous = state.past[state.past.length - 1]
      if (!previous) {
        return state
      }
      const restored = keepEditorChrome(previous, state.document)
      const selectedObjectIds = keepObjectIds(restored, state.selectedObjectIds)
      return {
        document: restored,
        selectedElementId: keepSelection(restored, state.selectedElementId),
        selectedObjectIds,
        selectedObjectId: primaryObjectId(selectedObjectIds),
        past: state.past.slice(0, -1),
        future: [state.document, ...state.future],
      }
    }
    case 'redo': {
      const [next, ...rest] = state.future
      if (!next) {
        return state
      }
      const restored = keepEditorChrome(next, state.document)
      const selectedObjectIds = keepObjectIds(restored, state.selectedObjectIds)
      return {
        document: restored,
        selectedElementId: keepSelection(restored, state.selectedElementId),
        selectedObjectIds,
        selectedObjectId: primaryObjectId(selectedObjectIds),
        past: [...state.past, state.document],
        future: rest,
      }
    }
  }
}

function keepSelection(document: DesignDocument, selectedElementId: string | null) {
  return getElementById(document, selectedElementId)?.id ?? null
}

function keepObjectIds(document: DesignDocument, selectedObjectIds: string[]) {
  return selectedObjectIds.filter((id) => getDesignObjectById(document, id))
}

function keepEditorChrome(
  snapshot: DesignDocument,
  current: DesignDocument,
): DesignDocument {
  return {
    ...snapshot,
    activeView: current.activeView,
    activePanelId: current.activePanelId,
    activeZone: current.activeZone,
  }
}

export function DesignProvider({
  children,
  initialDocument,
}: {
  children: ReactNode
  initialDocument?: DesignDocument
}) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    document: normalizeDocument(initialDocument ?? createNewDesign('tshirt')),
    selectedElementId: null,
    selectedObjectId: null,
    selectedObjectIds: [],
    past: [],
    future: [],
  }))

  const stateRef = useRef(state)
  useLayoutEffect(() => {
    stateRef.current = state
  }, [state])

  const apply = useCallback(
    (document: DesignDocument, history: HistoryMode = 'record') => {
      dispatch({ type: 'apply', document, history })
    },
    [],
  )

  const value = useMemo<DesignContextValue>(() => {
    const selectedElement = getElementById(state.document, state.selectedElementId)
    const selectedObject = getDesignObjectById(state.document, state.selectedObjectId)
    const selectedObjects = state.selectedObjectIds
      .map((id) => getDesignObjectById(state.document, id))
      .filter((object): object is NonNullable<typeof object> => Boolean(object))
    const current = () => stateRef.current

    return {
      document: state.document,
      selectedElementId: state.selectedElementId,
      selectedElement,
      selectedObjectId: state.selectedObjectId,
      selectedObjectIds: state.selectedObjectIds,
      selectedObject,
      selectedObjects,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      selectElement: (elementId) => dispatch({ type: 'select', elementId }),
      selectObject: (objectId, options) => {
        if (!objectId) {
          dispatch({ type: 'selectObjects', objectIds: [] })
          return
        }
        const { document, selectedObjectIds } = current()
        const next = options?.expandGroup ? expandGroupIds(document, objectId) : [objectId]
        if (options?.toggle) {
          dispatch({ type: 'selectObjects', objectIds: toggleSelectedIds(selectedObjectIds, next) })
          return
        }
        if (options?.additive) {
          dispatch({ type: 'selectObjects', objectIds: [...selectedObjectIds, ...next] })
          return
        }
        dispatch({ type: 'selectObjects', objectIds: next })
      },
      selectObjects: (objectIds) => dispatch({ type: 'selectObjects', objectIds }),
      selectAllObjects: () => {
        const { document } = current()
        dispatch({
          type: 'selectObjects',
          objectIds: selectableObjectIds(document, resolveActiveZone(document)),
        })
      },
      groupSelectedObjects: () => {
        const { document, selectedObjectIds } = current()
        apply(groupDesignObjects(document, selectedObjectIds))
      },
      ungroupSelectedObjects: () => {
        const { document, selectedObjectIds } = current()
        apply(ungroupDesignObjects(document, selectedObjectIds))
      },
      alignSelectedObjects: (alignment) => {
        const { document, selectedObjectIds } = current()
        apply(alignDesignObjects(document, selectedObjectIds, alignment))
      },
      distributeSelectedObjects: (axis) => {
        const { document, selectedObjectIds } = current()
        apply(distributeDesignObjects(document, selectedObjectIds, axis))
      },
      nudgeSelectedObjects: (dx, dy) => {
        const { document, selectedObjectIds } = current()
        apply(nudgeDesignObjects(document, selectedObjectIds, dx, dy))
      },
      updateSelectedObjects: (patch, history = 'record') => {
        const { document, selectedObjectIds } = current()
        apply(
          updateDesignObjects(
            document,
            selectedObjectIds.map((id) => ({ id, patch })),
          ),
          history,
        )
      },
      applyDocument: (document, history = 'record') => apply(document, history),
      setActiveView: (viewId) => dispatch({ type: 'setActiveView', viewId }),
      setActivePanel: (panelId) => dispatch({ type: 'setActivePanel', panelId }),
      switchGarment: (garmentType) => apply(writeSwitchGarment(current().document, garmentType)),
      setActiveZone: (zone) => {
        const { document, selectedObjectIds } = current()
        apply(writeSetActiveZone(document, zone))
        const remaining = selectedObjectIds.filter((id) => getDesignObjectById(document, id)?.zone === zone)
        if (remaining.length !== selectedObjectIds.length) {
          dispatch({ type: 'selectObjects', objectIds: remaining })
        }
      },
      setSelectedObjectZone: (zone) => {
        const { document, selectedObjectId } = current()
        if (!selectedObjectId) {
          return
        }
        apply(assignDesignObjectZone(document, selectedObjectId, zone))
      },
      setSelectedObjectPanel: (panelId) => {
        const { document, selectedObjectId } = current()
        if (!selectedObjectId) {
          return
        }
        apply(setDesignObjectPanel(document, selectedObjectId, panelId))
      },
      setSelectedObjectSpace: (space) => {
        const { document, selectedObjectId } = current()
        const selected = getDesignObjectById(document, selectedObjectId)
        if (!selected) {
          return
        }
        if (space === 'panel') {
          const panelId = selected.anchor.panelId ?? defaultPanelIdForZone(document, selected.zone)
          if (!panelId) {
            return
          }
          apply(setDesignObjectAnchor(document, selected.id, { space: 'panel', panelId }, 'visual'))
          return
        }
        apply(setDesignObjectAnchor(document, selected.id, { space: 'zone', panelId: selected.anchor.panelId }, 'visual'))
      },
      renameDesign: (name) => apply(setDesignName(current().document, name)),
      setBodyColor: (value, history = 'record') =>
        apply(setColorValue(current().document, 'body', value), history),
      setPanelColor: (panelId, value, history = 'record') =>
        apply(writePanelColor(current().document, panelId, value), history),
      patchConstruction: (patch, history = 'record') =>
        apply(writePatchConstruction(current().document, patch), history),
      setConstructionPart: (part, history = 'record') =>
        apply(writeSetConstructionPart(current().document, part), history),
      clearConstructionPart: (kind, partId, history = 'record') =>
        apply(writeClearConstructionPart(current().document, kind, partId), history),
      upsertMaterial: (material, history = 'record') =>
        apply(writeUpsertMaterial(current().document, material), history),
      setConstructionStyle: (kind, style, history = 'record', slot) =>
        apply(writeSetConstructionStyle(current().document, kind, style, slot), history),
      setConstructionVariant: (kind, variant, history = 'record') =>
        apply(writeSetConstructionVariant(current().document, kind, variant), history),
      setGarmentMaterial: (materialId, history = 'record') =>
        apply(writeSetGarmentMaterial(current().document, materialId), history),
      addGraphic: () => {
        const document = current().document
        const element = createGraphicElement(document, document.activePanelId)
        apply(addElement(document, element))
        dispatch({ type: 'select', elementId: element.id })
      },
      addText: () => {
        const document = current().document
        const element = createTextElement(document, document.activePanelId)
        apply(addElement(document, element))
        dispatch({ type: 'select', elementId: element.id })
      },
      addDesignText: () => {
        const document = current().document
        const object = attachObjectToZonePanel(document, createTextObject(document))
        apply(addDesignObject(document, object))
        dispatch({ type: 'selectObject', objectId: object.id })
      },
      addDesignShape: (kind = 'rectangle') => {
        const document = current().document
        const object = attachObjectToZonePanel(document, createShapeObject(document, undefined, kind))
        apply(addDesignObject(document, object))
        dispatch({ type: 'selectObject', objectId: object.id })
      },
      addDesignImageFromFile: async (file) => {
        try {
          const ingested = await ingestImageFile(file)
          const asset = {
            id: createId(),
            name: ingested.name,
            mimeType: ingested.mimeType,
            kind: ingested.kind,
            dataUrl: ingested.dataUrl,
            width: ingested.width,
            height: ingested.height,
            createdAt: new Date().toISOString(),
          }
          await persistAsset(asset)
          const document = current().document
          const object = attachObjectToZonePanel(
            document,
            createImageObject(document, {
              source: asset.id,
              fileName: ingested.name,
              mimeType: ingested.mimeType,
              naturalWidth: ingested.width,
              naturalHeight: ingested.height,
              aspectLocked: true,
            }),
          )
          apply(addDesignObject(document, object))
          dispatch({ type: 'selectObject', objectId: object.id })
          return null
        } catch (error) {
          return ingestImageError(error)
        }
      },
      addImageFromFile: async (file, role = 'image') => {
        try {
          const ingested = await ingestImageFile(file)
          const asset = {
            id: createId(),
            name: ingested.name,
            mimeType: ingested.mimeType,
            kind: ingested.kind,
            dataUrl: ingested.dataUrl,
            width: ingested.width,
            height: ingested.height,
            createdAt: new Date().toISOString(),
          }
          await persistAsset(asset)
          const document = current().document
          const element = createImageElement(document, {
            type: role,
            source: asset.id,
            fileName: ingested.name,
            mimeType: ingested.mimeType,
            naturalWidth: ingested.width,
            naturalHeight: ingested.height,
            panelId: document.activePanelId,
          })
          apply(addElement(document, element))
          dispatch({ type: 'select', elementId: element.id })
          return null
        } catch (error) {
          return ingestImageError(error)
        }
      },
      removeSelected: () => {
        const { document, selectedElementId, selectedObjectIds } = current()
        if (selectedObjectIds.length > 0) {
          apply(removeDesignObjects(document, selectionForEdit(document, selectedObjectIds)))
          dispatch({ type: 'selectObjects', objectIds: [] })
          return
        }
        if (!selectedElementId) {
          return
        }
        apply(removeElement(document, selectedElementId))
        dispatch({ type: 'select', elementId: null })
      },
      removeElementById: (elementId) => {
        apply(removeElement(current().document, elementId))
        if (current().selectedElementId === elementId) {
          dispatch({ type: 'select', elementId: null })
        }
      },
      removeObjectById: (objectId) => {
        const { document, selectedObjectIds } = current()
        apply(removeDesignObject(document, objectId))
        if (selectedObjectIds.includes(objectId)) {
          dispatch({
            type: 'selectObjects',
            objectIds: selectedObjectIds.filter((id) => id !== objectId),
          })
        }
      },
      duplicateSelectedObject: () => {
        const { document, selectedObjectIds } = current()
        const ids = selectionForEdit(document, selectedObjectIds)
        if (ids.length === 0) {
          return
        }
        const result = duplicateDesignObjects(document, ids)
        if (result.objects.length === 0) {
          return
        }
        apply(result.document)
        dispatch({ type: 'selectObjects', objectIds: result.objects.map((object) => object.id) })
      },
      updateSelected: (patch, history = 'record') => {
        const { document, selectedElementId } = current()
        if (!selectedElementId) {
          return
        }
        apply(updateElement(document, selectedElementId, patch), history)
      },
      updateElementById: (elementId, patch, history = 'record') => {
        apply(updateElement(current().document, elementId, patch), history)
      },
      updateSelectedObject: (patch, history = 'record') => {
        const { document, selectedObjectId } = current()
        if (!selectedObjectId) {
          return
        }
        apply(updateDesignObject(document, selectedObjectId, patch), history)
      },
      updateObjectById: (objectId, patch, history = 'record') => {
        apply(updateDesignObject(current().document, objectId, patch), history)
      },
      moveSelectedLayer: (direction) => {
        const { document, selectedElementId } = current()
        if (!selectedElementId) {
          return
        }
        apply(moveElementLayer(document, selectedElementId, direction))
      },
      moveSelectedObjectLayer: (direction) => {
        const { document, selectedObjectIds } = current()
        if (selectedObjectIds.length === 0) {
          return
        }
        apply(moveDesignObjectsLayer(document, selectedObjectIds, direction))
      },
      commitGesture: (previous) => dispatch({ type: 'commitGesture', previous }),
      hydrateDocument: (document) => dispatch({ type: 'hydrate', document }),
      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),
    }
  }, [apply, state])

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>
}
