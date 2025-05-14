
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { toast } from 'sonner';

// Import icons
import {
  Home,
  LogOut,
  User,
  Calculator,
  BookOpen,
  File,
  Menu,
  X,
} from 'lucide-react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success('Deconectare reușită');
    navigate('/auth/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const menuItems = [
    { title: 'Acasă', icon: <Home size={20} />, path: '/' },
    { title: 'Catalog Mobilier', icon: <BookOpen size={20} />, path: '/catalog' },
    { title: 'Calculator Rapid', icon: <Calculator size={20} />, path: '/calculator' },
    { title: 'Generare Ofertă', icon: <File size={20} />, path: '/client/offer', requireAuth: true },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-blueprint">
      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="bg-card flex items-center justify-between p-4 border-b">
          <Link to="/" className="text-xl font-bold">
            Configurator Mobila
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md hover:bg-muted"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="bg-card border-b">
            <nav className="px-2 py-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.path)
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-foreground hover:bg-muted'
                  } ${item.requireAuth && !isAuthenticated ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Desktop header */}
      <header className="hidden md:flex bg-card z-10 h-16 items-center justify-between px-6 border-b">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h2 className="text-xl font-semibold">Configurator Mobila</h2>
          </Link>
        </div>
        
        <nav className="flex space-x-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive(item.path)
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-foreground hover:bg-muted'
              } ${item.requireAuth && !isAuthenticated ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <span className="mr-2">{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
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
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link to="/auth/login">Conectare</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">Înregistrare</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-card border-t py-6 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Configurator Mobila</h3>
              <p className="text-muted-foreground text-sm">
                Soluția completă pentru configurarea și proiectarea mobilierului.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legături rapide</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/catalog" className="text-muted-foreground hover:text-foreground">
                    Catalog
                  </Link>
                </li>
                <li>
                  <Link to="/calculator" className="text-muted-foreground hover:text-foreground">
                    Calculator rapid
                  </Link>
                </li>
                <li>
                  <Link to="/client/offer" className="text-muted-foreground hover:text-foreground">
                    Generare ofertă
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Contact</h4>
              <div className="text-sm text-muted-foreground">
                <p>Email: contact@configurator-mobila.ro</p>
                <p>Telefon: 0712 345 678</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-6 pt-6 text-center text-sm text-muted-foreground">
            <p>© 2023 Configurator Mobila. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;
