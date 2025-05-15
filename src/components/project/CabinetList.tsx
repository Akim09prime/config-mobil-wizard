
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from '@/hooks/use-toast';
import { Box, Package } from 'lucide-react';

interface CabinetListProps {
  onAddCabinet: () => void;
  onEditCabinet: (cabinet: Cabinet) => void;
}

const CabinetList: React.FC<CabinetListProps> = ({ onAddCabinet, onEditCabinet }) => {
  const { cabinets, deleteCabinet } = useProject();

  const handleDeleteCabinet = (id: string, name: string) => {
    deleteCabinet(id);
    toast({
      title: "Corp șters",
      description: `${name} a fost șters din proiect`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Corpuri adăugate</h3>
        <Button onClick={onAddCabinet} className="flex items-center gap-1">
          <Box size={16} />
          <span>Adaugă Corp Nou</span>
        </Button>
      </div>

      {cabinets.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="py-6 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Nu există corpuri adăugate în proiect. Adaugă un corp nou sau alege unul presetat.
            </p>
            <Button onClick={onAddCabinet} variant="outline" className="mt-4">
              Adaugă Corp Nou
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cabinets.map((cabinet) => (
            <Card key={cabinet.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{cabinet.name}</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm">Dimensiuni: {cabinet.width}×{cabinet.height}×{cabinet.depth} mm</p>
                <p className="text-sm font-medium mt-1">Preț: {cabinet.price || (cabinet.totalCost ? cabinet.totalCost.toFixed(2) : 0)} RON</p>
              </CardContent>
              <CardFooter className="pt-2 flex justify-end space-x-2">
                <Button size="sm" variant="outline" onClick={() => onEditCabinet(cabinet)}>
                  Editează
                </Button>
                <Button size="sm" variant="destructive" 
                  onClick={() => handleDeleteCabinet(cabinet.id, cabinet.name)}>
                  Șterge
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CabinetList;
