export type UserRole = 'STUDENT' | 'LIBRARIAN' | 'ADMIN';

export type AccountStatus = 'PENDING_CARD_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface User {
  id: string;
  googleId: string;
  email: string; // Must end with @usmba.ac.ma
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  status: AccountStatus;
  
  // Student specific data (after verification)
  cne?: string;
  cin?: string;
  firstName?: string;
  lastName?: string;
  faculty?: string; // e.g. "Faculté des Sciences Dhar El Mahraz", "FST Fès", "EST Fès"
  major?: string;   // e.g. "SMI - Sciences Mathématiques & Informatique", "Génie Informatique"
  academicYear?: string;
  cardScannedAt?: string;
  cardImageHash?: string;
  
  // Sanctions history
  delayCount: number;         // Reset after suspension
  totalSuspensions: number;   // 2nd delay suspension => BANNED
  isBanPermanent: boolean;
  suspendedUntil?: string;    // ISO Date string
  
  createdAt: string;
}

export interface UniversityRegistryStudent {
  cne: string;
  cin: string;
  firstName: string;
  lastName: string;
  faculty: string;
  major: string;
  academicYear: string;
  officialEmail: string; // @usmba.ac.ma
  isValidStudent: boolean;
}

export type CopyStatus = 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'OVERDUE' | 'DAMAGED' | 'LOST' | 'RETIRED';
export type CopyCondition = 'EXCELLENT' | 'GOOD' | 'LIGHTLY_DAMAGED' | 'SEVERELY_DAMAGED';

export interface BookCopy {
  id: string;
  bookId: string;
  barcode: string; // Unique physical code e.g. USMBA-INF-2026-001
  shelfLocation: string; // e.g. "Rayon B-04, Étagère 3"
  status: CopyStatus;
  condition: CopyCondition;
  addedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  theme: string;
  publisher: string;
  publishYear: number;
  isbn: string;
  description: string;
  coverImage?: string;
  priceDh: number; // For sanction calculations (DH)
  
  // Counts (computed or stored)
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  
  createdAt: string;
}

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'EXPIRED' | 'COMPLETED';

export interface BorrowRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImage?: string;
  copyId?: string;
  barcode?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  cne: string;
  
  status: RequestStatus;
  autoDecisionReason: string; // e.g., "Demande acceptée automatiquement. Exemplaire réservé pendant 48h."
  requestedAt: string;
  reservationExpiresAt?: string; // 48h limit to pick up physically
  completedAt?: string;
}

export type BorrowStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'DAMAGED' | 'LOST';

export interface BorrowRecord {
  id: string;
  requestId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImage?: string;
  copyId: string;
  barcode: string;
  shelfLocation: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  cne: string;
  
  borrowedAt: string;
  expectedReturnDate: string; // e.g. 14 days after borrow
  returnedAt?: string;
  status: BorrowStatus;
  
  returnCondition?: CopyCondition;
  infractionReported?: boolean;
}

export type InfractionType = 
  | 'DELAY' 
  | 'LIGHT_DAMAGE' 
  | 'SEVERE_DAMAGE' 
  | 'LOST_BOOK';

export interface Infraction {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  cne: string;
  borrowId: string;
  bookTitle: string;
  type: InfractionType;
  description: string;
  reportedAt: string;
  
  // Associated sanction
  sanctionApplied: string; // e.g., "Suspension de 7 jours", "Amende de 150 DH"
  financialFineDh: number;
  suspensionDays: number;
}

export type SanctionStatus = 'ACTIVE' | 'RESOLVED' | 'PAID' | 'EXPIRED';

export interface Sanction {
  id: string;
  infractionId: string;
  studentId: string;
  studentName: string;
  cne: string;
  reason: string;
  
  suspensionDays: number;
  suspensionStartDate?: string;
  suspensionEndDate?: string;
  
  fineAmountDh: number;
  status: SanctionStatus;
  createdAt: string;
}

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'ACQUIRED';

export interface AcquisitionProposal {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  title: string;
  author: string;
  theme: string;
  referenceUrl?: string;
  status: ProposalStatus;
  librarianNote?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}

export interface VerificationAuditLog {
  id: string;
  studentId: string;
  cne: string;
  studentName: string;
  scannedAt: string;
  method: 'CAMERA_OCR' | 'FILE_OCR';
  ocrResult: {
    cneFound: string;
    nameFound: string;
    facultyFound: string;
  };
  matchedOfficialRecord: boolean;
  activated: boolean;
}
