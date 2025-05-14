
import * as React from "react"
import { toast as showToast, useToast, ToastProvider } from "./toast-provider"
import type { ToasterToast } from "./toast-types"

export type ToastProps = Omit<ToasterToast, "id">

// Re-export with convenience functions
export const toast = {
  // Base function to show toast
  // This allows both object style: toast({ title: "Hello", description: "World" })
  // and string style: toast("Hello World")
  (props: ToastProps | string) {
    return showToast(props)
  },
  
  // Variant convenience functions
  success(props: Partial<ToastProps> | string) {
    const toastProps = typeof props === 'string' ? { description: props } : props
    return showToast({ ...toastProps, variant: "default" })
  },
  error(props: Partial<ToastProps> | string) {
    const toastProps = typeof props === 'string' ? { description: props } : props
    return showToast({ ...toastProps, variant: "destructive" })
  },
  warning(props: Partial<ToastProps> | string) {
    const toastProps = typeof props === 'string' ? { description: props } : props
    return showToast({ ...toastProps, variant: "warning" })
  },
  info(props: Partial<ToastProps> | string) {
    const toastProps = typeof props === 'string' ? { description: props } : props
    return showToast({ ...toastProps, variant: "info" })
  }
}

export { useToast, ToastProvider }
