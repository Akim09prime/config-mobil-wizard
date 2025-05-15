
import * as React from "react"
import { toast } from "@/hooks/use-toast"

// Re-export the toast function from hooks
export { toast }
export type { ToastProps } from "@/hooks/toast-types"

// Re-export the ToastActionElement type
export type { ToastActionElement } from "@/components/ui/toast"
