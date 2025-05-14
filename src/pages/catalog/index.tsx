
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { getFurniturePresets } from '@/services/storage';
import { getTaxonomies } from '@/services/storage';
import { toast } from '@/hooks/use-toast';

interface Cabinet {
  id: string;
  name: string;
  category?: string;
  subcategory?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  width: number;
  height: number;
  depth: number;
  price: number;
  image?: string | null;
}

interface Taxonomy {
  id: string;
  name: string;
  subcategories?: { id: string; name: string }[];
}

export default function CatalogPage() {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [filteredCabinets, setFilteredCabinets] = useState<Cabinet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Taxonomy[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [detailCabinet, setDetailCabinet] = useState<Cabinet | null>(null);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const cabinetsData = await getFurniturePresets();
        setCabinets(cabinetsData);
        setFilteredCabinets(cabinetsData);
        
        const taxonomiesData = getTaxonomies();
        if (taxonomiesData && taxonomiesData.categories) {
          setCategories(taxonomiesData.categories);
        }
      } catch (error) {
        console.error('Error fetching catalog data:', error);
        toast.error('Nu s-au putut încărca datele catalogului');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    filterCabinets();
  }, [selectedCategory, selectedSubcategory, selectedMaterial, searchTerm, cabinets]);

  const filterCabinets = () => {
    let filtered = [...cabinets];
    
    if (selectedCategory) {
      filtered = filtered.filter(cabinet => cabinet.category === selectedCategory);
    }
    
    if (selectedSubcategory) {
      filtered = filtered.filter(cabinet => cabinet.subcategory === selectedSubcategory);
    }

    if (selectedMaterial && filtered.length) {
      filtered = filtered.filter(cabinet => {
        if (cabinet.materials && cabinet.materials.length) {
          return cabinet.materials.some(material => 
            material.name.toLowerCase().includes(selectedMaterial.toLowerCase())
          );
        }
        return false;
      });
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cabinet => 
        cabinet.name.toLowerCase().includes(term)
      );
    }
    
    setFilteredCabinets(filtered);
  };

  const handleCabinetClick = (cabinet: Cabinet) => {
    setDetailCabinet(cabinet);
    setShowDetail(true);
  };

  const getAvailableSubcategories = () => {
    if (!selectedCategory) return [];
    const category = categories.find(cat => cat.id === selectedCategory);
    return category?.subcategories || [];
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Catalog Mobilier</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Căutare</Label>
            <Input
              id="search"
              placeholder="Caută după nume..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Zonă</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Toate zonele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toate zonele</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="subcategory">Tip</Label>
            <Select 
              value={selectedSubcategory} 
              onValueChange={setSelectedSubcategory}
              disabled={!selectedCategory}
            >
              <SelectTrigger id="subcategory">
                <SelectValue placeholder="Toate tipurile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toate tipurile</SelectItem>
                {getAvailableSubcategories().map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="material">Material</Label>
            <Input
              id="material"
              placeholder="Filtrează după material..."
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : filteredCabinets.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Nu s-au găsit rezultate</h2>
          <p className="text-muted-foreground">Încercați alte criterii de filtrare.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSelectedCategory('');
              setSelectedSubcategory('');
              setSelectedMaterial('');
              setSearchTerm('');
            }}
          >
            Resetează filtrele
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCabinets.map((cabinet) => (
            <Card 
              key={cabinet.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCabinetClick(cabinet)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-lg truncate">{cabinet.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <AspectRatio ratio={4/3} className="bg-muted rounded-md mb-3">
                  {cabinet.image ? (
                    <img
                      src={cabinet.image}
                      alt={cabinet.name}
                      className="rounded-md object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                      Fără imagine
                    </div>
                  )}
                </AspectRatio>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensiuni:</span>
                    <span>
                      {cabinet.width}×{cabinet.height}×{cabinet.depth} cm
                    </span>
                  </div>
                  {cabinet.category && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Categorie:</span>
                      <span>{categories.find(c => c.id === cabinet.category)?.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <span className="font-bold text-lg">
                  {cabinet.price.toLocaleString('ro-RO')} RON
                </span>
                <Button size="sm" variant="outline">Detalii</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{detailCabinet?.name}</DialogTitle>
          </DialogHeader>
          
          {detailCabinet && (
            <div className="grid gap-6">
              <AspectRatio ratio={16/9} className="bg-muted rounded-md">
                {detailCabinet.image ? (
                  <img
                    src={detailCabinet.image}
                    alt={detailCabinet.name}
                    className="rounded-md object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                    Fără imagine
                  </div>
                )}
              </AspectRatio>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Specificații</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensiuni:</span>
                      <span>
                        {detailCabinet.width}×{detailCabinet.height}×{detailCabinet.depth} cm
                      </span>
                    </div>
                    {detailCabinet.category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Categorie:</span>
                        <span>{categories.find(c => c.id === detailCabinet.category)?.name}</span>
                      </div>
                    )}
                    {detailCabinet.subcategory && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subcategorie:</span>
                        <span>{detailCabinet.subcategory}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Materiale</h3>
                  <div className="space-y-1 text-sm">
                    {detailCabinet.materials && detailCabinet.materials.length > 0 ? (
                      detailCabinet.materials.map((material, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{material.name}</span>
                          <span>{material.quantity} buc</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Fără materiale specificate</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Accesorii</h3>
                <div className="space-y-1 text-sm">
                  {detailCabinet.accessories && detailCabinet.accessories.length > 0 ? (
                    detailCabinet.accessories.map((accessory, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{accessory.name}</span>
                        <span>{accessory.quantity} buc</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Fără accesorii specificate</span>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t flex justify-between items-center">
                <div>
                  <span className="text-sm text-muted-foreground">Preț de bază</span>
                  <div className="font-bold text-xl">
                    {detailCabinet.price.toLocaleString('ro-RO')} RON
                  </div>
                </div>
                <Button onClick={() => navigate('/calculator')}>
                  Configurează
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
