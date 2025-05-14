
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Cabinet {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  price: number;
  position?: { x: number };
}

interface VisualArrangementProps {
  cabinets: Cabinet[];
  roomWidth: number;
  roomHeight: number;
  onCabinetPositionChange: (id: string, position: { x: number }) => void;
}

const VisualArrangement: React.FC<VisualArrangementProps> = ({
  cabinets,
  roomWidth,
  roomHeight,
  onCabinetPositionChange
}) => {
  const [scale, setScale] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedCabinet, setDraggedCabinet] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, number>>({});

  // Calculate scale factor based on room width
  useEffect(() => {
    const maxWidth = 800; // max SVG width
    const scaleFactor = maxWidth / roomWidth;
    setScale(scaleFactor);
  }, [roomWidth]);

  // Initialize cabinet positions if not set
  useEffect(() => {
    const initialPositions: Record<string, number> = {};
    let currentX = 0;
    
    cabinets.forEach((cabinet) => {
      if (cabinet.position && cabinet.position.x !== undefined) {
        initialPositions[cabinet.id] = cabinet.position.x;
      } else {
        initialPositions[cabinet.id] = currentX;
        currentX += cabinet.width + 5; // 5cm spacing between cabinets
      }
    });
    
    setPositions(initialPositions);
  }, [cabinets]);

  const handleMouseDown = (cabinetId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDraggedCabinet(cabinetId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedCabinet) return;

    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    
    // Convert mouse position to cm
    const xInCm = mouseX / scale;
    
    // Find cabinet
    const cabinet = cabinets.find(cab => cab.id === draggedCabinet);
    if (!cabinet) return;
    
    // Prevent dragging outside the wall
    const maxX = roomWidth - cabinet.width;
    const newX = Math.max(0, Math.min(maxX, xInCm));
    
    // Update positions
    setPositions(prev => ({
      ...prev,
      [draggedCabinet]: newX
    }));
  };

  const handleMouseUp = () => {
    if (isDragging && draggedCabinet) {
      // Notify parent about position change
      onCabinetPositionChange(draggedCabinet, { x: positions[draggedCabinet] });
    }
    setIsDragging(false);
    setDraggedCabinet(null);
  };

  // Check if cabinets fit within the room
  const checkFit = () => {
    let maxX = 0;
    
    cabinets.forEach((cabinet) => {
      const x = positions[cabinet.id] || 0;
      maxX = Math.max(maxX, x + cabinet.width);
    });
    
    if (maxX > roomWidth) {
      toast.warning(`Corpurile depășesc limita peretelui cu ${(maxX - roomWidth).toFixed(1)} cm`);
      return false;
    }
    
    toast.success('Corpurile se încadrează în limita peretelui');
    return true;
  };

  const getTotalWidth = () => {
    return cabinets.reduce((sum, cabinet) => sum + cabinet.width, 0);
  };

  const getFilledPercentage = () => {
    return (getTotalWidth() / roomWidth) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Aranjare Vizuală</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <Label>Dimensiuni cameră:</Label>
              <p className="text-sm">{roomWidth}×{roomHeight} cm</p>
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={checkFit}>
                Verifică potrivirea
              </Button>
            </div>
          </div>

          <div>
            <Label>Spațiu utilizat: {getFilledPercentage().toFixed(1)}%</Label>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div 
                className={`h-2.5 rounded-full ${getFilledPercentage() > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(getFilledPercentage(), 100)}%` }}
              ></div>
            </div>
          </div>

          <div 
            className="relative border border-gray-300 rounded-md bg-gray-50 cursor-move"
            style={{ 
              width: '100%', 
              height: `${roomHeight * scale}px`,
              maxHeight: '400px'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Wall representation */}
            <svg width="100%" height="100%" viewBox={`0 0 ${roomWidth} ${roomHeight}`} preserveAspectRatio="xMinYMin">
              {/* Room outline */}
              <rect 
                x="0" 
                y="0" 
                width={roomWidth} 
                height={roomHeight} 
                fill="#f9fafb" 
                stroke="#d1d5db"
                strokeWidth="1"
              />
              
              {/* Cabinets */}
              {cabinets.map((cabinet) => {
                const x = positions[cabinet.id] || 0;
                
                return (
                  <g key={cabinet.id}>
                    <rect
                      x={x}
                      y={roomHeight - cabinet.height}
                      width={cabinet.width}
                      height={cabinet.height}
                      fill="#9b87f5"
                      fillOpacity="0.8"
                      stroke="#7E69AB"
                      strokeWidth="1"
                      onMouseDown={handleMouseDown(cabinet.id)}
                      className="cursor-move hover:fill-opacity-90"
                    />
                    <text
                      x={x + cabinet.width / 2}
                      y={(roomHeight - cabinet.height) + 15}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {cabinet.name}
                    </text>
                    <text
                      x={x + cabinet.width / 2}
                      y={(roomHeight - cabinet.height) + 30}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8"
                    >
                      {cabinet.width}×{cabinet.height} cm
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            * Trageți corpurile pentru a le poziționa pe perete. Verificați potrivirea pentru a vă asigura că toate corpurile se încadrează.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisualArrangement;
