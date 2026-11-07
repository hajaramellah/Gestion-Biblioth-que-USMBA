import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, User as UserIcon, LogOut, Shield, ScanLine, Bell, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    user, 
    activeView, 
    setActiveView, 
    setIsGoogleModalOpen, 
    setIsCardScannerOpen,
    logout, 
    switchRole,
    notifications 
  } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Notice for University Identity & Role Quick Switcher */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex items-center justify-between font-mono border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Université Sidi Mohamed Ben Abdellah (USMBA)
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">Domaine requis: @usmba.ac.ma</span>
        </div>

        {/* Quick Role Toggle (Student vs Librarian Demo Selector) */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] hidden sm:inline">Mode Démo / Test :</span>
          <div className="bg-slate-800 rounded-md p-0.5 flex items-center gap-1 border border-slate-700">
            <button
              onClick={() => switchRole('STUDENT')}
              className={`px-2.5 py-0.5 rounded text-[11px] transition-colors whitespace-nowrap ${
                user?.role === 'STUDENT'
                  ? 'bg-emerald-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vue Étudiant
            </button>
            <button
              onClick={() => switchRole('LIBRARIAN')}
              className={`px-2.5 py-0.5 rounded text-[11px] transition-colors whitespace-nowrap ${
                user?.role === 'LIBRARIAN'
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vue Bibliothécaire
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Zone Header Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single element brand title */}
        <button
          onClick={() => setActiveView('CATALOG')}
          className="flex items-center gap-2 text-left group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-sans">
              Biblio<span className="text-emerald-600">USMBA</span>
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 single-line nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveView('CATALOG')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeView === 'CATALOG'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Catalogue Général
          </button>

          <button
            onClick={() => {
              if (!user) {
                setIsGoogleModalOpen(true);
              } else if (user.status === 'PENDING_CARD_VERIFICATION') {
                setIsCardScannerOpen(true);
              } else {
                setActiveView('STUDENT_SPACE');
              }
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeView === 'STUDENT_SPACE'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Espace Étudiant
          </button>

          <button
            onClick={() => {
              if (!user || user.role !== 'LIBRARIAN') {
                switchRole('LIBRARIAN');
              } else {
                setActiveView('LIBRARIAN_SPACE');
              }
            }}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
              activeView === 'LIBRARIAN_SPACE'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Shield className="w-4 h-4 text-indigo-600" />
            Espace Bibliothécaire
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Card Scan Status Indicator if Pending */}
              {user.role === 'STUDENT' && user.status === 'PENDING_CARD_VERIFICATION' && (
                <button
                  onClick={() => setIsCardScannerOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <ScanLine className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  Scanner Carte
                </button>
              )}

              {/* User Profile dropdown info */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {user.displayName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono truncate max-w-[140px]">
                    {user.cne || user.email.split('@')[0]}
                  </span>
                </div>

                <div className="relative group">
                  <button className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 overflow-hidden font-bold text-sm hover:ring-2 hover:ring-emerald-500 transition-all">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      user.displayName.charAt(0)
                    )}
                  </button>

                  {/* Account Popover Menu */}
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 hidden group-hover:block z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.displayName}</p>
                      <p className="text-xs text-slate-500 font-mono truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1 text-[11px]">
                        <span className={`px-2 py-0.5 rounded font-medium ${user.role === 'LIBRARIAN' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {user.role === 'LIBRARIAN' ? 'Bibliothécaire' : 'Étudiant USMBA'}
                        </span>
                        {user.status === 'ACTIVE' && (
                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px]">
                            Identité Vérifiée
                          </span>
                        )}
                      </div>
                    </div>

                    {user.role === 'STUDENT' && user.status === 'PENDING_CARD_VERIFICATION' && (
                      <button
                        onClick={() => setIsCardScannerOpen(true)}
                        className="w-full text-left px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 font-medium flex items-center gap-2"
                      >
                        <ScanLine className="w-4 h-4" />
                        Vérifier carte d'étudiant
                      </button>
                    )}

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2 border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsGoogleModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              Se connecter avec Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
