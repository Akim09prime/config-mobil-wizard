
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { StorageKeys, getTaxonomies, getSettings } from '@/services/storage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CalculatorFormValues {
  width: number;
  height: number;
  depth: number;
  material: string;
  quantity: number;
  categoryId: string;
  accessories: { id: string; quantity: number }[];
}

interface MaterialOption {
  id: string;
  name: string;
  price: number;
}

interface AccessoryOption {
  id: string;
  name: string;
  price: number;
}

interface CategoryOption {
  id: string;
  name: string;
}

const FurnitureCalculator: React.FC = () => {
  const [formValues, setFormValues] = useState<CalculatorFormValues>({
    width: 600,
    height: 720,
    depth: 560,
    material: '',
    quantity: 1,
    categoryId: '',
    accessories: [],
  });

  const [materialOptions, setMaterialOptions] = useState<MaterialOption[]>([]);
  const [accessoryOptions, setAccessoryOptions] = useState<AccessoryOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<{ id: string; name: string; quantity: number; price: number }[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [calculationResult, setCalculationResult] = useState<any | null>(null);
  const [accessoryToAdd, setAccessoryToAdd] = useState<string>('');
  const [accessoryQuantity, setAccessoryQuantity] = useState<number>(1);

  useEffect(() => {
    // Load materials from local storage
    try {
      const materialsData = localStorage.getItem(StorageKeys.MATERIALS);
      if (materialsData) {
        const materials = JSON.parse(materialsData);
        setMaterialOptions(materials.map((mat: any) => ({
          id: mat.id,
          name: mat.name,
          price: mat.price || 0,
        })));
        
        if (materials.length > 0 && !formValues.material) {
          setFormValues(prev => ({ ...prev, material: materials[0].id }));
        }
      }

      // Load accessories
      const accessoriesData = localStorage.getItem(StorageKeys.ACCESSORIES);
      if (accessoriesData) {
        const accessories = JSON.parse(accessoriesData);
        setAccessoryOptions(accessories.map((acc: any) => ({
          id: acc.id,
          name: acc.name,
          price: acc.price || 0,
        })));
      }

      // Load categories
      const taxonomies = getTaxonomies();
      if (taxonomies && taxonomies.categories) {
        setCategoryOptions(taxonomies.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
        })));
        
        if (taxonomies.categories.length > 0 && !formValues.categoryId) {
          setFormValues(prev => ({ ...prev, categoryId: taxonomies.categories[0].id }));
        }
      }

      // Load settings
      const appSettings = getSettings();
      setSettings(appSettings);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca datele necesare',
        variant: 'destructive',
      });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: parseFloat(value) || 0 });
  };

  const handleMaterialChange = (value: string) => {
    setFormValues({ ...formValues, material: value });
  };

  const handleCategoryChange = (value: string) => {
    setFormValues({ ...formValues, categoryId: value });
  };

  const handleAddAccessory = () => {
    if (!accessoryToAdd) return;
    
    const accessory = accessoryOptions.find(acc => acc.id === accessoryToAdd);
    if (!accessory) return;
    
    const existing = selectedAccessories.findIndex(acc => acc.id === accessoryToAdd);
    
    if (existing >= 0) {
      // Update existing accessory quantity
      const updated = [...selectedAccessories];
      updated[existing].quantity += accessoryQuantity;
      setSelectedAccessories(updated);
    } else {
      // Add new accessory
      setSelectedAccessories([...selectedAccessories, {
        id: accessory.id,
        name: accessory.name,
        quantity: accessoryQuantity,
        price: accessory.price,
      }]);
    }
    
    setAccessoryToAdd('');
    setAccessoryQuantity(1);
  };

  const removeAccessory = (id: string) => {
    setSelectedAccessories(selectedAccessories.filter(acc => acc.id !== id));
  };

  const calculatePrice = () => {
    try {
      if (!formValues.material) {
        toast({
          title: 'Atenție',
          description: 'Selectați un material',
          variant: 'destructive',
        });
        return;
      }

      const selectedMaterial = materialOptions.find(mat => mat.id === formValues.material);
      if (!selectedMaterial) {
        toast({
          title: 'Eroare',
          description: 'Materialul selectat nu a fost găsit',
          variant: 'destructive',
        });
        return;
      }

      // Calculate material area needed in square meters
      const width = formValues.width / 1000; // convert to meters
      const height = formValues.height / 1000; // convert to meters
      const depth = formValues.depth / 1000; // convert to meters
      
      // Basic calculation - surface area of sides, top, bottom, back
      const materialArea = (
        2 * (width * height) + // sides
        2 * (width * depth) + // top and bottom
        1 * (height * depth)   // back
      );
      
      // Material cost
      const materialCost = materialArea * selectedMaterial.price;
      
      // Accessories cost
      const accessoriesCost = selectedAccessories.reduce((sum, acc) => {
        return sum + (acc.price * acc.quantity);
      }, 0);
      
      // Apply settings
      const manopera = settings.manopera || 15; // percentage
      const transport = settings.transport || 5; // percentage
      const adaos = settings.adaos || 10; // percentage
      const tva = settings.tva || 19; // percentage
      
      const subtotal = materialCost + accessoriesCost;
      const manoperaValue = subtotal * (manopera / 100);
      const transportValue = subtotal * (transport / 100);
      const adaosValue = subtotal * (adaos / 100);
      
      const totalFaraTVA = subtotal + manoperaValue + transportValue + adaosValue;
      const tvaValue = totalFaraTVA * (tva / 100);
      const totalCuTVA = totalFaraTVA + tvaValue;
      
      // Final price calculation
      const result = {
        dimensions: {
          width: formValues.width,
          height: formValues.height,
          depth: formValues.depth,
        },
        material: {
          name: selectedMaterial.name,
          area: materialArea.toFixed(2),
          cost: materialCost.toFixed(2),
        },
        accessories: selectedAccessories.map(acc => ({
          name: acc.name,
          quantity: acc.quantity,
          cost: (acc.price * acc.quantity).toFixed(2),
        })),
        accessoriesTotal: accessoriesCost.toFixed(2),
        subtotal: subtotal.toFixed(2),
        manopera: manoperaValue.toFixed(2),
        transport: transportValue.toFixed(2),
        adaos: adaosValue.toFixed(2),
        totalFaraTVA: totalFaraTVA.toFixed(2),
        tva: tvaValue.toFixed(2),
        total: totalCuTVA.toFixed(2),
        quantity: formValues.quantity,
        finalTotal: (totalCuTVA * formValues.quantity).toFixed(2),
        currency: settings.currency || 'RON',
      };
      
      setCalculationResult(result);
    } catch (error) {
      console.error('Error calculating price:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut calcula prețul',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    if (!calculationResult) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut deschide fereastra de printare. Verificați setările browserului.',
        variant: 'destructive',
      });
      return;
    }
    
    const category = categoryOptions.find(cat => cat.id === formValues.categoryId);
    const currentDate = new Date().toLocaleDateString('ro-RO');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Ofertă Mobilier - ${currentDate}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1, h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            table, th, td { border: 1px solid #ddd; }
            th, td { padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .footer { margin-top: 30px; font-size: 0.9em; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Ofertă Mobilier</h1>
          <p><strong>Data:</strong> ${currentDate}</p>
          
          <h2>Detalii Produs</h2>
          <p><strong>Categorie:</strong> ${category ? category.name : 'N/A'}</p>
          <p><strong>Dimensiuni:</strong> ${calculationResult.dimensions.width}mm x ${calculationResult.dimensions.height}mm x ${calculationResult.dimensions.depth}mm</p>
          <p><strong>Material:</strong> ${calculationResult.material.name} (${calculationResult.material.area} m²)</p>
          <p><strong>Cantitate:</strong> ${calculationResult.quantity} buc</p>
          
          <h2>Cost Materiale</h2>
          <table>
            <thead>
              <tr>
                <th>Element</th>
                <th>Cantitate</th>
                <th class="text-right">Preț</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Material: ${calculationResult.material.name}</td>
                <td>${calculationResult.material.area} m²</td>
                <td class="text-right">${calculationResult.material.cost} ${calculationResult.currency}</td>
              </tr>
              ${calculationResult.accessories.map((acc: any) => `
                <tr>
                  <td>${acc.name}</td>
                  <td>${acc.quantity} buc</td>
                  <td class="text-right">${acc.cost} ${calculationResult.currency}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h2>Costuri Totale</h2>
          <table>
            <tbody>
              <tr>
                <td>Subtotal Materiale</td>
                <td class="text-right">${calculationResult.subtotal} ${calculationResult.currency}</td>
              </tr>
              <tr>
                <td>Manoperă (${settings.manopera || 15}%)</td>
                <td class="text-right">${calculationResult.manopera} ${calculationResult.currency}</td>
              </tr>
              <tr>
                <td>Transport (${settings.transport || 5}%)</td>
                <td class="text-right">${calculationResult.transport} ${calculationResult.currency}</td>
              </tr>
              <tr>
                <td>Adaos comercial (${settings.adaos || 10}%)</td>
                <td class="text-right">${calculationResult.adaos} ${calculationResult.currency}</td>
              </tr>
              <tr>
                <td>Total fără TVA</td>
                <td class="text-right">${calculationResult.totalFaraTVA} ${calculationResult.currency}</td>
              </tr>
              <tr>
                <td>TVA (${settings.tva || 19}%)</td>
                <td class="text-right">${calculationResult.tva} ${calculationResult.currency}</td>
              </tr>
              <tr class="total-row">
                <td>Total per bucată</td>
                <td class="text-right">${calculationResult.total} ${calculationResult.currency}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL (${calculationResult.quantity} buc)</td>
                <td class="text-right">${calculationResult.finalTotal} ${calculationResult.currency}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            ${settings.pdfFooter || 'Configurator Mobila - www.configurator-mobila.ro'}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Calculator Mobilier</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Specificații Mobilier</CardTitle>
              <CardDescription>Introduceți dimensiunile și selectați materialele pentru calculul de preț</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="dimensions">
                <TabsList className="mb-4">
                  <TabsTrigger value="dimensions">Dimensiuni</TabsTrigger>
                  <TabsTrigger value="materials">Materiale</TabsTrigger>
                  <TabsTrigger value="accessories">Accesorii</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dimensions" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">Lățime (mm)</Label>
                      <Input
                        id="width"
                        name="width"
                        type="number"
                        value={formValues.width}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Înălțime (mm)</Label>
                      <Input
                        id="height"
                        name="height"
                        type="number"
                        value={formValues.height}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depth">Adâncime (mm)</Label>
                      <Input
                        id="depth"
                        name="depth"
                        type="number"
                        value={formValues.depth}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categorie</Label>
                      <Select value={formValues.categoryId} onValueChange={handleCategoryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectați categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map(category => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Cantitate</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        value={formValues.quantity}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="materials" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Select value={formValues.material} onValueChange={handleMaterialChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectați materialul" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialOptions.map(material => (
                          <SelectItem key={material.id} value={material.id}>{material.name} - {material.price} {settings.currency || 'RON'}/m²</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="accessories" className="space-y-4">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Select value={accessoryToAdd} onValueChange={setAccessoryToAdd}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectați accesoriu" />
                        </SelectTrigger>
                        <SelectContent>
                          {accessoryOptions.map(accessory => (
                            <SelectItem key={accessory.id} value={accessory.id}>
                              {accessory.name} - {accessory.price} {settings.currency || 'RON'}/buc
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        value={accessoryQuantity}
                        onChange={(e) => setAccessoryQuantity(parseInt(e.target.value) || 1)}
                        placeholder="Cant."
                      />
                    </div>
                    <Button onClick={handleAddAccessory}>Adaugă</Button>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Accesorii Selectate</h3>
                    {selectedAccessories.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Accesoriu</TableHead>
                            <TableHead>Cantitate</TableHead>
                            <TableHead>Preț/buc</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="w-16">Acțiuni</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedAccessories.map(acc => (
                            <TableRow key={acc.id}>
                              <TableCell>{acc.name}</TableCell>
                              <TableCell>{acc.quantity}</TableCell>
                              <TableCell>{acc.price} {settings.currency || 'RON'}</TableCell>
                              <TableCell>{(acc.price * acc.quantity).toFixed(2)} {settings.currency || 'RON'}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="destructive" onClick={() => removeAccessory(acc.id)}>
                                  Șterge
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground text-sm">Nu sunt accesorii selectate</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 flex justify-end">
                <Button onClick={calculatePrice}>Calculează Preț</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Rezultat Calcul</CardTitle>
            </CardHeader>
            <CardContent>
              {calculationResult ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Dimensiuni</h3>
                    <p className="text-sm text-muted-foreground">
                      {calculationResult.dimensions.width}mm × {calculationResult.dimensions.height}mm × {calculationResult.dimensions.depth}mm
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Materiale</h3>
                    <p className="text-sm text-muted-foreground">
                      {calculationResult.material.name} - {calculationResult.material.area} m²
                    </p>
                    <p className="text-sm">
                      {calculationResult.material.cost} {calculationResult.currency}
                    </p>
                  </div>
                  
                  {calculationResult.accessories.length > 0 && (
                    <div>
                      <h3 className="font-medium">Accesorii</h3>
                      <ul className="text-sm space-y-1">
                        {calculationResult.accessories.map((acc: any, i: number) => (
                          <li key={i} className="flex justify-between">
                            <span>{acc.name} × {acc.quantity}</span>
                            <span>{acc.cost} {calculationResult.currency}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{calculationResult.subtotal} {calculationResult.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Manoperă ({settings.manopera || 15}%)</span>
                      <span>{calculationResult.manopera} {calculationResult.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Transport ({settings.transport || 5}%)</span>
                      <span>{calculationResult.transport} {calculationResult.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Adaos ({settings.adaos || 10}%)</span>
                      <span>{calculationResult.adaos} {calculationResult.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total fără TVA</span>
                      <span>{calculationResult.totalFaraTVA} {calculationResult.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>TVA ({settings.tva || 19}%)</span>
                      <span>{calculationResult.tva} {calculationResult.currency}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-medium">
                      <span>Total per bucată</span>
                      <span>{calculationResult.total} {calculationResult.currency}</span>
                    </div>
                    {calculationResult.quantity > 1 && (
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>TOTAL ({calculationResult.quantity} buc)</span>
                        <span>{calculationResult.finalTotal} {calculationResult.currency}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button className="w-full mt-4" onClick={handlePrint}>
                    Generează Ofertă PDF
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Completați dimensiunile și materialele, apoi apăsați pe "Calculează Preț"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FurnitureCalculator;
