import React, { useState } from 'react';
import type { Book } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { createBorrowRequest } from '../../services/api';
import { CheckCircle2, XCircle, Clock, BookOpen, AlertCircle, ShieldCheck, MapPin, Barcode } from 'lucide-react';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onBookUpdated?: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose, onBookUpdated }) => {
  const { user, setIsGoogleModalOpen, setIsCardScannerOpen, setActiveView } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestResult, setRequestResult] = useState<{
    status: 'ACCEPTED' | 'REFUSED';
    message: string;
    reservationExpiresAt?: string;
  } | null>(null);

  const isAvailable = book.availableCopies > 0;

  const handleRequestBorrow = async () => {
    if (!user) {
      setIsGoogleModalOpen(true);
      return;
    }

    if (user.status === 'PENDING_CARD_VERIFICATION') {
      setIsCardScannerOpen(true);
      return;
    }

    setIsSubmitting(true);
    setRequestResult(null);

    try {
      const res = await createBorrowRequest(user.id, book.id);
      if (res.status === 'ACCEPTED' && res.request) {
        setRequestResult({
          status: 'ACCEPTED',
          message: 'Demande acceptée automatiquement par le système ! Exemplaire physique réservé pendant 48h au guichet.',
          reservationExpiresAt: res.request.reservationExpiresAt
        });
        if (onBookUpdated) onBookUpdated();
      } else {
        setRequestResult({
          status: 'REFUSED',
          message: res.reason || 'Demande refusée par le système.'
        });
      }
    } catch (err: any) {
      setRequestResult({
        status: 'REFUSED',
        message: err.message || 'Demande refusée.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in duration-200 my-8">
        
        {/* Top Banner Image */}
        <div className="h-48 bg-slate-900 relative overflow-hidden">
          <img
            src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
            alt={book.title}
            className="w-full h-full object-cover opacity-60"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="bg-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              {book.category}
            </span>
            <h2 className="text-xl font-bold font-sans mt-1 line-clamp-1">{book.title}</h2>
            <p className="text-xs text-slate-300">Par {book.author}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Description */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Résumé de l'ouvrage</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{book.description}</p>
          </div>

          {/* Bibliographic Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[11px] text-slate-400">Éditeur :</span>
              <p className="font-semibold text-slate-900 truncate">{book.publisher}</p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">Année :</span>
              <p className="font-semibold text-slate-900 font-mono">{book.publishYear}</p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">ISBN :</span>
              <p className="font-semibold text-slate-900 font-mono truncate">{book.isbn}</p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">Prix Référence :</span>
              <p className="font-bold text-emerald-800 font-mono">{book.priceDh} DH</p>
            </div>
          </div>

          {/* Physical Copies Inventory Counter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Inventaire des exemplaires physiques</span>
              <span className="text-[11px] font-normal text-slate-500 font-mono">
                {book.availableCopies} sur {book.totalCopies} disponibles
              </span>
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-xl font-bold text-slate-900 font-mono">{book.totalCopies}</span>
                <p className="text-[11px] text-slate-500">Exemplaires Totaux</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-xl font-bold text-emerald-700 font-mono">{book.availableCopies}</span>
                <p className="text-[11px] text-emerald-800">Disponibles</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <span className="text-xl font-bold text-amber-700 font-mono">{book.borrowedCopies}</span>
                <p className="text-[11px] text-amber-800">Empruntés / Réservés</p>
              </div>
            </div>

            {/* Privacy note: Personal borrower info strictly hidden */}
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Conformément aux règles de confidentialité, l'identité des emprunteurs n'est jamais divulguée.
              </span>
            </div>
          </div>

          {/* Automated Request Decision Result Box */}
          {requestResult && (
            <div className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
              requestResult.status === 'ACCEPTED'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-start gap-2.5">
                {requestResult.status === 'ACCEPTED' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {requestResult.status === 'ACCEPTED' ? 'Demande Acceptée Automatiquement' : 'Demande Refusée par le Système'}
                  </p>
                  <p className="mt-0.5">{requestResult.message}</p>
                  {requestResult.reservationExpiresAt && (
                    <p className="mt-2 font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100/70 p-2 rounded">
                      ⏰ Date limite de récupération au guichet : {new Date(requestResult.reservationExpiresAt).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Fermer
          </button>

          {!requestResult?.status && (
            <button
              disabled={!isAvailable || isSubmitting}
              onClick={handleRequestBorrow}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors rounded-xl shadow-xs flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Vérification des droits...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  Soumettre une demande d'emprunt
                </>
              )}
            </button>
          )}

          {requestResult?.status === 'ACCEPTED' && (
            <button
              onClick={() => {
                onClose();
                setActiveView('STUDENT_SPACE');
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
            >
              Voir mon espace étudiant
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
