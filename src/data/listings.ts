export type PropertyStatus = 'vente' | 'location';
export type PropertyType = 'villa' | 'appartement' | 'maison' | 'terrain';
export type VehicleType = 'berline' | 'suv' | 'utilitaire' | 'moto' | 'pickup';
export type VehicleCondition = 'neuf' | 'occasion' | 'très bon état';
export type ListingStatus = 'approuvé' | 'en attente' | 'rejeté';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  location: string;
  city: string;
  rooms: number;
  bathrooms: number;
  surface: number;
  description: string;
  features: string[];
  images: string[];
  seller: Seller;
  listingStatus: ListingStatus;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  type: VehicleType;
  status: PropertyStatus;
  price: number;
  year: number;
  mileage: number;
  condition: VehicleCondition;
  color: string;
  fuel: string;
  transmission: string;
  description: string;
  images: string[];
  seller: Seller;
  listingStatus: ListingStatus;
  createdAt: string;
  location: string;
}

export interface Seller {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  verified: boolean;
  memberSince: string;
  listingsCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'particulier' | 'professionnel';
  status: 'actif' | 'suspendu';
  listingsCount: number;
  joinedAt: string;
  avatar: string;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
}
