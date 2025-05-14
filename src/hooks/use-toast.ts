
import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 10
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const initialState: State = {
  toasts: [],
}

function toastReducer(state: State, action: Action): State {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId
              ? {
                  ...t,
                  open: false,
                }
              : t
          ),
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) => ({
          ...t,
          open: false,
        })),
      }
    }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }

    default:
      return state
  }
}

const ToastContext = createContext<{
  toasts: ToasterToast[]
  addToast: (toast: Omit<ToasterToast, "id">) => void
  updateToast: (toast: Partial<ToasterToast>) => void
  dismissToast: (toastId?: string) => void
  removeToast: (toastId?: string) => void
}>({
  toasts: [],
  addToast: () => {},
  updateToast: () => {},
  dismissToast: () => {},
  removeToast: () => {},
})

export function useToast() {
  const { addToast, ...context } = useContext(ToastContext)

  const toast = React.useCallback(
    function toast(props: Omit<ToasterToast, "id">) {
      addToast(props)
    },
    [addToast]
  )

  // Add simplified toast functions
  toast.success = (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
    addToast({
      title: "Succes",
      description,
      duration: 3000,
      ...options,
    })
  }
  
  toast.error = (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
    addToast({
      title: "Eroare",
      description,
      variant: "destructive",
      duration: 5000,
      ...options,
    })
  }
  
  toast.info = (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
    addToast({
      title: "Informație",
      description,
      duration: 3000,
      ...options,
    })
  }

  toast.warning = (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
    addToast({
      title: "Atenție",
      description,
      variant: "default",
      duration: 4000,
      ...options,
    })
  }

  return {
    toast,
    ...context,
  }
}

function createUseReducerWithDispatch<TState, TAction>(
  reducer: React.Reducer<TState, TAction>,
  initialState: TState,
) {
  const useReducerWithDispatch = (initializer?: (state: TState) => TState) => {
    const [state, dispatch] = React.useReducer(
      reducer,
      initialState,
      initializer as any,
    )

    const dispatchWithState = React.useCallback(
      (action: TAction) => {
        return dispatch(action)
      },
      [dispatch],
    )

    return [state, dispatchWithState] as const
  }

  return useReducerWithDispatch
}

const useToastReducer = createUseReducerWithDispatch(toastReducer, initialState)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useToastReducer()
  const [firstRender, setFirstRender] = useState(true)

  useEffect(() => {
    setFirstRender(false)
  }, [])

  const addToast = React.useCallback(
    (props: Omit<ToasterToast, "id">) => {
      const id = genId()
      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
          open: true,
        },
      })
      return id
    },
    [dispatch]
  )

  const updateToast = React.useCallback(
    (props: Partial<ToasterToast>) => {
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: props,
      })
    },
    [dispatch]
  )

  const dismissToast = React.useCallback(
    (toastId?: string) => {
      dispatch({
        type: actionTypes.DISMISS_TOAST,
        toastId,
      })
    },
    [dispatch]
  )

  const removeToast = React.useCallback(
    (toastId?: string) => {
      dispatch({
        type: actionTypes.REMOVE_TOAST,
        toastId,
      })
    },
    [dispatch]
  )

  const value = React.useMemo(
    () => ({
      toasts: state.toasts,
      addToast,
      updateToast,
      dismissToast,
      removeToast,
    }),
    [state, addToast, updateToast, dismissToast, removeToast]
  )

  if (firstRender) {
    return null
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

// Create a standalone toast object for direct usage without hooks
const toast = {
  success: (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
    // This is a placeholder function that will be properly implemented in the components
    console.log('Toast success:', description, options)
  },
  
  error: (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
    // This is a placeholder function that will be properly implemented in the components
    console.log('Toast error:', description, options)
  },
  
  info: (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
    // This is a placeholder function that will be properly implemented in the components
    console.log('Toast info:', description, options)
  },

  warning: (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
    // This is a placeholder function that will be properly implemented in the components
    console.log('Toast warning:', description, options)
  }
}

export { toast }
