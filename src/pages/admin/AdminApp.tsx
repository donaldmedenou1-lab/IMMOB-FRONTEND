import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import AdminDashboard from './AdminDashboard';
import AdminListings from './AdminListings';
import AdminValidation from './AdminValidation';
import AdminUsers from './AdminUsers';

type AdminPage = 'dashboard' | 'annonces' | 'validation' | 'utilisateurs' | 'messages' | 'statistiques' | 'parametres';

interface Props {
  onNavigate: (page: string) => void;
  initialPage?: AdminPage;
}

const navItems: { id: AdminPage; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { id: 'annonces', label: 'Annonces', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { id: 'validation', label: 'Validation', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { id: 'utilisateurs', label: 'Utilisateurs', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { id: 'messages', label: 'Messages', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
  { id: 'statistiques', label: 'Statistiques', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
  { id: 'parametres', label: 'Paramètres', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317a1.5 1.5 0 013.35 0 1.724 1.724 0 002.573 1.066 1.5 1.5 0 012.37 2.37 1.724 1.724 0 001.065 2.572 1.5 1.5 0 010 3.35 1.724 1.724 0 00-1.066 2.573 1.5 1.5 0 01-2.37 2.37 1.724 1.724 0 00-2.572 1.065 1.5 1.5 0 01-3.35 0 1.724 1.724 0 00-2.573-1.066 1.5 1.5 0 01-2.37-2.37 1.724 1.724 0 00-1.065-2.572 1.5 1.5 0 010-3.35A1.724 1.724 0 004.382 7.753a1.5 1.5 0 012.37-2.37 1.724 1.724 0 002.573-1.066z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

interface AdminStatsData {
  users: number;
  listings: number;
  pending: number;
  approved: number;
  contacts: number;
}

export default function AdminApp({ onNavigate, initialPage = 'dashboard' }: Props) {
  const [page, setPage] = useState<AdminPage>(initialPage);
  const [stats, setStats] = useState<AdminStatsData | null>(null);

  useEffect(() => {
    api<{ stats: AdminStatsData }>('admin/stats.php').then((data) => setStats(data.stats)).catch(() => setStats(null));
  }, [page]);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <AdminDashboard onNavigate={(p) => setPage(p as AdminPage)} />;
      case 'annonces': return <AdminListings />;
      case 'validation': return <AdminValidation />;
      case 'utilisateurs': return <AdminUsers />;
      case 'messages': return <AdminMessages />;
      case 'statistiques': return <AdminStats stats={stats} />;
      case 'parametres': return <AdminSettings />;
      default: return <AdminDashboard onNavigate={(p) => setPage(p as AdminPage)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      <aside className="w-60 shrink-0 bg-[#0F2747] min-h-screen flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8] flex items-center justify-center"><span className="text-[#0F2747] font-bold text-xs">IA</span></div>
            <div><div className="text-white font-bold text-sm">IMMOB</div><div className="text-[#38BDF8] text-[9px] font-semibold tracking-widest uppercase">Administration</div></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const badge = item.id === 'validation' ? stats?.pending : item.id === 'messages' ? stats?.contacts : undefined;
            return (
              <button key={item.id} onClick={() => setPage(item.id)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${page === item.id ? 'bg-[#38BDF8] text-[#0F2747]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <div className="flex items-center gap-3">{item.icon}{item.label}</div>
                {badge !== undefined && badge > 0 && <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${page === item.id ? 'bg-[#0F2747] text-[#38BDF8]' : 'bg-red-500 text-white'}`}>{badge}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={() => onNavigate('home')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            Voir le site
          </button>
          <p className="px-3 pt-3 text-white/40 text-xs">Compte administrateur connecté</p>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-bold text-[#172033] text-base">{navItems.find((n) => n.id === page)?.label || 'Administration'}</h1>
          <span className="text-sm text-[#6B7280]">Aujourd'hui : {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </header>
        <div className="p-6 animate-fade-in" key={page}>{renderPage()}</div>
      </main>
    </div>
  );
}

function AdminMessages() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api<{ contacts: any[] }>('admin/contacts.php').then((r) => setContacts(r.contacts || [])).catch((e) => setError(e instanceof Error ? e.message : 'Impossible de charger les contacts.'));
  }, []);
  return (
    <div>
      <div className="mb-5"><h2 className="text-lg font-bold text-[#172033]">Demandes reçues</h2><p className="text-sm text-[#6B7280] mt-1">Les demandes envoyées depuis les annonces sont chargées depuis MySQL.</p></div>
      {error && <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm p-3">{error}</div>}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {contacts.map((c) => (
          <div key={c.id} className="p-4 border-b border-gray-50 last:border-b-0">
            <div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-sm text-[#172033]">{c.visitor_name}</p><p className="text-xs text-[#6B7280] mt-0.5">{c.title}</p></div><p className="text-xs text-[#6B7280]">{new Date(c.created_at).toLocaleString('fr-FR')}</p></div>
            <p className="text-sm text-[#6B7280] mt-2 whitespace-pre-wrap">{c.message}</p>
            <div className="text-xs text-[#6B7280] mt-2">{c.visitor_phone}{c.visitor_email ? ` · ${c.visitor_email}` : ''}</div>
          </div>
        ))}
        {contacts.length === 0 && !error && <div className="p-8 text-sm text-[#6B7280]">Aucune demande reçue.</div>}
      </div>
    </div>
  );
}

function AdminStats({ stats }: { stats: AdminStatsData | null }) {
  const cards = [
    ['Utilisateurs', stats?.users ?? '—'],
    ['Annonces', stats?.listings ?? '—'],
    ['Annonces en attente', stats?.pending ?? '—'],
    ['Annonces approuvées', stats?.approved ?? '—'],
    ['Demandes de contact', stats?.contacts ?? '—'],
  ];
  return (
    <div className="space-y-5">
      <div><h2 className="text-2xl font-bold text-[#172033]">Statistiques</h2><p className="text-sm text-[#6B7280] mt-1">Indicateurs calculés directement depuis MySQL.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{cards.map(([label, value]) => <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5"><p className="text-xs text-[#6B7280]">{label}</p><p className="text-2xl font-bold text-[#0F2747] mt-2">{value}</p></div>)}</div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="max-w-2xl space-y-5">
      <div><h2 className="text-2xl font-bold text-[#172033]">Paramètres</h2><p className="text-sm text-[#6B7280] mt-1">Les paramètres sensibles sont conservés côté serveur et ne sont pas exposés dans React.</p></div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 text-sm">
        <div><p className="font-semibold text-[#172033]">API</p><p className="text-[#6B7280]">Backend PHP sous <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">/backend/api</code>.</p></div>
        <div><p className="font-semibold text-[#172033]">Base de données</p><p className="text-[#6B7280]">MySQL avec requêtes préparées via PDO.</p></div>
        <div><p className="font-semibold text-[#172033]">Sécurité</p><p className="text-[#6B7280]">Sessions strictes, cookies sécurisés en HTTPS, CSRF, contrôle des rôles et limitation des tentatives.</p></div>
        <div><p className="font-semibold text-[#172033]">Configuration</p><p className="text-[#6B7280]">Sur le serveur, renseignez <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">backend/config/config.local.php</code>. Ne placez jamais ses identifiants dans le frontend.</p></div>
      </div>
    </div>
  );
}
