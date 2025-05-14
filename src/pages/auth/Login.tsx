
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      toast.success('Autentificare reușită');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blueprint">
      <div className="w-full max-w-md p-6 animate-in">
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Autentificare</CardTitle>
            <CardDescription>
              Introduceți datele pentru a vă conecta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="nume@exemplu.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Parola</Label>
                  <Link to="/auth/forgot-password" className="text-sm text-accent hover:underline">
                    Ați uitat parola?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="mt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-secondary hover:bg-secondary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Se procesează...
                    </span>
                  ) : 'Conectare'}
                </Button>
              </div>
            </form>
            <div className="mt-4">
              <p className="text-center text-sm">
                Tipuri de cont demo:
                <br />
                <code className="text-xs bg-muted p-1 rounded">admin@exemplu.com</code>, 
                <code className="text-xs bg-muted p-1 rounded">proiectant@exemplu.com</code>, 
                <code className="text-xs bg-muted p-1 rounded">client@exemplu.com</code>
                <br />
                <span className="text-xs text-muted-foreground">(Orice parolă funcționează)</span>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm mt-2">
              Nu aveți cont?{' '}
              <Link to="/auth/register" className="text-accent hover:underline">
                Înregistrați-vă
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
