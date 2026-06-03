import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Compass, Sparkles, Briefcase, Crown, Users, Utensils, CreditCard, BookOpen, Headphones, Palmtree, Hotel, Globe, Smartphone, Heart, Star, Quote } from 'lucide-react';
import { HomeTierCards } from '../components/HomeTierCards';
import { Seo } from '../components/Seo';
import { supabase } from '../lib/supabase';
import { FadeImage } from '../components/FadeImage';

// Images locales fiables (servies par le site) — évite la dépendance à des
// hôtes externes parfois bloqués sur certains réseaux (images.unsplash.com).
const LOCAL_IMGS = ['/hero-restaurant.webp', '/hero-lounge.webp', '/hero-beach.webp'];

const HERO_IMAGES: { src: string; webp?: string; alt: string }[] = [
  { src: '/hero-lounge.jpg', webp: '/hero-lounge.webp', alt: 'Rooftop lounge vue sur Abidjan' },
  { src: '/hero-restaurant.jpg', webp: '/hero-restaurant.webp', alt: 'Restaurant gastronomique premium' },
  { src: '/hero-beach.jpg', webp: '/hero-beach.webp', alt: 'Beach Club Assinie en bord de mer' },
];

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState<{ members: number; partners: number; establishments: number } | null>(null);

  // Compteurs réels (RPC publique). Repli sur les valeurs marketing si vide.
  useEffect(() => {
    supabase.rpc('public_stats').then(({ data }) => { if (data) setStats(data as any); });
  }, []);
  const fmtCount = (n: number | undefined, fallback: string) =>
    !n ? fallback : n >= 1000 ? `${Math.floor(n / 1000)}k+` : `${n}`;

  // Hero carousel auto-advance every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Scroll reveal for sections
  useEffect(() => {
    const sections = document.querySelectorAll('.reveal-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-cream page-enter">
      <Seo
        title="Ivoire Business Club — Expériences & Avantages Exclusifs en Côte d'Ivoire"
        description="Rejoignez le club privé des expériences touristiques et lifestyle en Côte d'Ivoire. Cashback, événements privés et privilèges membres."
        path="/"
      />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#031d0f]/70 via-[#031d0f]/40 to-[#031d0f]/95 z-10" />
        {/* Carousel images */}
        {HERO_IMAGES.map((img, i) => (
          <picture key={i}>
            {img.webp && <source srcSet={img.webp} type="image/webp" />}
            <img
              src={img.src}
              alt={img.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'low'}
              decoding="async"
              className={`hero-slide ${i === currentSlide ? 'active' : ''}`}
            />
          </picture>
        ))}
        <div className="relative z-20 container mx-auto px-4 sm:px-6 text-center text-white pt-16 md:pt-20">
          <div className="inline-block bg-green-dark/60 backdrop-blur-md border border-gold/30 px-5 sm:px-8 py-3 mb-8 sm:mb-10 rounded-sm max-w-xl mx-auto">
            <span className="text-gold text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.25em] font-bold block leading-tight">
              Le club privé des expériences locales
            </span>
            <span className="text-gold text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.25em] font-bold block mt-1 leading-tight">
              et des établissements lifestyle en Côte d'Ivoire
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-10 leading-tight tracking-wide px-2 drop-shadow-lg">
            Transformez vos loisirs<br />
            <span className="italic text-gold">en opportunités d'affaires.</span>
          </h1>
          <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-10 sm:mb-16 leading-relaxed font-light px-2">Découvrez des lieux uniques, vivez des expériences exclusives et profitez d'avantages réservés aux membres.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-2xl mx-auto px-2">
            <button onClick={() => navigate('/member-registration')} className="btn-gold w-full sm:w-1/2 shadow-2xl flex flex-col items-center py-3.5 sm:py-4 px-4 sm:px-6 rounded-sm hover:scale-[1.02] transition-transform duration-300">
              <span className="text-sm sm:text-base font-bold tracking-wider">DEVENIR MEMBRE</span>
              <span className="text-[7px] sm:text-[8px] uppercase tracking-widest mt-1 opacity-90 font-medium text-center">Découvrir • Sortir • Voyager • Profiter</span>
            </button>
            <button onClick={() => navigate('/partner-registration')} className="btn-outline w-full sm:w-1/2 !border-gold/50 !text-white hover:!bg-gold hover:!text-green-dark flex flex-col items-center py-3.5 sm:py-4 px-4 sm:px-6 rounded-sm hover:scale-[1.02] transition-all duration-300">
              <span className="text-sm sm:text-base font-bold tracking-wider">DEVENIR PARTENAIRE</span>
              <span className="text-[7px] sm:text-[8px] uppercase tracking-widest mt-1 opacity-90 font-medium text-center">Attirer • Générer du trafic • Fidéliser</span>
            </button>
          </div>

          {/* Carousel indicator dots */}
          <div className="flex items-center justify-center gap-2 mt-10 sm:mt-14">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-[-1px] z-20 pointer-events-none text-green-dark" aria-hidden="true">
          <svg
            className="block h-12 w-full sm:h-16 md:h-20"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,72 C180,104 360,108 540,82 C720,56 900,10 1080,28 C1240,44 1340,78 1440,88 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* Community Target Section — chevauche le hero de 1px pour souder les blocs
          (évite le hairline/joint sous-pixel visible sur mobile entre les 2 sections) */}
      <section className="relative overflow-hidden bg-green-dark py-28 -mt-px sm:border-b sm:border-gold/20 reveal-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">Pour qui est-ce pensé ?</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-white uppercase mb-6">UNE COMMUNAUTÉ PENSÉE POUR</h2>
            <div className="w-24 h-0.5 bg-gold mx-auto mb-6" />
            <p className="text-white/60 text-sm font-light leading-relaxed">
              Le programme membre IBC réunit des profils dynamiques et exigeants autour de passions communes et d'opportunités uniques en Côte d'Ivoire.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white/90">
            <div className="hover-lift bg-white border border-gold/10 shadow-soft p-6 sm:p-8 rounded-2xl hover:shadow-premium hover:border-gold/30 transition-all duration-300 flex flex-col items-start gap-4 group">
              <div className="w-12 h-12 rounded-full bg-green-dark/5 border border-gold/20 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300">
                <Compass className="text-gold animate-pulse" size={20} />
              </div>
              <h4 className="font-serif text-lg font-bold text-green-dark group-hover:text-gold transition-colors">Les amoureux de découvertes</h4>
              <p className="text-text-muted text-[13px] leading-relaxed font-light">Explorez des destinations uniques, des hébergements insolites et des adresses secrètes à travers toute la Côte d'Ivoire.</p>
            </div>
            <div className="hover-lift bg-white border border-gold/10 shadow-soft p-6 sm:p-8 rounded-2xl hover:shadow-premium hover:border-gold/30 transition-all duration-300 flex flex-col items-start gap-4 group">
              <div className="w-12 h-12 rounded-full bg-green-dark/5 border border-gold/20 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300">
                <MapPin className="text-gold" size={20} />
              </div>
              <h4 className="font-serif text-lg font-bold text-green-dark group-hover:text-gold transition-colors">Les actifs urbains</h4>
              <p className="text-text-muted text-[13px] leading-relaxed font-light">Décompressez après vos journées intenses grâce à notre sélection exclusive de lounges, rooftops et événements After Work animés.</p>
            </div>
            <div className="hover-lift bg-white border border-gold/10 shadow-soft p-6 sm:p-8 rounded-2xl hover:shadow-premium hover:border-gold/30 transition-all duration-300 flex flex-col items-start gap-4 group">
              <div className="w-12 h-12 rounded-full bg-green-dark/5 border border-gold/20 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300">
                <Sparkles className="text-gold" size={20} />
              </div>
              <h4 className="font-serif text-lg font-bold text-green-dark group-hover:text-gold transition-colors">Les passionnés de lifestyle</h4>
              <p className="text-text-muted text-[13px] leading-relaxed font-light">Savourez le meilleur de la gastronomie locale et internationale et accédez à des expériences de bien-être haut de gamme.</p>
            </div>
            <div className="hover-lift bg-white border border-gold/10 shadow-soft p-6 sm:p-8 rounded-2xl hover:shadow-premium hover:border-gold/30 transition-all duration-300 flex flex-col items-start gap-4 group">
              <div className="w-12 h-12 rounded-full bg-green-dark/5 border border-gold/20 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300">
                <Briefcase className="text-gold" size={20} />
              </div>
              <h4 className="font-serif text-lg font-bold text-green-dark group-hover:text-gold transition-colors">Les professionnels et entrepreneurs</h4>
              <p className="text-text-muted text-[13px] leading-relaxed font-light">Connectez-vous avec un réseau sélect d'affaires, participez à des événements privés et créez des opportunités de synergie professionnelle.</p>
            </div>
            <div className="sm:col-span-2 hover-lift bg-white border border-gold/10 shadow-soft p-6 sm:p-8 rounded-2xl hover:shadow-premium hover:border-gold/30 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-6 group">
              <div className="w-12 h-12 rounded-full bg-green-dark/5 border border-gold/20 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300 flex-shrink-0">
                <Crown className="text-gold" size={20} />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-green-dark group-hover:text-gold transition-colors mb-2">Les amateurs d'expériences premium</h4>
                <p className="text-text-muted text-[13px] leading-relaxed font-light">Bénéficiez d'un service d'exception, d'accords privilégiés et d'attentions exclusives réservés à l'élite des membres du réseau.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mechanism Section */}
      <section className="py-32 bg-cream">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Mécanisme d’Excellence</span>
            <h2 className="font-serif text-4xl font-bold text-green-dark mt-4">Une Expérience en 4 Étapes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[{ title: 'Rejoignez le Club', desc: 'Créez votre profil membre en quelques minutes', icon: Users }, { title: 'Explorez', desc: 'Découvrez des établissements et expériences sélectionnés', icon: MapPin }, { title: 'Vivez l\'expérience', desc: 'Profitez d\'offres et d\'expériences exclusives chez nos partenaires', icon: Utensils }, { title: 'Profitez d\'avantages exclusifs', desc: 'Cumulez récompenses, privilèges et des avantages selon votre activité et votre statut membre', icon: CreditCard }].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="p-8 bg-white border border-gold/10 hover:border-gold/30 transition-all group">
                  <div className="w-12 h-12 bg-green-dark text-gold font-serif font-bold text-lg flex items-center justify-center mb-6">{i + 1}</div>
                  <Icon size={24} className="text-gold mb-4" />
                  <h4 className="font-serif text-lg text-green-dark font-bold mb-3">{step.title}</h4>
                  <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Partners Section (merged from Section 10) */}
      <section className="py-32 bg-cream">
        <div className="container mx-auto px-6">
          <div className="border border-gold/20 p-10 text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">LE RÉSEAU IBC</span>
            <h2 className="font-serif text-4xl font-bold text-green-dark">NOS DESTINATIONS ET PARTENAIRES</h2>
          </div>
          {/* Filtres avec icones */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {[
              { id: 'Tous', label: 'Tous', Icon: null },
              { id: 'Hébergements et Séjours', label: 'Hébergements et Séjours', Icon: Hotel },
              { id: 'Restaurants et Dining', label: 'Restaurants et Dining', Icon: Utensils },
              { id: 'Lounges et Nightlife', label: 'Lounges et Nightlife', Icon: Headphones },
              { id: 'Beach Clubs et Loisirs', label: 'Beach Clubs et Loisirs', Icon: Palmtree },
              { id: 'Bien-être et Wellness', label: 'Bien-être et Wellness', Icon: Heart }
            ].map((cat) => {
              const isActive = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#1B5E35] text-white border border-[#1B5E35]'
                      : 'bg-transparent text-[#1B5E35] border border-[#1B5E35]'
                  }`}
                >
                  {cat.Icon && <cat.Icon size={14} />}
                  {cat.label}
                </button>
              );
            })}
          </div>
          {/* Cards partenaires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { name: 'Sofitel Abidjan', cat: 'Hébergements et Séjours', zone: 'Cocody', cashback: '3-7%', img: '/assets/pullman-hotel.png' },
              { name: 'Sky Lounge', cat: 'Lounges et Nightlife', zone: 'Marcory', cashback: '5%', img: '/hero-lounge.webp' },
              { name: 'Radisson Blu', cat: 'Hébergements et Séjours', zone: 'Port-Bouet', cashback: '3-7%', img: '/assets/pullman-hotel.png' },
              { name: 'Maison Akoula', cat: 'Beach Clubs et Loisirs', zone: 'Assinie', cashback: '5%', img: '/hero-beach.webp' },
              { name: 'Le Grand Large', cat: 'Restaurants et Dining', zone: 'Zone 4', cashback: '5%', img: '/hero-restaurant.webp' },
              { name: 'Orchidée Spa', cat: 'Bien-être et Wellness', zone: 'Cocody', cashback: '5%', img: '/hero-lounge.webp' }
            ]
              .filter(place => activeFilter === 'Tous' || place.cat === activeFilter)
              .map((place, i) => (
                <div key={i} className="hover-lift bg-white border border-gold/10 rounded-xl overflow-hidden hover:border-gold/30 hover:shadow-premium transition-all duration-500 group cursor-pointer" onClick={() => navigate('/offers')}>
                  <div className="relative overflow-hidden h-40 sm:h-48">
                    <FadeImage src={LOCAL_IMGS[i % LOCAL_IMGS.length]} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <span className="absolute top-3 left-3 bg-green-dark/90 backdrop-blur-sm text-gold text-[8px] sm:text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-sm">{place.cat}</span>
                  </div>
                  <div className="p-4 sm:p-6 text-left">
                    <h4 className="font-serif text-lg sm:text-xl text-green-dark font-bold mb-2">{place.name}</h4>
                    <div className="flex items-center justify-between mt-4">
                      <span className="flex items-center gap-1.5 text-text-muted text-[10px] sm:text-xs"><MapPin size={14} className="text-gold" />{place.zone}</span>
                      <span className="bg-green-dark/5 text-green-dark text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded-sm border border-green-dark/10">Cashback {place.cashback}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="text-center">
            <button onClick={() => navigate('/establishments')} className="btn-gold flex items-center gap-3 mx-auto">
              <BookOpen size={18} />
              Voir tout le Catalogue
            </button>
          </div>
        </div>
      </section>
      
      {/* Experiences Section */}
      <section className="py-32 bg-cream">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl font-bold text-[#1B5E35] tracking-wide uppercase">EXPLOREZ NOS UNIVERS</h2>
          </div>
          <div className="flex flex-col border border-[#1B5E35]/10 rounded-lg overflow-hidden divide-y divide-[#1B5E35]/10 shadow-premium">
            {[
              { title: 'AFTER WORK ET NIGHTLIFE', desc: 'Rooftops • DJ Sets • Networking • Lounges', icon: Headphones, filterCat: 'Lounges & Nightlife' },
              { title: 'DINING ET GASTRONOMIE', desc: 'Restaurants • Cuisine ivoirienne • Diners signature', icon: Utensils, filterCat: 'Restaurants & Dining' },
              { title: 'BEACH ET LOISIRS', desc: 'Bassam • Assinie • Beach clubs • Sunset experiences', icon: Palmtree, filterCat: 'Beach Clubs & Loisirs' },
              { title: 'SÉJOURS ET ESCAPADES', desc: 'Day use • Week-end • Resorts • Villas privées', icon: Hotel, filterCat: 'Hébergements & Séjours' },
              { title: 'DIASPORA ET HERITAGE', desc: 'Retour aux sources • Culture • Traditions', icon: Globe, filterCat: 'Diaspora & Héritage' }
            ].map((exp, i) => {
              const Icon = exp.icon;
              return (
                <div
                  key={i}
                  onClick={() => navigate('/establishments', { state: { filter: exp.filterCat } })}
                  className="p-6 md:p-8 bg-[#F5F3EE] hover:bg-[#F2EFE8] transition-colors flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 group cursor-pointer"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#1B5E35] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Icon size={24} className="text-gold" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-serif text-lg font-bold text-[#1B5E35] mb-2 tracking-wide">
                      {exp.title}
                    </h4>
                    <p className="text-[#1B5E35]/80 text-sm font-medium">
                      {exp.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* LOYALTY PROGRAM - Section 4: Le Programme Membre IBC */}
      <HomeTierCards />

      {/* Témoignages — preuve sociale */}
      <section className="py-24 sm:py-32 bg-cream reveal-section">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4">Ils nous font confiance</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-green-dark">Ce que disent nos membres</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Aminata Koné', role: 'Membre Gold · Abidjan', quote: "Grâce au cashback IBC, mes sorties au restaurant et au lounge me rapportent enfin. J'ai financé un week-end à Assinie rien qu'avec ma cagnotte !" },
              { name: 'Marc-André Diomandé', role: 'Entrepreneur · Cocody', quote: "Au-delà des avantages, le réseau IBC m'a connecté à des partenaires d'affaires lors d'événements privés. Un vrai cercle de confiance." },
              { name: 'Fatou Bamba', role: 'Membre · Marcory', quote: "La conciergerie et les accès prioritaires changent tout. Je me sens vraiment membre d'un club privé, pas d'une simple appli." },
            ].map((t) => (
              <div key={t.name} className="bg-white border border-gold/10 rounded-2xl p-7 shadow-soft flex flex-col">
                <Quote size={28} className="text-gold/40 mb-4" />
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className="text-gold" fill="currentColor" />)}
                </div>
                <p className="text-text text-sm leading-relaxed flex-1 italic">« {t.quote} »</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gold/10">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=1B5E35&color=C9A84C&bold=true`}
                    alt={t.name} loading="lazy"
                    className="w-10 h-10 rounded-full border border-gold/20"
                  />
                  <div>
                    <p className="font-serif font-bold text-green-dark text-sm">{t.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
          {/* Section 7: Inscription */}
      <section className="py-24 bg-cream reveal-section">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="border border-gold/20 p-12 text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-6">Rejoignez gratuitement IBC</span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-green-dark leading-tight">
              Accès aux expériences, avantages membres et événements privés à partir de 500 FCFA / mois
            </h2>
          </div>
          <div className="mb-8">
            <p className="text-text font-medium mb-6 text-sm">Mode de paiement :</p>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-white border border-gold/10">
                <Smartphone size={20} className="text-gold" />
                <span className="text-green-dark font-medium">Mobile Money</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/member-registration')}
            className="btn-gold w-full py-5 text-sm"
          >
            Confirmez mon adhésion
          </button>
        </div>
      </section>
      
      {/* Section 8: Devenir Partenaire */}
      <section className="py-20 sm:py-32 bg-green-dark relative overflow-hidden reveal-section">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-4 sm:mb-6">LE RÉSEAU IBC</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8">Devenir Partenaire</h2>
            <p className="text-white/80 text-sm sm:text-base mb-8 sm:mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Rejoignez le réseau des établissements premium et connectez-vous à une clientèle active, fidèle et à la recherche d'expériences uniques en Côte d'Ivoire. Développez votre activité !
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-10 sm:mb-12 max-w-lg mx-auto lg:mx-0">
               <div className="bg-white/5 border border-gold/10 rounded-xl p-4 sm:p-6 text-center">
                  <p className="font-serif text-2xl sm:text-4xl font-bold text-gold">{fmtCount(stats?.members, '10k+')}</p>
                  <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-white/50 font-bold mt-2">Membres Actifs</p>
               </div>
               <div className="bg-white/5 border border-gold/10 rounded-xl p-4 sm:p-6 text-center">
                  <p className="font-serif text-2xl sm:text-4xl font-bold text-gold">{fmtCount(stats?.establishments, '500+')}</p>
                  <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-white/50 font-bold mt-2">Établissements</p>
               </div>
            </div>
            <button
              onClick={() => navigate('/partner-registration')}
              className="w-full sm:w-auto bg-[#C9A84C] text-[#1B5E35] font-bold rounded-[4px] px-8 sm:px-12 py-4 uppercase tracking-widest text-[10px] sm:text-xs hover:bg-[#F0C040] transition-colors"
            >
              REJOINDRE LE RÉSEAU IBC
            </button>
          </div>
          
          <div className="flex-1 w-full relative">
            <div className="grid grid-cols-2 gap-3 sm:gap-6 relative">
              <div className="space-y-3 sm:space-y-6 mt-8 sm:mt-12">
                <img src="/hero-restaurant.webp" alt="Restaurant gastronomique" loading="lazy" className="rounded-2xl w-full h-32 sm:h-64 object-cover shadow-lg" />
                <img src="/hero-beach.webp" alt="Beach Club Assinie" loading="lazy" className="rounded-2xl w-full h-24 sm:h-48 object-cover shadow-lg" />
              </div>
              <div className="space-y-3 sm:space-y-6">
                <img src="/assets/pullman-hotel.png" alt="Hôtel Premium" loading="lazy" className="rounded-2xl w-full h-24 sm:h-48 object-cover shadow-lg" />
                <img src="/hero-lounge.webp" alt="Rooftop Lounge" loading="lazy" className="rounded-2xl w-full h-32 sm:h-64 object-cover shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};
