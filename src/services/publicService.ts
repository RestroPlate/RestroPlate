import apiClient from "../api/axiosSetup";

interface PublishedDonationItem {
	donationId: number;
	foodType: string;
	quantity: number;
	distributedQuantity?: number;
	unit: string;
	expirationDate: string;
	collectedAt: string;
}

interface RawCenterWithDonations {
	centerId: number;
	name: string;
	address: string;
	phoneNumber: string;
	operatingHours: string;
	publishedDonations: PublishedDonationItem[];
}

export interface PublicCenterDonationInfo {
	centerName: string;
	address: string;
	phoneNumber: string;
	operatingHours: string;
	availableDonations: number;
	publishedDonations: PublishedDonationItem[];
}

export async function getPublicCentersWithDonations(): Promise<PublicCenterDonationInfo[]> {
	const response = await apiClient.get<RawCenterWithDonations[]>(
		"/api/public/centers-with-donations"
	);

	const raw = Array.isArray(response.data) ? response.data : [];
	console.log("RAW PUBLIC API RESPONSE:", JSON.stringify(raw, null, 2));

	return raw.map((center): PublicCenterDonationInfo => {
		const filtered = Array.isArray(center.publishedDonations)
			? center.publishedDonations.filter(
				(d) => (d.quantity ?? 0) - (d.distributedQuantity ?? 0) > 0,
			)
			: [];

		return {
			centerName: center.name ?? "",
			address: center.address ?? "",
			phoneNumber: center.phoneNumber ?? "",
			operatingHours: center.operatingHours ?? "",
			publishedDonations: filtered,
			availableDonations: Array.isArray(center.publishedDonations)
				? center.publishedDonations.length
				: 0,
		};
	});
}
