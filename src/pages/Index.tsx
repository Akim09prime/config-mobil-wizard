
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import ClientLayout from '../components/layout/ClientLayout';

const Index: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Function to get user's main page based on role
  const getUserHomePage = () => {
    if (!user) return '/auth/login';
    
    switch (user.role) {
      case 'administrator':
        return '/admin/dashboard';
      case 'proiectant':
        return '/project/new';
      case 'client':
        return '/client/offer';
      default:
        return '/catalog';
    }
  };

  const features = [
    {
      title: 'Catalog Mobilier',
      description: 'Explorați catalogul nostru complet de corpuri de mobilier predefinite.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-secondary">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="12" y1="14" x2="12" y2="14" />
          <rect x="8" y="6" width="8" height="4" />
        </svg>
      ),
      link: '/catalog'
    },
    {
      title: 'Calculator Rapid',
      description: 'Calculați rapid costul mobilierului pe baza dimensiunilor și materialelor alese.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-accent">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="8" x2="16" y2="8" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="16" x2="12" y2="16" />
        </svg>
      ),
      link: '/calculator'
    },
    {
      title: 'Creator Oferte',
      description: 'Creați-vă propria ofertă personalizată prin adăugarea de corpuri și accesorii.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
      link: '/client/offer'
    }
  ];

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero section */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Proiectare și Configurare<br />
            <span className="text-accent">Mobilier la Comandă</span>
          </h1>
          <p className="text-lg mb-8 text-muted-foreground">
            Configurator Mobila vă ajută să proiectați și calculați costuri pentru mobilier personalizat,
            oferind o experiență simplă și intuitivă pentru configurarea spațiilor.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
              <Link to="/catalog">Explorează Catalogul</Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link to={isAuthenticated ? getUserHomePage() : "/auth/register"}>
                {isAuthenticated ? 'Tablou de Bord' : 'Creează Cont'}
              </Link>
            </Button>
          </div>
        </div>

        {/* Features cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/95 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to={feature.link}>Accesează</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Call to action */}
        <div className="bg-secondary/10 rounded-lg p-8 text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Sunteți proiectant sau administrator?</h2>
          <p className="mb-6 text-muted-foreground">
            Accesați instrumentele avansate pentru proiectare și gestionare a proiectelor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary">
              <Link to="/auth/login">Conectare</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth/register">Înregistrare</Link>
            </Button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Index;
