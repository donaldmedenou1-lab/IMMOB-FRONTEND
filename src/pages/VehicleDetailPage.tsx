import { useEffect, useState } from 'react';
import type { Vehicle } from '../data/listings';
import { formatPrice } from '../data/listings';
import { fetchApprovedVehicles, fetchVehicleById, sendContactMessage, getFavoriteStatus, toggleFavorite } from '../lib/listings-api';

interface Props {
  vehicleId: string;
  onNavigate: (page: string, id?: string) => void;
}

export default function VehicleDetailPage({ vehicleId, onNavigate }: Props) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [similar, setSimilar] = useState<Vehicle[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setVehicle(null);
    setNotFound(false);
    setActiveImg(0);
    fetchVehicleById(vehicleId).then((v) => {
      if (!v) { setNotFound(true); return; }
      setVehicle(v);
      getFavoriteStatus(v.id).then(setFavorited);
      setContactForm((f) => ({ ...f, message: `Bonjour, je suis intéressé(e) par votre ${v.brand} ${v.model} (${v.year}). Pouvez-vous me contacter ?` }));
    });
    fetchApprovedVehicles()
      .then((rows) => setSimilar(rows.filter((v) => v.id !== vehicleId).slice(0, 2)))
      .catch(() => setSimilar([]));
  }, [vehicleId]);

  const submitContact = async () => {
    if (!vehicle) return;
    setSendError('');
    if (!contactForm.name.trim() || !contactForm.phone.trim() || !contactForm.message.trim()) {
      setSendError('Merci de remplir votre nom, votre téléphone et un message.');
      return;
    }
    setSending(true);
    try {
      await sendContactMessage(vehicle.id, contactForm);
      setSent(true);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Impossible d\'envoyer votre message pour le moment.');
    } finally {
      setSending(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#172033] mb-2">Véhicule introuvable</h1>
          <p className="text-[#6B7280] text-sm mb-4">Cette annonce n'existe pas ou n'est plus disponible.</p>
          <button onClick={() => onNavigate('vehicles')} className="text-[#1D4ED8] text-sm font-semibold">Retour aux véhicules</button>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pt-16 flex items-center justify-center text-[#6B7280] text-sm">
        Chargement de l'annonce…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-xs text-[#6B7280]">
            <button onClick={() => onNavigate('home')} className="hover:text-[#1D4ED8] cursor-pointer">Accueil</button>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <button onClick={() => onNavigate('vehicles')} className="hover:text-[#1D4ED8] cursor-pointer">Véhicules</button>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-[#172033] font-medium truncate max-w-xs">{vehicle.brand} {vehicle.model}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left */}
          <div className="flex-1 min-w-0">
            {/* Gallery */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden mb-4">
              <img
                src={vehicle.images[activeImg]}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-80 sm:h-[440px] object-cover"
              />
            </div>
            {vehicle.images.length > 1 && (
              <div className="flex gap-2 mb-6">
                {vehicle.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-1 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${activeImg === i ? 'border-[#38BDF8]' : 'border-transparent opacity-60 hover:opacity-80'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${vehicle.status === 'vente' ? 'bg-[#0F2747] text-white' : 'bg-[#38BDF8] text-[#0F2747]'}`}>
                  {vehicle.status === 'vente' ? 'À vendre' : 'À louer'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${vehicle.condition === 'neuf' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-[#6B7280]'}`}>
                  {vehicle.condition}
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-[#6B7280] capitalize">{vehicle.type}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] mb-2">
                {vehicle.brand} {vehicle.model} — {vehicle.year}
              </h1>
              <div className="flex items-center gap-1.5 text-[#6B7280] text-sm">
                <svg className="w-4 h-4 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{vehicle.location}</span>
              </div>
            </div>

            {/* Specs grid */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
              <h2 className="font-bold text-[#172033] mb-4">Fiche technique</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Année', value: vehicle.year.toString() },
                  { label: 'Kilométrage', value: `${new Intl.NumberFormat('fr-FR').format(vehicle.mileage)} km` },
                  { label: 'Carburant', value: vehicle.fuel },
                  { label: 'Transmission', value: vehicle.transmission },
                  { label: 'Couleur', value: vehicle.color },
                  { label: 'Type', value: vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1) },
                ].map((spec) => (
                  <div key={spec.label} className="bg-[#F5F7FA] rounded-xl p-3">
                    <div className="text-xs text-[#6B7280] mb-0.5">{spec.label}</div>
                    <div className="text-sm font-semibold text-[#172033]">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
              <h2 className="font-bold text-[#172033] mb-3">Description du vendeur</h2>
              <p className="text-[#6B7280] text-sm leading-relaxed">{vehicle.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 sticky top-20">
              <div className="text-3xl font-bold text-[#38BDF8] mb-4">
                {formatPrice(vehicle.price, vehicle.status)}
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setContactOpen(true)}
                  className="flex-1 bg-[#0F2747] hover:bg-[#163660] text-white font-semibold py-3 rounded-xl text-sm cursor-pointer transition-colors"
                >
                  Contacter le vendeur
                </button>
                <button
                  onClick={async () => { try { setFavorited(await toggleFavorite(vehicle.id)); } catch { onNavigate('login'); } }}
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${favorited ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <svg className={`w-5 h-5 ${favorited ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <a href={`tel:${vehicle.seller.phone}`} className="flex items-center justify-center gap-2 w-full border border-[#38BDF8] text-[#38BDF8] font-semibold py-2.5 rounded-xl text-sm hover:bg-[#38BDF8]/10 transition-colors cursor-pointer mb-5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {vehicle.seller.phone}
              </a>

              {/* Seller */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <img src={vehicle.seller.avatar} alt={vehicle.seller.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#172033] text-sm">{vehicle.seller.name}</span>
                      {vehicle.seller.verified && (
                        <svg className="w-4 h-4 text-[#1D4ED8]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280]">Membre depuis {vehicle.seller.memberSince}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-[#6B7280]">
                  <span className="font-semibold text-[#172033]">{vehicle.seller.listingsCount}</span> annonces publiées
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-[#1D4ED8] font-medium">🔒 Conseil de sécurité</p>
                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">Inspectez toujours le véhicule avant tout paiement. Exigez le carnet d'entretien et les documents d'immatriculation.</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-[#172033] mb-5">Véhicules similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map((v) => (
                <div key={v.id} onClick={() => onNavigate('vehicle-detail', v.id)} className="bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                  <img src={v.images[0]} alt={`${v.brand} ${v.model}`} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <div className="text-[#38BDF8] font-bold text-base mb-1">{formatPrice(v.price, v.status)}</div>
                    <h4 className="text-sm font-semibold text-[#172033]">{v.brand} {v.model} — {v.year}</h4>
                    <p className="text-xs text-[#6B7280] mt-1">{v.location} · {new Intl.NumberFormat('fr-FR').format(v.mileage)} km</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setContactOpen(false); setSent(false); setSendError(''); }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#172033] text-lg">Contacter le vendeur</h3>
              <button onClick={() => { setContactOpen(false); setSent(false); setSendError(''); }} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {sent ? (
              <div className="text-center py-6">
                <p className="text-[#172033] font-semibold mb-1">Message envoyé ✅</p>
                <p className="text-[#6B7280] text-sm">Le vendeur recevra votre demande et pourra vous rappeler.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sendError && <div className="rounded-xl bg-red-50 text-red-700 text-sm p-3">{sendError}</div>}
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Votre nom</label>
                  <input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} placeholder="Votre nom complet" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Votre téléphone</label>
                  <input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="+229 9X XX XX XX" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Message</label>
                  <textarea value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] resize-none" />
                </div>
                <button
                  onClick={submitContact}
                  disabled={sending}
                  className="w-full bg-[#0F2747] text-white font-semibold py-3 rounded-xl text-sm hover:bg-[#163660] transition-colors cursor-pointer disabled:opacity-60"
                >
                  {sending ? 'Envoi…' : 'Envoyer le message'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
