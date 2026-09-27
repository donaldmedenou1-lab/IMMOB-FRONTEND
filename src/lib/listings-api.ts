// Pont entre le frontend et les endpoints PHP réels (backend/api/listings/*).
// Remplace les données statiques de src/data/listings.ts par de vraies annonces MySQL,
// tout en réutilisant les mêmes types (Property, Vehicle, Seller) pour ne rien casser
// dans PropertyCard, VehicleCard et les pages existantes.
import { api } from './api';
import type {
  Property,
  Vehicle,
  Seller,
  PropertyType,
  VehicleType,
  VehicleCondition,
  ListingStatus,
} from '../data/listings';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop';

// Convertit les chemins d'images du backend PHP en URLs accessibles
// directement depuis Apache/XAMPP, sans modifier Vite.
function imageUrl(url?: string | null): string {
  if (!url) return FALLBACK_IMAGE;

  if (url.startsWith('/immob/backend/storage/')) {
    return `http://localhost${url}`;
  }

  return url;
}

// Le backend expose 3 statuts de modération ; l'UI existante attend des libellés en français.
export function mapModerationStatus(status?: string): ListingStatus {
  if (status === 'approved') return 'approuvé';
  if (status === 'rejected') return 'rejeté';
  return 'en attente';
}

function placeholderSeller(name?: string, phone?: string): Seller {
  return {
    id: '',
    name: name || 'Vendeur IMMOB',
    phone: phone || '',
    email: '',
    avatar: FALLBACK_AVATAR,
    verified: false,
    memberSince: '',
    listingsCount: 0,
  };
}

interface ApiListingRow {
  id: number;
  type: 'property' | 'vehicle';
  category: string;
  title: string;
  description?: string;
  price: number | string;
  transaction_type: 'vente' | 'location';
  city: string;
  neighborhood?: string | null;
  rooms?: number | null;
  bathrooms?: number | null;
  surface_m2?: number | string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  mileage?: number | null;
  vehicle_condition?: string | null;
  fuel?: string | null;
  transmission?: string | null;
  status?: string;
  rejection_reason?: string | null;
  views_count?: number | string;
  message_count?: number | string;
  created_at: string;
  image?: string | null;
  images?: { url: string; sort_order: number }[];
  seller_name?: string;
  seller_phone?: string;
}

function rowImages(row: ApiListingRow): string[] {
  if (row.images && row.images.length) {
    return row.images.map((i) => imageUrl(i.url));
  }

  if (row.image) {
    return [imageUrl(row.image)];
  }

  return [FALLBACK_IMAGE];
}

function toProperty(row: ApiListingRow): Property {
  return {
    id: String(row.id),
    title: row.title,
    type: (row.category as PropertyType) || 'maison',
    status: row.transaction_type,
    price: Number(row.price),
    location: row.neighborhood || row.city,
    city: row.city,
    rooms: row.rooms ?? 0,
    bathrooms: row.bathrooms ?? 0,
    surface: row.surface_m2 ? Number(row.surface_m2) : 0,
    description: row.description || '',
    features: [],
    images: rowImages(row),
    seller: placeholderSeller(row.seller_name, row.seller_phone),
    listingStatus: mapModerationStatus(row.status),
    createdAt: row.created_at,
  };
}

function toVehicle(row: ApiListingRow): Vehicle {
  return {
    id: String(row.id),
    brand: row.brand || '',
    model: row.model || '',
    type: (row.category as VehicleType) || 'berline',
    status: row.transaction_type,
    price: Number(row.price),
    year: row.year || new Date().getFullYear(),
    mileage: row.mileage || 0,
    condition: (row.vehicle_condition as VehicleCondition) || 'occasion',
    color: '',
    fuel: row.fuel || '',
    transmission: row.transmission || '',
    description: row.description || '',
    images: rowImages(row),
    seller: placeholderSeller(row.seller_name, row.seller_phone),
    listingStatus: mapModerationStatus(row.status),
    createdAt: row.created_at,
    location: row.neighborhood || row.city,
  };
}

async function fetchApprovedPage(
  type: 'property' | 'vehicle',
  page: number
) {
  const data = await api<{
    data: ApiListingRow[];
    pagination: { pages: number };
  }>(`listings/index.php?type=${type}&page=${page}&limit=24`);

  return {
    rows: data.data || [],
    pages: data.pagination?.pages || 1,
  };
}

// Le backend limite à 24 résultats par page ; on agrège jusqu'à 5 pages (120 annonces)
// pour garder le filtrage/tri 100% côté client, comme le faisait l'ancien tableau statique.
async function fetchAllApproved(
  type: 'property' | 'vehicle',
  maxPages = 5
): Promise<ApiListingRow[]> {
  const first = await fetchApprovedPage(type, 1);
  let rows = first.rows;
  const pages = Math.min(first.pages, maxPages);

  for (let p = 2; p <= pages; p++) {
    const next = await fetchApprovedPage(type, p);
    rows = rows.concat(next.rows);
  }

  return rows;
}

export async function fetchApprovedProperties(): Promise<Property[]> {
  const rows = await fetchAllApproved('property');
  return rows.map(toProperty);
}

export async function fetchApprovedVehicles(): Promise<Vehicle[]> {
  const rows = await fetchAllApproved('vehicle');
  return rows.map(toVehicle);
}

export async function fetchPropertyById(
  id: string
): Promise<Property | null> {
  const numId = Number(id);

  if (!numId || numId < 1) return null;

  try {
    const data = await api<{ listing: ApiListingRow }>(
      `listings/show.php?id=${numId}`
    );

    return toProperty(data.listing);
  } catch {
    return null;
  }
}

export async function fetchVehicleById(
  id: string
): Promise<Vehicle | null> {
  const numId = Number(id);

  if (!numId || numId < 1) return null;

  try {
    const data = await api<{ listing: ApiListingRow }>(
      `listings/show.php?id=${numId}`
    );

    return toVehicle(data.listing);
  } catch {
    return null;
  }
}

export interface MyListing {
  id: string;
  type: 'property' | 'vehicle';
  title: string;
  price: number;
  status: 'vente' | 'location';
  city: string;
  listingStatus: ListingStatus;
  rejectionReason: string | null;
  createdAt: string;
  image: string;
  viewsCount: number;
  messageCount: number;
}

// Toutes les annonces du membre connecté, quel que soit leur statut de modération
// (en attente / approuvé / rejeté) — utilisé par le tableau de bord utilisateur.
export async function fetchMyListings(): Promise<MyListing[]> {
  const data = await api<{ data: ApiListingRow[] }>(
    'listings/mine.php'
  );

  return (data.data || []).map((row) => ({
    id: String(row.id),
    type: row.type,
    title: row.title,
    price: Number(row.price),
    status: row.transaction_type,
    city: row.city,
    listingStatus: mapModerationStatus(row.status),
    rejectionReason: row.rejection_reason || null,
    createdAt: row.created_at,
    image: imageUrl(row.image),
    viewsCount: Number((row as any).views_count || 0),
    messageCount: Number((row as any).message_count || 0),
  }));
}

// Envoie une vraie demande de contact (table contact_requests), avec jeton CSRF
// géré automatiquement par api(). Aucune donnée sensible n'est stockée côté frontend.
export async function sendContactMessage(
  listingId: string,
  payload: {
    name: string;
    phone: string;
    email?: string;
    message: string;
  }
): Promise<void> {
  const numId = Number(listingId);

  if (!numId) throw new Error('Annonce invalide.');

  await api('contact/create.php', {
    method: 'POST',
    body: JSON.stringify({
      listing_id: numId,
      name: payload.name,
      phone: payload.phone,
      email: payload.email || '',
      message: payload.message,
    }),
  });
}

export interface FavoriteListing extends ApiListingRow {
  image?: string | null;
}

export interface UserMessage {
  id: number;
  listing_id: number | null;
  sender_user_id: number | null;
  sender_name: string;
  visitor_name: string | null;
  visitor_phone: string | null;
  visitor_email: string | null;
  subject: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
  unread: boolean;
}

export async function updateListing(
  id: string,
  payload: Record<string, unknown>
): Promise<void> {
  const numId = Number(id);

  if (!Number.isInteger(numId) || numId < 1) {
    throw new Error('Annonce invalide.');
  }

  await api('listings/update.php', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      id: numId,
    }),
  });
}

export async function deleteListing(id: string): Promise<void> {
  const numId = Number(id);

  if (!Number.isInteger(numId) || numId < 1) {
    throw new Error('Annonce invalide.');
  }

  await api('listings/delete.php', {
    method: 'POST',
    body: JSON.stringify({
      id: numId,
    }),
  });
}

export async function toggleFavorite(
  listingId: string
): Promise<boolean> {
  const numId = Number(listingId);

  if (!Number.isInteger(numId) || numId < 1) {
    throw new Error('Annonce invalide.');
  }

  const data = await api<{ favorited: boolean }>(
    'favorites/toggle.php',
    {
      method: 'POST',
      body: JSON.stringify({
        listing_id: numId,
      }),
    }
  );

  return Boolean(data.favorited);
}

export async function getFavoriteStatus(
  listingId: string
): Promise<boolean> {
  const numId = Number(listingId);

  if (!Number.isInteger(numId) || numId < 1) return false;

  try {
    const data = await api<{ favorited: boolean }>(
      `favorites/status.php?listing_id=${numId}`
    );

    return Boolean(data.favorited);
  } catch {
    return false;
  }
}

export async function fetchFavorites(): Promise<FavoriteListing[]> {
  const data = await api<{ data: FavoriteListing[] }>(
    'favorites/index.php'
  );

  return data.data || [];
}

export async function fetchMessages(): Promise<{
  data: UserMessage[];
  unread_count: number;
}> {
  const data = await api<{
    data: UserMessage[];
    unread_count: number;
  }>('messages/index.php');

  return {
    data: data.data || [],
    unread_count: Number(data.unread_count || 0),
  };
}

export async function markMessageRead(id: number): Promise<void> {
  await api('messages/read.php', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export async function updateProfile(payload: {
  name: string;
  email: string;
  phone: string;
  city: string;
}): Promise<void> {
  await api('profile/update.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function changePassword(
  current_password: string,
  new_password: string
): Promise<void> {
  await api('profile/password.php', {
    method: 'POST',
    body: JSON.stringify({
      current_password,
      new_password,
    }),
  });
}

export interface Preferences {
  new_messages: number;
  new_listings: number;
  promotions: number;
  login_notifications: number;
}

export async function fetchPreferences(): Promise<Preferences> {
  const data = await api<{ preferences: Preferences }>(
    'profile/preferences.php'
  );

  return data.preferences;
}

export async function savePreferences(
  preferences: Preferences
): Promise<void> {
  await api('profile/preferences.php', {
    method: 'POST',
    body: JSON.stringify(preferences),
  });
}