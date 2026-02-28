export type AccountType = "DONOR" | "DISTRIBUTION_CENTER";

/**
 * Frontend-side user representation (stored in localStorage).
 * Built from the flat AuthResponseDto fields returned by the backend.
 */
export interface UserDto {
	userId: number;
	name?: string | null;
	email?: string | null;
	role?: AccountType | null;
}

/**
 * Matches the backend's flat AuthResponseDto shape for /api/auth/login and /api/auth/register.
 * Note: The backend does NOT return a nested user object — the fields are at the top level.
 */
export interface AuthResponseDto {
	token?: string | null;
	userId: number;
	email?: string | null;
	role?: string | null;
}

/**
 * Matches the backend's UserProfileDto shape returned by GET /api/users/me.
 */
export interface UserProfileDto {
	userId: number;
	name?: string | null;
	email?: string | null;
	role?: string | null;
	phoneNumber?: string | null;
	address?: string | null;
	createdAt: string; // ISO date-time string
}

export interface LoginFormData {
	email: string;
	password: string;
}

export interface RegisterFormData {
	accountType: AccountType;
	fullName: string;
	email: string;
	password: string;
	confirmPassword: string;
	phone: string;
	address: string;
}
