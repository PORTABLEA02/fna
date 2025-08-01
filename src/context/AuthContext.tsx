import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getUserProfile, AuthUser } from '../lib/supabase';

// Clés pour le localStorage
const STORAGE_KEYS = {
  SESSION: 'clinicare_session',
  USER_PROFILE: 'clinicare_user_profile',
  AUTH_STATE: 'clinicare_auth_state'
};

// Utilitaires pour le localStorage
const storage = {
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    role: 'admin' | 'doctor' | 'secretary';
    phone: string;
    speciality?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔍 AuthContext.initializeAuth() - Début de l\'initialisation de l\'authentification');
      console.log('Initializing auth...');
      setLoading(true);

      // 1. Essayer de récupérer les données du localStorage
      const storedSession = storage.get(STORAGE_KEYS.SESSION);
      const storedUser = storage.get(STORAGE_KEYS.USER_PROFILE);
      const storedAuthState = storage.get(STORAGE_KEYS.AUTH_STATE);

      console.log('🔍 AuthContext.initializeAuth() - Données stockées localement:', { 
        hasSession: !!storedSession, 
        hasUser: !!storedUser, 
        authState: storedAuthState 
      });
      console.log('Stored data:', { 
        hasSession: !!storedSession, 
        hasUser: !!storedUser, 
        authState: storedAuthState 
      });

      // 2. Vérifier la session Supabase
      console.log('🔍 AuthContext.initializeAuth() - Vérification de la session Supabase');
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ AuthContext.initializeAuth() - Erreur lors de la récupération de la session:', sessionError);
        console.error('Error getting session:', sessionError);
        clearAuthData();
        setLoading(false);
        setInitialized(true);
        return;
      }

      console.log('🔍 AuthContext.initializeAuth() - Session actuelle:', { 
        hasSession: !!currentSession, 
        userId: currentSession?.user?.id 
      });
      console.log('Current session:', { 
        hasSession: !!currentSession, 
        userId: currentSession?.user?.id 
      });

      // 3. Si on a une session valide
      if (currentSession?.user) {
        console.log('✅ AuthContext.initializeAuth() - Session valide trouvée, mise à jour des données');
        setSession(currentSession);
        storage.set(STORAGE_KEYS.SESSION, currentSession);

        // Utiliser le profil stocké s'il est valide, sinon le récupérer
        if (storedUser && storedUser.id === currentSession.user.id) {
          console.log('✅ AuthContext.initializeAuth() - Utilisation du profil utilisateur stocké');
          console.log('Using stored user profile');
          setUser(storedUser);
        } else {
          console.log('🔍 AuthContext.initializeAuth() - Récupération d\'un nouveau profil utilisateur');
          console.log('Fetching fresh user profile');
          const userProfile = await getUserProfile(currentSession.user.id);
          if (userProfile) {
            console.log('✅ AuthContext.initializeAuth() - Profil utilisateur récupéré et stocké');
            setUser(userProfile);
            storage.set(STORAGE_KEYS.USER_PROFILE, userProfile);
          } else {
            console.error('❌ AuthContext.initializeAuth() - Échec de la récupération du profil utilisateur');
            console.error('Failed to get user profile');
            clearAuthData();
          }
        }
      } else {
        // 4. Pas de session valide, nettoyer les données
        console.log('⚠️ AuthContext.initializeAuth() - Aucune session valide, nettoyage des données d\'authentification');
        console.log('No valid session, clearing auth data');
        clearAuthData();
      }
    } catch (error) {
      console.error('❌ AuthContext.initializeAuth() - Exception lors de l\'initialisation de l\'authentification:', error);
      console.error('Error in initializeAuth:', error);
      clearAuthData();
    } finally {
      console.log('✅ AuthContext.initializeAuth() - Initialisation de l\'authentification terminée');
      setLoading(false);
      setInitialized(true);
    }
  };

  const clearAuthData = () => {
    console.log('🔍 AuthContext.clearAuthData() - Nettoyage des données d\'authentification');
    setSession(null);
    setUser(null);
    storage.clear();
  };

  const refreshAuth = async () => {
    if (!initialized) return;
    
    try {
      console.log('🔍 AuthContext.refreshAuth() - Actualisation de l\'authentification');
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ AuthContext.refreshAuth() - Erreur lors de l\'actualisation de la session:', error);
        console.error('Error refreshing session:', error);
        clearAuthData();
        return;
      }

      if (session?.user) {
        console.log('✅ AuthContext.refreshAuth() - Session actualisée avec succès');
        setSession(session);
        storage.set(STORAGE_KEYS.SESSION, session);
        
        const userProfile = await getUserProfile(session.user.id);
        if (userProfile) {
          console.log('✅ AuthContext.refreshAuth() - Profil utilisateur actualisé');
          setUser(userProfile);
          storage.set(STORAGE_KEYS.USER_PROFILE, userProfile);
        }
      }
    } catch (error) {
      console.error('❌ AuthContext.refreshAuth() - Exception lors de l\'actualisation de l\'authentification:', error);
      console.error('Error in refreshAuth:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) return;

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      try {
        if (event === 'SIGNED_OUT' || !session) {
          clearAuthData();
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(session);
          storage.set(STORAGE_KEYS.SESSION, session);
          
          if (session?.user) {
            const userProfile = await getUserProfile(session.user.id);
            if (userProfile) {
              setUser(userProfile);
              storage.set(STORAGE_KEYS.USER_PROFILE, userProfile);
              storage.set(STORAGE_KEYS.AUTH_STATE, { 
                isAuthenticated: true, 
                lastUpdate: new Date().toISOString() 
              });
            }
          }
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
      }
    });

    return () => subscription.unsubscribe();
  }, [initialized]);

  // Auto-refresh token avant expiration
  useEffect(() => {
    if (!session || !initialized) return;

    const refreshToken = async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Error refreshing token:', error);
          return;
        }

        if (data.session) {
          setSession(data.session);
          storage.set(STORAGE_KEYS.SESSION, data.session);
        }
      } catch (error) {
        console.error('Error in token refresh:', error);
      }
    };

    // Refresh token 5 minutes avant expiration
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const expiresIn = (expiresAt * 1000) - Date.now();
      const refreshTime = Math.max(expiresIn - 5 * 60 * 1000, 60 * 1000); // 5 min avant ou dans 1 min minimum
      
      const timeoutId = setTimeout(refreshToken, refreshTime);
      return () => clearTimeout(timeoutId);
    }
  }, [session, initialized]);

  // Vérification périodique de la validité de la session
  useEffect(() => {
    if (!initialized) return;

    const checkSessionValidity = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log('Session invalid, clearing auth data');
          clearAuthData();
        }
      } catch (error) {
        console.error('Error checking session validity:', error);
        clearAuthData();
      }
    };

    // Vérifier toutes les 10 minutes
    const intervalId = setInterval(checkSessionValidity, 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [initialized]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔍 AuthContext.login() - Tentative de connexion pour:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('❌ AuthContext.login() - Erreur lors de la connexion:', error);
        console.error('Login error:', error);
        clearAuthData();
        return false;
      }

      if (data.user) {
        console.log('✅ AuthContext.login() - Connexion réussie, récupération du profil utilisateur');
        setSession(data.session);
        storage.set(STORAGE_KEYS.SESSION, data.session);
        
        const userProfile = await getUserProfile(data.user.id);
        if (userProfile) {
          console.log('✅ AuthContext.login() - Profil utilisateur récupéré et stocké');
          setUser(userProfile);
          storage.set(STORAGE_KEYS.USER_PROFILE, userProfile);
          storage.set(STORAGE_KEYS.AUTH_STATE, { 
            isAuthenticated: true, 
            lastUpdate: new Date().toISOString() 
          });
        } else {
          console.error('❌ AuthContext.login() - Échec de la récupération du profil utilisateur après connexion');
        }
        return true;
      }

      console.log('⚠️ AuthContext.login() - Connexion échouée, aucun utilisateur retourné');
      return false;
    } catch (error) {
      console.error('❌ AuthContext.login() - Exception lors de la connexion:', error);
      console.error('Login exception:', error);
      clearAuthData();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: {
      firstName: string;
      lastName: string;
      role: 'admin' | 'doctor' | 'secretary';
      phone: string;
      speciality?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔍 AuthContext.signUp() - Tentative de création de compte pour:', email, 'rôle:', userData.role);
      setLoading(true);

      // Créer le compte utilisateur
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            phone: userData.phone,
            speciality: userData.speciality
          }
        }
      });

      if (error) {
        console.error('❌ AuthContext.signUp() - Erreur lors de la création du compte:', error);
        console.error('SignUp error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ AuthContext.signUp() - Compte utilisateur créé, création du profil');
        // Créer le profil utilisateur dans la table profiles
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email.trim(),
              first_name: userData.firstName,
              last_name: userData.lastName,
              role: userData.role,
              phone: userData.phone,
              speciality: userData.speciality,
              is_active: true
            });

          if (profileError) {
            console.error('❌ AuthContext.signUp() - Erreur lors de la création du profil:', profileError);
            console.error('Profile creation error:', profileError);
            return { success: false, error: 'Erreur lors de la création du profil' };
          }

          console.log('✅ AuthContext.signUp() - Profil utilisateur créé avec succès');
          return { success: true };
        } catch (profileError) {
          console.error('❌ AuthContext.signUp() - Exception lors de la création du profil:', profileError);
          console.error('Profile creation exception:', profileError);
          return { success: false, error: 'Erreur lors de la création du profil' };
        }
      }

      console.log('⚠️ AuthContext.signUp() - Création de compte échouée, aucun utilisateur retourné');
      return { success: false, error: 'Erreur inconnue lors de la création du compte' };
    } catch (error) {
      console.error('❌ AuthContext.signUp() - Exception lors de la création du compte:', error);
      console.error('SignUp exception:', error);
      return { success: false, error: 'Erreur lors de la création du compte' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🔍 AuthContext.logout() - Début de la déconnexion');
      setLoading(true);
      
      // Nettoyer le localStorage avant de se déconnecter
      clearAuthData();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ AuthContext.logout() - Erreur lors de la déconnexion:', error);
        console.error('Logout error:', error);
      } else {
        console.log('✅ AuthContext.logout() - Déconnexion réussie');
      }
    } catch (error) {
      console.error('❌ AuthContext.logout() - Exception lors de la déconnexion:', error);
      console.error('Logout exception:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user && !!session && initialized,
    login,
    signUp,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}