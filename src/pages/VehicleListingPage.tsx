import { useEffect, useState } from 'react';
import VehicleCard from '../components/VehicleCard';
import type { Vehicle } from '../data/listings';
import { fetchApprovedVehicles } from '../lib/listings-api';

interface Props {
  onNavigate: (page: string, id?: string) => void;
}

const brands = ['Toutes marques', 'Toyota', 'Mercedes-Benz', 'Hyundai', 'Honda', 'Cadillac'];
const vehicleTypes = ['Tous', 'suv', 'berline', 'pickup', 'utilitaire', 'moto'];
const conditions = ['Toutes', 'neuf', 'très bon état', 'occasion'];

export default function VehicleListingPage({ onNavigate }: Props) {
  const [mode, setMode] = useState<'tous' | 'vente' | 'location'>('tous');
  const [brand, setBrand] = useState('Toutes marques');
  const [vType, setVType] = useState('Tous');
  const [condition, setCondition] = useState('Toutes');
  const [minYear, setMinYear] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [approved, setApproved] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchApprovedVehicles()
      .then(setApproved)
      .catch(() => setError('Impossible de charger les véhicules pour le moment.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = approved.filter((v) => {
    if (mode !== 'tous' && v.status !== mode) return false;
    if (brand !== 'Toutes marques' && v.brand !== brand) return false;
    if (vType !== 'Tous' && v.type !== vType) return false;
    if (condition !== 'Toutes' && v.condition !== condition) return false;
    if (minYear && v.year < parseInt(minYear)) return false;
    if (maxPrice && v.price > parseInt(maxPrice)) return false;
    if (searchText && !`${v.brand} ${v.model}`.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'year-desc') return b.year - a.year;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-16">
      {/* Header */}
      <div className="bg-[#0F2747] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#38BDF8] text-sm font-semibold uppercase tracking-wider mb-1">Automobile</p>
          <h1 className="text-3xl font-bold text-white mb-5">Véhicules disponibles</h1>
          <div className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Marque, modèle..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-white rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
              />
            </div>
            <button className="bg-[#38BDF8] text-[#0F2747] font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#7DD3FC] transition-colors cursor-pointer">
              Rechercher
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <h3 className="font-bold text-[#172033] mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtres
              </h3>

              {/* Mode */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Transaction</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {[{ value: 'tous', label: 'Tous' }, { value: 'vente', label: 'Vente' }, { value: 'location', label: 'Location' }].map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value as any)}
                      className={`flex-1 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        mode === m.value ? 'bg-[#0F2747] text-white' : 'text-[#6B7280] hover:bg-gray-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Marque</label>
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] cursor-pointer">
                  {brands.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>

              {/* Vehicle type */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Type</label>
                <div className="space-y-1.5">
                  {vehicleTypes.map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="vtype" checked={vType === t} onChange={() => setVType(t)} className="accent-[#0F2747]" />
                      <span className={`text-sm capitalize ${vType === t ? 'text-[#0F2747] font-medium' : 'text-[#6B7280] group-hover:text-[#172033]'}`}>
                        {t === 'Tous' ? 'Tous les types' : t}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">État</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] cursor-pointer">
                  {conditions.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Year */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Année minimum</label>
                <select value={minYear} onChange={(e) => setMinYear(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] cursor-pointer">
                  <option value="">Toutes</option>
                  {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Max price */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Prix max (FCFA)</label>
                <input
                  type="number"
                  placeholder="Prix maximum"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>

              <button
                onClick={() => { setMode('tous'); setBrand('Toutes marques'); setVType('Tous'); setCondition('Toutes'); setMinYear(''); setMaxPrice(''); setSearchText(''); }}
                className="w-full py-2 text-sm text-[#6B7280] hover:text-[#172033] border border-gray-200 rounded-lg cursor-pointer transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#6B7280] text-sm">
                <span className="font-semibold text-[#172033]">{sorted.length}</span> véhicule{sorted.length !== 1 ? 's' : ''} trouvé{sorted.length !== 1 ? 's' : ''}
              </p>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#172033] focus:outline-none cursor-pointer">
                <option value="recent">Plus récents</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="year-desc">Année (récent)</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-20 text-[#6B7280] text-sm">Chargement des véhicules…</div>
            ) : error ? (
              <div className="text-center py-20 text-red-600 text-sm">{error}</div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🚗</div>
                <h3 className="font-semibold text-[#172033] mb-1">Aucun véhicule trouvé</h3>
                <p className="text-[#6B7280] text-sm">Essayez de modifier vos filtres</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sorted.map((vehicle) => (
                  <div key={vehicle.id} className="stagger-item">
                    <VehicleCard
                      vehicle={vehicle}
                      onClick={() => onNavigate('vehicle-detail', vehicle.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
