import { isTabEnabled } from './config';
import React, { lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LockedFeatureModal from './components/LockedFeatureModal';
import LoginPage from './components/LoginPage';
import VisiMisiSection from './components/VisiMisiSection';
const BeritaSection = lazy(() => import('./components/BeritaSection'));
const PrestasiSection = lazy(() => import('./components/PrestasiSection'));
const AgendaSection = lazy(() => import('./components/AgendaSection'));
const DonasiSection = lazy(() => import('./components/DonasiSection'));
const DonasiVerifikasi = lazy(() => import('./components/DonasiVerifikasi'));
const AkunSection = lazy(() => import('./components/AkunSection'));
const UktSection = lazy(() => import('./components/UktSection'));
import Footer from './components/Footer';
import { CheckCircle, Info, AlertCircle } from 'lucide-react';

function MainContent() {
  const { activeTab, toast, isAdmin } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Navbar with Role Indicator */}
      <Navbar />

      {/* Access Denied Modal for Locked Features */}
      <LockedFeatureModal />

      {/* User Login Portal Modal */}
      <LoginPage />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce no-print">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-amber-500/50 text-slate-900 text-xs shadow-2xl backdrop-blur-md">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-teal-600" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            )}
            <span className="font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Active Section Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="py-16 text-center text-sm text-slate-500">Memuat…</div>}>
        {activeTab === 'visi' && <VisiMisiSection />}
        {activeTab === 'berita' && <BeritaSection />}
        {activeTab === 'prestasi' && <PrestasiSection />}
        {activeTab === 'agenda' && isTabEnabled('agenda') && <AgendaSection />}
        {activeTab === 'donasi' && <DonasiSection />}
        {activeTab === 'ukt' && <UktSection />}
        {activeTab === 'verifikasi' && isAdmin && <DonasiVerifikasi />}
        {activeTab === 'akun' && isAdmin && <AkunSection />}
        </Suspense>
      </main>

      {/* Martial Arts Academy Footer */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
