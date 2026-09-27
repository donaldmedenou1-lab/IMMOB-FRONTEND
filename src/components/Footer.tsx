interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#091a30] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#38BDF8] flex items-center justify-center">
                <span className="text-[#0F2747] font-bold text-sm">IA</span>
              </div>
              <div>
                <div className="font-bold text-base tracking-tight">IMMOB</div>
                <div className="text-[#38BDF8] text-[10px] font-medium tracking-widest uppercase">Bénin</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              La plateforme de référence pour l'immobilier et l'automobile au Bénin. Trouvez, achetez, louez ou vendez en toute confiance.
            </p>
            <div className="flex gap-3 mt-5">
              {['facebook', 'twitter', 'instagram', 'whatsapp'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-colors"
                >
                  <span className="text-xs capitalize">{social[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Accueil', page: 'home' },
                { label: 'Maisons & Appartements', page: 'properties' },
                { label: 'Véhicules', page: 'vehicles' },
                { label: 'Publier une annonce', page: 'submit' },
                { label: 'Mon compte', page: 'dashboard' },
              ].map((item) => (
                <li key={item.page}>
                  <button
                    onClick={() => onNavigate(item.page)}
                    className="text-white/60 hover:text-[#38BDF8] text-sm transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Catégories</h4>
            <ul className="space-y-2.5">
              {[
                'Villas à vendre',
                'Appartements à louer',
                'Terrains',
                'SUV & 4×4',
                'Berlines',
                'Véhicules utilitaires',
              ].map((cat) => (
                <li key={cat}>
                  <button className="text-white/60 hover:text-[#38BDF8] text-sm transition-colors cursor-pointer text-left">
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 text-[#38BDF8] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white/60 text-sm">Avenue Jean-Paul II, Cotonou, Bénin</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-[#38BDF8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-white/60 text-sm">+229 21 30 40 50</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-[#38BDF8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-white/60 text-sm">contact@immoauto.bj</span>
              </li>
            </ul>
            <div className="mt-5 p-3 bg-[#38BDF8]/10 border border-[#38BDF8]/20 rounded-lg">
              <p className="text-[#38BDF8] text-xs font-medium">Disponible Lun–Sam, 8h–18h</p>
              <p className="text-white/50 text-xs mt-1">Réponse sous 24h garantie</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/40 text-xs">© 2024 IMMOB Bénin. Tous droits réservés.</p>
          <div className="flex gap-5">
            {['Conditions d\'utilisation', 'Politique de confidentialité', 'Mentions légales'].map((item) => (
              <a key={item} href="#" className="text-white/40 hover:text-white/70 text-xs transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
