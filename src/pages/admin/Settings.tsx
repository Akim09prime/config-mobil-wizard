
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StorageKeys, getSettings, updateSettings } from '@/services/storage';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Settings {
  tva: number;
  manopera: number;
  transport: number;
  adaos: number;
  currency: string;
  pdfFooter: string;
}

const settingsSchema = z.object({
  tva: z.number().min(0).max(100),
  manopera: z.number().min(0),
  transport: z.number().min(0),
  adaos: z.number().min(0),
  currency: z.string().min(1),
  pdfFooter: z.string(),
});

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const form = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      tva: 19,
      manopera: 15,
      transport: 5,
      adaos: 10,
      currency: 'RON',
      pdfFooter: '',
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = getSettings();
        setSettings(settingsData);
        
        // Populăm formularul cu setările existente
        Object.keys(settingsData).forEach((key) => {
          form.setValue(key as keyof Settings, settingsData[key]);
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-au putut încărca setările',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    loadSettings();
  }, [form]);

  const onSubmit = (data: Settings) => {
    try {
      updateSettings(data);
      toast({
        title: 'Succes',
        description: 'Setările au fost actualizate cu succes',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut salva setările',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-accent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-8">Setări</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Setări Generale</TabsTrigger>
          <TabsTrigger value="pricing">Prețuri și Calcule</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Setări Generale</CardTitle>
                  <CardDescription>Configurați setările de bază ale aplicației</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moneda</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Moneda folosită pentru prețuri (ex: RON, EUR)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pricing">
              <Card>
                <CardHeader>
                  <CardTitle>Prețuri și Calcule</CardTitle>
                  <CardDescription>Configurați parametrii pentru calculul prețurilor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="tva"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TVA (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Procentul de TVA aplicat
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="manopera"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manoperă (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Procentul pentru manoperă
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="transport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transport (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Procentul pentru transport
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="adaos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adaos comercial (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Adaosul comercial aplicat
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="export">
              <Card>
                <CardHeader>
                  <CardTitle>Setări Export</CardTitle>
                  <CardDescription>Configurați cum se exportă ofertele și comenzile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pdfFooter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer PDF</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Text care va apărea în subsolul documentelor PDF
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <div className="flex justify-end">
              <Button type="submit">Salvează setările</Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default Settings;
