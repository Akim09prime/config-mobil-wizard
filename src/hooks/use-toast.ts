
import * as React from "react"
import { toast as showToast, useToast, ToastProvider } from "./toast-provider"
import type { ToasterToast } from "./toast-types"

export type ToastProps = Omit<ToasterToast, "id">

// Define toast methods
export const toastMethods = {
  // Base function to show toast
  // This allows both object style: toast({ title: "Hello", description: "World" })
  // and string style: toast("Hello World")
  default: function(props: ToastProps | string) {
    return showToast(props)
  },
  
  // Variant convenience functions
  success: function(props: Partial<ToastProps> | string) {
    const toastProps = typeof props === 'string' ? { description: props } : props
    return showToast({ ...toastProps, variant: "default" })
  },
  error: function(props: Partial<ToastProps> | string) {
    const toastProps = typeof props === 'string' ? { description: props } : props
    return showToast({ ...toastProps, variant: "destructive" })
  },
  warning: function(props: Partial<ToastProps> | string) {
    const toastProps = typeof props === 'string' ? { description: props } : props
    return showToast({ ...toastProps, variant: "warning" })
  },
  info: function(props: Partial<ToastProps> | string) {
    const toastProps = typeof props === 'string' ? { description: props } : props
    return showToast({ ...toastProps, variant: "info" })
  }
}

// Create callable function that also has the methods attached
export const toast = Object.assign(
  function(props: ToastProps | string) {
    return toastMethods.default(props)
  },
  toastMethods
)

export { useToast, ToastProvider }
