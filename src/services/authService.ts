import axios from "axios";
import apiClient from "../api/axiosSetup";
import type { AuthResponseDto, UserDto, UserProfileDto } from "../types/Auth";
import type { RegisterFormData } from "../types/Auth";

// ── Error handling ─────────────────────────────────────────────────────────

/**
 * Converts an Axios error into a readable message.
 * (returned for 400, 401, 409, etc.) rather than showing the raw HTTP status line.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        if (data?.message) return data.message;
    }
    if (err instanceof Error) return err.message;
    return fallback;
}

const TOKEN_KEY = "restroplate_token";
const USER_KEY = "restroplate_user";

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Persists the JWT token and builds a local UserDto from the backend's flat response.
 * The backend does NOT nest user fields — they live at the top level of AuthResponseDto.
 */
function saveSession(response: AuthResponseDto): void {
    localStorage.setItem(TOKEN_KEY, response.token ?? "");
    const user: UserDto = {
        userId: response.userId,
        email: response.email,
        role: response.role as UserDto["role"],
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ── Auth API calls ─────────────────────────────────────────────────────────

/**
 * Logs in with email + password. Stores the JWT token and user on success.
 * Throws with a human-readable message on failure.
 */
export async function login(email: string, password: string): Promise<UserDto> {
    try {
        const { data } = await apiClient.post<AuthResponseDto>("/api/auth/login", {
            email,
            password,
        });
        if (!data?.token) {
            throw new Error("Unexpected response from server: missing token.");
        }
        saveSession(data);
        return {
            userId: data.userId,
            email: data.email,
            role: data.role as UserDto["role"],
        };
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Login failed. Please try again."));
    }
}

/**
 * Registers a new account. Stores the JWT token and user on success.
 * Throws with a human-readable message on failure.
 */
export async function register(formData: RegisterFormData): Promise<UserDto> {
    try {
        const payload = {
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phone,
            address: formData.address,
            role: formData.accountType,
        };
        const { data } = await apiClient.post<AuthResponseDto>("/api/auth/register", payload);
        if (!data?.token) {
            throw new Error("Unexpected response from server: missing token.");
        }
        saveSession(data);
        return {
            userId: data.userId,
            email: data.email,
            role: data.role as UserDto["role"],
        };
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Registration failed. Please try again."));
    }
}

/**
 * Fetches the full profile of the currently authenticated user from the backend.
 * Requires a valid JWT token (attached automatically by the Axios interceptor).
 */
export async function getUserProfile(): Promise<UserProfileDto> {
    const { data } = await apiClient.get<UserProfileDto>("/api/users/me");
    return data;
}

/**
 * Clears the current session (JWT token + user).
 */
export function logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Retrieves the currently logged-in user from localStorage.
 */
export function getCurrentUser(): UserDto | null {
    try {
        const stored = localStorage.getItem(USER_KEY);
        if (!stored) return null;
        return JSON.parse(stored) as UserDto;
    } catch {
        return null;
    }
}

/**
 * Retrieves the stored JWT token (for use in Axios interceptors).
 */
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}
