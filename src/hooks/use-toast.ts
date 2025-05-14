
import * as React from "react"

import type { ToastProps } from "@/hooks/toast-types"
import { toast as showToast } from "./toast-provider"

export function toast(props: ToastProps) {
  return showToast(props)
}

export { useToast } from "./toast-provider"
