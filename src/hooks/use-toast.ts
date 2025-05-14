
import * as React from "react"
import { toast as showToast, useToast, ToastProvider } from "./toast-provider"
import type { ToasterToast } from "./toast-types"

export type ToastProps = Omit<ToasterToast, "id">

// Re-export with convenience functions
export const toast = {
  ...showToast,
  success: (props: Partial<ToastProps>) => showToast({ ...props, variant: "default" }),
  error: (props: Partial<ToastProps>) => showToast({ ...props, variant: "destructive" }),
  warning: (props: Partial<ToastProps>) => showToast({ ...props, variant: "warning" }),
  info: (props: Partial<ToastProps>) => showToast({ ...props, variant: "info" }),
}

export { useToast, ToastProvider }
