
import { ToasterToast } from "./toast-types"

// Global toast state storage for non-React contexts
let toastHandler: ((toast: Omit<ToasterToast, "id">) => string) | null = null;

// Function to register the toast handler
export function registerToastHandler(handler: (toast: Omit<ToasterToast, "id">) => string) {
  toastHandler = handler;
  return () => {
    toastHandler = null;
  };
}

// Safe toast function that can be called from anywhere
export function toast(props: Omit<ToasterToast, "id"> | string) {
  const toastProps = typeof props === 'string' ? { description: props } : props;
  
  if (toastHandler) {
    return toastHandler(toastProps);
  } else {
    console.warn("Toast was called before toast handler was registered");
    return "";
  }
}
