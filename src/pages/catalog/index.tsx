
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StorageKeys, getAll, findSubcategoryById, getTaxonomies } from '@/services/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, XIcon } from 'lucide-react';
import { TaxonomySelect, SubcategorySelect, SubcategoryPath } from '@/components/TaxonomySelect';
import { toast } from '@/hooks/use-toast';

// Extended Cabinet interface with all needed properties
interface Cabinet {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  price: number;
  image?: string;
  category?: string;
  subcategory?: string;
  zone?: string;
  description?: string;
  accessories?: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  materials?: {
    id: string;
    name: string;
    quantity: number;
    price?: number;
  }[];
}

const CatalogPage: React.FC = () => {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [filteredCabinets, setFilteredCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [subcategoryPath, setSubcategoryPath] = useState<{id: string; name: string}[]>([]);
  const [currentSubcategoryId, setCurrentSubcategoryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadCabinets = async () => {
      try {
        const loadedCabinets = getAll<Cabinet>(StorageKeys.CABINETS) || [];
        
        setCabinets(loadedCabinets);
        setFilteredCabinets(loadedCabinets);
        
        // Extract unique categories and zones
        const uniqueCategories = [...new Set(loadedCabinets.map(cabinet => cabinet.category || 'Necategorizat'))];
        const uniqueZones = [...new Set(loadedCabinets.map(cabinet => cabinet.zone || 'Necategorizat'))];
        
        setCategories(uniqueCategories);
        setZones(uniqueZones);
        setLoading(false);
      } catch (error) {
        console.error('Error loading cabinets:', error);
        setLoading(false);
      }
    };

    loadCabinets();
  }, []);

  useEffect(() => {
    // Apply filters when any filter criteria changes
    applyFilters();
  }, [searchTerm, selectedCategory, selectedSubcategory, selectedZone, cabinets]);
  
  const applyFilters = () => {
    let results = [...cabinets];
    
    // Apply search term filter
    if (searchTerm) {
      results = results.filter(
        cabinet => 
          cabinet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          cabinet.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      results = results.filter(cabinet => cabinet.category === selectedCategory);
      
      // Apply subcategory filter if a category is selected
      if (selectedSubcategory !== 'all') {
        results = results.filter(cabinet => cabinet.subcategory === selectedSubcategory);
      }
    }
    
    // Apply zone filter
    if (selectedZone !== 'all') {
      results = results.filter(cabinet => cabinet.zone === selectedZone);
    }
    
    setFilteredCabinets(results);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('all');
    setSubcategoryPath([]);
    setCurrentSubcategoryId(undefined);
  };
  
  const handleSubcategorySelect = (subcategoryId: string) => {
    // Find the subcategory to add it to the path
    const taxonomies = getTaxonomies();
    const category = taxonomies.categories.find(cat => cat.name === selectedCategory);
    
    if (category) {
      let subcategory;
      
      if (currentSubcategoryId) {
        // Find the parent subcategory first
        const parentSubcategory = findSubcategoryById(category.subcategories, currentSubcategoryId);
        if (parentSubcategory && parentSubcategory.subcategories) {
          subcategory = parentSubcategory.subcategories.find(sub => sub.id === subcategoryId);
        }
      } else {
        // Look for the subcategory at the top level
        subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
      }
      
      if (subcategory) {
        // Add to the subcategory path
        setSubcategoryPath([
          ...subcategoryPath,
          { id: subcategoryId, name: subcategory.name }
        ]);
        setCurrentSubcategoryId(subcategoryId);
        setSelectedSubcategory(subcategory.name);
      }
    }
  };
  
  const navigateSubcategoryPath = (index: number) => {
    if (index === -1) {
      // Navigate to category root
      setSubcategoryPath([]);
      setCurrentSubcategoryId(undefined);
      setSelectedSubcategory('all');
    } else {
      // Navigate to specific subcategory in the path
      const newPath = subcategoryPath.slice(0, index + 1);
      setSubcategoryPath(newPath);
      setCurrentSubcategoryId(newPath[newPath.length - 1].id);
      setSelectedSubcategory(newPath[newPath.length - 1].name);
    }
  };

  const handleCabinetClick = (cabinet: Cabinet) => {
    setSelectedCabinet(cabinet);
    setIsDetailsOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(price);
  };

  const getTotalMaterialsPrice = (cabinet: Cabinet) => {
    if (!cabinet.materials || cabinet.materials.length === 0) return 0;
    return cabinet.materials.reduce((sum, material) => sum + (material.price || 0) * (material.quantity || 1), 0);
  };

  const getTotalAccessoriesPrice = (cabinet: Cabinet) => {
    if (!cabinet.accessories || cabinet.accessories.length === 0) return 0;
    return cabinet.accessories.reduce((sum, accessory) => sum + (accessory.price || 0) * (accessory.quantity || 1), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-accent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Se încarcă catalogul de mobilier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Catalog Mobilier</h1>
      
      {/* Filters */}
      <div className="bg-card rounded-lg p-4 shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Filtrare și Căutare</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Căutare</Label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Caută după nume sau descriere"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <XIcon className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="category">Categorie</Label>
            <TaxonomySelect
              type="categories"
              value={selectedCategory}
              onChange={handleCategoryChange}
              placeholder="Toate categoriile"
              includeAllOption={true}
            />
          </div>
          
          <div>
            <Label htmlFor="zone">Zonă</Label>
            <Select 
              value={selectedZone} 
              onValueChange={setSelectedZone}
            >
              <SelectTrigger id="zone">
                <SelectValue placeholder="Selectează zona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate zonele</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {selectedCategory !== 'all' && (
          <div className="mt-4">
            <Label htmlFor="subcategory">Subcategorie</Label>
            <SubcategorySelect
              type="categories"
              categoryName={selectedCategory}
              value={selectedSubcategory}
              onChange={setSelectedSubcategory}
              placeholder="Toate subcategoriile"
              parentSubcategoryId={currentSubcategoryId}
              onSubcategorySelect={handleSubcategorySelect}
            />
            
            {subcategoryPath.length > 0 && (
              <SubcategoryPath
                type="categories"
                categoryName={selectedCategory}
                subcategoryPath={subcategoryPath}
                onNavigate={navigateSubcategoryPath}
              />
            )}
          </div>
        )}
      </div>
      
      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCabinets.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-xl text-muted-foreground">Nu s-au găsit corpuri de mobilier care să corespundă criteriilor de filtrare.</p>
          </div>
        ) : (
          filteredCabinets.map((cabinet) => (
            <Card 
              key={cabinet.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleCabinetClick(cabinet)}
            >
              <CardContent className="p-4">
                <div className="mb-4">
                  <AspectRatio ratio={4/3} className="bg-muted rounded-md overflow-hidden">
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      {cabinet.image ? (
                        <img 
                          src={cabinet.image} 
                          alt={cabinet.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4 text-muted-foreground">
                          <p className="text-lg font-medium">{cabinet.name}</p>
                          <p className="text-sm">Imagine indisponibilă</p>
                        </div>
                      )}
                    </div>
                  </AspectRatio>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-1 line-clamp-1">{cabinet.name}</h3>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {cabinet.category && (
                      <Badge variant="secondary">{cabinet.category}</Badge>
                    )}
                    {cabinet.subcategory && (
                      <Badge variant="outline">{cabinet.subcategory}</Badge>
                    )}
                    {cabinet.zone && cabinet.zone !== cabinet.category && (
                      <Badge variant="outline">{cabinet.zone}</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm space-y-1 mb-3">
                    <p className="flex justify-between">
                      <span>Dimensiuni:</span>
                      <span className="font-medium">{cabinet.width}x{cabinet.height}x{cabinet.depth} cm</span>
                    </p>
                    {cabinet.materials && cabinet.materials.length > 0 && (
                      <p className="flex justify-between">
                        <span>Materiale:</span>
                        <span className="font-medium">{cabinet.materials.length}</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="text-lg font-bold text-right">
                    {formatPrice(cabinet.price || 0)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Cabinet Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedCabinet?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedCabinet && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden mb-4">
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      {selectedCabinet.image ? (
                        <img 
                          src={selectedCabinet.image} 
                          alt={selectedCabinet.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-8 text-muted-foreground">
                          <p className="text-xl font-medium">Imagine indisponibilă</p>
                        </div>
                      )}
                    </div>
                  </AspectRatio>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm">Categorie</h3>
                    <p>{selectedCabinet.category || 'Necategorizat'}</p>
                  </div>
                  
                  {selectedCabinet.subcategory && (
                    <div>
                      <h3 className="font-semibold text-sm">Subcategorie</h3>
                      <p>{selectedCabinet.subcategory}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-sm">Zonă</h3>
                    <p>{selectedCabinet.zone || 'Nespecificat'}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-sm">Dimensiuni</h3>
                    <p>Lățime: {selectedCabinet.width} cm</p>
                    <p>Înălțime: {selectedCabinet.height} cm</p>
                    <p>Adâncime: {selectedCabinet.depth} cm</p>
                  </div>
                  
                  {selectedCabinet.description && (
                    <div>
                      <h3 className="font-semibold text-sm">Descriere</h3>
                      <p>{selectedCabinet.description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Specificații detaliate</h3>
                <Tabs defaultValue="materials">
                  <TabsList className="mb-4">
                    <TabsTrigger value="materials">Materiale</TabsTrigger>
                    <TabsTrigger value="accessories">Accesorii</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="materials" className="space-y-4">
                    {(!selectedCabinet.materials || selectedCabinet.materials.length === 0) ? (
                      <p className="text-muted-foreground">Nu există materiale definite pentru acest corp.</p>
                    ) : (
                      <div className="border rounded-md">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-2">Material</th>
                              <th className="text-right p-2">Preț</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCabinet.materials.map((material, index) => (
                              <tr key={material.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                                <td className="p-2">{material.name}</td>
                                <td className="text-right p-2">{formatPrice(material.price || 0)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="font-bold border-t">
                            <tr>
                              <td className="p-2">Total materiale</td>
                              <td className="text-right p-2">{formatPrice(getTotalMaterialsPrice(selectedCabinet))}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="accessories" className="space-y-4">
                    {(!selectedCabinet.accessories || selectedCabinet.accessories.length === 0) ? (
                      <p className="text-muted-foreground">Nu există accesorii definite pentru acest corp.</p>
                    ) : (
                      <div className="border rounded-md">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-2">Accesoriu</th>
                              <th className="text-right p-2">Preț</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCabinet.accessories.map((accessory, index) => (
                              <tr key={accessory.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                                <td className="p-2">{accessory.name}</td>
                                <td className="text-right p-2">{formatPrice(accessory.price)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="font-bold border-t">
                            <tr>
                              <td className="p-2">Total accesorii</td>
                              <td className="text-right p-2">{formatPrice(getTotalAccessoriesPrice(selectedCabinet))}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="flex justify-between items-center border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  ID: {selectedCabinet.id}
                </div>
                <div className="text-2xl font-bold">
                  {formatPrice(selectedCabinet.price || 0)}
                </div>
              </div>
              
              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button>Închide</Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CatalogPage;
