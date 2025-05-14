
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface Room {
  id: string;
  name: string;
  selected: boolean;
  dimensions: {
    length: number;
    height: number;
    depth: number;
  };
}

interface ApartmentRoomSelectorProps {
  rooms: Room[];
  onUpdateRooms: (rooms: Room[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const defaultRooms: Room[] = [
  { id: 'kitchen', name: 'Bucătărie', selected: false, dimensions: { length: 300, height: 250, depth: 60 } },
  { id: 'bedroom', name: 'Dormitor', selected: false, dimensions: { length: 400, height: 250, depth: 60 } },
  { id: 'living', name: 'Living', selected: false, dimensions: { length: 450, height: 250, depth: 60 } },
  { id: 'bathroom', name: 'Baie', selected: false, dimensions: { length: 200, height: 250, depth: 45 } },
  { id: 'hall', name: 'Hol', selected: false, dimensions: { length: 250, height: 250, depth: 45 } },
  { id: 'office', name: 'Birou', selected: false, dimensions: { length: 300, height: 250, depth: 60 } },
  { id: 'children', name: 'Cameră Copil', selected: false, dimensions: { length: 350, height: 250, depth: 60 } },
];

const ApartmentRoomSelector: React.FC<ApartmentRoomSelectorProps> = ({
  rooms: initialRooms = defaultRooms,
  onUpdateRooms,
  onNext,
  onBack
}) => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  const handleRoomToggle = (id: string) => {
    const updatedRooms = rooms.map(room => 
      room.id === id ? { ...room, selected: !room.selected } : room
    );
    setRooms(updatedRooms);
    onUpdateRooms(updatedRooms);
  };

  const handleDimensionChange = (id: string, dimension: keyof Room['dimensions'], value: number) => {
    const updatedRooms = rooms.map(room => 
      room.id === id 
        ? { ...room, dimensions: { ...room.dimensions, [dimension]: value } } 
        : room
    );
    setRooms(updatedRooms);
    onUpdateRooms(updatedRooms);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Selectează camerele din apartament</CardTitle>
        <CardDescription>Bifează camerele pentru care dorești să configurezi mobilier și introdu dimensiunile</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {rooms.map((room) => (
            <div key={room.id} className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`room-${room.id}`} 
                  checked={room.selected}
                  onCheckedChange={() => handleRoomToggle(room.id)}
                />
                <Label 
                  htmlFor={`room-${room.id}`}
                  className="text-base font-medium"
                >
                  {room.name}
                </Label>
              </div>
              
              {room.selected && (
                <div className="grid grid-cols-3 gap-3 pl-6">
                  <div>
                    <Label htmlFor={`${room.id}-length`} className="text-sm">Lungime (cm)</Label>
                    <Input
                      id={`${room.id}-length`}
                      type="number"
                      min={50}
                      max={1000}
                      value={room.dimensions.length}
                      onChange={(e) => handleDimensionChange(room.id, 'length', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${room.id}-height`} className="text-sm">Înălțime (cm)</Label>
                    <Input
                      id={`${room.id}-height`}
                      type="number"
                      min={50}
                      max={500}
                      value={room.dimensions.height}
                      onChange={(e) => handleDimensionChange(room.id, 'height', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${room.id}-depth`} className="text-sm">Adâncime (cm)</Label>
                    <Input
                      id={`${room.id}-depth`}
                      type="number"
                      min={20}
                      max={100}
                      value={room.dimensions.depth}
                      onChange={(e) => handleDimensionChange(room.id, 'depth', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={onBack}>Înapoi</Button>
            <Button onClick={onNext}>Continuă</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApartmentRoomSelector;
