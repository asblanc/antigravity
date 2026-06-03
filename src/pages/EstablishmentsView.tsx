import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, MapPin, Star, Hotel, Utensils, Coffee, Gamepad2, Heart, Globe } from 'lucide-react';
import { Seo } from '../components/Seo';
import { FadeImage } from '../components/FadeImage';
import { supabase } from '../lib/supabase';

export const EstablishmentsView: React.FC = () => {
  const location = useLocation();
  const initialFilter = location.state?.filter || 'Tous';
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(initialFilter);

  const SHOWCASE = [
    { name: 'Domaine Bini', cat: 'Diaspora & Héritage', zone: 'Autoroute du Nord', cashback: '5%', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=400' },
    { name: 'Sofitel Abidjan', cat: 'Hébergements & Séjours', zone: 'Cocody', cashback: '3-7%', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400' },
    { name: 'Pullman Helios', cat: 'Hébergements & Séjours', zone: 'Plateau', cashback: '3-7%', img: '/assets/pullman-hotel.png' },
    { name: 'Sky Lounge', cat: 'Lounges & Nightlife', zone: 'Marcory', cashback: '5%', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400' },
    { name: 'Radisson Blu', cat: 'Hébergements & Séjours', zone: 'Port-Bouet', cashback: '3-7%', img: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=400' },
    { name: 'Maison Akoula', cat: 'Beach Clubs & Loisirs', zone: 'Assinie', cashback: '5%', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400' },
    { name: 'Le Grand Large', cat: 'Restaurants & Dining', zone: 'Zone 4', cashback: '5%', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400' },
    { name: 'Orchidée Spa', cat: 'Bien-être & Wellness', zone: 'Cocody', cashback: '5%', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400' },
  ];

  // Établissements réels (actifs) depuis Supabase ; repli sur le catalogue d'exemple si base vide.
  type Place = { name: string; cat: string; zone: string; cashback: string; img: string };
  const [realPlaces, setRealPlaces] = useState<Place[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('establishments')
        .select('name, category, zone, cashback_rate, image_url')
        .eq('active', true)
        .order('created_at', { ascending: false });
      if (data && data.length) {
        setRealPlaces(data.map((e: any) => ({
          name: e.name,
          cat: e.category,
          zone: e.zone,
          cashback: `${e.cashback_rate}%`,
          img: e.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400',
        })));
      }
    })();
  }, []);

  const places: Place[] = realPlaces.length ? realPlaces : SHOWCASE;

  // Filtres dynamiques : 'Tous' + catégories réellement présentes.
  const categories = ['Tous', ...Array.from(new Set(places.map((p) => p.cat))).filter(Boolean)];

  const filteredPlaces = places.filter(p =>
    (filter === 'Tous' || p.cat === filter) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.zone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filterIcons: Record<string, React.ReactNode> = { 
    'Hébergements & Séjours': <Hotel size={14} />, 
    'Restaurants & Dining': <Utensils size={14} />, 
    'Lounges & Nightlife': <Coffee size={14} />, 
    'Beach Clubs & Loisirs': <Gamepad2 size={14} />, 
    'Bien-être & Wellness': <Heart size={14} />, 
    'Diaspora & Héritage': <Globe size={14} /> 
  };

  return (
    <div className="min-h-screen bg-cream pt-24">
      <Seo
        title="Le Réseau IBC — Établissements & Partenaires | Ivoire Business Club"
        description="Découvrez les hôtels, restaurants, lounges, beach clubs et spas partenaires du club IBC en Côte d'Ivoire et profitez de cashback exclusif."
        path="/establishments"
      />
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">LE RÉSEAU IBC</span>
          <h2 className="font-serif text-4xl font-bold text-green-dark mt-4">NOS DESTINATIONS & PARTENAIRES</h2>
        </div>
        <div className="relative mb-8">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Rechercher un lieu ou une zone..." className="w-full bg-white border border-gold/10 py-5 pl-16 pr-6 font-serif text-lg focus:border-gold outline-none shadow-premium transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-8 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 ${filter === f ? 'bg-green-dark text-gold border border-gold shadow-gold' : 'bg-white text-text-muted border border-gold/10'}`}>
              {f === 'Tous' ? <Globe size={14} /> : (filterIcons[f] || <MapPin size={14} />)}{f}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place, i) => (
            <div key={i} className="hover-lift bg-white border border-gold/10 rounded-xl overflow-hidden hover:border-gold/30 hover:shadow-premium transition-all group">
              <div className="relative overflow-hidden h-56">
                <FadeImage src={place.img} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <span className="absolute top-3 left-3 bg-green-dark text-gold text-[9px] uppercase tracking-widest font-bold px-3 py-1">{place.cat}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-serif text-green-dark font-bold">{place.name}</h4>
                  <div className="flex items-center gap-1 text-gold text-xs"><Star size={12} fill="currentColor" />5.0</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-text-muted text-xs"><MapPin size={12} />{place.zone}</span>
                  <span className="bg-green-dark/10 text-green-dark text-[10px] font-bold px-3 py-1">Cashback {place.cashback}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredPlaces.length === 0 && (
          <div className="text-center py-20">
            <h4 className="font-serif text-2xl text-green-dark mb-4">Aucun établissement trouvé</h4>
            <p className="text-text-muted">Essayez d'élargir votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};
