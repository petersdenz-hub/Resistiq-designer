import { useCallback, useLayoutEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { DesignContext, type DesignContextValue, type HistoryMode } from './context'
import { createNewDesign } from './createDesign'
import {
  addElement,
  createGraphicElement,
  createTextElement,
  moveElementLayer,
  removeElement,
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
  | { type: 'apply'; document: DesignDocument; history: HistoryMode }
  | { type: 'commitGesture'; previous: DesignDocument }
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
      return {
        ...state,
        document: next,
        selectedElementId:
          selected && selected.viewId === next.activeView ? selected.id : null,
      }
    }
    case 'apply':
      if (action.history === 'replace') {
        return { ...state, document: action.document }
      }
      return withHistory(state, action.document)
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
      const restored = keepActiveView(previous, state.document.activeView)
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
      const restored = keepActiveView(next, state.document.activeView)
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

function keepActiveView(document: DesignDocument, activeView: string): DesignDocument {
  if (document.activeView === activeView) {
    return document
  }
  return { ...document, activeView }
}

export function DesignProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    document: createNewDesign('tshirt'),
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
      renameDesign: (name) => apply(setDesignName(current().document, name)),
      setBodyColor: (value) => apply(setColorValue(current().document, 'body', value)),
      addGraphic: () => {
        const document = current().document
        const element = createGraphicElement(document, document.activeView)
        apply(addElement(document, element))
        dispatch({ type: 'select', elementId: element.id })
      },
      addText: () => {
        const document = current().document
        const element = createTextElement(document, document.activeView)
        apply(addElement(document, element))
        dispatch({ type: 'select', elementId: element.id })
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
      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),
    }
  }, [apply, state])

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>
}
