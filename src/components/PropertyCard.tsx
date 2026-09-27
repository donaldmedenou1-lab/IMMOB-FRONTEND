import { useEffect, useState } from 'react';
import type { Property } from '../data/listings';
import { formatPrice } from '../data/listings';
import { toggleFavorite, getFavoriteStatus } from '../lib/listings-api';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export default function PropertyCard({ property, onClick }: PropertyCardProps) {
  const [favorited, setFavorited] = useState(false);
  useEffect(() => { getFavoriteStatus(property.id).then(setFavorited); }, [property.id]);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group card-lift"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
            property.status === 'vente'
              ? 'bg-[#0F2747] text-white'
              : 'bg-[#38BDF8] text-[#0F2747]'
          }`}>
            {property.status === 'vente' ? 'Vente' : 'Location'}
          </span>
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-[#172033] capitalize">
            {property.type}
          </span>
        </div>
        <button
          onClick={async (e) => { e.stopPropagation(); try { setFavorited(await toggleFavorite(property.id)); } catch { /* visiteur non connecté : l'action reste sans effet */ } }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm cursor-pointer hover:bg-white transition-colors"
        >
          <svg className={`w-4 h-4 ${favorited ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-[#38BDF8] font-bold text-lg mb-1">
          {formatPrice(property.price, property.status)}
        </div>
        <h3 className="font-semibold text-[#172033] text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[#1D4ED8] transition-colors">
          {property.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-3">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="truncate">{property.location}</span>
        </div>
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-[#6B7280] text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>{property.rooms} pièces</span>
          </div>
          <div className="flex items-center gap-1 text-[#6B7280] text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>{property.surface} m²</span>
          </div>
          <div className="flex items-center gap-1 text-[#6B7280] text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{property.bathrooms} SDB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
