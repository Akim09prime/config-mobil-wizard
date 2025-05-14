
import * as React from "react"
import { useContext } from "react"
import { ToastContext } from "./toast-context"
import type { ToasterToast } from "./toast-types"

// Re-export the ToastProvider from the provider file
export { ToastProvider } from "./toast-provider"

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

// Create a standalone toast object for direct usage without hooks
export const toast = {
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
}
