import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, username) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Mettre à jour le profil d'authentification avec le nom d'utilisateur
      await updateProfile(userCredential.user, {
        displayName: username
      });

      // Essayer de créer le profil utilisateur dans Firestore (non-bloquant)
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          username,
          email,
          createdAt: new Date().toISOString(),
          stats: {
            gamesPlayed: 0,
            wins: 0,
            losses: 0
          }
        });
      } catch (firestoreError) {
        console.warn("Firestore error (non-fatal):", firestoreError);
      }

      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 