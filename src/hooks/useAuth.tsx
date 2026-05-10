import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TEMPORARY: Anonymous test mode
    const testUser = {
      uid: 'test-user-id',
      displayName: 'Usuário Teste',
      email: 'teste@ironflow.com',
      photoURL: null
    } as User;

    const fetchProfile = async () => {
      const docRef = doc(db, 'users', testUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Create initial profile for test user
        const initialProfile: UserProfile = {
          uid: testUser.uid,
          displayName: testUser.displayName || 'Usuário',
          email: testUser.email || '',
          weight: 75,
          height: 175,
          age: 25,
          gender: 'Masculino',
          goal: 'Hipertrofia',
          level: 'Intermediário',
          measurementsHistory: []
        };
        await setDoc(docRef, initialProfile);
        setProfile(initialProfile);
      }
      setUser(testUser);
      setLoading(false);
    };

    fetchProfile();

    // Actual Firebase Auth logic (commented out for test phase)
    /*
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
    */
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const newProfile = profile ? { ...profile, ...data } : (data as UserProfile);
    await setDoc(docRef, newProfile, { merge: true });
    setProfile(newProfile);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
