import type { 
  User, 
  Book, 
  BookCopy, 
  BorrowRequest, 
  BorrowRecord, 
  Infraction, 
  Sanction, 
  AcquisitionProposal, 
  Notification,
  VerificationAuditLog
} from '../types';

export async function loginWithGoogle(email: string, googleId?: string, displayName?: string, avatarUrl?: string) {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, googleId, displayName, avatarUrl }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Échec de la connexion Google.');
  }
  return data as { success: boolean; user: User; requiresCardScan: boolean };
}

export async function registerStudentCard(userId: string, cne: string, method: string, ocrData?: any) {
  const res = await fetch('/api/auth/register-card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, cne, method, ocrData }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Erreur lors de la validation du CNE.');
  }
  return data as { success: boolean; message: string; user: User };
}

export async function getBooks(search?: string, category?: string, availability?: string) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (availability) params.set('availability', availability);

  const res = await fetch(`/api/books?${params.toString()}`);
  if (!res.ok) throw new Error('Impossible de charger le catalogue des livres.');
  return (await res.json()) as Book[];
}

export async function addBook(bookData: Partial<Book> & { initialCopiesCount?: number; shelfLocation?: string }) {
  const res = await fetch('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Échec de l\'ajout du livre.');
  return data as { success: boolean; book: Book };
}

export async function addPhysicalCopy(bookId: string, copyData: { barcode?: string; shelfLocation?: string; condition?: string }) {
  const res = await fetch(`/api/books/${bookId}/copies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(copyData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Échec de l\'ajout de l\'exemplaire.');
  return data as { success: boolean; copy: BookCopy };
}

export async function createBorrowRequest(studentId: string, bookId: string) {
  const res = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, bookId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.reason || data.error || 'Demande d\'emprunt refusée.');
  }
  return data as { success: boolean; status: 'ACCEPTED' | 'REFUSED'; request?: BorrowRequest; reason?: string };
}

export async function getRequests(studentId?: string) {
  const url = studentId ? `/api/requests?studentId=${studentId}` : '/api/requests';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Impossible de charger les demandes.');
  return (await res.json()) as BorrowRequest[];
}

export async function checkoutPhysicalBorrow(params: { requestId?: string; barcode?: string; cne?: string }) {
  const res = await fetch('/api/borrows/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur lors de la remise physique.');
  return data as { success: boolean; borrow: BorrowRecord };
}

export async function returnPhysicalBorrow(barcode: string, condition: string) {
  const res = await fetch('/api/borrows/return', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ barcode, condition }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'enregistrement du retour.');
  return data as { success: boolean; message: string; sanctionMessage: string };
}

export async function getBorrows(studentId?: string) {
  const url = studentId ? `/api/borrows?studentId=${studentId}` : '/api/borrows';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Impossible de charger les emprunts.');
  return (await res.json()) as BorrowRecord[];
}

export async function submitAcquisitionProposal(proposalData: { studentId: string; title: string; author: string; theme?: string; referenceUrl?: string }) {
  const res = await fetch('/api/proposals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proposalData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Échec de la soumission.');
  return data as { success: boolean; proposal: AcquisitionProposal };
}

export async function getProposals(studentId?: string) {
  const url = studentId ? `/api/proposals?studentId=${studentId}` : '/api/proposals';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Impossible de charger les propositions.');
  return (await res.json()) as AcquisitionProposal[];
}

export async function reviewProposal(id: string, status: 'ACCEPTED' | 'REFUSED', librarianNote?: string) {
  const res = await fetch(`/api/proposals/${id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, librarianNote }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Échec de l\'évaluation.');
  return data as { success: boolean; proposal: AcquisitionProposal };
}

export async function getSanctions(studentId?: string) {
  const url = studentId ? `/api/sanctions?studentId=${studentId}` : '/api/sanctions';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Impossible de charger les sanctions.');
  return (await res.json()) as Sanction[];
}

export async function paySanction(id: string) {
  const res = await fetch(`/api/sanctions/${id}/pay`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Échec de l\'enregistrement du paiement.');
  return data as { success: boolean; sanction: Sanction };
}

export async function getAuditLogs() {
  const res = await fetch('/api/admin/verifications');
  if (!res.ok) throw new Error('Impossible de charger le registre des vérifications.');
  return (await res.json()) as VerificationAuditLog[];
}

export async function getNotifications(userId: string) {
  const res = await fetch(`/api/notifications?userId=${userId}`);
  if (!res.ok) return [] as Notification[];
  return (await res.json()) as Notification[];
}

export async function analyzeCardOcr(imageBase64: string) {
  const res = await fetch('/api/ocr/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Échec de l\'analyse OCR.');
  return data.ocrResult as {
    cne: string;
    cin: string;
    firstName: string;
    lastName: string;
    faculty: string;
    major: string;
    confidenceScore: number;
  };
}

export async function getAiRecommendations(studentMajor?: string) {
  const res = await fetch('/api/ai/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentMajor }),
  });
  if (!res.ok) return [];
  return (await res.json()) as Book[];
}
