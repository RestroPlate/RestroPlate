import axios from "axios";
import apiClient from "../api/axiosSetup";
import type { DonationImage } from "../types/Dashboard";

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function extractErrorMessage(err: unknown, fallback: string): string {
	if (axios.isAxiosError(err)) {
		const data = err.response?.data as
			| { message?: string; title?: string }
			| undefined;
		if (data?.message) return data.message;
		if (data?.title) return data.title;
	}
	if (err instanceof Error) return err.message;
	return fallback;
}

/**
 * Client-side file validation before sending to the backend.
 * Returns an error string or null if valid.
 */
export function validateImageFile(file: File): string | null {
	const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
	if (!ALLOWED_EXTENSIONS.includes(extension)) {
		return "Only JPG, JPEG, and PNG files are allowed.";
	}
	if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
		return "Only JPG, JPEG, and PNG files are allowed.";
	}
	if (file.size > MAX_SIZE_BYTES) {
		return "File size must not exceed 5MB.";
	}
	return null;
}

/**
 * Uploads a single image file for a donation.
 * POST /api/donations/{donationId}/images
 * Backend expects multipart/form-data with key "file".
 */
export async function uploadDonationImage(
	donationId: number,
	file: File,
): Promise<DonationImage> {
	try {
		const formData = new FormData();
		formData.append("file", file);
		const { data } = await apiClient.post<DonationImage>(
			`/api/donations/${donationId}/images`,
			formData,
			{
				headers: { "Content-Type": "multipart/form-data" },
			},
		);
		return data;
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to upload image."));
	}
}

/**
 * Fetches all images for a donation.
 * GET /api/donations/{donationId}/images
 */
export async function getDonationImages(
	donationId: number,
): Promise<DonationImage[]> {
	try {
		const { data } = await apiClient.get<DonationImage[]>(
			`/api/donations/${donationId}/images`,
		);
		return Array.isArray(data) ? data : [];
	} catch {
		return [];
	}
}

/**
 * Deletes a specific image from a donation.
 * DELETE /api/donations/{donationId}/images/{imageId}
 */
export async function deleteDonationImage(
	donationId: number,
	imageId: number,
): Promise<void> {
	try {
		await apiClient.delete(
			`/api/donations/${donationId}/images/${imageId}`,
		);
	} catch (err) {
		throw new Error(extractErrorMessage(err, "Failed to delete image."));
	}
}

/**
 * Converts a relative image URL from the backend into an absolute URL.
 * e.g. /uploads/donations/abc.jpg → http://api-host/uploads/donations/abc.jpg
 */
export function resolveImageUrl(imageUrl: string): string {
	if (!imageUrl) return "";
	if (imageUrl.startsWith("http")) return imageUrl;
	const base = (import.meta.env.VITE_API_BASE_URL as string) ?? "";
	return `${base.replace(/\/$/, "")}${imageUrl}`;
}
