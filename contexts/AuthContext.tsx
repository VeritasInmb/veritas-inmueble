
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db, firebase } from '../services/firebase';
import { CurrentUser, Usuario } from '../types';
import { SpinnerIcon } from '../components/Icons';

interface AuthContextType {
    currentUser: CurrentUser | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

// Converts HSL values to Hex string
const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const generateUniqueColor = async (): Promise<string> => {
    const goldenRatioConjugate = 0.618033988749895;
    const randomSeed = Math.random();
    const hue = Math.floor(((randomSeed + goldenRatioConjugate) % 1) * 360);
    return hslToHex(hue, 70, 50);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            try {
                if (user) {
                    // Force refresh token to get latest emailVerified status immediately
                    // This helps if they clicked the link in another tab and then refreshed this one
                    await user.reload(); 
                    
                    const userDocRef = db.collection('usuarios').doc(user.uid);
                    let userDocSnap = await userDocRef.get();

                    if (!userDocSnap.exists) {
                        const uniqueColor = await generateUniqueColor();
                        const newUserData: Omit<Usuario, 'id'> = {
                            nombre: user.displayName || 'Usuario Nuevo',
                            email: user.email || '',
                            rol: 'usuario', 
                            bio: '',
                            avatarUrl: user.photoURL || '',
                            profileColor: uniqueColor, 
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            verificado: user.emailVerified, 
                        };
                        
                        await userDocRef.set(newUserData);
                        userDocSnap = await userDocRef.get();
                    } else {
                        // Sync: If Firebase says verified but Firestore says false, update Firestore
                        const data = userDocSnap.data();
                        if (user.emailVerified && data?.verificado === false) {
                            await userDocRef.update({ verificado: true });
                        }
                    }

                    const userData = userDocSnap.data() as Usuario;
                    
                    let finalUserData: CurrentUser = { 
                        ...userData, 
                        id: user.uid,
                        // Priority: Native Auth status. Fallback to Firestore for legacy edge cases.
                        emailVerified: user.emailVerified
                    };

                    if (!userData.profileColor || userData.profileColor.startsWith('bg-')) {
                        const newHexColor = await generateUniqueColor();
                        await userDocRef.update({ profileColor: newHexColor });
                        finalUserData.profileColor = newHexColor;
                    }

                    setCurrentUser(finalUserData);
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Error sincronizando perfil de usuario:", error);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const value = {
        currentUser,
        loading,
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <SpinnerIcon className="w-12 h-12 text-red-600 mx-auto" />
                    <p className="mt-4 text-slate-500 font-bold animate-pulse">Verificando Credenciales...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};