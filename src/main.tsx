
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ToastProvider>
      <App />
      <Toaster />
    </ToastProvider>
  </AuthProvider>
);
