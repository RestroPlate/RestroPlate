import apiClient from "../api/axiosSetup";

interface PublishedDonationItem {
    donationId: number;
    foodType: string;
    quantity: number;
    unit: string;
    expirationDate: string;
    collectedAt: string;
}

interface RawCenterWithDonations {
    centerId: number;
    name: string;
    address: string;
    phoneNumber: string;
    publishedDonations: PublishedDonationItem[];
}

export interface PublicCenterDonationInfo {
    centerName: string;
    address: string;
    phoneNumber: string;
    availableDonations: number;
    publishedDonations: PublishedDonationItem[];
}

export async function getPublicCentersWithDonations(): Promise<PublicCenterDonationInfo[]> {
    const response = await apiClient.get<RawCenterWithDonations[]>(
        "/api/public/centers-with-donations"
    );

    const raw = Array.isArray(response.data) ? response.data : [];

    return raw.map((center): PublicCenterDonationInfo => ({
        centerName: center.name ?? "",
        address: center.address ?? "",
        phoneNumber: center.phoneNumber ?? "",
        publishedDonations: Array.isArray(center.publishedDonations) ? center.publishedDonations : [],
        availableDonations: Array.isArray(center.publishedDonations)
            ? center.publishedDonations.reduce((sum, d) => sum + (d.quantity ?? 0), 0)
            : 0,
    }));
}
