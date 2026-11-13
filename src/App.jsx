import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import RoleBanner from './components/RoleBanner';
import LockedFeatureModal from './components/LockedFeatureModal';
import AdminCodeModal from './components/AdminCodeModal';
import VisiMisiSection from './components/VisiMisiSection';
import BeritaSection from './components/BeritaSection';
import PrestasiSection from './components/PrestasiSection';
import AgendaSection from './components/AgendaSection';
import DonasiSection from './components/DonasiSection';
import UktSection from './components/UktSection';
import Footer from './components/Footer';
import { CheckCircle, Info, AlertCircle } from 'lucide-react';

function MainContent() {
  const { activeTab, toast } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Navbar with Role Indicator */}
      <Navbar />

      {/* RBAC Simulation Control Banner */}
      <RoleBanner />

      {/* Access Denied Modal for Locked Features */}
      <LockedFeatureModal />

      {/* Admin Code Verification Modal */}
      <AdminCodeModal />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce no-print">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-amber-500/50 text-white text-xs shadow-2xl backdrop-blur-md">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            )}
            <span className="font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Active Section Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'visi' && <VisiMisiSection />}
        {activeTab === 'berita' && <BeritaSection />}
        {activeTab === 'prestasi' && <PrestasiSection />}
        {activeTab === 'agenda' && <AgendaSection />}
        {activeTab === 'donasi' && <DonasiSection />}
        {activeTab === 'ukt' && <UktSection />}
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
