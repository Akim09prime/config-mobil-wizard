
import React from 'react';

interface CostSummaryProps {
  cost: number;
}

const CostSummary: React.FC<CostSummaryProps> = ({ cost }) => {
  return (
    <div className="bg-muted p-4 rounded-md">
      <div className="grid grid-cols-2 gap-2">
        <div className="font-medium">Cost materiale:</div>
        <div className="text-right">{cost.toFixed(2)} RON</div>
      </div>
    </div>
  );
};

export default CostSummary;
