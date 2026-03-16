<<<<<<< Updated upstream
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import DonationList from "../components/DonationList";
import StatusNotice from "../components/StatusNotice";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { createDonation } from "../services/donationService";
import type { CreateDonationPayload, Donation } from "../types/Dashboard";

interface DonationFormState {
	foodType: string;
	quantity: string;
	unit: string;
	expirationDate: string;
	pickupAddress: string;
	availabilityTime: string;
}

type FormErrors = Partial<Record<keyof DonationFormState, string>>;

const INITIAL_FORM: DonationFormState = {
	foodType: "",
	quantity: "",
	unit: "",
	expirationDate: "",
	pickupAddress: "",
	availabilityTime: "",
};

const mockDonations: Donation[] = [
	{
		donation_id: 1,
		food_type: "Fresh Bread",
		description: "20 loaves of whole wheat bread baked today.",
		quantity: 20,
		unit: "Loaves",
		expiry_date: "2026-03-06",
		pickup_location: "Main Street Bakery, Colombo 03",
		availability_time: "14:00",
		status: "AVAILABLE",
		created_at: "2026-03-05T08:30:00Z",
	},
	{
		donation_id: 2,
		food_type: "Rice and Curry",
		description: "Packed meal boxes from lunch service.",
		quantity: 45,
		unit: "Servings",
		expiry_date: "2026-03-05",
		pickup_location: "Hilton Colombo, Colombo 01",
		availability_time: "16:30",
		status: "REQUESTED",
		created_at: "2026-03-04T10:15:00Z",
	},
	{
		donation_id: 3,
		food_type: "Mixed Vegetables",
		description: "Unsold fresh produce in good condition.",
		quantity: 30,
		unit: "Kg",
		expiry_date: "2026-03-07",
		pickup_location: "Pettah Market Stall 12, Colombo 11",
		availability_time: "11:00",
		status: "COLLECTED",
		created_at: "2026-03-03T06:45:00Z",
	},
];

function validateDonationForm(values: DonationFormState): FormErrors {
	const errors: FormErrors = {};
	const quantity = Number(values.quantity);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	if (!values.foodType.trim()) errors.foodType = "Food type is required.";
	if (!values.unit.trim()) errors.unit = "Unit is required.";
	if (!values.expirationDate) {
		errors.expirationDate = "Expiration date is required.";
	} else {
		const expiration = new Date(`${values.expirationDate}T00:00:00`);
		if (Number.isNaN(expiration.getTime()) || expiration < today) {
			errors.expirationDate = "Expiration date must be today or later.";
		}
	}
	if (!values.pickupAddress.trim()) errors.pickupAddress = "Pickup address is required.";
	if (!values.availabilityTime) errors.availabilityTime = "Availability time is required.";
	if (!values.quantity.trim()) {
		errors.quantity = "Quantity is required.";
	} else if (!Number.isFinite(quantity) || quantity <= 0) {
		errors.quantity = "Quantity must be greater than 0.";
	}

	return errors;
}

function toPayload(values: DonationFormState): CreateDonationPayload {
	return {
		foodType: values.foodType.trim(),
		quantity: Number(values.quantity),
		unit: values.unit.trim(),
		expirationDate: values.expirationDate,
		pickupAddress: values.pickupAddress.trim(),
		availabilityTime: values.availabilityTime,
	};
}
=======
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getMyDonations } from "../services/donationService";
import type { Donation } from "../types/Dashboard";
>>>>>>> Stashed changes

export default function DonorDashboard() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [donations, setDonations] = useState<Donation[]>([]);

	const fetchDonations = useCallback(async (): Promise<void> => {
		try {
			const data = await getMyDonations();
			setDonations(data);
		} catch {
			// Stats will show zeros on error
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
<<<<<<< Updated upstream
		const timer = setTimeout(() => {
			setDonations(mockDonations);
			setLoading(false);
		}, 350);
		return () => clearTimeout(timer);
	}, []);

	const stats = useMemo(
		() => [
			{ label: "Total Donations", value: donations.length },
			{ label: "Available", value: donations.filter((d) => d.status === "AVAILABLE").length },
			{ label: "Collected", value: donations.filter((d) => d.status === "COLLECTED").length },
		],
		[donations],
	);

	function handleFieldChange(field: keyof DonationFormState, value: string): void {
		setForm((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: undefined }));
	}

	async function handleCreateDonation(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		setNotice(null);

		const nextErrors = validateDonationForm(form);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length > 0) {
			setNotice({ type: "error", message: "Please fix the highlighted fields." });
			return;
		}

		setSubmitting(true);
		try {
			const createdDonation = await createDonation(toPayload(form));
			setDonations((prev) => [createdDonation, ...prev]);
			setForm(INITIAL_FORM);
			setNotice({ type: "success", message: "Donation listing created successfully." });
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to create donation.";
			setNotice({ type: "error", message });
		} finally {
			setSubmitting(false);
		}
	}
=======
		void fetchDonations();
	}, [fetchDonations]);

	const stats = [
		{ label: "Total Donations", value: donations.length },
		{ label: "Available", value: donations.filter((d) => d.status === "AVAILABLE").length },
		{ label: "Requested", value: donations.filter((d) => d.status === "REQUESTED").length },
		{ label: "Collected", value: donations.filter((d) => d.status === "COLLECTED").length },
	];

	const quickActions = [
		{
			title: "Create Donation",
			description: "Add new surplus food for distribution centers to request.",
			icon: "➕",
			path: "/dashboard/donor/create",
		},
		{
			title: "My Donations",
			description: "View, filter, edit, and manage all your donation listings.",
			icon: "🍽️",
			path: "/dashboard/donor/my-donations",
		},
		{
			title: "Explore Requests",
			description: "Browse requests from distribution centers and fulfill their needs.",
			icon: "🔍",
			path: "/dashboard/donor/explore",
		},
	];
>>>>>>> Stashed changes

	return (
		<DashboardLayout>
			{loading ? (
				<div className="space-y-3">
					<div className="skeleton-shimmer h-[100px]" />
					<div className="skeleton-shimmer h-[100px]" />
				</div>
			) : (
				<div className="space-y-8">
					{/* ── Stats Cards ── */}
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						{stats.map((item) => (
							<div key={item.label} className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
								<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#F0EBE1]/60">{item.label}</p>
								<p className="mt-1 text-3xl font-black text-[#7DC542]">{item.value}</p>
							</div>
						))}
					</div>

					{/* ── Quick Actions ── */}
					<div>
						<h2 className="mb-4 text-lg font-bold text-[#F0EBE1]">Quick Actions</h2>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							{quickActions.map((action) => (
								<button
									key={action.path}
									type="button"
									onClick={() => navigate(action.path)}
									className="group rounded-xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-[#7DC542]/30 hover:bg-[#7DC542]/5"
								>
									<span className="text-2xl">{action.icon}</span>
									<h3 className="mt-2 text-base font-bold text-[#F0EBE1] transition group-hover:text-[#7DC542]">
										{action.title}
									</h3>
									<p className="mt-1 text-sm text-[#F0EBE1]/55">{action.description}</p>
								</button>
<<<<<<< Updated upstream
							</div>
						</form>
					</section>

					<DonationList donations={donations} />
=======
							))}
						</div>
					</div>
>>>>>>> Stashed changes
				</div>
			)}
		</DashboardLayout>
	);
}
