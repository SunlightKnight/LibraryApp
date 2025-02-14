import React, { createContext, useState, useContext } from 'react';
import { login } from './models/Login';
import storage from './StorageService';

export interface AuthState {
  user: login | null;  // Adesso user è di tipo login, non solo stringa
  isLoggedIn: boolean;
}

interface AuthContextProps {
  authState: AuthState;
  login: (user: login) => void;  // La funzione login accetta un oggetto di tipo login
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isLoggedIn: false });

  const login = (user: login) => {
    setAuthState({ user, isLoggedIn: true })
  };  // Imposta lo stato con l'oggetto login
  const logout = () => {
    setAuthState({ user: null, isLoggedIn: false })
    setTimeout(() => {
      console.log("======authState======")
      console.log("User logout")
      console.log("======authState======")
    },100);
    storage.remove({ key: 'lastUser' });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
