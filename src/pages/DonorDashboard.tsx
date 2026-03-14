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

export default function DonorDashboard() {
	const [loading, setLoading] = useState(true);
	const [donations, setDonations] = useState<Donation[]>([]);
	const [form, setForm] = useState<DonationFormState>(INITIAL_FORM);
	const [errors, setErrors] = useState<FormErrors>({});
	const [submitting, setSubmitting] = useState(false);
	const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
	const formSectionRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
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

	return (
		<DashboardLayout>
			{loading ? (
				<div className="space-y-3">
					<div className="skeleton-shimmer h-[100px]" />
					<div className="skeleton-shimmer h-[100px]" />
					<div className="skeleton-shimmer h-[220px]" />
				</div>
			) : (
				<div className="space-y-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{stats.map((item) => (
							<div key={item.label} className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
								<p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#F0EBE1]/60">{item.label}</p>
								<p className="mt-1 text-3xl font-black text-[#7DC542]">{item.value}</p>
							</div>
						))}
					</div>

					<div className="flex flex-wrap items-center justify-between gap-3">
						<h2 className="text-xl font-bold text-[#F0EBE1]">Your Donations</h2>
						<button
							type="button"
							className="rounded-lg bg-[#7DC542] px-5 py-2.5 text-sm font-extrabold text-[#0B1A08] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(125,197,66,0.3)]"
							onClick={() => formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
						>
							Create New Donation
						</button>
					</div>

					<section ref={formSectionRef} className="rounded-xl border border-white/10 bg-white/5 p-5">
						<h3 className="text-lg font-bold text-[#F0EBE1]">Create Donation Listing</h3>
						<p className="mt-1 text-sm text-[#F0EBE1]/65">
							Add your surplus food details so distribution centers can request a pickup.
						</p>

						{notice ? (
							<div className="mt-4">
								<StatusNotice type={notice.type} message={notice.message} onClose={() => setNotice(null)} />
							</div>
						) : null}

						<form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleCreateDonation} noValidate>
							<div>
								<label htmlFor="foodType" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/70">
									Food Type
								</label>
								<input
									id="foodType"
									type="text"
									value={form.foodType}
									onChange={(event) => handleFieldChange("foodType", event.target.value)}
									className="w-full rounded-lg border border-white/15 bg-[#111F0F] px-3 py-2 text-sm text-[#F0EBE1] outline-none transition focus:border-[#7DC542]"
									placeholder="Fresh bread"
								/>
								{errors.foodType ? <p className="mt-1 text-xs font-semibold text-rose-300">{errors.foodType}</p> : null}
							</div>

							<div>
								<label htmlFor="quantity" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/70">
									Quantity
								</label>
								<input
									id="quantity"
									type="number"
									min="0.01"
									step="0.01"
									value={form.quantity}
									onChange={(event) => handleFieldChange("quantity", event.target.value)}
									className="w-full rounded-lg border border-white/15 bg-[#111F0F] px-3 py-2 text-sm text-[#F0EBE1] outline-none transition focus:border-[#7DC542]"
									placeholder="20"
								/>
								{errors.quantity ? <p className="mt-1 text-xs font-semibold text-rose-300">{errors.quantity}</p> : null}
							</div>

							<div>
								<label htmlFor="unit" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/70">
									Unit
								</label>
								<input
									id="unit"
									type="text"
									value={form.unit}
									onChange={(event) => handleFieldChange("unit", event.target.value)}
									className="w-full rounded-lg border border-white/15 bg-[#111F0F] px-3 py-2 text-sm text-[#F0EBE1] outline-none transition focus:border-[#7DC542]"
									placeholder="kg, servings, boxes"
								/>
								{errors.unit ? <p className="mt-1 text-xs font-semibold text-rose-300">{errors.unit}</p> : null}
							</div>

							<div>
								<label htmlFor="expirationDate" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/70">
									Expiration Date
								</label>
								<input
									id="expirationDate"
									type="date"
									value={form.expirationDate}
									onChange={(event) => handleFieldChange("expirationDate", event.target.value)}
									className="w-full rounded-lg border border-white/15 bg-[#111F0F] px-3 py-2 text-sm text-[#F0EBE1] outline-none transition focus:border-[#7DC542]"
								/>
								{errors.expirationDate ? <p className="mt-1 text-xs font-semibold text-rose-300">{errors.expirationDate}</p> : null}
							</div>

							<div className="md:col-span-2">
								<label htmlFor="pickupAddress" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/70">
									Pickup Address
								</label>
								<input
									id="pickupAddress"
									type="text"
									value={form.pickupAddress}
									onChange={(event) => handleFieldChange("pickupAddress", event.target.value)}
									className="w-full rounded-lg border border-white/15 bg-[#111F0F] px-3 py-2 text-sm text-[#F0EBE1] outline-none transition focus:border-[#7DC542]"
									placeholder="No. 12, Main Street, Colombo"
								/>
								{errors.pickupAddress ? <p className="mt-1 text-xs font-semibold text-rose-300">{errors.pickupAddress}</p> : null}
							</div>

							<div>
								<label htmlFor="availabilityTime" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/70">
									Availability Time
								</label>
								<input
									id="availabilityTime"
									type="time"
									value={form.availabilityTime}
									onChange={(event) => handleFieldChange("availabilityTime", event.target.value)}
									className="w-full rounded-lg border border-white/15 bg-[#111F0F] px-3 py-2 text-sm text-[#F0EBE1] outline-none transition focus:border-[#7DC542]"
								/>
								{errors.availabilityTime ? <p className="mt-1 text-xs font-semibold text-rose-300">{errors.availabilityTime}</p> : null}
							</div>

							<div className="md:col-span-2">
								<button
									type="submit"
									disabled={submitting}
									className="inline-flex items-center rounded-lg bg-[#7DC542] px-6 py-2.5 text-sm font-extrabold text-[#0B1A08] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(125,197,66,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
								>
									{submitting ? "CREATING..." : "CREATE DONATION"}
								</button>
							</div>
						</form>
					</section>

					<DonationList donations={donations} />
				</div>
			)}
		</DashboardLayout>
	);
}
