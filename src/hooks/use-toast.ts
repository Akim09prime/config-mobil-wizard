
import * as React from "react"
import { useContext } from "react"
import { ToastContext } from "./toast-context"
import type { ToasterToast } from "./toast-types"

// Re-export the ToastProvider from the provider file
export { ToastProvider } from "./toast-provider"

export function useToast() {
  const { addToast, ...context } = useContext(ToastContext)

  // Main toast function
  const toast = React.useCallback(
    (props: Omit<ToasterToast, "id">) => {
      addToast(props)
    },
    [addToast]
  )

  // Add helper methods to the toast function
  const helpers = {
    success: (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
      addToast({
        title: "Succes",
        description,
        duration: 3000,
        ...options,
      })
    },
    error: (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
      addToast({
        title: "Eroare",
        description,
        variant: "destructive",
        duration: 5000,
        ...options,
      })
    },
    info: (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
      addToast({
        title: "Informație",
        description,
        duration: 3000,
        ...options,
      })
    },
    warning: (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
      addToast({
        title: "Atenție",
        description,
        variant: "default",
        duration: 4000,
        ...options,
      })
    }
  }

  return {
    ...context,
    toast: Object.assign(toast, helpers)
  }
}

// Create a standalone toast object with the helper methods
const toastFn = (props: Omit<ToasterToast, "id">) => {
  console.log('Toast called:', props)
}

// Add helper methods to the standalone toast
export const toast = Object.assign(toastFn, {
  success: (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
    console.log('Toast success:', description, options)
  },
  error: (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
    console.log('Toast error:', description, options)
  },
  info: (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
    console.log('Toast info:', description, options)
  },
  warning: (description: string, options?: Partial<Omit<ToasterToast, "id">>) => {
    console.log('Toast warning:', description, options)
  }
})
