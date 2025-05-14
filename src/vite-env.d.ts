
/// <reference types="vite/client" />

// Common interface for Cabinet used across the application
interface Cabinet {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  // Ensuring all Cabinet objects have these properties
  width: number;
  height: number;
  depth: number;
  price: number;
  image: string | null;
}
