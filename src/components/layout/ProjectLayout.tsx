
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  List,
  FileText,
  LayoutDashboard
} from 'lucide-react';

interface ProjectLayoutProps {
  children: React.ReactNode;
}

const ProjectLayout: React.FC<ProjectLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-blueprint flex flex-col">
      {/* Top Navigation */}
      <header className="bg-card z-10 h-16 flex items-center justify-between px-6 border-b">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h2 className="text-xl font-semibold">Configurator Mobila</h2>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {user?.role === 'administrator' && (
            <Link to="/admin/dashboard" className="p-2 rounded-md hover:bg-muted flex items-center text-sm">
              <LayoutDashboard size={18} className="mr-2" />
              <span>Admin Dashboard</span>
            </Link>
          )}
          
          <Link to="/projects" className="p-2 rounded-md hover:bg-muted flex items-center text-sm">
            <List size={18} className="mr-2" />
            <span>Proiectele mele</span>
          </Link>
          
          <Link to="/project/new" className="p-2 rounded-md hover:bg-muted flex items-center text-sm">
            <FileText size={18} className="mr-2" />
            <span>Proiect nou</span>
          </Link>
          
          <Link to="/" className="p-2 rounded-md hover:bg-muted">
            <Home size={18} />
          </Link>
          
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
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default ProjectLayout;
