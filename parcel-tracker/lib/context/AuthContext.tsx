import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthSession = { email: string; role: string; name: string; __v?: string; };
type LoginResult = { ok: boolean; error?: string; role?: string };
type AuthContextType = { user: AuthSession | null; login: (email: string, password: string, role: string) => LoginResult; logout: () => void; };

const MOCK_USERS = [
    { email: 'admin@gmail.com', password: 'admin123', role: 'admin', name: 'Admin User' },
    // Individual delivery agent accounts
    { email: 'ravi@delivery.com', password: 'ravi123', role: 'delivery', name: 'Ravi Kumar' },
    { email: 'priya@delivery.com', password: 'priya123', role: 'delivery', name: 'Priya Sharma' },
    { email: 'ankit@delivery.com', password: 'ankit123', role: 'delivery', name: 'Ankit Mehta' },
    { email: 'leena@delivery.com', password: 'leena123', role: 'delivery', name: 'Leena Roy' },
    { email: 'sunita@delivery.com', password: 'sunita123', role: 'delivery', name: 'Sunita Tiwari' },
    // Legacy single delivery account (kept for backwards compat)
    { email: 'delivery@gmail.com', password: 'delivery123', role: 'delivery', name: 'Ravi Kumar' },
];

const SESSION_KEY = 'auth_user';
const SESSION_VER = 'v3'; // bumped — clears stale v2 sessions, forces re-login

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthSession | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.email && parsed?.role && parsed?.name && parsed?.__v === SESSION_VER) {
                    setUser(parsed);
                } else {
                    localStorage.removeItem(SESSION_KEY);
                }
            }
        } catch {
            localStorage.removeItem(SESSION_KEY);
        }
    }, []);

    const login = (email: string, password: string, role: string) => {
        const match = MOCK_USERS.find(
            u => u.email === email.trim().toLowerCase()
                && u.password === password
                && u.role === role
        );
        if (!match) return { ok: false, error: 'Invalid credentials or role selection.' };
        const session = { email: match.email, role: match.role, name: match.name, __v: SESSION_VER };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return { ok: true, role: match.role };
    };

    const logout = () => {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) return { user: null, login: () => ({ ok: false, error: 'Not ready' }), logout: () => { } };
    return ctx;
};
