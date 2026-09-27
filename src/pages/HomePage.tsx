import { useEffect, useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import VehicleCard from '../components/VehicleCard';
import type { Property, Vehicle } from '../data/listings';
import { fetchApprovedProperties, fetchApprovedVehicles } from '../lib/listings-api';

interface HomePageProps {
  onNavigate: (page: string, id?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [searchType, setSearchType] = useState('Tous');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchMode, setSearchMode] = useState('acheter');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);

  const handleSearch = () => {
    if (searchType === 'Véhicules') onNavigate('vehicles');
    else onNavigate('properties');
  };

  useEffect(() => {
    fetchApprovedProperties().then((rows) => setFeaturedProperties(rows.slice(0, 3))).catch(() => setFeaturedProperties([]));
    fetchApprovedVehicles().then((rows) => setFeaturedVehicles(rows.slice(0, 3))).catch(() => setFeaturedVehicles([]));
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0F2747]">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=900&fit=crop"
            alt="Villa de luxe"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F2747]/60 via-[#0F2747]/40 to-[#0F2747]/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <div className="max-w-3xl animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#38BDF8]/15 border border-[#38BDF8]/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
              <span className="text-[#38BDF8] text-sm font-medium">Plateforme n°1 au Bénin</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Trouvez la maison ou<br />
              <span className="text-[#38BDF8]">le véhicule</span> qui<br />
              vous correspond.
            </h1>
            <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
              Des milliers d'annonces immobilières et automobiles pour acheter, louer ou vendre au Bénin. Simple, rapide et sécurisé.
            </p>

            {/* Stats inline */}
            <div className="flex flex-wrap gap-6 mb-10">
              {[
                { value: '2 400+', label: 'Annonces actives' },
                { value: '1 800+', label: 'Acheteurs satisfaits' },
                { value: '12', label: 'Villes couvertes' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search module */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 max-w-4xl">
            {/* Tab switcher */}
            <div className="flex gap-1 mb-4 bg-[#F5F7FA] rounded-xl p-1 w-fit">
              {['acheter', 'louer'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSearchMode(mode)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all cursor-pointer ${
                    searchMode === mode
                      ? 'bg-[#0F2747] text-white shadow-sm'
                      : 'text-[#6B7280] hover:text-[#172033]'
                  }`}
                >
                  {mode === 'acheter' ? 'Acheter' : 'Louer'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
                  Type de bien
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent bg-white cursor-pointer"
                >
                  <option>Tous</option>
                  <option>Immobilier</option>
                  <option>Véhicules</option>
                  <option>Maisons / Villas</option>
                  <option>Appartements</option>
                  <option>Terrains</option>
                  <option>SUV / 4×4</option>
                  <option>Berlines</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
                  Localisation
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Cotonou, Porto-Novo..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#0F2747] font-bold py-2.5 px-6 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#172033] mb-3">Explorez par catégorie</h2>
            <p className="text-[#6B7280]">Choisissez votre domaine de recherche</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Immobilier */}
            <button
              onClick={() => onNavigate('properties')}
              className="relative group overflow-hidden rounded-2xl h-56 cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop"
                alt="Maisons et appartements"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2747]/85 via-[#0F2747]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-[#38BDF8] flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#0F2747]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-xl">Maisons</h3>
                </div>
                <p className="text-white/70 text-sm">Villas, appartements, terrains</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[#38BDF8] text-sm font-semibold">
                  Voir les annonces
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Véhicules */}
            <button
              onClick={() => onNavigate('vehicles')}
              className="relative group overflow-hidden rounded-2xl h-56 cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1773086326072-66d613b89927?w=800&h=600&fit=crop"
                alt="Véhicules"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2747]/85 via-[#0F2747]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-[#38BDF8] flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#0F2747]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-xl">Véhicules</h3>
                </div>
                <p className="text-white/70 text-sm">SUV, berlines, utilitaires, motos</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[#38BDF8] text-sm font-semibold">
                  Voir les annonces
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-16 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#38BDF8] text-sm font-semibold uppercase tracking-wider mb-1">Immobilier</p>
              <h2 className="text-3xl font-bold text-[#172033]">Biens en vedette</h2>
            </div>
            <button
              onClick={() => onNavigate('properties')}
              className="hidden sm:flex items-center gap-1.5 text-[#1D4ED8] text-sm font-semibold hover:text-[#0F2747] transition-colors cursor-pointer"
            >
              Voir tout
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <div key={property.id} className="stagger-item">
                <PropertyCard
                  property={property}
                  onClick={() => onNavigate('property-detail', property.id)}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 sm:hidden text-center">
            <button
              onClick={() => onNavigate('properties')}
              className="text-[#1D4ED8] text-sm font-semibold cursor-pointer"
            >
              Voir toutes les propriétés →
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#38BDF8] text-sm font-semibold uppercase tracking-wider mb-1">Automobile</p>
              <h2 className="text-3xl font-bold text-[#172033]">Véhicules en vedette</h2>
            </div>
            <button
              onClick={() => onNavigate('vehicles')}
              className="hidden sm:flex items-center gap-1.5 text-[#1D4ED8] text-sm font-semibold hover:text-[#0F2747] transition-colors cursor-pointer"
            >
              Voir tout
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="stagger-item">
                <VehicleCard
                  vehicle={vehicle}
                  onClick={() => onNavigate('vehicle-detail', vehicle.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-[#0F2747]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#38BDF8] text-sm font-semibold uppercase tracking-wider mb-2">Simple & rapide</p>
            <h2 className="text-3xl font-bold text-white mb-3">Comment ça marche ?</h2>
            <p className="text-white/60 max-w-md mx-auto">Trouver ou vendre votre bien en 3 étapes simples</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Recherchez',
                description: 'Parcourez des milliers d\'annonces immobilières et automobiles avec nos filtres avancés.',
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Contactez',
                description: 'Contactez directement le vendeur ou l\'agence par téléphone ou message depuis la plateforme.',
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Concluez',
                description: 'Visitez le bien ou le véhicule et finalisez votre transaction en toute sécurité et confiance.',
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative bg-[#163660] rounded-2xl p-7 border border-white/10"
              >
                <div className="absolute top-5 right-5 text-5xl font-black text-white/5">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] mb-5">
                  {item.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-[#38BDF8] rounded-3xl overflow-hidden">
            <div className="relative px-8 py-12 sm:px-12">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#0F2747]" />
                <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-[#0F2747]" />
              </div>
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2747] mb-2">
                    Vous avez un bien à vendre ou à louer ?
                  </h2>
                  <p className="text-[#0F2747]/70 text-sm sm:text-base">
                    Publiez votre annonce gratuitement et touchez des milliers d'acheteurs potentiels.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('submit')}
                  className="shrink-0 bg-[#0F2747] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#163660] transition-colors cursor-pointer text-sm whitespace-nowrap"
                >
                  Publier une annonce
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-12 bg-[#F5F7FA] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🔒', title: 'Annonces vérifiées', desc: 'Chaque annonce est modérée par notre équipe' },
              { icon: '⚡', title: 'Publication rapide', desc: 'Votre annonce en ligne en moins de 24h' },
              { icon: '📞', title: 'Support local', desc: 'Assistance en français, du lundi au samedi' },
              { icon: '🤝', title: 'Transactions sécurisées', desc: 'Des échanges encadrés en toute confiance' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center p-4">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-semibold text-[#172033] text-sm mb-1">{item.title}</h4>
                <p className="text-[#6B7280] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
