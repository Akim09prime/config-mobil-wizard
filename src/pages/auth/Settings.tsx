
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';

interface ClientSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  notifyEmail: boolean;
  notifySMS: boolean;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ClientSettings>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    notifyEmail: true,
    notifySMS: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: string) => (checked: boolean) => {
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, save to the backend
    toast.success("Setări actualizate cu succes");
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl animate-in">
      <h1 className="text-3xl font-bold mb-8">Setări profil</h1>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informații personale</CardTitle>
            <CardDescription>
              Actualizați informațiile dvs. de contact și preferințele de notificare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nume complet</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={settings.name} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    value={settings.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    value={settings.phone} 
                    onChange={handleChange} 
                    placeholder="07XX XXX XXX"
                  />
                </div>
                <div></div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Adresă</Label>
                <Textarea 
                  id="address" 
                  name="address"
                  value={settings.address} 
                  onChange={handleChange} 
                  placeholder="Strada, număr, bloc, apartament, cod poștal, oraș, județ"
                  rows={3}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preferințe notificări</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifyEmail" className="text-base">Notificări prin email</Label>
                  <p className="text-sm text-muted-foreground">
                    Primește actualizări și oferte prin email
                  </p>
                </div>
                <Switch 
                  id="notifyEmail"
                  checked={settings.notifyEmail}
                  onCheckedChange={handleToggle('notifyEmail')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifySMS" className="text-base">Notificări prin SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Primește actualizări despre proiecte prin SMS
                  </p>
                </div>
                <Switch 
                  id="notifySMS"
                  checked={settings.notifySMS}
                  onCheckedChange={handleToggle('notifySMS')}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline">Anulează</Button>
            <Button type="submit">Salvează modificările</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default Settings;
