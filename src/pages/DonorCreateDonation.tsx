import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import LocationPicker from "react-location-picker";
import StatusNotice from "../components/StatusNotice";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { createDonation, getMyDonations } from "../services/donationService";
import type { CreateDonationPayload } from "../types/Dashboard";

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
	if (!values.pickupAddress.trim())
		errors.pickupAddress = "Pickup address is required.";
	if (!values.availabilityTime)
		errors.availabilityTime = "Availability time is required.";
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

const INPUT_CLASS =
	"w-full rounded-lg border border-white/15 bg-[#111F0F] px-3 py-2 text-sm text-[#F0EBE1] outline-none transition focus:border-[#7DC542]";
const LABEL_CLASS =
	"mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/70";

export default function DonorCreateDonation() {
	const navigate = useNavigate();
	const [form, setForm] = useState<DonationFormState>(INITIAL_FORM);
	const [errors, setErrors] = useState<FormErrors>({});
	const [submitting, setSubmitting] = useState(false);
	const [notice, setNotice] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	function handleFieldChange(
		field: keyof DonationFormState,
		value: string,
	): void {
		setForm((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: undefined }));
	}

	async function handleCreateDonation(
		event: FormEvent<HTMLFormElement>,
	): Promise<void> {
		event.preventDefault();
		setNotice(null);

		const nextErrors = validateDonationForm(form);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length > 0) {
			setNotice({
				type: "error",
				message: "Please fix the highlighted fields.",
			});
			return;
		}

		setSubmitting(true);
		try {
			await createDonation(toPayload(form));

			try {
				await getMyDonations();
			} catch {
				// Refresh cache silently
			}

			setForm(INITIAL_FORM);
			setNotice({
				type: "success",
				message: "Donation listing created successfully!",
			});

			setTimeout(() => {
				navigate("/dashboard/donor/my-donations");
			}, 1500);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to create donation.";
			setNotice({ type: "error", message });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<DashboardLayout>
			<div className="mx-auto max-w-2xl space-y-6">
				<div>
					<h2 className="text-xl font-bold text-[#F0EBE1]">
						Create Donation Listing
					</h2>
					<p className="mt-1 text-sm text-[#F0EBE1]/65">
						Add your surplus food details so distribution centers can request a
						pickup.
					</p>
				</div>

				{notice ? (
					<StatusNotice
						type={notice.type}
						message={notice.message}
						onClose={() => setNotice(null)}
					/>
				) : null}

				<section className="rounded-xl border border-white/10 bg-white/5 p-5">
					<form
						className="grid grid-cols-1 gap-4 md:grid-cols-2"
						onSubmit={handleCreateDonation}
						noValidate
					>
						<div>
							<label htmlFor="foodType" className={LABEL_CLASS}>
								Food Type
							</label>
							<input
								id="foodType"
								type="text"
								value={form.foodType}
								onChange={(e) => handleFieldChange("foodType", e.target.value)}
								className={INPUT_CLASS}
								placeholder="Fresh bread"
							/>
							{errors.foodType ? (
								<p className="mt-1 text-xs font-semibold text-rose-300">
									{errors.foodType}
								</p>
							) : null}
						</div>

						<div>
							<label htmlFor="quantity" className={LABEL_CLASS}>
								Quantity
							</label>
							<input
								id="quantity"
								type="number"
								min="0.01"
								step="0.01"
								value={form.quantity}
								onChange={(e) => handleFieldChange("quantity", e.target.value)}
								className={INPUT_CLASS}
								placeholder="20"
							/>
							{errors.quantity ? (
								<p className="mt-1 text-xs font-semibold text-rose-300">
									{errors.quantity}
								</p>
							) : null}
						</div>

						<div>
							<label htmlFor="unit" className={LABEL_CLASS}>
								Unit
							</label>
							<input
								id="unit"
								type="text"
								value={form.unit}
								onChange={(e) => handleFieldChange("unit", e.target.value)}
								className={INPUT_CLASS}
								placeholder="kg, servings, boxes"
							/>
							{errors.unit ? (
								<p className="mt-1 text-xs font-semibold text-rose-300">
									{errors.unit}
								</p>
							) : null}
						</div>

						<div>
							<label htmlFor="expirationDate" className={LABEL_CLASS}>
								Expiration Date
							</label>
							<input
								id="expirationDate"
								type="date"
								value={form.expirationDate}
								onChange={(e) =>
									handleFieldChange("expirationDate", e.target.value)
								}
								className={INPUT_CLASS}
							/>
							{errors.expirationDate ? (
								<p className="mt-1 text-xs font-semibold text-rose-300">
									{errors.expirationDate}
								</p>
							) : null}
						</div>

						<div className="md:col-span-2">
							<label className={LABEL_CLASS}>
								Pickup Address
							</label>
							<div className="overflow-hidden rounded-xl border border-white/10 bg-[#111F0F]">
								<LocationPicker
									defaultPosition={{ lat: 6.927079, lng: 79.861244 }}
									onChange={({ position, address }: { position: { lat: number; lng: number }; address: string }) => {
										const locString = address || `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;
										handleFieldChange("pickupAddress", locString);
									}}
									mapContainerStyle={{ height: '220px', width: '100%' }}
								/>
								<div className="p-2 text-xs text-[#F0EBE1] break-all border-t border-white/5">
									<span className="opacity-50">Selected: </span>
									{form.pickupAddress || "(None)"}
								</div>
							</div>
							<input type="hidden" id="pickupAddress" value={form.pickupAddress} required />
							{errors.pickupAddress ? (
								<p className="mt-1 text-xs font-semibold text-rose-300">
									{errors.pickupAddress}
								</p>
							) : null}
						</div>

						<div>
							<label htmlFor="availabilityTime" className={LABEL_CLASS}>
								Availability Time
							</label>
							<input
								id="availabilityTime"
								type="time"
								value={form.availabilityTime}
								onChange={(e) =>
									handleFieldChange("availabilityTime", e.target.value)
								}
								className={INPUT_CLASS}
							/>
							{errors.availabilityTime ? (
								<p className="mt-1 text-xs font-semibold text-rose-300">
									{errors.availabilityTime}
								</p>
							) : null}
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
			</div>
		</DashboardLayout>
	);
}
