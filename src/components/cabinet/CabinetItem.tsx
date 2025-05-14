
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CabinetItemProps {
  cabinet: Cabinet;
  onSelect: (cabinet: Cabinet) => void;
  isSelected?: boolean;
}

const CabinetItem: React.FC<CabinetItemProps> = ({ cabinet, onSelect, isSelected = false }) => {
  return (
    <Card 
      className={`transition-all cursor-pointer ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
      onClick={() => onSelect(cabinet)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="font-medium">{cabinet.name}</div>
          <div className="text-sm text-muted-foreground">{cabinet.category} / {cabinet.subcategory}</div>
          <div className="text-sm">
            Dimensiuni: {cabinet.width} x {cabinet.height} x {cabinet.depth} mm
          </div>
          <div className="font-medium text-primary">{cabinet.price} RON</div>
          <Button 
            variant={isSelected ? "default" : "outline"} 
            className="mt-2 w-full"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(cabinet);
            }}
          >
            {isSelected ? "Selectat" : "Selectează"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CabinetItem;
