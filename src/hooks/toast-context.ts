
import * as React from "react"
import { createContext } from "react"
import type { ToasterToast } from "./toast-types"

interface ToastContextValue {
  toasts: ToasterToast[]
  addToast: (toast: Omit<ToasterToast, "id">) => void
  updateToast: (toast: Partial<ToasterToast>) => void
  dismissToast: (toastId?: string) => void
  removeToast: (toastId?: string) => void
}

export const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  updateToast: () => {},
  dismissToast: () => {},
  removeToast: () => {},
})
