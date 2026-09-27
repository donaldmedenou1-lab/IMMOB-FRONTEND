import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Props { listingId: string; onNavigate: (page: string, id?: string) => void; }

type FormState = {
  type: 'property' | 'vehicle';
  category: string; title: string; description: string; price: string;
  transaction_type: 'vente' | 'location'; city: string; neighborhood: string;
  phone: string; email: string; rooms: string; bathrooms: string; surface: string;
  brand: string; model: string; year: string; mileage: string;
  condition: string; fuel: string; transmission: string;
};

const empty: FormState = {
  type:'property',category:'',title:'',description:'',price:'',transaction_type:'vente',
  city:'',neighborhood:'',phone:'',email:'',rooms:'',bathrooms:'',surface:'',
  brand:'',model:'',year:'',mileage:'',condition:'',fuel:'',transmission:''
};

export default function EditListingPage({ listingId, onNavigate }: Props) {
  const [form,setForm]=useState<FormState>(empty);
  const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);
  const [error,setError]=useState(''); const [done,setDone]=useState(false); const [images,setImages]=useState<any[]>([]); const [newPhotos,setNewPhotos]=useState<File[]>([]);
  const set=(key:keyof FormState,value:string)=>setForm(f=>({...f,[key]:value}));

  useEffect(()=>{
    api<{listing: any}>(`listings/own-show.php?id=${encodeURIComponent(listingId)}`)
      .then(({listing})=>{ setImages(listing.images||[]); setForm({
        type:listing.type, category:listing.category||'', title:listing.title||'', description:listing.description||'',
        price:String(listing.price??''), transaction_type:listing.transaction_type, city:listing.city||'',
        neighborhood:listing.neighborhood||'', phone:listing.phone||'', email:listing.email||'',
        rooms:listing.rooms==null?'':String(listing.rooms), bathrooms:listing.bathrooms==null?'':String(listing.bathrooms),
        surface:listing.surface_m2==null?'':String(listing.surface_m2), brand:listing.brand||'', model:listing.model||'',
        year:listing.year==null?'':String(listing.year), mileage:listing.mileage==null?'':String(listing.mileage),
        condition:listing.vehicle_condition||'', fuel:listing.fuel||'', transmission:listing.transmission||''
      }); })
      .catch(e=>setError(e instanceof Error?e.message:'Annonce introuvable.'))
      .finally(()=>setLoading(false));
  },[listingId]);

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();setError('');
    if(!form.title.trim()||!form.description.trim()||!form.price||!form.city||!form.phone){setError('Veuillez remplir les champs obligatoires.');return;}
    setSaving(true);
    try{
      await api('listings/update.php',{method:'POST',body:JSON.stringify({
        id:Number(listingId), ...form, price:Number(form.price),
        rooms:form.rooms?Number(form.rooms):null,bathrooms:form.bathrooms?Number(form.bathrooms):null,
        surface:form.surface?Number(form.surface):null,year:form.year?Number(form.year):null,
        mileage:form.mileage?Number(form.mileage):null
      })});
      for(const photo of newPhotos.slice(0,8-images.length)){const body=new FormData();body.append('listing_id',listingId);body.append('image',photo);await api('listings/upload.php',{method:'POST',body});}
      setDone(true);
    }catch(e){setError(e instanceof Error?e.message:'Modification impossible.');}
    finally{setSaving(false);}
  };

  if(loading)return <div className="min-h-screen pt-20 flex items-center justify-center text-sm text-[#6B7280]">Chargement…</div>;
  if(done)return <div className="min-h-screen bg-[#F5F7FA] pt-20 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-8 max-w-md text-center border border-gray-100"><div className="text-3xl mb-3">✓</div><h1 className="text-xl font-bold text-[#172033] mb-2">Annonce mise à jour</h1><p className="text-sm text-[#6B7280] mb-5">Pour votre sécurité, toute modification d'une annonce publiée repasse par la modération.</p><button onClick={()=>onNavigate('dashboard')} className="bg-[#0F2747] text-white px-5 py-3 rounded-xl text-sm font-semibold">Retour à mes annonces</button></div></div>;

  return <div className="min-h-screen bg-[#F5F7FA] pt-16">
    <div className="bg-[#0F2747] py-8 px-4"><div className="max-w-3xl mx-auto"><p className="text-[#38BDF8] text-xs font-semibold uppercase">Gestion de l'annonce</p><h1 className="text-2xl font-bold text-white">Modifier mon annonce</h1></div></div>
    <form onSubmit={submit} className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
      {error&&<div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm" role="alert">{error}</div>}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-[#172033]">Informations principales</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm font-medium">Type<select value={form.category} onChange={e=>set('category',e.target.value)} className="mt-1 w-full border rounded-xl p-2.5"><option value="">Choisir</option>{(form.type==='property'?['Villa','Appartement','Maison','Terrain']:['Berline','SUV / 4×4','Pickup','Utilitaire','Moto']).map(x=><option key={x}>{x}</option>)}</select></label>
          <label className="text-sm font-medium">Transaction<select value={form.transaction_type} onChange={e=>set('transaction_type',e.target.value)} className="mt-1 w-full border rounded-xl p-2.5"><option value="vente">Vente</option><option value="location">Location</option></select></label>
        </div>
        <label className="text-sm font-medium block">Titre<input maxLength={150} value={form.title} onChange={e=>set('title',e.target.value)} className="mt-1 w-full border rounded-xl p-2.5" /></label>
        <label className="text-sm font-medium block">Description<textarea maxLength={5000} rows={6} value={form.description} onChange={e=>set('description',e.target.value)} className="mt-1 w-full border rounded-xl p-2.5 resize-none" /></label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm font-medium">Prix<input type="number" min="0" value={form.price} onChange={e=>set('price',e.target.value)} className="mt-1 w-full border rounded-xl p-2.5" /></label>
          <label className="text-sm font-medium">Ville<input maxLength={80} value={form.city} onChange={e=>set('city',e.target.value)} className="mt-1 w-full border rounded-xl p-2.5" /></label>
        </div>
        <label className="text-sm font-medium block">Quartier / adresse<input maxLength={100} value={form.neighborhood} onChange={e=>set('neighborhood',e.target.value)} className="mt-1 w-full border rounded-xl p-2.5" /></label>
      </section>
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-[#172033]">Caractéristiques</h2>
        {form.type==='property'?<div className="grid sm:grid-cols-3 gap-4">
          <label className="text-sm font-medium">Pièces<input type="number" min="0" max="100" value={form.rooms} onChange={e=>set('rooms',e.target.value)} className="mt-1 w-full border rounded-xl p-2.5" /></label>
          <label className="text-sm font-medium">Salles de bain<input type="number" min="0" max="100" value={form.bathrooms} onChange={e=>set('bathrooms',e.target.value)} className="mt-1 w-full border rounded-xl p-2.5" /></label>
          <label className="text-sm font-medium">Surface<input type="number" min="0" value={form.surface} onChange={e=>set('surface',e.target.value)} className="mt-1 w-full border rounded-xl p-2.5" /></label>
        </div>:<div className="grid sm:grid-cols-2 gap-4">
          {(['brand','model','year','mileage','condition','fuel','transmission'] as const).map(k=><label key={k} className="text-sm font-medium capitalize">{k}<input maxLength={80} value={form[k]} onChange={e=>set(k,e.target.value)} className="mt-1 w-full border rounded-xl p-2.5" /></label>)}
        </div>}
      </section>
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-[#172033]">Photos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img:any)=><div key={img.id||img.url} className="relative"><img src={img.url} alt="" className="w-full h-24 object-cover rounded-xl" /><button type="button" onClick={async()=>{try{await api('listings/image-delete.php',{method:'POST',body:JSON.stringify({image_id:img.id})});setImages((xs)=>xs.filter(x=>x.id!==img.id));}catch(e){setError(e instanceof Error?e.message:'Impossible de supprimer la photo.');}}} className="absolute top-1 right-1 bg-white/90 text-red-600 rounded-lg px-2 py-1 text-xs">Supprimer</button></div>)}
        </div>
        <label className="inline-block px-4 py-2 bg-[#F5F7FA] border rounded-xl text-sm cursor-pointer">Ajouter des photos
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={e=>{setNewPhotos(Array.from(e.target.files||[]).filter(f=>f.size<=5*1024*1024).slice(0,Math.max(0,8-images.length)));e.currentTarget.value='';}} />
        </label>
        {newPhotos.length>0&&<p className="text-xs text-[#6B7280]">{newPhotos.length} nouvelle(s) photo(s) prête(s).</p>}
        <p className="text-xs text-[#6B7280]">JPG, PNG ou WebP, 5 Mo maximum par fichier, 8 photos maximum. Une modification de photo repasse l'annonce en modération.</p>
      </section>
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-[#172033]">Contact</h2>
        <label className="text-sm font-medium block">Téléphone<input value={form.phone} onChange={e=>set('phone',e.target.value)} className="mt-1 w-full border rounded-xl p-2.5" /></label>
        <label className="text-sm font-medium block">Email<input type="email" value={form.email} onChange={e=>set('email',e.target.value)} className="mt-1 w-full border rounded-xl p-2.5" /></label>
      </section>
      <div className="flex gap-3"><button type="button" onClick={()=>onNavigate('dashboard')} className="flex-1 border rounded-xl py-3 bg-white">Annuler</button><button disabled={saving} className="flex-1 bg-[#0F2747] text-white rounded-xl py-3 font-semibold">{saving?'Enregistrement…':'Enregistrer'}</button></div>
    </form>
  </div>;
}
