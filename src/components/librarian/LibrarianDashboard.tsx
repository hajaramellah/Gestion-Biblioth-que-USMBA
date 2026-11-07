import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Book, BookCopy, BorrowRequest, BorrowRecord, Infraction, Sanction, AcquisitionProposal, VerificationAuditLog } from '../../types';
import { 
  getBooks, addBook, addPhysicalCopy, getRequests, checkoutPhysicalBorrow, 
  returnPhysicalBorrow, getBorrows, getSanctions, paySanction, getProposals, 
  reviewProposal, getAuditLogs 
} from '../../services/api';
import { 
  Shield, BookOpen, Layers, Clock, CheckCircle2, AlertTriangle, 
  Plus, Scan, Search, DollarSign, UserCheck, XCircle, ChevronRight, Barcode, RefreshCw, Eye
} from 'lucide-react';

export const LibrarianDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'CATALOG' | 'REQUESTS' | 'CHECKOUT' | 'RETURNS' | 'SANCTIONS' | 'PROPOSALS' | 'AUDIT'
  >('OVERVIEW');

  // Data states
  const [books, setBooks] = useState<Book[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [proposals, setProposals] = useState<AcquisitionProposal[]>([]);
  const [auditLogs, setAuditLogs] = useState<VerificationAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for Add Book
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('Informatique & IA');
  const [newBookTheme, setNewBookTheme] = useState('');
  const [newBookPublisher, setNewBookPublisher] = useState('');
  const [newBookYear, setNewBookYear] = useState('2024');
  const [newBookIsbn, setNewBookIsbn] = useState('');
  const [newBookPrice, setNewBookPrice] = useState('180');
  const [newBookCopiesCount, setNewBookCopiesCount] = useState('2');
  const [newBookShelf, setNewBookShelf] = useState('Rayon A-01, Étagère 1');
  const [isSubmittingBook, setIsSubmittingBook] = useState(false);

  // Form state for Add Copy
  const [selectedBookForCopy, setSelectedBookForCopy] = useState<Book | null>(null);
  const [copyBarcode, setCopyBarcode] = useState('');
  const [copyShelf, setCopyShelf] = useState('');
  const [copyCondition, setCopyCondition] = useState<'EXCELLENT' | 'GOOD'>('EXCELLENT');

  // Form state for Checkout
  const [checkoutCne, setCheckoutCne] = useState('');
  const [checkoutBarcode, setCheckoutBarcode] = useState('');
  const [checkoutStatusMsg, setCheckoutStatusMsg] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  // Form state for Return & Inspection
  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnCondition, setReturnCondition] = useState<'EXCELLENT' | 'GOOD' | 'LIGHTLY_DAMAGED' | 'SEVERELY_DAMAGED' | 'LOST'>('GOOD');
  const [returnResultMsg, setReturnResultMsg] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string; details?: string } | null>(null);

  useEffect(() => {
    loadLibrarianData();
  }, []);

  async function loadLibrarianData() {
    setLoading(true);
    try {
      const [b, r, brw, s, p, a] = await Promise.all([
        getBooks(),
        getRequests(),
        getBorrows(),
        getSanctions(),
        getProposals(),
        getAuditLogs()
      ]);
      setBooks(b);
      setRequests(r);
      setBorrows(brw);
      setSanctions(s);
      setProposals(p);
      setAuditLogs(a);
    } catch (e) {
      console.error(e);
    } fontally: {
      setLoading(false);
    }
  }

  // Handle Add Book
  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle || !newBookAuthor) return;
    setIsSubmittingBook(true);
    try {
      await addBook({
        title: newBookTitle,
        author: newBookAuthor,
        category: newBookCategory,
        theme: newBookTheme || 'Général',
        publisher: newBookPublisher || 'Presses Universitaires',
        publishYear: Number(newBookYear) || 2024,
        isbn: newBookIsbn,
        priceDh: Number(newBookPrice) || 150,
        initialCopiesCount: Number(newBookCopiesCount) || 1,
        shelfLocation: newBookShelf
      });
      setShowAddBookModal(false);
      // Reset form
      setNewBookTitle('');
      setNewBookAuthor('');
      loadLibrarianData();
    } catch (err: any) {
      alert(err.message || 'Erreur d\'ajout du livre');
    } finally {
      setIsSubmittingBook(false);
    }
  };

  // Handle Add Copy
  const handleAddCopySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForCopy) return;
    try {
      await addPhysicalCopy(selectedBookForCopy.id, {
        barcode: copyBarcode || undefined,
        shelfLocation: copyShelf || undefined,
        condition: copyCondition
      });
      setSelectedBookForCopy(null);
      setCopyBarcode('');
      loadLibrarianData();
    } catch (err: any) {
      alert(err.message || 'Erreur d\'ajout d\'exemplaire');
    }
  };

  // Handle Physical Checkout
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStatusMsg(null);
    try {
      const res = await checkoutPhysicalBorrow({
        cne: checkoutCne || undefined,
        barcode: checkoutBarcode || undefined
      });
      setCheckoutStatusMsg({
        type: 'SUCCESS',
        text: `Emprunt confirmé avec succès pour ${res.borrow.studentName} ! Date limite de retour : ${new Date(res.borrow.expectedReturnDate).toLocaleDateString('fr-FR')}.`
      });
      setCheckoutCne('');
      setCheckoutBarcode('');
      loadLibrarianData();
    } catch (err: any) {
      setCheckoutStatusMsg({
        type: 'ERROR',
        text: err.message || 'Échec de la remise physique.'
      });
    }
  };

  // Handle Physical Return
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReturnResultMsg(null);
    try {
      const res = await returnPhysicalBorrow(returnBarcode, returnCondition);
      setReturnResultMsg({
        type: 'SUCCESS',
        text: res.message,
        details: res.sanctionMessage
      });
      setReturnBarcode('');
      loadLibrarianData();
    } catch (err: any) {
      setReturnResultMsg({
        type: 'ERROR',
        text: err.message || 'Erreur lors du retour.'
      });
    }
  };

  // Stats Calculations
  const totalBooksCount = books.length;
  const totalCopiesCount = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const totalAvailableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const totalBorrowedCopies = books.reduce((acc, b) => acc + b.borrowedCopies, 0);
  const activeBorrowsCount = borrows.filter(b => b.status === 'ACTIVE').length;
  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;
  const pendingProposalsCount = proposals.filter(p => p.status === 'PENDING').length;
  const activeSanctionsCount = sanctions.filter(s => s.status === 'ACTIVE').length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Shield className="w-4 h-4 text-indigo-400" />
            Espace d'Administration Bibliothécaire USMBA
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-sans">
            Tableau de Bord & Gestion des Exemplaires
          </h1>
          <p className="text-xs text-slate-300">
            Gestion du catalogue, validation des remises physiques, inspection des retours et sanctions automatiques.
          </p>
        </div>

        <button
          onClick={() => setShowAddBookModal(true)}
          className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Ouvrage au Catalogue
        </button>
      </div>

      {/* Main Administrative Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'OVERVIEW' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Vue d'Ensemble
        </button>

        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'CATALOG' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Gestion Catalogue ({totalBooksCount})
        </button>

        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'REQUESTS' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Demandes & Décisions ({requests.length})
        </button>

        <button
          onClick={() => setActiveTab('CHECKOUT')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'CHECKOUT' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Scan className="w-3.5 h-3.5" />
          Remise Physique Guichet
        </button>

        <button
          onClick={() => setActiveTab('RETURNS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'RETURNS' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retour & Inspections
        </button>

        <button
          onClick={() => setActiveTab('SANCTIONS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'SANCTIONS' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Sanctions & Infractions ({activeSanctionsCount})
        </button>

        <button
          onClick={() => setActiveTab('PROPOSALS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'PROPOSALS' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Propositions ({pendingProposalsCount} en attente)
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'AUDIT' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Audit Comptes USMBA
        </button>
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Titres au Catalogue</span>
              <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">{totalBooksCount}</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Exemplaires Totaux</span>
              <p className="text-3xl font-extrabold text-indigo-700 font-mono mt-1">{totalCopiesCount}</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Disponibles au Rayon</span>
              <p className="text-3xl font-extrabold text-emerald-700 font-mono mt-1">{totalAvailableCopies}</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Empruntés / En circulation</span>
              <p className="text-3xl font-extrabold text-amber-700 font-mono mt-1">{totalBorrowedCopies}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quick Guichet Action Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Scan className="w-4 h-4 text-indigo-600" />
                Actions Rapides au Guichet
              </h3>
              <p className="text-xs text-slate-500">
                L'étudiant se présente avec sa carte d'étudiant pour récupérer ou rendre un exemplaire physique.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('CHECKOUT')}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  Confirmations de Remise
                </button>
                <button
                  onClick={() => setActiveTab('RETURNS')}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  Enregistrer un Retour
                </button>
              </div>
            </div>

            {/* Pending Proposals Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Propositions d'Acquisition d'Étudiants</span>
                <span className="text-xs font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                  {pendingProposalsCount} en attente
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Examens des ouvrages suggérés par les étudiants absents du catalogue.
              </p>
              <button
                onClick={() => setActiveTab('PROPOSALS')}
                className="w-full py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-900 font-bold text-xs rounded-xl transition-colors"
              >
                Examiner les propositions
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: CATALOG MANAGEMENT */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Catalogue & Exemplaires Physiques
            </h2>
            <button
              onClick={() => setShowAddBookModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-xl"
            >
              + Ajouter un livre
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="p-4">Titre / Auteur</th>
                    <th className="p-4">Catégorie</th>
                    <th className="p-4">ISBN</th>
                    <th className="p-4">Prix Ref</th>
                    <th className="p-4">Exemplaires (Disp/Total)</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-900">
                        {b.title}
                        <p className="text-[11px] text-slate-500 font-normal">Par {b.author}</p>
                      </td>
                      <td className="p-4 text-slate-600">{b.category}</td>
                      <td className="p-4 font-mono text-slate-600">{b.isbn}</td>
                      <td className="p-4 font-mono font-bold text-slate-900">{b.priceDh} DH</td>
                      <td className="p-4 font-mono font-bold">
                        <span className="text-emerald-700">{b.availableCopies}</span> / {b.totalCopies}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedBookForCopy(b)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px]"
                        >
                          + Ajouter exemplaire
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: DEMANDES & DÉCISIONS */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Demandes Traitées Automatiquement par le Système
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="p-4">Étudiant (CNE)</th>
                    <th className="p-4">Ouvrage Réservé</th>
                    <th className="p-4">Code Exemplaire</th>
                    <th className="p-4">Décision Système</th>
                    <th className="p-4">Limite Récupération</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{r.studentName}</p>
                        <p className="text-[11px] font-mono text-slate-500">CNE: {r.cne}</p>
                      </td>
                      <td className="p-4 font-semibold text-slate-900">{r.bookTitle}</td>
                      <td className="p-4 font-mono text-slate-600">{r.barcode || 'N/A'}</td>
                      <td className="p-4">
                        {r.status === 'ACCEPTED' ? (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            ACCEPTÉE AUTOMATIQUE
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            REFUSÉE
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-slate-600">
                        {r.reservationExpiresAt ? new Date(r.reservationExpiresAt).toLocaleString('fr-FR') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: REMISE PHYSIQUE GUICHET (Checkout) */}
      {activeTab === 'CHECKOUT' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scan className="w-5 h-5 text-indigo-600" />
              Confirmation de Remise Physique d'un Exemplaire
            </h2>
            <p className="text-xs text-slate-500">
              Scannez la carte d'étudiant ou saisissez son CNE pour valider sa réservation physique.
            </p>
          </div>

          {checkoutStatusMsg && (
            <div className={`p-4 rounded-xl text-xs ${checkoutStatusMsg.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-950 border border-emerald-300' : 'bg-rose-50 text-rose-950 border border-rose-300'}`}>
              <p className="font-bold">{checkoutStatusMsg.text}</p>
            </div>
          )}

          <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Scan Carte Étudiant ou CNE (ex: N138094821)
              </label>
              <input
                type="text"
                placeholder="Entrez le CNE..."
                value={checkoutCne}
                onChange={(e) => setCheckoutCne(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Ou Scan Code-barres de l'exemplaire (ex: USMBA-INF-2026-001)
              </label>
              <input
                type="text"
                placeholder="Scan du livre..."
                value={checkoutBarcode}
                onChange={(e) => setCheckoutBarcode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Confirmer la remise physique du livre
            </button>
          </form>
        </div>
      )}

      {/* Tab 5: RETOUR & INSPECTION AUTOMATIQUE */}
      {activeTab === 'RETURNS' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-600" />
              Enregistrement d'un Retour & Inspection Physiques
            </h2>
            <p className="text-xs text-slate-500">
              Scannez le code-barres du livre et évaluez son état physique. Les sanctions sont calculées automatiquement par les règles universitaires.
            </p>
          </div>

          {returnResultMsg && (
            <div className={`p-4 rounded-xl text-xs space-y-1 ${returnResultMsg.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-950 border border-emerald-300' : 'bg-rose-50 text-rose-950 border border-rose-300'}`}>
              <p className="font-bold">{returnResultMsg.text}</p>
              {returnResultMsg.details && <p className="font-mono text-emerald-800">{returnResultMsg.details}</p>}
            </div>
          )}

          <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Scan Code-barres de l'Exemplaire * (ex: USMBA-INF-2026-001)
              </label>
              <input
                type="text"
                required
                placeholder="Code-barres..."
                value={returnBarcode}
                onChange={(e) => setReturnBarcode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Inspection de l'État Physique du Livre *
              </label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              >
                <option value="EXCELLENT">Excellent état</option>
                <option value="GOOD">Bon état (usure normale)</option>
                <option value="LIGHTLY_DAMAGED">Détérioration légère (Suspension 15 jours)</option>
                <option value="SEVERELY_DAMAGED">Détérioration grave rendant le livre inutilisable (Amende 50% du prix)</option>
                <option value="LOST">Livre perdu par l'étudiant (Amende 75% ou 100% du prix)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Enregistrer le retour et appliquer les règles
            </button>
          </form>
        </div>
      )}

      {/* Tab 6: SANCTIONS & INFRACTIONS */}
      {activeTab === 'SANCTIONS' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Suivi des Infractions et Sanctions Financières / Suspensions
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="p-4">Étudiant (CNE)</th>
                    <th className="p-4">Motif Sanction</th>
                    <th className="p-4">Suspension (Jours)</th>
                    <th className="p-4">Amende (DH)</th>
                    <th className="p-4">Statut Paiement</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sanctions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">Aucune sanction enregistrée.</td>
                    </tr>
                  ) : (
                    sanctions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">
                          {s.studentName}
                          <p className="text-[11px] font-mono text-slate-500 font-normal">CNE: {s.cne}</p>
                        </td>
                        <td className="p-4 text-slate-700 max-w-xs">{s.reason}</td>
                        <td className="p-4 font-mono font-bold text-rose-600">{s.suspensionDays > 0 ? `${s.suspensionDays}j` : '-'}</td>
                        <td className="p-4 font-mono font-bold text-slate-900">{s.fineAmountDh > 0 ? `${s.fineAmountDh} DH` : '-'}</td>
                        <td className="p-4">
                          {s.status === 'PAID' ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                              RÉGLÉ
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                              NON PAYÉ
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {s.fineAmountDh > 0 && s.status !== 'PAID' && (
                            <button
                              onClick={async () => {
                                await paySanction(s.id);
                                loadLibrarianData();
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded"
                            >
                              Marquer payé
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: PROPOSITIONS D'ACQUISITION */}
      {activeTab === 'PROPOSALS' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Propositions d'Acquisition d'Étudiants
          </h2>

          <div className="space-y-3">
            {proposals.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                  <p className="text-xs text-slate-600">Auteur : {p.author} · Domaine : {p.theme}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Proposé par {p.studentName} ({p.studentEmail})</p>
                </div>

                {p.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await reviewProposal(p.id, 'ACCEPTED', 'Proposition validée. Commande de l\'exemplaire initiée.');
                        loadLibrarianData();
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg"
                    >
                      Accepter l'acquisition
                    </button>
                    <button
                      onClick={async () => {
                        await reviewProposal(p.id, 'REFUSED', 'Ouvrage hors budget ou déjà équivalent en rayon.');
                        loadLibrarianData();
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg"
                    >
                      Refuser
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                    Statut: {p.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: AUDIT DES COMPTES USMBA */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Registre des Vérifications d'Identité par Scan Carte OCR
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="p-4">Étudiant</th>
                    <th className="p-4">CNE Extrait</th>
                    <th className="p-4">Date Scan OCR</th>
                    <th className="p-4">Méthode</th>
                    <th className="p-4">Résultat Registre Officiel USMBA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="p-4 font-sans font-bold text-slate-900">{log.studentName}</td>
                      <td className="p-4 font-bold text-emerald-800">{log.cne}</td>
                      <td className="p-4 text-slate-500">{new Date(log.scannedAt).toLocaleString('fr-FR')}</td>
                      <td className="p-4 text-slate-600">{log.method}</td>
                      <td className="p-4 font-sans">
                        {log.matchedOfficialRecord ? (
                          <span className="text-emerald-700 font-bold">✓ Correspondance Registre USMBA</span>
                        ) : (
                          <span className="text-rose-600 font-bold">✗ Introuvable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Ajouter un Nouvel Ouvrage au Catalogue</h3>
              <button onClick={() => setShowAddBookModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Titre *</label>
                <input type="text" required value={newBookTitle} onChange={e => setNewBookTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block font-bold mb-1">Auteur *</label>
                <input type="text" required value={newBookAuthor} onChange={e => setNewBookAuthor(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Catégorie</label>
                  <select value={newBookCategory} onChange={e => setNewBookCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                    <option value="Informatique & IA">Informatique & IA</option>
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique">Physique</option>
                    <option value="Droit & Economie">Droit & Economie</option>
                    <option value="Médecine">Médecine</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Prix Ref (DH)</label>
                  <input type="number" value={newBookPrice} onChange={e => setNewBookPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Nombre Exemplaires Physiques</label>
                  <input type="number" min="1" value={newBookCopiesCount} onChange={e => setNewBookCopiesCount(e.target.value)} className="w-full px-3 py-2 border rounded-lg font-mono" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Emplacement Rayon</label>
                  <input type="text" value={newBookShelf} onChange={e => setNewBookShelf(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button type="button" onClick={() => setShowAddBookModal(false)} className="px-4 py-2 font-medium">Annuler</button>
                <button type="submit" disabled={isSubmittingBook} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Copy Modal */}
      {selectedBookForCopy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">Ajouter Exemplaire Physique</h3>
              <button onClick={() => setSelectedBookForCopy(null)}>✕</button>
            </div>
            <p className="text-xs text-slate-500">Livre : {selectedBookForCopy.title}</p>
            <form onSubmit={handleAddCopySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Code-barres unique (Laissez vide pour auto)</label>
                <input type="text" placeholder="USMBA-..." value={copyBarcode} onChange={e => setCopyBarcode(e.target.value)} className="w-full px-3 py-2 border rounded-lg font-mono" />
              </div>
              <div>
                <label className="block font-bold mb-1">Emplacement Rayon</label>
                <input type="text" placeholder="Rayon A-01, Étagère 2" value={copyShelf} onChange={e => setCopyShelf(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setSelectedBookForCopy(null)} className="px-4 py-2">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl">Créer l'exemplaire</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
