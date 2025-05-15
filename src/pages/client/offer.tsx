import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from '@/hooks/use-toast';
import { getFurniturePresets } from '@/services/storage';
import { calculateProjectMaterialTotal, calculateProjectAccessoryTotal } from '@/services/calculations';

interface Cabinet {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  price: number;
  material?: string;
  accessories?: { id: string; name: string; price: number; quantity: number }[];
  materials?: { id: string; name: string; quantity: number }[];
  position?: { x: number; y: number };
  quantity?: number;
}

interface WallDimensions {
  width: number;
  height: number;
  depth: number;
}

interface DraggableCabinetProps {
  cabinet: Cabinet;
  onDragEnd: (id: string, x: number, y: number) => void;
  position: { x: number; y: number };
  scale: number;
  onSelect: () => void;
}

const DraggableCabinet: React.FC<DraggableCabinetProps> = ({ 
  cabinet, position, scale, onSelect
}) => {
  return (
    <div 
      className="absolute cursor-move"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${cabinet.width * scale}px`,
        height: `${cabinet.height * scale}px`,
        backgroundColor: 'rgba(155, 135, 245, 0.8)',
        border: '2px solid #7E69AB',
        borderRadius: '4px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '0.8rem',
        padding: '4px',
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {cabinet.name}
    </div>
  );
};

export default function ClientOffer() {
  const [presets, setPresets] = useState<Cabinet[]>([]);
  const [wallDimensions, setWallDimensions] = useState<WallDimensions>({
    width: 400,
    height: 250,
    depth: 60
  });
  const [selectedCabinets, setSelectedCabinets] = useState<Cabinet[]>([]);
  const [scale, setScale] = useState<number>(1);
  const [openQuoteModal, setOpenQuoteModal] = useState<boolean>(false);
  const [showCabinetDetail, setShowCabinetDetail] = useState<boolean>(false);
  const [selectedCabinetDetail, setSelectedCabinetDetail] = useState<Cabinet | null>(null);
  const [materialTotal, setMaterialTotal] = useState<number>(0);
  const [accessoryTotal, setAccessoryTotal] = useState<number>(0);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  useEffect(() => {
    const loadPresets = async () => {
      try {
        const data = await getFurniturePresets<Cabinet>();
        setPresets(data);
      } catch (error) {
        console.error('Error loading presets:', error);
        toast.error('Nu s-au putut încărca corpurile predefinite');
      }
    };
    
    loadPresets();
  }, []);
  
  useEffect(() => {
    calculateTotals();
  }, [selectedCabinets]);
  
  useEffect(() => {
    // Calculate scale based on wall width
    const maxWidth = 800; // max canvas width
    const scaleFactor = maxWidth / wallDimensions.width;
    setScale(scaleFactor);
  }, [wallDimensions.width]);
  
  const calculateTotals = () => {
    const matTotal = calculateProjectMaterialTotal(selectedCabinets);
    const accTotal = calculateProjectAccessoryTotal(selectedCabinets);
    
    setMaterialTotal(matTotal);
    setAccessoryTotal(accTotal);
  };

  const handleAddCabinet = (cabinet: Cabinet) => {
    const newCabinet = {
      ...cabinet,
      id: `${cabinet.id}_${Date.now()}`,
      position: { 
        x: 20, 
        y: 20 
      },
      quantity: 1
    };
    
    setSelectedCabinets([...selectedCabinets, newCabinet]);
    toast.success(`${cabinet.name} a fost adăugat în proiect`);
  };

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    setSelectedCabinets(cabinets => 
      cabinets.map(cab => {
        if (cab.id === id) {
          return { ...cab, position: { x, y } };
        }
        return cab;
      })
    );
  }, []);
  
  const handleRemoveCabinet = (id: string) => {
    setSelectedCabinets(cabinets => cabinets.filter(cab => cab.id !== id));
    setShowCabinetDetail(false);
  };
  
  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setSelectedCabinets(cabinets => 
      cabinets.map(cab => {
        if (cab.id === id) {
          return { ...cab, quantity };
        }
        return cab;
      })
    );
  };
  
  const handleSelectCabinet = (cabinet: Cabinet) => {
    setSelectedCabinetDetail(cabinet);
    setShowCabinetDetail(true);
  };
  
  const getTotalWidth = () => {
    return selectedCabinets.reduce((total, cab) => {
      return total + (cab.width * (cab.quantity || 1));
    }, 0);
  };
  
  const getWidthPercentage = () => {
    const totalWidth = getTotalWidth();
    return (totalWidth / wallDimensions.width) * 100;
  };
  
  const handleSendEmail = () => {
    const totalPrice = materialTotal + accessoryTotal;
    
    const subject = encodeURIComponent('Oferta mobilier personalizat');
    const body = encodeURIComponent(`
      Bună ziua,
      
      Vă trimit o ofertă pentru mobilier personalizat creat cu ajutorul aplicației Configurator Mobilă.
      
      Detalii ofertă:
      - Total materiale: ${materialTotal.toLocaleString('ro-RO')} RON
      - Total accesorii: ${accessoryTotal.toLocaleString('ro-RO')} RON
      - Preț total (fără TVA, manoperă și transport): ${totalPrice.toLocaleString('ro-RO')} RON
      
      Produse selectate:
      ${selectedCabinets.map(cab => `- ${cab.quantity || 1}x ${cab.name} - ${cab.price.toLocaleString('ro-RO')} RON/buc`).join('\n')}
      
      Dimensiuni perete: ${wallDimensions.width}x${wallDimensions.height}x${wallDimensions.depth} cm
      
      Cu stimă,
      [Numele dvs.]
    `);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Generator Ofertă</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dimensiuni Perete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="wall-width">Lățime (cm)</Label>
                  <Input 
                    id="wall-width" 
                    type="number" 
                    min="100" 
                    max="1000"
                    value={wallDimensions.width} 
                    onChange={(e) => setWallDimensions({...wallDimensions, width: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="wall-height">Înălțime (cm)</Label>
                  <Input 
                    id="wall-height" 
                    type="number"
                    min="100" 
                    max="500"  
                    value={wallDimensions.height} 
                    onChange={(e) => setWallDimensions({...wallDimensions, height: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="wall-depth">Adâncime (cm)</Label>
                  <Input 
                    id="wall-depth" 
                    type="number"
                    min="20" 
                    max="100" 
                    value={wallDimensions.depth} 
                    onChange={(e) => setWallDimensions({...wallDimensions, depth: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <Label>Utilizare spațiu ({getWidthPercentage().toFixed(1)}%)</Label>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div 
                    className={`h-3 rounded-full ${getWidthPercentage() > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(getWidthPercentage(), 100)}%` }}
                  ></div>
                </div>
                {getWidthPercentage() > 100 && (
                  <p className="text-red-500 text-sm mt-1">
                    Atenție! Lățimea totală a mobilierului depășește lățimea peretelui cu {(getTotalWidth() - wallDimensions.width).toFixed(1)} cm.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8 relative">
            <div
              className="relative bg-gray-100 border border-gray-300 rounded-lg overflow-hidden"
              style={{
                width: '100%',
                height: `${wallDimensions.height * scale}px`,
                maxHeight: '500px'
              }}
            >
              {selectedCabinets.map((cabinet) => (
                <DraggableCabinet
                  key={cabinet.id}
                  cabinet={cabinet}
                  position={cabinet.position || { x: 0, y: 0 }}
                  onDragEnd={handleDragEnd}
                  scale={scale}
                  onSelect={() => handleSelectCabinet(cabinet)}
                />
              ))}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-muted-foreground">Corpuri: {selectedCabinets.length}</span>
              </div>
              <div>
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => setSelectedCabinets([])}
                >
                  Resetează
                </Button>
                <Button onClick={() => setOpenQuoteModal(true)}>
                  Generează ofertă
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Corpuri disponibile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3">
                {presets.map((preset) => (
                  <Card key={preset.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm">{preset.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {preset.width}×{preset.height}×{preset.depth} cm
                          </p>
                        </div>
                        <span className="font-bold">{preset.price.toLocaleString('ro-RO')} RON</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleAddCabinet(preset)}
                      >
                        Adaugă
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                {presets.length === 0 && (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground">Nu există corpuri disponibile</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Cabinet Detail Modal */}
      <Dialog open={showCabinetDetail} onOpenChange={setShowCabinetDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCabinetDetail?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedCabinetDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dimensiuni</Label>
                  <p className="text-sm">
                    {selectedCabinetDetail.width}×{selectedCabinetDetail.height}×{selectedCabinetDetail.depth} cm
                  </p>
                </div>
                <div>
                  <Label htmlFor="quantity">Cantitate</Label>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(selectedCabinetDetail.id, (selectedCabinetDetail.quantity || 1) - 1)}
                    >
                      -
                    </Button>
                    <Input 
                      id="quantity" 
                      type="number" 
                      min="1"
                      className="h-8 w-16 mx-2 text-center"
                      value={selectedCabinetDetail.quantity || 1}
                      onChange={(e) => handleUpdateQuantity(selectedCabinetDetail.id, Number(e.target.value))}
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(selectedCabinetDetail.id, (selectedCabinetDetail.quantity || 1) + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label>Preț</Label>
                <p className="text-xl font-bold">
                  {(selectedCabinetDetail.price * (selectedCabinetDetail.quantity || 1)).toLocaleString('ro-RO')} RON
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedCabinetDetail.price.toLocaleString('ro-RO')} RON per bucată × {selectedCabinetDetail.quantity || 1}
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="destructive" 
                  onClick={() => handleRemoveCabinet(selectedCabinetDetail.id)}
                >
                  Elimină
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCabinetDetail(false)}
                >
                  Închide
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Generate Quote Modal */}
      <Dialog open={openQuoteModal} onOpenChange={setOpenQuoteModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ofertă generată</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Detalii perete</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Lățime:</span>
                  <p>{wallDimensions.width} cm</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Înălțime:</span>
                  <p>{wallDimensions.height} cm</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Adâncime:</span>
                  <p>{wallDimensions.depth} cm</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Corpuri selectate</h3>
              {selectedCabinets.length > 0 ? (
                <div className="space-y-2">
                  {selectedCabinets.map((cabinet) => (
                    <div key={cabinet.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{cabinet.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({cabinet.width}×{cabinet.height}×{cabinet.depth} cm)
                        </span>
                      </div>
                      <div className="text-right">
                        <span>{cabinet.quantity || 1} × {cabinet.price.toLocaleString('ro-RO')} RON</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nu ați selectat niciun corp</p>
              )}
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Sumar costuri</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total materiale:</span>
                  <span>{materialTotal.toLocaleString('ro-RO')} RON</span>
                </div>
                <div className="flex justify-between">
                  <span>Total accesorii:</span>
                  <span>{accessoryTotal.toLocaleString('ro-RO')} RON</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{(materialTotal + accessoryTotal).toLocaleString('ro-RO')} RON</span>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  * Prețul nu include TVA, manoperă sau transport
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex-1">
              <Button 
                variant="outline" 
                onClick={handleSendEmail} 
                className="w-full"
              >
                Trimite pe email
              </Button>
            </div>
            <div className="flex-1 ml-2">
              <Button 
                onClick={() => setOpenQuoteModal(false)}
                className="w-full"
              >
                Închide
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
