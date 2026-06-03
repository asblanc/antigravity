import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import type { Member } from './lib/mock-api';
import { loginUser, registerMember, logoutUser, subscribeToAuthState, getCurrentMemberProfile, loginWithGoogle, loginWithFacebook, loginWithMicrosoft, sendPhoneOTP, verifyPhoneOTP, sendPasswordReset, initRecaptcha } from './lib/auth.service';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomeView } from './pages/HomeView';
import { EstablishmentsView } from './pages/EstablishmentsView';
import { MemberRegistrationView } from './pages/MemberRegistrationView';
import { PartnerRegistrationView } from './pages/PartnerRegistrationView';
import { NotFoundView } from './pages/NotFoundView';
import { LegalPageView } from './components/LegalPageView';
import ibcLogo from "./assets/ibc-logo.webp";

// Code splitting
const PartnerDashboardView = React.lazy(() => import('./components/PartnerDashboardView').then(module => ({ default: module.PartnerDashboardView })));
const AdminDashboardView = React.lazy(() => import('./components/AdminDashboardView').then(module => ({ default: module.AdminDashboardView })));
const MemberDashboardView = React.lazy(() => import('./components/MemberDashboardView').then(module => ({ default: module.MemberDashboardView })));
const MembersListView = React.lazy(() => import('./components/MembersListView').then(module => ({ default: module.MembersListView })));
const AdminImportView = React.lazy(() => import('./components/AdminImportView').then(module => ({ default: module.AdminImportView })));
const LoginView = React.lazy(() => import('./components/LoginView').then(module => ({ default: module.LoginView })));

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<Member | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 50); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Remonte en haut de page à chaque changement de route (UX : on ne reste pas
  // bloqué à la position de scroll de la page précédente).
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (authUser: any) => {
      if (authUser) {
        try {
          // Restaure la session sans forcer de redirection : l'utilisateur
          // reste sur la page consultée (les redirections post-login sont
          // gérées par handleLogin / handleRegister / les handlers OAuth).
          const profile = await getCurrentMemberProfile(authUser.uid);
          if (profile) setUser(profile);
        } catch (e) { console.error('Profile load error:', e); }
      } else { setUser(null); }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, password?: string) => {
    try {
      const userData = await loginUser(email, password || 'Demo1234!');
      setUser(userData);
      const role = (userData as any).role;
      if (role === 'partner') navigate('/partner-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
      else navigate('/member-dashboard');
      toast.success(`Bienvenue, ${userData.name} !`);
    } catch (error: any) {
      // Re-throw so LoginView can display inline error messages
      throw error;
    }
  };

  const handleRegister = async (data: any) => {
    try {
      const userData = await registerMember({
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name,
        email: data.email,
        password: data.password,
        whatsapp: data.phone || data.whatsapp || '',
        plan: data.plan || 'bronze',
        paymentMethod: data.paymentMethod,
        photoFile: data.photoFile || null,
        referrerId: data.referrerId,
      });
      setUser(userData);
      navigate('/member-dashboard');
      toast.success('Bienvenue dans le Club IBC !');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || "Erreur lors de l'inscription. Veuillez réessayer.");
      throw error;
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate('/');
    toast.success('À bientôt !');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <img src={ibcLogo} alt="IBC" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-green-dark font-serif text-sm uppercase tracking-widest">Ivoire Business Club</p>
        </div>
      </div>
    );
  }

  const isDashboard = location.pathname.includes('dashboard');

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Toaster position="top-center" toastOptions={{ className: 'font-sans text-sm' }} />
      {!isDashboard && (
        <Navbar
          scrolled={scrolled}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          currentView={location.pathname}
          user={user}
        />
      )}
      <React.Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><Loader2 className="animate-spin text-gold" size={32} /></div>}>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/member-registration" element={<MemberRegistrationView onRegister={handleRegister} />} />
          <Route path="/partner-registration" element={<PartnerRegistrationView />} />
          <Route path="/establishments" element={<EstablishmentsView />} />
          <Route path="/offers" element={<EstablishmentsView />} />
          <Route path="/login" element={<LoginView
            onLogin={handleLogin}
            onLoginGoogle={async () => { const u = await loginWithGoogle(); setUser(u); navigate(u.role === 'partner' ? '/partner-dashboard' : u.role === 'admin' ? '/admin-dashboard' : '/member-dashboard'); toast.success(`Bienvenue, ${u.name} !`); }}
            onLoginFacebook={async () => { const u = await loginWithFacebook(); setUser(u); navigate('/member-dashboard'); toast.success(`Bienvenue, ${u.name} !`); }}
            onLoginMicrosoft={async () => { const u = await loginWithMicrosoft(); setUser(u); navigate('/member-dashboard'); toast.success(`Bienvenue, ${u.name} !`); }}
            onSendPhoneOTP={async (phone) => { initRecaptcha(); const c = await sendPhoneOTP(phone); return c; }}
            onVerifyPhoneOTP={async (c, otp) => { const u = await verifyPhoneOTP(c, otp); setUser(u); navigate('/member-dashboard'); toast.success(`Bienvenue, ${u.name} !`); }}
            onResetPassword={async (email) => { await sendPasswordReset(email); }}
          />} />
          <Route path="/member-dashboard" element={user ? <MemberDashboardView user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/partner-dashboard" element={user && (user as any).role === 'partner' ? <PartnerDashboardView onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/admin-dashboard" element={user && (user as any).role === 'admin' ? <AdminDashboardView onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/admin-members" element={user && (user as any).role === 'admin' ? <MembersListView onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/admin-import" element={user && (user as any).role === 'admin' ? <AdminImportView onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/legal/mentions-legales" element={<LegalPageView title="Mentions Légales" lastUpdated="1 Janvier 2026" content={<><p><strong>Éditeur du site :</strong> Ivoire Business Club</p><p><strong>Siège social :</strong> Cocody Ambassades, Abidjan, Côte d'Ivoire</p><p><strong>Contact :</strong> contact@ibc.ci</p></>} />} />
          <Route path="/legal/confidentialite" element={<LegalPageView title="Politique de Confidentialité" lastUpdated="1 Janvier 2026" content={<><p>Nous accordons une grande importance à la confidentialité de vos données personnelles.</p><p>Toutes les données collectées (nom, email, téléphone) sont sécurisées et ne sont partagées avec nos partenaires qu'avec votre accord explicite lors de réservations ou paiements.</p></>} />} />
          <Route path="/legal/cgu" element={<LegalPageView title="Conditions Générales d'Utilisation" lastUpdated="1 Janvier 2026" content={<><p>En utilisant le service Ivoire Business Club, vous acceptez nos conditions d'utilisation.</p><p>Le cashback est soumis à la validation par nos établissements partenaires et ne peut être échangé contre des espèces en dehors des conditions prévues par l'application.</p></>} />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </React.Suspense>
      {!isDashboard && <Footer />}
    </div>
  );
};

export default App;
