
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
import AdminDashboard from "./pages/admin/Dashboard";
import TaxonomiesAccessories from "./pages/admin/TaxonomiesAccessories";
import TaxonomiesMaterials from "./pages/admin/TaxonomiesMaterials";
import TaxonomiesComponents from "./pages/admin/TaxonomiesComponents";
import TaxonomiesCategories from "./pages/admin/TaxonomiesCategories";
import CabinetItems from "./pages/admin/items/Cabinets";
import MaterialItems from "./pages/admin/items/Materials";
import AccessoryItems from "./pages/admin/items/Accessories";
import ComponentItems from "./pages/admin/items/Components";
import Projects from "./pages/admin/Projects";
import Settings from "./pages/admin/Settings";
import FurnitureCalculator from "./pages/calculator/FurnitureCalculator";

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
                  <Route path="dashboard" element={<AdminDashboard />} />
                  
                  {/* Taxonomies */}
                  <Route path="taxonomies/accessories" element={<TaxonomiesAccessories />} />
                  <Route path="taxonomies/materials" element={<TaxonomiesMaterials />} />
                  <Route path="taxonomies/components" element={<TaxonomiesComponents />} />
                  <Route path="taxonomies/categories" element={<TaxonomiesCategories />} />
                  
                  {/* Items */}
                  <Route path="items/cabinets" element={<CabinetItems />} />
                  <Route path="items/materials" element={<MaterialItems />} />
                  <Route path="items/accessories" element={<AccessoryItems />} />
                  <Route path="items/components" element={<ComponentItems />} />
                  
                  {/* Projects */}
                  <Route path="projects" element={<Projects />} />
                  
                  {/* Settings */}
                  <Route path="settings" element={<Settings />} />
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
              <FurnitureCalculator />
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
