import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { RoleName, UserProfile } from '../types.ts';

interface AuthContextValue {
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  teamMembers: UserProfile[];
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (role: RoleName) => Promise<void>;
  apiFetch: <T = any>(url: string, options?: RequestInit) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const apiFetch = useCallback(
    async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
      let currentToken = idToken;
      if (auth.currentUser) {
        currentToken = await auth.currentUser.getIdToken();
        setIdToken(currentToken);
      }
      if (!currentToken) {
        throw new Error('Authentication required');
      }

      const headers = new Headers(options.headers || {});
      headers.set('Authorization', `Bearer ${currentToken}`);
      if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `Request failed (${response.status})`;
        try {
          const errJson = await response.json();
          if (errJson.error) errorMessage = errJson.error;
        } catch {
          // ignore parse error
        }
        throw new Error(errorMessage);
      }

      return response.json() as Promise<T>;
    },
    [idToken]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          setLoading(true);
          setAuthError(null);
          const token = await user.getIdToken();
          setIdToken(token);

          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error('Failed to synchronize user profile with PostgreSQL');
          }

          const data = await res.json();
          setUserProfile(data.user);
          setTeamMembers(data.team || []);
        } catch (err: any) {
          console.error('Error syncing authenticated user:', err);
          setAuthError(err.message || 'Authentication synchronization failed');
        } finally {
          setLoading(false);
        }
      } else {
        setIdToken(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setAuthError(err.message || 'Sign-in was cancelled or blocked by popup settings.');
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setIdToken(null);
    setUserProfile(null);
  };

  const switchRole = async (roleName: RoleName) => {
    const data = await apiFetch<{ user: UserProfile }>('/api/auth/role', {
      method: 'PATCH',
      body: JSON.stringify({ roleName }),
    });
    setUserProfile(data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        teamMembers,
        loading,
        authError,
        signInWithGoogle,
        signOut,
        switchRole,
        apiFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
