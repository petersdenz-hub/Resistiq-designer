import { useCallback, useMemo, useReducer, type ReactNode } from 'react'
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
      return {
        document: previous,
        selectedElementId: keepSelection(previous, state.selectedElementId),
        past: state.past.slice(0, -1),
        future: [state.document, ...state.future],
      }
    }
    case 'redo': {
      const [next, ...rest] = state.future
      if (!next) {
        return state
      }
      return {
        document: next,
        selectedElementId: keepSelection(next, state.selectedElementId),
        past: [...state.past, state.document],
        future: rest,
      }
    }
  }
}

function keepSelection(document: DesignDocument, selectedElementId: string | null) {
  return getElementById(document, selectedElementId)?.id ?? null
}

export function DesignProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    document: createNewDesign('tshirt'),
    selectedElementId: null,
    past: [],
    future: [],
  }))

  const apply = useCallback(
    (document: DesignDocument, history: HistoryMode = 'record') => {
      dispatch({ type: 'apply', document, history })
    },
    [],
  )

  const value = useMemo<DesignContextValue>(() => {
    const selectedElement = getElementById(state.document, state.selectedElementId)

    return {
      document: state.document,
      selectedElementId: state.selectedElementId,
      selectedElement,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      selectElement: (elementId) => dispatch({ type: 'select', elementId }),
      setActiveView: (viewId) => dispatch({ type: 'setActiveView', viewId }),
      renameDesign: (name) => apply(setDesignName(state.document, name)),
      setBodyColor: (value) => apply(setColorValue(state.document, 'body', value)),
      addGraphic: () => {
        const element = createGraphicElement(state.document, state.document.activeView)
        apply(addElement(state.document, element))
        dispatch({ type: 'select', elementId: element.id })
      },
      addText: () => {
        const element = createTextElement(state.document, state.document.activeView)
        apply(addElement(state.document, element))
        dispatch({ type: 'select', elementId: element.id })
      },
      removeSelected: () => {
        if (!state.selectedElementId) {
          return
        }
        apply(removeElement(state.document, state.selectedElementId))
        dispatch({ type: 'select', elementId: null })
      },
      removeElementById: (elementId) => {
        apply(removeElement(state.document, elementId))
        if (state.selectedElementId === elementId) {
          dispatch({ type: 'select', elementId: null })
        }
      },
      updateSelected: (patch, history = 'record') => {
        if (!state.selectedElementId) {
          return
        }
        apply(updateElement(state.document, state.selectedElementId, patch), history)
      },
      updateElementById: (elementId, patch, history = 'record') => {
        apply(updateElement(state.document, elementId, patch), history)
      },
      moveSelectedLayer: (direction) => {
        if (!state.selectedElementId) {
          return
        }
        apply(moveElementLayer(state.document, state.selectedElementId, direction))
      },
      commitGesture: (previous) => dispatch({ type: 'commitGesture', previous }),
      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),
    }
  }, [apply, state])

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>
}
