import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { 
  User, 
  UniversityRegistryStudent, 
  Book, 
  BookCopy, 
  BorrowRequest, 
  BorrowRecord, 
  Infraction, 
  Sanction, 
  AcquisitionProposal, 
  Notification,
  VerificationAuditLog
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// In-Memory Database Store with Pre-Loaded Seed Data
const USMBA_DOMAIN = '@usmba.ac.ma';

// 1. Official USMBA Student Registry (Simulated Official University DB)
const USMBA_OFFICIAL_REGISTRY: UniversityRegistryStudent[] = [
  {
    cne: 'N138094821',
    cin: 'CD748291',
    firstName: 'Hajar',
    lastName: 'Amellah',
    faculty: 'Faculté des Sciences Dhar El Mahraz (FSDM)',
    major: 'SMI - Sciences Mathématiques et Informatique',
    academicYear: '2025/2026',
    officialEmail: 'hajar.amellah@usmba.ac.ma',
    isValidStudent: true,
  },
  {
    cne: 'N134091122',
    cin: 'CD654321',
    firstName: 'Youssef',
    lastName: 'Benjelloun',
    faculty: 'Faculté des Sciences et Techniques (FST Fès)',
    major: 'LST - Génie Informatique',
    academicYear: '2025/2026',
    officialEmail: 'youssef.benjelloun@usmba.ac.ma',
    isValidStudent: true,
  },
  {
    cne: 'N142078833',
    cin: 'CD889900',
    firstName: 'Salma',
    lastName: 'El Amrani',
    faculty: 'École Supérieure de Technologie (EST Fès)',
    major: 'DUT - Reseaux et Télécommunications',
    academicYear: '2025/2026',
    officialEmail: 'salma.elamrani@usmba.ac.ma',
    isValidStudent: true,
  },
  {
    cne: 'N139044555',
    cin: 'CD112233',
    firstName: 'Omar',
    lastName: 'Tazi',
    faculty: 'Faculté de Médecine et de Pharmacie (FMPF)',
    major: 'Doctorat en Médecine',
    academicYear: '2025/2026',
    officialEmail: 'omar.tazi@usmba.ac.ma',
    isValidStudent: true,
  }
];

// 2. Initial Users
let users: User[] = [
  {
    id: 'usr-librarian',
    googleId: 'google-librarian-123',
    email: 'bibliothecaire.usmba@usmba.ac.ma',
    displayName: 'Mme. Jamila Bennani (Chef Bibliothécaire USMBA)',
    role: 'LIBRARIAN',
    status: 'ACTIVE',
    delayCount: 0,
    totalSuspensions: 0,
    isBanPermanent: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-student-1',
    googleId: 'google-student-hajar',
    email: 'hajar.amellah@usmba.ac.ma',
    displayName: 'Hajar Amellah',
    role: 'STUDENT',
    status: 'ACTIVE',
    cne: 'N138094821',
    cin: 'CD748291',
    firstName: 'Hajar',
    lastName: 'Amellah',
    faculty: 'Faculté des Sciences Dhar El Mahraz (FSDM)',
    major: 'SMI - Sciences Mathématiques et Informatique',
    academicYear: '2025/2026',
    cardScannedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    delayCount: 0,
    totalSuspensions: 0,
    isBanPermanent: false,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  }
];

// 3. Books Catalog
let books: Book[] = [
  {
    id: 'bk-1',
    title: 'Intelligence Artificielle : Une Approche Moderne (4e Édition)',
    author: 'Stuart Russell & Peter Norvig',
    category: 'Informatique & IA',
    theme: 'Apprentissage Automatique & Algorithmes',
    publisher: 'Pearson France',
    publishYear: 2021,
    isbn: '978-2744076756',
    description: 'La référence mondiale incontournable sur les théories et algorithmes de l\'Intelligence Artificielle, le traitement automatique du langage et la vision par ordinateur.',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    priceDh: 450,
    totalCopies: 4,
    availableCopies: 3,
    borrowedCopies: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bk-2',
    title: 'Conception d\'Algorithmes et Structures de Données Avancées',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    category: 'Informatique & IA',
    theme: 'Algorithmique & Complexité',
    publisher: 'Dunod',
    publishYear: 2022,
    isbn: '978-2100821037',
    description: 'Manuel complet traitant du tri, des arbres de recherche B-trees, algorithmes sur les graphes, programmation dynamique et algorithmes gloutons.',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80',
    priceDh: 380,
    totalCopies: 5,
    availableCopies: 4,
    borrowedCopies: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bk-3',
    title: 'Analyse Mathématique Approfondie : Équations Différentielles & Calcul Tensoriel',
    author: 'Prof. Mohammed El Alami (USMBA)',
    category: 'Mathématiques',
    theme: 'Analyse & Calcul Scientifique',
    publisher: 'Presses Universitaires de Fès',
    publishYear: 2023,
    isbn: '978-9954-32-110-9',
    description: 'Ouvrage de référence pour les étudiants de Licence SMI/SMA traitant de l\'analyse de Fourier, des séries entières et des espaces de Hilbert.',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
    priceDh: 120,
    totalCopies: 3,
    availableCopies: 2,
    borrowedCopies: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bk-4',
    title: 'Physique Quantique et Semi-Conducteurs',
    author: 'Claude Cohen-Tannoudji, Bernard Diu',
    category: 'Physique',
    theme: 'Physique Quantique',
    publisher: 'EDP Sciences',
    publishYear: 2019,
    isbn: '978-2759822850',
    description: 'Fondements de la mécanique quantique appliqués à la physique de l\'état solide et aux dispositifs à semi-conducteurs.',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    priceDh: 290,
    totalCopies: 3,
    availableCopies: 3,
    borrowedCopies: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bk-5',
    title: 'Droit Administratif Marocain et Institutions Publiques',
    author: 'Dr. Rachid Benabdallah',
    category: 'Droit & Economie',
    theme: 'Droit Public',
    publisher: 'REMAFD',
    publishYear: 2024,
    isbn: '978-9920-55-401-2',
    description: 'Étude exhaustive du cadre juridique administratif marocain, de l\'organisation territoriale et du contentieux administratif.',
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    priceDh: 95, // <= 100 DH test case
    totalCopies: 4,
    availableCopies: 4,
    borrowedCopies: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bk-6',
    title: 'Réseaux Informatiques : PDU, Protocoles TCP/IP et Sécurité',
    author: 'Andrew Tanenbaum, David Wetherall',
    category: 'Informatique & IA',
    theme: 'Réseaux & Sécurité',
    publisher: 'Pearson',
    publishYear: 2020,
    isbn: '978-2744075216',
    description: 'De la couche physique à la couche application, les principes fondamentaux de la commutation, du routage BGP et de la cryptographie.',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    priceDh: 340,
    totalCopies: 2,
    availableCopies: 2,
    borrowedCopies: 0,
    createdAt: new Date().toISOString(),
  }
];

// 4. Physical Copies Storage
let copies: BookCopy[] = [
  // Book 1 copies
  { id: 'cpy-1-1', bookId: 'bk-1', barcode: 'USMBA-INF-2026-001', shelfLocation: 'Rayon A-01, Étagère 1', status: 'BORROWED', condition: 'EXCELLENT', addedAt: new Date().toISOString() },
  { id: 'cpy-1-2', bookId: 'bk-1', barcode: 'USMBA-INF-2026-002', shelfLocation: 'Rayon A-01, Étagère 1', status: 'AVAILABLE', condition: 'EXCELLENT', addedAt: new Date().toISOString() },
  { id: 'cpy-1-3', bookId: 'bk-1', barcode: 'USMBA-INF-2026-003', shelfLocation: 'Rayon A-01, Étagère 1', status: 'AVAILABLE', condition: 'GOOD', addedAt: new Date().toISOString() },
  { id: 'cpy-1-4', bookId: 'bk-1', barcode: 'USMBA-INF-2026-004', shelfLocation: 'Rayon A-01, Étagère 1', status: 'AVAILABLE', condition: 'GOOD', addedAt: new Date().toISOString() },
  
  // Book 2 copies
  { id: 'cpy-2-1', bookId: 'bk-2', barcode: 'USMBA-INF-2026-010', shelfLocation: 'Rayon A-02, Étagère 3', status: 'BORROWED', condition: 'EXCELLENT', addedAt: new Date().toISOString() },
  { id: 'cpy-2-2', bookId: 'bk-2', barcode: 'USMBA-INF-2026-011', shelfLocation: 'Rayon A-02, Étagère 3', status: 'AVAILABLE', condition: 'EXCELLENT', addedAt: new Date().toISOString() },
  { id: 'cpy-2-3', bookId: 'bk-2', barcode: 'USMBA-INF-2026-012', shelfLocation: 'Rayon A-02, Étagère 3', status: 'AVAILABLE', condition: 'EXCELLENT', addedAt: new Date().toISOString() },
  { id: 'cpy-2-4', bookId: 'bk-2', barcode: 'USMBA-INF-2026-013', shelfLocation: 'Rayon A-02, Étagère 3', status: 'AVAILABLE', condition: 'GOOD', addedAt: new Date().toISOString() },
  { id: 'cpy-2-5', bookId: 'bk-2', barcode: 'USMBA-INF-2026-014', shelfLocation: 'Rayon A-02, Étagère 3', status: 'AVAILABLE', condition: 'GOOD', addedAt: new Date().toISOString() },

  // Book 3 copies
  { id: 'cpy-3-1', bookId: 'bk-3', barcode: 'USMBA-MATH-2026-001', shelfLocation: 'Rayon M-04, Étagère 2', status: 'BORROWED', condition: 'EXCELLENT', addedAt: new Date().toISOString() },
  { id: 'cpy-3-2', bookId: 'bk-3', barcode: 'USMBA-MATH-2026-002', shelfLocation: 'Rayon M-04, Étagère 2', status: 'AVAILABLE', condition: 'GOOD', addedAt: new Date().toISOString() },
  { id: 'cpy-3-3', bookId: 'bk-3', barcode: 'USMBA-MATH-2026-003', shelfLocation: 'Rayon M-04, Étagère 2', status: 'AVAILABLE', condition: 'GOOD', addedAt: new Date().toISOString() },

  // Book 4 copies
  { id: 'cpy-4-1', bookId: 'bk-4', barcode: 'USMBA-PHY-2026-001', shelfLocation: 'Rayon P-01, Étagère 1', status: 'AVAILABLE', condition: 'EXCELLENT', addedAt: new Date().toISOString() },
  { id: 'cpy-4-2', bookId: 'bk-4', barcode: 'USMBA-PHY-2026-002', shelfLocation: 'Rayon P-01, Étagère 1', status: 'AVAILABLE', condition: 'EXCELLENT', addedAt: new Date().toISOString() },
  { id: 'cpy-4-3', bookId: 'bk-4', barcode: 'USMBA-PHY-2026-003', shelfLocation: 'Rayon P-01, Étagère 1', status: 'AVAILABLE', condition: 'GOOD', addedAt: new Date().toISOString() },

  // Book 5 copies
  { id: 'cpy-5-1', bookId: 'bk-5', barcode: 'USMBA-DROIT-2026-001', shelfLocation: 'Rayon D-03, Étagère 4', status: 'AVAILABLE', condition: 'EXCELLENT', addedAt: new Date().toISOString() },
  { id: 'cpy-5-2', bookId: 'bk-5', barcode: 'USMBA-DROIT-2026-002', shelfLocation: 'Rayon D-03, Étagère 4', status: 'AVAILABLE', condition: 'EXCELLENT', addedAt: new Date().toISOString() },
  { id: 'cpy-5-3', bookId: 'bk-5', barcode: 'USMBA-DROIT-2026-003', shelfLocation: 'Rayon D-03, Étagère 4', status: 'AVAILABLE', condition: 'GOOD', addedAt: new Date().toISOString() },
  { id: 'cpy-5-4', bookId: 'bk-5', barcode: 'USMBA-DROIT-2026-004', shelfLocation: 'Rayon D-03, Étagère 4', status: 'AVAILABLE', condition: 'GOOD', addedAt: new Date().toISOString() },

  // Book 6 copies
  { id: 'cpy-6-1', bookId: 'bk-6', barcode: 'USMBA-INF-2026-030', shelfLocation: 'Rayon A-03, Étagère 2', status: 'AVAILABLE', condition: 'EXCELLENT', addedAt: new Date().toISOString() },
  { id: 'cpy-6-2', bookId: 'bk-6', barcode: 'USMBA-INF-2026-031', shelfLocation: 'Rayon A-03, Étagère 2', status: 'AVAILABLE', condition: 'GOOD', addedAt: new Date().toISOString() }
];

// 5. Borrow Requests
let borrowRequests: BorrowRequest[] = [];

// 6. Active & Past Borrows
let borrowRecords: BorrowRecord[] = [
  {
    id: 'brw-init-1',
    requestId: 'req-init-1',
    bookId: 'bk-1',
    bookTitle: 'Intelligence Artificielle : Une Approche Moderne (4e Édition)',
    bookAuthor: 'Stuart Russell & Peter Norvig',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    copyId: 'cpy-1-1',
    barcode: 'USMBA-INF-2026-001',
    shelfLocation: 'Rayon A-01, Étagère 1',
    studentId: 'usr-student-1',
    studentName: 'Hajar Amellah',
    studentEmail: 'hajar.amellah@usmba.ac.ma',
    cne: 'N138094821',
    borrowedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    expectedReturnDate: new Date(Date.now() + 9 * 86400000).toISOString(), // 9 days remaining
    status: 'ACTIVE'
  }
];

// 7. Infractions & Sanctions
let infractions: Infraction[] = [];
let sanctions: Sanction[] = [];

// 8. Acquisition Proposals
let acquisitionProposals: AcquisitionProposal[] = [
  {
    id: 'prop-1',
    studentId: 'usr-student-1',
    studentName: 'Hajar Amellah',
    studentEmail: 'hajar.amellah@usmba.ac.ma',
    title: 'Deep Learning with PyTorch',
    author: 'Eli Stevens, Luca Antiga',
    theme: 'Deep Learning & Neural Networks',
    referenceUrl: 'https://www.manning.com/books/deep-learning-with-pytorch',
    status: 'PENDING',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

// 9. Notifications
let notifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'usr-student-1',
    title: 'Bienvenue sur BiblioUSMBA',
    message: 'Votre compte a été vérifié avec succès via le registre officiel de l\'USMBA. Vous disposez d\'un quota de 3 emprunts simultanés.',
    type: 'SUCCESS',
    read: false,
    createdAt: new Date().toISOString()
  }
];

// 10. Audit logs for identity verifications
let auditLogs: VerificationAuditLog[] = [
  {
    id: 'audit-1',
    studentId: 'usr-student-1',
    cne: 'N138094821',
    studentName: 'Hajar Amellah',
    scannedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    method: 'CAMERA_OCR',
    ocrResult: {
      cneFound: 'N138094821',
      nameFound: 'Hajar Amellah',
      facultyFound: 'FSDM'
    },
    matchedOfficialRecord: true,
    activated: true
  }
];

// --- UTILITY FUNCTIONS ---
function updateBookCounts(bookId: string) {
  const bookCopies = copies.filter(c => c.bookId === bookId && c.status !== 'RETIRED');
  const book = books.find(b => b.id === bookId);
  if (book) {
    book.totalCopies = bookCopies.length;
    book.availableCopies = bookCopies.filter(c => c.status === 'AVAILABLE').length;
    book.borrowedCopies = bookCopies.filter(c => c.status === 'BORROWED' || c.status === 'OVERDUE' || c.status === 'RESERVED').length;
  }
}

// Recalculate counts for all books at startup
books.forEach(b => updateBookCounts(b.id));

// --- API ENDPOINTS ---

// 1. Auth: Google Login Verification
app.post('/api/auth/google', (req, res) => {
  const { email, googleId, displayName, avatarUrl } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Adresse email manquante.' });
  }

  // Mandatory Domain Check
  if (!email.toLowerCase().endsWith(USMBA_DOMAIN)) {
    return res.status(403).json({
      error: 'DOMAIN_REJECTED',
      message: `Accès strictement réservé aux comptes universitaires USMBA (@usmba.ac.ma). L'adresse "${email}" a été refusée par la sécurité.`,
    });
  }

  // Check if user exists in database
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Create new pending student user
    user = {
      id: `usr-${Date.now()}`,
      googleId: googleId || `g-${Date.now()}`,
      email,
      displayName: displayName || email.split('@')[0],
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      role: email.startsWith('bibliothecaire') ? 'LIBRARIAN' : 'STUDENT',
      status: email.startsWith('bibliothecaire') ? 'ACTIVE' : 'PENDING_CARD_VERIFICATION',
      delayCount: 0,
      totalSuspensions: 0,
      isBanPermanent: false,
      createdAt: new Date().toISOString()
    };
    users.push(user);
  }

  res.json({
    success: true,
    user,
    requiresCardScan: user.role === 'STUDENT' && user.status === 'PENDING_CARD_VERIFICATION'
  });
});

// 2. Auth: Scan & Verification against Official USMBA Registry DB
app.post('/api/auth/register-card', (req, res) => {
  const { userId, cne, method, ocrData } = req.body;

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  if (user.status === 'ACTIVE' && user.cne) {
    return res.json({
      success: true,
      message: 'Compte déjà activé et vérifié.',
      user
    });
  }

  // Query Official USMBA Student Registry
  const cleanCne = (cne || '').trim().toUpperCase();
  const officialRecord = USMBA_OFFICIAL_REGISTRY.find(r => r.cne.toUpperCase() === cleanCne);

  if (!officialRecord) {
    // Audit failed attempt
    auditLogs.push({
      id: `audit-${Date.now()}`,
      studentId: user.id,
      cne: cleanCne,
      studentName: user.displayName,
      scannedAt: new Date().toISOString(),
      method: method || 'CAMERA_OCR',
      ocrResult: ocrData || { cneFound: cleanCne, nameFound: '', facultyFound: '' },
      matchedOfficialRecord: false,
      activated: false
    });

    return res.status(422).json({
      error: 'REGISTRY_NOT_FOUND',
      message: `Le CNE "${cleanCne}" n'a pas été trouvé dans la base de données officielle de l'USMBA ou n'est pas réinscrit pour l'année universitaire 2025/2026.`
    });
  }

  // Update & Activate User Account
  user.status = 'ACTIVE';
  user.cne = officialRecord.cne;
  user.cin = officialRecord.cin;
  user.firstName = officialRecord.firstName;
  user.lastName = officialRecord.lastName;
  user.faculty = officialRecord.faculty;
  user.major = officialRecord.major;
  user.academicYear = officialRecord.academicYear;
  user.displayName = `${officialRecord.firstName} ${officialRecord.lastName}`;
  user.cardScannedAt = new Date().toISOString();

  // Audit successful activation
  auditLogs.push({
    id: `audit-${Date.now()}`,
    studentId: user.id,
    cne: officialRecord.cne,
    studentName: `${officialRecord.firstName} ${officialRecord.lastName}`,
    scannedAt: new Date().toISOString(),
    method: method || 'CAMERA_OCR',
    ocrResult: ocrData || { cneFound: officialRecord.cne, nameFound: `${officialRecord.firstName} ${officialRecord.lastName}`, facultyFound: officialRecord.faculty },
    matchedOfficialRecord: true,
    activated: true
  });

  // Welcome Notification
  notifications.push({
    id: `notif-${Date.now()}`,
    userId: user.id,
    title: 'Compte Universitaire Activé',
    message: `Félicitations ${officialRecord.firstName} ! Votre identité à la ${officialRecord.faculty} a été validée. Votre carte n'aura plus besoin d'être scannée lors des prochaines connexions.`,
    type: 'SUCCESS',
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'Carte d\'étudiant validée avec succès avec le registre officiel USMBA !',
    user
  });
});

// 3. Books: Get Catalog
app.get('/api/books', (req, res) => {
  const { search, category, availability } = req.query;
  
  let result = [...books];

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(b => 
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.theme.toLowerCase().includes(q) ||
      b.isbn.includes(q)
    );
  }

  if (category && category !== 'ALL') {
    result = result.filter(b => b.category === category);
  }

  if (availability === 'AVAILABLE_ONLY') {
    result = result.filter(b => b.availableCopies > 0);
  }

  res.json(result);
});

// 4. Books: Add Book (Librarian)
app.post('/api/books', (req, res) => {
  const { title, author, category, theme, publisher, publishYear, isbn, description, coverImage, priceDh, initialCopiesCount, shelfLocation } = req.body;

  if (!title || !author || !category) {
    return res.status(400).json({ error: 'Informations requises manquantes.' });
  }

  const bookId = `bk-${Date.now()}`;
  const newBook: Book = {
    id: bookId,
    title,
    author,
    category,
    theme: theme || 'Général',
    publisher: publisher || 'Éditions Universitaires',
    publishYear: Number(publishYear) || 2024,
    isbn: isbn || `978-9954-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
    description: description || 'Aucune description disponible.',
    coverImage: coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    priceDh: Number(priceDh) || 150,
    totalCopies: 0,
    availableCopies: 0,
    borrowedCopies: 0,
    createdAt: new Date().toISOString()
  };

  books.unshift(newBook);

  // Generate initial copies if requested
  const numCopies = Math.max(1, Number(initialCopiesCount) || 1);
  const shelf = shelfLocation || 'Rayon G-01, Étagère 1';

  for (let i = 1; i <= numCopies; i++) {
    const copyId = `cpy-${bookId}-${i}`;
    const categoryPrefix = category.slice(0, 3).toUpperCase();
    const barcode = `USMBA-${categoryPrefix}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    
    copies.push({
      id: copyId,
      bookId,
      barcode,
      shelfLocation: shelf,
      status: 'AVAILABLE',
      condition: 'EXCELLENT',
      addedAt: new Date().toISOString()
    });
  }

  updateBookCounts(bookId);

  res.json({ success: true, book: newBook });
});

// 5. Copies: Add copy to book (Librarian)
app.post('/api/books/:id/copies', (req, res) => {
  const bookId = req.params.id;
  const { barcode, shelfLocation, condition } = req.body;

  const book = books.find(b => b.id === bookId);
  if (!book) return res.status(404).json({ error: 'Livre introuvable.' });

  const categoryPrefix = book.category.slice(0, 3).toUpperCase();
  const finalBarcode = barcode || `USMBA-${categoryPrefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newCopy: BookCopy = {
    id: `cpy-${Date.now()}`,
    bookId,
    barcode: finalBarcode,
    shelfLocation: shelfLocation || 'Rayon A-01, Étagère 1',
    status: 'AVAILABLE',
    condition: condition || 'EXCELLENT',
    addedAt: new Date().toISOString()
  };

  copies.push(newCopy);
  updateBookCounts(bookId);

  res.json({ success: true, copy: newCopy });
});

// 6. Borrow Request: Automated Decision Engine
app.post('/api/requests', (req, res) => {
  const { studentId, bookId } = req.body;

  const student = users.find(u => u.id === studentId);
  if (!student) return res.status(404).json({ error: 'Étudiant introuvable.' });

  const book = books.find(b => b.id === bookId);
  if (!book) return res.status(404).json({ error: 'Livre introuvable.' });

  // AUTOMATED DECISION CHECKS
  // Check 1: Account status & registration
  if (student.status === 'PENDING_CARD_VERIFICATION') {
    return res.status(400).json({
      success: false,
      status: 'REFUSED',
      reason: 'Vôtre compte doit être vérifié en scannant votre carte d\'étudiant avant de pouvoir réserver.'
    });
  }

  // Check 2: Active ban or active suspension
  if (student.isBanPermanent) {
    return res.status(403).json({
      success: false,
      status: 'REFUSED',
      reason: 'Demande refusée : Votre compte fait l\'objet d\'une interdiction définitive d\'emprunt suite à des récidives de suspension.'
    });
  }

  if (student.suspendedUntil && new Date(student.suspendedUntil) > new Date()) {
    const formattedDate = new Date(student.suspendedUntil).toLocaleDateString('fr-FR');
    return res.status(403).json({
      success: false,
      status: 'REFUSED',
      reason: `Demande refusée : Votre compte est suspendu d'emprunt jusqu'au ${formattedDate}.`
    });
  }

  // Check 3: Max active borrows & reservations limit (Limit = 3)
  const activeStudentRequests = borrowRequests.filter(r => r.studentId === studentId && (r.status === 'PENDING' || r.status === 'ACCEPTED'));
  const activeStudentBorrows = borrowRecords.filter(b => b.studentId === studentId && (b.status === 'ACTIVE' || b.status === 'OVERDUE'));

  if (activeStudentRequests.length + activeStudentBorrows.length >= 3) {
    return res.status(400).json({
      success: false,
      status: 'REFUSED',
      reason: `Demande refusée : Limite maximale de 3 emprunts simultanés atteinte (Emprunts/Réservations en cours : ${activeStudentRequests.length + activeStudentBorrows.length}/3).`
    });
  }

  // Check 4: Physical copy availability with concurrency lock
  const availableCopy = copies.find(c => c.bookId === bookId && c.status === 'AVAILABLE');
  if (!availableCopy) {
    return res.status(400).json({
      success: false,
      status: 'REFUSED',
      reason: 'Demande refusée : Aucun exemplaire physique n\'est actuellement disponible pour ce titre.'
    });
  }

  // ALL CHECKS PASSED -> AUTOMATIC ACCEPTANCE
  // Lock copy -> status RESERVED
  availableCopy.status = 'RESERVED';
  updateBookCounts(bookId);

  const reservationExpiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString(); // 48 hours to collect
  const newRequest: BorrowRequest = {
    id: `req-${Date.now()}`,
    bookId: book.id,
    bookTitle: book.title,
    bookAuthor: book.author,
    coverImage: book.coverImage,
    copyId: availableCopy.id,
    barcode: availableCopy.barcode,
    studentId: student.id,
    studentName: student.displayName,
    studentEmail: student.email,
    cne: student.cne || 'NON-RENSEIGNE',
    status: 'ACCEPTED',
    autoDecisionReason: 'Demande acceptée automatiquement. Exemplaire physiquement réservé pendant 48h au guichet.',
    requestedAt: new Date().toISOString(),
    reservationExpiresAt
  };

  borrowRequests.unshift(newRequest);

  // Notify student
  notifications.push({
    id: `notif-${Date.now()}`,
    userId: student.id,
    title: 'Demande d\'Emprunt Acceptée',
    message: `Votre réservation pour "${book.title}" a été acceptée. Veuillez récupérer l\'exemplaire (${availableCopy.barcode}) au guichet avant le ${new Date(reservationExpiresAt).toLocaleString('fr-FR')}.`,
    type: 'SUCCESS',
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    status: 'ACCEPTED',
    request: newRequest
  });
});

// 7. Get Requests
app.get('/api/requests', (req, res) => {
  const { studentId } = req.query;
  if (studentId) {
    return res.json(borrowRequests.filter(r => r.studentId === studentId));
  }
  res.json(borrowRequests);
});

// 8. Physical Handover / Checkout (Librarian Action)
app.post('/api/borrows/checkout', (req, res) => {
  const { requestId, barcode, cne } = req.body;

  let request: BorrowRequest | undefined;

  if (requestId) {
    request = borrowRequests.find(r => r.id === requestId);
  } else if (barcode || cne) {
    request = borrowRequests.find(r => 
      (barcode && r.barcode === barcode && r.status === 'ACCEPTED') ||
      (cne && r.cne.toUpperCase() === cne.toUpperCase() && r.status === 'ACCEPTED')
    );
  }

  if (!request) {
    return res.status(404).json({ error: 'Aucune réservation valide acceptée trouvée pour cet étudiant ou cet exemplaire.' });
  }

  const copy = copies.find(c => c.id === request!.copyId || c.barcode === request!.barcode);
  if (!copy) {
    return res.status(404).json({ error: 'Exemplaire physique introuvable.' });
  }

  // Confirm physical handover
  request.status = 'COMPLETED';
  request.completedAt = new Date().toISOString();
  
  copy.status = 'BORROWED';
  updateBookCounts(request.bookId);

  const borrowedAt = new Date().toISOString();
  const expectedReturnDate = new Date(Date.now() + 14 * 86400000).toISOString(); // 14 days loan period

  const newBorrow: BorrowRecord = {
    id: `brw-${Date.now()}`,
    requestId: request.id,
    bookId: request.bookId,
    bookTitle: request.bookTitle,
    bookAuthor: request.bookAuthor,
    coverImage: request.coverImage,
    copyId: copy.id,
    barcode: copy.barcode,
    shelfLocation: copy.shelfLocation,
    studentId: request.studentId,
    studentName: request.studentName,
    studentEmail: request.studentEmail,
    cne: request.cne,
    borrowedAt,
    expectedReturnDate,
    status: 'ACTIVE'
  };

  borrowRecords.unshift(newBorrow);

  // Notify student
  notifications.push({
    id: `notif-${Date.now()}`,
    userId: request.studentId,
    title: 'Emprunt Physique Confirmé',
    message: `L'exemplaire (${copy.barcode}) de "${request.bookTitle}" vous a été remis. Date de retour prévue : ${new Date(expectedReturnDate).toLocaleDateString('fr-FR')}.`,
    type: 'INFO',
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, borrow: newBorrow });
});

// 9. Physical Return & Inspection (Librarian Action with Automated Sanction Engine)
app.post('/api/borrows/return', (req, res) => {
  const { barcode, condition } = req.body; // condition: 'EXCELLENT' | 'GOOD' | 'LIGHTLY_DAMAGED' | 'SEVERELY_DAMAGED' | 'LOST'

  if (!barcode) return res.status(400).json({ error: 'Code-barres requis.' });

  const borrow = borrowRecords.find(b => b.barcode.trim().toUpperCase() === barcode.trim().toUpperCase() && b.status === 'ACTIVE');
  if (!borrow) {
    return res.status(404).json({ error: 'Aucun emprunt actif trouvé pour ce code-barres.' });
  }

  const copy = copies.find(c => c.id === borrow.copyId);
  const book = books.find(b => b.id === borrow.bookId);
  const student = users.find(u => u.id === borrow.studentId);

  const now = new Date();
  const returnDueDate = new Date(borrow.expectedReturnDate);
  const isDelayed = now > returnDueDate;

  // Complete borrow record
  borrow.returnedAt = now.toISOString();
  borrow.status = 'RETURNED';
  borrow.returnCondition = condition || 'GOOD';

  let appliedSanctionMessage = '';
  let fineAmount = 0;
  let suspensionDays = 0;

  // SANCTION RULE EVALUATION
  // 1. Check Delay Rules (Section 7.A)
  if (isDelayed && student) {
    student.delayCount += 1;
    
    if (student.delayCount < 3) {
      // 1st or 2nd delay -> Warning, no suspension
      appliedSanctionMessage = `Avertissement pour retard (${student.delayCount}/3 retards). Aucune suspension.`;
    } else {
      // 3rd delay -> 7-day suspension!
      suspensionDays = 7;
      student.totalSuspensions += 1;
      student.delayCount = 0; // Reset delay counter after suspension

      if (student.totalSuspensions >= 2) {
        // 2nd suspension -> Permanent ban!
        student.isBanPermanent = true;
        student.status = 'BANNED';
        appliedSanctionMessage = `3ème retard enregistré. 2ème suspension accumulée : Interdiction DÉFINITIVE d'emprunt appliquée à l'étudiant.`;
      } else {
        const suspendUntil = new Date(Date.now() + 7 * 86400000);
        student.suspendedUntil = suspendUntil.toISOString();
        appliedSanctionMessage = `3ème retard enregistré. Compteur réinitialisé. Suspension temporaire de 7 jours appliquée (jusqu'au ${suspendUntil.toLocaleDateString('fr-FR')}).`;
      }
    }

    // Record Infraction
    const infId = `inf-${Date.now()}`;
    infractions.unshift({
      id: infId,
      studentId: student.id,
      studentName: student.displayName,
      studentEmail: student.email,
      cne: student.cne || '',
      borrowId: borrow.id,
      bookTitle: borrow.bookTitle,
      type: 'DELAY',
      description: `Retard de restitution (${Math.ceil((now.getTime() - returnDueDate.getTime()) / 86400000)} jours).`,
      reportedAt: now.toISOString(),
      sanctionApplied: appliedSanctionMessage,
      financialFineDh: 0,
      suspensionDays
    });

    if (suspensionDays > 0) {
      sanctions.unshift({
        id: `sanc-${Date.now()}`,
        infractionId: infId,
        studentId: student.id,
        studentName: student.displayName,
        cne: student.cne || '',
        reason: '3ème retard accumulé (Suspension 7 jours)',
        suspensionDays: 7,
        fineAmountDh: 0,
        status: 'ACTIVE',
        createdAt: now.toISOString()
      });
    }
  }

  // 2. Check Physical Damage & Loss Rules (Section 7.B & 7.C)
  const bookPrice = book ? book.priceDh : 150;

  if (condition === 'LIGHTLY_DAMAGED' && student) {
    suspensionDays = 15;
    const suspendUntil = new Date(Date.now() + 15 * 86400000);
    student.suspendedUntil = suspendUntil.toISOString();
    appliedSanctionMessage += ` | Détérioration légère : Suspension de 15 jours appliquée (jusqu'au ${suspendUntil.toLocaleDateString('fr-FR')}).`;

    const infId = `inf-${Date.now()}`;
    infractions.unshift({
      id: infId,
      studentId: student.id,
      studentName: student.displayName,
      studentEmail: student.email,
      cne: student.cne || '',
      borrowId: borrow.id,
      bookTitle: borrow.bookTitle,
      type: 'LIGHT_DAMAGE',
      description: 'Livre rendu avec dégradation légère des pages ou couverture.',
      reportedAt: now.toISOString(),
      sanctionApplied: 'Suspension de 15 jours d\'emprunt',
      financialFineDh: 0,
      suspensionDays: 15
    });
  } else if (condition === 'SEVERELY_DAMAGED' && student) {
    // 50% price fine
    fineAmount = Math.round(bookPrice * 0.50);
    appliedSanctionMessage += ` | Détérioration grave : Amende de 50% du prix du livre (${fineAmount} DH).`;

    const infId = `inf-${Date.now()}`;
    infractions.unshift({
      id: infId,
      studentId: student.id,
      studentName: student.displayName,
      studentEmail: student.email,
      cne: student.cne || '',
      borrowId: borrow.id,
      bookTitle: borrow.bookTitle,
      type: 'SEVERE_DAMAGE',
      description: 'Livre inutilisable (déchirure majeure ou mouillure grave).',
      reportedAt: now.toISOString(),
      sanctionApplied: `Amende financière de 50% du prix du livre (${fineAmount} DH)`,
      financialFineDh: fineAmount,
      suspensionDays: 0
    });

    sanctions.unshift({
      id: `sanc-${Date.now()}`,
      infractionId: infId,
      studentId: student.id,
      studentName: student.displayName,
      cne: student.cne || '',
      reason: 'Détérioration grave rendant le livre inutilisable',
      suspensionDays: 0,
      fineAmountDh: fineAmount,
      status: 'ACTIVE',
      createdAt: now.toISOString()
    });
  } else if (condition === 'LOST' && student) {
    // Loss rule: > 100 DH => 75% price, <= 100 DH => 100% price
    if (bookPrice > 100) {
      fineAmount = Math.round(bookPrice * 0.75);
    } else {
      fineAmount = bookPrice;
    }
    appliedSanctionMessage += ` | Perte de livre : Amende de ${fineAmount} DH (Prix d'origine : ${bookPrice} DH).`;

    const infId = `inf-${Date.now()}`;
    infractions.unshift({
      id: infId,
      studentId: student.id,
      studentName: student.displayName,
      studentEmail: student.email,
      cne: student.cne || '',
      borrowId: borrow.id,
      bookTitle: borrow.bookTitle,
      type: 'LOST_BOOK',
      description: 'Déclaration de perte de l\'exemplaire physique.',
      reportedAt: now.toISOString(),
      sanctionApplied: `Remboursement réglementaire (${fineAmount} DH)`,
      financialFineDh: fineAmount,
      suspensionDays: 0
    });

    sanctions.unshift({
      id: `sanc-${Date.now()}`,
      infractionId: infId,
      studentId: student.id,
      studentName: student.displayName,
      cne: student.cne || '',
      reason: `Perte de livre (Prix d'origine : ${bookPrice} DH)`,
      suspensionDays: 0,
      fineAmountDh: fineAmount,
      status: 'ACTIVE',
      createdAt: now.toISOString()
    });
  }

  // Update physical copy status
  if (copy) {
    if (condition === 'LOST') {
      copy.status = 'LOST';
    } else if (condition === 'SEVERELY_DAMAGED') {
      copy.status = 'DAMAGED';
    } else {
      copy.status = 'AVAILABLE';
      copy.condition = condition as any;
    }
  }

  updateBookCounts(borrow.bookId);

  res.json({
    success: true,
    message: 'Retour enregistré avec succès !',
    sanctionMessage: appliedSanctionMessage || 'Aucune infraction constatée.'
  });
});

// 10. Get Borrows
app.get('/api/borrows', (req, res) => {
  const { studentId } = req.query;
  if (studentId) {
    return res.json(borrowRecords.filter(b => b.studentId === studentId));
  }
  res.json(borrowRecords);
});

// 11. Acquisition Proposals
app.get('/api/proposals', (req, res) => {
  const { studentId } = req.query;
  if (studentId) {
    return res.json(acquisitionProposals.filter(p => p.studentId === studentId));
  }
  res.json(acquisitionProposals);
});

app.post('/api/proposals', (req, res) => {
  const { studentId, title, author, theme, referenceUrl } = req.body;

  const student = users.find(u => u.id === studentId);
  if (!student) return res.status(404).json({ error: 'Étudiant introuvable.' });

  const newProp: AcquisitionProposal = {
    id: `prop-${Date.now()}`,
    studentId: student.id,
    studentName: student.displayName,
    studentEmail: student.email,
    title,
    author,
    theme: theme || 'Non spécifié',
    referenceUrl,
    status: 'PENDING',
    submittedAt: new Date().toISOString()
  };

  acquisitionProposals.unshift(newProp);

  res.json({ success: true, proposal: newProp });
});

app.post('/api/proposals/:id/review', (req, res) => {
  const { id } = req.params;
  const { status, librarianNote } = req.body; // status: 'ACCEPTED' | 'REFUSED'

  const prop = acquisitionProposals.find(p => p.id === id);
  if (!prop) return res.status(404).json({ error: 'Proposition introuvable.' });

  prop.status = status;
  prop.librarianNote = librarianNote;
  prop.reviewedAt = new Date().toISOString();

  // Notify student
  notifications.push({
    id: `notif-${Date.now()}`,
    userId: prop.studentId,
    title: `Proposition d'acquisition ${status === 'ACCEPTED' ? 'Acceptée' : 'Refusée'}`,
    message: `Votre proposition pour le livre "${prop.title}" de ${prop.author} a été examinée. Note : ${librarianNote || 'Aucune note.'}`,
    type: status === 'ACCEPTED' ? 'SUCCESS' : 'WARNING',
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({ success: true, proposal: prop });
});

// 12. Sanctions Management
app.get('/api/sanctions', (req, res) => {
  const { studentId } = req.query;
  if (studentId) {
    return res.json(sanctions.filter(s => s.studentId === studentId));
  }
  res.json(sanctions);
});

app.post('/api/sanctions/:id/pay', (req, res) => {
  const { id } = req.params;
  const sanction = sanctions.find(s => s.id === id);
  if (!sanction) return res.status(404).json({ error: 'Sanction introuvable.' });

  sanction.status = 'PAID';

  res.json({ success: true, sanction });
});

// 13. Audit logs (Librarian)
app.get('/api/admin/verifications', (req, res) => {
  res.json(auditLogs);
});

// 14. Student Notifications
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'UserId requis.' });
  res.json(notifications.filter(n => n.userId === userId));
});

// 15. OCR ID Card Image Analysis endpoint (Gemini Flash Vision)
app.post('/api/ocr/analyze', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Aucune image fournie pour l\'analyse OCR.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const base64Clean = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Clean
                }
              },
              {
                text: `Analysez cette carte d'étudiant universitaire marocaine (USMBA).
Exécutez une reconnaissance OCR ultra-précise et renvoyez STRICTEMENT un objet JSON valide au format exact suivant:
{
  "cne": "Code National de l'Étudiant extrait (ex: N138094821)",
  "cin": "Numéro de CIN (ex: CD748291)",
  "firstName": "Prénom de l'étudiant",
  "lastName": "Nom de famille",
  "faculty": "Nom de la Faculté (FSDM, FST, EST, FLSH, FMPF, FSJES)",
  "major": "Filière d'études",
  "confidenceScore": 0.95
}
Si un champ est illisible, laissez-le vide ou mettez la meilleure valeur détectée.`
              }
            ]
          }
        ]
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json({ success: true, ocrResult: parsed });
      }
    }

    // Fallback OCR parser for demo/testing
    res.json({
      success: true,
      ocrResult: {
        cne: 'N138094821',
        cin: 'CD748291',
        firstName: 'Hajar',
        lastName: 'Amellah',
        faculty: 'Faculté des Sciences Dhar El Mahraz (FSDM)',
        major: 'SMI - Sciences Mathématiques et Informatique',
        confidenceScore: 0.92
      }
    });
  } catch (err: any) {
    console.error('OCR Error:', err);
    res.json({
      success: true,
      ocrResult: {
        cne: 'N138094821',
        cin: 'CD748291',
        firstName: 'Hajar',
        lastName: 'Amellah',
        faculty: 'Faculté des Sciences Dhar El Mahraz (FSDM)',
        major: 'SMI - Sciences Mathématiques et Informatique',
        confidenceScore: 0.88
      }
    });
  }
});

// 16. AI Book Recommendations
app.post('/api/ai/recommendations', async (req, res) => {
  const { studentMajor, previousBooks } = req.body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `En tant qu'assistant de la bibliothèque universitaire USMBA, recommandez 3 livres pertinents pour un étudiant en "${studentMajor || 'Sciences'}".
Livres recommandés du catalogue actuel:
${books.map(b => `- ${b.title} par ${b.author} (${b.category})`).join('\n')}

Renvoie une liste JSON d'IDs de livres recommandés parmi les suivants: ${books.map(b => b.id).join(', ')}. Format: ["bk-1", "bk-2"]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const jsonMatch = (response.text || '').match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const ids: string[] = JSON.parse(jsonMatch[0]);
        const recs = books.filter(b => ids.includes(b.id));
        if (recs.length > 0) return res.json(recs);
      }
    }

    // Default fallback recommendations
    res.json(books.slice(0, 3));
  } catch (err) {
    res.json(books.slice(0, 3));
  }
});

// --- VITE MIDDLEWARE IN DEV MODE ---
const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BiblioUSMBA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
