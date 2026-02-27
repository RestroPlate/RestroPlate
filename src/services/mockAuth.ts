// TODO: Replace with actual backend API authentication
// Mock credentials for development:
// Donor: donor@restroplate.com / donor123
// Center: center@restroplate.com / center123

import type { MockUser } from "../types/Dashboard";

const STORAGE_KEY = "restroplate_user";

// TODO: Replace with API call to POST /api/auth/login
const MOCK_CREDENTIALS: { email: string; password: string; user: MockUser }[] = [
    {
        email: "donor@restroplate.com",
        password: "donor123",
        user: {
            email: "donor@restroplate.com",
            name: "Green Harvest Kitchen",
            role: "donator",
        },
    },
    {
        email: "center@restroplate.com",
        password: "center123",
        user: {
            email: "center@restroplate.com",
            name: "Colombo Community Hub",
            role: "distributing_center",
        },
    },
];

/**
 * Attempts mock login with the given credentials.
 * TODO: Replace with API call to POST /api/auth/login
 */
export async function mockLogin(email: string, password: string): Promise<MockUser> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const match = MOCK_CREDENTIALS.find(
        (cred) => cred.email === email.toLowerCase().trim() && cred.password === password,
    );

    if (!match) {
        throw new Error("Invalid email or password. Please try again.");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(match.user));
    return match.user;
}

/**
 * Clears the current session.
 * TODO: Replace with API call to POST /api/auth/logout
 */
export function mockLogout(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Retrieves the currently logged-in user from localStorage.
 * TODO: Replace with API call to GET /api/auth/me
 */
export function getCurrentUser(): MockUser | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        return JSON.parse(stored) as MockUser;
    } catch {
        return null;
    }
}
