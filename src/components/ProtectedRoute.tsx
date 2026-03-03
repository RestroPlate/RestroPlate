import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import type { AccountType } from "../types/Auth";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRole?: AccountType;
}

/**
 * Redirects unauthenticated users to /join.
 * Optionally restricts access by role.
 * TODO: Replace with proper auth context / token-based guard
 */
export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
    const user = getCurrentUser();

    if (!user) {
        return <Navigate to="/join" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        // Redirect to their own dashboard if they try to access the wrong one
        const correctPath = user.role === "DONOR" ? "/dashboard/donor" : "/dashboard/center";
        return <Navigate to={correctPath} replace />;
    }

    return <>{children}</>;
}
