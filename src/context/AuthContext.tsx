import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { RoleName, UserProfile } from '../types.ts';

interface AuthContextValue {
  firebaseUser: null;
  userProfile: UserProfile | null;
  teamMembers: UserProfile[];
  loading: boolean;
  authError: string | null;
  signInWithGoogle: (preferredRole?: RoleName) => Promise<void>;
  signInEnterprise: (preferredRole?: RoleName) => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (role: RoleName) => Promise<void>;
  apiFetch: <T = any>(url: string, options?: RequestInit) => Promise<T>;
}

const SESSION_STORAGE_KEY = 'enterprise_workspace_session_token_v2';
const SIGNED_OUT_FLAG_KEY = 'enterprise_workspace_signed_out_v2';

function buildEnterpriseSessionToken(
  email = 'jainyadul@gmail.com',
  name = 'Executive Administrator'
): string {
  const payload = {
    uid: 'exec-admin-primary',
    email,
    name,
    iat: Date.now(),
  };
  return `ent_session_${btoa(JSON.stringify(payload))}`;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [idToken, setIdToken] = useState<string | null>(() => {
    const existing = localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    if (localStorage.getItem(SIGNED_OUT_FLAG_KEY) === 'true') return null;
    const fresh = buildEnterpriseSessionToken();
    localStorage.setItem(SESSION_STORAGE_KEY, fresh);
    return fresh;
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const syncWithBackend = useCallback(async (token: string, preferredRole?: RoleName) => {
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to synchronize user profile with PostgreSQL');
    }

    const data = await res.json();
    let finalUser: UserProfile = data.user;

    if (preferredRole && finalUser.roleName !== preferredRole) {
      const roleRes = await fetch('/api/auth/role', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleName: preferredRole }),
      });
      if (roleRes.ok) {
        const roleData = await roleRes.json();
        finalUser = roleData.user;
      }
    }

    setIdToken(token);
    setUserProfile(finalUser);
    setTeamMembers(data.team || []);
  }, []);

  const apiFetch = useCallback(
    async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
      let currentToken = idToken || localStorage.getItem(SESSION_STORAGE_KEY);
      if (!currentToken) {
        currentToken = buildEnterpriseSessionToken();
        localStorage.setItem(SESSION_STORAGE_KEY, currentToken);
        setIdToken(currentToken);
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
    let isMounted = true;

    // Clear any stale Firebase IndexedDB/localStorage keys that could trigger securetoken errors
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('firebase:')) {
          localStorage.removeItem(k);
        }
      });
    } catch {
      // ignore storage errors
    }

    if (localStorage.getItem(SIGNED_OUT_FLAG_KEY) === 'true') {
      setLoading(false);
      return;
    }

    let token = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!token) {
      token = buildEnterpriseSessionToken();
      localStorage.setItem(SESSION_STORAGE_KEY, token);
    }

    setLoading(true);
    syncWithBackend(token)
      .catch((err) => {
        console.error('Session sync error:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [syncWithBackend]);

  const signInEnterprise = async (preferredRole?: RoleName) => {
    try {
      setLoading(true);
      setAuthError(null);
      localStorage.removeItem(SIGNED_OUT_FLAG_KEY);
      const sessionToken = buildEnterpriseSessionToken();
      localStorage.setItem(SESSION_STORAGE_KEY, sessionToken);
      await syncWithBackend(sessionToken, preferredRole);
    } catch (err: any) {
      console.error('Enterprise sign-in error:', err);
      setAuthError(err.message || 'Failed to initialize workspace session.');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (preferredRole?: RoleName) => {
    await signInEnterprise(preferredRole);
  };

  const signOut = async () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.setItem(SIGNED_OUT_FLAG_KEY, 'true');
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
        firebaseUser: null,
        userProfile,
        teamMembers,
        loading,
        authError,
        signInWithGoogle,
        signInEnterprise,
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
