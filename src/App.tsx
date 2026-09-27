import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PropertyListingPage from './pages/PropertyListingPage';
import VehicleListingPage from './pages/VehicleListingPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import UserDashboard from './pages/UserDashboard';
import SubmitListingPage from './pages/SubmitListingPage';
import EditListingPage from './pages/EditListingPage';
import AdminApp from './pages/admin/AdminApp';
import { api } from './lib/api';

const API_BASE = import.meta.env.VITE_API_BASE || '/backend/api';

type Page =
  | 'home'
  | 'properties'
  | 'vehicles'
  | 'property-detail'
  | 'vehicle-detail'
  | 'dashboard'
  | 'submit'
  | 'edit-listing'
  | 'about'
  | 'login'
  | 'register'
  | `admin-dashboard`
  | `admin-annonces`
  | `admin-validation`
  | `admin-utilisateurs`
  | string;

const FOOTER_PAGES = ['home', 'properties', 'vehicles', 'property-detail', 'vehicle-detail', 'submit', 'about'];

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!page.startsWith('admin')) {
      if (page === 'dashboard' || page === 'submit' || page === 'edit-listing') {
        setAuthChecked(false);
        fetch(`${API_BASE}/auth/me.php`, { credentials: 'include' })
          .then((r) => r.ok ? r.json() : Promise.reject(new Error('auth')))
          .then((data) => {
            setAuthenticated(Boolean(data?.authenticated));
            setAuthChecked(true);
            if (!data?.authenticated) setPage('login');
          })
          .catch(() => {
            setAuthenticated(false);
            setAuthChecked(true);
            setPage('login');
          });
      } else {
        setAuthChecked(true);
      }
      return;
    }
    fetch(`${API_BASE}/auth/me.php`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error('auth')))
      .then((data) => {
        const ok = Boolean(data?.authenticated && data?.user?.role === 'admin');
        setAuthenticated(ok);
        setAuthChecked(true);
        if (!ok) setPage('login');
      })
      .catch(() => {
        setAuthenticated(false);
        setAuthChecked(true);
        setPage('login');
      });
  }, [page]);

  const navigate = (newPage: Page, id?: string) => {
    setPage(newPage);
    if (id) setSelectedId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = page.startsWith('admin');
  const showFooter = FOOTER_PAGES.includes(page);

  if ((page === 'dashboard' || page === 'submit' || page === 'edit-listing') && !authChecked) {
    return <div className="min-h-screen flex items-center justify-center text-[#172033]">Vérification de votre session…</div>;
  }
  if (isAdmin) {
    if (!authChecked) return <div className="min-h-screen flex items-center justify-center text-[#172033]">Vérification des droits…</div>;
    if (!authenticated) return <LoginPage onNavigate={navigate} />;
    const adminPage = page.replace('admin-', '') as any;
    return <AdminApp onNavigate={navigate} initialPage={adminPage === 'admin' ? 'dashboard' : adminPage} />;
  }

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'properties':
        return <PropertyListingPage onNavigate={navigate} />;
      case 'vehicles':
        return <VehicleListingPage onNavigate={navigate} />;
      case 'property-detail':
        return <PropertyDetailPage propertyId={selectedId || 'p1'} onNavigate={navigate} />;
      case 'vehicle-detail':
        return <VehicleDetailPage vehicleId={selectedId || 'v1'} onNavigate={navigate} />;
      case 'dashboard':
        return <UserDashboard onNavigate={navigate} />;
      case 'submit':
        return <SubmitListingPage onNavigate={navigate} />;
      case 'edit-listing':
        return <EditListingPage listingId={selectedId || ''} onNavigate={navigate} />;
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'register':
        return <RegisterPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentPage={page} onNavigate={navigate} />
      <main className="flex-1">
        {renderPage()}
      </main>
      {showFooter && <Footer onNavigate={navigate} />}
    </div>
  );
}

function LoginPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api<{ user: { role: string } }>('auth/login.php', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      onNavigate(data.user?.role === 'admin' ? 'admin-dashboard' : 'dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-16 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#38BDF8] flex items-center justify-center mx-auto mb-3">
            <span className="font-bold text-[#0F2747]">IA</span>
          </div>
          <h1 className="text-2xl font-bold text-[#172033] mb-2">Connexion à IMMOB</h1>
          <p className="text-sm text-[#6B7280]">Accédez à votre compte pour publier et suivre vos annonces.</p>
        </div>
        {error && <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm p-3" role="alert">{error}</div>}
        <label className="block text-sm font-semibold mb-1">Téléphone ou email</label>
        <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]" placeholder="+229... ou votre@email.com" />
        <label className="block text-sm font-semibold mb-1">Mot de passe</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mb-6 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]" />
        <button disabled={loading} className="w-full bg-[#0F2747] text-white font-semibold rounded-xl py-3 disabled:opacity-60">{loading ? 'Connexion…' : 'Se connecter'}</button>
        <button type="button" onClick={() => onNavigate('register')} className="w-full mt-4 text-sm text-[#1D4ED8]">Créer un compte gratuitement</button>
        <button type="button" onClick={() => onNavigate('home')} className="w-full mt-2 text-sm text-[#6B7280]">Retour au site</button>
      </form>
    </div>
  );
}

function RegisterPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('auth/register.php', {
        method: 'POST',
        body: JSON.stringify({ name, email: email || undefined, phone, password }),
      });
      // L'inscription ouvre directement la session : aucune deuxième saisie nécessaire.
      onNavigate('dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Création impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-16 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#38BDF8] flex items-center justify-center mx-auto mb-3">
            <span className="font-bold text-[#0F2747]">IA</span>
          </div>
          <h1 className="text-2xl font-bold text-[#172033] mb-2">Créer votre compte IMMOB</h1>
          <p className="text-sm text-[#6B7280]">Quelques informations suffisent pour publier une annonce.</p>
        </div>
        {error && <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm p-3" role="alert">{error}</div>}
        <label className="block text-sm font-semibold mb-1">Nom complet</label>
        <input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="Votre nom complet" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]" />
        <label className="block text-sm font-semibold mb-1">Téléphone</label>
        <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" autoComplete="tel" placeholder="+229 97 00 00 00" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]" />
        <label className="block text-sm font-semibold mb-1">Email <span className="font-normal text-gray-400">(facultatif)</span></label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" placeholder="vous@example.com" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]" />
        <label className="block text-sm font-semibold mb-1">Mot de passe</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" minLength={10} autoComplete="new-password" placeholder="10 caractères minimum" required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mb-1 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]" />
        <p className="text-xs text-[#6B7280] mb-5">Votre mot de passe est protégé et n'est jamais enregistré en clair.</p>
        <button disabled={loading} className="w-full bg-[#0F2747] text-white font-semibold rounded-xl py-3 disabled:opacity-60">{loading ? 'Création…' : 'Créer mon compte'}</button>
        <button type="button" onClick={()=>onNavigate('login')} className="w-full mt-4 text-sm text-[#1D4ED8]">J’ai déjà un compte</button>
      </form>
    </div>
  );
}

function AboutPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <div className="bg-[#0F2747] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#38BDF8] text-sm font-semibold uppercase tracking-wider mb-2">À propos</p>
          <h1 className="text-4xl font-bold text-white mb-4">La plateforme de référence<br />au Bénin</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            IMMOB met en relation les personnes qui recherchent ou publient des annonces immobilières et automobiles au Bénin.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        {/* Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <p className="text-[#38BDF8] text-sm font-semibold uppercase tracking-wider mb-2">Notre mission</p>
            <h2 className="text-3xl font-bold text-[#172033] mb-4">Simplifier les transactions au Bénin</h2>
            <p className="text-[#6B7280] leading-relaxed mb-4">
              Nous croyons que trouver un bien immobilier ou un véhicule de qualité au Bénin devrait être simple, rapide et sécurisé. IMMOB a été créé pour éliminer les intermédiaires inutiles et rendre le marché plus transparent.
            </p>
            <p className="text-[#6B7280] leading-relaxed">
              La plateforme est conçue pour rendre la recherche, la publication et le suivi des annonces plus simples.
            </p>
          </div>
          <div className="bg-[#F5F7FA] rounded-2xl overflow-hidden h-72">
            <img src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=500&fit=crop" alt="Immobilier au Bénin" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {[
            { value: '24/7', label: 'Plateforme accessible', icon: '📋' },
            { value: '100%', label: 'Modération serveur', icon: '🛡️' },
            { value: '8', label: 'Photos max / annonce', icon: '📷' },
            { value: '2', label: 'Types de biens', icon: '🏠' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-[#0F2747] mb-1">{stat.value}</div>
              <div className="text-xs text-[#6B7280]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Platform highlights */}
        <div className="mb-16">
          <p className="text-[#38BDF8] text-sm font-semibold uppercase tracking-wider mb-2 text-center">La plateforme</p>
          <h2 className="text-3xl font-bold text-[#172033] mb-8 text-center">Un parcours simple pour publier et rechercher</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { title: 'Recherche', text: 'Filtrez les maisons et véhicules selon vos besoins.' },
              { title: 'Publication', text: 'Créez une annonce et ajoutez vos photos en quelques étapes.' },
              { title: 'Modération', text: 'Les nouvelles annonces passent par une validation côté serveur avant publication.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-[#172033] mb-2">{item.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#0F2747] rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Rejoignez notre communauté</h2>
          <p className="text-white/60 text-sm mb-6">IMMOB centralise les annonces de maisons et de véhicules dans un parcours simple.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => onNavigate('properties')} className="bg-[#38BDF8] text-[#0F2747] font-bold px-6 py-3 rounded-xl text-sm cursor-pointer hover:bg-[#7DD3FC] transition-colors">
              Parcourir les annonces
            </button>
            <button onClick={() => onNavigate('submit')} className="border border-white/30 text-white font-semibold px-6 py-3 rounded-xl text-sm cursor-pointer hover:bg-white/10 transition-colors">
              Publier une annonce
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
