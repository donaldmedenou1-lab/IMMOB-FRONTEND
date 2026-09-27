import { useEffect, useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import type { Property } from '../data/listings';
import { fetchApprovedProperties } from '../lib/listings-api';

interface Props {
  onNavigate: (page: string, id?: string) => void;
}

const cities = ['Toutes les villes', 'Cotonou', 'Porto-Novo', 'Abomey-Calavi', 'Parakou', 'Sèmè-Kpodji'];
const types = ['Tous', 'villa', 'appartement', 'maison', 'terrain'];

export default function PropertyListingPage({ onNavigate }: Props) {
  const [mode, setMode] = useState<'tous' | 'vente' | 'location'>('tous');
  const [city, setCity] = useState('Toutes les villes');
  const [type, setType] = useState('Tous');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRooms, setMinRooms] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [approved, setApproved] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchApprovedProperties()
      .then(setApproved)
      .catch(() => setError('Impossible de charger les annonces pour le moment.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = approved.filter((p) => {
    if (mode !== 'tous' && p.status !== mode) return false;
    if (city !== 'Toutes les villes' && p.city !== city) return false;
    if (type !== 'Tous' && p.type !== type) return false;
    if (minPrice && p.price < parseInt(minPrice)) return false;
    if (maxPrice && p.price > parseInt(maxPrice)) return false;
    if (minRooms && p.rooms < parseInt(minRooms)) return false;
    if (searchText && !p.title.toLowerCase().includes(searchText.toLowerCase()) && !p.location.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-16">
      {/* Header bar */}
      <div className="bg-[#0F2747] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#38BDF8] text-sm font-semibold uppercase tracking-wider mb-1">Immobilier</p>
          <h1 className="text-3xl font-bold text-white mb-5">Maisons & Appartements</h1>

          {/* Search bar */}
          <div className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par titre ou quartier..."
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
          {/* Filters sidebar */}
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
                        mode === m.value
                          ? 'bg-[#0F2747] text-white'
                          : 'text-[#6B7280] hover:bg-gray-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Ville</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] cursor-pointer"
                >
                  {cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Type */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Type de bien</label>
                <div className="space-y-1.5">
                  {types.map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="type"
                        checked={type === t}
                        onChange={() => setType(t)}
                        className="accent-[#0F2747]"
                      />
                      <span className={`text-sm capitalize ${type === t ? 'text-[#0F2747] font-medium' : 'text-[#6B7280] group-hover:text-[#172033]'}`}>
                        {t === 'Tous' ? 'Tous les types' : t}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Prix (FCFA)</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Prix min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                  <input
                    type="number"
                    placeholder="Prix max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                </div>
              </div>

              {/* Rooms */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Chambres min.</label>
                <select
                  value={minRooms}
                  onChange={(e) => setMinRooms(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] cursor-pointer"
                >
                  <option value="">Toutes</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              <button
                onClick={() => { setMode('tous'); setCity('Toutes les villes'); setType('Tous'); setMinPrice(''); setMaxPrice(''); setMinRooms(''); setSearchText(''); }}
                className="w-full py-2 text-sm text-[#6B7280] hover:text-[#172033] border border-gray-200 rounded-lg cursor-pointer transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#6B7280] text-sm">
                <span className="font-semibold text-[#172033]">{sorted.length}</span> annonce{sorted.length !== 1 ? 's' : ''} trouvée{sorted.length !== 1 ? 's' : ''}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#172033] focus:outline-none cursor-pointer"
              >
                <option value="recent">Plus récentes</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-20 text-[#6B7280] text-sm">Chargement des annonces…</div>
            ) : error ? (
              <div className="text-center py-20 text-red-600 text-sm">{error}</div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-semibold text-[#172033] mb-1">Aucun résultat trouvé</h3>
                <p className="text-[#6B7280] text-sm">Essayez de modifier vos filtres</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sorted.map((property) => (
                  <div key={property.id} className="stagger-item">
                    <PropertyCard
                      property={property}
                      onClick={() => onNavigate('property-detail', property.id)}
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
