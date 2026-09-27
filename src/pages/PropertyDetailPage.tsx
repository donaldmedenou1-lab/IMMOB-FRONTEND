import { useEffect, useState } from 'react';
import type { Property } from '../data/listings';
import { formatPrice } from '../data/listings';
import { fetchApprovedProperties, fetchPropertyById, sendContactMessage, getFavoriteStatus, toggleFavorite } from '../lib/listings-api';

interface Props {
  propertyId: string;
  onNavigate: (page: string, id?: string) => void;
}

export default function PropertyDetailPage({ propertyId, onNavigate }: Props) {
  const [property, setProperty] = useState<Property | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setProperty(null);
    setNotFound(false);
    setActiveImg(0);
    fetchPropertyById(propertyId).then((p) => {
      if (!p) { setNotFound(true); return; }
      setProperty(p);
      getFavoriteStatus(p.id).then(setFavorited);
      setContactForm((f) => ({ ...f, message: `Bonjour, je suis intéressé(e) par votre annonce "${p.title}". Pouvez-vous me contacter ?` }));
    });
    fetchApprovedProperties()
      .then((rows) => setSimilar(rows.filter((p) => p.id !== propertyId).slice(0, 2)))
      .catch(() => setSimilar([]));
  }, [propertyId]);

  const submitContact = async () => {
    if (!property) return;
    setSendError('');
    if (!contactForm.name.trim() || !contactForm.phone.trim() || !contactForm.message.trim()) {
      setSendError('Merci de remplir votre nom, votre téléphone et un message.');
      return;
    }
    setSending(true);
    try {
      await sendContactMessage(property.id, contactForm);
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
          <h1 className="text-xl font-bold text-[#172033] mb-2">Annonce introuvable</h1>
          <p className="text-[#6B7280] text-sm mb-4">Cette annonce n'existe pas ou n'est plus disponible.</p>
          <button onClick={() => onNavigate('properties')} className="text-[#1D4ED8] text-sm font-semibold">Retour aux annonces</button>
        </div>
      </div>
    );
  }

  if (!property) {
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
            <button onClick={() => onNavigate('properties')} className="hover:text-[#1D4ED8] cursor-pointer">Maisons</button>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-[#172033] font-medium truncate max-w-xs">{property.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left - Main content */}
          <div className="flex-1 min-w-0">
            {/* Gallery */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden mb-4">
              <img
                src={property.images[activeImg]}
                alt={property.title}
                className="w-full h-80 sm:h-[440px] object-cover"
              />
            </div>
            {property.images.length > 1 && (
              <div className="flex gap-2 mb-6">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-1 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      activeImg === i ? 'border-[#38BDF8]' : 'border-transparent opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title & location */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${property.status === 'vente' ? 'bg-[#0F2747] text-white' : 'bg-[#38BDF8] text-[#0F2747]'}`}>
                  {property.status === 'vente' ? 'À vendre' : 'À louer'}
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-[#6B7280] capitalize">{property.type}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] mb-2">{property.title}</h1>
              <div className="flex items-center gap-1.5 text-[#6B7280] text-sm">
                <svg className="w-4 h-4 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{property.location}</span>
              </div>
            </div>

            {/* Specs */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
              <h2 className="font-bold text-[#172033] mb-4">Caractéristiques</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: '🏠', label: 'Pièces', value: `${property.rooms} pièces` },
                  { icon: '🛁', label: 'Salles de bain', value: `${property.bathrooms} SDB` },
                  { icon: '📐', label: 'Surface', value: `${property.surface} m²` },
                  { icon: '📅', label: 'Ajouté le', value: new Date(property.createdAt).toLocaleDateString('fr-FR') },
                ].map((spec) => (
                  <div key={spec.label} className="bg-[#F5F7FA] rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">{spec.icon}</div>
                    <div className="text-xs text-[#6B7280] mb-0.5">{spec.label}</div>
                    <div className="text-sm font-semibold text-[#172033]">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
              <h2 className="font-bold text-[#172033] mb-3">Description</h2>
              <p className="text-[#6B7280] text-sm leading-relaxed">{property.description}</p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
              <h2 className="font-bold text-[#172033] mb-4">Équipements & Services</h2>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature) => (
                  <span key={feature} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F7FA] rounded-lg text-sm text-[#172033]">
                    <svg className="w-3.5 h-3.5 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Sidebar */}
          <aside className="lg:w-80 shrink-0">
            {/* Price card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 sticky top-20">
              <div className="text-3xl font-bold text-[#38BDF8] mb-1">
                {formatPrice(property.price, property.status)}
              </div>
              {property.status === 'location' && (
                <p className="text-[#6B7280] text-xs mb-4">+ charges non incluses</p>
              )}

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setContactOpen(true)}
                  className="flex-1 bg-[#0F2747] hover:bg-[#163660] text-white font-semibold py-3 rounded-xl text-sm cursor-pointer transition-colors"
                >
                  Contacter le vendeur
                </button>
                <button
                  onClick={async () => { try { setFavorited(await toggleFavorite(property.id)); } catch { onNavigate('login'); } }}
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                    favorited ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className={`w-5 h-5 ${favorited ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <a href={`tel:${property.seller.phone}`} className="flex items-center justify-center gap-2 w-full border border-[#38BDF8] text-[#38BDF8] font-semibold py-2.5 rounded-xl text-sm hover:bg-[#38BDF8]/10 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {property.seller.phone}
              </a>

              {/* Seller info */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <img src={property.seller.avatar} alt={property.seller.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#172033] text-sm">{property.seller.name}</span>
                      {property.seller.verified && (
                        <svg className="w-4 h-4 text-[#1D4ED8]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280]">Membre depuis {property.seller.memberSince}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-4 text-xs text-[#6B7280]">
                  <span><span className="font-semibold text-[#172033]">{property.seller.listingsCount}</span> annonces</span>
                </div>
              </div>

              {/* Safety note */}
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-[#1D4ED8] font-medium">🔒 Conseil de sécurité</p>
                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">Ne versez jamais d'argent avant d'avoir visité le bien. IMMOB ne demande aucun paiement en avance.</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar listings */}
        {similar.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-[#172033] mb-5">Annonces similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onNavigate('property-detail', p.id)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <img src={p.images[0]} alt={p.title} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <div className="text-[#38BDF8] font-bold text-base mb-1">{formatPrice(p.price, p.status)}</div>
                    <h4 className="text-sm font-semibold text-[#172033] line-clamp-1">{p.title}</h4>
                    <p className="text-xs text-[#6B7280] mt-1">{p.location}</p>
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
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
