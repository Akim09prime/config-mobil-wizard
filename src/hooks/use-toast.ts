
import * as React from "react"
import { toast as showToast } from "./toast-provider-helper"
import { useToast } from "./toast-provider"
import type { ToastProps } from "./toast-types"

// Create a toast object with methods
const toastMethods = {
  // Base function to show toast
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

// Create callable function that also has methods
export const toast = Object.assign(
  (props: ToastProps | string) => toastMethods.default(props),
  toastMethods
)

// Export the hook and provider
export { useToast }
export { ToastProvider } from "./toast-provider"
