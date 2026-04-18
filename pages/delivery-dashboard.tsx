import DeliveryDashboard from '@/components/DeliveryDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DeliveryDashboardPage() {
    return (
        <ProtectedRoute requiredRole="delivery">
            <DeliveryDashboard />
        </ProtectedRoute>
    );
}
