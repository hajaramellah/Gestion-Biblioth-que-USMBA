import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, AlertTriangle, ArrowRight, Lock, CheckCircle2, Building2 } from 'lucide-react';

export const GoogleAuthModal: React.FC = () => {
  const { isGoogleModalOpen, setIsGoogleModalOpen, loginGoogle, authError, setAuthError } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isGoogleModalOpen) return null;

  const handleSelectPreset = async (email: string, displayName: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await loginGoogle(email, displayName);
    } catch (e) {
      // Auth error handled by context
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    setIsLoading(true);
    setAuthError(null);
    try {
      await loginGoogle(customEmail.trim());
    } catch (e) {
      // Auth error handled by context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Google Workspace Header Banner */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
            </div>
            <button
              onClick={() => setIsGoogleModalOpen(false)}
              className="text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
          <h2 className="text-xl font-bold font-sans">Se connecter avec Google USMBA</h2>
          <p className="text-xs text-slate-400 mt-1">
            Authentification unique via le compte institutionnel <span className="text-emerald-400 font-mono">@usmba.ac.ma</span>
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Domain Constraint Notice */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Vérification de domaine obligatoire</p>
              <p className="text-emerald-700 mt-0.5">
                Seules les adresses se terminant exactement par <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-mono">@usmba.ac.ma</code> sont autorisées à accéder aux services de la bibliothèque.
              </p>
            </div>
          </div>

          {/* Server Domain Rejection Error Box */}
          {authError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-950">Accès Refusé par le Serveur</p>
                <p className="mt-1 text-rose-800">{authError}</p>
              </div>
            </div>
          )}

          {/* Preset Comptes Universitaires autorisés */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Choisissez un compte Google USMBA de démonstration :
            </label>
            <div className="space-y-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectPreset('hajar.amellah@usmba.ac.ma', 'Hajar Amellah')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    HA
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Hajar Amellah (Étudiante)</p>
                    <p className="text-[11px] font-mono text-slate-500">hajar.amellah@usmba.ac.ma</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectPreset('youssef.benjelloun@usmba.ac.ma', 'Youssef Benjelloun')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                    YB
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Youssef Benjelloun (Nouveau - Scan Carte requis)</p>
                    <p className="text-[11px] font-mono text-slate-500">youssef.benjelloun@usmba.ac.ma</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectPreset('bibliothecaire.usmba@usmba.ac.ma', 'Mme. Jamila Bennani')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">
                    JB
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Mme Jamila Bennani (Chef Bibliothécaire)</p>
                    <p className="text-[11px] font-mono text-slate-500">bibliothecaire.usmba@usmba.ac.ma</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <hr className="w-full border-slate-200" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase">ou Saisissez un email</span>
          </div>

          {/* Test Non-USMBA Email Or Custom USMBA Email */}
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Adresse Google Universitaire
              </label>
              <input
                type="email"
                required
                placeholder="prenom.nom@usmba.ac.ma"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
              />
            </div>

            {/* Test button for non-USMBA email failure */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset('etudiant.externe@gmail.com', 'Compte Personal Gmail')}
                className="text-[11px] text-rose-600 hover:underline font-medium text-left"
              >
                Tester un compte Gmail interdit (ex: @gmail.com)
              </button>

              <button
                type="submit"
                disabled={isLoading || !customEmail}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
              >
                {isLoading ? 'Vérification...' : 'Continuer'}
              </button>
            </div>
          </form>

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            OAuth 2.0 USMBA SSO
          </span>
          <span>Université Sidi Mohamed Ben Abdellah</span>
        </div>

      </div>
    </div>
  );
};
