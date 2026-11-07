import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitAcquisitionProposal } from '../../services/api';
import { PlusCircle, Bookmark, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSubmitted: () => void;
}

export const AcquisitionProposalModal: React.FC<Props> = ({ onClose, onSubmitted }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [theme, setTheme] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title || !author) {
      setError('Veuillez renseigner au moins le titre et l\'auteur du livre.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitAcquisitionProposal({
        studentId: user.id,
        title: title.trim(),
        author: author.trim(),
        theme: theme.trim() || 'Général',
        referenceUrl: referenceUrl.trim() || undefined
      });
      onSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Échec de la soumission de la proposition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-sans">Proposer l'Acquisition d'un Livre</h3>
              <p className="text-xs text-slate-400">Demandez l'achat d'un nouvel ouvrage pour la bibliothèque</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Titre complet du livre *
            </label>
            <input
              type="text"
              required
              placeholder="ex: Deep Learning with PyTorch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Auteur(s) *
            </label>
            <input
              type="text"
              required
              placeholder="ex: Eli Stevens, Luca Antiga"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Thème / Domaine d'études
            </label>
            <input
              type="text"
              placeholder="ex: Intelligence Artificielle & Deep Learning"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Lien de référence ou ISBN (Facultatif)
            </label>
            <input
              type="url"
              placeholder="https://... ou numéro d'éditeur"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {isSubmitting ? 'Envoi...' : 'Soumettre la proposition'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
