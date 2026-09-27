import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [stats,setStats]=useState<any>(null);
  useEffect(()=>{api('admin/stats.php').then(r=>setStats(r.stats)).catch(()=>{});},[]);
  const cards=[['Utilisateurs',stats?.users??'—'],['Annonces',stats?.listings??'—'],['À valider',stats?.pending??'—'],['Contacts',stats?.contacts??'—']];
  return <div className="space-y-6"><div><p className="text-xs uppercase tracking-widest text-[#38BDF8] font-semibold">IMMOB</p><h2 className="text-2xl font-bold text-[#172033]">Vue d’ensemble</h2><p className="text-sm text-[#6B7280] mt-1">Les indicateurs sont chargés depuis MySQL, pas depuis des données de démonstration.</p></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{cards.map(([l,v])=><div key={l} className="bg-white rounded-2xl border border-gray-100 p-5"><p className="text-xs text-[#6B7280]">{l}</p><p className="text-3xl font-bold text-[#0F2747] mt-2">{v}</p></div>)}</div><div className="grid md:grid-cols-2 gap-4"><button onClick={()=>onNavigate('validation')} className="bg-white border border-gray-100 rounded-2xl p-6 text-left hover:border-[#38BDF8] transition-colors"><h3 className="font-bold text-[#172033]">Modérer les annonces</h3><p className="text-sm text-[#6B7280] mt-1">Accepter ou refuser les annonces en attente.</p></button><button onClick={()=>onNavigate('utilisateurs')} className="bg-white border border-gray-100 rounded-2xl p-6 text-left hover:border-[#38BDF8] transition-colors"><h3 className="font-bold text-[#172033]">Gérer les comptes</h3><p className="text-sm text-[#6B7280] mt-1">Consulter et suspendre les comptes depuis le serveur.</p></button></div></div>;
}
