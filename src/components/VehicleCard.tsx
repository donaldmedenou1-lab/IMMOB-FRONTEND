import { useEffect, useState } from 'react';
import type { Vehicle } from '../data/listings';
import { formatPrice } from '../data/listings';
import { toggleFavorite, getFavoriteStatus } from '../lib/listings-api';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
}

export default function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const [favorited, setFavorited] = useState(false);
  useEffect(() => { getFavoriteStatus(vehicle.id).then(setFavorited); }, [vehicle.id]);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group card-lift"
    >
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={vehicle.images[0]}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
            vehicle.status === 'vente'
              ? 'bg-[#0F2747] text-white'
              : 'bg-[#38BDF8] text-[#0F2747]'
          }`}>
            {vehicle.status === 'vente' ? 'Vente' : 'Location'}
          </span>
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-[#172033]">
            {vehicle.year}
          </span>
        </div>
        <button
          onClick={async (e) => { e.stopPropagation(); try { setFavorited(await toggleFavorite(vehicle.id)); } catch { /* visiteur non connecté */ } }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm cursor-pointer hover:bg-white transition-colors"
        >
          <svg className={`w-4 h-4 ${favorited ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <div className="absolute bottom-3 right-3">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            vehicle.condition === 'neuf' ? 'bg-green-500 text-white' : 'bg-gray-700 text-white'
          }`}>
            {vehicle.condition}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="text-[#38BDF8] font-bold text-lg mb-1">
          {formatPrice(vehicle.price, vehicle.status)}
        </div>
        <h3 className="font-semibold text-[#172033] text-sm leading-snug mb-2 group-hover:text-[#1D4ED8] transition-colors">
          {vehicle.brand} {vehicle.model}
        </h3>
        <div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-3">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span>{vehicle.location}</span>
        </div>
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-[#6B7280] text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{vehicle.fuel}</span>
          </div>
          <div className="flex items-center gap-1 text-[#6B7280] text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{new Intl.NumberFormat('fr-FR').format(vehicle.mileage)} km</span>
          </div>
          <div className="flex items-center gap-1 text-[#6B7280] text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{vehicle.transmission}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
