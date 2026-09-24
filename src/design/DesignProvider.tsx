import { persistAsset } from '@/persistence/assetCache'
import { normalizeDocument } from '@/persistence/validateDocument'
import { createId } from './ids'
import { useCallback, useLayoutEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { DesignContext, type DesignContextValue, type HistoryMode } from './context'
import { createNewDesign } from './createDesign'
import { ingestImageError, ingestImageFile } from './ingestImage'
import {
  addElement,
  createGraphicElement,
  createImageElement,
  createTextElement,
  moveElementLayer,
  removeElement,
  setActivePanel,
  setActiveView,
  setColorValue,
  setDesignName,
  updateElement,
} from './operations'
import { getElementById } from './selectors'
import type { DesignDocument } from './types'

const HISTORY_LIMIT = 100

interface DesignState {
  document: DesignDocument
  selectedElementId: string | null
  past: DesignDocument[]
  future: DesignDocument[]
}

type DesignAction =
  | { type: 'select'; elementId: string | null }
  | { type: 'setActiveView'; viewId: string }
  | { type: 'setActivePanel'; panelId: string }
  | { type: 'apply'; document: DesignDocument; history: HistoryMode }
  | { type: 'commitGesture'; previous: DesignDocument }
  | { type: 'hydrate'; document: DesignDocument }
  | { type: 'undo' }
  | { type: 'redo' }

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
      return { ...state, selectedElementId: action.elementId }
    case 'setActiveView': {
      const next = setActiveView(state.document, action.viewId)
      const selected = getElementById(next, state.selectedElementId)
      const selectedPanel = selected
        ? next.panels.find((panel) => panel.id === selected.panelId)
        : null
      return {
        ...state,
        document: next,
        selectedElementId:
          selected && selectedPanel?.viewId === next.activeView ? selected.id : null,
      }
    }
    case 'setActivePanel':
      return {
        ...state,
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
      return {
        document: restored,
        selectedElementId: keepSelection(restored, state.selectedElementId),
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
      return {
        document: restored,
        selectedElementId: keepSelection(restored, state.selectedElementId),
        past: [...state.past, state.document],
        future: rest,
      }
    }
  }
}

function keepSelection(document: DesignDocument, selectedElementId: string | null) {
  return getElementById(document, selectedElementId)?.id ?? null
}

function keepEditorChrome(
  snapshot: DesignDocument,
  current: DesignDocument,
): DesignDocument {
  return {
    ...snapshot,
    activeView: current.activeView,
    activePanelId: current.activePanelId,
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
    const current = () => stateRef.current

    return {
      document: state.document,
      selectedElementId: state.selectedElementId,
      selectedElement,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      selectElement: (elementId) => dispatch({ type: 'select', elementId }),
      setActiveView: (viewId) => dispatch({ type: 'setActiveView', viewId }),
      setActivePanel: (panelId) => dispatch({ type: 'setActivePanel', panelId }),
      renameDesign: (name) => apply(setDesignName(current().document, name)),
      setBodyColor: (value, history = 'record') =>
        apply(setColorValue(current().document, 'body', value), history),
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
        const { document, selectedElementId } = current()
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
      moveSelectedLayer: (direction) => {
        const { document, selectedElementId } = current()
        if (!selectedElementId) {
          return
        }
        apply(moveElementLayer(document, selectedElementId, direction))
      },
      commitGesture: (previous) => dispatch({ type: 'commitGesture', previous }),
      hydrateDocument: (document) => dispatch({ type: 'hydrate', document }),
      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),
    }
  }, [apply, state])

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>
}
