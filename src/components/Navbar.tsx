import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Page = string;

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE || '/backend/api'}/auth/me.php`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.authenticated ? data.user : null))
      .catch(() => setUser(null));
  }, [currentPage]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = currentPage.startsWith('admin');
  if (isAdmin) return null;

  const navLinks = [
    { label: 'Accueil', page: 'home' },
    { label: 'Maisons', page: 'properties' },
    { label: 'Véhicules', page: 'vehicles' },
    { label: 'À propos', page: 'about' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-fluid ${
        scrolled ? 'bg-[#0F2747]/95 backdrop-blur-md shadow-lg' : 'bg-[#0F2747] shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#38BDF8]">
              <span className="text-[#0F2747] font-bold text-sm leading-none">IA</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-base tracking-tight">IMMOB</span>
              <span className="text-[#38BDF8] text-[10px] font-medium tracking-widest uppercase">Bénin</span>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentPage === link.page
                    ? 'text-[#38BDF8] bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onNavigate('submit')}
              className="px-4 py-2 text-sm font-semibold text-[#0F2747] bg-[#38BDF8] rounded-lg hover:bg-[#7DD3FC] transition-colors cursor-pointer"
            >
              + Publier
            </button>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white border border-white/20 rounded-lg hover:border-white/40 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#38BDF8] flex items-center justify-center">
                  <span className="text-[#0F2747] text-xs font-bold">{user?.name?.charAt(0).toUpperCase() || 'C'}</span>
                </div>
                {user ? (user.name || 'Mon compte') : 'Mon compte'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-fade-in-up">
                  <button onClick={() => { onNavigate('dashboard'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-[#172033] hover:bg-[#F5F7FA] cursor-pointer">Tableau de bord</button>
                  <button onClick={() => { onNavigate('dashboard'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-[#172033] hover:bg-[#F5F7FA] cursor-pointer">Mes annonces</button>
                  <button onClick={() => { onNavigate('dashboard'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-[#172033] hover:bg-[#F5F7FA] cursor-pointer">Favoris</button>
                  <button onClick={() => { onNavigate('dashboard'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-[#172033] hover:bg-[#F5F7FA] cursor-pointer">Messages</button>
                  <div className="border-t border-gray-100 my-1" />
                  {!user && <button onClick={() => { onNavigate('login'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-[#1D4ED8] hover:bg-[#F5F7FA] cursor-pointer font-medium">Connexion sécurisée</button>}
                  {!user && <button onClick={() => { onNavigate('register'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-[#172033] hover:bg-[#F5F7FA] cursor-pointer">Créer un compte</button>}
                  {user && <button onClick={async () => { try { await api('auth/logout.php', { method: 'POST' }); setUser(null); setDropdownOpen(false); onNavigate('home'); } catch { setDropdownOpen(false); } }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-[#F5F7FA] cursor-pointer">Déconnexion</button>}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-white cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 py-3 pb-4 animate-slide-down">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => { onNavigate(link.page); setMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer text-sm font-medium"
              >
                {link.label}
              </button>
            ))}
            <div className="mt-3 flex flex-col gap-2 px-2">
              <button
                onClick={() => { onNavigate('submit'); setMenuOpen(false); }}
                className="w-full py-2.5 text-sm font-semibold text-[#0F2747] bg-[#38BDF8] rounded-lg cursor-pointer"
              >
                + Publier une annonce
              </button>
              <button
                onClick={() => { onNavigate(user ? 'dashboard' : 'login'); setMenuOpen(false); }}
                className="w-full py-2.5 text-sm font-medium text-white border border-white/30 rounded-lg cursor-pointer"
              >
                {user ? 'Mon compte' : 'Connexion / Inscription'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
