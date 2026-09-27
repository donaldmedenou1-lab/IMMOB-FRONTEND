import { useEffect, useState } from 'react';
import { formatPrice } from '../data/listings';
import { api } from '../lib/api';
import {
  fetchMyListings, type MyListing, fetchFavorites, fetchMessages, markMessageRead,
  deleteListing, updateProfile, changePassword, fetchPreferences, savePreferences
} from '../lib/listings-api';

interface Props {
  onNavigate: (page: string, id?: string) => void;
}

type Tab = 'overview' | 'listings' | 'favorites' | 'messages' | 'profile' | 'settings';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Tableau de bord', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { id: 'listings', label: 'Mes annonces', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { id: 'favorites', label: 'Favoris', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
  { id: 'messages', label: 'Messages', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
  { id: 'profile', label: 'Profil', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  { id: 'settings', label: 'Paramètres', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];



export default function UserDashboard({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; phone: string; city?: string } | null>(null);
  const [profile, setProfile] = useState({name:'',email:'',phone:'',city:''});
  const [profileSaving,setProfileSaving]=useState(false);
  const [profileMessage,setProfileMessage]=useState('');
  const [profileError,setProfileError]=useState('');
  const [settings,setSettings]=useState({new_messages:1,new_listings:1,promotions:0,login_notifications:1});
  const [passwords,setPasswords]=useState({current:'',newPassword:''});
  const [passwordMessage,setPasswordMessage]=useState('');
  const [passwordError,setPasswordError]=useState('');

  const refreshDashboard = async () => {
    const [listings,favs,msgs] = await Promise.all([
      fetchMyListings(), fetchFavorites(), fetchMessages()
    ]);
    setMyListings(listings); setFavorites(favs); setMessages(msgs.data); setUnreadCount(msgs.unread_count);
  };

  useEffect(() => {
    Promise.all([
      refreshDashboard(),
      api<{ user: { name: string; email: string; phone: string; city?: string } }>('auth/me.php'),
      fetchPreferences()
    ]).then(([,user,prefs]) => {
      setCurrentUser(user.user);
      setProfile({name:user.user.name||'',email:user.user.email||'',phone:user.user.phone||'',city:user.user.city||''});
      setSettings(prefs);
    }).catch(() => {});
  }, []);

  const handleDelete = async (id:string) => {
    if(!window.confirm('Supprimer définitivement cette annonce ? Cette action est irréversible.')) return;
    try { await deleteListing(id); await refreshDashboard(); } catch(e) { alert(e instanceof Error?e.message:'Suppression impossible.'); }
  };

  const handleProfileSave = async () => {
    setProfileMessage('');setProfileError('');setProfileSaving(true);
    try { await updateProfile(profile); const data=await api<any>('auth/me.php'); setCurrentUser(data.user); setProfileMessage('Profil enregistré.'); }
    catch(e){setProfileError(e instanceof Error?e.message:'Impossible de modifier le profil.');}
    finally{setProfileSaving(false);}
  };

  const handleMessageClick = async (msg:any) => {
    if(msg.unread){ try{await markMessageRead(msg.id); setMessages(ms=>ms.map(m=>m.id===msg.id?{...m,unread:false,read_at:new Date().toISOString()}:m));setUnreadCount(c=>Math.max(0,c-1));}catch{} }
  };

  const saveSetting = async (key:string) => {
    const next={...settings,[key]:(settings as any)[key]?0:1};
    setSettings(next);
    try{await savePreferences(next);}catch{setSettings(settings);}
  };

  const handlePasswordChange = async () => {
    setPasswordError('');setPasswordMessage('');
    if(passwords.newPassword.length<10){setPasswordError('Le nouveau mot de passe doit contenir au moins 10 caractères.');return;}
    try{await changePassword(passwords.current,passwords.newPassword);setPasswords({current:'',newPassword:''});setPasswordMessage('Mot de passe modifié.');}
    catch(e){setPasswordError(e instanceof Error?e.message:'Impossible de modifier le mot de passe.');}
  };

  const handleLogout = async () => {
    try { await api('auth/logout.php', { method: 'POST' }); } catch { /* on quitte quand même */ }
    onNavigate('home');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Annonces actives', value: String(myListings.filter((l) => l.listingStatus === 'approuvé').length), delta: `${myListings.length} au total`, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'En attente', value: String(myListings.filter((l) => l.listingStatus === 'en attente').length), delta: 'en cours de modération', color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Vues totales', value: String(myListings.reduce((sum,l)=>sum+l.viewsCount,0)), delta: 'sur vos annonces', color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Contacts reçus', value: String(myListings.reduce((sum,l)=>sum+l.messageCount,0)), delta: 'demandes reçues', color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs text-[#6B7280] mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#172033] mb-1">{stat.value}</p>
                  <p className={`text-xs font-medium ${stat.color}`}>{stat.delta}</p>
                </div>
              ))}
            </div>

            {/* Recent listings */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#172033]">Mes annonces récentes</h3>
                <button onClick={() => setActiveTab('listings')} className="text-[#1D4ED8] text-xs font-medium cursor-pointer hover:underline">Voir tout</button>
              </div>
              <div className="space-y-3">
                {myListings.length === 0 && <p className="text-sm text-[#6B7280]">Vous n'avez pas encore publié d'annonce.</p>}
                {myListings.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F7FA] transition-colors">
                    <img src={p.image} alt={p.title} className="w-14 h-10 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#172033] truncate">{p.title}</p>
                      <p className="text-xs text-[#6B7280]">{formatPrice(p.price, p.status)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.listingStatus === 'approuvé' ? 'bg-green-100 text-green-700' : p.listingStatus === 'rejeté' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.listingStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent messages */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#172033]">Messages récents</h3>
                <button onClick={() => setActiveTab('messages')} className="text-[#1D4ED8] text-xs font-medium cursor-pointer hover:underline">Voir tout</button>
              </div>
              <div className="space-y-3">
                {messages.slice(0, 2).map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F5F7FA] transition-colors cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-[#E8F7FF] flex items-center justify-center text-[#0F2747] font-bold shrink-0">{(msg.sender_name || 'V').charAt(0).toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm ${msg.unread ? 'font-semibold text-[#172033]' : 'font-medium text-[#6B7280]'}`}>{msg.sender_name}</p>
                        <p className="text-xs text-[#6B7280] shrink-0">{new Date(msg.created_at).toLocaleString('fr-FR')}</p>
                      </div>
                      <p className="text-xs text-[#6B7280] truncate">{msg.body}</p>
                    </div>
                    {msg.unread && <div className="w-2 h-2 rounded-full bg-[#1D4ED8] mt-1.5 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'listings':
        return (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#172033]">Mes annonces</h2>
              <button onClick={() => onNavigate('submit')} className="bg-[#38BDF8] text-[#0F2747] font-semibold px-4 py-2 rounded-xl text-sm cursor-pointer hover:bg-[#7DD3FC] transition-colors">
                + Nouvelle annonce
              </button>
            </div>
            <div className="space-y-3">
              {myListings.length === 0 && (
                <p className="text-sm text-[#6B7280] bg-white rounded-2xl border border-gray-100 p-6 text-center">
                  Vous n'avez pas encore publié d'annonce.
                </p>
              )}
              {myListings.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:border-[#38BDF8]/30 transition-colors">
                  <img src={item.image} alt={item.title} className="w-20 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#172033] text-sm truncate">{item.title}</p>
                        <p className="text-[#38BDF8] font-bold text-sm">{formatPrice(item.price, item.status)}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{item.city} · Publié le {new Date(item.createdAt).toLocaleDateString('fr-FR')}</p>
                        {item.listingStatus === 'rejeté' && item.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">Motif du refus : {item.rejectionReason}</p>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${item.listingStatus === 'approuvé' ? 'bg-green-100 text-green-700' : item.listingStatus === 'rejeté' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.listingStatus}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {item.listingStatus === 'approuvé' && (
                      <button onClick={() => onNavigate(item.type === 'property' ? 'property-detail' : 'vehicle-detail', item.id)} className="px-3 py-1.5 text-xs text-[#1D4ED8] border border-[#1D4ED8]/30 rounded-lg hover:bg-[#1D4ED8]/10 cursor-pointer transition-colors">Voir en ligne</button>
                    )}
                    <button onClick={() => onNavigate('edit-listing', item.id)} className="px-3 py-1.5 text-xs text-[#172033] border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Modifier</button>
                    <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'favorites':
        return (
          <div>
            <h2 className="text-lg font-bold text-[#172033] mb-5">Mes favoris</h2>
            {favorites.length === 0 ? <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-[#6B7280]">Aucune annonce enregistrée dans vos favoris.</div> :
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex">
                  <img src={p.image || ''} alt={p.title} className="w-24 h-28 object-cover shrink-0" />
                  <div className="p-3 min-w-0 flex-1">
                    <p className="text-[#38BDF8] font-bold text-sm mb-0.5">{formatPrice(Number(p.price), p.transaction_type)}</p>
                    <p className="font-semibold text-[#172033] text-xs truncate">{p.title}</p>
                    <p className="text-xs text-[#6B7280] mt-1 truncate">{p.neighborhood || p.city}</p>
                    <button onClick={() => onNavigate(p.type === 'property' ? 'property-detail' : 'vehicle-detail', String(p.id))} className="mt-2 text-xs text-[#1D4ED8] font-semibold">Voir l'annonce</button>
                  </div>
                </div>
              ))}
            </div>}
          </div>
        );

      case 'messages':
        return (
          <div>
            <h2 className="text-lg font-bold text-[#172033] mb-5">Messages <span className="text-sm font-medium text-white bg-[#1D4ED8] rounded-full px-2 py-0.5">{unreadCount}</span></h2>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {messages.length===0 ? <p className="p-8 text-center text-sm text-[#6B7280]">Aucun message reçu.</p> :
              messages.map((msg, i) => (
                <button type="button" key={msg.id} onClick={() => handleMessageClick(msg)} className={`w-full text-left flex items-start gap-3 p-4 hover:bg-[#F5F7FA] transition-colors ${i < messages.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-[#E8F7FF] flex items-center justify-center text-[#0F2747] font-bold shrink-0">{(msg.sender_name || 'V').charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={`text-sm ${msg.unread ? 'font-semibold text-[#172033]' : 'font-medium text-[#6B7280]'}`}>{msg.sender_name}</p>
                      <p className="text-xs text-[#6B7280] shrink-0">{new Date(msg.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                    <p className={`text-xs mb-0.5 ${msg.unread ? 'font-medium text-[#172033]' : 'text-[#6B7280]'}`}>{msg.subject || 'Demande de contact'}</p>
                    <p className="text-xs text-[#6B7280] truncate">{msg.body}</p>
                  </div>
                  {msg.unread && <div className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8] mt-2 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="max-w-lg">
            <h2 className="text-lg font-bold text-[#172033] mb-5">Mon profil</h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#0F2747] text-white flex items-center justify-center text-xl font-bold">{(profile.name||'M').charAt(0).toUpperCase()}</div>
                <div><h3 className="font-bold text-[#172033]">{profile.name || 'Mon compte'}</h3><p className="text-sm text-[#6B7280]">{profile.phone}</p></div>
              </div>
              {profileMessage&&<div className="mb-4 rounded-xl bg-green-50 text-green-700 text-sm p-3">{profileMessage}</div>}
              {profileError&&<div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm p-3">{profileError}</div>}
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-[#6B7280] uppercase">Nom complet<input value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} maxLength={100} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" /></label>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase">Email<input value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} type="email" className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" /></label>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase">Téléphone<input value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} type="tel" className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" /></label>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase">Ville<input value={profile.city} onChange={e=>setProfile(p=>({...p,city:e.target.value}))} maxLength={80} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" /></label>
                <button onClick={handleProfileSave} disabled={profileSaving} className="w-full bg-[#0F2747] text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60">{profileSaving?'Enregistrement…':'Enregistrer les modifications'}</button>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-lg">
            <h2 className="text-lg font-bold text-[#172033] mb-5">Paramètres</h2>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-[#172033] mb-4">Notifications</h3>
                {([['new_messages','Alertes de nouveaux messages'],['new_listings','Nouvelles annonces dans mes critères'],['promotions','Promotions et actualités IMMOB'],['login_notifications','Notifications de connexion']] as const).map(([key,label])=>
                  <button key={key} onClick={()=>saveSetting(key)} className="w-full flex items-center justify-between gap-3 py-2.5 text-left">
                    <span className="text-sm text-[#172033]">{label}</span>
                    <span className={`w-10 h-5 rounded-full relative ${settings[key]?'bg-[#0F2747]':'bg-gray-200'}`}><span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full ${settings[key]?'translate-x-5':'translate-x-0.5'}`} /></span>
                  </button>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-[#172033] mb-4">Changer le mot de passe</h3>
                {passwordMessage&&<div className="mb-3 rounded-xl bg-green-50 text-green-700 text-sm p-3">{passwordMessage}</div>}
                {passwordError&&<div className="mb-3 rounded-xl bg-red-50 text-red-700 text-sm p-3">{passwordError}</div>}
                <div className="space-y-3">
                  <input type="password" value={passwords.current} onChange={e=>setPasswords(p=>({...p,current:e.target.value}))} placeholder="Mot de passe actuel" autoComplete="current-password" className="w-full border rounded-xl p-2.5 text-sm" />
                  <input type="password" value={passwords.newPassword} onChange={e=>setPasswords(p=>({...p,newPassword:e.target.value}))} placeholder="Nouveau mot de passe (10 caractères minimum)" autoComplete="new-password" className="w-full border rounded-xl p-2.5 text-sm" />
                  <button onClick={handlePasswordChange} className="w-full bg-[#0F2747] text-white rounded-xl py-2.5 text-sm font-semibold">Modifier le mot de passe</button>
                </div>
              </div>
            </div>
              <div className="bg-white rounded-2xl border border-red-100 p-5">
                <h3 className="font-bold text-red-700 mb-2">Zone sensible</h3>
                <p className="text-xs text-[#6B7280] mb-3">La suppression du compte est définitive et supprime vos annonces et favoris.</p>
                <button onClick={async()=>{const password=window.prompt('Entrez votre mot de passe pour confirmer la suppression du compte :');if(!password)return;try{await api('account/delete.php',{method:'POST',body:JSON.stringify({password})});onNavigate('home');}catch(e){alert(e instanceof Error?e.message:'Suppression impossible.');}}} className="w-full border border-red-200 text-red-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-red-50">Supprimer mon compte</button>
              </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-3 sticky top-20">
              {/* User quick info */}
              <div className="flex items-center gap-3 p-3 mb-2 border-b border-gray-100 pb-4">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="font-semibold text-[#172033] text-sm truncate">{currentUser?.name || 'Mon compte'}</p>
                  <p className="text-xs text-[#6B7280]">{currentUser?.phone || ''}</p>
                </div>
              </div>
              <nav className="space-y-0.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-[#0F2747] text-white'
                        : 'text-[#6B7280] hover:bg-[#F5F7FA] hover:text-[#172033]'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Déconnexion
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-bold text-[#172033]">{tabs.find(t => t.id === activeTab)?.label}</h1>
                <p className="text-sm text-[#6B7280]">Bienvenue{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''} 👋</p>
              </div>
              <button
                onClick={() => onNavigate('submit')}
                className="hidden sm:flex items-center gap-2 bg-[#38BDF8] text-[#0F2747] font-semibold px-4 py-2 rounded-xl text-sm cursor-pointer hover:bg-[#7DD3FC] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Publier
              </button>
            </div>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
