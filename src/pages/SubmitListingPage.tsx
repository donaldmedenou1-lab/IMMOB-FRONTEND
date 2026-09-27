import { useState } from 'react';
import { api } from '../lib/api';

interface Props {
  onNavigate: (page: string) => void;
}

type Step = 1 | 2 | 3;

export default function SubmitListingPage({ onNavigate }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<'immobilier' | 'vehicule' | ''>('');
  const [form, setForm] = useState({
    type: '',
    title: '',
    description: '',
    price: '',
    transactionType: 'vente',
    location: '',
    city: '',
    phone: '',
    email: '',
    // property fields
    rooms: '',
    surface: '',
    // vehicle fields
    brand: '',
    model: '',
    year: '',
    mileage: '',
    condition: '',
    fuel: '',
    transmission: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const result = await api<{ id: number }>('listings/create.php', {
        method: 'POST',
        body: JSON.stringify({
          type: category === 'immobilier' ? 'property' : 'vehicle',
          category: form.type,
          title: form.title,
          description: form.description,
          price: Number(form.price),
          transaction_type: form.transactionType,
          city: form.city,
          neighborhood: form.location,
          phone: form.phone,
          email: form.email,
          rooms: form.rooms ? Number(form.rooms) : null,
          surface: form.surface ? Number(form.surface) : null,
          brand: form.brand || null,
          model: form.model || null,
          year: form.year ? Number(form.year) : null,
          mileage: form.mileage ? Number(form.mileage) : null,
          condition: form.condition || null,
          fuel: form.fuel || null,
          transmission: form.transmission || null,
        }),
      });
      for (const photo of photos.slice(0, 8)) {
        const body = new FormData();
        body.append('listing_id', String(result.id));
        body.append('image', photo);
        await api('listings/upload.php', { method: 'POST', body });
      }
      setSubmitted(true);
      setStep(1);
      setPhotos([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de publier cette annonce.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pt-16 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#172033] mb-2">Annonce soumise !</h2>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
            Votre annonce a été envoyée avec succès et est en cours de modération. Elle sera publiée dans les 24 heures après validation par notre équipe.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full bg-[#0F2747] text-white font-semibold py-3 rounded-xl text-sm cursor-pointer hover:bg-[#163660] transition-colors"
            >
              Voir mes annonces
            </button>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setCategory(''); }}
              className="w-full border border-gray-200 text-[#6B7280] font-medium py-3 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Publier une autre annonce
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-16">
      {/* Header */}
      <div className="bg-[#0F2747] py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#38BDF8] text-sm font-semibold uppercase tracking-wider mb-1">Déposez votre annonce</p>
          <h1 className="text-3xl font-bold text-white mb-1">Publier une annonce</h1>
          <p className="text-white/60 text-sm">Gratuit, rapide et en ligne en quelques minutes</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                step > s ? 'bg-green-500 text-white' : step === s ? 'bg-[#0F2747] text-white' : 'bg-gray-200 text-[#6B7280]'
              }`}>
                {step > s ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                ) : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-[#6B7280] -mt-5 mb-7 px-0">
          <span className={step >= 1 ? 'text-[#172033] font-medium' : ''}>Catégorie</span>
          <span className={step >= 2 ? 'text-[#172033] font-medium' : ''}>Informations</span>
          <span className={step >= 3 ? 'text-[#172033] font-medium' : ''}>Contact & Photos</span>
        </div>

        {/* Step 1: Category */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-[#172033] mb-5">Que souhaitez-vous publier ?</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { value: 'immobilier', label: 'Immobilier', desc: 'Villa, appartement, terrain', icon: '🏠' },
                { value: 'vehicule', label: 'Véhicule', desc: 'Voiture, moto, camion', icon: '🚗' },
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value as any)}
                  className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                    category === cat.value
                      ? 'border-[#0F2747] bg-[#0F2747]/5'
                      : 'border-gray-200 hover:border-[#38BDF8]/50'
                  }`}
                >
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <div className="font-bold text-[#172033] mb-1">{cat.label}</div>
                  <div className="text-xs text-[#6B7280]">{cat.desc}</div>
                </button>
              ))}
            </div>

            {category && (
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                  {category === 'immobilier' ? 'Type de bien' : 'Type de véhicule'}
                </label>
                <select value={form.type} onChange={(e) => update('type', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] cursor-pointer">
                  <option value="">Choisir...</option>
                  {category === 'immobilier'
                    ? ['Villa', 'Appartement', 'Maison', 'Terrain'].map((t) => <option key={t}>{t}</option>)
                    : ['Berline', 'SUV / 4×4', 'Pickup', 'Utilitaire', 'Moto'].map((t) => <option key={t}>{t}</option>)
                  }
                </select>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Transaction</label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                {[{ value: 'vente', label: 'Vendre' }, { value: 'location', label: 'Louer / Mettre en location' }].map((m) => (
                  <button key={m.value} onClick={() => update('transactionType', m.value)} className={`flex-1 py-2.5 text-sm font-medium cursor-pointer transition-colors ${form.transactionType === m.value ? 'bg-[#0F2747] text-white' : 'text-[#6B7280] hover:bg-gray-50'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!category || !form.type}
              onClick={() => setStep(2)}
              className="w-full bg-[#38BDF8] disabled:opacity-60 disabled:bg-gray-200 disabled:text-gray-400 text-[#0F2747] font-bold py-3 rounded-xl text-sm cursor-pointer hover:bg-[#7DD3FC] disabled:cursor-not-allowed transition-colors"
            >
              Continuer →
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-[#172033] mb-5">Détails de l'annonce</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Titre de l'annonce *</label>
                <input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder={category === 'vehicule' ? 'Ex: Toyota Land Cruiser 2021 — Excellent état' : 'Ex: Villa moderne 4 chambres à Cadjehoun'} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Description *</label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Décrivez votre bien en détail : état, caractéristiques, avantages..." rows={5} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Prix (FCFA) *</label>
                  <input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="Ex: 45000000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Ville *</label>
                  <select value={form.city} onChange={(e) => update('city', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] cursor-pointer">
                    <option value="">Sélectionner...</option>
                    {['Cotonou', 'Porto-Novo', 'Abomey-Calavi', 'Parakou', 'Djougou', 'Bohicon', 'Lokossa', 'Sèmè-Kpodji'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Quartier / Adresse</label>
                <input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Ex: Cadjehoun, près de l'aéroport" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
              </div>

              {/* Conditional fields */}
              {category === 'immobilier' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Nombre de pièces</label>
                    <input type="number" value={form.rooms} onChange={(e) => update('rooms', e.target.value)} placeholder="Ex: 4" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Surface (m²)</label>
                    <input type="number" value={form.surface} onChange={(e) => update('surface', e.target.value)} placeholder="Ex: 250" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                  </div>
                </div>
              )}

              {category === 'vehicule' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Marque</label>
                      <input value={form.brand} onChange={(e) => update('brand', e.target.value)} placeholder="Ex: Toyota" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Modèle</label>
                      <input value={form.model} onChange={(e) => update('model', e.target.value)} placeholder="Ex: Land Cruiser" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Année</label>
                      <input type="number" value={form.year} onChange={(e) => update('year', e.target.value)} placeholder="2021" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Kilométrage</label>
                      <input type="number" value={form.mileage} onChange={(e) => update('mileage', e.target.value)} placeholder="38000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Carburant</label>
                      <select value={form.fuel} onChange={(e) => update('fuel', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] cursor-pointer">
                        <option value="">Choisir</option>
                        <option>Essence</option>
                        <option>Diesel</option>
                        <option>Hybride</option>
                        <option>Électrique</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">État</label>
                    <select value={form.condition} onChange={(e) => update('condition', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] cursor-pointer">
                      <option value="">Sélectionner...</option>
                      <option>Neuf</option>
                      <option>Très bon état</option>
                      <option>Occasion</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-[#6B7280] font-medium py-3 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition-colors">
                ← Retour
              </button>
              <button
                disabled={!form.title || !form.price || !form.city}
                onClick={() => setStep(3)}
                className="flex-2 bg-[#38BDF8] disabled:bg-gray-200 disabled:text-gray-400 text-[#0F2747] font-bold py-3 px-8 rounded-xl text-sm cursor-pointer hover:bg-[#7DD3FC] disabled:cursor-not-allowed transition-colors"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact & photos */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-[#172033] mb-5">Contact & Photos</h2>
            <div className="space-y-5">
              {/* Photo upload */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Photos de l'annonce</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-[#38BDF8]/50 cursor-pointer transition-colors">
                  <div className="text-4xl mb-3">📷</div>
                  <p className="text-sm font-medium text-[#172033] mb-1">Glissez vos photos ici</p>
                  <p className="text-xs text-[#6B7280] mb-3">JPG, PNG ou WebP — 5 Mo max par photo — jusqu'à 8 photos</p>
                  <label className="inline-block px-4 py-2 bg-[#F5F7FA] border border-gray-200 rounded-xl text-sm text-[#172033] font-medium cursor-pointer hover:bg-gray-100 transition-colors">
                    Parcourir les fichiers
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only"
                      onChange={(e) => {
                        const selected = Array.from(e.target.files || []).filter(f => f.size <= 5 * 1024 * 1024).slice(0, 8);
                        setPhotos(selected);
                        e.currentTarget.value = '';
                      }} />
                  </label>
                  {photos.length > 0 && (
                    <p className="text-xs text-[#172033] mt-3">{photos.length} photo(s) sélectionnée(s).</p>
                  )}
                </div>
                <p className="text-xs text-[#6B7280] mt-2">💡 Conseil : Des photos claires et bien éclairées augmentent x3 les chances de contact.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Téléphone de contact *</label>
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+229 9X XX XX XX" type="tel" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Email de contact</label>
                <input value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="votre@email.com" type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]" />
              </div>

              {/* Summary */}
              <div className="bg-[#F5F7FA] rounded-xl p-4">
                <h3 className="font-semibold text-[#172033] text-sm mb-3">Récapitulatif</h3>
                <div className="space-y-1.5 text-xs text-[#6B7280]">
                  <div className="flex justify-between"><span>Catégorie :</span><span className="font-medium text-[#172033] capitalize">{category}</span></div>
                  <div className="flex justify-between"><span>Type :</span><span className="font-medium text-[#172033]">{form.type}</span></div>
                  <div className="flex justify-between"><span>Transaction :</span><span className="font-medium text-[#172033] capitalize">{form.transactionType}</span></div>
                  <div className="flex justify-between"><span>Prix :</span><span className="font-medium text-[#38BDF8]">{form.price ? new Intl.NumberFormat('fr-FR').format(parseInt(form.price)) : '—'} FCFA</span></div>
                  <div className="flex justify-between"><span>Ville :</span><span className="font-medium text-[#172033]">{form.city || '—'}</span></div>
                </div>
              </div>

              <p className="text-xs text-[#6B7280]">
                En publiant cette annonce, vous acceptez nos <a href="#" className="text-[#1D4ED8] underline">conditions d'utilisation</a> et notre <a href="#" className="text-[#1D4ED8] underline">politique de confidentialité</a>.
              </p>
            </div>

            {error && <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm p-3">{error}</div>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-[#6B7280] font-medium py-3 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition-colors">
                ← Retour
              </button>
              <button
                disabled={!form.phone || submitting}
                onClick={handleSubmit}
                className="flex-2 bg-[#0F2747] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 px-8 rounded-xl text-sm cursor-pointer hover:bg-[#163660] disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Publication sécurisée…' : "Publier l'annonce"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
