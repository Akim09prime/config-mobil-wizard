
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorDisplayProps {
  errors: string[];
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors }) => {
  if (errors.length === 0) return null;
  
  return (
    <div className="mb-4">
      {errors.map((error, index) => (
        <Alert variant="destructive" key={index}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default ErrorDisplay;
