import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Notification } from '../types';
import { loginWithGoogle, registerStudentCard, getNotifications } from '../services/api';

interface AuthContextType {
  user: User | null;
  activeView: 'CATALOG' | 'STUDENT_SPACE' | 'LIBRARIAN_SPACE';
  setActiveView: (view: 'CATALOG' | 'STUDENT_SPACE' | 'LIBRARIAN_SPACE') => void;
  isGoogleModalOpen: boolean;
  setIsGoogleModalOpen: (open: boolean) => void;
  isCardScannerOpen: boolean;
  setIsCardScannerOpen: (open: boolean) => void;
  notifications: Notification[];
  loginGoogle: (email: string, displayName?: string) => Promise<void>;
  completeCardScan: (cne: string, method: string, ocrData?: any) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'STUDENT' | 'LIBRARIAN') => void;
  refreshUserData: () => Promise<void>;
  authError: string | null;
  setAuthError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial default user for quick preview (Student Hajar Amellah)
const INITIAL_STUDENT_PRESET: User = {
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
  createdAt: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(INITIAL_STUDENT_PRESET);
  const [activeView, setActiveView] = useState<'CATALOG' | 'STUDENT_SPACE' | 'LIBRARIAN_SPACE'>('CATALOG');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isCardScannerOpen, setIsCardScannerOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadNotifications(user.id);
    }
  }, [user]);

  async function loadNotifications(userId: string) {
    try {
      const notifs = await getNotifications(userId);
      setNotifications(notifs);
    } catch (e) {
      console.warn('Could not load notifications', e);
    }
  }

  const loginGoogle = async (email: string, displayName?: string) => {
    setAuthError(null);
    try {
      const res = await loginWithGoogle(email, undefined, displayName);
      setUser(res.user);
      setIsGoogleModalOpen(false);

      if (res.requiresCardScan) {
        setIsCardScannerOpen(true);
      } else {
        if (res.user.role === 'LIBRARIAN') {
          setActiveView('LIBRARIAN_SPACE');
        } else {
          setActiveView('STUDENT_SPACE');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erreur lors de l\'authentification Google.');
      throw err;
    }
  };

  const completeCardScan = async (cne: string, method: string, ocrData?: any) => {
    if (!user) throw new Error('Aucun utilisateur sélectionné.');
    try {
      const res = await registerStudentCard(user.id, cne, method, ocrData);
      setUser(res.user);
      setIsCardScannerOpen(false);
      setActiveView('STUDENT_SPACE');
    } catch (err: any) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setActiveView('CATALOG');
  };

  const switchRole = (newRole: 'STUDENT' | 'LIBRARIAN') => {
    if (newRole === 'LIBRARIAN') {
      setUser({
        id: 'usr-librarian',
        googleId: 'google-librarian-123',
        email: 'bibliothecaire.usmba@usmba.ac.ma',
        displayName: 'Mme. Jamila Bennani (Chef Bibliothécaire)',
        role: 'LIBRARIAN',
        status: 'ACTIVE',
        delayCount: 0,
        totalSuspensions: 0,
        isBanPermanent: false,
        createdAt: new Date().toISOString()
      });
      setActiveView('LIBRARIAN_SPACE');
    } else {
      setUser(INITIAL_STUDENT_PRESET);
      setActiveView('STUDENT_SPACE');
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await loadNotifications(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeView,
        setActiveView,
        isGoogleModalOpen,
        setIsGoogleModalOpen,
        isCardScannerOpen,
        setIsCardScannerOpen,
        notifications,
        loginGoogle,
        completeCardScan,
        logout,
        switchRole,
        refreshUserData,
        authError,
        setAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
