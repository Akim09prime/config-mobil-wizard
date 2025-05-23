
import * as React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ToastContext } from "./toast-context"
import { actionTypes, initialState, type ToasterToast } from "./toast-types"
import { createUseReducerWithDispatch, toastReducer } from "./toast-reducer"
import { registerToastHandler } from "./toast-provider-helper"

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const useToastReducer = createUseReducerWithDispatch(toastReducer, initialState)

export function useToast() {
  const context = React.useContext(ToastContext)
  
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useToastReducer()
  const [firstRender, setFirstRender] = useState(true)

  useEffect(() => {
    setFirstRender(false)
  }, [])

  const addToast = useCallback(
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

  const updateToast = useCallback(
    (props: Partial<ToasterToast>) => {
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: props,
      })
    },
    [dispatch]
  )

  const dismissToast = useCallback(
    (toastId?: string) => {
      dispatch({
        type: actionTypes.DISMISS_TOAST,
        toastId,
      })
    },
    [dispatch]
  )

  const removeToast = useCallback(
    (toastId?: string) => {
      dispatch({
        type: actionTypes.REMOVE_TOAST,
        toastId,
      })
    },
    [dispatch]
  )

  const value = useMemo(
    () => ({
      toasts: state.toasts,
      addToast,
      updateToast,
      dismissToast,
      removeToast,
    }),
    [state, addToast, updateToast, dismissToast, removeToast]
  )

  // Register the toast handler on mount
  React.useEffect(() => {
    const unregister = registerToastHandler(addToast);
    return () => {
      unregister();
    };
  }, [addToast]);

  if (firstRender) {
    return null
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
