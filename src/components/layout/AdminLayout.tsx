
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { toast } from '@/hooks/use-toast';

// Import icons
import {
  Home,
  Database,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  FileText,
  LayoutGrid,
  ChevronDown,
  Download,
  Upload,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Deconectare reușită');
    navigate('/auth/login');
  };

  const handleExportDatabase = () => {
    try {
      // Get all localStorage data
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cm_')) {
          data[key] = JSON.parse(localStorage.getItem(key) || '{}');
        }
      }

      // Create a downloadable file
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `configurator-mobila-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: 'Succes',
        description: 'Baza de date a fost exportată cu succes',
      });
    } catch (error) {
      console.error('Error exporting database:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut exporta baza de date',
        variant: 'destructive',
      });
    }
  };

  const handleImportDatabase = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          // Restore data to localStorage
          Object.keys(data).forEach(key => {
            localStorage.setItem(key, JSON.stringify(data[key]));
          });
          
          toast({
            title: 'Succes',
            description: 'Baza de date a fost importată cu succes. Reîmprospătați pagina pentru a vedea datele.',
          });
          
          // Refresh the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error('Error importing database:', error);
          toast({
            title: 'Eroare',
            description: 'Fișierul selectat nu este valid',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Home size={20} />,
      path: '/admin/dashboard',
    },
    {
      title: 'Taxonomii',
      icon: <LayoutGrid size={20} />,
      path: '/admin/taxonomies',
      submenu: [
        { title: 'Categorii', path: '/admin/taxonomies/categories' },
        { title: 'Accesorii', path: '/admin/taxonomies/accessories' },
        { title: 'Materiale', path: '/admin/taxonomies/materials' },
        { title: 'Componente', path: '/admin/taxonomies/components' },
      ],
    },
    {
      title: 'Intrări',
      icon: <Database size={20} />,
      path: '/admin/items',
      submenu: [
        { title: 'Corpuri presetate', path: '/admin/items/cabinets' },
        { title: 'Materiale', path: '/admin/items/materials' },
        { title: 'Accesorii', path: '/admin/items/accessories' },
        { title: 'Componente', path: '/admin/items/components' },
      ],
    },
    {
      title: 'Proiecte',
      icon: <FileText size={20} />,
      path: '/admin/projects',
    },
    {
      title: 'Setări',
      icon: <Settings size={20} />,
      path: '/admin/settings',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`bg-sidebar text-sidebar-foreground transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } fixed h-full z-10`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <div className={`overflow-hidden ${sidebarOpen ? 'w-auto' : 'w-0'}`}>
            <h1 className="font-bold text-xl text-white">Configurator</h1>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-sidebar-accent/20"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <React.Fragment key={item.title}>
              {item.submenu ? (
                <div className="mb-2">
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.path)
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'hover:bg-sidebar-accent/20'
                    }`}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      {sidebarOpen && <span className="ml-3">{item.title}</span>}
                    </div>
                    {sidebarOpen && <ChevronDown size={16} />}
                  </div>
                  {sidebarOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`block px-3 py-2 rounded-md text-sm ${
                            isActive(subItem.path)
                              ? 'bg-sidebar-accent/30 text-sidebar-accent-foreground'
                              : 'hover:bg-sidebar-accent/10 text-sidebar-foreground/80'
                          }`}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/20'
                  }`}
                >
                  {item.icon}
                  {sidebarOpen && <span className="ml-3">{item.title}</span>}
                </Link>
              )}
            </React.Fragment>
          ))}

          {/* Database Import/Export */}
          {sidebarOpen && (
            <div className="mt-6 pt-4 border-t border-sidebar-border">
              <div className="space-y-2">
                <button
                  onClick={handleExportDatabase}
                  className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium hover:bg-sidebar-accent/20"
                >
                  <Download size={20} />
                  <span className="ml-3">Export bază de date</span>
                </button>
                <button
                  onClick={handleImportDatabase}
                  className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium hover:bg-sidebar-accent/20"
                >
                  <Upload size={20} />
                  <span className="ml-3">Import bază de date</span>
                </button>
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Navigation */}
        <header className="bg-card z-10 h-16 flex items-center justify-between px-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Admin Panel</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/" className="p-2 rounded-md hover:bg-muted">
                    <Home size={18} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pagina principală</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!sidebarOpen && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={handleExportDatabase} className="p-2 rounded-md hover:bg-muted">
                        <Download size={18} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export bază de date</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={handleImportDatabase} className="p-2 rounded-md hover:bg-muted">
                        <Upload size={18} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Import bază de date</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-secondary text-white">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Contul meu</DropdownMenuLabel>
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/auth/settings" className="cursor-pointer flex w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Deconectare</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-blueprint">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
