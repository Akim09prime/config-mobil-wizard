
/// <reference types="vite/client" />

// Common interface for Cabinet used across the application
interface Cabinet {
  id: string;
  name: string;
  category?: string;
  subcategory?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  width: number;
  height: number;
  depth: number;
  price: number;
  image?: string | null;
  isPreset?: boolean;
  pieces?: {
    id: string;
    name: string;
    material: string;
    width: number;
    height: number;
    depth?: number;
    quantity: number;
  }[];
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
  totalCost?: number;
}
