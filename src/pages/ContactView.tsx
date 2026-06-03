import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Seo } from '../components/Seo';
import { supabase } from '../lib/supabase';
import { MapPin, Phone, Mail, MessageSquare, Send, Clock } from 'lucide-react';

const CHANNELS = [
  { icon: MapPin, label: 'Adresse', value: 'Cocody Ambassades, Abidjan — Côte d\'Ivoire' },
  { icon: Phone, label: 'Téléphone', value: '+225 07 04 14 13 13', href: 'tel:+2250704141313' },
  { icon: Mail, label: 'E-mail', value: 'contact@ibc.ci', href: 'mailto:contact@ibc.ci' },
  { icon: MessageSquare, label: 'WhatsApp', value: '+225 07 04 14 13 13', href: 'https://wa.me/2250704141313' },
];

export const ContactView: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Nom, e-mail et message sont requis.');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || null,
        message: form.message.trim(),
      });
      if (error) throw error;
      toast.success('Message envoyé ! Notre équipe vous répondra rapidement.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      toast.error(err.message || "Échec de l'envoi. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-28 pb-20">
      <Seo
        title="Contact — Ivoire Business Club"
        description="Contactez l'équipe d'Ivoire Business Club : adhésion, partenariats, support membres. Abidjan, Côte d'Ivoire."
        path="/contact"
      />

      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold block mb-3">Contact</span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-green-dark mb-4">Parlons de votre expérience IBC</h1>
          <p className="text-text-muted text-base md:text-lg">
            Une question sur l'adhésion, un projet de partenariat ou besoin d'assistance ? Notre équipe vous répond.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
          {/* Coordonnées */}
          <div className="space-y-4">
            {CHANNELS.map((c) => {
              const inner = (
                <div className="bg-white border border-gold/15 rounded-2xl p-5 flex items-start gap-4 hover:border-gold/30 hover:shadow-soft transition-all">
                  <div className="w-11 h-11 rounded-xl bg-green-dark/5 flex items-center justify-center shrink-0 border border-gold/20">
                    <c.icon size={20} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">{c.label}</p>
                    <p className="text-green-dark font-semibold text-sm mt-0.5">{c.value}</p>
                  </div>
                </div>
              );
              return c.href
                ? <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
                : <div key={c.label}>{inner}</div>;
            })}
            <div className="bg-green-dark rounded-2xl p-5 flex items-start gap-4 text-white">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-gold/20">
                <Clock size={20} className="text-gold" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gold font-bold">Horaires</p>
                <p className="text-white/80 text-sm mt-0.5">Lun – Sam · 8h30 – 19h00</p>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="bg-white border border-gold/15 rounded-[28px] p-7 md:p-9 shadow-soft space-y-5">
            <h2 className="font-serif text-2xl font-bold text-green-dark">Envoyez-nous un message</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Nom complet *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Votre nom"
                  className="w-full mt-1 bg-cream/40 border border-gold/15 rounded-lg px-3 py-2.5 text-sm text-green-dark outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">E-mail *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vous@email.com"
                  className="w-full mt-1 bg-cream/40 border border-gold/15 rounded-lg px-3 py-2.5 text-sm text-green-dark outline-none focus:border-gold" />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Sujet</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Adhésion, partenariat, support…"
                className="w-full mt-1 bg-cream/40 border border-gold/15 rounded-lg px-3 py-2.5 text-sm text-green-dark outline-none focus:border-gold" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Message *</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Votre message…" rows={5}
                className="w-full mt-1 bg-cream/40 border border-gold/15 rounded-lg px-3 py-2.5 text-sm text-green-dark outline-none focus:border-gold resize-none" />
            </div>
            <button type="submit" disabled={sending} className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-60">
              {sending ? 'Envoi…' : <>Envoyer le message <Send size={14} /></>}
            </button>
            <p className="text-[10px] text-text-muted text-center">Vos données ne sont utilisées que pour traiter votre demande.</p>
          </form>
        </div>

        {/* Carte / plan d'accès */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-gold" />
            <h2 className="font-serif text-xl font-bold text-green-dark">Nous trouver</h2>
          </div>
          <div className="rounded-[28px] overflow-hidden border border-gold/15 shadow-soft">
            <iframe
              title="Localisation Ivoire Business Club — Cocody Ambassades, Abidjan"
              src="https://www.google.com/maps?q=Cocody%20Ambassades%2C%20Abidjan%2C%20C%C3%B4te%20d'Ivoire&z=15&hl=fr&output=embed"
              width="100%"
              height="400"
              loading="lazy"
              style={{ border: 0 }}
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
