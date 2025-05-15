
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface DimensionsTabProps {
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  maxWidth?: number;
  onDimensionChange: (dimension: 'width' | 'height' | 'depth', value: number) => void;
}

const DimensionsTab: React.FC<DimensionsTabProps> = ({
  dimensions,
  maxWidth,
  onDimensionChange
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="width">Lățime (mm): {dimensions.width}</Label>
          <span className="text-sm text-muted-foreground">
            {maxWidth ? `Max: ${maxWidth}mm` : ''}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            id="width"
            type="number"
            min="100"
            max={maxWidth || 2000}
            value={dimensions.width}
            onChange={(e) => onDimensionChange('width', Number(e.target.value))}
            className="w-24"
          />
          <Slider
            value={[dimensions.width]}
            min={100}
            max={maxWidth || 2000}
            step={10}
            className="flex-1"
            onValueChange={([value]) => onDimensionChange('width', value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="height">Înălțime (mm): {dimensions.height}</Label>
        <div className="flex items-center space-x-4">
          <Input
            id="height"
            type="number"
            min="100"
            max="2500"
            value={dimensions.height}
            onChange={(e) => onDimensionChange('height', Number(e.target.value))}
            className="w-24"
          />
          <Slider
            value={[dimensions.height]}
            min={100}
            max={2500}
            step={10}
            className="flex-1"
            onValueChange={([value]) => onDimensionChange('height', value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="depth">Adâncime (mm): {dimensions.depth}</Label>
        <div className="flex items-center space-x-4">
          <Input
            id="depth"
            type="number"
            min="100"
            max="1000"
            value={dimensions.depth}
            onChange={(e) => onDimensionChange('depth', Number(e.target.value))}
            className="w-24"
          />
          <Slider
            value={[dimensions.depth]}
            min={100}
            max={1000}
            step={10}
            className="flex-1"
            onValueChange={([value]) => onDimensionChange('depth', value)}
          />
        </div>
      </div>
    </div>
  );
};

export default DimensionsTab;
