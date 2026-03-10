    import { createContext, useContext, useState } from 'react';
    import type { ReactNode } from 'react';
    import type { AuthUser } from '../types';

    interface AuthContextType {
        token: string | null;
        user: AuthUser | null;
        login: (token: string) => void;
        logout: () => void;
        isAdmin: boolean;
        isEditor: boolean;
        hasYetki: (yetki: string) => boolean;
    }

    const AuthContext = createContext<AuthContextType | null>(null);

    function base64UrlDecodeToUtf8(input: string) {
        // Convert from base64url to base64
        let str = input.replace(/-/g, '+').replace(/_/g, '/');
        // Pad with '='
        while (str.length % 4) str += '=';
        // atob, her karakterin kodunun bir bayt değeri olduğu ikili bir dize verir.
        const binary = atob(str);
        // ikili dizeyi UTF-8 olarak yorumlamak için, her karakterin kodunu yüzde kodlamasıyla temsil edip decodeURIComponent ile çözebiliriz.
        try {
            const percentEncoded = binary
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('');
            return decodeURIComponent(percentEncoded);
        } catch {
            // yedek olarak, eğer decodeURIComponent başarısız olursa, ikili dizeyi doğrudan döndürebiliriz (bu durumda UTF-8 karakterler bozulabilir).
            return binary;
        }
    }

    function parseToken(token: string): AuthUser | null {
        try {
            const payload = token.split('.')[1];
            const json = base64UrlDecodeToUtf8(payload);
            return JSON.parse(json);
        } catch {
            return null;
        }
    }

    export function AuthProvider({ children }: { children: ReactNode }) {
        const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));
        const [user, setUser] = useState<AuthUser | null>(() => {
            const t = sessionStorage.getItem('token');
            return t ? parseToken(t) : null;
        });

        const login = (newToken: string) => {
            sessionStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(parseToken(newToken));
        };

        const logout = () => {
            sessionStorage.removeItem('token');
            setToken(null);
            setUser(null);
        };

        const isAdmin = user?.rol === 'admin';
        const isEditor = user?.rol === 'admin' || user?.rol === 'editor';
        const hasYetki = (yetki: string) => user?.yetkiler?.includes(yetki) ?? false;

        return (
            <AuthContext.Provider value={{ token, user, login, logout, isAdmin, isEditor, hasYetki }}>
                {children}
            </AuthContext.Provider>
        );  
    }

    export function useAuth() {
        const ctx = useContext(AuthContext);
        if (!ctx) throw new Error(' ');
        return ctx;
    }
