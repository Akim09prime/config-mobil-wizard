
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import ClientLayout from "./components/layout/ClientLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={["administrator"]}>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<div className="p-6 bg-white rounded-lg shadow">Dashboard Administrator</div>} />
                  {/* Add other admin routes as needed */}
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* Proiectant Routes */}
          <Route path="/project/*" element={
            <ProtectedRoute allowedRoles={["proiectant"]}>
              <div>Proiectant Interface</div>
              {/* Add proiectant routes as needed */}
            </ProtectedRoute>
          } />
          
          {/* Client Routes */}
          <Route path="/catalog" element={
            <ClientLayout>
              <div className="p-6 bg-white rounded-lg shadow">Catalog Mobilier</div>
            </ClientLayout>
          } />
          
          <Route path="/calculator" element={
            <ClientLayout>
              <div className="p-6 bg-white rounded-lg shadow">Calculator Rapid</div>
            </ClientLayout>
          } />
          
          <Route path="/client/offer" element={
            <ProtectedRoute allowedRoles={["client", "administrator", "proiectant"]}>
              <ClientLayout>
                <div className="p-6 bg-white rounded-lg shadow">Generator Ofertă</div>
              </ClientLayout>
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
