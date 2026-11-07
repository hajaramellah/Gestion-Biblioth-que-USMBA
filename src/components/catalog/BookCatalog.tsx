import React, { useState, useEffect } from 'react';
import type { Book } from '../../types';
import { getBooks, createBorrowRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, BookOpen, CheckCircle, Clock, AlertCircle, Sparkles, ChevronRight, Bookmark } from 'lucide-react';
import { BookDetailModal } from './BookDetailModal';

export const BookCatalog: React.FC = () => {
  const { user, setIsGoogleModalOpen, setIsCardScannerOpen, setActiveView } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const categories = [
    'ALL',
    'Informatique & IA',
    'Mathématiques',
    'Physique',
    'Droit & Economie',
    'Médecine'
  ];

  useEffect(() => {
    loadBooks();
  }, [searchQuery, selectedCategory, onlyAvailable]);

  async function loadBooks() {
    setLoading(true);
    try {
      const data = await getBooks(
        searchQuery,
        selectedCategory,
        onlyAvailable ? 'AVAILABLE_ONLY' : undefined
      );
      setBooks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Bibliothèque Physique USMBA — Fès
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-balance">
            Recherchez et Réservez Vos Manuels Universitaires
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
            Plateforme intelligente pour consulter la disponibilité en temps réel des exemplaires physiques, réserver automatiquement votre livre et suivre vos emprunts.
          </p>

          {!user && (
            <div className="pt-2">
              <button
                onClick={() => setIsGoogleModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors inline-flex items-center gap-2"
              >
                Connexion Compte @usmba.ac.ma
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Decorative background grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, auteur, thème, catégorie ou ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Availability Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none shrink-0 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Disponible uniquement</span>
          </label>
        </div>

        {/* Category Segmented Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-xs text-slate-400 font-medium shrink-0 mr-1">Catégorie :</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'Toutes les catégories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Chargement des ouvrages du catalogue USMBA...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Aucun livre trouvé dans le catalogue</h3>
            <p className="text-xs text-slate-500 mt-1">
              L'ouvrage que vous cherchez n'est pas disponible dans le catalogue actuel.
            </p>
          </div>

          {/* Acquisition Proposal Button for missing books (Req Section 8) */}
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
            className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs inline-flex items-center gap-2"
          >
            <Bookmark className="w-4 h-4" />
            Proposer l'acquisition de ce livre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => {
            const isAvailable = book.availableCopies > 0;
            return (
              <div
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Book Cover Image Header */}
                  <div className="aspect-16/9 bg-slate-100 relative overflow-hidden">
                    <img
                      src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-1 rounded-md">
                      {book.category}
                    </div>

                    <div className="absolute top-3 right-3">
                      {isAvailable ? (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {book.availableCopies} disponible{book.availableCopies > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                          Indisponible
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-600">Par {book.author}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{book.description}</p>
                  </div>
                </div>

                {/* Footer Metadata (Zero-pill typography discipline) */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span>Éditeur: {book.publisher}</span>
                    <span>·</span>
                    <span>{book.publishYear}</span>
                  </div>

                  <span className="text-emerald-700 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Voir exemplaire
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onBookUpdated={() => {
            loadBooks();
          }}
        />
      )}

    </div>
  );
};
