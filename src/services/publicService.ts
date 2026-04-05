import apiClient from "../api/axiosSetup";

export interface PublicCenterDonationInfo {
    centerName: string;
    address: string;
    availableDonations: number;
}

export async function getPublicCentersWithDonations(): Promise<PublicCenterDonationInfo[]> {
    const response = await apiClient.get<PublicCenterDonationInfo[]>(
        "/api/public/centers-with-donations"
    );
    return response.data;
}
