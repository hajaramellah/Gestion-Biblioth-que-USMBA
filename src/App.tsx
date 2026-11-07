import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { GoogleAuthModal } from './components/auth/GoogleAuthModal';
import { CardScannerModal } from './components/auth/CardScannerModal';
import { BookCatalog } from './components/catalog/BookCatalog';
import { StudentDashboard } from './components/student/StudentDashboard';
import { LibrarianDashboard } from './components/librarian/LibrarianDashboard';
import { BookOpen, ShieldCheck, Heart } from 'lucide-react';

function MainContent() {
  const { activeView } = useAuth();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {activeView === 'CATALOG' && <BookCatalog />}
      {activeView === 'STUDENT_SPACE' && <StudentDashboard />}
      {activeView === 'LIBRARIAN_SPACE' && <LibrarianDashboard />}
    </main>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-8 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
            U
          </div>
          <span className="font-bold text-slate-900">Université Sidi Mohamed Ben Abdellah (USMBA)</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
          <span>Fès, Maroc</span>
          <span>·</span>
          <span>Domaine Institutionnel : @usmba.ac.ma</span>
          <span>·</span>
          <span>Gestion des Livres Physiques</span>
        </div>

        <div className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} USMBA BiblioEngine. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 font-sans">
        <div>
          <Header />
          <MainContent />
        </div>
        <Footer />

        {/* Global Modals */}
        <GoogleAuthModal />
        <CardScannerModal />
      </div>
    </AuthProvider>
  );
}
