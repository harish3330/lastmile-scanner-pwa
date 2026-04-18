import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/context/AuthContext';

// Maps role → allowed route prefix
const ROLE_ROUTES: Record<string, string> = {
    admin: '/admin/dashboard',
    delivery: '/delivery-dashboard',
};

export default function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (requiredRole && user.role !== requiredRole) {
                router.push(ROLE_ROUTES[user.role] || '/login');
            }
        }
    }, [user, loading, requiredRole, router]);

    if (loading || !user || (requiredRole && user.role !== requiredRole)) {
        return <div className="loading-screen">Loading…</div>;
    }

    return <>{children}</>;
}
