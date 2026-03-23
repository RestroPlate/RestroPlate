import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DonationHistory from "../components/dashboard/DonationHistory";
import { getMyDonations } from "../services/donationService";
import type { Donation } from "../types/Dashboard";

export default function DonorMyDonations() {
    const [loading, setLoading] = useState(true);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchDonations = useCallback(async (): Promise<void> => {
        try {
            const data = await getMyDonations();
            setDonations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load donations.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchDonations();
    }, [fetchDonations]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-[#F0EBE1]">My Donations</h2>
                    <p className="mt-1 text-sm text-[#F0EBE1]/65">
                        View, filter, and manage all your donation listings.
                    </p>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        <div className="skeleton-shimmer h-[100px]" />
                        <div className="skeleton-shimmer h-[100px]" />
                        <div className="skeleton-shimmer h-[100px]" />
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100" role="alert">
                        {error}
                    </div>
                ) : (
                    <DonationHistory donations={donations} onRefresh={fetchDonations} />
                )}
            </div>
        </DashboardLayout>
    );
}
