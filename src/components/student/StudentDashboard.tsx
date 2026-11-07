import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { BorrowRecord, BorrowRequest, AcquisitionProposal, Sanction, Book } from '../../types';
import { getBorrows, getRequests, getProposals, getSanctions, getAiRecommendations } from '../../services/api';
import { 
  BookOpen, Clock, CheckCircle2, AlertTriangle, ShieldCheck, 
  Sparkles, Bookmark, Bell, Calendar, Scan, Plus, ChevronRight, XCircle
} from 'lucide-react';
import { AcquisitionProposalModal } from './AcquisitionProposalModal';

export const StudentDashboard: React.FC = () => {
  const { user, setIsCardScannerOpen, setActiveView } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'BORROWS' | 'REQUESTS' | 'RECOMMENDATIONS' | 'PROPOSALS' | 'NOTIFICATIONS'>('BORROWS');
  
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [proposals, setProposals] = useState<AcquisitionProposal[]>([]);
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [aiRecs, setAiRecs] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [user]);

  async function loadStudentData() {
    if (!user) return;
    setLoading(true);
    try {
      const [b, r, p, s, recs] = await Promise.all([
        getBorrows(user.id),
        getRequests(user.id),
        getProposals(user.id),
        getSanctions(user.id),
        getAiRecommendations(user.major)
      ]);
      setBorrows(b);
      setRequests(r);
      setProposals(p);
      setSanctions(s);
      setAiRecs(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const activeBorrows = borrows.filter(b => b.status === 'ACTIVE' || b.status === 'OVERDUE');
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const acceptedRequests = requests.filter(r => r.status === 'ACCEPTED');
  const activeSanctions = sanctions.filter(s => s.status === 'ACTIVE');

  return (
    <div className="space-y-8 pb-16">
      
      {/* Student Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
              {user.firstName ? user.firstName.charAt(0) : user.displayName.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 font-sans">{user.displayName}</h1>
                {user.status === 'ACTIVE' ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Identité Vérifiée USMBA
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    Non vérifiée
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {user.email} · CNE: <span className="font-bold text-slate-900">{user.cne || 'Non vérifié'}</span> · CIN: {user.cin || 'N/A'}
              </p>
              <p className="text-xs text-emerald-800 font-medium">
                {user.faculty || 'Université Sidi Mohamed Ben Abdellah'} — {user.major || 'Licence'}
              </p>
            </div>
          </div>

          {/* Verification / Card scan action if pending */}
          {user.status === 'PENDING_CARD_VERIFICATION' && (
            <button
              onClick={() => setIsCardScannerOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <Scan className="w-4 h-4" />
              Scanner Carte d'étudiant
            </button>
          )}
        </div>

        {/* Suspension Alert Box if Student is Suspended or Banned */}
        {user.isBanPermanent && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-950 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Interdiction Définitive d'Emprunt</p>
              <p className="mt-0.5">
                Votre compte à fait l'objet d'une sanction permanente suite à des récidives de suspensions. Contactez la direction de la bibliothèque.
              </p>
            </div>
          </div>
        )}

        {user.suspendedUntil && new Date(user.suspendedUntil) > new Date() && !user.isBanPermanent && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Compte Temporairement Suspendu</p>
              <p className="mt-0.5">
                Votre droit d'emprunt est suspendu jusqu'au <span className="font-mono font-bold">{new Date(user.suspendedUntil).toLocaleDateString('fr-FR')}</span> suite aux retards ou dégradations constatés.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard 4 KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Emprunts En Cours</span>
              <BookOpen className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{activeBorrows.length} / 3</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Quota maximum : 3 livres</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Réservations Acceptées</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-extrabold text-emerald-700 font-mono">{acceptedRequests.length}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Prêtes au guichet (48h)</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Demandes en attente</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-2xl font-extrabold text-amber-700 font-mono">{pendingRequests.length}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Traitement automatique</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Compteur de Retards</span>
              <AlertTriangle className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{user.delayCount} / 3</span>
            <p className="text-[11px] text-slate-500 mt-0.5">3e retard = Suspension 7j</p>
          </div>

        </div>
      </div>

      {/* Main Tabs Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          
          <button
            onClick={() => setActiveTab('BORROWS')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
              activeTab === 'BORROWS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Mes Emprunts ({activeBorrows.length})
          </button>

          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
              activeTab === 'REQUESTS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Mes Réservations ({requests.length})
          </button>

          <button
            onClick={() => setActiveTab('RECOMMENDATIONS')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
              activeTab === 'RECOMMENDATIONS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Recommandations IA
          </button>

          <button
            onClick={() => setActiveTab('PROPOSALS')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
              activeTab === 'PROPOSALS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Propositions ({proposals.length})
          </button>

        </div>

        {/* Add acquisition proposal button */}
        <button
          onClick={() => setIsProposalModalOpen(true)}
          className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs hidden sm:flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Proposer un livre
        </button>
      </div>

      {/* Tab 1: Mes Emprunts Actifs & Historique */}
      {activeTab === 'BORROWS' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Livres Physiques Actuellement Empruntés
          </h2>

          {activeBorrows.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">Vous n'avez aucun emprunt physique actif en ce moment.</p>
              <button
                onClick={() => setActiveView('CATALOG')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl"
              >
                Parcourir le catalogue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBorrows.map((borrow) => {
                const now = new Date();
                const dueDate = new Date(borrow.expectedReturnDate);
                const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                const isOverdue = daysRemaining < 0;

                return (
                  <div key={borrow.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={borrow.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                        alt={borrow.bookTitle}
                        className="w-16 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {borrow.barcode}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{borrow.bookTitle}</h3>
                        <p className="text-xs text-slate-500">{borrow.bookAuthor}</p>
                        <p className="text-[11px] text-slate-400 font-mono">Rayon : {borrow.shelfLocation}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400">Date d'emprunt :</span>
                        <p className="font-mono text-slate-800">{new Date(borrow.borrowedAt).toLocaleDateString('fr-FR')}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400">Date de retour prévue :</span>
                        <p className={`font-mono font-bold ${isOverdue ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {dueDate.toLocaleDateString('fr-FR')} {isOverdue ? `(Retard ${Math.abs(daysRemaining)}j)` : `(${daysRemaining}j restant)`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Mes Réservations & Demandes */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Historique de vos Demandes de Réservation
          </h2>

          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <p className="text-xs text-slate-500">Aucune demande enregistrée.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                    <tr>
                      <th className="p-4">Ouvrage</th>
                      <th className="p-4">Date Demande</th>
                      <th className="p-4">Statut Décision</th>
                      <th className="p-4">Motif / Limite Récupération</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{r.bookTitle}</p>
                          <p className="text-[11px] text-slate-500">{r.bookAuthor}</p>
                        </td>
                        <td className="p-4 font-mono text-slate-600">
                          {new Date(r.requestedAt).toLocaleString('fr-FR')}
                        </td>
                        <td className="p-4">
                          {r.status === 'ACCEPTED' ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md text-[10px]">
                              ACCEPTÉE AUTOMATIQUEMENT
                            </span>
                          ) : r.status === 'REFUSED' ? (
                            <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-md text-[10px]">
                              REFUSÉE
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-md text-[10px]">
                              {r.status}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-600 max-w-xs">
                          <p className="line-clamp-2">{r.autoDecisionReason}</p>
                          {r.reservationExpiresAt && (
                            <p className="text-[11px] font-mono text-emerald-700 font-bold mt-0.5">
                              Expire le : {new Date(r.reservationExpiresAt).toLocaleString('fr-FR')}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recommandations Intelligentes IA */}
      {activeTab === 'RECOMMENDATIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Recommandations Personnalisées par l'IA
            </h2>
            <span className="text-xs text-slate-500">Basé sur la filière: {user.major || 'Licence'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {aiRecs.map((rec) => (
              <div key={rec.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    {rec.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{rec.title}</h3>
                  <p className="text-xs text-slate-500">Par {rec.author}</p>
                </div>

                <button
                  onClick={() => setActiveView('CATALOG')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                >
                  Voir dans le catalogue
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Propositions d'Acquisition */}
      {activeTab === 'PROPOSALS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Vos Propositions d'Acquisition Soumises
            </h2>
            <button
              onClick={() => setIsProposalModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl"
            >
              + Proposer un nouveau livre
            </button>
          </div>

          {proposals.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <p className="text-xs text-slate-500">Vous n'avez soumis aucune proposition d'acquisition pour l'instant.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.map((prop) => (
                <div key={prop.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{prop.title}</h3>
                    <p className="text-xs text-slate-500">Auteur : {prop.author} · Thème : {prop.theme}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">Soumis le : {new Date(prop.submittedAt).toLocaleDateString('fr-FR')}</p>
                  </div>

                  <div className="text-right">
                    {prop.status === 'PENDING' && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-md">
                        EN COURS D'EXAMEN
                      </span>
                    )}
                    {prop.status === 'ACCEPTED' && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-md">
                        ACCEPTÉE PAR LE BIBLIOTHÉCAIRE
                      </span>
                    )}
                    {prop.status === 'REFUSED' && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-3 py-1 rounded-md">
                        REFUSÉE
                      </span>
                    )}
                    {prop.librarianNote && (
                      <p className="text-xs text-slate-600 mt-1 italic max-w-xs">"{prop.librarianNote}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Proposal */}
      {isProposalModalOpen && (
        <AcquisitionProposalModal
          onClose={() => setIsProposalModalOpen(false)}
          onSubmitted={() => loadStudentData()}
        />
      )}

    </div>
  );
};
